from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.health import router as health_router
from app.routes.upload import router as upload_router

app = FastAPI(title="DocuMind AI Backend")

# CORS allows the frontend dev server to call this backend during local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routes for health checks and file upload + OCR.
app.include_router(health_router)
app.include_router(upload_router)