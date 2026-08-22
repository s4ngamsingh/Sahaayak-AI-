# 🚀 Samadhan AI - FastAPI Backend Documentation

This backend is built with **FastAPI**, **Pydantic v2**, and the modern **Google Gen AI SDK** for multilingual civic grievance triage.

---

## 📦 Architecture & Directory Structure

```
backend/
├── main.py              # FastAPI Application entry point & OpenAPI config
├── models.py            # Strict Pydantic v2 schemas and validation models
├── routes.py            # RESTful APIRouter endpoints for complaints, triage & analytics
├── gemini_service.py    # Asynchronous Gemini 3.7 Flash triage & conversational Sahayak AI
├── database.py          # Seed departmental registry & grievance records
└── requirements.txt     # Python dependencies
```

---

## ⚡ Quickstart

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Configure Environment
Set your `GEMINI_API_KEY` in `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run FastAPI Server
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 📑 Interactive Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 🛡️ Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check and Gemini configuration status |
| `GET` | `/api/departments` | Integrated municipal departments and nodal officer registry |
| `GET` | `/api/grievances` | Query complaints with filters (department, status, urgency, search) |
| `POST` | `/api/grievances` | Lodge new citizen grievance with automatic SLA calculation |
| `GET` | `/api/grievances/{id}` | Retrieve specific complaint timeline and message thread |
| `PATCH` | `/api/grievances/{id}` | Update complaint lifecycle status, officer notes, or citizen ratings |
| `POST` | `/api/grievances/{id}/messages` | Post message to citizen-officer thread with intelligent AI reply |
| `POST` | `/api/gemini/analyze-grievance` | Multilingual NLP voice/text entity extractor and classifier |
| `POST` | `/api/gemini/chat` | Conversational Sahayak AI chat with regional dialects |
| `GET` | `/api/analytics` | Real-time SLA compliance, resolution leaderboard, and hotspot analytics |
