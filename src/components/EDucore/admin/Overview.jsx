import React, { useEffect, useState } from 'react';
import { Activity, Building2, CheckCircle2, TrendingUp, BarChart3, Clock, Globe } from 'lucide-react';
import { adminAPI } from '../../../services/api';

const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass = "text-gray-400" }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:border-brand-purple/30 transition-all">
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 bg-gray-50 rounded-md ${colorClass}`}>
        <Icon size={20} />
      </div>
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
    <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
    {subtitle && <p className="text-[10px] text-gray-500 mt-1 font-medium">{subtitle}</p>}
  </div>
);

export default function Overview({ metrics: initialMetrics }) {
  const [metrics, setMetrics] = useState(initialMetrics || { active: 0, inactive: 0, trial: 0, conversionRate: 0 });

  useEffect(() => {
    if (!initialMetrics) {
      adminAPI.trialMetrics()
        .then((m) => setMetrics(prev => m.data || prev))
        .catch(() => { });
    } else {
      setMetrics(initialMetrics);
    }
  }, [initialMetrics]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-900 text-white rounded-lg">
            <Globe size={20} />
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 tracking-tight">Enterprise Infrastructure Oversight</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Global Network Status • System Load: <span className="text-emerald-500 font-black">STABLE</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-gray-900 text-white rounded text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-800 transition-all flex items-center gap-2">
            Infrastructure Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Active Schools"
          value={metrics.active}
          icon={Building2}
          colorClass="text-indigo-500"
          subtitle="Revenue-generating tenants"
        />
        <MetricCard
          title="Inactive Schools"
          value={metrics.inactive}
          icon={Clock}
          colorClass="text-amber-500"
          subtitle="Provisioned / Sleeping"
        />
        <MetricCard
          title="Trial Nodes"
          value={metrics.trial}
          icon={Activity}
          colorClass="text-brand-purple"
          subtitle="Evaluation pipelines"
        />
        <MetricCard
          title="Conversion"
          value={`${Math.round((metrics.conversionRate || 0) * 100)}%`}
          icon={CheckCircle2}
          colorClass="text-emerald-500"
          subtitle="Win rate this cycle"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-800 self-start mb-6 flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-500" />
            School Status Distribution
          </h3>
          <div className="relative w-48 h-48 mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" strokeWidth="12" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#6366F1"
                strokeWidth="12"
                strokeDasharray={`${Math.max(metrics.active, 0) * 2.513274} 251.3274`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">{metrics.active + metrics.inactive}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</span>
            </div>
          </div>
          <div className="w-full space-y-3">
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span className="text-gray-600 uppercase tracking-wide">Active</span>
              </div>
              <span className="text-gray-900">{metrics.active}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200"></span>
                <span className="text-gray-600 uppercase tracking-wide">Inactive</span>
              </div>
              <span className="text-gray-900">{metrics.inactive}</span>
            </div>
          </div>
        </div>

        {/* Growth Trends */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-sm font-bold text-gray-800 mb-8 flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-500" />
            Conversion Performance
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                <span>Trial Utilization</span>
                <span className="text-purple-600">{metrics.trial}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-purple-500 shadow-sm shadow-purple-200"
                  style={{ width: `${Math.min(100, metrics.trial)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                <span>Active Conversion</span>
                <span className="text-indigo-600">{Math.round((metrics.conversionRate || 0) * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-200"
                  style={{ width: `${Math.round((metrics.conversionRate || 0) * 100)}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-12 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Globe size={16} className="text-indigo-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Top Region</p>
                <p className="text-sm font-bold text-gray-800">Nairobi County</p>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h3 className="text-sm font-bold text-gray-800 mb-8 flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" />
            System Health
          </h3>
          <div className="flex flex-col items-center justify-center pt-4">
            <div className="w-24 h-24 rounded-full border-4 border-emerald-50 border-t-emerald-500 animate-spin-slow flex items-center justify-center relative">
              <div className="absolute inset-2 border-2 border-emerald-100 rounded-full"></div>
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <p className="mt-6 text-sm font-bold text-gray-900">All Systems Operational</p>
            <p className="text-xs text-gray-400 font-medium mt-1">Last checked 2 mins ago</p>

            <button className="mt-8 w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors">
              View Status Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
