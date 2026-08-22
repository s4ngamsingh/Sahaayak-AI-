import React from 'react';
import { 
  Building2, 
  Languages, 
  PhoneCall, 
  ShieldCheck, 
  PlusCircle, 
  Search, 
  LayoutDashboard, 
  BarChart3, 
  Bot, 
  Sparkles,
  Volume2,
  User,
  LogOut,
  Fingerprint,
  Smartphone,
  Bell
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../data/mockData';
import { SupportedLanguage } from '../types';
import { AuthUser } from './AuthModal';

interface HeaderProps {
  currentTab: 'LODGE' | 'TRACK' | 'OFFICER' | 'DEPARTMENTS' | 'ANALYTICS';
  onSelectTab: (tab: 'LODGE' | 'TRACK' | 'OFFICER' | 'DEPARTMENTS' | 'ANALYTICS') => void;
  selectedLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onOpenChatbot: () => void;
  onOpenFastAPIDocs?: () => void;
  onOpenAuthModal?: () => void;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
  totalGrievancesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  selectedLanguage,
  onLanguageChange,
  onOpenChatbot,
  onOpenFastAPIDocs,
  onOpenAuthModal,
  currentUser,
  onLogout,
  totalGrievancesCount,
}) => {
  return (
    <header id="main-header" className="bg-white/[0.03] text-white border-b border-white/10 backdrop-blur-xl sticky top-0 z-40 shadow-2xl">
      {/* Top National Civic Ribbon */}
      <div className="bg-white/[0.02] px-4 py-1.5 border-b border-white/10 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-300 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-medium text-indigo-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Citizen Grievance & Redressal Portal • Digital India</span>
          </div>
          <span className="hidden md:inline text-white/20">|</span>
          <span className="hidden lg:inline text-slate-400 text-[11px]">
            PostgreSQL DB • SMS/WhatsApp/Push Alerts • Aadhaar/OTP Secured
          </span>
        </div>

        {/* Emergency & Notifications Status */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden sm:flex items-center gap-1.5 text-rose-300 font-semibold bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 backdrop-blur-sm text-[11px]">
            <PhoneCall className="w-3 h-3 text-rose-400 animate-pulse" />
            <span>Helplines: 112 (Civic) | 1912 (Discom) | 1916 (Jal Board)</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center justify-between">
          <div 
            onClick={() => onSelectTab('LODGE')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-all">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span>Sahaayak AI</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 uppercase tracking-wider">
                    समाधान
                  </span>
                </h1>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  PostgreSQL Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">
                Multilingual Voice AI • Aadhaar/OTP • Municipal Redressal
              </p>
            </div>
          </div>

          {/* Mobile Auth Button */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-xl text-xs">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-200 truncate max-w-[80px]">{currentUser.name}</span>
                <button onClick={onLogout} className="text-slate-400 hover:text-rose-400 ml-1">
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="bg-indigo-500 text-white text-xs px-2.5 py-1.5 rounded-xl font-semibold shadow-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav id="header-nav-tabs" className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          <button
            id="nav-tab-lodge"
            onClick={() => onSelectTab('LODGE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              currentTab === 'LODGE'
                ? 'bg-white/15 text-white font-semibold border border-white/20 shadow-lg shadow-black/20 backdrop-blur-md'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lodge Grievance</span>
          </button>

          <button
            id="nav-tab-track"
            onClick={() => onSelectTab('TRACK')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              currentTab === 'TRACK'
                ? 'bg-white/15 text-white font-semibold border border-white/20 shadow-lg shadow-black/20 backdrop-blur-md'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-indigo-400" />
            <span>Track & Chat</span>
          </button>

          <button
            id="nav-tab-officer"
            onClick={() => onSelectTab('OFFICER')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              currentTab === 'OFFICER'
                ? 'bg-white/15 text-white font-semibold border border-white/20 shadow-lg shadow-black/20 backdrop-blur-md'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
            <span>Officer Triage</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-indigo-300 font-mono border border-white/10">
              {totalGrievancesCount}
            </span>
          </button>

          <button
            id="nav-tab-departments"
            onClick={() => onSelectTab('DEPARTMENTS')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              currentTab === 'DEPARTMENTS'
                ? 'bg-white/15 text-white font-semibold border border-white/20 shadow-lg shadow-black/20 backdrop-blur-md'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Departments</span>
          </button>

          <button
            id="nav-tab-analytics"
            onClick={() => onSelectTab('ANALYTICS')}
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              currentTab === 'ANALYTICS'
                ? 'bg-white/15 text-white font-semibold border border-white/20 shadow-lg shadow-black/20 backdrop-blur-md'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Insights</span>
          </button>

          {/* Desktop Language Selector */}
          <div className="hidden md:flex items-center gap-1.5 ml-1 pl-2 border-l border-white/10">
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <select
              id="language-selector-dropdown"
              value={selectedLanguage.code}
              onChange={(e) => {
                const found = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value);
                if (found) onLanguageChange(found);
              }}
              className="bg-white/5 backdrop-blur-md text-xs text-slate-200 font-medium py-1 px-2.5 rounded-xl border border-white/10 hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-indigo-400 cursor-pointer transition-all"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-slate-950 text-white">
                  {lang.nativeName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Auth Button (Citizen / Officer) */}
          {onOpenAuthModal && (
            <div className="hidden md:flex items-center">
              {currentUser ? (
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white font-medium">
                    {currentUser.role === 'OFFICER' ? `👮 ${currentUser.name}` : `🇮🇳 ${currentUser.name}`}
                  </span>
                  <button
                    onClick={onLogout}
                    title="Logout session"
                    className="text-slate-400 hover:text-rose-400 ml-1 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-500/30 backdrop-blur-md shadow-sm transition-all"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Aadhaar / OTP Login</span>
                </button>
              )}
            </div>
          )}

          {/* FastAPI Dev Console */}
          {onOpenFastAPIDocs && (
            <button
              id="btn-fastapi-explorer"
              onClick={onOpenFastAPIDocs}
              className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-emerald-500/30 backdrop-blur-md shadow-sm transition-all"
              title="Inspect FastAPI OpenAPI & Pydantic Backend"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px]">FastAPI Backend</span>
            </button>
          )}

          {/* AI Sahayak Assistant Float Launcher */}
          <button
            id="btn-open-sahayak-chat"
            onClick={onOpenChatbot}
            className="flex items-center gap-1.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md shadow-indigo-500/25 transition-all"
            title="Open AI Sahayak Chatbot"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
