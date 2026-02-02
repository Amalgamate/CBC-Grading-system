import React, { useEffect, useState } from 'react';
import { Activity, Building2, CheckCircle2, TrendingUp, BarChart3, Clock, Globe } from 'lucide-react';
import { adminAPI } from '../../../services/api';

const LightStatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600'
  };
  const baseColor = colors[color] || colors.indigo;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${baseColor}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <div className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} className="mr-1" />
          +12%
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        {subtitle && <p className="text-[10px] text-gray-400 font-medium mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

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
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <LightStatCard
          title="Active Schools"
          value={metrics.active}
          icon={Building2}
          color="indigo"
          subtitle="Currently operational tenants"
        />
        <LightStatCard
          title="Inactive Schools"
          value={metrics.inactive}
          icon={Clock}
          color="orange"
          subtitle="Awaiting reactivation"
        />
        <LightStatCard
          title="Active Trials"
          value={metrics.trial}
          icon={Activity}
          color="purple"
          subtitle="Potential conversions"
        />
        <LightStatCard
          title="Conversion Rate"
          value={`${Math.round((metrics.conversionRate || 0) * 100)}%`}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Trial to paid status"
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
