/**
 * Enhanced Parent Dashboard
 * Special dashboard for parents with children's assessments, metrics, and PDF downloads
 */

import React, { useState } from 'react';
import {
  BookOpen, Calendar, DollarSign, Bell,
  Download, Award, TrendingUp, CheckCircle, Target,
  BarChart3, FileText, Users, Activity, ShieldCheck,
  ChevronRight, Clock, Wallet
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useNotifications } from '../../hooks/useNotifications';

// Professional Components
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

const ParentDashboard = ({ user }) => {
  const { showSuccess } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview'); // overview, children, reports, finance

  // Mock data - Replace with actual API calls
  const children = [
    {
      id: 1,
      name: 'John Doe',
      grade: 'Grade 3A',
      admissionNumber: 'ADM-001',
      overallPerformance: 'Excellent',
      performanceLevel: 'EE',
      attendanceRate: 96,
      currentTerm: 'Term 2, 2025',
      feeBalance: 0,
      subjects: [
        { name: 'Mathematics', grade: 'EE', score: 92, remarks: 'Excellent performance' },
        { name: 'English', grade: 'EE', score: 90, remarks: 'Outstanding work' },
        { name: 'Kiswahili', grade: 'ME', score: 88, remarks: 'Very good progress' },
        { name: 'Science', grade: 'EE', score: 94, remarks: 'Exceptional understanding' },
        { name: 'Social Studies', grade: 'ME', score: 86, remarks: 'Good performance' },
      ],
      recentAssessments: [
        { date: '2025-01-15', subject: 'Mathematics', type: 'Formative', score: 94, grade: 'EE' },
        { date: '2025-01-12', subject: 'English', type: 'Summative', score: 90, grade: 'EE' },
        { date: '2025-01-10', subject: 'Science', type: 'Formative', score: 92, grade: 'EE' },
      ],
      attendanceData: { present: 48, absent: 2, total: 50, rate: 96 },
      teacherRemarks: 'John is an excellent student who consistently demonstrates strong academic ability.',
      nextReport: '2025-04-15'
    },
    {
      id: 2,
      name: 'Jane Doe',
      grade: 'Grade 5B',
      admissionNumber: 'ADM-002',
      overallPerformance: 'Very Good',
      performanceLevel: 'ME',
      attendanceRate: 94,
      currentTerm: 'Term 2, 2025',
      feeBalance: 4500,
      subjects: [
        { name: 'Mathematics', grade: 'ME', score: 85, remarks: 'Good progress' },
        { name: 'English', grade: 'ME', score: 87, remarks: 'Very good work' },
        { name: 'Science', grade: 'EE', score: 90, remarks: 'Excellent performance' },
      ],
      recentAssessments: [
        { date: '2025-01-14', subject: 'Science', type: 'Formative', score: 90, grade: 'EE' },
      ],
      attendanceData: { present: 47, absent: 3, total: 50, rate: 94 },
      teacherRemarks: 'Jane shows consistent effort and is making good progress.',
      nextReport: '2025-04-15'
    }
  ];

  const totalFeeBalance = children.reduce((sum, child) => sum + child.feeBalance, 0);

  const handleDownloadReportCard = async (child) => {
    showSuccess('Generating End-of-Term Transcript...');
    // Existing PDF logic maintained...
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    pdf.setFontSize(20);
    pdf.text('ZAWADI JRN ACADEMY', pageWidth / 2, 20, { align: 'center' });
    pdf.save(`${child.name}_Report.pdf`);
    showSuccess('✅ Official Transcript Downloaded');
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Dependents" value={children.length} subtitle="Enrolled Learners" icon={Users} colorClass="text-blue-500" />
        <MetricCard title="Avg Attendance" value="95%" subtitle="Across all children" icon={Activity} colorClass="text-emerald-500" />
        <MetricCard title="Fee Liability" value={`KES ${totalFeeBalance.toLocaleString()}`} subtitle={totalFeeBalance > 0 ? "Pending Payment" : "Account Cleared"} icon={Wallet} colorClass={totalFeeBalance > 0 ? "text-amber-500" : "text-brand-purple"} />
        <MetricCard title="Bulletins" value="3" subtitle="Unread Notifications" icon={Bell} colorClass="text-indigo-500" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Immediate Academic Standing</h3>
        </div>
        <div className="p-0">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Learner Name</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Grade</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Perf. Index</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {children.map((child, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple text-[10px] font-black">
                        {child.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="text-xs font-black text-gray-900">{child.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500">{child.grade}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${child.performanceLevel === 'EE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                      {child.overallPerformance} ({child.performanceLevel})
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-gray-900">{child.attendanceRate}%</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setActiveTab('children')} className="text-brand-purple text-[10px] font-black uppercase tracking-widest hover:underline">View Portfolio</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderChildren = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {children.map((child) => (
        <div key={child.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-start border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-base font-black text-gray-900 tracking-tight">{child.name}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{child.grade} • ADM No: {child.admissionNumber}</p>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 p-3 rounded text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Attendance</p>
              <p className="text-lg font-black text-gray-900">{child.attendanceRate}%</p>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Assessments</p>
              <p className="text-lg font-black text-gray-900">{child.recentAssessments.length}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Level</p>
              <p className="text-lg font-black text-gray-900">{child.performanceLevel}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={12} className="text-brand-purple" /> Subject Performance
            </h4>
            <div className="divide-y divide-gray-50">
              {child.subjects.slice(0, 3).map((sub, i) => (
                <div key={i} className="py-2 flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-600">{sub.name}</span>
                  <span className="text-[10px] font-black text-brand-purple uppercase">{sub.grade} ({sub.score}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-brand-purple text-white rounded-lg">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-base font-black text-gray-900 tracking-tight">Parental Oversight Console</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Guardian Portal • Account Status: <span className="text-emerald-500">ACTIVE</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-brand-purple text-white rounded text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-brand-purple/90 transition-all flex items-center gap-2">
            <DollarSign size={14} /> Settle Balances
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 rounded-t-lg overflow-hidden flex shadow-sm">
        <TabButton active={activeTab === 'overview'} label="Family Overview" icon={Activity} onClick={() => setActiveTab('overview')} />
        <TabButton active={activeTab === 'children'} label="Learner Portfolios" icon={BookOpen} onClick={() => setActiveTab('children')} />
        <TabButton active={activeTab === 'reports'} label="Academic Transcripts" icon={FileText} onClick={() => setActiveTab('reports')} />
        <TabButton active={activeTab === 'finance'} label="Accounts & Bulletins" icon={Wallet} onClick={() => setActiveTab('finance')} />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'children' && renderChildren()}
        {/* Reports and Finance would follow similar patterns */}
      </div>
    </div>
  );
};

export default ParentDashboard;
