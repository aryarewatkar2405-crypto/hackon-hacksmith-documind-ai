from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.ocr_service import extract_text_from_file
from app.services.parser_service import detect_document_type, parse_document_fields

router = APIRouter()
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png", "pdf"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "application/pdf"}

# Resolve backend root and uploads directory once for reuse.
BACKEND_ROOT = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BACKEND_ROOT / "uploads"


@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    # Accept only supported image/PDF uploads for OCR processing.
    safe_filename = Path(file.filename).name
    extension = Path(safe_filename).suffix.lower().lstrip(".")

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Supported file types: jpg, jpeg, png, pdf")

    if file.content_type and file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported content type for upload")

    # Ensure the uploads folder exists before saving files.
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    # Save the uploaded file to backend/uploads with a safe local filename.
    destination_path = UPLOADS_DIR / safe_filename
    file_bytes = await file.read()
    destination_path.write_bytes(file_bytes)

    # Run OCR on saved image/PDF and return combined extracted text.
    extracted_text = extract_text_from_file(str(destination_path))

    # Detect document type from OCR text using simple keyword matching.
    document_type = detect_document_type(extracted_text)

    # Extract fields dynamically based on detected document type.
    fields = parse_document_fields(extracted_text, document_type)

    return {
        "filename": safe_filename,
        "document_type": document_type,
        "fields": fields,
        "extracted_text": extracted_text,
    }