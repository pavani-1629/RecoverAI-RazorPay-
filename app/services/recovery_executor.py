from dataclasses import dataclass
from datetime import datetime, timezone, timezone

from sqlalchemy.orm import Session

from app.db.models import (
    AuditEvent,
    RecoveryAction,
    RecoveryCase,
)


@dataclass
class ExecutionResult:
    recovery_case_id: int
    action: str
    status: str
    result: str


def execute_recovery_action(
    db: Session,
    recovery_case: RecoveryCase,
) -> ExecutionResult:

    # Find the recommended action for this recovery case
    action = (
        db.query(RecoveryAction)
        .filter(
            RecoveryAction.recovery_case_id
            == recovery_case.id
        )
        .order_by(RecoveryAction.id.desc())
        .first()
    )

    if action is None:
        raise ValueError(
            "No recovery action found for this case"
        )

    # Prevent executing an already executed action
    if action.status == "executed":
        return ExecutionResult(
            recovery_case_id=recovery_case.id,
            action=action.action_type,
            status="already_executed",
            result="Recovery action has already been executed",
        )

    # --------------------------------------------------
    # Simulated recovery execution
    # --------------------------------------------------

    if action.action_type == "retry_payment":
        result = "Payment retry initiated successfully"

    elif action.action_type == "alternative_payment":
        result = "Alternative payment method requested"

    else:
        result = (
            f"Recovery action '{action.action_type}' executed"
        )

    # Update recovery action
    action.status = "executed"
    action.result = result
    action.executed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    # Update recovery case
    recovery_case.status = "executed"

    # Create audit event
    audit_event = AuditEvent(
        merchant_id=recovery_case.merchant_id,
        recovery_case_id=recovery_case.id,
        event_type="recovery_action_executed",
        actor="recovery_engine",
        description=(
            f"Recovery action '{action.action_type}' "
            f"executed for transaction "
            f"{recovery_case.transaction_id}. "
            f"Result: {result}"
        ),
    )

    db.add(audit_event)
    db.commit()

    return ExecutionResult(
        recovery_case_id=recovery_case.id,
        action=action.action_type,
        status="executed",
        result=result,
    )
