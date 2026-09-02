from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


db_url = settings.database_url.strip() if settings.database_url else "sqlite:///./recoverai.db"

if db_url.startswith("postgres://"):
    db_url = "postgresql+psycopg://" + db_url[len("postgres://"):]
elif db_url.startswith("postgresql+psycopg2://"):
    db_url = "postgresql+psycopg://" + db_url[len("postgresql+psycopg2://"):]
elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+"):
    db_url = "postgresql+psycopg://" + db_url[len("postgresql://"):]

if "sqlite" in db_url:
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False, "timeout": 30},
        pool_pre_ping=True,
    )
else:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()