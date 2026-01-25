/**
 * Summary Report Page
 * Centralized reporting interface for generating various types of reports
 */

import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { configAPI } from '../../../../services/api';

const SummaryReportPage = () => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('term-1');
  const [selectedTest, setSelectedTest] = useState('');
  const [availableStreams, setAvailableStreams] = useState([]);

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
    { value: 'term-1', label: 'Term 1' },
    { value: 'term-2', label: 'Term 2' },
    { value: 'term-3', label: 'Term 3' }
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

    const reportData = {
      type: selectedType,
      grade: selectedGrade,
      stream: selectedStream,
      term: selectedTerm,
      test: selectedTest
    };

    alert(`Generating ${reportTypes.find(t => t.value === selectedType)?.label}...`);
    
    // TODO: Implement actual report generation logic
    // This would typically call an API endpoint to generate the report
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Summary Report</h1>
        </div>
        <p className="text-gray-600">Generate comprehensive reports for students, grades, and streams</p>
      </div>

      {/* Report Configuration Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              id="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white"
            >
              <option value="">Select Type</option>
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
              Grade
            </label>
            <select
              id="grade"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white"
            >
              <option value="">Select Grade</option>
              {grades.map(grade => (
                <option key={grade.value} value={grade.value}>
                  {grade.label}
                </option>
              ))}
            </select>
          </div>

          {/* Stream */}
          <div>
            <label htmlFor="stream" className="block text-sm font-medium text-gray-700 mb-2">
              Stream
            </label>
            <select
              id="stream"
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white"
            >
              <option value="">All Streams</option>
              {availableStreams.map(stream => (
                <option key={stream.id} value={stream.name}>
                  {stream.name}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Term */}
          <div>
            <label htmlFor="term" className="block text-sm font-medium text-gray-700 mb-2">
              Academic Term
            </label>
            <select
              id="term"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white"
            >
              {terms.map(term => (
                <option key={term.value} value={term.value}>
                  {term.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tests - Full Width */}
        <div className="mb-8">
          <label htmlFor="tests" className="block text-sm font-medium text-gray-700 mb-2">
            Tests
          </label>
          <div className="md:w-1/3">
            <select
              id="tests"
              value={selectedTest}
              onChange={(e) => setSelectedTest(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-700 bg-white"
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
        <div className="flex justify-end">
          <button
            onClick={handleGenerateReport}
            className="px-8 py-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Report Types Guide:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>Grade Report:</strong> Overall performance summary for a specific grade</li>
          <li><strong>Stream Report:</strong> Performance analysis by class streams</li>
          <li><strong>Learner Report:</strong> Individual student performance report</li>
          <li><strong>Learner Termly Report:</strong> Comprehensive term report for individual students</li>
          <li><strong>Stream Ranking Report:</strong> Comparative ranking across streams</li>
          <li><strong>Stream Analysis Report:</strong> Detailed stream performance analytics</li>
          <li><strong>Grade Analysis Report:</strong> In-depth grade-level performance analysis</li>
        </ul>
      </div>
    </div>
  );
};

export default SummaryReportPage;
