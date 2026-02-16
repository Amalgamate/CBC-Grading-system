/**
 * SummativeAssessment Mobile Variant
 * Optimized for mobile/tablet devices
 * - Card-based learner list with inline mark entry
 * - Vertical stacked setup form instead of horizontal
 * - Touch-friendly inputs with large tap targets
 * - Sticky header/footer for quick actions
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Save, Search, Loader, ArrowLeft, Check
} from 'lucide-react';
import { assessmentAPI, gradingAPI, classAPI } from '../../../services/api';
import { useNotifications } from '../hooks/useNotifications';
import EmptyState from '../shared/EmptyState';
import { useAssessmentSetup } from '../hooks/useAssessmentSetup';
import { useLearningAreas } from '../hooks/useLearningAreas';

const SummativeAssessmentMobile = ({ learners, initialTestId, onBack }) => {
  const { showSuccess, showError } = useNotifications();
  const setup = useAssessmentSetup({ defaultTerm: 'TERM_1' });
  const learningAreasMgr = useLearningAreas(setup.selectedGrade);

  // State
  const [step, setStep] = useState(initialTestId ? 2 : 1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tests, setTests] = useState([]);
  const [selectedTestId, setSelectedTestId] = useState(initialTestId || '');
  const [marks, setMarks] = useState({});
  const [fetchedLearners, setFetchedLearners] = useState([]);
  const [loadingLearners, setLoadingLearners] = useState(false);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [selectedLearningArea, setSelectedLearningArea] = useState('');

  // Fetch Tests
  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await assessmentAPI.getTests({});
      let testsData = [];
      if (response?.data && Array.isArray(response.data)) {
        testsData = response.data;
      } else if (Array.isArray(response)) {
        testsData = response;
      }
      const activeTests = testsData.filter(t => {
        const status = (t.status || '').toUpperCase();
        return ['PUBLISHED', 'APPROVED'].includes(status) || t.published === true;
      });
      setTests(activeTests);
    } catch (error) {
      console.error('Error loading tests:', error);
      showError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Load Options
  const loadOptions = useCallback(async () => {
    try {
      const classesResp = await classAPI.getAll();
      const classesData = classesResp?.data?.data || classesResp?.data || classesResp || [];
      const uniqueGrades = [...new Set(classesData.map(c => c.grade))].filter(Boolean).sort();
      setAvailableGrades(uniqueGrades.length > 0 ? uniqueGrades : ['GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5']);
      setAvailableTerms(['TERM_1', 'TERM_2', 'TERM_3']);
    } catch (error) {
      console.error('Error loading options:', error);
      setAvailableTerms(['TERM_1', 'TERM_2', 'TERM_3']);
      setAvailableGrades(['GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5']);
    }
  }, []);

  useEffect(() => {
    fetchTests();
    loadOptions();
  }, [fetchTests, loadOptions]);

  // Fetch Learners for selected test
  const selectedTest = useMemo(() => tests.find(t => String(t.id) === String(selectedTestId)), [selectedTestId, tests]);

  const fetchLearners = useCallback(async () => {
    if (!selectedTest?.id) return;
    setLoadingLearners(true);
    try {
      const learnersResp = await classAPI.getStudentsByClass(setup.selectedGrade);
      const learnersData = Array.isArray(learnersResp?.data) ? learnersResp.data : Array.isArray(learnersResp) ? learnersResp : [];
      setFetchedLearners(learnersData);
    } catch (error) {
      console.error('Error fetching learners:', error);
      showError('Failed to load learners');
    } finally {
      setLoadingLearners(false);
    }
  }, [selectedTest?.id, setup.selectedGrade, showError]);

  useEffect(() => {
    if (step === 2) {
      fetchLearners();
    }
  }, [step, selectedTest?.id, fetchLearners]);

  // Assessment Progress
  const assessmentProgress = useMemo(() => {
    const totalLearners = (fetchedLearners || []).length;
    const assessedCount = Object.keys(marks).filter(learnerId => {
      const mark = marks[learnerId];
      return mark !== null && mark !== undefined && mark !== '';
    }).length;
    const percentage = totalLearners > 0 ? Math.round((assessedCount / totalLearners) * 100) : 0;
    const isComplete = assessedCount === totalLearners && totalLearners > 0;
    return { assessed: assessedCount, total: totalLearners, percentage, isComplete };
  }, [marks, fetchedLearners]);

  // Filter learners based on search
  const filteredLearners = useMemo(() => {
    return (fetchedLearners || []).filter(l =>
      (l.firstName || l.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.admissionNumber || l.studentId || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [fetchedLearners, searchQuery]);

  // Handle mark change
  const handleMarkChange = (learnerId, value) => {
    setMarks(prev => ({
      ...prev,
      [learnerId]: value === '' ? '' : value
    }));
  };

  // Save marks
  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      const payload = {
        testId: selectedTestId,
        gradingData: Object.entries(marks)
          .filter(([_, mark]) => mark !== null && mark !== undefined && mark !== '')
          .map(([learnerId, mark]) => ({
            learnerId,
            mark: parseFloat(mark),
            timestamp: new Date().toISOString()
          }))
      };

      const response = await gradingAPI.saveMarks(payload);
      if (response.success) {
        showSuccess('Marks saved successfully!');
        setMarks({});
      } else {
        showError(response.message || 'Failed to save marks');
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      showError('Failed to save marks: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Handle back - navigate away from full-screen
  const handleBackToSidebar = () => {
    // This will trigger a page navigation back to dashboard in the parent system
    if (onBack) {
      onBack();
    } else {
      // Fallback: dispatch custom event or use window history
      window.history.back();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} className="animate-spin text-teal-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // STEP 1: SETUP
  if (step === 1) {
    return (
      <div className="fixed inset-0 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={handleBackToSidebar}
              className="text-teal-600 hover:text-teal-700 flex-shrink-0 p-1 hover:bg-gray-100 rounded"
              title="Back to Menu"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Summative Assessment</h1>
              <p className="text-xs text-gray-500">Step 1: Select Assessment Details</p>
            </div>
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28">
          {/* Grade */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 pointer-events-auto">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Grade<span className="text-red-500">*</span>
            </label>
            <select
              value={setup.selectedGrade}
              onChange={(e) => setup.setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-teal-500 focus:border-transparent pointer-events-auto"
              style={{ touchAction: 'manipulation' }}
            >
              <option value="">Select Grade</option>
              {availableGrades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Term */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 pointer-events-auto">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Term<span className="text-red-500">*</span>
            </label>
            <select
              value={setup.selectedTerm}
              onChange={(e) => setup.setSelectedTerm(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-teal-500 focus:border-transparent pointer-events-auto"
              style={{ touchAction: 'manipulation' }}
            >
              {availableTerms.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Learning Area */}
          {learningAreasMgr?.learningAreas?.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 pointer-events-auto">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Learning Area<span className="text-red-500">*</span>
              </label>
              <select
                value={selectedLearningArea}
                onChange={(e) => setSelectedLearningArea(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-teal-500 focus:border-transparent pointer-events-auto"
                style={{ touchAction: 'manipulation' }}
              >
                <option value="">Select Learning Area</option>
                {learningAreasMgr?.learningAreas?.map(la => (
                  <option key={la.id} value={la.id}>{la.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Test Selection */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 pointer-events-auto">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Select Test<span className="text-red-500">*</span>
            </label>
            {(tests || []).length === 0 ? (
              <p className="text-sm text-gray-500 py-3">No published tests available</p>
            ) : (
              <select
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-teal-500 focus:border-transparent pointer-events-auto"
                style={{ touchAction: 'manipulation' }}
              >
                <option value="">Select a test</option>
                {(tests || []).map(t => (
                  <option key={t.id} value={String(t.id)}>
                    {t.title || t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3 z-40 safe-area-bottom">
          <button
            onClick={handleBackToSidebar}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
          >
            Back to Menu
          </button>
          <button
            onClick={() => selectedTestId && setup.selectedGrade ? setStep(2) : showError('Please select all required fields')}
            className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-400"
            disabled={!selectedTestId || !setup.selectedGrade}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // STEP 2: GRADING
  if (step === 2 && selectedTest) {
    return (
      <div className="fixed inset-0 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button onClick={() => setStep(1)} className="text-teal-600 hover:text-teal-700 flex-shrink-0">
                <ArrowLeft size={20} />
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-gray-900 truncate">{selectedTest.title || selectedTest.name}</h1>
                <p className="text-[11px] text-gray-500">{setup.selectedGrade} • {setup.selectedTerm}</p>
              </div>
            </div>
            {assessmentProgress.isComplete && <Check size={22} className="text-green-600 flex-shrink-0" />}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${assessmentProgress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {assessmentProgress.assessed}/{assessmentProgress.total} assessed ({assessmentProgress.percentage}%)
          </p>
        </div>

        {/* Search */}
        <div className="bg-white border-b border-gray-200 p-3 sticky top-16 z-10 pointer-events-auto">
          <div className="relative pointer-events-auto">
            <Search size={18} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search learner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pointer-events-auto"
              style={{ touchAction: 'manipulation' }}
            />
          </div>
        </div>

        {/* Learner Cards */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-28">
          {loadingLearners ? (
            <div className="flex justify-center py-8">
              <Loader size={24} className="animate-spin text-teal-600" />
            </div>
          ) : (filteredLearners || []).length === 0 ? (
            <EmptyState message="No learners found" icon={Search} />
          ) : (
            (filteredLearners || []).map(learner => {
              const learnerId = learner.id || learner._id;
              const marked = marks[learnerId];
              const isMarked = marked !== null && marked !== undefined && marked !== '';

              return (
                <div
                  key={learnerId}
                  className={`bg-white rounded-lg border p-3 transition-all ${
                    isMarked ? 'border-teal-200 bg-teal-50/30' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {learner.firstName} {learner.lastName || ''}
                      </p>
                      <p className="text-xs text-gray-500">{learner.admissionNumber || learner.studentId || 'N/A'}</p>
                    </div>
                    {isMarked && <Check size={18} className="text-teal-600 flex-shrink-0 mt-0.5" />}
                  </div>

                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Enter mark"
                    value={marks[learnerId] ?? ''}
                    onChange={(e) => handleMarkChange(learnerId, e.target.value)}
                    className={`w-full px-3 py-2 text-base border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pointer-events-auto ${
                      isMarked ? 'border-teal-300 bg-white' : 'border-gray-300'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                    max={selectedTest.maxMark || 100}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3 z-40 safe-area-bottom">
          <button
            onClick={() => setStep(1)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium"
          >
            Back
          </button>
          <button
            onClick={handleSaveMarks}
            disabled={saving || assessmentProgress.assessed === 0}
            className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Marks
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return <EmptyState message="No assessment selected" />;
};

export default SummativeAssessmentMobile;
