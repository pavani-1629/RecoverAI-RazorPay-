from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


db_url = settings.database_url.strip() if settings.database_url else "sqlite:///./recoverai.db"

connect_args = {"check_same_thread": False} if "sqlite" in db_url else {}

engine = create_engine(
    db_url,
    connect_args=connect_args,
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