import random
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, Query, Path, status
from backend.models import (
    GrievanceCreate,
    GrievanceUpdate,
    GrievanceResponse,
    PostMessageRequest,
    GeminiAnalysisRequest,
    GeminiAnalysisResponse,
    ChatRequest,
    ChatResponse,
    DepartmentInfo,
)
from backend.database import DEPARTMENTS_DATA, grievances_db
from backend.gemini_service import analyze_grievance_with_gemini, generate_sahayak_chat_reply, get_gemini_client
from google.genai import types

router = APIRouter(prefix="/api", tags=["Civic Grievance & AI Services"])

# 1. Health check
@router.get("/health", summary="Health check")
def health_check():
    return {
        "status": "ok",
        "framework": "FastAPI 0.115+",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "gemini_configured": get_gemini_client() is not None,
    }

# 2. Departments
@router.get("/departments", response_model=List[DepartmentInfo], summary="List all integrated departments")
def get_departments():
    return DEPARTMENTS_DATA

# 3. List & Filter Grievances
@router.get("/grievances", response_model=List[GrievanceResponse], summary="Query citizen grievances")
def list_grievances(
    department: Optional[str] = Query(None, description="Department ID (e.g. DEPT_PWD)"),
    status: Optional[str] = Query(None, description="Grievance Status filter"),
    urgency: Optional[str] = Query(None, description="Urgency level filter"),
    phone: Optional[str] = Query(None, description="Complainant phone number substring"),
    query: Optional[str] = Query(None, description="Text search token"),
):
    results = list(grievances_db)
    if department and department != "ALL":
        results = [g for g in results if g.get("departmentId") == department]
    if status and status != "ALL":
        results = [g for g in results if g.get("status") == status]
    if urgency and urgency != "ALL":
        results = [g for g in results if g.get("urgency") == urgency]
    if phone:
        results = [g for g in results if phone.strip() in g.get("citizenPhone", "")]
    if query:
        q = query.lower().strip()
        results = [
            g for g in results
            if q in g.get("trackingNumber", "").lower()
            or q in g.get("title", "").lower()
            or q in g.get("locality", "").lower()
            or q in g.get("wardNumber", "").lower()
            or q in g.get("citizenName", "").lower()
            or q in g.get("rawCitizenInput", "").lower()
        ]

    # Sort newest first
    results.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    return results

# 4. Get Single Grievance Detail
@router.get("/grievances/{identifier}", response_model=GrievanceResponse, summary="Retrieve grievance by ID or Token")
def get_grievance(identifier: str = Path(..., description="Grievance ID or Tracking Number")):
    match = next(
        (g for g in grievances_db if g["id"].lower() == identifier.lower() or g["trackingNumber"].lower() == identifier.lower()),
        None
    )
    if not match:
        raise HTTPException(status_code=404, detail=f"Grievance with identifier '{identifier}' was not found.")
    return match

# 5. Create / Lodge New Grievance
@router.post("/grievances", response_model=GrievanceResponse, status_code=status.HTTP_201_CREATED, summary="Lodge new citizen grievance")
def create_grievance(payload: GrievanceCreate):
    dept_code_map = {
        "DEPT_SAN": "SAN",
        "DEPT_WAT": "WAT",
        "DEPT_PWD": "PWD",
        "DEPT_ELE": "ELE",
        "DEPT_TRF": "TRF",
        "DEPT_HLT": "HLT",
        "DEPT_POL": "POL",
    }
    dept_suffix = dept_code_map.get(payload.departmentId, "GEN")
    random_num = random.randint(1000, 9999)
    tracking_number = f"GRV-2026-{dept_suffix}-{random_num}"

    dept = next((d for d in DEPARTMENTS_DATA if d["id"] == payload.departmentId), DEPARTMENTS_DATA[0])
    urgency = payload.urgency or "MEDIUM"
    sla_hours = dept["emergencySlaHours"] if urgency == "CRITICAL" else dept["standardSlaHours"]
    now = datetime.utcnow()
    sla_deadline = now + timedelta(hours=sla_hours)

    initial_timeline = [
        {
            "id": f"t-{int(now.timestamp())}-1",
            "timestamp": now.isoformat() + "Z",
            "status": "SUBMITTED",
            "title": "Grievance Lodged by Citizen",
            "description": f"Lodged in {payload.dictatedLanguage or 'Voice/Text'}. Assigned unique Token: {tracking_number}.",
            "actor": payload.citizenName or "Citizen",
            "actorRole": "CITIZEN",
        },
        {
            "id": f"t-{int(now.timestamp())}-2",
            "timestamp": (now + timedelta(seconds=1)).isoformat() + "Z",
            "status": "AI_TRIAGED",
            "title": f"AI Triaged to {dept['name']}",
            "description": f"Classified under '{payload.category or dept['commonCategories'][0]}'. Priority: {urgency}. SLA: {sla_hours} hours.",
            "actor": "Samadhan AI Engine",
            "actorRole": "AI_SYSTEM",
        },
    ]

    initial_messages = [
        {
            "id": f"m-{int(now.timestamp())}-1",
            "sender": "AI_SYSTEM",
            "senderName": "Samadhan AI Sahayak",
            "timestamp": now.isoformat() + "Z",
            "text": f"Namaste {payload.citizenName or 'Citizen'}, your grievance has been lodged successfully with Ticket ID: {tracking_number}. It is assigned to {dept['name']}. We will provide updates in real time.",
        }
    ]

    new_record: Dict[str, Any] = {
        "id": tracking_number,
        "trackingNumber": tracking_number,
        "title": payload.title or f"{dept['name']} Grievance",
        "rawCitizenInput": payload.rawCitizenInput,
        "dictatedLanguage": payload.dictatedLanguage or "English",
        "translatedSummary": payload.translatedSummary or payload.rawCitizenInput,
        "departmentId": dept["id"],
        "departmentName": dept["name"],
        "category": payload.category or dept["commonCategories"][0],
        "subCategory": payload.subCategory or "Standard Redressal",
        "urgency": urgency,
        "status": "AI_TRIAGED",
        "citizenName": payload.citizenName or "Anonymous Citizen",
        "citizenPhone": payload.citizenPhone or "+91 90000 00000",
        "citizenEmail": payload.citizenEmail or "",
        "isAnonymous": payload.isAnonymous or False,
        "wardNumber": payload.wardNumber or "Ward 12 (Central)",
        "locality": payload.locality or "City Central Area",
        "landmark": payload.landmark or "",
        "city": payload.city or "Metro City",
        "pincode": payload.pincode or "560001",
        "attachments": payload.attachments or [],
        "createdAt": now.isoformat() + "Z",
        "updatedAt": now.isoformat() + "Z",
        "slaDeadline": sla_deadline.isoformat() + "Z",
        "isSlaBreached": False,
        "timeline": initial_timeline,
        "messages": initial_messages,
        "aiSentimentScore": payload.aiSentimentScore or -0.5,
        "aiConfidenceScore": payload.aiConfidenceScore or 0.95,
        "aiSuggestedActions": payload.aiSuggestedActions or [
            f"Assign to {dept['name']} Ward Field Officer",
            "Send automated SMS acknowledgment to citizen",
            "Schedule on-site technical inspection",
        ],
        "assignedOfficer": {
            "name": dept["nodalOfficer"]["name"],
            "designation": dept["nodalOfficer"]["designation"],
            "phone": dept["nodalOfficer"]["contact"],
            "ward": payload.wardNumber or "Ward 12",
            "unit": f"{dept['name']} Rapid Action Cell",
        },
    }

    grievances_db.insert(0, new_record)
    return new_record

# 6. Update Grievance Status
@router.patch("/grievances/{identifier}", response_model=GrievanceResponse, summary="Update status or add officer notes")
def update_grievance(
    identifier: str = Path(..., description="Grievance ID or Tracking Number"),
    payload: GrievanceUpdate = ...,
):
    idx = next(
        (i for i, g in enumerate(grievances_db) if g["id"].lower() == identifier.lower() or g["trackingNumber"].lower() == identifier.lower()),
        -1
    )
    if idx == -1:
        raise HTTPException(status_code=404, detail="Grievance not found")

    current = grievances_db[idx]
    now = datetime.utcnow().isoformat() + "Z"
    current["updatedAt"] = now

    if payload.status and payload.status != current.get("status"):
        current["status"] = payload.status
        if payload.status == "RESOLVED":
            current["resolvedAt"] = now

        current["timeline"].append({
            "id": f"t-{int(datetime.utcnow().timestamp())}",
            "timestamp": now,
            "status": payload.status,
            "title": f"Status Updated to {payload.status}",
            "description": payload.resolutionNote or f"Updated by {payload.officerName or 'Officer'}.",
            "actor": payload.officerName or "Ward Officer",
            "actorRole": "CITIZEN" if payload.status == "CITIZEN_VERIFIED" else "WARD_OFFICER",
        })

        current["messages"].append({
            "id": f"m-{int(datetime.utcnow().timestamp())}",
            "sender": "AI_SYSTEM",
            "senderName": "Samadhan Alert",
            "timestamp": now,
            "text": f"Status update: Ticket marked as [{payload.status}]. {payload.resolutionNote or ''}",
        })

    if payload.citizenFeedback:
        current["citizenFeedback"] = payload.citizenFeedback.model_dump()
        current["timeline"].append({
            "id": f"t-fb-{int(datetime.utcnow().timestamp())}",
            "timestamp": now,
            "status": current["status"],
            "title": f"Citizen Feedback: {payload.citizenFeedback.rating}★",
            "description": payload.citizenFeedback.comment or "Rating submitted.",
            "actor": current.get("citizenName", "Citizen"),
            "actorRole": "CITIZEN",
        })

    if payload.isSlaBreached is not None:
        current["isSlaBreached"] = payload.isSlaBreached

    grievances_db[idx] = current
    return current

# 7. Post Message to Thread
@router.post("/grievances/{identifier}/messages", summary="Add message to grievance conversation thread")
async def post_message(
    identifier: str = Path(..., description="Grievance ID or Tracking Number"),
    payload: PostMessageRequest = ...,
):
    idx = next(
        (i for i, g in enumerate(grievances_db) if g["id"].lower() == identifier.lower() or g["trackingNumber"].lower() == identifier.lower()),
        -1
    )
    if idx == -1:
        raise HTTPException(status_code=404, detail="Grievance not found")

    now = datetime.utcnow().isoformat() + "Z"
    new_msg = {
        "id": f"msg-{int(datetime.utcnow().timestamp())}",
        "sender": payload.sender,
        "senderName": payload.senderName or ("Citizen" if payload.sender == "CITIZEN" else "Ward Engineer"),
        "timestamp": now,
        "text": payload.text,
        "attachmentUrl": payload.attachmentUrl,
        "originalLanguage": payload.language,
    }
    grievances_db[idx]["messages"].append(new_msg)
    grievances_db[idx]["updatedAt"] = now

    # Automated intelligent officer reply if citizen asks question
    if payload.sender == "CITIZEN":
        client = get_gemini_client()
        g = grievances_db[idx]
        if client:
            try:
                resp = client.models.generate_content(
                    model="gemini-3.7-flash",
                    contents=f"You are the Ward Engineer ({g.get('assignedOfficer', {}).get('name', 'Duty Engineer')}) for {g.get('departmentName')}. Citizen '{g.get('citizenName')}' on Ticket '{g.get('trackingNumber')}' says: \"{payload.text}\". Reply briefly in 2 reassuring sentences.",
                )
                if resp.text:
                    grievances_db[idx]["messages"].append({
                        "id": f"msg-{int(datetime.utcnow().timestamp()) + 1}",
                        "sender": "OFFICER",
                        "senderName": f"{g.get('assignedOfficer', {}).get('name', 'Ward Engineer')} ({g.get('departmentName')})",
                        "timestamp": (datetime.utcnow() + timedelta(seconds=1)).isoformat() + "Z",
                        "text": resp.text.strip(),
                    })
            except Exception as e:
                print(f"Gemini officer auto reply error: {e}")

    return {
        "success": True,
        "message": new_msg,
        "allMessages": grievances_db[idx]["messages"],
    }

# 8. Gemini Analyze Grievance
@router.post("/gemini/analyze-grievance", response_model=GeminiAnalysisResponse, summary="Multilingual AI Grievance Analyzer")
async def analyze_grievance(payload: GeminiAnalysisRequest):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text is required for grievance analysis.")
    res = await analyze_grievance_with_gemini(
        text=payload.text,
        input_language=payload.inputLanguage,
        departments_info=DEPARTMENTS_DATA,
    )
    return res

# 9. Gemini Conversational Assistant (Sahayak Chat)
@router.post("/gemini/chat", response_model=ChatResponse, summary="Conversational AI Sahayak Chat")
async def chat_with_sahayak(payload: ChatRequest):
    msg_dicts = [m.model_dump() for m in payload.messages]
    res = await generate_sahayak_chat_reply(
        messages=msg_dicts,
        context_grievances=payload.currentGrievancesContext or grievances_db[:5],
        language=payload.language,
    )
    return res

# 10. Analytics
@router.get("/analytics", summary="Civic intelligence and SLA compliance statistics")
def get_analytics():
    total = len(grievances_db)
    resolved = sum(1 for g in grievances_db if g.get("status") in ["RESOLVED", "CITIZEN_VERIFIED"])
    in_progress = sum(1 for g in grievances_db if g.get("status") in ["WORK_IN_PROGRESS", "IN_INSPECTION"])
    pending = sum(1 for g in grievances_db if g.get("status") in ["SUBMITTED", "AI_TRIAGED", "ASSIGNED"])
    critical = sum(1 for g in grievances_db if g.get("urgency") == "CRITICAL")
    sla_breached = sum(1 for g in grievances_db if g.get("isSlaBreached"))

    by_department = []
    for dept in DEPARTMENTS_DATA:
        d_items = [g for g in grievances_db if g.get("departmentId") == dept["id"]]
        d_resolved = sum(1 for g in d_items if g.get("status") in ["RESOLVED", "CITIZEN_VERIFIED"])
        rate = round((d_resolved / len(d_items)) * 100) if d_items else 100
        by_department.append({
            "id": dept["id"],
            "name": dept["name"],
            "hindiName": dept["hindiName"],
            "total": len(d_items),
            "resolved": d_resolved,
            "pending": len(d_items) - d_resolved,
            "resolutionRate": rate,
            "avgResolutionHours": dept["standardSlaHours"] * 0.7,
        })

    ward_hotspots = [
        {"ward": "Ward 42 (Indiranagar North)", "total": 4, "critical": 2, "topIssue": "Road Potholes & PWD", "lat": 12.9784, "lng": 77.6408},
        {"ward": "Ward 18 (Malleshwaram West)", "total": 3, "critical": 1, "topIssue": "Drinking Water Pipeline", "lat": 13.0031, "lng": 77.5644},
        {"ward": "Ward 65 (Ballygunge Central)", "total": 2, "critical": 0, "topIssue": "Sanitation & Waste Dump", "lat": 22.5186, "lng": 88.3582},
        {"ward": "Ward 07 (Civil Lines)", "total": 3, "critical": 2, "topIssue": "Electric Wire Hazard", "lat": 28.6791, "lng": 77.2289},
        {"ward": "Ward 12 (Central Zone)", "total": 2, "critical": 0, "topIssue": "Traffic Signals & Drainage", "lat": 19.0760, "lng": 72.8777},
    ]

    return {
        "summary": {
            "total": total,
            "resolved": resolved,
            "inProgress": in_progress,
            "pendingTriage": pending,
            "criticalCount": critical,
            "slaBreachedCount": sla_breached,
            "overallResolutionRate": round((resolved / total) * 100) if total > 0 else 95,
            "avgRedressalTimeHours": 18.4,
            "languagesSupported": 12,
        },
        "byDepartment": by_department,
        "wardHotspots": ward_hotspots,
    }
