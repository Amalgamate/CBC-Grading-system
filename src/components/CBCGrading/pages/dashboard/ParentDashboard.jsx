/**
 * Enhanced Parent Dashboard
 * Special dashboard for parents with children's assessments, metrics, and PDF downloads
 */

import React from 'react';
import { 
  BookOpen, Calendar, DollarSign, Bell, 
  Download, Award, TrendingUp, CheckCircle, Target,
  BarChart3, FileText, Users
} from 'lucide-react';
import StatsCard from '../../shared/StatsCard';
import CircularChart from '../../shared/CircularChart';
import jsPDF from 'jspdf';
import { useNotifications } from '../../hooks/useNotifications';

const ParentDashboard = ({ user }) => {
  const { showSuccess } = useNotifications();
  
  // Mock data - Replace with actual API calls
  const children = [
    {
      id: 1,
      name: 'John Doe',
      grade: 'Grade 3A',
      admissionNumber: 'ADM-001',
      profileImage: null,
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
      attendanceData: {
        present: 48,
        absent: 2,
        total: 50,
        rate: 96
      },
      teacherRemarks: 'John is an excellent student who consistently demonstrates strong academic ability and positive behavior.',
      nextReport: '2025-04-15'
    },
    {
      id: 2,
      name: 'Jane Doe',
      grade: 'Grade 5B',
      admissionNumber: 'ADM-002',
      profileImage: null,
      overallPerformance: 'Very Good',
      performanceLevel: 'ME',
      attendanceRate: 94,
      currentTerm: 'Term 2, 2025',
      feeBalance: 0,
      subjects: [
        { name: 'Mathematics', grade: 'ME', score: 85, remarks: 'Good progress' },
        { name: 'English', grade: 'ME', score: 87, remarks: 'Very good work' },
        { name: 'Kiswahili', grade: 'ME', score: 84, remarks: 'Good understanding' },
        { name: 'Science', grade: 'EE', score: 90, remarks: 'Excellent performance' },
        { name: 'Social Studies', grade: 'ME', score: 86, remarks: 'Good work' },
      ],
      recentAssessments: [
        { date: '2025-01-14', subject: 'Science', type: 'Formative', score: 90, grade: 'EE' },
        { date: '2025-01-11', subject: 'Mathematics', type: 'Summative', score: 85, grade: 'ME' },
        { date: '2025-01-09', subject: 'English', type: 'Formative', score: 87, grade: 'ME' },
      ],
      attendanceData: {
        present: 47,
        absent: 3,
        total: 50,
        rate: 94
      },
      teacherRemarks: 'Jane shows consistent effort and is making good progress across all subjects.',
      nextReport: '2025-04-15'
    }
  ];

  // Calculate overall metrics
  const totalChildren = children.length;
  const avgAttendance = Math.round(children.reduce((sum, child) => sum + child.attendanceRate, 0) / totalChildren);
  const totalFeeBalance = children.reduce((sum, child) => sum + child.feeBalance, 0);
  const unreadNotices = 3; // Mock data

  const handleDownloadReportCard = async (child) => {
    showSuccess('Generating PDF... Please wait');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // School Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ZAWADI JRN ACADEMY', pageWidth / 2, 20, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('P.O. Box 1234, Nairobi, Kenya', pageWidth / 2, 28, { align: 'center' });
    pdf.text('Tel: +254 712 345 678 | Email: info@zawadijrn.ac.ke', pageWidth / 2, 34, { align: 'center' });
    
    // Report Title
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('END OF TERM REPORT CARD', pageWidth / 2, 45, { align: 'center' });
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.text(child.currentTerm, pageWidth / 2, 52, { align: 'center' });
    
    // Student Info Box
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.rect(15, 58, pageWidth - 30, 35);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LEARNER INFORMATION', 20, 65);
    
    pdf.setFont('helvetica', 'normal');
    const infoY = 72;
    pdf.text(`Name: ${child.name}`, 20, infoY);
    pdf.text(`Admission No: ${child.admissionNumber}`, 120, infoY);
    pdf.text(`Class: ${child.grade}`, 20, infoY + 7);
    pdf.text(`Overall Performance: ${child.overallPerformance}`, 120, infoY + 7);
    pdf.text(`Term: ${child.currentTerm}`, 20, infoY + 14);
    pdf.text(`Date Issued: ${new Date().toLocaleDateString()}`, 120, infoY + 14);

    let currentY = 100;

    // Subject Performance Section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('SUBJECT PERFORMANCE', 20, currentY);
    currentY += 8;

    pdf.setFontSize(9);
    
    // Table headers
    pdf.setFont('helvetica', 'bold');
    pdf.text('Subject', 20, currentY);
    pdf.text('Score', 110, currentY, { align: 'center' });
    pdf.text('Grade', 140, currentY, { align: 'center' });
    pdf.text('Remarks', 160, currentY);
    
    currentY += 5;
    pdf.setFont('helvetica', 'normal');

    // Table rows
    child.subjects.forEach((subject) => {
      pdf.text(subject.name, 20, currentY);
      pdf.text(subject.score + '%', 110, currentY, { align: 'center' });
      pdf.text(subject.grade, 140, currentY, { align: 'center' });
      const remarks = pdf.splitTextToSize(subject.remarks, 40);
      pdf.text(remarks, 160, currentY);
      currentY += 6;
    });

    // Calculate average
    const avgScore = Math.round(child.subjects.reduce((sum, s) => sum + s.score, 0) / child.subjects.length);
    
    currentY += 3;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Average', 20, currentY);
    pdf.text(avgScore + '%', 110, currentY, { align: 'center' });
    pdf.text(child.performanceLevel, 140, currentY, { align: 'center' });
    
    currentY += 10;

    // Attendance Section
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ATTENDANCE RECORD', 20, currentY);
    currentY += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Days Present: ${child.attendanceData.present} / ${child.attendanceData.total}`, 20, currentY);
    pdf.text(`Attendance Rate: ${child.attendanceRate}%`, 120, currentY);
    currentY += 10;

    // Recent Assessments
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECENT ASSESSMENTS', 20, currentY);
    currentY += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Date', 20, currentY);
    pdf.text('Subject', 50, currentY);
    pdf.text('Type', 110, currentY);
    pdf.text('Score', 140, currentY, { align: 'center' });
    pdf.text('Grade', 170, currentY, { align: 'center' });
    
    currentY += 5;
    pdf.setFont('helvetica', 'normal');

    child.recentAssessments.forEach((assessment) => {
      pdf.text(assessment.date, 20, currentY);
      pdf.text(assessment.subject, 50, currentY);
      pdf.text(assessment.type, 110, currentY);
      pdf.text(assessment.score + '%', 140, currentY, { align: 'center' });
      pdf.text(assessment.grade, 170, currentY, { align: 'center' });
      currentY += 6;
    });

    currentY += 5;

    // Teacher's Comment
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('TEACHER\'S REMARKS', 20, currentY);
    currentY += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const commentLines = pdf.splitTextToSize(child.teacherRemarks, pageWidth - 40);
    pdf.text(commentLines, 20, currentY);
    currentY += commentLines.length * 5 + 10;

    // Signatures
    if (currentY > pageHeight - 40) {
      pdf.addPage();
      currentY = 20;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.text('Class Teacher', 30, currentY);
    pdf.text('Head Teacher', 130, currentY);
    pdf.line(25, currentY + 2, 80, currentY + 2);
    pdf.line(125, currentY + 2, 180, currentY + 2);

    // Footer
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'italic');
    pdf.text('This is an official document from Zawadi JRN Academy', pageWidth / 2, pageHeight - 15, { align: 'center' });
    pdf.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save PDF
    const fileName = `${child.name.replace(/ /g, '_')}_Report_Card_${child.currentTerm.replace(/ /g, '_')}.pdf`;
    pdf.save(fileName);

    showSuccess('✅ PDF downloaded successfully!');
  };

  const handleViewAssessments = (child) => {
    showSuccess('Assessment details coming soon');
  };

  const getPerformanceColor = (level) => {
    switch (level) {
      case 'EE': return 'text-green-700 bg-green-100';
      case 'ME': return 'text-blue-700 bg-blue-100';
      case 'AE': return 'text-yellow-700 bg-yellow-100';
      case 'BE': return 'text-orange-700 bg-orange-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard 
          title="My Children" 
          value={totalChildren} 
          icon={Users} 
          color="blue" 
          subtitle="Enrolled students" 
        />
        <StatsCard 
          title="Avg Attendance" 
          value={`${avgAttendance}%`} 
          icon={Calendar} 
          color="green" 
          subtitle="This term" 
        />
        <StatsCard 
          title="Fee Balance" 
          value={`Ksh ${totalFeeBalance.toLocaleString()}`} 
          icon={DollarSign} 
          color={totalFeeBalance > 0 ? 'orange' : 'purple'} 
          subtitle={totalFeeBalance > 0 ? 'Outstanding' : 'Fully paid'} 
        />
        <StatsCard 
          title="Notices" 
          value={unreadNotices} 
          icon={Bell} 
          color="orange" 
          subtitle="Unread messages" 
        />
      </div>

      {/* Children Cards with Detailed Assessments */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">My Children's Progress</h3>
        
        {children.map((child) => (
          <div key={child.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Child Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                    {child.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold">{child.name}</h4>
                    <p className="text-blue-100">{child.grade} • {child.admissionNumber}</p>
                    <p className="text-blue-200 text-sm mt-1">{child.currentTerm}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getPerformanceColor(child.performanceLevel)}`}>
                    {child.overallPerformance}
                  </span>
                </div>
              </div>
            </div>

            {/* Child Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Award className="text-yellow-600" size={20} />
                  <span className="text-sm text-gray-600">Overall Grade</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{child.performanceLevel}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="text-green-600" size={20} />
                  <span className="text-sm text-gray-600">Avg Score</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(child.subjects.reduce((sum, s) => sum + s.score, 0) / child.subjects.length)}%
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span className="text-sm text-gray-600">Attendance</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{child.attendanceRate}%</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="text-purple-600" size={20} />
                  <span className="text-sm text-gray-600">Subjects</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{child.subjects.length}</p>
              </div>
            </div>

            {/* Subject Performance */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-bold text-gray-900">Subject Performance</h5>
                <BarChart3 className="text-gray-400" size={20} />
              </div>
              <div className="space-y-3">
                {child.subjects.map((subject, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{subject.name}</p>
                      <p className="text-sm text-gray-600">{subject.remarks}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-900">{subject.score}%</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPerformanceColor(subject.grade)}`}>
                          {subject.grade}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Analytics with Charts */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-bold text-gray-900">Performance Analytics</h5>
                <BarChart3 className="text-gray-400" size={20} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grade Distribution Chart */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <CircularChart
                    data={[
                      { name: 'EE', value: child.subjects.filter(s => s.grade === 'EE').length },
                      { name: 'ME', value: child.subjects.filter(s => s.grade === 'ME').length },
                      { name: 'AE', value: child.subjects.filter(s => s.grade === 'AE').length },
                      { name: 'BE', value: child.subjects.filter(s => s.grade === 'BE').length },
                    ].filter(item => item.value > 0)}
                    title="Grade Distribution"
                    type="donut"
                    size={200}
                    centerLabel={{ 
                      value: child.subjects.length.toString(), 
                      label: 'Subjects' 
                    }}
                  />
                </div>

                {/* Attendance Breakdown Chart */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <CircularChart
                    data={[
                      { name: 'Present', value: child.attendanceData.present },
                      { name: 'Absent', value: child.attendanceData.absent },
                    ]}
                    title="Attendance Breakdown"
                    type="pie"
                    size={200}
                  />
                </div>
              </div>
            </div>

            {/* Recent Assessments */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-bold text-gray-900">Recent Assessments</h5>
                <FileText className="text-gray-400" size={20} />
              </div>
              <div className="space-y-2">
                {child.recentAssessments.map((assessment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{assessment.subject}</p>
                      <p className="text-sm text-gray-600">{assessment.type} • {assessment.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">{assessment.score}%</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPerformanceColor(assessment.grade)}`}>
                        {assessment.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Remarks */}
            <div className="p-6 border-t">
              <h5 className="font-bold text-gray-900 mb-3">Teacher's Remarks</h5>
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="text-gray-700 italic">"{child.teacherRemarks}"</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-gray-50 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button 
                  onClick={() => handleViewAssessments(child)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  <BarChart3 size={20} />
                  View All Assessments
                </button>
                <button 
                  onClick={() => handleDownloadReportCard(child)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  <Download size={20} />
                  Download Report Card (PDF)
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold">
                  <Calendar size={20} />
                  View Attendance
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-3 text-center">
                Next report available: <span className="font-semibold">{child.nextReport}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* School Notices */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Recent School Notices</h3>
          <Bell className="text-gray-400" size={20} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <p className="font-semibold text-blue-900">Parent-Teacher Meeting</p>
              <p className="text-sm text-blue-700">Scheduled for next Friday at 2:00 PM. Please confirm your attendance.</p>
            </div>
            <span className="text-xs text-blue-600 flex-shrink-0">1 day ago</span>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <p className="font-semibold text-green-900">Term Report Cards Available</p>
              <p className="text-sm text-green-700">Download your children's term 2 report cards from their profiles above.</p>
            </div>
            <span className="text-xs text-green-600 flex-shrink-0">3 days ago</span>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
            <div className="flex-1">
              <p className="font-semibold text-purple-900">School Calendar Update</p>
              <p className="text-sm text-purple-700">Term 3 begins on April 28, 2025. Please ensure all fees are cleared before resumption.</p>
            </div>
            <span className="text-xs text-purple-600 flex-shrink-0">1 week ago</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition text-center">
            <FileText className="mx-auto mb-2 text-blue-600" size={24} />
            <p className="text-sm font-semibold text-blue-900">Academic Calendar</p>
          </button>
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition text-center">
            <DollarSign className="mx-auto mb-2 text-green-600" size={24} />
            <p className="text-sm font-semibold text-green-900">Fee Statement</p>
          </button>
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition text-center">
            <Bell className="mx-auto mb-2 text-purple-600" size={24} />
            <p className="text-sm font-semibold text-purple-900">All Notices</p>
          </button>
          <button className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition text-center">
            <BookOpen className="mx-auto mb-2 text-orange-600" size={24} />
            <p className="text-sm font-semibold text-orange-900">Contact Teachers</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
