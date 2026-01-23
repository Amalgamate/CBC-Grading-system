/**
 * Formative Report Page - UPDATED WITH REAL DATA
 * View formative assessment reports for learners with actual API data
 */

import React, { useState, useEffect } from 'react';
import { FileText, Download, Printer, Search, Loader } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';
import { generatePDFFromElement, generatePDFWithLetterhead } from '../../../utils/simplePdfGenerator';

const FormativeReport = ({ learners, brandingSettings }) => {
  const { showSuccess, showError } = useNotifications();
  
  // UI State
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('TERM_1');
  const [selectedArea, setSelectedArea] = useState('all');
  
  // Data State
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const terms = [
    { value: 'TERM_1', label: 'Term 1' },
    { value: 'TERM_2', label: 'Term 2' },
    { value: 'TERM_3', label: 'Term 3' }
  ];

  // Get selected learner
  const selectedLearner = learners?.find(l => l.id === selectedLearnerId);

  // Fetch report data when learner or term changes
  useEffect(() => {
    if (selectedLearnerId && selectedTerm) {
      fetchReportData();
    }
  }, [selectedLearnerId, selectedTerm]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await api.reports.getFormativeReport(selectedLearnerId, {
        term: selectedTerm,
        academicYear: 2026
      });

      if (response.success) {
        setReportData(response.data);
      } else {
        throw new Error(response.message || 'Failed to load report');
      }
    } catch (error) {
      console.error('Error fetching formative report:', error);
      showError(error.message || 'Failed to load formative report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportData) {
      showError('No report data available');
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const filename = `${reportData.learner.firstName}_${reportData.learner.lastName}_Formative_${selectedTerm}_Report.pdf`;
      
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
        'formative-report-content',
        filename,
        schoolInfo,
        { scale: 2, multiPage: true }
      );

      if (result.success) {
        showSuccess('Report downloaded successfully!');
      } else {
        throw new Error(result.error || 'PDF generation failed');
      }
    } catch (error) {
      console.error('PDF generation error:', error);
      showError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
    showSuccess('Printing report...');
  };

  // Get rating color
  const getRatingColor = (rating) => {
    if (!rating) return 'bg-gray-100 text-gray-800';
    if (rating.startsWith('EE')) return 'bg-green-100 text-green-800';
    if (rating.startsWith('ME')) return 'bg-blue-100 text-blue-800';
    if (rating.startsWith('AE')) return 'bg-yellow-100 text-yellow-800';
    if (rating.startsWith('BE')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Get rating label
  const getRatingLabel = (rating) => {
    if (!rating) return 'Not Assessed';
    const labels = {
      'EE1': 'Exceeds Expectations 1',
      'EE2': 'Exceeds Expectations 2',
      'ME1': 'Meets Expectations 1',
      'ME2': 'Meets Expectations 2',
      'AE1': 'Approaches Expectations 1',
      'AE2': 'Approaches Expectations 2',
      'BE1': 'Below Expectations 1',
      'BE2': 'Below Expectations 2',
    };
    return labels[rating] || rating;
  };

  // Filter assessments by learning area
  const filteredAssessments = selectedArea === 'all' 
    ? reportData?.assessments || []
    : reportData?.assessments.filter(a => a.learningArea === selectedArea) || [];

  return (
    <div className="space-y-6">
      
      {/* Selection Panel */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Select Learner & Term</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Learner</label>
            <select 
              value={selectedLearnerId} 
              onChange={(e) => setSelectedLearnerId(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Learner</option>
              {learners?.filter(l => l.status === 'ACTIVE' || l.status === 'Active').map(l => (
                <option key={l.id} value={l.id}>
                  {l.firstName} {l.lastName} ({l.admissionNumber})
                </option>
              ))}
            </select>
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
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Area</label>
            <select 
              value={selectedArea} 
              onChange={(e) => setSelectedArea(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={!reportData}
            >
              <option value="all">All Learning Areas</option>
              {reportData?.summary.learningAreasAssessed.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Action Buttons */}
        {selectedLearnerId && reportData && (
          <div className="mt-4 flex gap-3">
            <button 
              onClick={handleDownloadPDF} 
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download PDF
                </>
              )}
            </button>
            <button 
              onClick={handlePrint} 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <Printer size={18} />
              Print Report
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Loader className="mx-auto animate-spin text-blue-600 mb-4" size={48} />
          <p className="text-gray-600">Loading report data...</p>
        </div>
      )}

      {/* Report Content */}
      {!loading && reportData && (
        <>
          {/* Learner Information */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Learner Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Name</p>
                <p className="text-gray-900">
                  {reportData.learner.firstName} {reportData.learner.middleName || ''} {reportData.learner.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Admission No</p>
                <p className="text-gray-900">{reportData.learner.admissionNumber}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Class</p>
                <p className="text-gray-900">{reportData.learner.grade} {reportData.learner.stream ? `- ${reportData.learner.stream}` : ''}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Term</p>
                <p className="text-gray-900">{terms.find(t => t.value === selectedTerm)?.label} 2026</p>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
            <h4 className="font-bold text-blue-900 mb-4">Performance Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-xs text-gray-600 font-semibold mb-1">Total Assessments</p>
                <p className="text-3xl font-bold text-blue-800">{reportData.summary.totalAssessments}</p>
              </div>
              <div className="bg-white rounded-lg p-4 text-center">
                <p className="text-xs text-gray-600 font-semibold mb-1">Average %</p>
                <p className="text-3xl font-bold text-purple-800">{reportData.summary.averagePercentage}%</p>
              </div>
              <div className="bg-green-100 rounded-lg p-4 text-center">
                <p className="text-xs text-green-700 font-semibold mb-1">Exceeding</p>
                <p className="text-3xl font-bold text-green-800">
                  {(reportData.summary.distribution.EE1 || 0) + (reportData.summary.distribution.EE2 || 0)}
                </p>
              </div>
              <div className="bg-blue-100 rounded-lg p-4 text-center">
                <p className="text-xs text-blue-700 font-semibold mb-1">Meeting</p>
                <p className="text-3xl font-bold text-blue-800">
                  {(reportData.summary.distribution.ME1 || 0) + (reportData.summary.distribution.ME2 || 0)}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-lg p-4 text-center">
                <p className="text-xs text-yellow-700 font-semibold mb-1">Approaching</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {(reportData.summary.distribution.AE1 || 0) + (reportData.summary.distribution.AE2 || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Printable Report Content */}
          <div id="formative-report-content" className="bg-white rounded-xl shadow-md p-8">
            <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">Formative Assessment Report</h3>
            
            {/* Assessments by Learning Area */}
            <div className="space-y-6">
              {filteredAssessments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No assessments found for the selected criteria
                </div>
              ) : (
                filteredAssessments.map((assessment, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-800">{assessment.learningArea}</h4>
                        {assessment.strand && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Strand:</span> {assessment.strand}
                            {assessment.subStrand && ` - ${assessment.subStrand}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getRatingColor(assessment.detailedRating)}`}>
                          {assessment.detailedRating} - {assessment.percentage}%
                        </span>
                        <p className="text-xs text-gray-600 mt-1">{getRatingLabel(assessment.detailedRating)}</p>
                      </div>
                    </div>

                    {/* Feedback Sections */}
                    {assessment.strengths && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-green-700 mb-1">✓ Strengths:</p>
                        <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">{assessment.strengths}</p>
                      </div>
                    )}

                    {assessment.areasImprovement && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-orange-700 mb-1">→ Areas for Improvement:</p>
                        <p className="text-sm text-gray-700 bg-orange-50 p-3 rounded">{assessment.areasImprovement}</p>
                      </div>
                    )}

                    {assessment.recommendations && (
                      <div className="mb-3">
                        <p className="text-sm font-semibold text-blue-700 mb-1">💡 Recommendations:</p>
                        <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">{assessment.recommendations}</p>
                      </div>
                    )}

                    {/* Teacher Info */}
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                      Assessed by: {assessment.teacher?.firstName} {assessment.teacher?.lastName}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Teacher's Overall Comment */}
            {reportData.teacherComment && (
              <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                <p className="font-bold text-gray-800 mb-2">Class Teacher's Comment:</p>
                <p className="text-gray-700">{reportData.teacherComment.classTeacherComment}</p>
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{reportData.teacherComment.classTeacherName}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(reportData.teacherComment.classTeacherDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>
            )}

            {/* Report Footer */}
            <div className="mt-8 pt-6 border-t-2 border-gray-300 text-center text-sm text-gray-500">
              <p>Generated on: {new Date(reportData.generatedDate).toLocaleString('en-GB')}</p>
              <p className="mt-2">This is an official document from {brandingSettings?.schoolName || 'Zawadi JRN Academy'}</p>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !reportData && selectedLearnerId && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Report Available</h3>
          <p className="text-gray-600">
            No formative assessments found for this learner in {terms.find(t => t.value === selectedTerm)?.label}
          </p>
        </div>
      )}

      {/* Initial Empty State */}
      {!selectedLearnerId && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Search className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Learner</h3>
          <p className="text-gray-600">Choose a learner from the dropdown above to view their formative report</p>
        </div>
      )}
    </div>
  );
};

export default FormativeReport;
