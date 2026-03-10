from PIL import Image
import pytesseract


def extract_text_from_image(image_path: str) -> str:
    # Open the uploaded image file from disk.
    image = Image.open(image_path)

    # Use Tesseract OCR to extract text content from the image.
    extracted_text = pytesseract.image_to_string(image)

    # Return cleaned string output for consistent API responses.
    return extracted_text.strip()