import React, { useState, useMemo, useEffect } from 'react';
import {
  Save, Search, Loader, ArrowLeft, Lock, Printer, UploadCloud, Database
} from 'lucide-react';
import { assessmentAPI, gradingAPI, classAPI, configAPI, learnerAPI } from '../../../services/api';
import { useNotifications } from '../hooks/useNotifications';
import EmptyState from '../shared/EmptyState';
import { useAuth } from '../../../hooks/useAuth';
import { generatePDFWithLetterhead } from '../../../utils/simplePdfGenerator';
import BulkMarkImportModal from '../shared/BulkMarkImportModal';
import PDFPreviewModal from '../shared/PDFPreviewModal';

const SummativeAssessment = ({ learners, initialTestId }) => {
  const { showSuccess, showError } = useNotifications();

  // View State
  const [step, setStep] = useState(initialTestId ? 2 : 1); // 1: Setup, 2: Assess (Skip setup if test ID provided)
  const [loading, setLoading] = useState(false);
  const [, setLoadingScale] = useState(false);
  const [lockingTest, setLockingTest] = useState(false);
  const [isTestLocked, setIsTestLocked] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);

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

  // Calculate Statistics for PDF
  const statistics = useMemo(() => {
    const validMarks = Object.values(marks).filter(m => m !== null && m !== undefined && m !== '');
    const numericMarks = validMarks.map(m => parseFloat(m));
    
    if (numericMarks.length === 0) {
      return { sum: 0, average: 0, count: 0, min: 0, max: 0, gradeDistribution: {} };
    }

    const sum = numericMarks.reduce((acc, val) => acc + val, 0);
    const average = sum / numericMarks.length;
    const min = Math.min(...numericMarks);
    const max = Math.max(...numericMarks);

    // Calculate grade distribution if grading scale exists
    const gradeDistribution = {};
    if (gradingScale && gradingScale.ranges && selectedTest?.totalMarks) {
      numericMarks.forEach(mark => {
        const percentage = (mark / selectedTest.totalMarks) * 100;
        const range = gradingScale.ranges.find(r =>
          percentage >= r.minPercentage && percentage <= r.maxPercentage
        );
        if (range) {
          const label = range.label || range.grade || 'Unknown';
          gradeDistribution[label] = (gradeDistribution[label] || 0) + 1;
        }
      });
    }

    return { sum, average: average.toFixed(2), count: numericMarks.length, min, max, gradeDistribution };
  }, [marks, gradingScale, selectedTest]);

  // Chunk learners into pages of 15 for PDF
  const learnersForPDF = useMemo(() => {
    return fetchedLearners.sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [fetchedLearners]);

  const chunkedLearners = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < learnersForPDF.length; i += 15) {
      chunks.push(learnersForPDF.slice(i, i + 15));
    }
    return chunks;
  }, [learnersForPDF]);

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

        // 3. Fetch Existing Marks or Load from Draft
        const draftKey = `draft-marks-${selectedTestId}`;
        const savedDraft = localStorage.getItem(draftKey);

        if (savedDraft) {
          const userConfirmed = window.confirm('Found unsaved draft marks. Do you want to restore them?');
          if (userConfirmed) {
            setMarks(JSON.parse(savedDraft));
            showSuccess('Draft marks restored successfully!');
          } else {
            localStorage.removeItem(draftKey);
          }
        } else {
          const resultsResponse = await assessmentAPI.getTestResults(selectedTestId);
          const results = resultsResponse.data || resultsResponse || [];

          const existingMarks = {};
          results.forEach(r => {
            if (r.learnerId) {
              existingMarks[r.learnerId] = r.marksObtained;
            }
          });
          setMarks(existingMarks);
        }

      } catch (error) {
        console.error('Error loading test details:', error);
      } finally {
        setLoadingScale(false);
      }
    };

    loadTestDetails();
  }, [selectedTestId, tests, schoolId]);

  // Auto-save marks to localStorage every 30 seconds
  useEffect(() => {
    const draftKey = `draft-marks-${selectedTestId}`;
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(marks).length > 0 && !isTestLocked) {
        localStorage.setItem(draftKey, JSON.stringify(marks));
        console.log('Draft marks auto-saved.');
      }
    }, 30000);
    
    return () => {
      clearInterval(autoSaveInterval);
      // Optionally clear draft when component unmounts or test changes
      // localStorage.removeItem(draftKey);
    };
  }, [marks, selectedTestId, isTestLocked]);

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

  const handleUnlockTest = async () => {
    // Confirm unlock action
    const testName = selectedTest?.title || selectedTest?.name || 'this test';
    const confirmMessage = `🔓 Unlock this test?

Unlocking will allow marks to be modified again. Only proceed if you are authorized.

Test: ${testName}

Are you sure you want to unlock this test?`;
    
    const userConfirmed = window.confirm(confirmMessage);
    
    if (!userConfirmed) {
      return;
    }

    try {
      setLockingTest(true);

      // Update test with unlock status
      await assessmentAPI.updateTest(selectedTestId, {
        locked: false,
        lockedAt: null, // Clear locked info
        lockedBy: null
      });

      setIsTestLocked(false);
      showSuccess('✅ Test unlocked successfully!');
    } catch (error) {
      console.error('Unlock test error:', error);
      showError('Failed to unlock test');
    } finally {
      setLockingTest(false);
    }
  };

  const handlePrintReport = async (onProgress) => {
    try {
      setGeneratingPDF(true);
      
      if (onProgress) onProgress('Preparing report...', 10);

      // Elements are already visible from the preview modal
      // Just add a small delay to ensure everything is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      if (onProgress) onProgress('Processing content...', 20);

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
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${grade}_${testName}_Results_${timestamp}.pdf`;

      // Generate PDF with LANDSCAPE orientation for better table display
      const result = await generatePDFWithLetterhead(
        'assessment-report-content',
        filename,
        schoolInfo,
        {
          orientation: 'landscape',
          scale: 2,
          multiPage: true,
          onProgress: (message, progress) => {
            console.log(`PDF Generation: ${message} (${progress}%)`);
            if (onProgress) {
              onProgress(message, progress);
            }
          }
        }
      );

      if (result.success) {
        if (onProgress) onProgress('Complete!', 100);
        showSuccess('✅ PDF report downloaded successfully!');
      } else {
        showError(`Failed to generate PDF: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      console.error('Print report error:', error);
      showError('Failed to generate PDF report');
      throw error;
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleSave = async (marksToSaveOverride = null) => {
    const currentMarksToSave = marksToSaveOverride || marks;

    // Check if test is locked
    if (isTestLocked) {
      showError('Cannot save: Test is locked');
      return;
    }

    if (Object.keys(currentMarksToSave).length === 0) {
      showError('No marks entered to save');
      return;
    }

    try {
      setLoading(true);

      // 🚨 CRITICAL FIX #1: Check for existing results before saving
      const existingResultsResponse = await assessmentAPI.getTestResults(selectedTestId);
      const existingResults = existingResultsResponse.data || existingResultsResponse || [];

      if (existingResults.length > 0) {
        const publishedResultsCount = existingResults.filter(r => r.status === 'PUBLISHED').length;

        let confirmTitle = 'Results Already Exist';
        let confirmMessage = `Results already exist for ${existingResults.length} learner(s) in this test.\\n\\n`;

        if (publishedResultsCount > 0) {
          confirmTitle = '⚠️ Warning: Published Results Exist';
          confirmMessage += `**${publishedResultsCount} result(s) are PUBLISHED.** Overwriting will affect report cards and student records.\\n\\n`;
        }

        confirmMessage += `New marks to save: ${Object.keys(currentMarksToSave).length} learner(s).\\n\\nAre you sure you want to overwrite these results?`;

        const userConfirmed = window.confirm(`${confirmTitle}\\n\\n${confirmMessage}`);
        
        if (!userConfirmed) {
          setLoading(false);
          showError('Save cancelled - existing results were not overwritten');
          return;
        }

        showSuccess('Overwriting existing results...');
      }

      // Prepare bulk payload
      const resultsToSave = Object.entries(currentMarksToSave).map(([learnerId, mark]) => {
        // Find existing result to preserve remarks if not new mark
        const existingResult = existingResults.find(r => r.learnerId === learnerId);
        let remarks = existingResult?.remarks || '-'; // Use existing remarks if available
        let teacherComment = existingResult?.teacherComment || `Score: ${mark}/${selectedTest?.totalMarks}`;

        if (selectedTest?.totalMarks && mark !== null && mark !== undefined && mark !== '') {
          const percentage = (mark / selectedTest.totalMarks) * 100;
          if (gradingScale && gradingScale.ranges) {
            const range = gradingScale.ranges.find(r => percentage >= r.minPercentage && percentage <= r.maxPercentage);
            remarks = range ? range.label : remarks; // Update remarks only if a new range is found
          }
        }

        return {
          learnerId,
          marksObtained: mark,
          remarks,
          teacherComment
        };
      });

      // Send bulk request
      await assessmentAPI.recordBulkResults({
        testId: selectedTestId,
        results: resultsToSave
      });

      showSuccess(`Successfully saved marks for ${resultsToSave.length} learner(s)!`);
      // After successful save, refresh marks from backend to ensure consistency
      const updatedResultsResponse = await assessmentAPI.getTestResults(selectedTestId);
      const updatedResults = updatedResultsResponse.data || updatedResultsResponse || [];
      const updatedMarks = {};
      updatedResults.forEach(r => {
        if (r.learnerId) {
          updatedMarks[r.learnerId] = r.marksObtained;
        }
      });
      setMarks(updatedMarks);
      localStorage.removeItem(`draft-marks-${selectedTestId}`); // Clear draft after successful save
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
            onClick={() => setShowPDFPreview(true)}
            disabled={generatingPDF || filteredLearners.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={18} />
            Preview & Print
          </button>
          {/* Import Marks Button */}
          <button
            onClick={() => setShowBulkImportModal(true)}
            disabled={isTestLocked || !selectedTestId || loading || loadingLearners}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadCloud size={18} />
            Import Marks
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
          {/* Unlock Test Button - Only shows when locked and for authorized roles */}
          {isTestLocked && (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'HEAD_TEACHER') && (
            <button
              onClick={handleUnlockTest}
              disabled={lockingTest}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
            >
              {lockingTest ? <Loader className="animate-spin" size={18} /> : <Lock size={18} />}
              Unlock Test
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
            onClick={() => handleSave()}
            disabled={loading || isTestLocked}
            className="flex items-center gap-2 px-6 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            Save Results
          </button>
        </div>
      </div>

      {/* PDF Export Content Wrapper */}
      <div id="assessment-report-content" className="bg-white">
        
        {/* PAGE 1: METRICS/STATISTICS PAGE (Print Only) */}
        <div className="print-only px-5" style={{ pageBreakAfter: 'always', pageBreakInside: 'avoid' }}>
          {/* Report Title */}
          <div className="text-center py-3 mb-4">
            <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2 leading-tight">Summative Assessment Results</h1>
            <p className="text-sm text-gray-600 font-medium">
              {selectedTest?.learningArea} | {selectedTest?.grade?.replace('_', ' ')} | {selectedStream || 'All Streams'} | {selectedTest?.term?.replace('_', ' ')} {selectedTest?.academicYear || new Date().getFullYear()}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total Marks: {selectedTest?.totalMarks} | Test Date: {selectedTest?.testDate ? new Date(selectedTest.testDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          {/* Metrics Content */}
          {gradingScale && Object.keys(statistics.gradeDistribution).length > 0 ? (
            <div className="space-y-4">
              
              {/* TOP SECTION: METRICS CARDS (6 cards - Single Line) */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                {/* Generate metric cards based on grade distribution */}
                {Object.entries(statistics.gradeDistribution)
                  .sort(([, a], [, b]) => b - a) // Sort by count descending
                  .slice(0, 6) // Limit to 6 cards for the top row
                  .map(([grade, count], idx) => {
                    const gradeColor = getGradeColor(grade);
                    const isGreen = idx % 2 === 0; // Alternate colors (green, blue, green, blue...)
                    const cardColor = isGreen ? '#10b981' : '#3b82f6'; // Green or Blue
                    const cardBgColor = isGreen ? '#ecfdf5' : '#eff6ff'; // Light green or light blue
                    
                    return (
                      <div
                        key={grade}
                        className="rounded-lg p-2 border-2 shadow-sm"
                        style={{
                          backgroundColor: cardBgColor,
                          borderColor: cardColor,
                          borderRadius: '0.5rem'
                        }}
                      >
                        {/* Grade Label */}
                        <div className="text-[10px] font-semibold text-gray-700 mb-1">
                          {grade}
                        </div>
                        
                        {/* Count - Large Display */}
                        <div className="text-2xl font-bold mb-0.5" style={{ color: cardColor }}>
                          {count}
                        </div>
                        
                        {/* Percentage */}
                        <div className="text-[9px] text-gray-600">
                          {((count / statistics.count) * 100).toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* MIDDLE SECTION: PIE CHART + LEGEND (Side by Side) */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* ============ LEFT: PIE CHART ============ */}
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 shadow-sm">
                  <h3 className="text-lg font-bold text-center mb-3 text-[#1e3a8a]">
                    Grade Distribution
                  </h3>
                  
                  {/* Pie Chart */}
                  <div className="flex justify-center items-center h-64">
                    <svg width="280" height="280" viewBox="0 0 200 200">
                      <PieChartWithLabels data={statistics.gradeDistribution} />
                    </svg>
                  </div>
                </div>
                
                {/* ============ RIGHT: LEGEND + STATS ============ */}
                <div className="space-y-3">
                  {/* Legend Header */}
                  <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-200">
                    <h3 className="text-sm font-bold text-yellow-900 mb-3">Performance Scale</h3>
                    
                    {/* Grade Legend Items - Only Scale, No Metrics */}
                    <div className="space-y-2">
                      {Object.entries(statistics.gradeDistribution)
                        .sort(([, a], [, b]) => b - a)
                        .map(([grade, count]) => {
                          const gradeColor = getGradeColor(grade);
                          
                          return (
                            <div key={grade} className="flex items-center gap-3">
                              <div
                                className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
                                style={{ backgroundColor: gradeColor }}
                              />
                              <span className="text-xs font-semibold text-gray-800">
                                {grade}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  
                  {/* Summary Statistics */}
                  <div className="bg-white rounded-lg p-3 border-2 border-gray-300 space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-xs font-medium text-gray-600">Total Students:</span>
                      <span className="text-lg font-bold text-blue-600">{statistics.count}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-xs font-medium text-gray-600">Average Score:</span>
                      <span className="text-lg font-bold text-green-600">{statistics.average}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-xs font-medium text-gray-600">Highest:</span>
                      <span className="text-lg font-bold text-emerald-600">{statistics.max}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-gray-600">Lowest:</span>
                      <span className="text-lg font-bold text-orange-600">{statistics.min}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No performance data available yet. Complete the assessment to see statistics.</p>
            </div>
          )}

          {/* Page 1 footer */}
          <div className="text-right text-xs text-gray-500 mt-6">
            Page 1 of {chunkedLearners.length + 1}
          </div>
        </div>

        {/* PAGES 2+: STUDENT RESULTS TABLES (10 per page) */}
        {chunkedLearners.map((chunk, pageIndex) => (
          <div 
            key={pageIndex} 
            className="px-5 print-only" 
            style={{ 
              pageBreakBefore: 'always',
              pageBreakAfter: pageIndex === chunkedLearners.length - 1 ? 'auto' : 'always',
              pageBreakInside: 'avoid'
            }}
          >
            {/* Letterhead / Page Header - Fixed at top with proper spacing */}
            <div className="text-center" style={{ 
              paddingTop: '0.75rem',
              paddingBottom: '0.75rem',
              borderBottom: '3px solid #1e3a8a',
              pageBreakInside: 'avoid',
              marginBottom: '0.5rem'
            }}>
              <h1 className="text-2xl font-bold text-[#1e3a8a] mb-1">Summative Assessment Results</h1>
              <p className="text-sm text-gray-600 font-medium">
                {selectedTest?.learningArea} | {selectedTest?.grade?.replace('_', ' ')} | {selectedStream || 'All Streams'} | {selectedTest?.term?.replace('_', ' ')} {selectedTest?.academicYear || new Date().getFullYear()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Total Marks: {selectedTest?.totalMarks} | Test Date: {selectedTest?.testDate ? new Date(selectedTest.testDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            {/* Spacer for safe area - prevents table from touching footer */}
            <div style={{ marginBottom: '1.5rem' }} />

            {/* Table Container with safe padding */}
            <div className="overflow-hidden" style={{ 
              pageBreakInside: 'avoid',
              paddingLeft: '0.5rem',
              paddingRight: '0.5rem',
              paddingBottom: '2rem'
            }}>
              <table className="w-full text-left border-collapse border border-gray-300" style={{ pageBreakInside: 'avoid' }}>
                <thead className="bg-[#1e3a8a] text-white" style={{ pageBreakInside: 'avoid', pageBreakAfter: 'avoid' }}>
                  <tr style={{ pageBreakInside: 'avoid' }}>
                    <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wide text-center w-10 border-r border-blue-700">No</th>
                    <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wide text-center w-20 border-r border-blue-700">Adm No</th>
                    <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wide border-r border-blue-700">Student Name</th>
                    <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wide text-center w-20 border-r border-blue-700">Score</th>
                    <th className="px-2 py-2 text-[9px] font-bold uppercase tracking-wide w-72">Performance Descriptor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {chunk.map((learner, index) => {
                    const globalIndex = pageIndex * 10 + index;
                    const score = marks[learner.id];

                    return (
                      <tr key={learner.id} className={`${index % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'}`} style={{ pageBreakInside: 'avoid' }}>
                        <td className="px-2 py-1.5 text-xs text-center font-semibold text-gray-700 border-r border-gray-200">{globalIndex + 1}</td>
                        <td className="px-2 py-1.5 text-xs text-center font-semibold text-gray-900 border-r border-gray-200">{learner.admissionNumber}</td>
                        <td className="px-2 py-1.5 text-xs font-bold text-[#1e293b] border-r border-gray-200">
                          {learner.firstName?.toUpperCase()} {learner.lastName?.toUpperCase()}
                        </td>
                        <td className="px-2 py-1.5 text-center border-r border-gray-200">
                          <span className="inline-block font-bold text-sm text-gray-900">
                            {score ?? '-'}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-[10px] text-[#475569] italic leading-snug">
                          {getDescriptionForGrade(marks[learner.id], selectedTest?.totalMarks, learner.firstName)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                
                {/* Summary row on LAST page only */}
                {pageIndex === chunkedLearners.length - 1 && (
                  <tfoot className="bg-gray-100 border-t-2 border-gray-400">
                    <tr>
                      <td colSpan="3" className="px-2 py-2 text-xs font-bold text-gray-800 text-right">
                        Summary:
                      </td>
                      <td className="px-2 py-2 text-center border-r border-gray-300">
                        <div className="text-[10px] font-bold text-gray-900">
                          Avg: {statistics.average}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-[10px] text-gray-700">
                        Total: <span className="font-bold">{statistics.count}</span> | 
                        Sum: <span className="font-bold">{statistics.sum.toFixed(2)}</span> | 
                        Range: <span className="font-bold">{statistics.min}-{statistics.max}</span>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
            
            {/* Page number */}
            <div className="text-right text-xs text-gray-500 mt-2">
              Page {pageIndex + 2} of {chunkedLearners.length + 1}
            </div>
          </div>
        ))}
      </div>

      {/* INTERACTIVE TABLE FOR SCREEN (with search) - NOT printed */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 no-print">
        <div className="p-3 border-b border-gray-200 flex justify-end">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or adm no..."
              className="w-full pl-9 pr-4 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#1e3a8a] text-white">
              <tr>
                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-center w-10 border-r border-blue-700">No</th>
                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-center w-20 border-r border-blue-700">Adm No</th>
                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide border-r border-blue-700">Student Name</th>
                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide text-center w-20 border-r border-blue-700">Score</th>
                <th className="px-3 py-2 text-[9px] font-bold uppercase tracking-wide w-72">Performance Descriptor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-gray-500 text-sm">
                    No learners found for this grade/stream.
                  </td>
                </tr>
              ) : (
                filteredLearners.map((learner, index) => {
                  const score = marks[learner.id];

                  return (
                    <tr key={learner.id} className={`${index % 2 === 1 ? 'bg-[#f8fafc]' : 'bg-white'} hover:bg-[#f1f5f9] transition`}>
                      <td className="px-3 py-1.5 text-xs text-center font-semibold text-gray-700 border-r border-gray-200">{index + 1}</td>
                      <td className="px-3 py-1.5 text-xs text-center font-semibold text-gray-900 border-r border-gray-200">{learner.admissionNumber}</td>
                      <td className="px-3 py-1.5 text-xs font-bold text-[#1e293b] border-r border-gray-200">
                        {learner.firstName?.toUpperCase()} {learner.lastName?.toUpperCase()}
                      </td>
                      <td className="px-3 py-1.5 text-center border-r border-gray-200">
                        {isTestLocked && score ? (
                          <span className="inline-block font-bold text-sm text-gray-900">
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
                            className={`w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none transition text-center font-semibold text-xs ${
                              isTestLocked 
                                ? 'bg-gray-100 border-gray-200 cursor-not-allowed text-gray-500' 
                                : 'border-gray-300 bg-white'
                            }`}
                            placeholder="-"
                          />
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-[10px] text-[#475569] italic leading-snug">
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

      {/* Bulk Mark Import Modal */}
      <BulkMarkImportModal
        show={showBulkImportModal}
        onClose={() => setShowBulkImportModal(false)}
        onImport={(importedMarks) => {
          setMarks(prevMarks => ({ ...prevMarks, ...importedMarks }));
          handleSave(importedMarks);
          setShowBulkImportModal(false);
        }}
        learners={fetchedLearners}
        totalMarks={selectedTest?.totalMarks}
      />

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        show={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        onGenerate={handlePrintReport}
        contentElementId="assessment-report-content"
        title={`${selectedTest?.learningArea || 'Assessment'} Results - ${selectedTest?.grade?.replace('_', ' ') || ''}`}
      />
    </div>
  );
};

// ============================================
// ENHANCED PIE CHART COMPONENT WITH LABELS
// ============================================
const PieChartWithLabels = ({ data }) => {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  let currentAngle = -90; // Start from top
  
  return (
    <g>
      {/* Draw pie slices with percentage labels */}
      {Object.entries(data).map(([grade, count]) => {
        const percentage = (count / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        
        // Calculate slice path
        const startX = 100 + 85 * Math.cos((startAngle * Math.PI) / 180);
        const startY = 100 + 85 * Math.sin((startAngle * Math.PI) / 180);
        const endX = 100 + 85 * Math.cos((endAngle * Math.PI) / 180);
        const endY = 100 + 85 * Math.sin((endAngle * Math.PI) / 180);
        
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const pathData = [
          `M 100 100`,
          `L ${startX} ${startY}`,
          `A 85 85 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `Z`
        ].join(' ');
        
        // Calculate label position (middle of slice)
        const middleAngle = (startAngle + endAngle) / 2;
        const labelRadius = 60; // Position labels mid-way in slice
        const labelX = 100 + labelRadius * Math.cos((middleAngle * Math.PI) / 180);
        const labelY = 100 + labelRadius * Math.sin((middleAngle * Math.PI) / 180);
        
        currentAngle = endAngle;
        
        return (
          <g key={grade}>
            {/* Pie Slice */}
            <path
              d={pathData}
              fill={getGradeColor(grade)}
              stroke="#ffffff"
              strokeWidth="2.5"
              opacity="0.95"
            />
            
            {/* Percentage Label (show if >= 5%) */}
            {percentage >= 5 && (
              <>
                {/* White background circle for better readability */}
                <circle
                  cx={labelX}
                  cy={labelY}
                  r="12"
                  fill="white"
                  opacity="0.9"
                />
                
                {/* Percentage Text */}
                <text
                  x={labelX}
                  y={labelY + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill={getGradeColor(grade)}
                >
                  {percentage.toFixed(0)}%
                </text>
              </>
            )}
          </g>
        );
      })}
      
      {/* Center Circle with Total Count */}
      <circle 
        cx="100" 
        cy="100" 
        r="32" 
        fill="white" 
        stroke="#cbd5e1" 
        strokeWidth="3"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
      />
      
      {/* Total Number */}
      <text 
        x="100" 
        y="95" 
        textAnchor="middle" 
        fontSize="16" 
        fontWeight="bold" 
        fill="#1e293b"
      >
        {total}
      </text>
      
      {/* "Students" Label */}
      <text 
        x="100" 
        y="108" 
        textAnchor="middle" 
        fontSize="8" 
        fill="#64748b"
        fontWeight="600"
      >
        Students
      </text>
    </g>
  );
};

// Helper component for Pie Chart - ENHANCED with percentage labels
const PieChart = ({ data }) => {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  let currentAngle = -90; // Start from top
  
  return (
    <g>
      {Object.entries(data).map(([grade, count]) => {
        const percentage = (count / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        
        // Calculate slice path
        const startX = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
        const startY = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
        const endX = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
        const endY = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
        
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const pathData = [
          `M 100 100`,
          `L ${startX} ${startY}`,
          `A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY}`,
          `Z`
        ].join(' ');
        
        // Calculate label position (middle of slice)
        const middleAngle = (startAngle + endAngle) / 2;
        const labelRadius = 55;
        const labelX = 100 + labelRadius * Math.cos((middleAngle * Math.PI) / 180);
        const labelY = 100 + labelRadius * Math.sin((middleAngle * Math.PI) / 180);
        
        currentAngle = endAngle;
        
        return (
          <g key={grade}>
            {/* Pie slice with proper CBC color */}
            <path
              d={pathData}
              fill={getGradeColor(grade)}
              stroke="#ffffff"
              strokeWidth="2.5"
            />
            
            {/* Percentage label ON the slice (only if >= 5%) */}
            {percentage >= 5 && (
              <>
                {/* White background for readability */}
                <circle
                  cx={labelX}
                  cy={labelY}
                  r="11"
                  fill="white"
                  fillOpacity="0.9"
                />
                {/* Percentage text */}
                <text
                  x={labelX}
                  y={labelY + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="#1e293b"
                >
                  {percentage.toFixed(0)}%
                </text>
              </>
            )}
          </g>
        );
      })}
      
      {/* Center white circle */}
      <circle cx="100" cy="100" r="32" fill="white" stroke="#e5e7eb" strokeWidth="2.5" />
      
      {/* Total count in center */}
      <text x="100" y="95" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">
        {total}
      </text>
      <text x="100" y="108" textAnchor="middle" fontSize="9" fill="#64748b">
        Students
      </text>
    </g>
  );
};

// Helper function for grade colors - UNIVERSAL SOLUTION
const getGradeColor = (grade) => {
  // Normalize the grade string
  const gradeUpper = String(grade).toUpperCase().trim();
  
  // Match specific grade numbers first (for different shades)
  if (gradeUpper.includes('EXCEED')) {
    if (gradeUpper.includes('1')) return '#059669'; // Dark Green - Exceeding Expectations 1
    if (gradeUpper.includes('2')) return '#10b981'; // Light Green - Exceeding Expectations 2
    return '#22c55e'; // Default green
  }
  if (gradeUpper.includes('MEET')) {
    if (gradeUpper.includes('1')) return '#2563eb'; // Dark Blue - Meeting Expectations 1
    if (gradeUpper.includes('2')) return '#60a5fa'; // Light Blue - Meeting Expectations 2
    return '#3b82f6'; // Default blue
  }
  if (gradeUpper.includes('APPROACH')) {
    if (gradeUpper.includes('1')) return '#ca8a04'; // Dark Yellow - Approaching Expectations 1
    if (gradeUpper.includes('2')) return '#eab308'; // Light Yellow - Approaching Expectations 2
    return '#fbbf24'; // Default yellow
  }
  if (gradeUpper.includes('BELOW')) {
    if (gradeUpper.includes('1')) return '#ea580c'; // Dark Orange - Below Expectations 1
    if (gradeUpper.includes('2')) return '#f97316'; // Light Orange - Below Expectations 2
    return '#fb923c'; // Default orange
  }
  if (gradeUpper.includes('NOT') || gradeUpper.includes('NY')) return '#dc2626'; // Red
  
  // Fallback to exact matches for short codes
  const colorMap = {
    'EE': '#22c55e', 'EE1': '#059669', 'EE2': '#10b981',
    'ME': '#3b82f6', 'ME1': '#2563eb', 'ME2': '#60a5fa',
    'AE': '#eab308', 'AE1': '#ca8a04', 'AE2': '#eab308',
    'BE': '#f97316', 'BE1': '#ea580c', 'BE2': '#f97316',
    'NY': '#ef4444', 'NY1': '#dc2626', 'NY2': '#ef4444',
    'EX': '#22c55e',
    'VG': '#3b82f6',
    'GO': '#eab308',
    'AP': '#eab308',
    'RE': '#ef4444',
    'NI': '#ef4444',
    'CE': '#22c55e',
    'FE': '#3b82f6',
    'OE': '#eab308',
  };
  
  return colorMap[gradeUpper] || '#94a3b8'; // Gray default
};

export default SummativeAssessment;
