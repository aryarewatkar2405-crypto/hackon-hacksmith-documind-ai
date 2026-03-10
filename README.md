# DocuMind AI

DocuMind AI is a hackathon-ready document intelligence dashboard that can:

- Upload image/PDF documents
- Extract text using OCR
- Classify document type (invoice, receipt, contract, ID card, or general)
- Parse structured fields
- Save document metadata in Firebase Firestore
- Visualize analytics and search documents from the dashboard

## What This App Uses

### Text Extraction Stack

- OCR engine: `pytesseract` (Tesseract OCR)
- Image preprocessing/reading: `Pillow`
- PDF page conversion: `pdf2image`

### ML Model Details

This app currently does **not** use a trained ML/LLM model for classification or field extraction.

It uses:

- OCR text extraction (Tesseract)
- Rule-based parsing (regex)
- Weighted heuristic scoring for document type detection

This makes the system lightweight and predictable for hackathon demos.

## High-Level Architecture

```text
Frontend (React + Vite + Tailwind)
				|
				| HTTP (upload/search/preview)
				v
Backend (FastAPI)
	- /api/upload
	- /api/health
	- /uploads static preview
				|
				| stores metadata
				v
Firebase Firestore (documents collection)
```

## End-to-End Flow

1. User uploads file (JPG/JPEG/PNG/PDF).
2. Backend saves file in `backend/uploads/`.
3. OCR service extracts text:
	 - Image -> Tesseract
	 - PDF -> page images -> Tesseract per page
4. Parser detects document type using:
	 - OCR keywords
	 - structural patterns (regex)
	 - filename fallback signals
	 - content-type context
5. Parser extracts fields based on detected type.
6. Backend returns response with:
	 - `filename`
	 - `preview_url`
	 - `document_type`
	 - `fields`
	 - `extracted_text`
7. Frontend writes document metadata to Firestore.
8. Dashboard shows analytics, table, search results, and preview.

## Document Type Detection Logic

Doc type is determined by weighted scores:

- OCR keyword matches (high weight)
- Regex patterns (e.g., invoice numbers, party A/B, DOB)
- Amount/date presence
- Filename keywords (`invoice`, `receipt`, `contract`, `aadhaar`, etc.)
- Content-type bias for long text-heavy PDFs

If confidence is low, app falls back to `general_document`.

## Field Extraction Rules

Current parser extracts:

- `invoice`: vendor, amount, invoice number, date
- `receipt`: store name, amount, date
- `contract`: party A, party B, date
- `id_card`: name, id number, date of birth
- `general_document`: amount, date, summary

## Firestore Data Shape

Documents are stored in collection `documents`.

```json
{
	"filename": "invoice_001.png",
	"preview_url": "http://127.0.0.1:8000/uploads/invoice_001.png",
	"document_type": "invoice",
	"fields": {
		"vendor": "ABC Traders",
		"amount": "1299",
		"invoice_number": "INV-001",
		"date": "10/03/2026"
	},
	"created_at": "Firestore Timestamp"
}
```

## Frontend Features

- Sidebar with navigation and section scrolling
- Upload section with drag-and-drop
- Analytics cards and chart
- Search-or-ask panel:
	- analytics Q&A (`how many`, `highest amount`, `latest document`)
	- document keyword search by filename/type/fields
- Document table with delete action
- Preview panel for images/PDFs
- Uploaded Documents folders page grouped by doc type

## Backend API Endpoints

### `GET /api/health`

Returns:

```json
{ "status": "running" }
```

### `POST /api/upload`

Accepts multipart file upload.

Allowed types:

- `.jpg`, `.jpeg`, `.png`, `.pdf`

Returns parsed response including `preview_url`, `document_type`, and `fields`.

## Project Structure

```text
hackon-documind-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── firebase.js
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   └── services/
│   ├── main.py
│   └── requirements.txt
├── start_app.ps1
├── start_frontend.ps1
├── start_backend.ps1
├── stop_app.ps1
├── stop_frontend.ps1
└── README.md
```

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- Axios
- Firebase Firestore SDK
- Recharts
- React Router

### Backend

- FastAPI
- Uvicorn
- pytesseract
- Pillow
- pdf2image
- python-multipart

## Run the App

### Recommended (Windows one-click)

From project root:

```powershell
.\start_app.ps1
```

This script:

- starts backend watchdog
- starts frontend on fixed port `5173`
- checks readiness before opening browser

To stop everything:

```powershell
.\stop_app.ps1
```

### Manual Frontend

```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Frontend URL: `http://127.0.0.1:5173`

### Manual Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --app-dir "C:\Project\hackon-documind-ai\backend" --host 127.0.0.1 --port 8000
```

Backend URL: `http://127.0.0.1:8000`

## Important Notes

- In this environment, prefer startup scripts over `uvicorn --reload`.
- Preview requires file availability in `backend/uploads/`.
	If old Firestore records point to deleted files, re-upload to restore preview.
- OCR quality depends on image clarity and installed Tesseract runtime.

## Future Improvements

- Add confidence score in UI for extracted fields
- Add full-text search index for faster search at scale
- Add optional ML/LLM extraction layer for complex documents
- Add per-document edit/review workflow for parsed fields
