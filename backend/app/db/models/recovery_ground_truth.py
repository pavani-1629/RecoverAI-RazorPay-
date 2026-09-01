from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class RecoveryGroundTruth(Base):
    __tablename__ = "recovery_ground_truth"

    id: Mapped[int] = mapped_column(primary_key=True)

    transaction_id: Mapped[int] = mapped_column(
        ForeignKey("transactions.id"),
        unique=True,
        nullable=False,
    )

    recoverable: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )

    recovery_probability: Mapped[Decimal] = mapped_column(
        Numeric(5, 4),
        nullable=False,
    )

    simulated_outcome: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
