import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  UserCheck, 
  Send, 
  FileText, 
  ArrowUpRight, 
  Search, 
  MapPin, 
  Phone, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { Grievance, GrievanceStatus, UrgencyLevel } from '../types';
import { DEPARTMENTS } from '../data/mockData';

interface OfficerDashboardProps {
  onSelectGrievanceToTrack: (id: string) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({ onSelectGrievanceToTrack }) => {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Active selected grievance for officer action
  const [activeGrievance, setActiveGrievance] = useState<Grievance | null>(null);
  const [actionStatus, setActionStatus] = useState<GrievanceStatus>('WORK_IN_PROGRESS');
  const [officerNote, setOfficerNote] = useState('');
  const [officerName, setOfficerName] = useState('Er. Sandeep Verma (Junior Engineer)');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchGrievances = async () => {
    setIsLoading(true);
    try {
      let url = `/api/grievances?`;
      if (selectedDept !== 'ALL') url += `department=${selectedDept}&`;
      if (selectedStatus !== 'ALL') url += `status=${selectedStatus}&`;
      if (selectedUrgency !== 'ALL') url += `urgency=${selectedUrgency}&`;
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      if (res.ok) {
        const data: Grievance[] = await res.json();
        setGrievances(data);
        if (data.length > 0 && !activeGrievance) {
          setActiveGrievance(data[0]);
        }
      }
    } catch (err) {
      console.error('Error loading grievances:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [selectedDept, selectedStatus, selectedUrgency, searchQuery]);

  // Handle Officer Status Update
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGrievance) return;

    setIsUpdating(true);
    try {
      const res = await fetch(`/api/grievances/${activeGrievance.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionStatus,
          resolutionNote: officerNote.trim() || `Status updated to ${actionStatus} during departmental review.`,
          officerName: officerName.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to update grievance');
      const updated = await res.json();
      
      // Update local state
      setActiveGrievance(updated);
      setGrievances((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      setOfficerNote('');
      alert(`Ticket ${updated.trackingNumber} updated to [${actionStatus}] successfully!`);
    } catch (err) {
      console.error('Update error:', err);
      alert('Could not update ticket. Please retry.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Metrics
  const totalCount = grievances.length;
  const criticalCount = grievances.filter((g) => g.urgency === 'CRITICAL').length;
  const resolvedCount = grievances.filter((g) => g.status === 'RESOLVED' || g.status === 'CITIZEN_VERIFIED').length;
  const inProgressCount = grievances.filter((g) => g.status === 'WORK_IN_PROGRESS' || g.status === 'IN_INSPECTION').length;

  return (
    <div id="officer-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <LayoutDashboard className="w-6 h-6 text-indigo-400" />
              <span>Departmental Triage & Officer Redressal Console</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30 backdrop-blur-md">
              Administrative View
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage incoming citizen complaints, dispatch field repair units, review AI triage recommendations, and log verified resolutions.
          </p>
        </div>

        <button
          onClick={fetchGrievances}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors self-start md:self-auto backdrop-blur-md"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
          <span className="text-xs text-slate-400 font-medium">Total Complaints</span>
          <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
        </div>
        <div className="bg-white/[0.04] border border-rose-500/30 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
          <span className="text-xs text-rose-400 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Critical Hazards
          </span>
          <p className="text-2xl font-bold text-rose-400 mt-1">{criticalCount}</p>
        </div>
        <div className="bg-white/[0.04] border border-amber-500/30 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
          <span className="text-xs text-amber-400 font-medium">In Progress / Inspection</span>
          <p className="text-2xl font-bold text-amber-300 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white/[0.04] border border-emerald-500/30 backdrop-blur-xl rounded-2xl p-4 shadow-lg">
          <span className="text-xs text-emerald-400 font-medium">Resolved & Verified</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-4 shadow-lg mb-6 flex flex-wrap items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, citizen name, ward..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2 pl-8 pr-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
          />
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Department:</span>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-slate-900 border border-white/10 text-slate-200 rounded-xl py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Urgency:</span>
          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="bg-slate-900 border border-white/10 text-slate-200 rounded-xl py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-white/10 text-slate-200 rounded-xl py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="AI_TRIAGED">AI Triaged</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_INSPECTION">In Inspection</option>
            <option value="WORK_IN_PROGRESS">Work in Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Main Split Layout: Triage List (Left 5 cols) vs Action Panel (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grievance Queue List */}
        <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {(!grievances || grievances.length === 0) ? (
            <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-8 text-center text-slate-400 text-sm">
              No grievances found matching the current filters.
            </div>
          ) : (
            (grievances || []).map((g) => {
              const isSelected = activeGrievance?.id === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => {
                    setActiveGrievance(g);
                    setActionStatus(g.status);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-md ${
                    isSelected
                      ? 'bg-white/[0.08] border-indigo-500 shadow-xl shadow-indigo-500/10'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-300">
                      {g.trackingNumber}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase backdrop-blur-md ${
                      g.urgency === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      g.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {g.urgency}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white line-clamp-1">{g.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">{g.translatedSummary || g.rawCitizenInput}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2.5 pt-2 border-t border-white/10">
                    <span className="flex items-center gap-1 font-medium text-slate-300">
                      <Building2 className="w-3 h-3 text-indigo-400" />
                      {g.departmentName.split('&')[0]}
                    </span>
                    <span className="font-mono text-emerald-300 font-semibold">
                      {g.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Officer Action & Detail Workspace */}
        {activeGrievance && (
          <div className="lg:col-span-7 space-y-6">
            {/* Active Ticket Header Card */}
            <div className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-xs font-mono text-indigo-300 font-bold bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30 backdrop-blur-md">
                    {activeGrievance.trackingNumber}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5">{activeGrievance.title}</h3>
                </div>
                <button
                  onClick={() => onSelectGrievanceToTrack(activeGrievance.trackingNumber)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <span>Open Citizen View</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Citizen Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-white/[0.02] rounded-xl border border-white/10 text-xs mb-4 backdrop-blur-md">
                <div>
                  <span className="text-slate-400 block">Complainant:</span>
                  <span className="font-semibold text-slate-200">{activeGrievance.citizenName} ({activeGrievance.citizenPhone})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location:</span>
                  <span className="font-semibold text-slate-200">{activeGrievance.locality}, {activeGrievance.wardNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Reported in Language:</span>
                  <span className="font-semibold text-indigo-300">{activeGrievance.dictatedLanguage}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">SLA Deadline:</span>
                  <span className="font-semibold text-rose-400">{new Date(activeGrievance.slaDeadline).toLocaleString()}</span>
                </div>
              </div>

              {/* AI Recommended Actions */}
              {activeGrievance.aiSuggestedActions && (
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-xs mb-4 backdrop-blur-md">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Action Recommendations for Officer:
                  </span>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                     {(activeGrievance.aiSuggestedActions || []).map((act, aidx) => (
                      <li key={aidx}>{act}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Status Transition Action Form */}
              <form onSubmit={handleUpdateStatus} className="space-y-4 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Update Redressal Lifecycle & Dispatch Notes
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">New Status</label>
                    <select
                      value={actionStatus}
                      onChange={(e) => setActionStatus(e.target.value as GrievanceStatus)}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl p-2.5 text-white font-medium focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <option value="ASSIGNED">ASSIGNED (Dispatched to Squad)</option>
                      <option value="IN_INSPECTION">IN_INSPECTION (Junior Engineer on Site)</option>
                      <option value="WORK_IN_PROGRESS">WORK_IN_PROGRESS (Remediation / Repair)</option>
                      <option value="RESOLVED">RESOLVED (Work Completed)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-semibold">Officer / Team Sign-off</label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-semibold">
                    Official Remediation / Inspection Note (Sent to Citizen via SMS/Chat)
                  </label>
                  <textarea
                    rows={3}
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    placeholder="e.g. Field inspection completed. Repair crew deployed with replacement parts. Work will conclude by 4 PM today."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/50 backdrop-blur-md"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-colors"
                  >
                    {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>Update Status & Notify Citizen</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
