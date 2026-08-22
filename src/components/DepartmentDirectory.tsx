import React from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  Clock, 
  ShieldCheck, 
  PlusCircle, 
  Trash2, 
  Droplets, 
  Construction, 
  Zap, 
  Car, 
  HeartPulse, 
  Wind,
  ExternalLink,
  Users
} from 'lucide-react';
import { DEPARTMENTS } from '../data/mockData';

interface DepartmentDirectoryProps {
  onLodgeForDepartment: (deptId: string) => void;
}

export const DepartmentDirectory: React.FC<DepartmentDirectoryProps> = ({ onLodgeForDepartment }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Trash2': return <Trash2 className="w-5 h-5 text-emerald-400" />;
      case 'Droplets': return <Droplets className="w-5 h-5 text-blue-400" />;
      case 'Construction': return <Construction className="w-5 h-5 text-amber-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Car': return <Car className="w-5 h-5 text-indigo-400" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-rose-400" />;
      case 'Wind': return <Wind className="w-5 h-5 text-teal-400" />;
      default: return <Building2 className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div id="department-directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
          <Building2 className="w-7 h-7 text-indigo-400" />
          <span>Integrated Civic Departments & Nodal Directory</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
          Direct emergency helplines, nodal officers, standard SLAs, and jurisdiction scopes across all municipal & state departments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEPARTMENTS.map((dept) => (
          <div
            key={dept.id}
            className="bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-2xl hover:border-white/20 hover:bg-white/[0.06] transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center">
                  {getIcon(dept.icon)}
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30 backdrop-blur-md">
                    SLA: {dept.standardSlaHours}h (Standard)
                  </span>
                  <p className="text-[10px] text-rose-400 font-mono mt-0.5">Emergency: {dept.emergencySlaHours}h</p>
                </div>
              </div>

              <h3 className="text-base font-bold text-white leading-tight">{dept.name}</h3>
              <p className="text-xs text-indigo-300 font-medium mt-0.5">{dept.hindiName}</p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{dept.description}</p>

              {/* Common Issues */}
              <div className="mt-3 pt-3 border-t border-white/10">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Common Grievances:</span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {dept.commonCategories.slice(0, 3).map((cat, cidx) => (
                    <li key={cidx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>{cat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nodal Officer Contact */}
              <div className="mt-4 p-3 bg-white/[0.02] rounded-xl border border-white/10 text-xs backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-1">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Nodal Redressal Officer:</span>
                </div>
                <p className="font-bold text-slate-200">{dept.nodalOfficer.name}</p>
                <p className="text-[11px] text-slate-400">{dept.nodalOfficer.designation}</p>
                
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/10 text-[11px]">
                  <a
                    href={`tel:${dept.nodalOfficer.contact}`}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{dept.nodalOfficer.contact}</span>
                  </a>
                  <span className="text-slate-400 font-mono">Helpline: {dept.helpline}</span>
                </div>
              </div>
            </div>

            {/* Lodge Action */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                onClick={() => onLodgeForDepartment(dept.id)}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-indigo-500 text-slate-200 hover:text-white border border-white/10 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm backdrop-blur-md"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Lodge Grievance with this Dept</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
