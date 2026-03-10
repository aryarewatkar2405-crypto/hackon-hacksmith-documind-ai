import re


def parse_invoice_fields(ocr_text: str) -> dict:
    # Rule: match invoice number after labels like "Invoice No", "Invoice Number", or "Inv".
    invoice_match = re.search(
        r"(?:invoice\s*(?:no|number)?|inv)\s*[:#-]?\s*([A-Za-z0-9-]+)",
        ocr_text,
        flags=re.IGNORECASE,
    )

    # Rule: match vendor name after "Vendor" and stop before the next known field label.
    vendor_match = re.search(
        r"vendor\s*[:\-]?\s*(.+?)(?=\s*(?:date|total|amount|invoice)\s*[:\-]?|$)",
        ocr_text,
        flags=re.IGNORECASE,
    )

    # Rule: match date after "Date" and stop before the next known field label.
    date_match = re.search(
        r"date\s*[:\-]?\s*(.+?)(?=\s*(?:total|amount|vendor|invoice)\s*[:\-]?|$)",
        ocr_text,
        flags=re.IGNORECASE,
    )

    # Rule: match total amount after "Total" or "Amount", allowing optional currency symbols.
    total_match = re.search(
        r"(?:total|amount)\s*[:\-]?\s*(?:₹|rs\.?|inr|\$)?\s*([0-9]+(?:[.,][0-9]{1,2})?)",
        ocr_text,
        flags=re.IGNORECASE,
    )

    return {
        "invoice_number": invoice_match.group(1).strip() if invoice_match else "",
        "vendor": vendor_match.group(1).strip() if vendor_match else "",
        "date": date_match.group(1).strip() if date_match else "",
        "total_amount": total_match.group(1).replace(",", "") if total_match else "",
    }