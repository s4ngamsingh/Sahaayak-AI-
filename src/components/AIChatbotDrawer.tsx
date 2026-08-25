import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  RefreshCw, 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle,
  PhoneCall,
  FilePlus2,
  Search,
  LocateFixed,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { ChatMessage, SupportedLanguage } from '../types';
import { speakText, startSpeechRecognition } from '../utils/speech';
import { getExactCurrentLocation } from '../utils/geolocation';

interface AIChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: SupportedLanguage;
  onLodgeFromChat?: (prefillText: string) => void;
  onTrackFromChat?: (token: string) => void;
}

export const AIChatbotDrawer: React.FC<AIChatbotDrawerProps> = ({
  isOpen,
  onClose,
  selectedLanguage,
  onLodgeFromChat,
  onTrackFromChat,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Namaste! I am **Samadhan AI Sahayak** (समाधान सहायक) powered by Gemini AI. 

I can assist you in **${selectedLanguage.nativeName}** with:
• **Filing Complaints**: Tell me any issue (roads, water, electricity, sanitation) in your own words.
• **Tracking Tickets**: Provide your token number (e.g. \`GRV-2026-PWD-8492\`) for live SLA status.
• **Municipal Inquiries**: Nodal officer contacts, emergency helplines, or municipal services.
• **Instant Location**: Auto-detect your exact GPS coordinates & municipal ward.

How can I help you today?`,
      timestamp: new Date().toISOString(),
      suggestedQuickReplies: [
        '📍 Detect My Exact Location',
        'Lodge a new civic complaint',
        'Check status of GRV-2026-PWD-8492',
        'Find Ward Nodal Officer',
      ],
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isLocating]);

  // Handle GPS location detection directly in AI chat
  const handleDetectLocationInChat = async () => {
    setIsLocating(true);
    setIsTyping(true);

    const userMessage: ChatMessage = {
      id: `user-loc-${Date.now()}`,
      role: 'user',
      content: '📍 Please detect my exact GPS location and ward.',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const loc = await getExactCurrentLocation();
      const assistantMessage: ChatMessage = {
        id: `asst-loc-${Date.now()}`,
        role: 'assistant',
        content: `📍 **Exact GPS Location Detected & Locked**:\n\n• **Street Address**: ${loc.fullAddress}\n• **Locality / Zone**: ${loc.locality}\n• **Municipal Ward**: **${loc.wardNumber}**\n• **PIN Code**: ${loc.pincode || '560038'}\n• **GPS Coordinates**: \`${loc.latitude.toFixed(6)}° N, ${loc.longitude.toFixed(6)}° E\`\n• **Sensor Accuracy**: \`±${loc.accuracy} meters\` (Precision GPS Lock)\n• **Nearest Landmark**: ${loc.landmark || 'Identified Ward Sector'}\n\nYour location has been locked for municipal dispatch. Would you like to lodge your grievance for this exact address?`,
        timestamp: new Date().toISOString(),
        suggestedQuickReplies: [
          `Lodge complaint for ${loc.locality}`,
          'Find Ward Nodal Officer',
          'Check local SLA timings',
        ],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.warn('Chat location detection error:', err);
      const errMessage: ChatMessage = {
        id: `asst-loc-err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Could not lock GPS hardware coordinates (${err.message || 'Permission denied'}). You can still specify your neighborhood or ward number (e.g. *Indiranagar Ward 42*), and I will route it accurately.`,
        timestamp: new Date().toISOString(),
        suggestedQuickReplies: ['Retry GPS Detection', 'Lodge a new civic complaint'],
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsLocating(false);
      setIsTyping(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    // Check if query is asking to detect location
    if (/detect\s*(my)?\s*location|where\s*am\s*i|mera\s*location|mer(i|a)\s*jagah|exact\s*location|gps/i.test(query)) {
      setInputVal('');
      handleDetectLocationInChat();
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputVal('');
    setIsTyping(true);

    try {
      // Check if user is asking to track a specific ticket
      const tokenMatch = query.match(/GRV-2026-[A-Z]{3,4}-\d{4}/i);

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language: selectedLanguage.name,
        }),
      });

      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        suggestedQuickReplies: tokenMatch
          ? [`Track ticket ${tokenMatch[0]}`, 'Lodge another complaint']
          : data.suggestedQuickReplies || ['📍 Detect My Exact Location', 'Lodge this complaint now', 'Emergency Numbers'],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I received your query regarding "${query}". You can easily lodge this civic grievance using our voice form, or provide your ticket ID to track progress.`,
        timestamp: new Date().toISOString(),
        suggestedQuickReplies: ['📍 Detect My Exact Location', 'Lodge this grievance now', 'Track existing ticket'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const chatSpeechRecognizerRef = useRef<{ stop: () => void; abort: () => void } | null>(null);
  const chatBaseInputRef = useRef<string>('');

  const toggleMic = () => {
    if (isRecording) {
      if (chatSpeechRecognizerRef.current) {
        chatSpeechRecognizerRef.current.stop();
        chatSpeechRecognizerRef.current = null;
      }
      setIsRecording(false);
    } else {
      chatBaseInputRef.current = inputVal.trim();
      setIsRecording(true);
      const recognizer = startSpeechRecognition(
        selectedLanguage.speechCode,
        (result) => {
          const combined = chatBaseInputRef.current
            ? `${chatBaseInputRef.current} ${result.fullTranscript}`.trim()
            : result.fullTranscript.trim();
          setInputVal(combined);
        },
        (err) => {
          console.warn('Chat mic error:', err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
      chatSpeechRecognizerRef.current = recognizer;
    }
  };

  if (!isOpen) return null;

  return (
    <div id="ai-sahayak-drawer" className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-[#020617]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 bg-white/[0.03] border-b border-white/10 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center p-0.5 shadow-md backdrop-blur-md">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>Samadhan AI Sahayak</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 font-semibold border border-indigo-500/30 backdrop-blur-md flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                Gemini AI
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Multilingual Civic Assistant ({selectedLanguage.nativeName})</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white/[0.01] text-xs sm:text-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[92%] rounded-2xl p-3.5 leading-relaxed backdrop-blur-md shadow-sm ${
                  isUser
                    ? 'bg-indigo-600/40 border border-indigo-400/30 text-white font-medium rounded-tr-none shadow-indigo-950/40'
                    : 'bg-slate-900/80 text-slate-100 border border-white/10 rounded-tl-none'
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  <div className="prose prose-invert prose-xs max-w-none space-y-2 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ul]:pl-4 [&_li]:my-0.5 [&_strong]:text-indigo-300 [&_code]:bg-white/10 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded text-slate-200">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}

                {/* TTS button for assistant response */}
                {!isUser && (
                  <button
                    onClick={() => speakText(msg.content.replace(/[*#`_]/g, ''), selectedLanguage.speechCode)}
                    className="mt-2.5 text-[10px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Read Aloud</span>
                  </button>
                )}
              </div>

              {/* Quick Reply & Action Pills */}
              {!isUser && msg.suggestedQuickReplies && (
                <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                  {(msg.suggestedQuickReplies || []).map((pill, pidx) => (
                    <button
                      key={pidx}
                      onClick={() => {
                        if (pill.includes('GRV-')) {
                          const match = pill.match(/GRV-2026-[A-Z]{3,4}-\d{4}/i);
                          if (match && onTrackFromChat) {
                            onTrackFromChat(match[0]);
                            onClose();
                            return;
                          }
                        }
                        if ((pill.toLowerCase().includes('lodge') || pill.includes('शिकायत') || pill.includes('दर्ज')) && onLodgeFromChat) {
                          // Extract context if available
                          const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content || '';
                          onLodgeFromChat(lastUser);
                          onClose();
                          return;
                        }
                        handleSend(pill);
                      }}
                      className="text-[11px] bg-white/5 hover:bg-white/15 text-indigo-300 hover:text-white px-2.5 py-1 rounded-xl border border-white/10 backdrop-blur-md transition-all flex items-center gap-1 text-left"
                    >
                      {pill.includes('GRV-') ? (
                        <Search className="w-3 h-3 text-indigo-400 inline" />
                      ) : pill.toLowerCase().includes('lodge') || pill.includes('शिकायत') ? (
                        <FilePlus2 className="w-3 h-3 text-emerald-400 inline" />
                      ) : (
                        <ArrowRight className="w-2.5 h-2.5 text-slate-400 inline" />
                      )}
                      <span>{pill}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-indigo-300 bg-white/10 px-3 py-2 rounded-xl w-fit border border-white/10 backdrop-blur-md">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            <span>Sahayak AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white/[0.03] border-t border-white/10 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2.5 rounded-xl transition-all backdrop-blur-md ${
              isRecording
                ? 'bg-rose-500/80 text-white animate-pulse border border-rose-400'
                : 'bg-white/10 border border-white/10 text-slate-300 hover:text-indigo-300 hover:bg-white/15'
            }`}
            title="Dictate in your language"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleDetectLocationInChat}
            disabled={isLocating}
            className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-slate-300 hover:text-emerald-400 hover:bg-white/15 transition-all backdrop-blur-md"
            title="Auto-Detect My Exact Location"
          >
            <LocateFixed className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-400' : ''}`} />
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`Ask or dictate in ${selectedLanguage.nativeName}...`}
            className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
          />

          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="p-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-colors disabled:opacity-50 shadow-md shadow-indigo-500/25"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

