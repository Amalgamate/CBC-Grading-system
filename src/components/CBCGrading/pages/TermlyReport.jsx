/**
 * Termly Report Page
 * Now with PDF Download functionality!
 */

import React, { useState, useMemo, useCallback } from 'react';
import { FileText, Printer, Edit3, ArrowLeft, User, ArrowRight, Filter, Loader } from 'lucide-react';
import { generatePDFWithLetterhead } from '../../../utils/simplePdfGenerator';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';
import DownloadReportButton from '../shared/DownloadReportButton';
import SmartLearnerSearch from '../shared/SmartLearnerSearch';
import { getCurrentAcademicYear } from '../utils/academicYear';

const TermlyReport = ({ learners, brandingSettings }) => {
  const { showSuccess, showError } = useNotifications();
  const [viewMode, setViewMode] = useState('setup'); // 'setup' | 'report'
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('TERM_1');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const grades = [
    { value: 'all', label: 'All Classes' },
    { value: 'PP1', label: 'PP1' },
    { value: 'PP2', label: 'PP2' },
    { value: 'GRADE_1', label: 'Grade 1' },
    { value: 'GRADE_2', label: 'Grade 2' },
    { value: 'GRADE_3', label: 'Grade 3' },
    { value: 'GRADE_4', label: 'Grade 4' },
    { value: 'GRADE_5', label: 'Grade 5' },
    { value: 'GRADE_6', label: 'Grade 6' },
    { value: 'GRADE_7', label: 'Grade 7' },
    { value: 'GRADE_8', label: 'Grade 8' },
    { value: 'GRADE_9', label: 'Grade 9' },
  ];

  const terms = [
    { value: 'TERM_1', label: 'Term 1' },
    { value: 'TERM_2', label: 'Term 2' },
    { value: 'TERM_3', label: 'Term 3' }
  ];

  const filteredLearners = useMemo(() => {
    let filtered = learners?.filter(l => l.status === 'ACTIVE' || l.status === 'Active') || [];
    if (selectedGrade !== 'all') {
      filtered = filtered.filter(l => l.grade === selectedGrade);
    }
    return filtered;
  }, [learners, selectedGrade]);

  const selectedLearner = learners?.find(l => l.id === selectedLearnerId);

  const fetchReportData = useCallback(async () => {
    if (!selectedLearnerId) return;
    
    setLoading(true);
    try {
      const response = await api.reports.getTermlyReport(selectedLearnerId, {
        term: selectedTerm,
        academicYear: academicYear
      });

      if (response.success) {
        setReportData(response.data);
        setViewMode('report');
      } else {
        throw new Error(response.message || 'Failed to load report');
      }
    } catch (error) {
      console.error('Error fetching termly report:', error);
      showError(error.message || 'Failed to load termly report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedLearnerId, selectedTerm, showError]);

  const handleGenerateReport = () => {
    if (selectedLearner) {
      fetchReportData();
    }
  };

  const handleReset = () => {
    setViewMode('setup');
    setSelectedLearnerId('');
    setReportData(null);
  };

  /**
   * Handle PDF Download
   * Generates and downloads the termly report as PDF
   */
  const handleDownloadPDF = async (onProgress) => {
    if (!selectedLearner) {
      showError('Please select a learner first');
      return { success: false, error: 'No learner selected' };
    }
    
    try {
      // Generate filename
      const filename = `${selectedLearner.firstName}_${selectedLearner.lastName}_${selectedTerm.replace(' ', '_')}_Report.pdf`;
      
      const schoolInfo = {
        schoolName: brandingSettings?.schoolName || 'Zawadi Junior School',
        address: 'P.O. Box 1234, Nairobi, Kenya',
        phone: '+254 700 000000',
        email: 'info@zawadijrn.ac.ke',
        website: 'www.zawadijrn.ac.ke',
        logoUrl: brandingSettings?.logoUrl || '/logo-zawadi.png',
        brandColor: brandingSettings?.brandColor || '#1e3a8a'
      };

      // Generate PDF from the report content
      const result = await generatePDFWithLetterhead(
        'termly-report-content',
        filename,
        schoolInfo,
        {
          scale: 2, // Higher quality
          multiPage: true, // Support multiple pages if needed
          onProgress
        }
      );

      if (result.success) {
        showSuccess('Report downloaded successfully!');
        return { success: true };
      } else {
        throw new Error(result.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      showError('Failed to generate PDF. Please try again.');
      return { success: false, error: error.message };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* SETUP VIEW */}
      {viewMode === 'setup' && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 max-w-3xl mx-auto mt-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
               <FileText size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Termly Report</h2>
            <p className="text-gray-500">Select a learner to generate their end of term report</p>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Learner</label>
              
              {/* Grade Filter Pills */}
              <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2 -mx-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <div className="flex items-center justify-center min-w-[24px] text-gray-400">
                  <Filter size={14} />
                </div>
                {grades.map(grade => (
                  <button
                    key={grade.value}
                    onClick={() => {
                        setSelectedGrade(grade.value);
                        setSelectedLearnerId(''); // Clear selection on filter change
                    }}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedGrade === grade.value 
                        ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-100' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
                    }`}
                  >
                    {grade.label}
                  </button>
                ))}
              </div>

              <SmartLearnerSearch
                learners={filteredLearners}
                selectedLearnerId={parseInt(selectedLearnerId) || ''}
                onSelect={setSelectedLearnerId}
                placeholder={selectedGrade === 'all' ? "Search all learners..." : `Search in ${grades.find(g => g.value === selectedGrade)?.label}...`}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Term
              </label>
              <select 
                value={selectedTerm} 
                onChange={(e) => setSelectedTerm(e.target.value)} 
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {terms.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              onClick={handleGenerateReport}
              disabled={!selectedLearnerId || loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Generating...' : 'Generate Report'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* REPORT VIEW */}
      {viewMode === 'report' && reportData && (
        <>
          {/* Compact Context Header - Hidden on Print */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-20 print:hidden">
             <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                <User size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                  {reportData.learner.firstName} {reportData.learner.lastName}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                  <span>{reportData.learner.admissionNumber}</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                    {reportData.term} {reportData.academicYear}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
              >
                <Edit3 size={16} />
                Change
              </button>
              
              <DownloadReportButton 
                onDownload={handleDownloadPDF}
                label="PDF"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-semibold text-sm flex items-center gap-2"
              />
              
              <button 
                onClick={handlePrint} 
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                title="Print Report"
              >
                <Printer size={20} />
              </button>
            </div>
          </div>

          {/* Report Content - This will be converted to PDF */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* On-Screen Header (Hidden in Print/PDF as Letterhead is added) */}
          <div className="bg-blue-900 text-white p-4 text-center print:hidden">
            <h2 className="text-xl font-bold">Zawadi Junior School</h2>
            <p className="opacity-80 text-sm">Excellence in Competency Based Curriculum</p>
          </div>

          <div id="termly-report-content" className="p-4">
            {/* Report Title */}
            <div className="text-center border-b border-gray-200 pb-2 mb-3">
              <h2 className="text-lg font-bold text-gray-800 mb-0.5">End of {reportData.term.replace('_', ' ')} Report</h2>
              <p className="text-sm text-gray-600 font-semibold">Academic Year {reportData.academicYear}</p>
            </div>

            {/* Student Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div>
                <p className="font-semibold text-gray-700 text-[10px] mb-0.5 uppercase tracking-wider">Student Name</p>
                <p className="text-gray-900 text-xs font-bold">{reportData.learner.firstName} {reportData.learner.lastName}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-[10px] mb-0.5 uppercase tracking-wider">Admission No</p>
                <p className="text-gray-900 text-xs font-bold">{reportData.learner.admissionNumber}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-[10px] mb-0.5 uppercase tracking-wider">Class</p>
                <p className="text-gray-900 text-xs font-bold">{reportData.learner.grade} {reportData.learner.stream ? `- ${reportData.learner.stream}` : ''}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700 text-[10px] mb-0.5 uppercase tracking-wider">Attendance</p>
                <p className="text-gray-900 text-xs font-bold">
                  {reportData.attendance?.attendancePercentage || 0}% 
                  {reportData.attendance?.attendancePercentage >= 95 ? ' (Excellent)' : 
                   reportData.attendance?.attendancePercentage >= 80 ? ' (Good)' : ''}
                </p>
              </div>
            </div>

            {/* Academic Performance */}
            <div className="border-t border-gray-200 pt-3">
              <h3 className="text-sm font-bold text-gray-800 mb-2">Academic Performance</h3>
              
              {(reportData.summative?.summary?.bySubject || []).length > 0 ? (
                <table className="w-full mb-4 border-collapse text-xs">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-semibold">Subject</th>
                      <th className="px-2 py-1.5 text-center font-semibold">Marks</th>
                      <th className="px-2 py-1.5 text-center font-semibold">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.summative.summary.bySubject.map((subject, i) => (
                      <tr key={subject.subject} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-2 py-1.5 font-medium text-gray-800">{subject.subject}</td>
                        <td className="px-2 py-1.5 text-center text-gray-700">{subject.averagePercentage}%</td>
                        <td className="px-2 py-1.5 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            ['A', 'B'].includes(subject.grade) ? 'bg-green-100 text-green-800' : 
                            ['C'].includes(subject.grade) ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {subject.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4 text-gray-500 text-xs italic mb-4 bg-gray-50 rounded-lg">
                  No academic results available for this term.
                </div>
              )}

              {/* Comments Section */}
              <div className="space-y-2">
                <div className="bg-blue-50 p-2 rounded-lg border-l-4 border-blue-500 text-xs">
                  <p className="font-bold text-gray-800 mb-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                    <span className="text-blue-600">📝</span>
                    Class Teacher's Comment
                  </p>
                  <p className="text-gray-700 leading-snug">
                    {reportData.comments?.classTeacher || 'No comment provided.'}
                  </p>
                </div>

                <div className="bg-green-50 p-2 rounded-lg border-l-4 border-green-500 text-xs">
                  <p className="font-bold text-gray-800 mb-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                    <span className="text-green-600">✓</span>
                    Head Teacher's Comment
                  </p>
                  <p className="text-gray-700 leading-snug">
                    {reportData.comments?.headTeacher || 'No comment provided.'}
                  </p>
                </div>
              </div>

              {/* Footer Information */}
              <div className="mt-4 pt-3 border-t border-gray-200 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="font-bold text-gray-800 mb-0.5">Next Term Begins:</p>
                  <p className="text-gray-700">
                    {reportData.comments?.nextTermOpens ? new Date(reportData.comments.nextTermOpens).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 'TBA'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 mb-0.5">Date Issued:</p>
                  <p className="text-gray-700">{new Date(reportData.generatedDate || Date.now()).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}</p>
                </div>
              </div>

              {/* Signature Lines */}
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <div className="border-t border-gray-400 pt-1 mt-6">
                    <p className="text-center text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Class Teacher's Signature</p>
                  </div>
                </div>
                <div>
                  <div className="border-t border-gray-400 pt-1 mt-6">
                    <p className="text-center text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Parent's Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default TermlyReport;
