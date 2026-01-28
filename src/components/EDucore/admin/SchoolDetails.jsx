/**
 * School Details - Premium Admin View
 * Comprehensive overview of a specific tenant/school
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft, Building2, Users, CreditCard,
  Trash2, LogIn, Activity,
  Calendar, TrendingUp, Award, Clock,
  FileText, ShieldCheck, UserCheck, ChevronRight
} from 'lucide-react';
import { schoolAPI, adminAPI, learnerAPI, assessmentAPI, userAPI } from '../../../services/api';

// Helper for LayoutGrid since it's commonly missing from lucide if not standard
const LayoutGrid = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const moduleCatalog = [
  { key: 'CBC', label: 'CBC Framework', icon: Award, desc: 'Grading, Rubrics, CBC Outcomes' },
  { key: 'ASSESSMENT', label: 'Assessments', icon: FileText, desc: 'Formative & Summative Tests' },
  { key: 'LEARNERS', label: 'Learner Core', icon: Users, desc: 'Student Profiles & Enrolment' },
  { key: 'FEES', label: 'Finance Hub', icon: CreditCard, desc: 'Invoicing & Mobile Payments' },
  { key: 'ATTENDANCE', label: 'Attendance', icon: Calendar, desc: 'Smart Tracking & Registers' },
  { key: 'REPORTS', label: 'Report Engine', icon: LayoutGrid, desc: 'Performance Analytics & Cards' },
];

export default function SchoolDetails({ schoolId, onBack }) {
  const [school, setSchool] = useState(null);
  const [modules, setModules] = useState({});
  const [learners, setLearners] = useState([]);
  const [tests, setTests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const config = { headers: { 'X-School-Id': schoolId } };

      const [schoolRes, modulesRes, learnersRes, testsRes, usersRes] = await Promise.all([
        schoolAPI.getById(schoolId),
        adminAPI.getSchoolModules(schoolId),
        learnerAPI.getAll(config),
        assessmentAPI.getTests(config),
        userAPI.getAll(config)
      ]);

      setSchool(schoolRes.data || schoolRes);
      setModules(modulesRes.data || {});
      setLearners(learnersRes.data || []);
      setTests(testsRes.data || []);
      setUsers(usersRes.data || usersRes || []);
    } catch (e) {
      console.error('Failed to load school comprehensive data', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [schoolId]);

  // Analytics Derivations
  const assessmentDistribution = useMemo(() => {
    if (!tests.length) return [];
    const counts = {};
    tests.forEach(t => {
      const g = t.grade || 'Unknown';
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      percent: ((value / tests.length) * 100).toFixed(0)
    })).sort((a, b) => b.value - a.value);
  }, [tests]);

  const recentUsers = useMemo(() => {
    // Sort by last active / created if available
    return [...users]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5);
  }, [users]);

  const toggleModule = async (key) => {
    const active = !modules[key];
    setModules(prev => ({ ...prev, [key]: active }));
    try {
      await adminAPI.setSchoolModule(schoolId, key, active);
    } catch {
      setModules(prev => ({ ...prev, [key]: !active }));
    }
  };

  const handleAction = async (action, fn) => {
    setActionLoading(action);
    try {
      await fn();
      await load();
    } catch (e) {
      alert(e?.message || `${action} failed`);
    } finally {
      setActionLoading('');
    }
  };

  const loginToSchool = async () => {
    setActionLoading('login');
    try {
      localStorage.setItem('currentSchoolId', schoolId);
      localStorage.removeItem('currentBranchId');
      window.location.href = '/?view=app';
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Activity className="w-12 h-12 text-indigo-600 animate-pulse mb-6" />
        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-indigo-600 animate-[loading_1.5s_infinite]"></div>
        </div>
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Global Sync in Progress</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-700">
      <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>

      {/* Top Controller */}
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full bg-white border border-slate-100 hover:border-slate-900 transition-all shadow-sm" onClick={onBack}>
          <ArrowLeft size={14} /> School Registry
        </button>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {recentUsers.map((u, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400" title={u.firstName}>
                {u.firstName?.[0]}
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-indigo-600">
              +{users.length > 5 ? users.length - 5 : 0}
            </div>
          </div>
          <button
            className="px-8 py-3 rounded-full bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95"
            onClick={loginToSchool}
          >
            <LogIn size={14} /> Impersonate
          </button>
        </div>
      </div>

      {/* Hero Brand Section */}
      <div className="relative bg-white rounded-[3rem] p-12 shadow-2xl shadow-indigo-100/50 border border-slate-50 overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
          <Building2 size={300} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${school?.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <span className={`w-2 h-2 rounded-full ${school?.active ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {school?.active ? 'Operational' : 'Access Restricted'}
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{school?.name}</h1>
            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-indigo-600" /> {school?.id?.slice(0, 12)}</span>
              <span className="flex items-center gap-2"><Calendar size={14} className="text-indigo-600" /> Est. {new Date(school?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:flex items-center gap-3">
            <div className="bg-slate-50 rounded-2xl p-4 min-w-[120px]">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Total Tests</p>
              <p className="text-xl font-black text-slate-900">{tests.length}</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 min-w-[120px]">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Learners</p>
              <p className="text-xl font-black text-slate-900">{learners.length}</p>
            </div>
            <div className="col-span-2 flex gap-2">
              <button onClick={() => handleAction('deactivate', () => schoolAPI.deactivate(schoolId))} className="flex-1 lg:flex-none px-6 py-4 bg-amber-50 rounded-2xl text-[10px] font-black uppercase text-amber-700 hover:bg-amber-100 transition-colors">Safety Lock</button>
              <button onClick={() => handleAction('delete', () => schoolAPI.delete(schoolId))} className="px-6 py-4 bg-red-50 rounded-2xl text-[10px] font-black uppercase text-red-600 hover:bg-red-100 transition-colors">Purge</button>
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Assessment Distribution - CSS CONIC PIE CHART */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 border-l-4 border-indigo-600 pl-4">Assessment Density</h3>

          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 rounded-full mb-8 flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(
                    #4f46e5 0% ${assessmentDistribution[0]?.percent || 0}%,
                    #818cf8 ${assessmentDistribution[0]?.percent || 0}% ${(Number(assessmentDistribution[0]?.percent || 0) + Number(assessmentDistribution[1]?.percent || 0)) || 0}%,
                    #c7d2fe ${(Number(assessmentDistribution[0]?.percent || 0) + Number(assessmentDistribution[1]?.percent || 0)) || 0}% 100%
                  )`
                }}
              ></div>
              <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                <span className="text-2xl font-black text-slate-900 leading-none">{tests.length}</span>
                <span className="text-[9px] font-black text-slate-400 uppercase">Assessments</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {assessmentDistribution.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tight">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-indigo-600' : idx === 1 ? 'bg-indigo-400' : 'bg-indigo-200'}`}></span>
                    <span className="text-slate-600">{item.label}</span>
                  </div>
                  <span className="text-slate-900 font-black">{item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8 border-l-4 border-slate-900 pl-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Operational Heartbeat</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Last Active Users</p>
          </div>

          <div className="space-y-4">
            {recentUsers.map((u, i) => (
              <div key={i} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                    {u.firstName?.[0]}{u.lastName?.[0]}
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{u.firstName} {u.lastName}</h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase">{u.role} • {u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 text-green-500 font-black text-[9px] uppercase tracking-widest mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Active
                  </div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(u.updatedAt || u.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            ))}
            {(!users || users.length === 0) && (
              <div className="p-12 text-center opacity-30 italic text-xs uppercase font-black tracking-widest">Scanning for active pulses...</div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Intelligence - Learner Registry & Module Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Module Entitlements */}
        <div className="space-y-6">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest pl-4 mb-4">Enterprise Toggles</h3>
          <div className="grid grid-cols-1 gap-3">
            {moduleCatalog.map((mod) => {
              const Icon = mod.icon;
              const active = !!modules[mod.key];
              return (
                <div key={mod.key} className={`p-5 rounded-3xl border transition-all flex items-center justify-between gap-4 ${active ? 'bg-white border-indigo-100 shadow-lg shadow-indigo-50' : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Icon size={20} />
                    </div>
                    <div className="max-w-[120px]">
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">{mod.label}</h4>
                      <p className="text-[8px] font-bold text-slate-400 leading-tight uppercase line-clamp-1">{mod.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => toggleModule(mod.key)}>
                    <div className={`w-10 h-5 rounded-full p-1 transition-colors flex ${active ? 'bg-indigo-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Learner Registry */}
        <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-indigo-600/20 transition-all duration-1000"></div>

          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-3">
              Learner Registry
              <span className="bg-white/10 px-3 py-1 rounded-full text-[9px]">{learners.length} Students</span>
            </h3>
            <button className="text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors flex items-center gap-2">Full Vault <ChevronRight size={14} /></button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                  <th className="pb-4">Identification</th>
                  <th className="pb-4">Academic Placement</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {learners.slice(0, 10).map((l, idx) => (
                  <tr key={idx} className="group/row hover:bg-white/5 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-black">
                          {l.firstName?.[0]}
                        </div>
                        <div>
                          <p className="text-[11px] font-black truncate max-w-[140px] uppercase tracking-tight">{l.firstName} {l.lastName}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase">{l.admissionNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-[10px] font-black text-slate-300 uppercase">{l.grade} • {l.stream || 'A'}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${l.status === 'Active' || l.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-[9px] font-bold text-slate-600 group-hover/row:text-slate-300 transition-colors uppercase">{l.id?.slice(-8)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {learners.length > 10 && (
              <div className="mt-4 pt-4 border-t border-white/5 text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase italic">+ {learners.length - 10} more learners in the system</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
