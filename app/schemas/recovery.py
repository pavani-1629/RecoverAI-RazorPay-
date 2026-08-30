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