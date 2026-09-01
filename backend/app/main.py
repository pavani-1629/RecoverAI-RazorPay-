from fastapi import FastAPI

from app.api.recovery import router as recovery_router


app = FastAPI(
    title="RecoverAI API",
    description="AI-powered payment recovery system",
    version="1.0.0",
)


app.include_router(recovery_router)


@app.get("/")
def root():
    return {
        "message": "RecoverAI API is running",
        "version": "1.0.0",
    }