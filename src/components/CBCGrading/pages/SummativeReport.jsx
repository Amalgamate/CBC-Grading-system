/**
 * Summative Report Page
 */

import React, { useState } from 'react';
import { BarChart3, Download, Printer } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { useNotifications } from '../hooks/useNotifications';

const SummativeReport = ({ learners }) => {
  const { showSuccess } = useNotifications();
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');

  const selectedLearner = learners.find(l => l.id === parseInt(selectedLearnerId));

  const sampleResults = [
    { learningArea: 'Mathematics Activities', marks: 85, total: 100, grade: 'A', position: 3 },
    { learningArea: 'Literacy Activities', marks: 72, total: 100, grade: 'B', position: 8 },
    { learningArea: 'Kiswahili Activities', marks: 68, total: 100, grade: 'B', position: 12 },
    { learningArea: 'Environmental Activities', marks: 90, total: 100, grade: 'A', position: 1 }
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Summative Report" subtitle="View summative assessment reports" icon={BarChart3} />

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Learner</label>
            <select value={selectedLearnerId} onChange={(e) => setSelectedLearnerId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Select Learner</option>
              {learners.filter(l => l.status === 'Active').map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName} ({l.admNo})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Term</label>
            <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              {['Term 1', 'Term 2', 'Term 3'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        {selectedLearnerId && (
          <div className="mt-4 flex gap-3">
            <button onClick={() => showSuccess('Report downloaded!')} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              <Download size={18} /> Download
            </button>
            <button onClick={() => showSuccess('Printing...')} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Printer size={18} /> Print
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

          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Learning Area</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Marks</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Grade</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sampleResults.map((result, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-800">{result.learningArea}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{result.marks}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{result.total}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-bold text-blue-600">{Math.round((result.marks/result.total)*100)}%</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full font-bold ${
                        result.grade === 'A' ? 'bg-green-100 text-green-800' :
                        result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{result.grade}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">{result.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
            <h3 className="text-lg font-bold mb-3">Overall Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-purple-100">Mean Score</p>
                <p className="text-3xl font-bold">79%</p>
              </div>
              <div>
                <p className="text-purple-100">Overall Grade</p>
                <p className="text-3xl font-bold">B</p>
              </div>
              <div>
                <p className="text-purple-100">Class Position</p>
                <p className="text-3xl font-bold">5/30</p>
              </div>
            </div>
            <p className="mt-4 text-purple-100">Excellent performance. Keep up the good work!</p>
          </div>
        </>
      )}
    </div>
  );
};

export default SummativeReport;
