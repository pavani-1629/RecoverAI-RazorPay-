import os

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel
from sqlalchemy import select
from google.genai import types
from app.core.config import settings


from app.db.models import Transaction
from app.db.database import SessionLocal
from app.services.recovery_predictor import predict_recovery
from app.services.recovery_policy import decide_recovery_action


load_dotenv()


client = genai.Client(
    api_key=settings.gemini_api_key,
    http_options={"timeout": 120000},
)

class RecoveryAgentResponse(BaseModel):
    summary: str
    recommended_action: str
    priority: str
    confidence: float
    next_step: str

def explain_recovery(
    transaction_id: int,
    recovery_probability: float,
    recommended_action: str,
    priority: str,
    reason: str,
) -> RecoveryAgentResponse:

    prompt = f"""
You are the RecoveryAI assistant.

Analyze this failed payment recovery case.

Transaction ID: {transaction_id}
Recovery probability: {recovery_probability:.4f}
Recommended action: {recommended_action}
Priority: {priority}
System reason: {reason}

Provide a concise recovery analysis.
"""

    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=prompt,
       response_format={
           "type": "text",
           "mime_type": "application/json",
           "schema": RecoveryAgentResponse.model_json_schema(),
        },
    )

    return RecoveryAgentResponse.model_validate_json(
        interaction.output_text
    )

def get_transaction(transaction_id: int) -> dict | None:
    db = SessionLocal()

    try:
        transaction = db.scalars(
            select(Transaction).where(
                Transaction.id == transaction_id
            )
        ).first()

        if transaction is None:
            return None

        return {
            "id": transaction.id,
            "amount": float(transaction.amount),
            "currency": transaction.currency,
            "status": transaction.status,
            "failure_reason": transaction.failure_reason,
            "payment_method": transaction.payment_method,
            "retry_count": transaction.retry_count,
        }

    finally:
        db.close()

def get_recovery_prediction(transaction_id: int) -> dict | None:
    db = SessionLocal()

    try:
        transaction = db.scalars(
            select(Transaction).where(
                Transaction.id == transaction_id
            )
        ).first()

        if transaction is None:
            return None

        if transaction.status != "failed":
            return {
                "error": "Recovery prediction is only available for failed transactions"
            }

        prediction = predict_recovery(
            db=db,
            transaction=transaction,
        )

        return prediction

    finally:
        db.close()

def analyze_recovery(transaction_id: int) -> str:
    transaction = get_transaction(transaction_id)

    if transaction is None:
        return f"Transaction {transaction_id} was not found."

    prediction = get_recovery_prediction(transaction_id)

    if prediction is None or "error" in prediction:
        return f"Could not generate a recovery prediction for transaction {transaction_id}."

    decision = get_recovery_decision(transaction_id)

    if decision is None:
        return f"Could not determine a recovery decision for transaction {transaction_id}."

    prompt = f"""
You are the RecoverAI recovery agent.

Analyze the failed payment using the information below.

Transaction information:
{transaction}

ML recovery prediction:
{prediction}

Trusted recovery policy decision:
{decision}

IMPORTANT:
The recovery policy is the source of truth for the recommended action.
Do NOT change, override, or invent the action.

The approved action is:
{decision["action"]}

The approved priority is:
{decision["priority"]}

The policy reason is:
{decision["reason"]}

Provide a concise recovery analysis.

Include:
1. What happened
2. Recovery probability
3. Approved recovery action
4. Why the approved action makes sense
5. Next step

Your explanation must remain consistent with the trusted policy decision.
Do not invent information.
"""

    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=prompt,
    )

    return interaction.output_text

def get_recovery_decision(transaction_id: int) -> dict | None:
    db = SessionLocal()

    try:
        transaction = db.scalars(
            select(Transaction).where(
                Transaction.id == transaction_id
            )
        ).first()

        if transaction is None:
            return None

        prediction = get_recovery_prediction(transaction_id)

        if prediction is None or "error" in prediction:
            return None

        decision = decide_recovery_action(
            transaction=transaction,
            recovery_probability=prediction["recovery_probability"],
        )

        return {
            "transaction_id": transaction_id,
            "action": decision.action,
            "priority": decision.priority,
            "reason": decision.reason,
        }

    finally:
        db.close()