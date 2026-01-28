import React, { useEffect, useState, useCallback } from 'react';
import { School, RefreshCw, CheckCircle2, Search, Activity, Users, Building2, CreditCard, LayoutDashboard, Bell, Settings, FileText, Calendar, BookOpen, Award, Shield, X, LogOut, Loader2 } from 'lucide-react';
import { adminAPI } from '../../services/api';
import Overview from './admin/Overview';
import Schools from './admin/Schools';
import Modules from './admin/Modules';
import Payments from './admin/Payments';
import Trials from './admin/Trials';
import Notifications from './admin/Notifications';
import SettingsPage from './admin/Settings';
import SchoolDetails from './admin/SchoolDetails';
import SchoolSwitcher from './admin/SchoolSwitcher';

export default function SuperAdminDashboard({ onLogout }) {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [metrics, setMetrics] = useState({ active: 0, inactive: 0, trial: 0, conversionRate: 0 });
  const [actionLoading, setActionLoading] = useState(null);
  const [section, setSection] = useState('overview');
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [plans, setPlans] = useState([]);
  const [approvalModal, setApprovalModal] = useState(null);
  const [currentSchool, setCurrentSchool] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, m] = await Promise.all([
        adminAPI.listSchools(),
        adminAPI.trialMetrics()
      ]);
      setSchools(s.data || []);
      setMetrics(m.data || metrics);

      try {
        const planResponse = await adminAPI.listPlans();
        setPlans(planResponse.data || []);
      } catch (planError) {
        console.error('Failed to load plans:', planError);
        setPlans([]);
      }
    } catch (e) {
      console.error('SuperAdmin load error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approvePayment = async (schoolId, planId) => {
    if (!planId) {
      alert('Please select a subscription plan');
      return;
    }
    setActionLoading(`pay-${schoolId}`);
    try {
      await adminAPI.approvePayment(schoolId, { planId, durationDays: 365 });
      setApprovalModal(null);
      await load();
    } catch (error) {
      alert(error.message || 'Failed to approve payment');
    } finally {
      setActionLoading(null);
    }
  };

  const openApprovalModal = (schoolId) => {
    setApprovalModal({ schoolId, selectedPlanId: null });
  };

  const sidebarItems = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'schools', label: 'Schools', icon: School },
    { key: 'modules', label: 'Modules', icon: FileText },
    { key: 'payments', label: 'Payments', icon: CreditCard },
    { key: 'trials', label: 'Trials', icon: Activity },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  if (loading && schools.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white min-h-screen sticky top-0 flex flex-col shadow-2xl z-50">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              E
            </div>
            <div className="text-xl font-bold tracking-tight">EDucore</div>
          </div>
          <div className="text-xs text-slate-400 font-medium uppercase tracking-wider pl-11">Super Admin Console</div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2 mt-2">Main Menu</div>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = section === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setSection(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 font-semibold'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'}`} />
                <span className="text-sm">{item.label}</span>
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-slate-800/50">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200/50 px-8 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-sm bg-white/90">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {sidebarItems.find(i => i.key === section)?.label}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">
              {section === 'schools' ? 'Manage your tenants and subscriptions' : 'Welcome back, Administrator'}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <SchoolSwitcher
              currentSchool={currentSchool}
              onSchoolChange={(school) => setCurrentSchool(school)}
            />
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button onClick={load} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Refresh Data">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {section === 'overview' && <Overview metrics={metrics} />}
            {section === 'schools' && (
              <Schools
                onOpenSchool={(id) => {
                  setSelectedSchoolId(id);
                  setSection('school-details');
                }}
                onApprovePayment={openApprovalModal}
              />
            )}
            {section === 'modules' && <Modules />}
            {section === 'payments' && <Payments />}
            {section === 'trials' && <Trials />}
            {section === 'notifications' && <Notifications />}
            {section === 'settings' && <SettingsPage />}
            {section === 'school-details' && selectedSchoolId && (
              <SchoolDetails
                schoolId={selectedSchoolId}
                onBack={() => setSection('schools')}
              />
            )}
          </div>
        </div>
      </main>

      {/* Approval Modal */}
      {approvalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Approve Subscription</h3>
              <button onClick={() => setApprovalModal(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4 font-medium">Select a plan for the school:</p>
              {plans.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex gap-3 text-amber-800">
                  <Activity className="w-5 h-5 shrink-0" />
                  <div className="text-xs">
                    <strong>No plans found.</strong><br />
                    Run <code className="bg-amber-100 px-1 py-0.5 rounded">npx prisma db seed</code> in server folder.
                  </div>
                </div>
              ) : (
                <div className="space-y-3 mb-6">
                  {plans.map((plan) => (
                    <label
                      key={plan.id}
                      className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${approvalModal.selectedPlanId === plan.id
                          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        onChange={(e) => setApprovalModal({ ...approvalModal, selectedPlanId: e.target.value })}
                        className="w-4 h-4 text-indigo-600 focus:ring-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">{plan.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">Max {plan.maxBranches} branch{plan.maxBranches > 1 ? 'es' : ''}</div>
                      </div>
                      <div className="font-bold text-indigo-600 text-sm">Select</div>
                    </label>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setApprovalModal(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => approvePayment(approvalModal.schoolId, approvalModal.selectedPlanId)}
                  disabled={!approvalModal.selectedPlanId || actionLoading === `pay-${approvalModal.schoolId}`}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200 transition-all"
                >
                  {actionLoading === `pay-${approvalModal.schoolId}` ? 'Processing...' : 'Confirm Approval'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
