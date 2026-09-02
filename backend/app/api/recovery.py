from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import (
    AuditEvent,
    Customer,
    RecoveryAction,
    RecoveryCase,
    Transaction,
)
from app.schemas.recovery import (
    AuditEventResponse,
    MetricsSummaryResponse,
    RecoveryActionHistoryResponse,
    RecoveryActionResponse,
    RecoveryCaseDetailResponse,
    RecoveryCaseListResponse,
    RecoveryCaseResponse,
    RecoveryExecutionResponse,
    RecoveryPredictionResponse,
    TransactionItemResponse,
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
    "/metrics",
    response_model=MetricsSummaryResponse,
)
def get_recovery_metrics(
    db: Session = Depends(get_db),
):
    transactions = db.scalars(select(Transaction)).all()
    cases = db.scalars(select(RecoveryCase)).all()

    failed_txns = [t for t in transactions if t.status == "failed"]
    successful_txns = [t for t in transactions if t.status == "success"]

    total_at_risk = sum(float(t.amount) for t in failed_txns)

    executed_cases = [c for c in cases if c.status == "executed"]
    total_recovered = sum(float(c.estimated_revenue) for c in executed_cases)
    total_recoverable = sum(float(c.estimated_revenue) for c in cases)

    failure_reasons: dict[str, int] = {}
    for t in failed_txns:
        reason = t.failure_reason or "unknown"
        failure_reasons[reason] = failure_reasons.get(reason, 0) + 1

    payment_methods: dict[str, int] = {}
    for t in transactions:
        pm = t.payment_method or "unknown"
        payment_methods[pm] = payment_methods.get(pm, 0) + 1

    recovery_rate = (
        (total_recovered / total_at_risk * 100.0)
        if total_at_risk > 0
        else 0.0
    )

    return {
        "total_revenue_at_risk": round(total_at_risk, 2),
        "total_recoverable_revenue": round(total_recoverable, 2),
        "total_recovered_revenue": round(total_recovered, 2),
        "recovery_rate_percent": round(recovery_rate, 2),
        "total_failed_transactions": len(failed_txns),
        "total_successful_transactions": len(successful_txns),
        "total_recovery_cases": len(cases),
        "executed_recovery_cases": len(executed_cases),
        "failure_reasons_breakdown": failure_reasons,
        "payment_methods_breakdown": payment_methods,
    }


@router.get(
    "/transactions",
    response_model=list[TransactionItemResponse],
)
def list_transactions(
    status: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = select(Transaction, Customer).join(
        Customer,
        Transaction.customer_id == Customer.id,
        isouter=True,
    )
    if status:
        query = query.where(Transaction.status == status)

    query = query.order_by(Transaction.id.desc()).limit(limit)

    results = db.execute(query).all()

    cases = db.scalars(select(RecoveryCase)).all()
    case_map = {c.transaction_id: c for c in cases}

    response = []
    for txn, cust in results:
        case = case_map.get(txn.id)
        response.append(
            {
                "id": txn.id,
                "merchant_id": txn.merchant_id,
                "customer_id": txn.customer_id,
                "customer_name": cust.name if cust else None,
                "customer_email": cust.email if cust else None,
                "amount": float(txn.amount),
                "currency": txn.currency,
                "status": txn.status,
                "failure_reason": txn.failure_reason,
                "payment_method": txn.payment_method,
                "retry_count": txn.retry_count,
                "created_at": (
                    txn.created_at.isoformat()
                    if txn.created_at
                    else ""
                ),
                "has_recovery_case": case is not None,
                "recovery_case_id": case.id if case else None,
                "recovery_case_status": case.status if case else None,
                "recovery_probability": (
                    float(case.risk_score) if case else None
                ),
            }
        )

    return response


@router.get(
    "/audit-events",
    response_model=list[AuditEventResponse],
)
def list_audit_events(
    limit: int = 50,
    db: Session = Depends(get_db),
):
    events = db.scalars(
        select(AuditEvent)
        .order_by(AuditEvent.id.desc())
        .limit(limit)
    ).all()

    return [
        {
            "id": ev.id,
            "merchant_id": ev.merchant_id,
            "recovery_case_id": ev.recovery_case_id,
            "event_type": ev.event_type,
            "actor": ev.actor,
            "description": ev.description,
            "created_at": (
                ev.created_at.isoformat() if ev.created_at else ""
            ),
        }
        for ev in events
    ]



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
                detail=f"LLM service rate limit or quota exceeded: {err_msg}",
            )
        raise HTTPException(
            status_code=503,
            detail=f"Recovery AI agent is temporarily unavailable: {err_msg}",
        )