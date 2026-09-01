from dataclasses import dataclass
from decimal import Decimal

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.models import Customer, Transaction


@dataclass
class RecoveryFeatures:
    """
    Features available to the recovery intelligence engine.

    IMPORTANT:
    These features are derived only from information that
    would realistically be available when a payment fails.

    Ground-truth information is NEVER included here.
    """

    transaction_id: int

    amount: float

    failure_reason: str

    payment_method: str

    retry_count: int

    customer_transaction_count: int

    customer_success_count: int

    customer_failure_count: int

    customer_success_rate: float

    customer_failure_rate: float

    amount_bucket: str


def get_customer_history(
    db: Session,
    customer_id: int,
    current_transaction_id: int,
):
    """
    Calculate customer payment history while excluding
    the current failed transaction.

    This prevents data leakage.
    """

    current_transaction = db.get(
        Transaction,
        current_transaction_id,
    )

    transactions = db.scalars(
        select(Transaction).where(
            Transaction.customer_id == customer_id,
            Transaction.id != current_transaction_id,
            Transaction.created_at < current_transaction.created_at,
        )
    ).all()

    total = len(transactions)

    successful = sum(
        1
        for transaction in transactions
        if transaction.status == "success"
    )

    failed = sum(
        1
        for transaction in transactions
        if transaction.status == "failed"
    )

    if total == 0:
        success_rate = 0.0
        failure_rate = 0.0
    else:
        success_rate = successful / total
        failure_rate = failed / total

    return {
        "total": total,
        "successful": successful,
        "failed": failed,
        "success_rate": success_rate,
        "failure_rate": failure_rate,
    }


def get_amount_bucket(amount: Decimal) -> str:
    """
    Categorize transaction amount.

    We use buckets because the relationship between
    transaction size and recovery behavior is not
    necessarily linear.
    """

    amount_value = float(amount)

    if amount_value <= 2000:
        return "low"

    if amount_value <= 5000:
        return "medium"

    if amount_value <= 15000:
        return "high"

    return "very_high"


def build_recovery_features(
    db: Session,
    transaction: Transaction,
) -> RecoveryFeatures:

    history = get_customer_history(
        db=db,
        customer_id=transaction.customer_id,
        current_transaction_id=transaction.id,
    )

    return RecoveryFeatures(
        transaction_id=transaction.id,

        amount=float(transaction.amount),

        failure_reason=transaction.failure_reason or "unknown",

        payment_method=transaction.payment_method,

        retry_count=transaction.retry_count,

        customer_transaction_count=history["total"],

        customer_success_count=history["successful"],

        customer_failure_count=history["failed"],

        customer_success_rate=history["success_rate"],

        customer_failure_rate=history["failure_rate"],

        amount_bucket=get_amount_bucket(transaction.amount),
    )