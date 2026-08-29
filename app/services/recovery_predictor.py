from dataclasses import asdict

import pandas as pd
from sqlalchemy.orm import Session

from app.db.models import Transaction
from app.ml.recovery_model import recovery_model
from app.services.recovery_features import build_recovery_features


OPERATING_THRESHOLD = 0.30


def predict_recovery(
    db: Session,
    transaction: Transaction,
):
    """
    Predict whether a failed transaction is likely
    to be recoverable.
    """

    features = build_recovery_features(
        db=db,
        transaction=transaction,
    )

    feature_dict = asdict(features)

    # transaction_id is an identifier, not an ML feature.
    feature_dict.pop("transaction_id")

    # The model was trained using named columns.
    feature_df = pd.DataFrame([feature_dict])

    probability = recovery_model.predict_probability(
        feature_df
    )

    recoverable = probability >= OPERATING_THRESHOLD

    return {
        "transaction_id": transaction.id,
        "recovery_probability": round(probability, 4),
        "recoverable": recoverable,
        "threshold": OPERATING_THRESHOLD,
    }