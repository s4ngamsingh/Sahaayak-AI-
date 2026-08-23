import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Send, 
  UploadCloud, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Building2, 
  ArrowRight, 
  RefreshCw, 
  Volume2, 
  Image as ImageIcon,
  FileText,
  HelpCircle,
  QrCode,
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { AIAnalysisResult, Grievance, SupportedLanguage, UrgencyLevel } from '../types';
import { DEPARTMENTS, SUPPORTED_LANGUAGES } from '../data/mockData';
import { isSpeechRecognitionSupported, speakText, startSpeechRecognition } from '../utils/speech';
import { Civic3DScene } from './Civic3DScene';
import gsap from 'gsap';

interface LodgeGrievanceFormProps {
  selectedLanguage: SupportedLanguage;
  onGrievanceCreated: (newGrievance: Grievance) => void;
  onSwitchToTrack: (trackingNumber: string) => void;
}

const SAMPLE_GRIEVANCE_PRESETS = [
  {
    lang: 'Hindi',
    label: 'बिजली का खुला तार (खतरा)',
    text: 'हमारे मोहल्ले में स्कूल के पास ट्रांसफार्मर से नंगा बिजली का तार टूटकर सड़क पर गिर गया है। कभी भी किसी को करंट लग सकता है। तुरंत लाइन कटवाकर ठीक करवाएं।',
  },
  {
    lang: 'Bhojpuri / Hinglish',
    label: 'सड़क पर भयानक गड्ढे',
    text: 'मेन मार्केट बस स्टैंड के सोझा सड़किया पर बहुते बड़का गड्ढा हो गइल बा। रात के दू गो मोटरगाड़ी गिर के दुर्घटना हो गइल। जल्द से जल्द मरम्मत करवावल जाय।',
  },
  {
    lang: 'English',
    label: 'Drinking Water Pipeline Burst',
    text: 'Main drinking water pipeline is heavily leaking on 5th Cross near post office. Clean potable water is gushing out on road for 6 hours and low pressure in 40 houses.',
  },
  {
    lang: 'Bengali',
    label: 'আবর্জনা ও দুর্গন্ধের স্তূপ',
    text: 'আমাদের ওয়ার্ড ৬২ গলির মুখে গত ৩ দিন ধরে আবর্জনার স্তূপ জমে রয়েছে। পুরসভার গাড়ি আসেনি। দুর্গন্ধে এলাকায় বসবাস করা অসম্ভব হয়ে পড়েছে।',
  },
  {
    lang: 'Tamil',
    label: 'தெருவிளக்குகள் எரியவில்லை',
    text: 'எங்கள் தெருவில் கடந்த ஒரு வாரமாக 4 தெருவிளக்குகள் எரியவில்லை. இரவில் மிகவும் இருட்டாக இருப்பதால் பெண்கள் மற்றும் குழந்தைகள் செல்ல அச்சப்படுகிறார்கள்.',
  },
];

export const LodgeGrievanceForm: React.FC<LodgeGrievanceFormProps> = ({
  selectedLanguage,
  onGrievanceCreated,
  onSwitchToTrack,
}) => {
  // Input State
  const [citizenInput, setCitizenInput] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [locality, setLocality] = useState('');
  const [wardNumber, setWardNumber] = useState('Ward 42 (Indiranagar North)');
  const [landmark, setLandmark] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [manualUrgency, setManualUrgency] = useState<UrgencyLevel>('MEDIUM');
  
  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const speechRecognizerRef = useRef<{ stop: () => void } | null>(null);
  const timerRef = useRef<any>(null);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdGrievance, setCreatedGrievance] = useState<Grievance | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Attachments
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);

  // Handle Speech Recognition toggle
  const toggleRecording = () => {
    if (isRecording) {
      // Stop
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
        speechRecognizerRef.current = null;
      }
      clearInterval(timerRef.current);
      setIsRecording(false);
      if (citizenInput.trim().length > 10) {
        triggerAIAnalysis(citizenInput);
      }
    } else {
      // Start
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      const recognizer = startSpeechRecognition(
        selectedLanguage.speechCode,
        (transcript) => {
          setCitizenInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => {
          console.warn('Speech error, fallback to prompt simulation', err);
          // If browser speech recognition is blocked or unsupported, simulate voice capture
          setIsRecording(false);
          clearInterval(timerRef.current);
        },
        () => {
          setIsRecording(false);
          clearInterval(timerRef.current);
        }
      );

      speechRecognizerRef.current = recognizer;
    }
  };

  // Clean up timer on unmount & run GSAP entrance
  useEffect(() => {
    // GSAP entrance animation for hero and cards
    gsap.fromTo(
      '#hero-banner-anim',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );
    gsap.fromTo(
      '#lodge-3d-scene-container',
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 1, delay: 0.2, ease: 'power3.out' }
    );
    gsap.fromTo(
      '#preset-pills-container',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.7, delay: 0.35, ease: 'power2.out' }
    );

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speechRecognizerRef.current) speechRecognizerRef.current.stop();
    };
  }, []);

  // Trigger Gemini AI Grievance Analysis
  const triggerAIAnalysis = async (textToAnalyze?: string) => {
    const text = textToAnalyze || citizenInput;
    if (!text.trim() || text.length < 5) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/gemini/analyze-grievance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          inputLanguage: selectedLanguage.name,
        }),
      });

      if (!response.ok) {
        throw new Error('AI Analysis request failed');
      }

      const data: AIAnalysisResult = await response.json();
      setAiAnalysis(data);

      // Auto-populate form fields from AI extraction
      if (data.suggestedDepartmentId) {
        setSelectedDeptId(data.suggestedDepartmentId);
      }
      if (data.urgency) {
        setManualUrgency(data.urgency);
      }
      if (data.extractedLocation) {
        if (data.extractedLocation.locality && !locality) {
          setLocality(data.extractedLocation.locality);
        }
        if (data.extractedLocation.landmark && !landmark) {
          setLandmark(data.extractedLocation.landmark);
        }
        if (data.extractedLocation.wardNumber && wardNumber.includes('Ward 42')) {
          setWardNumber(data.extractedLocation.wardNumber);
        }
      }
    } catch (err: any) {
      console.error('Error analyzing grievance:', err);
      setAnalysisError('AI analysis encountered an issue. You can still fill in the details manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Photo Attachment
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Submission
  const handleSubmitGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenInput.trim()) {
      alert('Please dictate or describe your grievance before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const departmentId = selectedDeptId || aiAnalysis?.suggestedDepartmentId || 'DEPT_SAN';
      const dept = DEPARTMENTS.find((d) => d.id === departmentId) || DEPARTMENTS[0];

      const attachments = selectedPhoto
        ? [
            {
              id: `att-${Date.now()}`,
              url: selectedPhoto,
              name: photoName || 'complaint_photo.jpg',
              type: 'IMAGE' as const,
            },
          ]
        : [];

      const payload = {
        title: aiAnalysis?.title || `${dept.name} Grievance`,
        rawCitizenInput: citizenInput,
        dictatedLanguage: aiAnalysis?.detectedLanguage || selectedLanguage.name,
        translatedSummary: aiAnalysis?.translatedEnglishText || citizenInput,
        departmentId: dept.id,
        category: aiAnalysis?.category || dept.commonCategories[0],
        subCategory: aiAnalysis?.subCategory || 'Citizen Grievance',
        urgency: manualUrgency || aiAnalysis?.urgency || 'MEDIUM',
        citizenName: citizenName.trim() || 'Citizen',
        citizenPhone: citizenPhone.trim() || '+91 98765 00000',
        locality: locality.trim() || 'City Ward Area',
        wardNumber: wardNumber.trim() || 'Ward 12 (Central)',
        landmark: landmark.trim(),
        city: 'Metro City',
        attachments,
        aiSentimentScore: aiAnalysis?.sentiment === 'URGENT' || aiAnalysis?.sentiment === 'DISTRESSED' ? -0.8 : -0.3,
        aiConfidenceScore: aiAnalysis?.confidence || 0.95,
        aiSuggestedActions: aiAnalysis?.suggestedImmediateSteps || [
          `Dispatch ${dept.name} Inspection Unit`,
          'Send real-time SMS status alert',
        ],
      };

      const response = await fetch('/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create grievance');
      }

      const created: Grievance = await response.json();
      setCreatedGrievance(created);
      onGrievanceCreated(created);
    } catch (err: any) {
      console.error('Error submitting grievance:', err);
      alert('Could not submit grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTrackingToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // If already lodged, show success card
  if (createdGrievance) {
    return (
      <div id="grievance-success-card" className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white/[0.04] border border-emerald-500/30 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="flex items-center gap-3 text-emerald-400 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 backdrop-blur-md">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Grievance Registered Successfully</span>
              <h2 className="text-2xl font-bold text-white">Complaint Token Generated</h2>
            </div>
          </div>

          {/* Token Banner */}
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 my-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
            <div>
              <p className="text-xs text-slate-400 font-medium">Your Unique Tracking Number</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="font-mono text-2xl sm:text-3xl font-bold text-indigo-300 tracking-wider">
                  {createdGrievance.trackingNumber}
                </span>
                <button
                  onClick={() => copyTrackingToken(createdGrievance.trackingNumber)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 border border-white/10 transition-colors backdrop-blur-md"
                  title="Copy Tracking ID"
                >
                  {copiedToken ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                SMS alert dispatched to <strong className="text-slate-200">{createdGrievance.citizenPhone}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white/[0.04] px-4 py-3 rounded-xl border border-white/10 backdrop-blur-md">
              <QrCode className="w-10 h-10 text-emerald-400" />
              <div className="text-xs text-slate-400">
                <p className="font-semibold text-slate-200">Digital Token QR</p>
                <p>Scan to track status</p>
              </div>
            </div>
          </div>

          {/* Grievance Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white/[0.02] p-4 rounded-xl border border-white/10 mb-6 backdrop-blur-md">
            <div>
              <span className="text-xs text-slate-400">Assigned Department</span>
              <p className="font-semibold text-white flex items-center gap-2 mt-0.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                {createdGrievance.departmentName}
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Resolution SLA Window</span>
              <p className="font-semibold text-emerald-300 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-4 h-4" />
                Due within {createdGrievance.urgency === 'CRITICAL' ? '6-12' : '24-48'} hours
              </p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Ward & Locality</span>
              <p className="font-medium text-slate-200 mt-0.5">{createdGrievance.locality}, {createdGrievance.wardNumber}</p>
            </div>
            <div>
              <span className="text-xs text-slate-400">Urgency Level</span>
              <p className="font-medium mt-0.5">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md ${
                  createdGrievance.urgency === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  createdGrievance.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {createdGrievance.urgency}
                </span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              onClick={() => {
                setCreatedGrievance(null);
                setCitizenInput('');
                setAiAnalysis(null);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors backdrop-blur-md"
            >
              Lodge Another Grievance
            </button>
            <button
              onClick={() => onSwitchToTrack(createdGrievance.trackingNumber)}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
            >
              <span>Track Grievance & Live Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="lodge-grievance-section" className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      {/* Intro hero section with GSAP ID */}
      <div id="hero-banner-anim" className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-2 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Multilingual Voice AI Grievance Assistant • Smart Redressal Grid</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Lodge Your Civic Grievance
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          Dictate or write your complaint naturally in Hindi, English, Bengali, Tamil, Telugu, Bhojpuri, or any regional language. 
          Our AI auto-categorizes the department, extracts location details, calculates SLA timelines, and establishes live officer communication.
        </p>
      </div>

      {/* Interactive 3D Civic Hologram Scene */}
      <div id="lodge-3d-scene-container">
        <Civic3DScene
          activeDeptId={selectedDeptId}
          onSelectDepartment={(deptId) => {
            setSelectedDeptId(deptId);
            const dept = DEPARTMENTS.find((d) => d.id === deptId);
            if (dept) {
              setCitizenInput((prev) =>
                prev.length > 5
                  ? prev
                  : `Reporting issue regarding ${dept.name} (${dept.commonCategories[0]}): `
              );
            }
          }}
        />
      </div>

      {/* Preset Quick-Test Prompts */}
      <div id="preset-pills-container" className="bg-white/[0.035] border border-white/10 rounded-2xl p-4 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Quick Example Scenarios (Click to test instant multilingual dictation):
          </span>
          <span className="text-[11px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">1-click test</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_GRIEVANCE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCitizenInput(preset.text);
                triggerAIAnalysis(preset.text);
              }}
              className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 transition-all text-left flex items-center gap-1.5 backdrop-blur-md"
            >
              <span className="font-semibold text-indigo-300">[{preset.lang}]</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmitGrievance} className="space-y-6">
        {/* Main Voice & Text Input Box */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <span>1. Speak or Write Your Grievance</span>
              <span className="text-xs font-normal text-indigo-300 bg-indigo-500/15 px-2.5 py-0.5 rounded-full border border-indigo-500/25">
                Selected: {selectedLanguage.nativeName} ({selectedLanguage.name})
              </span>
            </label>

            {/* Listen / TTS Button */}
            {citizenInput && (
              <button
                type="button"
                onClick={() => speakText(citizenInput, selectedLanguage.speechCode)}
                className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md"
                title="Listen back"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Listen</span>
              </button>
            )}
          </div>

          {/* Text Area */}
          <div className="relative">
            <textarea
              id="citizen-grievance-input"
              rows={4}
              value={citizenInput}
              onChange={(e) => setCitizenInput(e.target.value)}
              placeholder={selectedLanguage.voicePrompt || "Speak or type your problem in any language (e.g. 'हमारे वार्ड में 3 दिन से पानी की सप्लाई नहीं आ रही है...')..."}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-4 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 text-sm leading-relaxed backdrop-blur-md"
            />
          </div>

          {/* Dictation Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-white/10">
            {/* Mic Toggle Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="btn-voice-dictate"
                onClick={toggleRecording}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md backdrop-blur-md ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse shadow-rose-900/50'
                    : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/25'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    <span>Stop Recording ({recordingSeconds}s)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    <span>Dictate in {selectedLanguage.nativeName}</span>
                  </>
                )}
              </button>

              {isRecording && (
                <div className="flex items-center gap-1 text-xs text-rose-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Listening carefully...</span>
                </div>
              )}
            </div>

            {/* Analyze with AI Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-trigger-ai-analyze"
                disabled={isAnalyzing || !citizenInput.trim()}
                onClick={() => triggerAIAnalysis()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-indigo-300 disabled:opacity-50 text-xs font-semibold border border-white/15 transition-colors backdrop-blur-md shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Auto-Triage</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* AI Triage & Entity Extraction Result Panel */}
        {isAnalyzing && (
          <div className="bg-white/[0.04] border border-indigo-500/30 rounded-2xl p-5 flex items-center justify-center gap-3 text-indigo-300 backdrop-blur-xl animate-pulse">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
            <span className="text-sm font-medium">
              Gemini AI is detecting language, analyzing civic department routing, and estimating SLA...
            </span>
          </div>
        )}

        {aiAnalysis && !isAnalyzing && (
          <div id="ai-analysis-card" className="bg-white/[0.04] border border-indigo-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI Automated Triage & Entity Extraction</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 backdrop-blur-md">
                Language Detected: {aiAnalysis.detectedLanguage}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              {/* English Translated Summary */}
              <div className="bg-white/[0.02] p-4 rounded-xl border border-white/10 backdrop-blur-md">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Administrative English Translation:</span>
                <p className="text-slate-200 font-medium leading-relaxed">{aiAnalysis.translatedEnglishText}</p>
                <div className="mt-2 text-xs text-indigo-300 font-medium">
                  <strong>Title:</strong> {aiAnalysis.title}
                </div>
              </div>

              {/* Department & Urgency */}
              <div className="space-y-2.5">
                <div className="bg-white/[0.02] p-3 rounded-xl border border-white/10 flex items-center justify-between backdrop-blur-md">
                  <div>
                    <span className="text-xs text-slate-400 block">Recommended Department:</span>
                    <span className="font-bold text-white text-sm">{aiAnalysis.suggestedDepartmentName}</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                    {aiAnalysis.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/10 backdrop-blur-md">
                    <span className="text-xs text-slate-400 block">Urgency Rating:</span>
                    <span className={`font-bold text-xs inline-block px-2.5 py-0.5 rounded-full mt-0.5 ${
                      aiAnalysis.urgency === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      aiAnalysis.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {aiAnalysis.urgency}
                    </span>
                  </div>

                  <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/10 backdrop-blur-md">
                    <span className="text-xs text-slate-400 block">Estimated SLA:</span>
                    <span className="font-bold text-emerald-300 text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {aiAnalysis.estimatedSlaHours} Hours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Action Steps */}
            {aiAnalysis.suggestedImmediateSteps && aiAnalysis.suggestedImmediateSteps.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className="text-xs font-semibold text-slate-400 block mb-1.5">Departmental Next Steps:</span>
                <div className="flex flex-wrap gap-2">
                  {(aiAnalysis.suggestedImmediateSteps || []).map((step, sidx) => (
                    <span key={sidx} className="text-xs bg-white/5 text-slate-300 px-2.5 py-1 rounded-xl border border-white/10 backdrop-blur-md">
                      • {step}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Citizen & Location Metadata Form */}
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span>2. Citizen & Location Information</span>
            <span className="text-xs font-normal text-slate-400">(Used for live SMS updates & field dispatch)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {/* Citizen Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Citizen Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
                />
              </div>
            </div>

            {/* Mobile Number for SMS */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Mobile Number (for SMS & WhatsApp Tracking)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
                />
              </div>
            </div>

            {/* Ward Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Ward / Administrative Zone</label>
              <select
                value={wardNumber}
                onChange={(e) => setWardNumber(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-2.5 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
              >
                <option value="Ward 42 (Indiranagar North)" className="bg-slate-950">Ward 42 (Indiranagar North)</option>
                <option value="Ward 18 (Malleshwaram West)" className="bg-slate-950">Ward 18 (Malleshwaram West)</option>
                <option value="Ward 65 (Ballygunge Central)" className="bg-slate-950">Ward 65 (Ballygunge Central)</option>
                <option value="Ward 07 (Civil Lines)" className="bg-slate-950">Ward 07 (Civil Lines)</option>
                <option value="Ward 12 (Central Zone)" className="bg-slate-950">Ward 12 (Central Zone)</option>
                <option value="Ward 29 (South Extension)" className="bg-slate-950">Ward 29 (South Extension)</option>
              </select>
            </div>

            {/* Locality & Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Street / Locality</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 8th Main Market, Sector 4"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
                />
              </div>
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nearest Landmark (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Opposite Central School / SBI Bank ATM"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 px-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
              />
            </div>

            {/* Department Manual Override (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Target Department (Auto-assigned or choose)</label>
              <select
                value={selectedDeptId || aiAnalysis?.suggestedDepartmentId || 'DEPT_SAN'}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/10 rounded-xl py-2.5 px-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id} className="bg-slate-950">
                    {dept.name} ({dept.hindiName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Evidence Upload */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-400 mb-1">Attach Geo-tagged Photo Evidence (Optional)</label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-dashed border-white/20 hover:border-indigo-400 cursor-pointer text-xs font-medium text-slate-300 transition-colors backdrop-blur-md">
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                <span>Upload Photo / File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photoName && (
                <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 backdrop-blur-md">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{photoName} attached</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="submit"
            id="btn-submit-grievance"
            disabled={isSubmitting || !citizenInput.trim()}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2.5 transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Registering & Notifying Department...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Grievance & Generate Tracking ID</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
