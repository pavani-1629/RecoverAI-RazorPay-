from dataclasses import dataclass

from app.db.models import Transaction


@dataclass
class RecoveryDecision:
    action: str
    priority: str
    reason: str


def decide_recovery_action(
    transaction: Transaction,
    recovery_probability: float,
) -> RecoveryDecision:
    """
    Decide what recovery action should be taken
    after the ML model predicts recovery probability.
    """

    failure_reason = transaction.failure_reason or "unknown"

    # Very low probability:
    # Avoid unnecessary recovery attempts.
    if recovery_probability < 0.30:
        return RecoveryDecision(
            action="no_action",
            priority="low",
            reason="Low recovery probability",
        )

    # Network/timeout failures are generally suitable
    # for retry when confidence is reasonably high.
    if failure_reason in {"network_error", "timeout"}:
        if recovery_probability >= 0.60:
            return RecoveryDecision(
                action="retry_payment",
                priority="high",
                reason="Temporary failure with high recovery probability",
            )

        return RecoveryDecision(
            action="retry_payment",
            priority="medium",
            reason="Temporary failure with moderate recovery probability",
        )

    # Bank declines and limit issues should be handled
    # more cautiously.
    if failure_reason in {"bank_declined", "limit_exceeded"}:
        if recovery_probability >= 0.80:
            return RecoveryDecision(
                action="alternative_payment",
                priority="high",
                reason="High recovery probability but direct retry may fail again",
            )

        return RecoveryDecision(
            action="customer_notification",
            priority="medium",
            reason="Payment issue may require customer intervention",
        )

    # Default policy for unknown failure types.
    if recovery_probability >= 0.60:
        return RecoveryDecision(
            action="manual_review",
            priority="medium",
            reason="Potentially recoverable payment requiring review",
        )

    return RecoveryDecision(
        action="no_action",
        priority="low",
        reason="Recovery confidence is insufficient",
    )