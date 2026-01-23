/**
 * Termly Report Page
 * Now with PDF Download functionality!
 */

import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { generatePDFFromElement } from '../../../utils/simplePdfGenerator';
import { useNotifications } from '../hooks/useNotifications';

const TermlyReport = ({ learners }) => {
  const { showSuccess, showError } = useNotifications();
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const selectedLearner = learners.find(l => l.id === parseInt(selectedLearnerId));

  /**
   * Handle PDF Download
   * Generates and downloads the termly report as PDF
   */
  const handleDownloadPDF = async () => {
    if (!selectedLearner) {
      showError('Please select a learner first');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate filename
      const filename = `${selectedLearner.firstName}_${selectedLearner.lastName}_${selectedTerm.replace(' ', '_')}_Report.pdf`;
      
      // Generate PDF from the report content
      const result = await generatePDFFromElement(
        'termly-report-content',
        filename,
        {
          scale: 2, // Higher quality
          multiPage: true, // Support multiple pages if needed
          backgroundColor: '#ffffff'
        }
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
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Selection Controls */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Learner
            </label>
            <select 
              value={selectedLearnerId} 
              onChange={(e) => setSelectedLearnerId(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Learner</option>
              {learners.filter(l => l.status === 'ACTIVE' || l.status === 'Active').map(l => (
                <option key={l.id} value={l.id}>
                  {l.firstName} {l.lastName} ({l.admNo})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Term
            </label>
            <select 
              value={selectedTerm} 
              onChange={(e) => setSelectedTerm(e.target.value)} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {['Term 1', 'Term 2', 'Term 3'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Download Button - Only show when learner is selected */}
        {selectedLearnerId && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              <Download size={20} />
              {isGenerating ? 'Generating PDF...' : 'Download PDF Report'}
            </button>

            {isGenerating && (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                <span className="text-sm">Please wait...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Content - This will be converted to PDF */}
      {selectedLearner && (
        <div id="termly-report-content" className="bg-white rounded-xl shadow-md p-8">
          {/* School Header */}
          <div className="text-center border-b-2 border-gray-300 pb-6 mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Zawadi Junior School</h2>
            <p className="text-lg text-gray-600 font-semibold">End of {selectedTerm} Report</p>
            <p className="text-gray-500">Academic Year 2026</p>
          </div>

          {/* Student Information */}
          <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-6 rounded-lg">
            <div>
              <p className="font-semibold text-gray-700 text-sm mb-1">Student Name:</p>
              <p className="text-gray-900 text-lg">{selectedLearner.firstName} {selectedLearner.lastName}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 text-sm mb-1">Admission Number:</p>
              <p className="text-gray-900 text-lg">{selectedLearner.admNo}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 text-sm mb-1">Class:</p>
              <p className="text-gray-900 text-lg">{selectedLearner.grade} - {selectedLearner.stream}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 text-sm mb-1">Attendance:</p>
              <p className="text-gray-900 text-lg">95% (Excellent)</p>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="border-t-2 border-gray-300 pt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Academic Performance</h3>
            <table className="w-full mb-8 border-collapse">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Subject</th>
                  <th className="px-4 py-3 text-center font-semibold">Marks</th>
                  <th className="px-4 py-3 text-center font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody>
                {['Mathematics', 'English', 'Kiswahili', 'Science', 'Social Studies'].map((subj, i) => (
                  <tr key={subj} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{subj}</td>
                    <td className="px-4 py-3 text-center text-gray-700">{85 - i*5}/100</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-4 py-1 rounded-full font-bold ${
                        i === 0 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {i === 0 ? 'A' : 'B'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Comments Section */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
                <p className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-blue-600">📝</span>
                  Class Teacher's Comment:
                </p>
                <p className="text-gray-700 leading-relaxed">
                  {selectedLearner.firstName} is an excellent student who participates actively in class. 
                  Shows strong understanding of concepts and demonstrates good leadership qualities. 
                  Keep up the good work!
                </p>
              </div>

              <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
                <p className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Head Teacher's Comment:
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Outstanding performance throughout the term. {selectedLearner.firstName} has shown 
                  remarkable progress and dedication. Promoted to the next grade with distinction.
                </p>
              </div>
            </div>

            {/* Footer Information */}
            <div className="mt-8 pt-6 border-t-2 border-gray-300 grid grid-cols-2 gap-4">
              <div>
                <p className="font-bold text-gray-800 mb-1">Next Term Begins:</p>
                <p className="text-gray-700">May 5, 2026</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800 mb-1">Date Issued:</p>
                <p className="text-gray-700">{new Date().toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}</p>
              </div>
            </div>

            {/* Signature Lines */}
            <div className="mt-8 grid grid-cols-2 gap-8">
              <div>
                <div className="border-t-2 border-gray-400 pt-2 mt-16">
                  <p className="text-center text-sm font-semibold text-gray-700">Class Teacher's Signature</p>
                </div>
              </div>
              <div>
                <div className="border-t-2 border-gray-400 pt-2 mt-16">
                  <p className="text-center text-sm font-semibold text-gray-700">Parent's Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedLearnerId && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Learner</h3>
          <p className="text-gray-600">Choose a learner from the dropdown above to view their termly report</p>
        </div>
      )}
    </div>
  );
};

export default TermlyReport;
