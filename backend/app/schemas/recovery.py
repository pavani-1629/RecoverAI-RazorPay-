from pydantic import BaseModel, Field


class RecoveryPredictionResponse(BaseModel):
    transaction_id: int
    recovery_probability: float = Field(
        ge=0.0,
        le=1.0,
    )
    recoverable: bool
    threshold: float = Field(
        ge=0.0,
        le=1.0,
    )
    recommended_action: str
    priority: str
    reason: str


class RecoveryCaseResponse(BaseModel):
    recovery_case_id: int
    transaction_id: int
    recovery_probability: float = Field(
        ge=0.0,
        le=1.0,
    )
    recoverable: bool
    recommended_action: str
    priority: str
    reason: str
    status: str
    estimated_revenue: float


class RecoveryExecutionResponse(BaseModel):
    recovery_case_id: int
    action: str
    status: str
    result: str

class RecoveryCaseListResponse(BaseModel):
    recovery_case_id: int
    transaction_id: int
    recovery_probability: float = Field(
        ge=0.0,
        le=1.0,
    )
    reason: str
    status: str
    estimated_revenue: float

class RecoveryActionResponse(BaseModel):
    action_type: str
    status: str
    reason: str
    result: str | None


class RecoveryCaseDetailResponse(BaseModel):
    recovery_case_id: int
    transaction_id: int
    recovery_probability: float = Field(
        ge=0.0,
        le=1.0,
    )
    reason: str
    status: str
    estimated_revenue: float
    action: RecoveryActionResponse

class RecoveryActionHistoryResponse(BaseModel):
    action_id: int
    action_type: str
    status: str
    reason: str
    result: str | None
    executed_at: str | None


class TransactionItemResponse(BaseModel):
    id: int
    merchant_id: int
    customer_id: int
    customer_name: str | None = None
    customer_email: str | None = None
    amount: float
    currency: str
    status: str
    failure_reason: str | None
    payment_method: str
    retry_count: int
    created_at: str
    has_recovery_case: bool = False
    recovery_case_id: int | None = None
    recovery_case_status: str | None = None
    recovery_probability: float | None = None


class MetricsSummaryResponse(BaseModel):
    total_revenue_at_risk: float
    total_recoverable_revenue: float
    total_recovered_revenue: float
    recovery_rate_percent: float
    total_failed_transactions: int
    total_successful_transactions: int
    total_recovery_cases: int
    executed_recovery_cases: int
    failure_reasons_breakdown: dict[str, int]
    payment_methods_breakdown: dict[str, int]


class AuditEventResponse(BaseModel):
    id: int
    merchant_id: int
    recovery_case_id: int | None
    event_type: str
    actor: str
    description: str
    created_at: str