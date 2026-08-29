from sqlalchemy import select

from app.db.database import SessionLocal
from app.db.models import Transaction
from app.services.recovery_predictor import predict_recovery


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

        result = predict_recovery(
            db=db,
            transaction=transaction,
        )

        print("\n" + "=" * 60)
        print("RECOVERY PREDICTION")
        print("=" * 60)
        print(f"Transaction ID:        {result['transaction_id']}")
        print(
            f"Recovery probability:  "
            f"{result['recovery_probability']}"
        )
        print(f"Recoverable:           {result['recoverable']}")
        print(f"Operating threshold:   {result['threshold']}")
        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    main()