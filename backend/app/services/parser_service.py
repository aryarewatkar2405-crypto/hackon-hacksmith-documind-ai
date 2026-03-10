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


def _contains_any(text: str, keywords: list[str]) -> int:
    return sum(1 for keyword in keywords if keyword in text)


def detect_document_type(ocr_text: str, filename: str = "", content_type: str = "") -> str:
    normalized_text = (ocr_text or "").lower()
    normalized_filename = (filename or "").lower()
    normalized_content_type = (content_type or "").lower()

    scores = {
        "invoice": 0,
        "receipt": 0,
        "contract": 0,
        "id_card": 0,
    }

    invoice_keywords = [
        "invoice",
        "tax invoice",
        "bill",
        "invoice no",
        "invoice number",
        "amount due",
        "gst",
        "subtotal",
    ]
    receipt_keywords = [
        "receipt",
        "payment received",
        "transaction",
        "paid",
        "thank you",
        "cash",
        "upi",
        "pos",
    ]
    contract_keywords = [
        "agreement",
        "contract",
        "terms and conditions",
        "party a",
        "party b",
        "clause",
        "effective date",
    ]
    id_keywords = [
        "identity",
        "id card",
        "date of birth",
        "dob",
        "id number",
        "government",
        "passport",
        "aadhaar",
        "driving licence",
    ]

    # Base keyword scoring from OCR text.
    scores["invoice"] += _contains_any(normalized_text, invoice_keywords) * 3
    scores["receipt"] += _contains_any(normalized_text, receipt_keywords) * 3
    scores["contract"] += _contains_any(normalized_text, contract_keywords) * 3
    scores["id_card"] += _contains_any(normalized_text, id_keywords) * 3

    # Structural regex boosts for common formats.
    if re.search(r"invoice\s*(?:no|number)?\s*[:#-]?\s*[a-z0-9-]+", normalized_text, flags=re.IGNORECASE):
        scores["invoice"] += 6
    if re.search(r"receipt\s*(?:no|number)?\s*[:#-]?\s*[a-z0-9-]+", normalized_text, flags=re.IGNORECASE):
        scores["receipt"] += 6
    if re.search(r"party\s*a|party\s*b|agreement\s+between", normalized_text, flags=re.IGNORECASE):
        scores["contract"] += 6
    if re.search(r"(?:date of birth|dob)\s*[:\-]", normalized_text, flags=re.IGNORECASE):
        scores["id_card"] += 6

    # Amount/date combo tends to indicate invoice/receipt documents.
    if _extract_amount(ocr_text):
        scores["invoice"] += 2
        scores["receipt"] += 2
    if _extract_date(ocr_text):
        scores["invoice"] += 1
        scores["receipt"] += 1
        scores["contract"] += 1

    # Filename fallback (important when OCR is weak/unavailable).
    if any(keyword in normalized_filename for keyword in ["invoice", "bill", "proforma"]):
        scores["invoice"] += 4
    if any(keyword in normalized_filename for keyword in ["receipt", "payment", "txn", "transaction"]):
        scores["receipt"] += 4
    if any(keyword in normalized_filename for keyword in ["contract", "agreement", "terms"]):
        scores["contract"] += 4
    if any(keyword in normalized_filename for keyword in ["id", "aadhaar", "passport", "license", "licence"]):
        scores["id_card"] += 4

    # Small bias for likely text-heavy contracts in PDF form.
    if normalized_content_type == "application/pdf" and len(normalized_text) > 500:
        scores["contract"] += 1

    best_type = max(scores, key=scores.get)
    best_score = scores[best_type]

    # Use a confidence floor to avoid random false positives.
    if best_score < 3:
        return "general_document"

    return best_type


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
        "amount": _extract_amount(ocr_text),
        "date": _extract_date(ocr_text),
        "summary": ocr_text[:200].strip(),
    }