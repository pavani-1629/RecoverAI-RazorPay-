from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from sqlalchemy import select

from app.db.database import SessionLocal
from app.db.models import Transaction, RecoveryGroundTruth
from app.services.recovery_features import build_recovery_features


RANDOM_STATE = 42
TEST_SIZE = 0.20

MODEL_DIR = Path("models")
MODEL_PATH = MODEL_DIR / "recovery_model.joblib"


def load_dataset():

    db = SessionLocal()

    try:
        rows = []

        failed_transactions = db.scalars(
            select(Transaction).where(
                Transaction.status == "failed"
            )
        ).all()

        print(
            f"Found {len(failed_transactions)} "
            "failed transactions"
        )

        for transaction in failed_transactions:

            ground_truth = db.scalars(
                select(RecoveryGroundTruth).where(
                    RecoveryGroundTruth.transaction_id
                    == transaction.id
                )
            ).first()

            if ground_truth is None:
                continue

            features = build_recovery_features(
                db=db,
                transaction=transaction,
            )

            rows.append(
                {
                    "transaction_id": features.transaction_id,
                    "amount": features.amount,
                    "failure_reason": features.failure_reason,
                    "payment_method": features.payment_method,
                    "retry_count": features.retry_count,
                    "customer_transaction_count":
                        features.customer_transaction_count,
                    "customer_success_count":
                        features.customer_success_count,
                    "customer_failure_count":
                        features.customer_failure_count,
                    "customer_success_rate":
                        features.customer_success_rate,
                    "customer_failure_rate":
                        features.customer_failure_rate,
                    "amount_bucket": features.amount_bucket,
                    "recoverable": bool(
                        ground_truth.recoverable
                    ),
                }
            )

        return pd.DataFrame(rows)

    finally:
        db.close()


def main():

    print("=" * 60)
    print("RECOVERY MODEL TRAINING")
    print("=" * 60)

    # -----------------------------------------------------
    # Load dataset
    # -----------------------------------------------------

    df = load_dataset()

    print()
    print(f"Dataset size: {len(df)}")

    print()
    print("Target distribution:")
    print(df["recoverable"].value_counts())

    # -----------------------------------------------------
    # Separate features and target
    # -----------------------------------------------------

    X = df.drop(
        columns=[
            "transaction_id",
            "recoverable",
        ]
    )

    y = df["recoverable"]

    # -----------------------------------------------------
    # Train / held-out test split
    # -----------------------------------------------------

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    print()
    print("DATA SPLIT")
    print("-" * 60)
    print(f"Training samples: {len(X_train)}")
    print(f"Held-out samples: {len(X_test)}")

    # -----------------------------------------------------
    # Feature groups
    # -----------------------------------------------------

    numerical_features = [
        "amount",
        "retry_count",
        "customer_transaction_count",
        "customer_success_count",
        "customer_failure_count",
        "customer_success_rate",
        "customer_failure_rate",
    ]

    categorical_features = [
        "failure_reason",
        "payment_method",
        "amount_bucket",
    ]

    # -----------------------------------------------------
    # Preprocessing
    # -----------------------------------------------------

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "numerical",
                StandardScaler(),
                numerical_features,
            ),
            (
                "categorical",
                OneHotEncoder(
                    handle_unknown="ignore"
                ),
                categorical_features,
            ),
        ]
    )

    # -----------------------------------------------------
    # Model
    # -----------------------------------------------------

    model = LogisticRegression(
        max_iter=1000,
        class_weight="balanced",
        random_state=RANDOM_STATE,
    )

    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model),
        ]
    )

    # -----------------------------------------------------
    # Train
    # -----------------------------------------------------

    print()
    print("Training Logistic Regression...")

    pipeline.fit(
        X_train,
        y_train,
    )

    print("Training complete.")

    # -----------------------------------------------------
    # Probability predictions
    # -----------------------------------------------------

    probabilities = pipeline.predict_proba(
        X_test
    )[:, 1]

    # -----------------------------------------------------
    # Threshold + money analysis
    # -----------------------------------------------------

    print()
    print("=" * 60)
    print("THRESHOLD + MONEY ANALYSIS")
    print("=" * 60)

    test_amounts = X_test["amount"].to_numpy()
    actual_values = y_test.to_numpy()

    threshold_results = []

    thresholds = [
        0.30,
        0.35,
        0.40,
        0.45,
        0.50,
        0.55,
        0.60,
        0.65,
        0.70,
        0.75,
        0.80,
    ]

    for threshold in thresholds:

        predictions = (
            probabilities >= threshold
        ).astype(int)

        precision = precision_score(
            y_test,
            predictions,
            zero_division=0,
        )

        recall = recall_score(
            y_test,
            predictions,
            zero_division=0,
        )

        f1 = f1_score(
            y_test,
            predictions,
            zero_division=0,
        )

        predicted_recoverable = (
            predictions == 1
        )

        actually_recoverable = (
            actual_values == 1
        )

        true_positive_mask = (
            predicted_recoverable
            & actually_recoverable
        )

        false_positive_mask = (
            predicted_recoverable
            & ~actually_recoverable
        )

        true_positive_gmv = test_amounts[
            true_positive_mask
        ].sum()

        false_positive_gmv = test_amounts[
            false_positive_mask
        ].sum()

        predicted_recovery_gmv = test_amounts[
            predicted_recoverable
        ].sum()

        threshold_results.append(
            {
                "threshold": threshold,
                "precision": precision,
                "recall": recall,
                "f1": f1,
                "true_positive_gmv":
                    true_positive_gmv,
                "false_positive_gmv":
                    false_positive_gmv,
                "predicted_recovery_gmv":
                    predicted_recovery_gmv,
            }
        )

        print(
            f"Threshold={threshold:.2f} | "
            f"Precision={precision:.3f} | "
            f"Recall={recall:.3f} | "
            f"F1={f1:.3f} | "
            f"TP GMV=₹{true_positive_gmv:,.0f} | "
            f"FP GMV=₹{false_positive_gmv:,.0f}"
        )

    # -----------------------------------------------------
    # Operating threshold
    # -----------------------------------------------------

    OPERATING_THRESHOLD = 0.30

    predictions = (
        probabilities >= OPERATING_THRESHOLD
    ).astype(int)

    print()
    print(
        f"Operating threshold selected: "
        f"{OPERATING_THRESHOLD:.2f}"
    )

    # -----------------------------------------------------
    # Final held-out metrics
    # -----------------------------------------------------

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0,
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0,
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0,
    )

    accuracy = accuracy_score(
        y_test,
        predictions,
    )

    matrix = confusion_matrix(
        y_test,
        predictions,
    )

    print()
    print("=" * 60)
    print("HELD-OUT TEST RESULTS")
    print("=" * 60)

    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")

    print()
    print("CONFUSION MATRIX")
    print("-" * 60)
    print(matrix)

    print()
    print("CLASSIFICATION REPORT")
    print("-" * 60)

    print(
        classification_report(
            y_test,
            predictions,
            target_names=[
                "Not Recoverable",
                "Recoverable",
            ],
            zero_division=0,
        )
    )

    # -----------------------------------------------------
    # Sample predictions
    # -----------------------------------------------------

    results = X_test.copy()

    results["actual"] = y_test.to_numpy()

    results["recovery_probability"] = (
        probabilities
    )

    results["prediction"] = predictions

    print()
    print("SAMPLE PREDICTIONS")
    print("-" * 60)

    print(
        results[
            [
                "amount",
                "failure_reason",
                "payment_method",
                "recovery_probability",
                "actual",
                "prediction",
            ]
        ]
        .head(10)
        .to_string(index=False)
    )

    # -----------------------------------------------------
    # Save model
    # -----------------------------------------------------

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    joblib.dump(
        pipeline,
        MODEL_PATH,
    )

    print()
    print("=" * 60)
    print(f"MODEL SAVED: {MODEL_PATH}")
    print("=" * 60)


if __name__ == "__main__":
    main()