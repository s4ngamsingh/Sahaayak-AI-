import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.routes import router
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Samadhan AI - Unified Civic Grievance & Triage API",
    description="Production-grade FastAPI backend for multilingual AI citizen grievance routing, real-time lifecycle tracking, and departmental nodal officer dispatch.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Router
app.include_router(router)

@app.get("/")
def root():
    return {
        "service": "Samadhan AI Municipal Engine",
        "framework": "FastAPI",
        "docs": "/docs",
        "redoc": "/redoc",
        "api_health": "/api/health",
        "openapi_schema": "/openapi.json"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=True)
