import os

from dotenv import load_dotenv
from google import genai
from pydantic import BaseModel
from sqlalchemy import select
from google.genai import types
from app.core.config import settings


from app.db.models import Transaction
from app.db.database import SessionLocal
from app.services.recovery_executor import execute_recovery_action
from app.services.recovery_policy import decide_recovery_action
from app.services.recovery_predictor import predict_recovery

load_dotenv()


client = genai.Client(
    api_key=settings.gemini_api_key,
    http_options={"timeout": 120000},
)

# -----------------------------
# Gemini Agent Tools
# -----------------------------

get_transaction_tool = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="get_transaction",
            description="Get transaction details for a transaction ID.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "transaction_id": types.Schema(
                        type=types.Type.INTEGER,
                        description="The ID of the transaction to retrieve.",
                    )
                },
                required=["transaction_id"],
            ),
        )
    ]
)


get_recovery_prediction_tool = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="get_recovery_prediction",
            description="Get the ML recovery probability for a failed transaction.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "transaction_id": types.Schema(
                        type=types.Type.INTEGER,
                        description="The ID of the transaction.",
                    )
                },
                required=["transaction_id"],
            ),
        )
    ]
)


get_recovery_decision_tool = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="get_recovery_decision",
            description="Get the trusted recovery policy decision for a transaction.",
            parameters=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "transaction_id": types.Schema(
                        type=types.Type.INTEGER,
                        description="The ID of the transaction.",
                    )
                },
                required=["transaction_id"],
            ),
        )
    ]
)

RECOVERY_TOOLS = [
    {
        "type": "function",
        "name": "get_transaction",
        "description": "Get transaction details for a transaction ID.",
        "parameters": {
            "type": "object",
            "properties": {
                "transaction_id": {
                    "type": "integer",
                    "description": "The ID of the transaction.",
                }
            },
            "required": ["transaction_id"],
        },
    },
    {
        "type": "function",
        "name": "get_recovery_prediction",
        "description": "Get the ML recovery probability for a failed transaction.",
        "parameters": {
            "type": "object",
            "properties": {
                "transaction_id": {
                    "type": "integer",
                    "description": "The ID of the transaction.",
                }
            },
            "required": ["transaction_id"],
        },
    },
    {
        "type": "function",
        "name": "get_recovery_decision",
        "description": "Get the trusted recovery policy decision for a transaction.",
        "parameters": {
            "type": "object",
            "properties": {
                "transaction_id": {
                    "type": "integer",
                    "description": "The ID of the transaction.",
                }
            },
            "required": ["transaction_id"],
        },
    },
]

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

def run_recovery_agent(transaction_id: int) -> str:
    prompt = f"""
You are RecoverAI, an AI agent that analyzes failed payment transactions.

Analyze transaction {transaction_id}.

You have access to these tools:
- get_transaction
- get_recovery_prediction
- get_recovery_decision

Use the tools to gather the required information.

Important:
The recovery policy decision is the source of truth.
Never override the policy's action.

Once you have enough information, provide a concise final recovery analysis.

Include:
1. What happened
2. Recovery probability
3. Approved recovery action
4. Why the approved action makes sense
5. Next step
"""

    interaction = client.interactions.create(
        model="gemini-3.6-flash",
        input=prompt,
        tools=RECOVERY_TOOLS,
    )

    for _ in range(5):
        function_calls = [
            step
            for step in (interaction.steps or [])
            if getattr(step, "type", None) == "function_call"
        ]

        if not function_calls:
            return interaction.output_text or ""

        results = []

        for call in function_calls:
            try:
                if call.name == "get_transaction":
                    result = get_transaction(
                        call.arguments["transaction_id"]
                    )

                elif call.name == "get_recovery_prediction":
                    result = get_recovery_prediction(
                        call.arguments["transaction_id"]
                    )

                elif call.name == "get_recovery_decision":
                    result = get_recovery_decision(
                        call.arguments["transaction_id"]
                    )

                else:
                    result = {
                        "error": f"Unknown tool: {call.name}"
                    }

                results.append(
                    {
                        "type": "function_result",
                        "call_id": call.id,
                        "name": call.name,
                        "result": result,
                    }
                )

            except Exception as e:
                results.append(
                    {
                        "type": "function_result",
                        "call_id": call.id,
                        "name": call.name,
                        "result": {
                            "error": str(e)
                        },
                        "is_error": True,
                    }
                )

        interaction = client.interactions.create(
            model="gemini-3.6-flash",
            previous_interaction_id=interaction.id,
            input=results,
            tools=RECOVERY_TOOLS,
        )

    return interaction.output_text or "Agent could not complete the recovery analysis."
