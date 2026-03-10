import re


def _extract_amount(ocr_text: str) -> str:
    amount_match = re.search(
        r"(?:total|amount)\s*[:\-]?\s*(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:[.,][0-9]{1,2})?)",
        ocr_text,
        flags=re.IGNORECASE,
    )
    return amount_match.group(1).replace(",", "") if amount_match else ""


def _extract_date(ocr_text: str) -> str:
    date_match = re.search(
        r"date\s*[:\-]?\s*(.+?)(?=\s*(?:total|amount|vendor|invoice|store|party)\s*[:\-]?|$)",
        ocr_text,
        flags=re.IGNORECASE,
    )
    return date_match.group(1).strip() if date_match else ""


def detect_document_type(ocr_text: str) -> str:
    # Normalize OCR text to lowercase for consistent keyword detection.
    normalized = ocr_text.lower()

    invoice_keywords = [
        "invoice",
        "bill",
        "tax invoice",
        "invoice no",
        "invoice number",
        "total amount",
        "amount due",
    ]
    receipt_keywords = [
        "receipt",
        "payment received",
        "transaction",
        "paid",
        "thank you",
    ]
    contract_keywords = [
        "agreement",
        "contract",
        "terms",
        "party",
        "clause",
    ]
    id_keywords = [
        "identity",
        "id",
        "card",
        "date of birth",
        "id number",
        "government",
    ]

    # Score each document type by counting how many of its keywords appear in OCR text.
    invoice_score = sum(keyword in normalized for keyword in invoice_keywords)
    receipt_score = sum(keyword in normalized for keyword in receipt_keywords)
    contract_score = sum(keyword in normalized for keyword in contract_keywords)
    id_score = sum(keyword in normalized for keyword in id_keywords)

    scores = {
        "invoice": invoice_score,
        "receipt": receipt_score,
        "contract": contract_score,
        "id_card": id_score,
    }

    # If no keywords matched any category, fallback to general_document.
    if max(scores.values()) == 0:
        return "general_document"

    # Otherwise return the type with the highest keyword score.
    return max(scores, key=scores.get)


def parse_document_fields(ocr_text: str, document_type: str) -> dict:
    if document_type == "invoice":
        invoice_match = re.search(
            r"(?:invoice\s*(?:no|number)?|inv)\s*[:#-]?\s*([A-Za-z0-9-]+)",
            ocr_text,
            flags=re.IGNORECASE,
        )
        vendor_match = re.search(
            r"vendor\s*[:\-]?\s*(.+?)(?=\s*(?:date|total|amount|invoice)\s*[:\-]?|$)",
            ocr_text,
            flags=re.IGNORECASE,
        )
        return {
            "vendor": vendor_match.group(1).strip() if vendor_match else "",
            "amount": _extract_amount(ocr_text),
            "invoice_number": invoice_match.group(1).strip() if invoice_match else "",
            "date": _extract_date(ocr_text),
        }

    if document_type == "receipt":
        store_match = re.search(
            r"(?:store|shop|merchant)\s*[:\-]?\s*(.+?)(?=\s*(?:date|total|amount)\s*[:\-]?|$)",
            ocr_text,
            flags=re.IGNORECASE,
        )
        return {
            "store_name": store_match.group(1).strip() if store_match else "",
            "amount": _extract_amount(ocr_text),
            "date": _extract_date(ocr_text),
        }

    if document_type == "id_card":
        name_match = re.search(r"(?:name)\s*[:\-]?\s*([A-Za-z ]+)", ocr_text, flags=re.IGNORECASE)
        id_match = re.search(
            r"(?:id\s*(?:no|number)?)\s*[:#-]?\s*([A-Za-z0-9-]+)",
            ocr_text,
            flags=re.IGNORECASE,
        )
        dob_match = re.search(
            r"(?:date of birth|dob)\s*[:\-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{2,4})",
            ocr_text,
            flags=re.IGNORECASE,
        )
        return {
            "name": name_match.group(1).strip() if name_match else "",
            "id_number": id_match.group(1).strip() if id_match else "",
            "date_of_birth": dob_match.group(1).strip() if dob_match else "",
        }

    if document_type == "contract":
        party_a_match = re.search(
            r"party\s*a\s*[:\-]?\s*(.+?)(?=\s*(?:party\s*b|date)\s*[:\-]?|$)",
            ocr_text,
            flags=re.IGNORECASE,
        )
        party_b_match = re.search(
            r"party\s*b\s*[:\-]?\s*(.+?)(?=\s*(?:party\s*a|date)\s*[:\-]?|$)",
            ocr_text,
            flags=re.IGNORECASE,
        )
        return {
            "party_a": party_a_match.group(1).strip() if party_a_match else "",
            "party_b": party_b_match.group(1).strip() if party_b_match else "",
            "date": _extract_date(ocr_text),
        }

    return {
        "summary": ocr_text[:200].strip(),
    }