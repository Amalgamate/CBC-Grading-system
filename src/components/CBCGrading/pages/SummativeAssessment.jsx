import React, { useState, useMemo, useEffect } from 'react';
import { 
  Save, Search, Loader, ArrowLeft
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { assessmentAPI, gradingAPI, classAPI, configAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const SummativeAssessment = ({ learners }) => {
  const { showSuccess, showError } = useNotifications();
  
  // View State
  const [step, setStep] = useState(1); // 1: Setup, 2: Assess
  const [loading, setLoading] = useState(false);
  const [loadingScale, setLoadingScale] = useState(false);

  // Selection State
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data State
  const [tests, setTests] = useState([]);
  const [marks, setMarks] = useState({});
  const [gradingScale, setGradingScale] = useState(null);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableTerms, setAvailableTerms] = useState([]);
  const [availableStreams, setAvailableStreams] = useState([]);
  
  // User Context
  const { user } = useAuth();
  const schoolId = user?.school?.id || user?.schoolId || localStorage.getItem('schoolId') || 'default-school-e082e9a4';

  // Load Tests
  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const response = await assessmentAPI.getTests({ published: true });
        let testsData = [];
        if (response && response.data && Array.isArray(response.data)) {
          testsData = response.data;
        } else if (Array.isArray(response)) {
          testsData = response;
        }
        const publishedTests = testsData.filter(t => ['Published', 'PUBLISHED'].includes(t.status || t?.status));
        setTests(publishedTests);
      } catch (error) {
        console.error('Error loading tests:', error);
        showError('Failed to load tests');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  // Refetch tests when grade or term selection changes
  useEffect(() => {
    const refetchTests = async () => {
      try {
        const params = { published: true };
        if (selectedGrade) params.grade = selectedGrade;
        if (selectedTerm) params.term = selectedTerm;
        const response = await assessmentAPI.getTests(params);
        let testsData = [];
        if (response && response.data && Array.isArray(response.data)) {
          testsData = response.data;
        } else if (Array.isArray(response)) {
          testsData = response;
        }
        const publishedTests = testsData.filter(t => ['Published', 'PUBLISHED'].includes(t.status || t?.status));
        setTests(publishedTests);
      } catch (error) {
        console.error('Error reloading tests:', error);
      }
    };
    if (selectedGrade || selectedTerm) {
      refetchTests();
    }
  }, [selectedGrade, selectedTerm]);
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
            'PRE_PRIMARY_1',
            'PRE_PRIMARY_2',
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
            'PRE_PRIMARY_1',
            'PRE_PRIMARY_2',
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
    tests.find(t => t.id === parseInt(selectedTestId)), 
    [selectedTestId, tests]
  );

  // Load Grading Scale
  useEffect(() => {
    const fetchGradingScale = async () => {  
      if (!selectedTest) {
        setGradingScale(null);
        return;
      }

      try {
        setLoadingScale(true);
        const systems = await gradingAPI.getSystems(schoolId);
        let scale = null;

        if (selectedTest.scaleId) {
          scale = systems.find(s => s.id === selectedTest.scaleId);
        }

        if (!scale) {
          scale = systems.find(s => 
            s.name.includes(selectedTest.grade) && 
            s.name.includes(selectedTest.learningArea)
          );
        }
        
        if (scale && scale.ranges) {
          scale.ranges.sort((a, b) => b.minPercentage - a.minPercentage);
          setGradingScale(scale);
        } else {
          setGradingScale(null);
        }
      } catch (error) {
        console.error('Error fetching grading scale:', error);
      } finally {
        setLoadingScale(false);
      }
    };

    fetchGradingScale();
  }, [selectedTest, schoolId]);

  // Derived Data
  // Tests filtered list depends on selected grade/term

  const filteredTests = useMemo(() => 
    tests.filter(t => {
      if (selectedGrade && t.grade !== selectedGrade) return false;
      if (selectedTerm && t.term !== selectedTerm) return false;
      return true;
    }),
    [tests, selectedGrade, selectedTerm]
  );

  const filteredLearners = useMemo(() => {
    if (!selectedTest) return [];
    let result = learners.filter(l => 
      l.grade === selectedTest.grade && 
      (l.status === 'ACTIVE' || l.status === 'Active') &&
      (!selectedStream || l.stream === selectedStream)
    );

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l => 
        (l.firstName + ' ' + l.lastName).toLowerCase().includes(query) ||
        (l.admissionNumber || '').toLowerCase().includes(query)
      );
    }

    return result.sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [learners, selectedTest, selectedStream, searchQuery]);

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

  const handleSave = async () => {
    if (Object.keys(marks).length === 0) {
      showError('No marks entered to save');
      return;
    }

    try {
      setLoading(true);
      const promises = Object.entries(marks).map(([learnerId, mark]) => {
        // Simple grade calculation if no scale
        let remarks = '-';
        if (selectedTest?.totalMarks) {
            const percentage = (mark / selectedTest.totalMarks) * 100;
             if (gradingScale && gradingScale.ranges) {
                const range = gradingScale.ranges.find(r => percentage >= r.minPercentage && percentage <= r.maxPercentage);
                remarks = range ? range.label : '-';
             }
        }

        return assessmentAPI.recordResult({
          testId: selectedTestId,
          learnerId,
          marksObtained: mark,
          remarks: remarks,
          teacherComment: `Score: ${mark}/${selectedTest?.totalMarks}` 
        });
      });
      
      await Promise.all(promises);
      showSuccess(`Successfully saved marks for ${Object.keys(marks).length} learner(s)!`);
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tests</label>
            <select 
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={filteredTests.length === 0}
            >
              <option value="">{filteredTests.length === 0 ? 'No tests available' : 'Select Test'}</option>
              {filteredTests.map(t => (
                <option key={t.id} value={t.id}>{t.title || t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Area</label>
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
              {selectedTest?.learningArea || 'Select a test first'}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            onClick={() => {
              if (selectedTestId) setStep(2);
              else showError('Please select a test');
            }}
            disabled={!selectedTestId}
            className="px-8 py-3 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] transition font-semibold disabled:opacity-50"
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setStep(1)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
            >
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">Summative Assessment</h2>
        </div>
        <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-[#1e293b] text-white rounded-lg hover:bg-[#334155] transition font-semibold disabled:opacity-50"
        >
            {loading ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            Save Results
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div>
                <span className="font-bold text-gray-900 mr-2">Grade:</span>
                <span className="text-gray-600">{selectedTest?.grade?.replace('_', ' ')}</span>
            </div>
            <div>
                <span className="font-bold text-gray-900 mr-2">Stream:</span>
                <span className="text-gray-600">{selectedStream || 'All Streams'}</span>
            </div>
            <div>
                <span className="font-bold text-gray-900 mr-2">Learning Area:</span>
                <span className="text-gray-600">{selectedTest?.learningArea}</span>
            </div>
        </div>
      </div>

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
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">No</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-32">ADM No</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NAME</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-40">Score ({selectedTest?.totalMarks})</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">DESCRIPTOR</th>
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
                        filteredLearners.map((learner, index) => (
                            <tr key={learner.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{learner.admissionNumber}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                    {learner.firstName} {learner.lastName}
                                </td>
                                <td className="px-6 py-4">
                                    <input 
                                        type="number" 
                                        min="0"
                                        max={selectedTest?.totalMarks}
                                        value={marks[learner.id] ?? ''}
                                        onChange={(e) => handleMarkChange(learner.id, e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="-"
                                    />
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 italic">
                                    {getDescriptionForGrade(marks[learner.id], selectedTest?.totalMarks, learner.firstName)}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default SummativeAssessment;
