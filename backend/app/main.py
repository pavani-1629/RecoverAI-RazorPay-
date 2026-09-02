from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.recovery import router as recovery_router


app = FastAPI(
    title="RecoverAI API",
    description="AI-powered payment recovery system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(recovery_router)


@app.get("/")
def root():
    return {
        "message": "RecoverAI API is running",
        "version": "1.0.0",
        "status": "healthy",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
    }