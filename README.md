# DocuMind AI

Hackathon MVP monorepo with independent frontend and backend apps.

## Project Structure

```text
hackon-documind-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   ├── services/
│   │   └── models/
│   ├── main.py
│   └── requirements.txt
└── README.md
```

## Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Run Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --app-dir "C:\\Project\\hackon-documind-ai\\backend" --host 127.0.0.1 --port 8000
```

Backend runs at `http://localhost:8000`.

### Windows quick start (one command)

From project root:

```powershell
.\start_backend.ps1
```

This uses a backend watchdog that auto-restarts the server if it crashes.
Logs are written in `backend/logs/`.

### One-click start (frontend + backend)

Double-click this file from project root:

```text
start_app.bat
```

Or run with PowerShell:

```powershell
.\start_app.ps1
```

### Windows stop backend (one command)

From project root:

```powershell
.\stop_backend.ps1
```

Avoid using `--reload` in this environment because it can stop unexpectedly.

### Alternative (inside backend folder)

```powershell
cd backend
.\start_backend.ps1
```

## Health Endpoint

- `GET /api/health`
- Response: `{ "status": "running" }`
