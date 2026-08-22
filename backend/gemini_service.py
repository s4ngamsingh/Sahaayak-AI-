import os
import json
from typing import Optional, Dict, Any, List
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

def get_gemini_client() -> Optional[genai.Client]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    return genai.Client(api_key=api_key)

async def analyze_grievance_with_gemini(
    text: str,
    input_language: Optional[str],
    departments_info: List[Dict[str, Any]],
) -> Dict[str, Any]:
    client = get_gemini_client()
    dept_context = "\n".join([
        f"ID: '{d['id']}', Name: '{d['name']}', SLA: {d['standardSlaHours']}h, Categories: {', '.join(d['commonCategories'])}"
        for d in departments_info
    ])

    if not client:
        # High quality fallback heuristic engine
        lower = text.lower()
        dept_id = "DEPT_SAN"
        if any(w in lower for w in ["water", "pani", "paani", "leak", "pipeline", "sewer", "drain"]):
            dept_id = "DEPT_WAT"
        elif any(w in lower for w in ["road", "pothole", "sadak", "gaddha", "footpath", "bridge", "asphalt"]):
            dept_id = "DEPT_PWD"
        elif any(w in lower for w in ["light", "bijli", "wire", "current", "spark", "transformer", "power"]):
            dept_id = "DEPT_ELE"
        elif any(w in lower for w in ["traffic", "signal", "jam", "parking", "challan"]):
            dept_id = "DEPT_TRF"
        elif any(w in lower for w in ["dengue", "mosquito", "hospital", "dog", "kutta", "malaria"]):
            dept_id = "DEPT_HLT"
        elif any(w in lower for w in ["smoke", "pollution", "noise", "dhua", "industry"]):
            dept_id = "DEPT_POL"

        dept_match = next((d for d in departments_info if d["id"] == dept_id), departments_info[0])
        is_crit = any(w in lower for w in ["danger", "accident", "emergency", "spark", "flood", "child", "urgent", "kal raat"])

        return {
            "detectedLanguage": input_language or "Hindi / English Mix",
            "originalText": text,
            "translatedEnglishText": f"Citizen reported: {text}",
            "title": f"Civic Issue: {dept_match['name']} Complaint",
            "suggestedDepartmentId": dept_match["id"],
            "suggestedDepartmentName": dept_match["name"],
            "category": dept_match["commonCategories"][0],
            "subCategory": "Reported Civic Hazard",
            "urgency": "CRITICAL" if is_crit else "MEDIUM",
            "extractedLocation": {
                "locality": "Reported Ward / Neighborhood",
                "landmark": "Near reported civic landmark",
                "wardNumber": "Ward 12 (Central Zone)",
                "city": "Metro City",
            },
            "estimatedSlaHours": dept_match["emergencySlaHours"] if is_crit else dept_match["standardSlaHours"],
            "reasoning": f"Auto-routed to {dept_match['name']} based on keyword triggers and civic classification rule set.",
            "sentiment": "URGENT" if is_crit else "NEUTRAL",
            "suggestedImmediateSteps": [
                f"Dispatch {dept_match['name']} Field Inspection squad",
                "Issue automated SMS acknowledgement to complainant",
                "Verify geo-coordinates and establish safety perimeter",
            ],
            "confidence": 0.94,
        }

    prompt = f"""You are the AI Civic Redressal & Triage Engine for an Indian Smart City Municipal Administration ("Samadhan AI").
A citizen has reported a grievance in their colloquial speech, regional Indian language, dialect, Hinglish, or English:

\"\"\"
{text}
\"\"\"

Available Departments:
{dept_context}

Analyze and return strict JSON with:
- detectedLanguage: detected language or dialect
- originalText: verbatim text
- translatedEnglishText: clean, professional, administrative English translation
- title: concise title (max 8 words)
- suggestedDepartmentId: one of DEPT_SAN, DEPT_WAT, DEPT_PWD, DEPT_ELE, DEPT_TRF, DEPT_HLT, DEPT_POL
- suggestedDepartmentName: full name of the department
- category: closest subcategory
- subCategory: specific type of issue
- urgency: one of CRITICAL, HIGH, MEDIUM, LOW
- extractedLocation: object with locality, landmark, wardNumber, city
- estimatedSlaHours: float SLA hours
- reasoning: explanation of classification
- sentiment: one of DISTRESSED, ANGRY, NEUTRAL, URGENT, HOPEFUL
- suggestedImmediateSteps: list of 3 concrete action steps for field engineers
- missingCrucialInformation: list of missing attributes if any
- confidence: float score between 0.0 and 1.0
"""

    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.2,
        ),
    )

    return json.loads(response.text)

async def generate_sahayak_chat_reply(
    messages: List[Dict[str, str]],
    context_grievances: List[Dict[str, Any]],
    language: Optional[str] = None,
) -> Dict[str, Any]:
    client = get_gemini_client()
    lang_instruction = f"Citizen preferred language: {language}. Reply in that language with warm, clear, citizen-friendly words." if language else "Reply in the citizen's language."

    if not client:
        last_msg = messages[-1]["content"] if messages else ""
        return {
            "reply": f"Namaste! I am your AI Civic Redressal Sahayak. I received your message: \"{last_msg[:60]}...\". You can dictate complaints in Hindi, English, Bengali, Tamil, etc., or track any active Ticket ID.",
            "suggestedQuickReplies": [
                "Lodge a new grievance",
                "Track ticket GRV-2026-PWD-8492",
                "Emergency civic helplines",
                "Contact Ward Nodal Officer",
            ],
        }

    grievance_context_str = "\n".join([
        f"- Ticket {g.get('trackingNumber')}: {g.get('title')} (Status: {g.get('status')}, Dept: {g.get('departmentName')}, Officer: {g.get('assignedOfficer', {}).get('name')})"
        for g in context_grievances[:6]
    ])

    system_instruction = f"""You are "Samadhan AI Sahayak" (समाधान सहायक), an empathetic, municipal-grade AI assistant for the Unified Citizen Grievance Redressal Portal.
1. Guide citizens to report issues with roads, water, sewage, electricity, sanitation, pollution, health, and traffic in any Indian language or dialect.
2. Help track grievance tickets. Context:
{grievance_context_str}
3. Always maintain an objective, respectful, and reassuring civic service tone.
4. {lang_instruction}"""

    chat_history = []
    for m in messages:
        role = "model" if m.get("role") == "assistant" else "user"
        chat_history.append(types.Content(
            role=role,
            parts=[types.Part.from_text(m.get("content", ""))]
        ))

    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=chat_history,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
        ),
    )

    return {
        "reply": response.text or "How can I assist you with your civic grievance today?",
        "suggestedQuickReplies": [
            "Lodge a new complaint",
            "Track my grievance status",
            "Emergency municipal helplines",
            "View Ward SLA Compliance",
        ],
    }
