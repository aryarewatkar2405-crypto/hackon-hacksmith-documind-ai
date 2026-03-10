from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes.health import router as health_router
from app.routes.upload import router as upload_router

app = FastAPI(title="DocuMind AI Backend")

backend_root = Path(__file__).resolve().parent
uploads_dir = backend_root / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)

# CORS allows the frontend dev server to call this backend during local development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files so frontend can preview images/PDFs.
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Register API routes for health checks and file upload + OCR.
app.include_router(health_router)
app.include_router(upload_router)