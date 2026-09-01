from sqlalchemy import select

from app.db.database import SessionLocal
from app.db.models import Transaction
from app.services.recovery_predictor import predict_recovery
from app.services.recovery_policy import decide_recovery_action


def main():
    db = SessionLocal()

    try:
        transaction = db.scalars(
            select(Transaction)
            .where(Transaction.status == "failed")
            .limit(1)
        ).first()

        if transaction is None:
            print("No failed transaction found.")
            return

        prediction = predict_recovery(
            db=db,
            transaction=transaction,
        )

        decision = decide_recovery_action(
            transaction=transaction,
            recovery_probability=prediction["recovery_probability"],
        )

        print("\n" + "=" * 60)
        print("RECOVERY DECISION")
        print("=" * 60)

        print(f"Transaction ID:       {transaction.id}")
        print(f"Failure reason:       {transaction.failure_reason}")
        print(f"Payment method:       {transaction.payment_method}")
        print(
            f"Recovery probability: "
            f"{prediction['recovery_probability']}"
        )

        print("\nDECISION")
        print("-" * 60)
        print(f"Action:               {decision.action}")
        print(f"Priority:             {decision.priority}")
        print(f"Reason:               {decision.reason}")

        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    main()