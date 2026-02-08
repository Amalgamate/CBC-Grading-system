/**
 * Summary Report Page
 * Clean, minimal design matching Summative Assessment setup
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { configAPI } from '../../../../services/api';

const SummaryReportPage = () => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState('');
  const [availableStreams, setAvailableStreams] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStreams = async () => {
      if (user?.schoolId) {
        try {
          const resp = await configAPI.getStreamConfigs(user.schoolId);
          const arr = resp?.data || [];
          setAvailableStreams(arr.filter(s => s.active));
        } catch (error) {
          console.error('Failed to fetch streams:', error);
        }
      }
    };
    fetchStreams();
  }, [user?.schoolId]);

  const reportTypes = [
    { value: 'grade-report', label: 'Grade Report' },
    { value: 'stream-report', label: 'Stream Report' },
    { value: 'learner-report', label: 'Learner Report' },
    { value: 'learner-termly-report', label: 'Learner Termly Report' },
    { value: 'stream-ranking-report', label: 'Stream Ranking Report' },
    { value: 'stream-analysis-report', label: 'Stream Analysis Report' },
    { value: 'grade-analysis-report', label: 'Grade Analysis Report' }
  ];

  const grades = [
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
    { value: 'GRADE_9', label: 'Grade 9' }
  ];

  const terms = [
    { value: 'TERM_1', label: 'Term 1' },
    { value: 'TERM_2', label: 'Term 2' },
    { value: 'TERM_3', label: 'Term 3' }
  ];

  const tests = [
    { value: 'mid-term', label: 'Mid-Term Test' },
    { value: 'end-term', label: 'End-Term Test' },
    { value: 'cat-1', label: 'CAT 1' },
    { value: 'cat-2', label: 'CAT 2' },
    { value: 'final-exam', label: 'Final Exam' }
  ];

  const handleGenerateReport = () => {
    if (!selectedType) {
      alert('Please select a report type');
      return;
    }

    setLoading(true);
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      alert(`Generating ${reportTypes.find(t => t.value === selectedType)?.label}...`);
    }, 1000);

    // TODO: Implement actual report generation logic
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-8 pb-4 border-b">Summary Report</h2>

      {/* First Row: Type, Grade, Stream, Term */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select Type</option>
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select Grade</option>
            {grades.map(grade => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Stream</label>
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select Stream</option>
            {availableStreams.map(stream => (
              <option key={stream.id} value={stream.name}>
                {stream.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select Term</option>
            {terms.map(term => (
              <option key={term.value} value={term.value}>
                {term.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Second Row: Tests (half width) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tests</label>
          <select
            value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
          >
            <option value="">Select Test</option>
            {tests.map(test => (
              <option key={test.value} value={test.value}>
                {test.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleGenerateReport}
          disabled={loading || !selectedType}
          className="px-8 py-3 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] transition font-semibold disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>
    </div>
  );
};

export default SummaryReportPage;