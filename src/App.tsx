import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LodgeGrievanceForm } from './components/LodgeGrievanceForm';
import { GrievanceTracker } from './components/GrievanceTracker';
import { OfficerDashboard } from './components/OfficerDashboard';
import { DepartmentDirectory } from './components/DepartmentDirectory';
import { CityAnalyticsView } from './components/CityAnalyticsView';
import { AIChatbotDrawer } from './components/AIChatbotDrawer';
import { FastAPIDocsModal } from './components/FastAPIDocsModal';
import { AuthModal, AuthUser } from './components/AuthModal';
import { Grievance, SupportedLanguage } from './types';
import { SUPPORTED_LANGUAGES } from './data/mockData';
import { 
  Building2, 
  Sparkles, 
  PhoneCall, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare, 
  Bot, 
  HelpCircle,
  Clock,
  Mic,
  Database,
  Bell,
  HardDrive
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'LODGE' | 'TRACK' | 'OFFICER' | 'DEPARTMENTS' | 'ANALYTICS'>('LODGE');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(SUPPORTED_LANGUAGES[0]); // Default Hindi
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isFastAPIDocsOpen, setIsFastAPIDocsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTrackingId, setActiveTrackingId] = useState<string>('GRV-2026-PWD-8492');
  const [totalGrievances, setTotalGrievances] = useState<number>(4);

  // Restore user session from localStorage
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('samadhan_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.warn('Error loading user session', e);
    }
  }, []);

  // Load initial total grievances count
  const refreshGrievancesCount = async () => {
    try {
      const res = await fetch('/api/grievances');
      if (res.ok) {
        const data = await res.json();
        setTotalGrievances(data.length);
      }
    } catch (e) {
      console.warn('Error fetching grievances count', e);
    }
  };

  useEffect(() => {
    refreshGrievancesCount();
  }, []);

  const handleGrievanceCreated = (newGrievance: Grievance) => {
    setActiveTrackingId(newGrievance.trackingNumber);
    refreshGrievancesCount();
  };

  const handleSwitchToTrack = (trackingNumber: string) => {
    setActiveTrackingId(trackingNumber);
    setCurrentTab('TRACK');
  };

  const handleLodgeForDepartment = (deptId: string) => {
    setCurrentTab('LODGE');
  };

  const handleLogout = () => {
    localStorage.removeItem('samadhan_jwt');
    localStorage.removeItem('samadhan_user');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white">
      {/* Frosted Ambient Blurred Background Spheres */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] bg-blue-600/15 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] bg-indigo-600/15 rounded-full blur-[130px]" />
        <div className="absolute top-[25%] right-[5%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] bg-emerald-500/10 rounded-full blur-[110px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Main Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenFastAPIDocs={() => setIsFastAPIDocsOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        totalGrievancesCount={totalGrievances}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 z-10 relative">
        {currentTab === 'LODGE' && (
          <LodgeGrievanceForm
            selectedLanguage={selectedLanguage}
            onGrievanceCreated={handleGrievanceCreated}
            onSwitchToTrack={handleSwitchToTrack}
          />
        )}

        {currentTab === 'TRACK' && (
          <GrievanceTracker
            initialTrackingId={activeTrackingId}
            onRefreshList={refreshGrievancesCount}
          />
        )}

        {currentTab === 'OFFICER' && (
          <OfficerDashboard
            onSelectGrievanceToTrack={handleSwitchToTrack}
          />
        )}

        {currentTab === 'DEPARTMENTS' && (
          <DepartmentDirectory
            onLodgeForDepartment={handleLodgeForDepartment}
          />
        )}

        {currentTab === 'ANALYTICS' && (
          <CityAnalyticsView />
        )}
      </main>

      {/* Floating Action Trigger for AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="btn-floating-sahayak-ai"
          onClick={() => setIsChatbotOpen(true)}
          className="group flex items-center gap-2.5 bg-indigo-500/90 hover:bg-indigo-500 text-white px-5 py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-xl shadow-indigo-500/25 border border-indigo-400/30 backdrop-blur-xl hover:scale-105 transition-all duration-200"
        >
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold tracking-wide">Sahaayak AI (सहायक)</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Auth Modal (Mobile OTP, Aadhaar OTP, Officer Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* AI Chatbot Drawer */}
      <AIChatbotDrawer
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        selectedLanguage={selectedLanguage}
        onLodgeFromChat={(prefillText) => {
          setCurrentTab('LODGE');
        }}
        onTrackFromChat={(token) => {
          handleSwitchToTrack(token);
        }}
      />

      {/* FastAPIDocsModal */}
      <FastAPIDocsModal
        isOpen={isFastAPIDocsOpen}
        onClose={() => setIsFastAPIDocsOpen(false)}
      />

      {/* Frosted Glass Footer */}
      <footer className="bg-white/[0.02] backdrop-blur-xl border-t border-white/10 text-xs text-slate-400 py-6 px-4 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="font-medium text-slate-300">
              Sahaayak AI • Citizen Grievance Portal & Redressal Grid
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-400 text-center sm:text-right">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              PostgreSQL Cloud SQL
            </span>
            <span className="flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-indigo-400" />
              SMS • WhatsApp • FCM Push
            </span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              Firebase Storage
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
