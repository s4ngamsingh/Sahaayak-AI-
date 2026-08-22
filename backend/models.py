from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# Enums as Literals for strict OpenAPI schemas
UrgencyLevel = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
GrievanceStatus = Literal[
    "SUBMITTED",
    "AI_TRIAGED",
    "ASSIGNED",
    "IN_INSPECTION",
    "WORK_IN_PROGRESS",
    "RESOLVED",
    "CITIZEN_VERIFIED",
    "REOPENED",
]
SenderRole = Literal["CITIZEN", "OFFICER", "AI_SYSTEM"]

class TimelineEvent(BaseModel):
    id: str
    timestamp: str
    status: GrievanceStatus
    title: str
    description: str
    actor: str
    actorRole: str

class GrievanceMessage(BaseModel):
    id: str
    sender: SenderRole
    senderName: str
    timestamp: str
    text: str
    attachmentUrl: Optional[str] = None
    originalLanguage: Optional[str] = None

class CitizenFeedback(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    submittedAt: str

class AssignedOfficer(BaseModel):
    name: str
    designation: str
    phone: str
    ward: str
    unit: str

class GrievanceBase(BaseModel):
    title: str
    rawCitizenInput: str
    dictatedLanguage: str = "English"
    translatedSummary: Optional[str] = None
    departmentId: str
    departmentName: str
    category: str
    subCategory: str = "Standard Redressal"
    urgency: UrgencyLevel = "MEDIUM"
    citizenName: str = "Anonymous Citizen"
    citizenPhone: str = "+91 90000 00000"
    citizenEmail: Optional[str] = None
    isAnonymous: bool = False
    wardNumber: str = "Ward 12 (Central)"
    locality: str = "City Central Area"
    landmark: Optional[str] = None
    city: str = "Metro City"
    pincode: str = "560001"
    attachments: List[str] = Field(default_factory=list)

class GrievanceCreate(BaseModel):
    title: Optional[str] = None
    rawCitizenInput: str
    dictatedLanguage: Optional[str] = "English"
    translatedSummary: Optional[str] = None
    departmentId: str
    category: Optional[str] = None
    subCategory: Optional[str] = "Standard Redressal"
    urgency: Optional[UrgencyLevel] = "MEDIUM"
    citizenName: Optional[str] = "Anonymous Citizen"
    citizenPhone: Optional[str] = "+91 90000 00000"
    citizenEmail: Optional[str] = ""
    isAnonymous: Optional[bool] = False
    wardNumber: Optional[str] = "Ward 12 (Central)"
    locality: Optional[str] = "City Central Area"
    landmark: Optional[str] = ""
    city: Optional[str] = "Metro City"
    pincode: Optional[str] = "560001"
    attachments: Optional[List[str]] = Field(default_factory=list)
    aiSentimentScore: Optional[float] = -0.5
    aiConfidenceScore: Optional[float] = 0.95
    aiSuggestedActions: Optional[List[str]] = None

class GrievanceUpdate(BaseModel):
    status: Optional[GrievanceStatus] = None
    resolutionNote: Optional[str] = None
    officerName: Optional[str] = None
    citizenFeedback: Optional[CitizenFeedback] = None
    isSlaBreached: Optional[bool] = None

class GrievanceResponse(GrievanceBase):
    id: str
    trackingNumber: str
    status: GrievanceStatus
    createdAt: str
    updatedAt: str
    resolvedAt: Optional[str] = None
    slaDeadline: str
    isSlaBreached: bool = False
    timeline: List[TimelineEvent] = Field(default_factory=list)
    messages: List[GrievanceMessage] = Field(default_factory=list)
    aiSentimentScore: float = -0.5
    aiConfidenceScore: float = 0.95
    aiSuggestedActions: List[str] = Field(default_factory=list)
    assignedOfficer: Optional[AssignedOfficer] = None
    citizenFeedback: Optional[CitizenFeedback] = None

class PostMessageRequest(BaseModel):
    sender: SenderRole = "CITIZEN"
    senderName: Optional[str] = None
    text: str
    attachmentUrl: Optional[str] = None
    language: Optional[str] = None

class ExtractedLocation(BaseModel):
    locality: str
    landmark: Optional[str] = None
    wardNumber: Optional[str] = None
    city: Optional[str] = None

class GeminiAnalysisRequest(BaseModel):
    text: str
    inputLanguage: Optional[str] = None

class GeminiAnalysisResponse(BaseModel):
    detectedLanguage: str
    originalText: str
    translatedEnglishText: str
    title: str
    suggestedDepartmentId: str
    suggestedDepartmentName: str
    category: str
    subCategory: Optional[str] = "General"
    urgency: UrgencyLevel
    extractedLocation: ExtractedLocation
    estimatedSlaHours: float
    reasoning: str
    sentiment: Literal["DISTRESSED", "ANGRY", "NEUTRAL", "URGENT", "HOPEFUL"] = "NEUTRAL"
    suggestedImmediateSteps: List[str]
    missingCrucialInformation: Optional[List[str]] = None
    confidence: float

class ChatMessageItem(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessageItem]
    currentGrievancesContext: Optional[List[Dict[str, Any]]] = None
    language: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    suggestedQuickReplies: List[str] = Field(default_factory=list)

class DepartmentNodalOfficer(BaseModel):
    name: str
    designation: str
    contact: str
    email: str

class DepartmentInfo(BaseModel):
    id: str
    name: str
    hindiName: str
    description: str
    icon: str
    standardSlaHours: int
    emergencySlaHours: int
    commonCategories: List[str]
    nodalOfficer: DepartmentNodalOfficer
    helpline: str
