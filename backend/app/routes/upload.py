from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.ocr_service import extract_text_from_image
from app.services.parser_service import parse_invoice_fields

router = APIRouter()

# Resolve backend root and uploads directory once for reuse.
BACKEND_ROOT = Path(__file__).resolve().parents[2]
UPLOADS_DIR = BACKEND_ROOT / "uploads"


@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    # Accept only image uploads for OCR processing.
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are supported")

    # Ensure the uploads folder exists before saving files.
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

    # Save the uploaded file to backend/uploads with a safe local filename.
    safe_filename = Path(file.filename).name
    destination_path = UPLOADS_DIR / safe_filename
    file_bytes = await file.read()
    destination_path.write_bytes(file_bytes)

    # Run OCR on the saved image and return the extracted text.
    extracted_text = extract_text_from_image(str(destination_path))

    # Parse key invoice fields from OCR text for a simple structured response.
    structured_data = parse_invoice_fields(extracted_text)

    return {
        "filename": safe_filename,
        "extracted_text": extracted_text,
        "structured_data": structured_data,
    }