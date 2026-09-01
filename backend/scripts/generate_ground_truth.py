import random
from decimal import Decimal

from sqlalchemy import delete, select

from app.db.database import SessionLocal
from app.db.models import Customer, Transaction, RecoveryGroundTruth


RANDOM_SEED = 42

random.seed(RANDOM_SEED)


def calculate_customer_history(db, customer_id):
    """
    Calculate historical payment behavior for a customer.

    IMPORTANT:
    The current failed transaction is excluded from the
    history calculation.
    """

    transactions = db.scalars(
        select(Transaction).where(
            Transaction.customer_id == customer_id
        )
    ).all()

    total = len(transactions)

    if total == 0:
        return 0.0

    successful = sum(
        1
        for transaction in transactions
        if transaction.status == "success"
    )

    return successful / total


def calculate_recovery_probability(
    transaction,
    customer_success_rate,
):
    """
    Hidden simulation rule.

    This represents what would actually happen in our
    simulated payment environment.

    The AI agent will NOT see this formula.
    """

    score = 0.0

    # -----------------------------------------------------
    # Failure reason
    # -----------------------------------------------------

    if transaction.failure_reason == "insufficient_funds":
        score += 0.45

    elif transaction.failure_reason == "timeout":
        score += 0.35

    elif transaction.failure_reason == "network_error":
        score += 0.30

    elif transaction.failure_reason == "bank_declined":
        score += 0.15

    elif transaction.failure_reason == "limit_exceeded":
        score += 0.05

    # -----------------------------------------------------
    # Customer history
    # -----------------------------------------------------

    score += customer_success_rate * 0.35

    # -----------------------------------------------------
    # Retry count
    # -----------------------------------------------------

    if transaction.retry_count == 0:
        score += 0.15

    elif transaction.retry_count == 1:
        score += 0.08

    elif transaction.retry_count == 2:
        score += 0.02

    else:
        score -= 0.10

    # -----------------------------------------------------
    # Transaction amount
    # -----------------------------------------------------

    amount = float(transaction.amount)

    if amount <= 2000:
        score += 0.10

    elif amount <= 5000:
        score += 0.05

    elif amount <= 15000:
        score += 0.00

    else:
        score -= 0.05

    # -----------------------------------------------------
    # Payment method
    # -----------------------------------------------------

    if transaction.payment_method == "upi":
        score += 0.05

    elif transaction.payment_method == "card":
        score += 0.02

    elif transaction.payment_method == "netbanking":
        score += 0.00

    elif transaction.payment_method == "wallet":
        score += 0.01

    return max(0.0, min(1.0, score))


def generate_ground_truth():

    db = SessionLocal()

    try:
        print("Clearing existing ground truth...")

        db.execute(delete(RecoveryGroundTruth))
        db.commit()

        failed_transactions = db.scalars(
            select(Transaction).where(
                Transaction.status == "failed"
            )
        ).all()

        print(
            f"Found {len(failed_transactions)} failed transactions"
        )

        recoverable_count = 0
        not_recoverable_count = 0

        recoverable_amount = Decimal("0")
        not_recoverable_amount = Decimal("0")

        for transaction in failed_transactions:

            customer_success_rate = calculate_customer_history(
                db,
                transaction.customer_id,
            )

            probability = calculate_recovery_probability(
                transaction,
                customer_success_rate,
            )

            # -------------------------------------------------
            # Convert probability into simulated outcome.
            #
            # The random number makes the ground truth
            # probabilistic rather than deterministic.
            # -------------------------------------------------

            actual_recovery = (
                random.random() < probability
            )

            if actual_recovery:
                recoverable_count += 1
                recoverable_amount += transaction.amount

                simulated_outcome = "recovered"

            else:
                not_recoverable_count += 1
                not_recoverable_amount += transaction.amount

                simulated_outcome = "not_recovered"

            ground_truth = RecoveryGroundTruth(
                transaction_id=transaction.id,
                recoverable=actual_recovery,
                recovery_probability=Decimal(
                    str(round(probability, 4))
                ),
                simulated_outcome=simulated_outcome,
            )

            db.add(ground_truth)

        db.commit()

        print()
        print("=" * 55)
        print("GROUND TRUTH GENERATED")
        print("=" * 55)

        print(
            f"Failed transactions:       "
            f"{len(failed_transactions)}"
        )

        print(
            f"Recoverable:                "
            f"{recoverable_count}"
        )

        print(
            f"Not recoverable:            "
            f"{not_recoverable_count}"
        )

        print(
            f"Potential recoverable GMV:  "
            f"₹{recoverable_amount:,.2f}"
        )

        print(
            f"Non-recoverable GMV:         "
            f"₹{not_recoverable_amount:,.2f}"
        )

        print("=" * 55)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    generate_ground_truth()