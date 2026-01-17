/**
 * Summative Assessment Page
 * Mark summative tests
 */

import React, { useState } from 'react';
import { Edit3, Save, TrendingUp } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { useNotifications } from '../hooks/useNotifications';

const SummativeAssessment = ({ learners }) => {
  const { showSuccess } = useNotifications();
  const [selectedTest, setSelectedTest] = useState('');
  const [marks, setMarks] = useState({});

  const tests = [
    { id: 1, name: 'Mathematics End of Term 1 - Grade 3', grade: 'Grade 3', stream: 'A', totalMarks: 100 },
    { id: 2, name: 'Literacy Mid-Term - Grade 4', grade: 'Grade 4', stream: 'B', totalMarks: 50 }
  ];

  const selectedTestData = tests.find(t => t.id === parseInt(selectedTest));
  const classLearners = selectedTestData ? learners.filter(l => l.grade === selectedTestData.grade && l.stream === selectedTestData.stream && l.status === 'Active') : [];

  const handleMarkChange = (learnerId, mark) => {
    setMarks(prev => ({ ...prev, [learnerId]: Math.min(mark, selectedTestData?.totalMarks || 100) }));
  };

  const calculateGrade = (mark, total) => {
    const percentage = (mark / total) * 100;
    if (percentage >= 80) return 'A';
    if (percentage >= 65) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'E';
  };

  const stats = {
    total: classLearners.length,
    marked: Object.keys(marks).filter(id => marks[id] > 0).length,
    average: Object.values(marks).length > 0 ? Math.round(Object.values(marks).reduce((a,b) => a+b, 0) / Object.values(marks).length) : 0
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Summative Assessment" subtitle="Mark summative tests for learners" icon={Edit3} />

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Test</label>
            <select value={selectedTest} onChange={(e) => setSelectedTest(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Choose a test to mark</option>
              {tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          {selectedTestData && (
            <div className="flex items-end">
              <div className="text-sm">
                <p className="text-gray-600">Total Marks</p>
                <p className="text-2xl font-bold text-blue-600">{selectedTestData.totalMarks}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedTestData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-700 text-sm font-semibold">Total Learners</p>
              <p className="text-3xl font-bold text-blue-800">{stats.total}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm font-semibold">Marked</p>
              <p className="text-3xl font-bold text-green-800">{stats.marked}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-purple-700 text-sm font-semibold">Class Average</p>
              <p className="text-3xl font-bold text-purple-800">{stats.average}%</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-6">Mark Learners - {selectedTestData.name}</h3>
            <div className="space-y-3">
              {classLearners.map(learner => {
                const mark = marks[learner.id] || 0;
                const percentage = (mark / selectedTestData.totalMarks) * 100;
                const grade = mark > 0 ? calculateGrade(mark, selectedTestData.totalMarks) : '-';
                
                return (
                  <div key={learner.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="md:col-span-2 flex items-center gap-3">
                        <span className="text-3xl">{learner.avatar}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{learner.firstName} {learner.lastName}</p>
                          <p className="text-sm text-gray-500">{learner.admNo}</p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Marks Scored</label>
                        <input type="number" min="0" max={selectedTestData.totalMarks} value={mark} onChange={(e) => handleMarkChange(learner.id, parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-lg" placeholder="0" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Percentage</p>
                        <p className="text-2xl font-bold text-gray-800">{mark > 0 ? Math.round(percentage) : 0}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Grade</p>
                        <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold ${
                          grade === 'A' ? 'bg-green-100 text-green-800' :
                          grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          grade === 'D' ? 'bg-orange-100 text-orange-800' :
                          grade === 'E' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-400'
                        }`}>{grade}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => showSuccess('Marks saved successfully!')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
              <Save size={20} /> Save Marks
            </button>
          </div>
        </>
      )}

      {!selectedTest && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <TrendingUp className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Test</h3>
          <p className="text-gray-600">Choose a published test from the dropdown above to start marking</p>
        </div>
      )}
    </div>
  );
};

export default SummativeAssessment;
