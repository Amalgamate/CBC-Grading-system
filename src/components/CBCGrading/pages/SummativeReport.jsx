/**
 * Summary Report Page
 * Clean, minimal design matching Summative Assessment setup - Single Source of Truth
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Loader } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';

const SummativeReport = ({ learners, onFetchLearners, brandingSettings }) => {
  const { showSuccess, showError } = useNotifications();

  const [selectedType, setSelectedType] = useState('GRADE_REPORT');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStream, setSelectedStream] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('TERM_1');
  const [selectedTestId, setSelectedTestId] = useState('all');
  const [availableTests, setAvailableTests] = useState([]);
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'GRADE_REPORT', label: 'Grade Report' },
    { value: 'STREAM_REPORT', label: 'Stream Report' },
    { value: 'LEARNER_REPORT', label: 'Learner Report' },
    { value: 'LEARNER_TERMLY_REPORT', label: 'Learner Termly Report' },
    { value: 'STREAM_RANKING_REPORT', label: 'Stream Ranking Report' },
    { value: 'STREAM_ANALYSIS_REPORT', label: 'Stream Analysis Report' },
    { value: 'GRADE_ANALYSIS_REPORT', label: 'Grade Analysis Report' }
  ];

  const grades = [
    { value: 'all', label: 'Select Grade' },
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

  // Fetch tests when grade or term changes
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const params = { term: selectedTerm, academicYear: 2026 };
        if (selectedGrade !== 'all') params.grade = selectedGrade;
        const res = await api.assessments.getTests(params);
        if (res.success) {
          setAvailableTests(res.data || []);
        }
      } catch (err) {
        console.error('Fetch tests error:', err);
      }
    };
    fetchTests();
  }, [selectedGrade, selectedTerm]);

  // Derive unique streams from learners
  const availableStreams = useMemo(() => {
    if (!learners) return [];
    let filtered = learners;
    if (selectedGrade !== 'all') {
      filtered = learners.filter(l => l.grade === selectedGrade);
    }
    const streams = Array.from(new Set(filtered.map(l => l.stream).filter(Boolean)));
    return streams.sort();
  }, [learners, selectedGrade]);

  const handleGenerate = async () => {
    if (!selectedType) {
      showError('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement actual report generation logic
      setTimeout(() => {
        showSuccess(`Generating ${reportTypes.find(t => t.value === selectedType)?.label}...`);
        setLoading(false);
      }, 1000);
    } catch (err) {
      showError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-8 pb-4 border-b">Summary Report</h2>

      {/* First Row: Type, Grade, Stream */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Select Type</option>
            {reportTypes.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
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
            {grades.map(g => (
              <option key={g.value} value={g.value}>
                {g.label}
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
            <option value="all">All Streams</option>
            {availableStreams.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Second Row: Term, Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Term</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {terms.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tests</label>
          <select
            value={selectedTestId}
            onChange={(e) => setSelectedTestId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
          >
            <option value="all">Select Test</option>
            {availableTests.map(t => (
              <option key={t.id} value={t.id}>
                {t.title || t.learningArea}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Generate Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-8 py-3 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] transition font-semibold disabled:opacity-50 shadow-sm"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader className="animate-spin" size={18} />
              Generating...
            </span>
          ) : (
            'Generate Report'
          )}
        </button>
      </div>
    </div>
  );
};

export default SummativeReport;