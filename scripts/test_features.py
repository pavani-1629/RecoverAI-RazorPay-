from sqlalchemy import select

from app.db.database import SessionLocal
from app.db.models import Transaction
from app.services.recovery_features import build_recovery_features


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

        features = build_recovery_features(
            db=db,
            transaction=transaction,
        )

        print()
        print("=" * 60)
        print("RECOVERY FEATURES")
        print("=" * 60)

        print(f"Transaction ID:          {features.transaction_id}")
        print(f"Amount:                  ₹{features.amount:,.2f}")
        print(f"Failure reason:          {features.failure_reason}")
        print(f"Payment method:          {features.payment_method}")
        print(f"Retry count:             {features.retry_count}")

        print()
        print("CUSTOMER HISTORY")
        print("-" * 60)

        print(
            f"Transactions:            "
            f"{features.customer_transaction_count}"
        )

        print(
            f"Successful:              "
            f"{features.customer_success_count}"
        )

        print(
            f"Failed:                  "
            f"{features.customer_failure_count}"
        )

        print(
            f"Success rate:            "
            f"{features.customer_success_rate:.2%}"
        )

        print(
            f"Failure rate:            "
            f"{features.customer_failure_rate:.2%}"
        )

        print()
        print(
            f"Amount bucket:            "
            f"{features.amount_bucket}"
        )

        print("=" * 60)

    finally:
        db.close()


if __name__ == "__main__":
    main()