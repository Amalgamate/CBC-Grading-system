/**
 * Formative Report Page
 * View formative assessment reports for learners
 */

import React, { useState } from 'react';
import { FileText, Download, Printer, Search } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { useNotifications } from '../hooks/useNotifications';

const FormativeReport = ({ learners }) => {
  const { showSuccess } = useNotifications();
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const [selectedArea, setSelectedArea] = useState('all');

  const selectedLearner = learners.find(l => l.id === parseInt(selectedLearnerId));

  const sampleData = {
    'Mathematics Activities': { ee: 12, me: 8, ae: 3, be: 1 },
    'Literacy Activities': { ee: 10, me: 10, ae: 4, be: 0 },
    'Kiswahili Activities': { ee: 8, me: 12, ae: 4, be: 0 },
    'Environmental Activities': { ee: 15, me: 7, ae: 2, be: 0 },
    'Creative Activities': { ee: 18, me: 6, ae: 0, be: 0 },
  };

  const handleDownload = () => showSuccess('Report downloaded successfully!');
  const handlePrint = () => {  window.print(); showSuccess('Printing report...'); };

  return (
    <div className="space-y-6">
      <PageHeader title="Formative Report" subtitle="View learner formative assessment reports" icon={FileText} />

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Select Learner & Term</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Learner</label>
            <select value={selectedLearnerId} onChange={(e) => setSelectedLearnerId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Select Learner</option>
              {learners.filter(l => l.status === 'Active').map(l => (
                <option key={l.id} value={l.id}>{l.firstName} {l.lastName} ({l.admNo})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Term</label>
            <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option>Term 1</option>
              <option>Term 2</option>
              <option>Term 3</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Area</label>
            <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="all">All Learning Areas</option>
              {Object.keys(sampleData).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
        {selectedLearnerId && (
          <div className="mt-4 flex gap-3">
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              <Download size={18} /> Download PDF
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Printer size={18} /> Print Report
            </button>
          </div>
        )}
      </div>

      {selectedLearner && (
        <>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4">Learner Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600">Name</p>
                <p className="text-gray-900">{selectedLearner.firstName} {selectedLearner.lastName}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Admission No</p>
                <p className="text-gray-900">{selectedLearner.admNo}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Grade & Stream</p>
                <p className="text-gray-900">{selectedLearner.grade} - {selectedLearner.stream}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600">Term</p>
                <p className="text-gray-900">{selectedTerm} 2026</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-6">Assessment Summary by Learning Area</h3>
            <div className="space-y-4">
              {Object.entries(sampleData).map(([area, data]) => (
                <div key={area} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-800 mb-3">{area}</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-green-700 text-xs font-semibold">Exceeds Expectations</p>
                      <p className="text-2xl font-bold text-green-800">{data.ee}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <p className="text-blue-700 text-xs font-semibold">Meets Expectations</p>
                      <p className="text-2xl font-bold text-blue-800">{data.me}</p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                      <p className="text-yellow-700 text-xs font-semibold">Approaches Expectations</p>
                      <p className="text-2xl font-bold text-yellow-800">{data.ae}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded p-3">
                      <p className="text-red-700 text-xs font-semibold">Below Expectations</p>
                      <p className="text-2xl font-bold text-red-800">{data.be}</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-gray-50 rounded p-3">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Teacher's Comment:</p>
                    <p className="text-sm text-gray-600">{selectedLearner.firstName} shows excellent progress in {area.toLowerCase()}. Continue with the good work!</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
            <h3 className="text-lg font-bold mb-3">Overall Performance Summary</h3>
            <p className="text-blue-100 mb-4">{selectedLearner.firstName} {selectedLearner.lastName} has demonstrated excellent progress during {selectedTerm} 2026. The learner excels in creative activities and shows consistent performance across all learning areas.</p>
            <div className="border-t border-blue-400 pt-4 mt-4">
              <p className="font-semibold">Class Teacher's General Comment:</p>
              <p className="text-blue-100">Keep up the excellent work! Continue to participate actively in all activities.</p>
            </div>
          </div>
        </>
      )}

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
