from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    AuditEvent,
    RecoveryAction,
    RecoveryCase,
    Transaction,
)
from app.schemas.recovery import (
    RecoveryActionHistoryResponse,
    RecoveryActionResponse,
    RecoveryCaseDetailResponse,
    RecoveryCaseListResponse,
    RecoveryCaseResponse,
    RecoveryExecutionResponse,
    RecoveryPredictionResponse,
)
from app.services.recovery_executor import execute_recovery_action
from app.services.recovery_policy import decide_recovery_action
from app.services.recovery_predictor import predict_recovery
from app.agents.recovery_agent import run_recovery_agent


router = APIRouter(
    prefix="/api/recovery",
    tags=["Recovery"],
)


@router.get(
    "/predict/{transaction_id}",
    response_model=RecoveryPredictionResponse,
)
def predict_transaction_recovery(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    transaction = db.scalars(
        select(Transaction).where(
            Transaction.id == transaction_id
        )
    ).first()

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )

    if transaction.status != "failed":
        raise HTTPException(
            status_code=400,
            detail="Recovery prediction is only available for failed transactions",
        )

    prediction = predict_recovery(
        db=db,
        transaction=transaction,
    )

    decision = decide_recovery_action(
        transaction=transaction,
        recovery_probability=prediction["recovery_probability"],
    )

    return {
        **prediction,
        "recommended_action": decision.action,
        "priority": decision.priority,
        "reason": decision.reason,
    }


@router.get(
    "/cases",
    response_model=list[RecoveryCaseListResponse],
)
def list_recovery_cases(
    db: Session = Depends(get_db),
):
    cases = db.scalars(
        select(RecoveryCase).order_by(
            RecoveryCase.id.desc()
        )
    ).all()

    return [
        {
            "recovery_case_id": case.id,
            "transaction_id": case.transaction_id,
            "recovery_probability": float(
                case.risk_score
            ),
            "reason": case.reason,
            "status": case.status,
            "estimated_revenue": float(
                case.estimated_revenue
            ),
        }
        for case in cases
    ]

@router.get(
    "/cases/{case_id}/actions",
    response_model=list[RecoveryActionHistoryResponse],
)
def list_recovery_actions(
    case_id: int,
    db: Session = Depends(get_db),
):
    recovery_case = db.scalars(
        select(RecoveryCase).where(
            RecoveryCase.id == case_id
        )
    ).first()

    if recovery_case is None:
        raise HTTPException(
            status_code=404,
            detail="Recovery case not found",
        )

    actions = db.scalars(
        select(RecoveryAction)
        .where(
            RecoveryAction.recovery_case_id == case_id
        )
        .order_by(RecoveryAction.id.desc())
    ).all()

    return [
        {
            "action_id": action.id,
            "action_type": action.action_type,
            "status": action.status,
            "reason": action.reason,
            "result": action.result,
            "executed_at": (
                action.executed_at.isoformat()
                if action.executed_at
                else None
            ),
        }
        for action in actions
    ]


@router.get(
    "/cases/{case_id}",
    response_model=RecoveryCaseDetailResponse,
)
def get_recovery_case(
    case_id: int,
    db: Session = Depends(get_db),
):
    recovery_case = db.scalars(
        select(RecoveryCase).where(
            RecoveryCase.id == case_id
        )
    ).first()

    if recovery_case is None:
        raise HTTPException(
            status_code=404,
            detail="Recovery case not found",
        )

    action = db.scalars(
        select(RecoveryAction)
        .where(
            RecoveryAction.recovery_case_id
            == recovery_case.id
        )
        .order_by(RecoveryAction.id.desc())
    ).first()

    if action is None:
        raise HTTPException(
            status_code=404,
            detail="Recovery action not found for this case",
        )

    return {
        "recovery_case_id": recovery_case.id,
        "transaction_id": recovery_case.transaction_id,
        "recovery_probability": float(
            recovery_case.risk_score
        ),
        "reason": recovery_case.reason,
        "status": recovery_case.status,
        "estimated_revenue": float(
            recovery_case.estimated_revenue
        ),
        "action": {
            "action_type": action.action_type,
            "status": action.status,
            "reason": action.reason,
            "result": action.result,
        },
    }

@router.post(
    "/cases/{transaction_id}",
    response_model=RecoveryCaseResponse,
)

def create_recovery_case(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    # --------------------------------------------------
    # 1. Find transaction
    # --------------------------------------------------

    transaction = db.scalars(
        select(Transaction).where(
            Transaction.id == transaction_id
        )
    ).first()

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )

    if transaction.status != "failed":
        raise HTTPException(
            status_code=400,
            detail="Recovery case can only be created for failed transactions",
        )

    # --------------------------------------------------
    # 2. Check whether a case already exists
    # --------------------------------------------------

    existing_case = db.scalars(
        select(RecoveryCase).where(
            RecoveryCase.transaction_id == transaction_id
        )
    ).first()

    if existing_case is not None:
        raise HTTPException(
            status_code=409,
            detail="Recovery case already exists for this transaction",
        )

    # --------------------------------------------------
    # 3. Run ML prediction
    # --------------------------------------------------

    prediction = predict_recovery(
        db=db,
        transaction=transaction,
    )

    recovery_probability = prediction["recovery_probability"]

    # --------------------------------------------------
    # 4. Apply recovery policy
    # --------------------------------------------------

    decision = decide_recovery_action(
        transaction=transaction,
        recovery_probability=recovery_probability,
    )

    # --------------------------------------------------
    # 5. Create RecoveryCase
    # --------------------------------------------------

    recovery_case = RecoveryCase(
        merchant_id=transaction.merchant_id,
        transaction_id=transaction.id,
        risk_score=Decimal(str(recovery_probability)),
        reason=decision.reason,
        status="open",
        estimated_revenue=(
            transaction.amount
            if decision.action != "no_action"
            else Decimal("0")
        ),
    )

    db.add(recovery_case)

    try:
        db.flush()
    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Recovery case already exists for this transaction",
        )

    # --------------------------------------------------
    # 6. Create RecoveryAction
    # --------------------------------------------------

    recovery_action = RecoveryAction(
        recovery_case_id=recovery_case.id,
        action_type=decision.action,
        status="recommended",
        reason=decision.reason,
        result=None,
    )

    db.add(recovery_action)

    # --------------------------------------------------
    # 7. Create AuditEvent
    # --------------------------------------------------

    audit_event = AuditEvent(
        merchant_id=transaction.merchant_id,
        recovery_case_id=recovery_case.id,
        event_type="recovery_case_created",
        actor="recovery_engine",
        description=(
            f"Recovery case created for transaction "
            f"{transaction.id}. "
            f"Recovery probability: "
            f"{recovery_probability:.4f}. "
            f"Recommended action: {decision.action}."
        ),
    )

    db.add(audit_event)

    # --------------------------------------------------
    # 8. Commit everything
    # --------------------------------------------------

    db.commit()

    # --------------------------------------------------
    # 9. Return result
    # --------------------------------------------------

    return {
        "recovery_case_id": recovery_case.id,
        "transaction_id": transaction.id,
        "recovery_probability": recovery_probability,
        "recoverable": prediction["recoverable"],
        "recommended_action": decision.action,
        "priority": decision.priority,
        "reason": decision.reason,
        "status": recovery_case.status,
        "estimated_revenue": float(
            recovery_case.estimated_revenue
        ),
    }

@router.post(
    "/cases/{case_id}/execute",
    response_model=RecoveryExecutionResponse,
)
def execute_recovery_case(
    case_id: int,
    db: Session = Depends(get_db),
):
    recovery_case = db.scalars(
        select(RecoveryCase).where(
            RecoveryCase.id == case_id
        )
    ).first()

    if recovery_case is None:
        raise HTTPException(
            status_code=404,
            detail="Recovery case not found",
        )

    if recovery_case.status == "executed":
        raise HTTPException(
            status_code=409,
            detail="Recovery case has already been executed",
        )

    try:
        execution = execute_recovery_action(
            db=db,
            recovery_case=recovery_case,
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    return {
        "recovery_case_id": execution.recovery_case_id,
        "action": execution.action,
        "status": execution.status,
        "result": execution.result,
    }

@router.post("/agent/{transaction_id}")
def run_recovery_agent_endpoint(
    transaction_id: int,
    db: Session = Depends(get_db),
):
    transaction = db.scalars(
        select(Transaction).where(
            Transaction.id == transaction_id
        )
    ).first()

    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail="Transaction not found",
        )

    if transaction.status != "failed":
        raise HTTPException(
            status_code=400,
            detail="Recovery agent analysis is only available for failed transactions",
        )

    try:
        result = run_recovery_agent(transaction_id)

        return {
            "transaction_id": transaction_id,
            "analysis": result,
        }

    except HTTPException:
        raise
    except Exception as exc:
        err_msg = str(exc)
        if "429" in err_msg or "quota" in err_msg.lower() or "RateLimit" in type(exc).__name__:
            raise HTTPException(
                status_code=429,
                detail=f"Gemini API rate limit or quota exceeded: {err_msg}",
            )
        raise HTTPException(
            status_code=503,
            detail=f"Recovery AI agent is temporarily unavailable: {err_msg}",
        )