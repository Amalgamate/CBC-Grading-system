import React, { useState, useMemo, useEffect } from 'react';
import {
  Save, Search, Loader, ArrowLeft, Lock, Printer
} from 'lucide-react';
import { assessmentAPI, gradingAPI, classAPI, configAPI, learnerAPI } from '../../../services/api';
import { useNotifications } from '../hooks/useNotifications';
import EmptyState from '../shared/EmptyState';
import { Database, Plus } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { generatePDFWithLetterhead } from '../../../utils/simplePdfGenerator';

const SummativeAssessment = ({ learners, initialTestId }) => {
  const { showSuccess, showError } = useNotifications();

  // View State
  const [step, setStep] = useState(initialTestId ? 2 : 1); // 1: Setup, 2: Assess (Skip setup if test ID provided)
  const [loading, setLoading] = useState(false);
  const [loadingScale, setLoadingScale] = useState(false);
  const [lockingTest, setLockingTest] = useState(false);
  const [isTestLocked, setIsTestLocked] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Selection State
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedTestId, setSelectedTestId] = useState(initialTestId || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [tests, setTests] = useState([]);
  const [selectedLearningArea, setSelectedLearningArea] = useState('');
  const [marks, setMarks] = useState({});
  const [gradingScale, setGradingScale] = useState(null);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [availableStreams, setAvailableStreams] = useState([]);

  // User Context
  const { user } = useAuth();
  const schoolId = user?.school?.id || user?.schoolId || localStorage.getItem('currentSchoolId') || 'default-school-e082e9a4';

  // Load Tests
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        // Fetch all tests for this school context
        const response = await assessmentAPI.getTests({});
        let testsData = [];
        if (response && response.data && Array.isArray(response.data)) {
          testsData = response.data;
        } else if (Array.isArray(response)) {
          testsData = response;
        }

        // Filter for tests that are ready for assessment (Published or Approved)
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
    };
    fetchTests();
  }, [schoolId]);


  // Load Grades, Terms, and Streams for selectors
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // Grades from classes if available; otherwise defaults
        const classesResp = await classAPI.getAll();
        const classesData = classesResp?.data?.data || classesResp?.data || classesResp || [];
        const uniqueGrades = [...new Set(classesData.map(c => c.grade))].filter(Boolean).sort();
        if (uniqueGrades.length > 0) {
          setAvailableGrades(uniqueGrades);
        } else {
          setAvailableGrades([
            'PLAYGROUP',
            'PP1',
            'PP2',
            'GRADE_1',
            'GRADE_2',
            'GRADE_3',
            'GRADE_4',
            'GRADE_5',
            'GRADE_6',
            'GRADE_7',
            'GRADE_8',
            'GRADE_9'
          ]);
        }
        // Terms
        setAvailableTerms(['TERM_1', 'TERM_2', 'TERM_3']);
        // Streams from config
        if (schoolId) {
          const streamsResp = await configAPI.getStreamConfigs(schoolId);
          const streamsArr = (streamsResp && streamsResp.data) ? streamsResp.data : [];
          const streamNames = streamsArr.filter(s => s.active).map(s => s.name);
          setAvailableStreams(streamNames);
        } else {
          setAvailableStreams([]);
        }
      } catch (error) {
        console.error('Error loading selector options:', error);
        // Safe defaults
        setAvailableTerms(['TERM_1', 'TERM_2', 'TERM_3']);
        if (availableGrades.length === 0) {
          setAvailableGrades([
            'PLAYGROUP',
            'PP1',
            'PP2',
            'GRADE_1',
            'GRADE_2',
            'GRADE_3',
            'GRADE_4',
            'GRADE_5',
            'GRADE_6',
            'GRADE_7',
            'GRADE_8',
            'GRADE_9'
          ]);
        }
      }
    };
    loadOptions();
  }, [schoolId]);

  const selectedTest = useMemo(() =>
    tests.find(t => String(t.id) === String(selectedTestId)),
    [selectedTestId, tests]
  );

  // Fetch Learners state (declared early to be used in assessmentProgress)
  const [fetchedLearners, setFetchedLearners] = useState([]);
  const [loadingLearners, setLoadingLearners] = useState(false);

  // Calculate Assessment Progress
  const assessmentProgress = useMemo(() => {
    const totalLearners = fetchedLearners.length;
    const assessedCount = Object.keys(marks).filter(learnerId => {
      const mark = marks[learnerId];
      return mark !== null && mark !== undefined && mark !== '';
    }).length;
    
    const percentage = totalLearners > 0 ? Math.round((assessedCount / totalLearners) * 100) : 0;
    const isComplete = assessedCount === totalLearners && totalLearners > 0;
    
    return { assessed: assessedCount, total: totalLearners, percentage, isComplete };
  }, [marks, fetchedLearners]);

  // Load Grading Scale and Existing Results
  useEffect(() => {
    const loadTestDetails = async () => {
      if (!selectedTestId) {
        setGradingScale(null);
        setMarks({});
        return;
      }

      setLoadingScale(true);
      try {
        // 1. Fetch Grading Scale
        const test = tests.find(t => String(t.id) === String(selectedTestId));
        if (test) {
          const systems = await gradingAPI.getSystems(schoolId);
          let scale = null;

          if (test.scaleId) {
            scale = systems.find(s => String(s.id) === String(test.scaleId));
          }

          if (!scale) {
            scale = systems.find(s =>
              String(s.name).includes(String(test.grade)) &&
              String(s.name).includes(String(test.learningArea))
            );
          }

          if (scale && scale.ranges) {
            scale.ranges.sort((a, b) => b.minPercentage - a.minPercentage);
            setGradingScale(scale);
          } else {
            setGradingScale(null);
          }
        }

        // 2. Fetch Test Lock Status
        if (test) {
          setIsTestLocked(test.locked === true);
        }

        // 3. Fetch Existing Marks
        const resultsResponse = await assessmentAPI.getTestResults(selectedTestId);
        const results = resultsResponse.data || resultsResponse || [];

        const existingMarks = {};
        results.forEach(r => {
          if (r.learnerId) {
            existingMarks[r.learnerId] = r.marksObtained;
          }
        });
        setMarks(existingMarks);

      } catch (error) {
        console.error('Error loading test details:', error);
      } finally {
        setLoadingScale(false);
      }
    };

    loadTestDetails();
  }, [selectedTestId, tests, schoolId]);

  // Derived Data
  // Tests filtered list depends on selected grade/term

  const filteredTestsBySelection = useMemo(() =>
    tests.filter(t => {
      if (selectedGrade && t.grade !== selectedGrade) return false;
      if (selectedTerm && t.term !== selectedTerm) return false;
      return true;
    }),
    [tests, selectedGrade, selectedTerm]
  );

  const availableLearningAreas = useMemo(() => {
    const areas = [...new Set(filteredTestsBySelection.map(t => t.learningArea))].filter(Boolean).sort();
    return areas;
  }, [filteredTestsBySelection]);

  const finalTests = useMemo(() =>
    filteredTestsBySelection.filter(t => {
      if (selectedLearningArea && t.learningArea !== selectedLearningArea) return false;
      return true;
    }),
    [filteredTestsBySelection, selectedLearningArea]
  );

  // Fetch Learners when moving to Step 2 or filters change
  useEffect(() => {
    if (step === 2 && selectedTest) {
      const fetchLearners = async () => {
        setLoadingLearners(true);
        try {
          // Fetch learners for the selected Grade and Stream
          // Use learnerAPI.getAll with filters
          const params = {
            grade: selectedTest.grade,
            status: 'ACTIVE',
            limit: 1000 // Get all for the class
          };

          if (selectedStream) {
            params.stream = selectedStream;
          }

          const response = await learnerAPI.getAll(params);
          const learnersData = response.data || response || [];
          setFetchedLearners(Array.isArray(learnersData) ? learnersData : []);
        } catch (error) {
          console.error('Error fetching learners:', error);
          showError('Failed to load learners');
          setFetchedLearners([]);
        } finally {
          setLoadingLearners(false);
        }
      };

      fetchLearners();
    }
  }, [step, selectedTest, selectedStream]);

  const filteredLearners = useMemo(() => {
    let result = fetchedLearners;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l =>
        (l.firstName + ' ' + l.lastName).toLowerCase().includes(query) ||
        (l.admissionNumber || '').toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [fetchedLearners, searchQuery]);

  // Helpers
  const handleMarkChange = (learnerId, value) => {
    const numValue = parseFloat(value);
    if (value === '') {
      setMarks(prev => {
        const newMarks = { ...prev };
        delete newMarks[learnerId];
        return newMarks;
      });
      return;
    }

    if (!isNaN(numValue)) {
      setMarks(prev => ({
        ...prev,
        [learnerId]: Math.min(Math.max(0, numValue), selectedTest?.totalMarks || 100)
      }));
    }
  };

  const getDescriptionForGrade = (mark, total, learnerName) => {
    if (!total || mark === undefined || mark === null || mark === '') return 'Not assessed';

    const percentage = (mark / total) * 100;

    if (gradingScale && gradingScale.ranges) {
      const range = gradingScale.ranges.find(r =>
        percentage >= r.minPercentage && percentage <= r.maxPercentage
      );
      if (range && range.description) {
        return range.description.replace(/\{\{learner\}\}/g, learnerName || 'Learner');
      }
      return range ? range.label : 'Not assessed';
    }

    return 'Not assessed';
  };

  const handleLockTest = async () => {
    // Check if assessment is complete
    if (!assessmentProgress.isComplete) {
      showError('Cannot lock test: Assessment must be 100% complete');
      return;
    }

    // Confirm lock action
    const testName = selectedTest?.title || selectedTest?.name || 'this test';
    const confirmMessage = `🔒 Lock this test?

Once locked, marks cannot be modified. This is a permanent action.

Test: ${testName}
Assessed: ${assessmentProgress.assessed}/${assessmentProgress.total} students

Are you sure you want to lock this test?`;
    
    const userConfirmed = window.confirm(confirmMessage);
    
    if (!userConfirmed) {
      return;
    }

    try {
      setLockingTest(true);

      // Update test with lock status
      await assessmentAPI.updateTest(selectedTestId, {
        locked: true,
        lockedAt: new Date().toISOString(),
        lockedBy: user?.userId || user?.id || user?.email
      });

      setIsTestLocked(true);
      showSuccess('✅ Test locked successfully!');
    } catch (error) {
      console.error('Lock test error:', error);
      showError('Failed to lock test');
    } finally {
      setLockingTest(false);
    }
  };

  const handlePrintReport = async () => {
    try {
      setGeneratingPDF(true);
      showSuccess('Generating PDF report...');

      // Get school information from user context
      const schoolInfo = {
        schoolName: user?.school?.name || 'School Name',
        address: user?.school?.address || 'School Address',
        phone: user?.school?.phone || 'Phone Number',
        email: user?.school?.email || 'email@school.com',
        website: user?.school?.website || 'www.school.com',
        logoUrl: user?.school?.logo || '/logo-zawadi.png',
        brandColor: '#1e3a8a'
      };

      // Generate filename
      const testName = (selectedTest?.title || selectedTest?.name || 'test').replace(/\s+/g, '_');
      const grade = selectedTest?.grade?.replace('_', '') || 'Grade';
      const term = selectedTest?.term?.replace('_', '') || 'Term';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${grade}_${testName}_Results_${timestamp}.pdf`;

      // Generate PDF with LANDSCAPE orientation for better table display
      const result = await generatePDFWithLetterhead(
        'assessment-report-content',
        filename,
        schoolInfo,
        {
          orientation: 'landscape', // Changed to landscape for corporate design and better space utilization
          scale: 2,
          multiPage: true,
          onProgress: (message, progress) => {
            console.log(`PDF Generation: ${message} (${progress}%)`);
          }
        }
      );

      if (result.success) {
        showSuccess('✅ PDF report downloaded successfully!');
      } else {
        showError(`Failed to generate PDF: ${result.error}`);
      }
    } catch (error) {
      console.error('Print report error:', error);
      showError('Failed to generate PDF report');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSave = async () => {
    // Check if test is locked
    if (isTestLocked) {
      showError('Cannot save: Test is locked');
      return;
    }

    if (Object.keys(marks).length === 0) {
      showError('No marks entered to save');
      return;
    }

    try {
      setLoading(true);

      // 🚨 CRITICAL FIX #1: Check for existing results before saving
      const existingResultsResponse = await assessmentAPI.getTestResults(selectedTestId);
      const existingResults = existingResultsResponse.data || existingResultsResponse || [];

      if (existingResults.length > 0) {
        // Check if any of these results are published
        const publishedCount = existingResults.filter(r => 
          r.status === 'PUBLISHED' || r.status === 'published'
        ).length;

        let confirmMessage = '';
        let confirmTitle = '';

        if (publishedCount > 0) {
          confirmTitle = '⚠️ Warning: Published Results Exist';
          confirmMessage = `This test has ${publishedCount} published result(s). Overwriting will affect report cards and student records.\n\nExisting results: ${existingResults.length} learner(s)\nNew marks to save: ${Object.keys(marks).length} learner(s)\n\nAre you sure you want to overwrite these results?`;
        } else {
          confirmTitle = '⚠️ Results Already Exist';
          confirmMessage = `Results already exist for ${existingResults.length} learner(s) in this test.\n\nDo you want to overwrite them with your current entries?`;
        }

        // Show confirmation dialog
        const userConfirmed = window.confirm(`${confirmTitle}\n\n${confirmMessage}`);
        
        if (!userConfirmed) {
          setLoading(false);
          showError('Save cancelled - existing results were not overwritten');
          return;
        }

        // User confirmed, show warning message
        showSuccess('Overwriting existing results...');
      }

      // Prepare bulk payload
      const resultsToSave = Object.entries(marks).map(([learnerId, mark]) => {
        let remarks = '-';
        if (selectedTest?.totalMarks) {
          const percentage = (mark / selectedTest.totalMarks) * 100;
          if (gradingScale && gradingScale.ranges) {
            const range = gradingScale.ranges.find(r => percentage >= r.minPercentage && percentage <= r.maxPercentage);
            remarks = range ? range.label : '-';
          }
        }

        return {
          learnerId,
          marksObtained: mark,
          remarks,
          teacherComment: `Score: ${mark}/${selectedTest?.totalMarks}`
        };
      });

      // Send bulk request
      await assessmentAPI.recordBulkResults({
        testId: selectedTestId,
        results: resultsToSave
      });

      showSuccess(`Successfully saved marks for ${resultsToSave.length} learner(s)!`);
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save marks');
    } finally {
      setLoading(false);
    }
  };

  // Render Step 1: Setup
  if (step === 1) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-8 pb-4 border-b">Summative Assessment</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setSelectedLearningArea('');
                setSelectedTestId('');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Grade</option>
              {availableGrades.map(g => (
                <option key={g} value={g}>{g.replace('_', ' ')}</option>
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
              {availableStreams.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => {
                setSelectedTerm(e.target.value);
                setSelectedLearningArea('');
                setSelectedTestId('');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Term</option>
              {availableTerms.map(t => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Area</label>
            <select
              value={selectedLearningArea}
              onChange={(e) => {
                setSelectedLearningArea(e.target.value);
                setSelectedTestId('');
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={!selectedGrade || !selectedTerm || availableLearningAreas.length === 0}
            >
              <option value="">
                {!selectedGrade || !selectedTerm
                  ? 'Select Grade & Term first'
                  : availableLearningAreas.length === 0
                    ? 'No tests found for this period'
                    : 'Select Learning Area'}
              </option>
              {availableLearningAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tests</label>
            <select
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition bg-white"
              disabled={finalTests.length === 0}
            >
              <option value="">{finalTests.length === 0 ? (selectedLearningArea ? 'No tests for this area' : 'Select Learning Area first') : 'Select Test'}</option>
              {finalTests.map(t => (
                <option key={t.id} value={t.id}>
                  {t.locked ? '🔒 ' : ''}{t.title || t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {(tests.length === 0 || (selectedGrade && selectedTerm && filteredTestsBySelection.length === 0)) && !loading && (
          <div className="mb-8 p-6 bg-red-50 rounded-xl border border-red-100 italic">
            <EmptyState
              icon={Database}
              title={tests.length === 0 ? "No Tests Found Globally" : `No Tests for ${selectedGrade.replace('_', ' ')}`}
              message={tests.length === 0
                ? "Your assessment repository is empty. You need to create and PUBLISH tests before they appear here."
                : `There are no published or approved tests available for ${selectedGrade.replace('_', ' ')} in ${selectedTerm.replace('_', ' ')}. Check your test management to ensure they are finalized.`
              }
              actionText="Go to Test Management"
              onAction={() => window.location.hash = '#/assess-summative-tests'}
            />
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            onClick={() => {
              if (selectedTestId) setStep(2);
              else showError('Please select a test');
            }}
            disabled={!selectedTestId}
            className="px-8 py-3 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] transition font-semibold disabled:opacity-50 shadow-sm"
          >
            Assess
          </button>
        </div>
      </div>
    );
  }

  // Render Step 2: Assess
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Warning Banner for Locked Tests */}
      {isTestLocked && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Lock className="text-yellow-600" size={20} />
            <p className="text-yellow-800 font-medium">
              ⚠️ This test is locked. Marks cannot be modified. If you need to make changes, please contact an administrator.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setStep(1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Summative Assessment</h2>
            {/* Progress Indicator */}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-600 font-medium">
                Progress: {assessmentProgress.assessed}/{assessmentProgress.total}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                assessmentProgress.percentage === 100
                  ? 'bg-green-100 text-green-700'
                  : assessmentProgress.percentage >= 50
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {assessmentProgress.percentage}%
              </span>
              {assessmentProgress.isComplete && (
                <span className="text-green-600 font-semibold text-sm flex items-center gap-1">
                  ✅ Complete
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Print Report Button */}
          <button
            onClick={handlePrintReport}
            disabled={generatingPDF || filteredLearners.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingPDF ? <Loader className="animate-spin" size={18} /> : <Printer size={18} />}
            Print Report
          </button>
          {/* Lock Test Button - Only shows at 100% and when unlocked */}
          {assessmentProgress.isComplete && !isTestLocked && (
            <button
              onClick={handleLockTest}
              disabled={lockingTest}
              className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold disabled:opacity-50"
            >
              {lockingTest ? <Loader className="animate-spin" size={18} /> : <Lock size={18} />}
              Lock Test
            </button>
          )}
          {/* Locked Indicator */}
          {isTestLocked && (
            <div className="flex items-center gap-2 px-6 py-2 bg-gray-100 border-2 border-gray-300 rounded-lg">
              <Lock size={18} className="text-gray-600" />
              <span className="text-gray-600 font-semibold">Test Locked</span>
            </div>
          )}
          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading || isTestLocked}
            className="flex items-center gap-2 px-6 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            Save Results
          </button>
        </div>
      </div>

      {/* PDF Export Content Wrapper - Landscape Corporate Design */}
      <div id="assessment-report-content" className="bg-white">
        {/* Report Title - Centered */}
        <div className="text-center py-3 mb-4">
          <h1 className="text-2xl font-bold text-[#1e3a8a] mb-1">Summative Assessment Results</h1>
          <p className="text-base text-gray-600 font-medium">
            {selectedTest?.learningArea} - {selectedTest?.grade?.replace('_', ' ')}
          </p>
        </div>

        {/* Assessment Info Grid - 4 Columns */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded px-4 py-3 mb-3">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide mb-0.5">Grade</div>
              <div className="text-sm font-bold text-[#1e293b]">{selectedTest?.grade?.replace('_', ' ')}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide mb-0.5">Stream</div>
              <div className="text-sm font-bold text-[#1e293b]">{selectedStream || 'All Streams'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide mb-0.5">Learning Area</div>
              <div className="text-sm font-bold text-[#1e293b]">{selectedTest?.learningArea}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide mb-0.5">Total Marks</div>
              <div className="text-sm font-bold text-[#1e293b]">{selectedTest?.totalMarks}</div>
            </div>
          </div>
        </div>

        {/* Secondary Info - 3 Columns */}
        <div className="bg-[#f1f5f9] rounded px-4 py-2.5 mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide mb-0.5">Term</div>
              <div className="text-sm font-bold text-[#1e293b]">{selectedTest?.term?.replace('_', ' ')}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide mb-0.5">Academic Year</div>
              <div className="text-sm font-bold text-[#1e293b]">{selectedTest?.academicYear || new Date().getFullYear()}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#64748b] uppercase tracking-wide mb-0.5">Date Generated</div>
              <div className="text-sm font-bold text-[#1e293b]">{new Date().toLocaleDateString('en-GB')}</div>
            </div>
          </div>
        </div>

      {/* Results Table - Corporate Design */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-end">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or adm no..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#1e3a8a] text-white">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-center w-12">No</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-center w-24">Adm No</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide">Student Name</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide text-center w-24">Score</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wide w-80">Performance Descriptor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No learners found for this grade/stream.
                  </td>
                </tr>
              ) : (
                filteredLearners.map((learner, index) => {
                  const score = marks[learner.id];
                  const percentage = score ? (score / selectedTest?.totalMarks) * 100 : 0;
                  let scoreBgColor = '#f8fafc';
                  let scoreTextColor = '#1e293b';
                  let scoreBorderColor = '#e2e8f0';
                  
                  if (percentage >= 70) {
                    scoreBgColor = '#dcfce7';
                    scoreTextColor = '#166534';
                    scoreBorderColor = '#bbf7d0';
                  } else if (percentage >= 50) {
                    scoreBgColor = '#dbeafe';
                    scoreTextColor = '#1e40af';
                    scoreBorderColor = '#bfdbfe';
                  } else if (percentage >= 25) {
                    scoreBgColor = '#fef3c7';
                    scoreTextColor = '#92400e';
                    scoreBorderColor = '#fde68a';
                  } else if (score) {
                    scoreBgColor = '#fee2e2';
                    scoreTextColor = '#991b1b';
                    scoreBorderColor = '#fecaca';
                  }

                  return (
                    <tr key={learner.id} className={`${index % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'} hover:bg-[#f1f5f9] transition`}>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-gray-900">{learner.admissionNumber}</td>
                      <td className="px-4 py-3 text-sm font-bold text-[#1e293b]">
                        {learner.firstName?.toUpperCase()} {learner.lastName?.toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isTestLocked && score ? (
                          <span 
                            className="inline-block px-3 py-1 rounded font-bold text-sm"
                            style={{ 
                              backgroundColor: scoreBgColor, 
                              color: scoreTextColor,
                              border: `1px solid ${scoreBorderColor}`
                            }}
                          >
                            {score}
                          </span>
                        ) : (
                          <input
                            type="number"
                            min="0"
                            max={selectedTest?.totalMarks}
                            value={marks[learner.id] ?? ''}
                            onChange={(e) => handleMarkChange(learner.id, e.target.value)}
                            disabled={isTestLocked}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none transition text-center font-semibold ${
                              isTestLocked 
                                ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500' 
                                : 'border-gray-300 bg-white'
                            }`}
                            placeholder="-"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11px] text-[#475569] italic leading-tight">
                        {getDescriptionForGrade(marks[learner.id], selectedTest?.totalMarks, learner.firstName)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* End PDF Export Content Wrapper */}
      </div>
    </div>
  );
};

export default SummativeAssessment;
