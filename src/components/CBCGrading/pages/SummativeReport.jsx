/**
 * Summative Report Page - ENHANCED WITH API INTEGRATION
 * View summative test results with real data from backend
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Printer, FileText, Search, Loader, TrendingUp, Award, Edit3, ArrowRight, Filter } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { generatePDFWithLetterhead } from '../../../utils/simplePdfGenerator';
import api from '../../../services/api';
import DownloadReportButton from '../shared/DownloadReportButton';
import SmartLearnerSearch from '../shared/SmartLearnerSearch';

const SummativeReport = ({ learners, brandingSettings }) => {
  const { showSuccess, showError } = useNotifications();
  
  // UI State
  const [viewMode, setViewMode] = useState('setup'); // 'setup' | 'report'
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('TERM_1');
  
  // Data State
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

  const fetchReportData = React.useCallback(async () => {
    if (!selectedLearnerId) return;
    
    setLoading(true);
    try {
      const response = await api.reports.getSummativeReport(selectedLearnerId, {
        term: selectedTerm,
        academicYear: 2026
      });

      if (response.success) {
        setReportData(response.data);
        setViewMode('report');
      } else {
        throw new Error(response.message || 'Failed to load report');
      }
    } catch (error) {
      console.error('Error fetching summative report:', error);
      showError(error.message || 'Failed to load summative report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedLearnerId, selectedTerm, showError]);

  const handleDownloadPDF = async (onProgress) => {
    if (!selectedLearner || !reportData) {
      showError('Please select a learner and ensure report data is loaded');
      return { success: false, error: 'No data' };
    }

    try {
      const filename = `${selectedLearner.firstName}_${selectedLearner.lastName}_Summative_${terms.find(t => t.value === selectedTerm)?.label.replace(' ', '_')}_Report.pdf`;
      
      const schoolInfo = {
        schoolName: brandingSettings?.schoolName || 'Zawadi JRN Academy',
        address: 'P.O. Box 1234, Nairobi, Kenya',
        phone: '+254 700 000000',
        email: 'info@zawadijrn.ac.ke',
        website: 'www.zawadijrn.ac.ke',
        logoUrl: brandingSettings?.logoUrl || '/logo-zawadi.png',
        brandColor: brandingSettings?.brandColor || '#1e3a8a'
      };

      const result = await generatePDFWithLetterhead(
        'summative-report-content',
        filename,
        schoolInfo,
        {
          scale: 2,
          multiPage: true,
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
      showError('Failed to generate PDF: ' + error.message);
      return { success: false, error: error.message };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const calculateGradeColor = (grade) => {
    switch(grade) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'E': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPerformanceMessage = (percentage) => {
    if (percentage >= 80) return { message: 'Excellent performance! Keep up the outstanding work!', color: 'text-green-700' };
    if (percentage >= 65) return { message: 'Good performance. Continue working hard!', color: 'text-blue-700' };
    if (percentage >= 50) return { message: 'Satisfactory performance. Aim higher!', color: 'text-yellow-700' };
    if (percentage >= 40) return { message: 'Fair performance. More effort needed.', color: 'text-orange-700' };
    return { message: 'Needs significant improvement. Seek extra help.', color: 'text-red-700' };
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* SETUP MODE */}
      {viewMode === 'setup' && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 max-w-3xl mx-auto mt-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
               <FileText size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Summative Report</h2>
            <p className="text-gray-500">Select a learner to generate their summative report</p>
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
                selectedLearnerId={selectedLearnerId}
                onSelect={setSelectedLearnerId}
                placeholder={selectedGrade === 'all' ? "Search all learners..." : `Search in ${grades.find(g => g.value === selectedGrade)?.label}...`}
              />
            </div>
          
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Term</label>
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
              onClick={fetchReportData}
              disabled={!selectedLearnerId || loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Generating...' : 'Generate Report'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* REPORT MODE */}
      {viewMode === 'report' && reportData && selectedLearner && (
        <>
          {/* Compact Context Header - Hidden on Print */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-20 print:hidden">
             <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {selectedLearner.firstName[0]}{selectedLearner.lastName[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                  {selectedLearner.firstName} {selectedLearner.lastName}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                  <span>{selectedLearner.admissionNumber}</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                    {terms.find(t => t.value === selectedTerm)?.label} 2026
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewMode('setup')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
              >
                <Edit3 size={16} />
                Change Learner
              </button>
              <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>
              
              <DownloadReportButton 
                onDownload={handleDownloadPDF}
                label="PDF"
                successLabel="Ready"
                variant="compact" // Assuming the component supports this or handles className override, if not it will just render default
              />
              
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 transition font-medium"
              >
                <Printer size={18} />
                <span className="hidden md:inline">Print</span>
              </button>
            </div>
          </div>

          {/* Report Content - This is what gets printed/downloaded */}
          <div id="summative-report-content" className="bg-white rounded-lg shadow p-4 max-w-5xl mx-auto print:shadow-none print:w-full">
            
            {/* Report Header Title */}
            <div className="text-center mb-4 pb-2 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide mb-1">Summative Assessment Report</h2>
              <p className="text-gray-500 text-xs font-semibold">Academic Year 2026 - {terms.find(t => t.value === selectedTerm)?.label}</p>
            </div>

            {/* Learner Information Grid */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Learner Name</p>
                  <p className="font-bold text-gray-900 text-xs">
                    {reportData.learner.firstName} {reportData.learner.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Admission No</p>
                  <p className="font-bold text-gray-900 text-xs">{reportData.learner.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Grade / Class</p>
                  <p className="font-bold text-gray-900 text-xs">
                    {reportData.learner.grade} <span className="text-gray-400">/</span> {reportData.learner.stream || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Generated On</p>
                  <p className="font-bold text-gray-900 text-xs">
                    {new Date().toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Summary Cards */}
              <div className="mb-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 border-l-4 border-purple-600 pl-2">Performance Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-2 border border-gray-100 rounded-lg text-center bg-white shadow-sm">
                    <div className="flex justify-center mb-1 text-blue-500"><FileText size={16} /></div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Tests Taken</p>
                    <p className="text-xl font-bold text-gray-800 mt-0.5">{reportData.summary?.totalTests || 0}</p>
                  </div>

                  <div className="p-2 border border-purple-100 bg-purple-50/50 rounded-lg text-center">
                    <div className="flex justify-center mb-1 text-purple-500"><TrendingUp size={16} /></div>
                    <p className="text-[10px] text-purple-600 uppercase font-semibold">Mean Score</p>
                    <p className="text-xl font-bold text-purple-700 mt-0.5">{(reportData.summary?.meanScore || 0).toFixed(1)}%</p>
                  </div>

                  <div className="p-2 border border-green-100 bg-green-50/50 rounded-lg text-center">
                    <div className="flex justify-center mb-1 text-green-500"><Award size={16} /></div>
                    <p className="text-[10px] text-green-600 uppercase font-semibold">Overall Grade</p>
                    <p className="text-xl font-bold text-green-700 mt-0.5">{reportData.summary?.overallGrade || '-'}</p>
                  </div>

                  <div className="p-2 border border-orange-100 bg-orange-50/50 rounded-lg text-center">
                    <div className="flex justify-center mb-1 text-orange-500"><Award size={16} /></div>
                    <p className="text-[10px] text-orange-600 uppercase font-semibold">Position</p>
                    <p className="text-xl font-bold text-orange-700 mt-0.5">{reportData.summary?.classPosition || '-'}</p>
                  </div>
                </div>
                
                {/* Encouragement Message */}
                <div className={`mt-2 text-center text-[10px] font-bold italic py-1.5 px-3 rounded-full bg-gray-50 inline-block w-full ${getPerformanceMessage(reportData.summary?.meanScore || 0).color}`}>
                  "{getPerformanceMessage(reportData.summary?.meanScore || 0).message}"
                </div>
              </div>

            {/* Test Results Table */}
            <div className="mb-4">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 border-l-4 border-purple-600 pl-2">Detailed Results</h4>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200 text-gray-600 uppercase text-[10px] tracking-wider">
                      <th className="px-3 py-1.5 text-left font-bold">Subject / Learning Area</th>
                      <th className="px-2 py-1.5 text-center font-bold">Score</th>
                      <th className="px-2 py-1.5 text-center font-bold">Total</th>
                      <th className="px-2 py-1.5 text-center font-bold">%</th>
                      <th className="px-2 py-1.5 text-center font-bold">Grade</th>
                      <th className="px-3 py-1.5 text-left font-bold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(reportData.results || []).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-gray-400 italic">
                          No test results recorded for this term.
                        </td>
                      </tr>
                    ) : (
                      (reportData.results || []).map((result, idx) => {
                        const percentage = (result.marksObtained / result.test.totalMarks) * 100;
                        return (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                            <td className="px-3 py-1.5">
                              <div className="font-bold text-gray-800">{result.test.learningArea}</div>
                              <div className="text-[10px] text-gray-500">{result.test.name}</div>
                            </td>
                            <td className="px-2 py-1.5 text-center font-bold text-gray-800">
                              {result.marksObtained}
                            </td>
                            <td className="px-2 py-1.5 text-center text-gray-500">
                              {result.test.totalMarks}
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className="font-bold text-blue-600">{percentage.toFixed(1)}%</span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${calculateGradeColor(result.grade)}`}>
                                {result.grade}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-gray-600 italic">
                              {result.teacherComment || '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teacher's Comment */}
            {reportData.teacherComment && (
              <div className="mt-4 break-inside-avoid">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 border-l-4 border-purple-600 pl-2">Class Teacher's Remarks</h4>
                <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                  <p className="text-gray-800 leading-relaxed italic text-sm font-serif">"{reportData.teacherComment.comment}"</p>
                  <div className="mt-3 flex justify-between items-center pt-2 border-t border-gray-200">
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{reportData.teacherComment.teacherName}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Class Teacher</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-600">
                        Date: {new Date(reportData.teacherComment.date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className="mt-6 pt-4 border-t-2 border-gray-100 break-inside-avoid">
               <div className="flex justify-between items-end">
                 <div className="text-center w-48">
                   <div className="border-b border-gray-300 pb-1 mb-1"></div>
                   <p className="text-[10px] font-bold uppercase text-gray-500">Principal's Signature</p>
                 </div>
                 <div className="text-center w-48">
                   <div className="border-b border-gray-300 pb-1 mb-1"></div>
                   <p className="text-[10px] font-bold uppercase text-gray-500">Official Stamp</p>
                 </div>
               </div>
            </div>
          </div>
        </>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="mx-auto animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-gray-600 font-medium">Generating Report...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummativeReport;
