/**
 * Termly Report Page
 */

import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import PageHeader from '../shared/PageHeader';

const TermlyReport = ({ learners }) => {
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('Term 1');
  const selectedLearner = learners.find(l => l.id === parseInt(selectedLearnerId));

  return (
    <div className="space-y-6">
      <PageHeader title="Termly Report" subtitle="Comprehensive term reports" icon={FileText} />
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-2 gap-4">
          <select value={selectedLearnerId} onChange={(e) => setSelectedLearnerId(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">Select Learner</option>
            {learners.filter(l => l.status === 'Active').map(l => <option key={l.id} value={l.id}>{l.firstName} {l.lastName}</option>)}
          </select>
          <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)} className="px-4 py-2 border rounded-lg">
            {['Term 1', 'Term 2', 'Term 3'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      {selectedLearner && (
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="text-center border-b pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Zawadi Junior School</h2>
            <p className="text-gray-600">End of {selectedTerm} Report</p>
            <p className="text-gray-500">Academic Year 2026</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="font-semibold">Name:</p>
              <p>{selectedLearner.firstName} {selectedLearner.lastName}</p>
            </div>
            <div>
              <p className="font-semibold">Admission No:</p>
              <p>{selectedLearner.admNo}</p>
            </div>
            <div>
              <p className="font-semibold">Class:</p>
              <p>{selectedLearner.grade} - {selectedLearner.stream}</p>
            </div>
            <div>
              <p className="font-semibold">Attendance:</p>
              <p>95% (Excellent)</p>
            </div>
          </div>
          <div className="border-t pt-6">
            <h3 className="font-bold mb-4">Academic Performance</h3>
            <table className="w-full mb-6">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-center">Marks</th>
                  <th className="px-4 py-2 text-center">Grade</th>
                </tr>
              </thead>
              <tbody>
                {['Mathematics', 'English', 'Kiswahili', 'Science'].map((subj, i) => (
                  <tr key={subj} className="border-t">
                    <td className="px-4 py-2">{subj}</td>
                    <td className="px-4 py-2 text-center">{85 - i*5}/100</td>
                    <td className="px-4 py-2 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-bold">{i === 0 ? 'A' : 'B'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Class Teacher's Comment:</p>
              <p className="text-gray-700">{selectedLearner.firstName} is an excellent student who participates actively in class. Keep up the good work!</p>
            </div>
            <div className="mt-4 bg-green-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Head Teacher's Comment:</p>
              <p className="text-gray-700">Outstanding performance. Promoted to next grade.</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold">Next Term Begins:</p>
                <p>May 5, 2026</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">Date Issued:</p>
                <p>March 30, 2026</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermlyReport;
