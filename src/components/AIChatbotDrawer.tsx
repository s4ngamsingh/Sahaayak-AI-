import React, { useState, useEffect, useRef } from 'react';
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
  PhoneCall
} from 'lucide-react';
import { ChatMessage, SupportedLanguage } from '../types';
import { speakText, startSpeechRecognition } from '../utils/speech';

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
      content: `Namaste! I am **Samadhan AI Sahayak** (समाधान सहायक). You can dictate or type your complaint in **${selectedLanguage.nativeName}**, track an existing ticket, or find emergency civic contacts. How can I help you today?`,
      timestamp: new Date().toISOString(),
      suggestedQuickReplies: [
        'Lodge a new civic complaint',
        'Check status of GRV-2026-PWD-8492',
        'Find Ward Nodal Officer',
        'Emergency Civic Helplines',
      ],
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');
    setIsTyping(true);

    try {
      // Check if user is asking to track a specific ticket
      const tokenMatch = query.match(/GRV-2026-[A-Z]{3,4}-\d{4}/i);

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
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
          : data.suggestedQuickReplies || ['Lodge this complaint now', 'Emergency Numbers'],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `I received your message regarding "${query}". You can easily lodge this grievance using our multilingual voice form, or provide your ticket ID to track progress.`,
        timestamp: new Date().toISOString(),
        suggestedQuickReplies: ['Lodge this grievance now', 'Track existing ticket'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleMic = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      startSpeechRecognition(
        selectedLanguage.speechCode,
        (transcript) => {
          setInputVal(transcript);
        },
        (err) => {
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div id="ai-sahayak-drawer" className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[#020617]/85 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 bg-white/[0.03] border-b border-white/10 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center p-0.5 shadow-md backdrop-blur-md">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <span>Samadhan AI Sahayak</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 backdrop-blur-md">
                Gemini 3.7
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Multilingual Civic Voice Assistant</p>
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
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white/[0.01] text-xs sm:text-sm">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 leading-relaxed backdrop-blur-md ${
                  isUser
                    ? 'bg-indigo-600/40 border border-indigo-400/30 text-white font-medium rounded-tr-none shadow-md shadow-indigo-950/40'
                    : 'bg-white/10 text-slate-100 border border-white/10 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* TTS button for assistant response */}
                {!isUser && (
                  <button
                    onClick={() => speakText(msg.content, selectedLanguage.speechCode)}
                    className="mt-2 text-[10px] text-slate-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>Read Aloud</span>
                  </button>
                )}
              </div>

              {/* Quick Reply Pills */}
              {!isUser && msg.suggestedQuickReplies && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {msg.suggestedQuickReplies.map((pill, pidx) => (
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
                        if (pill.toLowerCase().includes('lodge') && onLodgeFromChat) {
                          onLodgeFromChat(inputVal || 'Water or road problem');
                          onClose();
                          return;
                        }
                        handleSend(pill);
                      }}
                      className="text-[11px] bg-white/5 hover:bg-white/15 text-indigo-300 hover:text-white px-2.5 py-1 rounded-xl border border-white/10 backdrop-blur-md transition-colors"
                    >
                      {pill}
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
            <span>Sahayak AI is processing in {selectedLanguage.name}...</span>
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
