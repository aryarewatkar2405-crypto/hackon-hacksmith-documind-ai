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
    normalized = ocr_text.lower()

    # Detect invoice-like documents by invoice-specific keywords.
    if any(keyword in normalized for keyword in ["invoice", "invoice no", "invoice number"]):
        return "invoice"

    # Detect receipts by common receipt terms.
    if any(keyword in normalized for keyword in ["receipt", "cash memo", "bill"]):
        return "receipt"

    # Detect ID cards by broad identity keywords (Government / ID / Card).
    if any(
        keyword in normalized
        for keyword in ["government", "id", "card", "id card", "date of birth", "dob", "id no", "id number"]
    ):
        return "id_card"

    # Detect contracts by agreement/party language.
    if any(keyword in normalized for keyword in ["agreement", "contract", "party a", "party b"]):
        return "contract"

    # Fallback when no strong keyword match is found.
    return "general_document"


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