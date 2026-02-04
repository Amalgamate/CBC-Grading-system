/**
 * Dashboard Page
 * Main dashboard with statistics and overview
 */

import React from 'react';
import {
  Users, GraduationCap, BookOpen, BarChart3,
  Activity, Clock, ChevronRight, Target,
  Calendar, ShieldCheck, Zap
} from 'lucide-react';

const MetricCard = ({ title, value, subtitle, icon: Icon, colorClass = "text-gray-400" }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-brand-purple/30 transition-all">
    <div className="flex justify-between items-start mb-2">
      <div className={`p-2 bg-gray-50 rounded-md ${colorClass}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
    <h3 className="text-xl font-black text-gray-900 mt-1">{value}</h3>
    {subtitle && <p className="text-[10px] text-gray-500 mt-1 font-medium">{subtitle}</p>}
  </div>
);

const Dashboard = ({ learners, teachers }) => {
  const activeLearners = learners?.filter(l => l.status === 'Active' || l.status === 'ACTIVE').length || 0;
  const activeTeachers = teachers?.filter(t => t.status === 'Active' || t.status === 'ACTIVE').length || 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Enrollment" value={activeLearners} subtitle="Active Students" icon={Users} colorClass="text-blue-500" />
        <MetricCard title="Faculty" value={activeTeachers} subtitle="Teaching Staff" icon={GraduationCap} colorClass="text-emerald-500" />
        <MetricCard title="Units" value="12" subtitle="Active Learning Areas" icon={BookOpen} colorClass="text-brand-purple" />
        <MetricCard title="Performance" value="89%" subtitle="Avg Attendance" icon={Activity} colorClass="text-amber-500" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Service Console */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Enterprise Service Console</h3>
              <ShieldCheck size={16} className="text-brand-purple" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-100 rounded-lg hover:border-brand-purple/20 hover:bg-brand-purple/5 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-purple/10 text-brand-purple rounded group-hover:bg-brand-purple group-hover:text-white transition-all">
                      <Users size={18} />
                    </div>
                    <h4 className="text-xs font-black text-gray-900 uppercase">Registry Support</h4>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">Coordinate student admissions, portfolio updates and academic transitions.</p>
                </div>

                <div className="p-4 border border-gray-100 rounded-lg hover:border-brand-teal/20 hover:bg-brand-teal/5 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-brand-teal/10 text-brand-teal rounded group-hover:bg-brand-teal group-hover:text-white transition-all">
                      <Target size={18} />
                    </div>
                    <h4 className="text-xs font-black text-gray-900 uppercase">Assessment Hub</h4>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">Manage CBC formative assessments and end-of-term summative evaluations.</p>
                </div>

                <div className="p-4 border border-gray-100 rounded-lg hover:border-amber-500/20 hover:bg-amber-500/5 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500/10 text-amber-600 rounded group-hover:bg-amber-500 group-hover:text-white transition-all">
                      <Zap size={18} />
                    </div>
                    <h4 className="text-xs font-black text-gray-900 uppercase">Ops Framework</h4>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">Review daily attendance logs, schedule changes and institutional milestones.</p>
                </div>

                <div className="p-4 border border-gray-100 rounded-lg hover:border-indigo-500/20 hover:bg-indigo-500/5 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Calendar size={18} />
                    </div>
                    <h4 className="text-xs font-black text-gray-900 uppercase">Planner</h4>
                  </div>
                  <p className="text-[10px] text-gray-500 font-medium">Access the unified academic calendar and term-based operational roadmaps.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Activity Log */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">System Broadcasts</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { type: 'Update', text: 'CBC Assessment Engine version 4.2 deployed successfully.', time: '2h ago', color: 'text-brand-purple' },
                { type: 'Ops', text: 'Grade 3A attendance metrics uploaded for review.', time: '4h ago', color: 'text-brand-teal' },
                { type: 'Notice', text: 'Upcoming faculty seminar scheduled for March 12th.', time: '1d ago', color: 'text-amber-500' }
              ].map((activity, idx) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${activity.color}`}>{activity.type}</span>
                    <span className="text-[9px] text-gray-400 font-black">{activity.time}</span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium leading-relaxed">{activity.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
