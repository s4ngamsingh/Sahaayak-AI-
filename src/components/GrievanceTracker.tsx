import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Volume2, 
  Star, 
  ArrowRight, 
  RefreshCw, 
  ShieldAlert, 
  FileCheck, 
  ChevronRight,
  ExternalLink,
  Info,
  Calendar
} from 'lucide-react';
import { Grievance, GrievanceMessage, GrievanceStatus } from '../types';
import { speakText } from '../utils/speech';

interface GrievanceTrackerProps {
  initialTrackingId?: string;
  onRefreshList?: () => void;
}

const LIFECYCLE_STEPS: Array<{ key: GrievanceStatus; label: string; desc: string }> = [
  { key: 'SUBMITTED', label: 'Lodged', desc: 'Received & Logged' },
  { key: 'AI_TRIAGED', label: 'AI Triaged', desc: 'Dept & SLA Assigned' },
  { key: 'ASSIGNED', label: 'Dispatched', desc: 'Ward Officer Assigned' },
  { key: 'IN_INSPECTION', label: 'Inspection', desc: 'On-site Assessment' },
  { key: 'WORK_IN_PROGRESS', label: 'In Progress', desc: 'Repair Crew on Spot' },
  { key: 'RESOLVED', label: 'Resolved', desc: 'Work Completed' },
  { key: 'CITIZEN_VERIFIED', label: 'Citizen Verified', desc: 'Feedback Received' },
];

export const GrievanceTracker: React.FC<GrievanceTrackerProps> = ({ initialTrackingId }) => {
  const [searchQuery, setSearchQuery] = useState(initialTrackingId || '');
  const [grievance, setGrievance] = useState<Grievance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Recent grievances list
  const [recentGrievances, setRecentGrievances] = useState<Grievance[]>([]);

  // 1-on-1 Chat message state
  const [citizenMsg, setCitizenMsg] = useState('');
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // Feedback State
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch recent list
  const fetchRecentGrievances = async () => {
    try {
      const res = await fetch('/api/grievances');
      if (res.ok) {
        const data = await res.json();
        setRecentGrievances(data);
        // If initial ID provided, select it, else select first item
        if (initialTrackingId) {
          const found = data.find((g: Grievance) => g.trackingNumber.toLowerCase() === initialTrackingId.toLowerCase());
          if (found) setGrievance(found);
        } else if (data.length > 0 && !grievance) {
          setGrievance(data[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load recent grievances', e);
    }
  };

  useEffect(() => {
    fetchRecentGrievances();
  }, [initialTrackingId]);

  // Handle Search
  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/grievances?query=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error('Search failed');
      const data: Grievance[] = await res.json();

      if (data.length > 0) {
        setGrievance(data[0]);
      } else {
        setError(`No grievance found matching "${q}". Please check the ID or mobile number.`);
        setGrievance(null);
      }
    } catch (err: any) {
      setError('Could not connect to tracking system. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom of message thread
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [grievance?.messages]);

  // Send message in 1-on-1 thread
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenMsg.trim() || !grievance) return;

    setIsSendingMsg(true);
    try {
      const res = await fetch(`/api/grievances/${grievance.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'CITIZEN',
          senderName: grievance.citizenName || 'Citizen',
          text: citizenMsg.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');
      const updatedData = await res.json();
      
      // Update local grievance
       if (updatedData.message) {
        setGrievance((prev) => (prev ? { ...prev, messages: [...(prev.messages || []), updatedData.message] } : null));
      } else if (updatedData.allMessages) {
        setGrievance((prev) => (prev ? { ...prev, messages: updatedData.allMessages } : null));
      }
      setCitizenMsg('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsSendingMsg(false);
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievance) return;

    setIsSubmittingFeedback(true);
    try {
      const res = await fetch(`/api/grievances/${grievance.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CITIZEN_VERIFIED',
          citizenFeedback: {
            rating: feedbackRating,
            comment: feedbackComment || 'Citizen marked issue verified and resolved.',
            submittedAt: new Date().toISOString(),
          },
        }),
      });

      if (!res.ok) throw new Error('Feedback update failed');
      const updated = await res.json();
      setGrievance(updated);
      setFeedbackSuccess(true);
    } catch (err) {
      console.error('Feedback error:', err);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Calculate current step index
  const getStepIndex = (status: GrievanceStatus) => {
    const map: Record<GrievanceStatus, number> = {
      SUBMITTED: 0,
      AI_TRIAGED: 1,
      ASSIGNED: 2,
      IN_INSPECTION: 3,
      WORK_IN_PROGRESS: 4,
      RESOLVED: 5,
      CITIZEN_VERIFIED: 6,
      REOPENED: 4,
    };
    return map[status] ?? 0;
  };

  return (
    <div id="grievance-tracker-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Search Header */}
      <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl mb-6">
        <div className="max-w-3xl">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Real-time Grievance Tracking & 1-on-1 Officer Redressal</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track live progress, SLA deadlines, inspection notes, and chat directly with your assigned Ward Officer.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-2 mt-4"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                id="tracker-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Complaint Token (e.g. GRV-2026-PWD-8492) or Mobile Number..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-colors disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Track Complaint</span>
            </button>
          </form>

          {/* Quick Select Buttons */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
            <span className="text-slate-400">Sample Active Complaints:</span>
            {recentGrievances.slice(0, 4).map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setSearchQuery(g.trackingNumber);
                  setGrievance(g);
                }}
                className={`px-3 py-1 rounded-xl border font-mono transition-all backdrop-blur-md ${
                  grievance?.id === g.id
                    ? 'bg-indigo-500/25 text-indigo-300 border-indigo-500/50 font-bold shadow-sm'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {g.trackingNumber} ({g.departmentId.replace('DEPT_', '')})
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {grievance && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Timeline, Officer Details, Evidence (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Grievance Overview Card */}
            <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30 backdrop-blur-md">
                      {grievance.trackingNumber}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold backdrop-blur-md ${
                      grievance.urgency === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      grievance.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      Urgency: {grievance.urgency}
                    </span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1.5 leading-snug">
                    {grievance.title}
                  </h3>
                </div>

                {/* Status Badge */}
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Current Status</span>
                  <span className="inline-block mt-0.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase backdrop-blur-md">
                    {grievance.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* SLA & Department Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-white/[0.02] rounded-xl border border-white/10 text-xs backdrop-blur-md">
                <div>
                  <span className="text-slate-400 block">Department</span>
                  <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    {grievance.departmentName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location & Exact Ward</span>
                  <span className="font-semibold text-white flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{grievance.locality ? `${grievance.locality}, ` : ''}{grievance.wardNumber}</span>
                  </span>
                  {grievance.coordinates && (
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      GPS: {grievance.coordinates.lat.toFixed(5)}°, {grievance.coordinates.lng.toFixed(5)}°
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block">Resolution SLA Deadline</span>
                  <span className="font-semibold text-indigo-300 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(grievance.slaDeadline).toLocaleDateString()} ({new Date(grievance.slaDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                  </span>
                </div>
              </div>

              {/* Citizen Original Dictation vs Translation */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs sm:text-sm">
                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold text-indigo-300">Citizen Dictated Input ({grievance.dictatedLanguage}):</span>
                    <button
                      onClick={() => speakText(grievance.rawCitizenInput)}
                      className="text-slate-400 hover:text-indigo-300 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Audio Playback</span>
                    </button>
                  </div>
                  <p className="text-slate-200 italic font-normal">"{grievance.rawCitizenInput}"</p>
                </div>

                {grievance.translatedSummary && grievance.translatedSummary !== grievance.rawCitizenInput && (
                  <div className="bg-white/[0.015] p-3 rounded-xl border border-white/10 text-xs backdrop-blur-md">
                    <span className="font-semibold text-slate-400 block mb-0.5">Standard Administrative Translation:</span>
                    <p className="text-slate-300 font-medium">{grievance.translatedSummary}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Lifecycle Timeline Stepper */}
            <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl">
              <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Grievance Redressal Lifecycle Timeline</span>
              </h4>

              {/* Visual Multi-step Bar */}
              <div className="hidden sm:grid grid-cols-7 gap-1 mb-6 text-center">
                {LIFECYCLE_STEPS.map((step, idx) => {
                  const currentIdx = getStepIndex(grievance.status);
                  const isCompleted = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all backdrop-blur-md ${
                          isCurrent
                            ? 'bg-indigo-500 text-white ring-4 ring-indigo-500/25 shadow-lg shadow-indigo-500/30'
                            : isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/10 text-slate-500 border border-white/10'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span className={`text-[11px] font-semibold mt-1.5 leading-tight ${isCurrent ? 'text-indigo-300' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Event Log */}
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-white/10">
                {(grievance.timeline || []).map((event, eidx) => (
                  <div key={event.id || eidx} className="relative flex items-start gap-3 pl-1">
                    <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-indigo-400 z-10 flex-shrink-0 mt-0.5 backdrop-blur-md">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    </div>
                    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3 flex-1 text-xs sm:text-sm backdrop-blur-md">
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-100">{event.title}</span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(event.timestamp).toLocaleDateString()} at {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs">{event.description}</p>
                      <div className="mt-1.5 text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <span>Action by:</span>
                        <span className="text-indigo-300">{event.actor} ({event.actorRole})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Officer & Ward Details */}
            {grievance.assignedOfficer && (
              <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 text-indigo-400 backdrop-blur-md">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Assigned Duty Engineer / Inspector</span>
                    <h5 className="font-bold text-white text-base">{grievance.assignedOfficer.name}</h5>
                    <p className="text-xs text-slate-400">{grievance.assignedOfficer.designation} • {grievance.assignedOfficer.unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${grievance.assignedOfficer.phone}`}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-semibold transition-colors backdrop-blur-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Officer ({grievance.assignedOfficer.phone})</span>
                  </a>
                </div>
              </div>
            )}

            {/* Citizen Feedback Form if Resolved */}
            {(grievance.status === 'RESOLVED' || grievance.status === 'CITIZEN_VERIFIED') && (
              <div className="bg-white/[0.04] border border-emerald-500/30 backdrop-blur-xl rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                  <FileCheck className="w-4 h-4" />
                  <span>Citizen Satisfaction Verification</span>
                </div>

                {grievance.citizenFeedback || feedbackSuccess ? (
                  <div className="p-3 bg-white/[0.02] rounded-xl border border-emerald-500/30 text-xs text-slate-300 backdrop-blur-md">
                    <div className="flex items-center gap-1 text-amber-400 font-bold mb-1">
                      {[...Array(grievance.citizenFeedback?.rating || feedbackRating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400" />
                      ))}
                      <span className="ml-2 text-emerald-300">Feedback Recorded</span>
                    </div>
                    <p className="italic">"{grievance.citizenFeedback?.comment || feedbackComment}"</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitFeedback} className="space-y-3">
                    <p className="text-xs text-slate-300">
                      The department has marked this issue as resolved. Please rate your satisfaction to close or verify the ticket:
                    </p>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className={`p-1 rounded transition-transform ${star <= feedbackRating ? 'text-amber-400 scale-110' : 'text-slate-600'}`}
                        >
                          <Star className={`w-5 h-5 ${star <= feedbackRating ? 'fill-amber-400' : ''}`} />
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Optional comment on quality of work / speed..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-md"
                    />

                    <button
                      type="submit"
                      disabled={isSubmittingFeedback}
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2"
                    >
                      {isSubmittingFeedback ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Submit Citizen Verification</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Column: 1-on-1 Officer-Citizen Conversation Thread (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="bg-white/[0.04] border border-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col h-[640px] overflow-hidden">
              {/* Chat Header */}
              <div className="p-4 bg-white/[0.02] border-b border-white/10 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">1-on-1 Redressal Thread</h4>
                    <p className="text-[11px] text-slate-400">Live communication with Ward Engineer</p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 backdrop-blur-md">
                  Active
                </span>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/[0.01]">
                {(grievance.messages || []).map((msg) => {
                  const isCitizen = msg.sender === 'CITIZEN';
                  const isAI = msg.sender === 'AI_SYSTEM';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCitizen ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-0.5">
                        <span className="font-semibold text-slate-300">{msg.senderName}</span>
                        <span>•</span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed backdrop-blur-md ${
                          isCitizen
                            ? 'bg-indigo-600/40 border border-indigo-400/30 text-white font-medium rounded-tr-none shadow-md shadow-indigo-950/40'
                            : isAI
                            ? 'bg-white/10 text-indigo-200 border border-indigo-400/30 rounded-tl-none'
                            : 'bg-white/10 text-slate-100 border border-white/10 rounded-tl-none'
                        }`}
                      >
                        <p>{msg.text}</p>
                        
                        {/* Audio play button for officer/AI message */}
                        {!isCitizen && (
                          <button
                            onClick={() => speakText(msg.text)}
                            className="mt-1.5 text-[10px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                          >
                            <Volume2 className="w-3 h-3" />
                            <span>Listen</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white/[0.02] border-t border-white/10 flex items-center gap-2 backdrop-blur-md">
                <input
                  type="text"
                  value={citizenMsg}
                  onChange={(e) => setCitizenMsg(e.target.value)}
                  placeholder="Type message to Ward Engineer / Officer..."
                  className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
                />
                <button
                  type="submit"
                  disabled={isSendingMsg || !citizenMsg.trim()}
                  className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-colors disabled:opacity-50 shadow-md shadow-indigo-500/25"
                  title="Send message"
                >
                  {isSendingMsg ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
