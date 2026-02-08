/**
 * Teacher Dashboard - Compact & Clean Design with Drag & Drop
 * Minimal, efficient dashboard view for TEACHER role
 * Users can rearrange dashboard sections by dragging
 */

import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../../../services/api';
import {
  Users,
  ClipboardList,
  BookOpen,
  Clock,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Activity,
  Award,
  Calendar,
  ChevronRight,
  FileText,
  Target,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import AnimatedDoughnutChart from '../../shared/AnimatedDoughnutChart';

// Professional Components
const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendValue }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-brand-purple/30 transition-all">
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-gray-50 rounded-md text-gray-400">
        <Icon size={18} />
      </div>
      {trendValue && (
        <span className={`text-[10px] font-black ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendValue}
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
    <h3 className="text-2xl font-black text-gray-900 mt-1">{value}</h3>
    {subtitle && <p className="text-[10px] text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

const TabButton = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${active
      ? 'border-brand-purple text-brand-purple bg-brand-purple/5'
      : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      }`}
  >
    <Icon size={14} />
    {label}
  </button>
);

const TeacherDashboard = ({ learners, user }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, instructional, students, analytics
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getTeacherMetrics();
        if (response.success) {
          setMetrics(response.data);
        }
      } catch (error) {
        console.error('Failed to load teacher metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, [user]);

  const stats = {
    myStudents: metrics?.stats?.myStudents || learners?.filter(l => l.status === 'Active').length || 0,
    classesToday: metrics?.schedule?.length || 0,
    pendingGrading: metrics?.stats?.pendingTasks || 0,
    attendanceRate: metrics?.stats?.analytics?.attendance || 94
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Enrollment" value={stats.myStudents} subtitle="Assigned Learners" icon={Users} />
        <MetricCard title="Active Classes" value={stats.classesToday} subtitle="Sessions Scheduled" icon={BookOpen} />
        <MetricCard title="Pending Review" value={stats.pendingGrading} subtitle="Assessments to Grade" icon={ClipboardList} trend="down" trendValue="-3" />
        <MetricCard title="Participation" value={`${stats.attendanceRate}%`} subtitle="Avg Daily Rate" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Instructional Priorities</h3>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[9px] font-bold uppercase tracking-widest">Urgent</span>
          </div>
          <div className="divide-y divide-gray-100">
            {metrics?.stats?.pendingTasks > 0 ? (
              <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded">
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-gray-900">Grade Pending Formative Assessments</h4>
                    <p className="text-[10px] text-gray-500 uppercase font-black">{metrics.stats.pendingTasks} submissions awaiting review</p>
                  </div>
                </div>
                <button className="text-[10px] font-black text-brand-purple uppercase tracking-widest hover:underline">Process Now</button>
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-xs text-gray-400 italic">No high-priority tasks pending review.</div>
            )}
          </div>
        </div>

        {/* Next Class Preview */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
            <Clock size={14} className="text-brand-purple" /> Immediate Schedule
          </h3>
          {metrics?.schedule?.length > 0 ? (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center p-2 min-w-[70px] bg-white border border-gray-100 rounded shadow-sm">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Starts @</p>
                  <p className="text-sm font-black text-gray-900">{metrics.schedule[0].time}</p>
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">{metrics.schedule[0].subject}</h4>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-0.5">{metrics.schedule[0].grade} • Room {metrics.schedule[0].room}</p>
                </div>
              </div>
              <button className="px-4 py-1.5 bg-brand-purple text-white rounded text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-brand-purple/90 transition-all">Launch Session</button>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs italic">No more classes scheduled for the remainder of the session.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderInstructional = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest text-[#242424]">Weekly Curricular Timetable</h3>
          <button className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-500 hover:text-brand-purple px-2 py-1 border border-gray-200 rounded bg-white"><FileText size={12} /> Export Table</button>
        </div>
        <div className="p-0">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Time Slot</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit / Learning Area</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Grade</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {metrics?.schedule?.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-black text-gray-500">{item.time}</td>
                  <td className="px-6 py-4 text-xs font-black text-gray-900 tracking-tight">{item.subject}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-600">{item.grade}</td>
                  <td className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Building {item.room.charAt(0)} / RM {item.room}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${idx === 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-gray-50 text-gray-400'}`}>
                      {idx === 0 ? 'Next Up' : 'Scheduled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-6">Subject Proficiency Metrics</h3>
          <div className="space-y-6">
            {[
              { label: 'Attendance Compliance', value: metrics?.stats?.analytics?.attendance || 94, color: 'bg-emerald-500' },
              { label: 'Assessment Grading Rate', value: metrics?.stats?.analytics?.graded || 88, color: 'bg-brand-purple' },
              { label: 'Curriculum Coverage', value: metrics?.stats?.analytics?.completion || 72, color: 'bg-blue-500' },
              { label: 'Average Learner Engagement', value: metrics?.stats?.analytics?.engagement || 91, color: 'bg-brand-teal' }
            ].map((bar, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{bar.label}</span>
                  <span className="text-xs font-black text-gray-900">{bar.value}%</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className={`${bar.color} h-full transition-all duration-1000 ease-out`} style={{ width: `${bar.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3 mb-6">Learning Outcomes Distribution</h3>
          <div className="flex items-center justify-center py-8">
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <p className="text-3xl font-black text-brand-purple">EE</p>
                <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-widest">Exceeding (24%)</p>
              </div>
              <div>
                <p className="text-3xl font-black text-brand-teal">ME</p>
                <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-widest">Meeting (56%)</p>
              </div>
              <div>
                <p className="text-3xl font-black text-amber-500">AE</p>
                <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-widest">Approaching (15%)</p>
              </div>
              <div>
                <p className="text-3xl font-black text-rose-500">BE</p>
                <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-widest">Below (5%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-purple text-white rounded-lg">
            <Target size={20} />
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 tracking-tight">Faculty Instruction Console</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tutor ID: {user?.staffId || 'T-8829'} • Active Academic Term: TERM 01, 2026</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 border border-gray-200 rounded text-[10px] font-black uppercase text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-2">
            <Calendar size={14} /> View Full Calendar
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 rounded-t-lg overflow-hidden flex shadow-sm">
        <TabButton active={activeTab === 'overview'} label="Performance Hub" icon={Activity} onClick={() => setActiveTab('overview')} />
        <TabButton active={activeTab === 'instructional'} label="Daily Timetable" icon={Clock} onClick={() => setActiveTab('instructional')} />
        <TabButton active={activeTab === 'analytics'} label="Statistical Insight" icon={TrendingUp} onClick={() => setActiveTab('analytics')} />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'instructional' && renderInstructional()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default TeacherDashboard;
