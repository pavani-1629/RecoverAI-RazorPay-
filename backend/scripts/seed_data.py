import random
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import delete

from app.db.database import SessionLocal
from app.db.models import Merchant, Customer, Transaction


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

RANDOM_SEED = 42

NUM_CUSTOMERS = 100
NUM_TRANSACTIONS = 1000

random.seed(RANDOM_SEED)


# ---------------------------------------------------------
# Synthetic data options
# ---------------------------------------------------------

FIRST_NAMES = [
    "Aarav",
    "Aditi",
    "Arjun",
    "Ananya",
    "Rahul",
    "Priya",
    "Rohan",
    "Sneha",
    "Vikram",
    "Kavya",
    "Aditya",
    "Neha",
    "Karan",
    "Meera",
    "Varun",
]

LAST_NAMES = [
    "Sharma",
    "Reddy",
    "Patel",
    "Verma",
    "Kumar",
    "Rao",
    "Singh",
    "Gupta",
    "Iyer",
    "Nair",
]

PAYMENT_METHODS = [
    "upi",
    "card",
    "netbanking",
    "wallet",
]

FAILURE_REASONS = [
    "insufficient_funds",
    "bank_declined",
    "timeout",
    "network_error",
    "limit_exceeded",
]


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------

def random_amount() -> Decimal:
    """
    Generate realistic Indian transaction amounts.
    """
    amount = random.choice([
        random.randint(100, 1000),
        random.randint(1000, 5000),
        random.randint(5000, 15000),
        random.randint(15000, 50000),
    ])

    return Decimal(amount).quantize(Decimal("0.01"))


def random_name() -> str:
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def random_email(name: str, number: int) -> str:
    clean_name = name.lower().replace(" ", ".")
    return f"{clean_name}{number}@example.com"


# ---------------------------------------------------------
# Seed database
# ---------------------------------------------------------

def seed_database():
    db = SessionLocal()

    try:
        print("Clearing existing synthetic data...")

        # Delete in dependency order.
        db.execute(delete(Transaction))
        db.execute(delete(Customer))
        db.execute(delete(Merchant))

        db.commit()

        # -------------------------------------------------
        # Merchant
        # -------------------------------------------------

        merchant = Merchant(
            name="RecoverAI Demo Store",
            email="merchant@recoverai.demo",
        )

        db.add(merchant)
        db.flush()

        print(f"Created merchant: {merchant.name}")

        # -------------------------------------------------
        # Customers
        # -------------------------------------------------

        customers = []

        for i in range(1, NUM_CUSTOMERS + 1):
            name = random_name()

            customer = Customer(
                merchant_id=merchant.id,
                name=name,
                email=random_email(name, i),
                phone=f"+91{random.randint(6000000000, 9999999999)}",
            )

            customers.append(customer)
            db.add(customer)

        db.flush()

        print(f"Created {len(customers)} customers")

        # -------------------------------------------------
        # Transactions
        # -------------------------------------------------

        transactions = []

        start_date = datetime.utcnow() - timedelta(days=30)

        success_count = 0
        failure_count = 0

        for i in range(NUM_TRANSACTIONS):

            customer = random.choice(customers)

            # Approximately 75% successful,
            # 25% failed transactions.
            is_success = random.random() < 0.75

            amount = random_amount()

            payment_method = random.choice(PAYMENT_METHODS)

            created_at = start_date + timedelta(
                minutes=random.randint(0, 30 * 24 * 60)
            )

            if is_success:
                status = "success"
                failure_reason = None
                retry_count = 0

                success_count += 1

            else:
                status = "failed"
                failure_reason = random.choice(FAILURE_REASONS)

                # Failed payments can have previous attempts.
                retry_count = random.choices(
                    [0, 1, 2, 3],
                    weights=[45, 35, 15, 5],
                )[0]

                failure_count += 1

            transaction = Transaction(
                merchant_id=merchant.id,
                customer_id=customer.id,
                amount=amount,
                currency="INR",
                status=status,
                failure_reason=failure_reason,
                payment_method=payment_method,
                retry_count=retry_count,
                created_at=created_at,
            )

            transactions.append(transaction)
            db.add(transaction)

        db.commit()

        print(f"Created {len(transactions)} transactions")

        # -------------------------------------------------
        # Summary
        # -------------------------------------------------

        total_amount = sum(
            transaction.amount
            for transaction in transactions
        )

        failed_amount = sum(
            transaction.amount
            for transaction in transactions
            if transaction.status == "failed"
        )

        print()
        print("=" * 50)
        print("SYNTHETIC DATASET CREATED")
        print("=" * 50)
        print(f"Customers:          {len(customers)}")
        print(f"Transactions:       {len(transactions)}")
        print(f"Successful:         {success_count}")
        print(f"Failed:             {failure_count}")
        print(f"Total GMV:          ₹{total_amount:,.2f}")
        print(f"Failed GMV:         ₹{failed_amount:,.2f}")
        print("=" * 50)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()