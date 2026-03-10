from PIL import Image, UnidentifiedImageError
from pdf2image import convert_from_path
import pytesseract

OCR_CONFIG = "--oem 1 --psm 6"


def _extract_text_from_single_image(image: Image.Image) -> str:
    try:
        return pytesseract.image_to_string(image, config=OCR_CONFIG).strip()
    except pytesseract.TesseractNotFoundError:
        return ""


def extract_text_from_file(file_path: str) -> str:
    file_suffix = file_path.lower().split(".")[-1]

    # Handle image files directly with OCR.
    if file_suffix in {"jpg", "jpeg", "png"}:
        try:
            image = Image.open(file_path)
            return _extract_text_from_single_image(image)
        except (UnidentifiedImageError, OSError, ValueError):
            return ""

    # Handle PDF files by converting each page to an image and OCR-ing each page.
    if file_suffix == "pdf":
        try:
            pages = convert_from_path(file_path, dpi=120, grayscale=True)
        except Exception:
            return ""

        extracted_pages = [_extract_text_from_single_image(page) for page in pages]
        return "\n".join([text for text in extracted_pages if text]).strip()

    return ""


def extract_text_from_image(image_path: str) -> str:
    return extract_text_from_file(image_path)