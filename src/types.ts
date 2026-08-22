export type GrievanceStatus = 
  | 'SUBMITTED' 
  | 'AI_TRIAGED' 
  | 'ASSIGNED' 
  | 'IN_INSPECTION' 
  | 'WORK_IN_PROGRESS' 
  | 'RESOLVED' 
  | 'CITIZEN_VERIFIED' 
  | 'REOPENED';

export type UrgencyLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  status: GrievanceStatus;
  title: string;
  description: string;
  actor: string;
  actorRole: 'AI_SYSTEM' | 'CITIZEN' | 'WARD_OFFICER' | 'FIELD_CREW' | 'DEPARTMENT_HEAD';
  evidenceUrl?: string;
  metadata?: Record<string, string>;
}

export interface GrievanceMessage {
  id: string;
  sender: 'CITIZEN' | 'OFFICER' | 'AI_SYSTEM';
  senderName: string;
  timestamp: string;
  text: string;
  translatedText?: string;
  originalLanguage?: string;
  attachmentUrl?: string;
}

export interface DepartmentInfo {
  id: string;
  code: string;
  name: string;
  hindiName: string;
  icon: string;
  description: string;
  standardSlaHours: number;
  emergencySlaHours: number;
  helpline: string;
  nodalOfficer: {
    name: string;
    designation: string;
    contact: string;
    email: string;
  };
  commonCategories: string[];
}

export interface Grievance {
  id: string; // e.g. GRV-2026-PWD-8492
  trackingNumber: string;
  title: string;
  rawCitizenInput: string;
  dictatedLanguage: string;
  translatedSummary: string;
  departmentId: string;
  departmentName: string;
  category: string;
  subCategory?: string;
  urgency: UrgencyLevel;
  status: GrievanceStatus;
  
  // Citizen details
  citizenName: string;
  citizenPhone: string;
  citizenEmail?: string;
  isAnonymous?: boolean;
  
  // Geolocation & Ward
  wardNumber: string;
  locality: string;
  landmark?: string;
  city: string;
  pincode?: string;
  coordinates?: { lat: number; lng: number };
  
  // Attachments
  attachments: Array<{
    id: string;
    url: string;
    name: string;
    type: 'IMAGE' | 'AUDIO' | 'DOCUMENT';
  }>;
  
  // Timestamps & SLA
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  resolvedAt?: string;
  isSlaBreached: boolean;
  
  // Assignment
  assignedOfficer?: {
    name: string;
    designation: string;
    phone: string;
    ward: string;
    unit: string;
  };
  
  // Life-cycle
  timeline: TimelineEvent[];
  messages: GrievanceMessage[];
  
  // AI Metrics
  aiSentimentScore?: number; // -1 to +1
  aiConfidenceScore?: number; // 0 to 1
  aiSuggestedActions?: string[];
  citizenFeedback?: {
    rating: number; // 1 to 5
    comment: string;
    submittedAt: string;
  };
}

export interface AIAnalysisResult {
  detectedLanguage: string;
  originalText: string;
  translatedEnglishText: string;
  title: string;
  suggestedDepartmentId: string;
  suggestedDepartmentName: string;
  category: string;
  subCategory: string;
  urgency: UrgencyLevel;
  extractedLocation: {
    locality: string;
    landmark?: string;
    wardNumber?: string;
    city?: string;
  };
  estimatedSlaHours: number;
  reasoning: string;
  sentiment: 'DISTRESSED' | 'ANGRY' | 'NEUTRAL' | 'URGENT' | 'HOPEFUL';
  suggestedImmediateSteps: string[];
  missingCrucialInformation?: string[];
  confidence: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  language?: string;
  detectedIntent?: 'LODGE_GRIEVANCE' | 'CHECK_STATUS' | 'ESCALATE' | 'GENERAL_FAQ' | 'EMERGENCY_CONTACT';
  structuredData?: Partial<AIAnalysisResult> | { grievanceId?: string; statusData?: Partial<Grievance> };
  suggestedQuickReplies?: string[];
}

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
  voicePrompt: string;
}
