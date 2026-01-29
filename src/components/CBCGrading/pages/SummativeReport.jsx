/**
 * Summary Report Page
 * Clean, minimal design matching Summative Assessment setup - Single Source of Truth
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Loader, Download, ArrowLeft } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api, { configAPI } from '../../../services/api';

const SummativeReport = ({ learners, onFetchLearners, brandingSettings, user }) => {
  const { showSuccess, showError } = useNotifications();

  console.log('🔍 SummativeReport Props Received:');
  console.log('   learners:', learners?.length || 0, 'items');
  console.log('   onFetchLearners:', typeof onFetchLearners);
  console.log('   user:', user?.id ? 'Loaded' : 'Not loaded');
  if (learners?.length > 0) {
    console.log('   Sample learner:', learners[0]);
  }

  const [selectedType, setSelectedType] = useState('LEARNER_REPORT');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedStream, setSelectedStream] = useState('all');
  const [selectedTerm, setSelectedTerm] = useState('TERM_1');
  const [selectedTestGroups, setSelectedTestGroups] = useState([]);  // ← Now ARRAY for multi-select
  const [selectedTestIds, setSelectedTestIds] = useState([]);         // ← Now ARRAY for multi-select
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [availableTests, setAvailableTests] = useState([]);
  const [streamConfigs, setStreamConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [showTestGroupOptions, setShowTestGroupOptions] = useState(false);  // ← Show/hide test group checkboxes
  const [showTestOptions, setShowTestOptions] = useState(false);            // ← Show/hide test checkboxes
  const [isExporting, setIsExporting] = useState(false);  // ← Track PDF export state
  const reportRef = useRef(null);

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

  // Build available grades from actual learners data
  const availableGrades = useMemo(() => {
    const uniqueGrades = new Set(learners?.map(l => l.grade)?.filter(g => g));
    console.log('📚 Available grades in system:', Array.from(uniqueGrades));
    
    // Create options from actual data + static list
    const staticGrades = [
      { value: 'all', label: 'Select Grade' },
    ];
    
    // Add dynamic grades from learners
    uniqueGrades.forEach(grade => {
      if (!staticGrades.find(g => g.value === grade)) {
        staticGrades.push({ value: grade, label: grade });
      }
    });
    
    // Add common grades if not in data
    const commonGrades = ['PP1', 'PP2', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9'];
    commonGrades.forEach(grade => {
      if (!staticGrades.find(g => g.value === grade)) {
        staticGrades.push({ value: grade, label: grade });
      }
    });
    
    return staticGrades;
  }, [learners]);

  const terms = [
    { value: 'TERM_1', label: 'Term 1' },
    { value: 'TERM_2', label: 'Term 2' },
    { value: 'TERM_3', label: 'Term 3' }
  ];

  // Fetch learners on component mount
  useEffect(() => {
    console.log('📚 Component mounted, calling onFetchLearners...');
    if (onFetchLearners && typeof onFetchLearners === 'function') {
      onFetchLearners();
    } else {
      console.warn('⚠️ onFetchLearners not available or not a function');
    }
  }, [onFetchLearners]);

  // Fetch stream configurations from backend (Source of Truth)
  useEffect(() => {
    const fetchStreamConfigs = async () => {
      try {
        console.log('🔍 useEffect triggered - user prop:', user);
        
        const schoolId = user?.schoolId || user?.school?.id || localStorage.getItem('currentSchoolId');
        console.log('📍 Extracted schoolId:', schoolId);
        
        if (!schoolId) {
          console.warn('⚠️ No school ID found - cannot fetch stream configs');
          setStreamConfigs([]);
          return;
        }

        console.log('🔄 Fetching stream configurations for school:', schoolId);
        const response = await configAPI.getStreamConfigs(schoolId);
        
        console.log('📦 Raw API Response:', response);
        
        const configs = Array.isArray(response) ? response : (response?.data ? response.data : []);
        console.log('✅ Stream configs processed:', configs.length, 'configs');
        
        if (configs.length === 0) {
          console.warn('⚠️ No stream configs returned from API');
        } else {
          console.log('   Stream names:', configs.map(c => c.name));
        }
        
        setStreamConfigs(configs || []);
      } catch (err) {
        console.error('❌ Error fetching stream configs:', err);
        console.error('   Error message:', err.message);
        console.error('   Error response:', err.response?.data);
        setStreamConfigs([]);
      }
    };

    if (user) {
      fetchStreamConfigs();
    } else {
      console.log('⏳ User prop not available yet, waiting...');
    }
  }, [user]);

  // Monitor learners prop changes
  useEffect(() => {
    if (learners && learners.length > 0) {
      console.log('✅ Learners loaded:', learners.length);
      console.log('   Sample learner grades:', learners.slice(0, 3).map(l => l.grade));
    } else {
      console.log('⏳ Waiting for learners to load... (Learners:', learners?.length || 0, ')');
      // If no learners after a delay, try to fetch them again
      const timer = setTimeout(() => {
        if (!learners || learners.length === 0) {
          console.warn('⚠️ Still no learners after 2 seconds, retrying fetch...');
          if (onFetchLearners && typeof onFetchLearners === 'function') {
            onFetchLearners();
          }
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [learners, onFetchLearners]);

  // Fetch tests when grade or term changes
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const params = { term: selectedTerm, academicYear: 2026 };
        if (selectedGrade !== 'all') params.grade = selectedGrade;
        const res = await api.assessments.getTests(params);
        if (res.success) {
          setAvailableTests(res.data || []);
          console.log('✅ Tests loaded:', res.data?.length || 0);
        }
      } catch (err) {
        console.error('Fetch tests error:', err);
      }
    };
    fetchTests();
  }, [selectedGrade, selectedTerm]);

  // Derive unique test groups (testType) from available tests
  const availableTestGroups = useMemo(() => {
    if (!availableTests || availableTests.length === 0) {
      console.log('⏳ No tests available to group');
      return [];
    }
    
    // Get unique test types/groups (e.g., "tt", "ca", "End of Term", etc.)
    const groups = Array.from(
      new Set(availableTests.map(t => t.testType).filter(Boolean))
    );
    
    console.log('📊 Available test groups:', groups, 'from', availableTests.length, 'tests');
    return groups.sort();
  }, [availableTests]);

  // Derive tests within the selected test group(s)
  const testsInGroups = useMemo(() => {
    if (!selectedTestGroups || selectedTestGroups.length === 0) {
      // If no groups selected, show all tests
      console.log('📌 No test groups selected, showing all tests');
      return availableTests;
    }
    
    const filtered = availableTests.filter(t => selectedTestGroups.includes(t.testType));
    console.log(`📌 Tests in groups [${selectedTestGroups.join(', ')}]:`, filtered.length);
    return filtered;
  }, [availableTests, selectedTestGroups]);

  // Derive unique streams from stream configurations (Source of Truth)
  // Falls back to learner streams if configs not loaded yet
  const availableStreams = useMemo(() => {
    console.log('📊 useMemo recalculating - streamConfigs:', streamConfigs.length);
    
    // Priority 1: Use official stream configs if available
    if (streamConfigs && streamConfigs.length > 0) {
      const activeStreams = streamConfigs
        .filter(s => s.active !== false)  // Include by default if not explicitly set to false
        .map(s => ({
          id: s.id,
          name: s.name,  // Full name like "ABC&D"
          value: s.name
        }));
      
      console.log('✅ Using official stream configs:', activeStreams.map(s => s.name));
      return activeStreams;
    }
    
    // Fallback: Extract from learners if configs haven't loaded yet
    if (!learners || learners.length === 0) {
      console.log('⏳ No learners or stream configs available yet');
      return [];
    }
    
    let filtered = learners;
    if (selectedGrade !== 'all') {
      filtered = learners.filter(l => l.grade === selectedGrade);
    }
    
    const learnerStreams = Array.from(new Set(filtered.map(l => l.stream).filter(Boolean)));
    console.log('⚠️ Fallback: Using streams from learners:', learnerStreams);
    
    return learnerStreams.map(s => ({
      id: s,
      name: s,
      value: s
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [streamConfigs, learners, selectedGrade]);

  const handleExportPDF = async () => {
    console.log('📄 Export PDF clicked');
    console.log('   Report data:', reportData?.learner);
    
    // Validate report data exists (even with no test results)
    if (!reportData?.learner) {
      console.warn('❌ No report data available');
      showError(
        'No report data to export. Please generate a report first by clicking the "Generate Report" button.'
      );
      return;
    }

    // Prevent multiple simultaneous exports
    if (isExporting) {
      console.warn('⚠️ Export already in progress');
      return;
    }

    setIsExporting(true);
    console.log('✅ isExporting set to true');

    try {
      console.log('📦 Starting PDF generation...');

      const element = reportRef.current;
      console.log('🔍 Report element:', element ? 'Found' : 'Not found', element?.className);
      
      if (!element) {
        console.error('❌ Report element ref is null');
        showError('Unable to access report content. Please refresh the page and try again.');
        return;
      }

      console.log('📏 Element dimensions:', {
        scrollHeight: element.scrollHeight,
        scrollWidth: element.scrollWidth,
        clientHeight: element.clientHeight,
        clientWidth: element.clientWidth
      });

      // Create a clone of the element and remove all non-print elements
      console.log('🔄 Cloning element...');
      const clone = element.cloneNode(true);
      console.log('✅ Clone created');
      
      console.log('🗑️ Removing non-print elements');
      const elementsToRemove = clone.querySelectorAll('.no-print, [data-export-button], button');
      console.log(`   Found ${elementsToRemove.length} elements to remove`);
      elementsToRemove.forEach(el => {
        el.remove();
      });

      // Generate filename with timestamp
      const timestamp = new Date().toLocaleDateString('en-US').replace(/\//g, '-');
      const filename = `${reportData.learner.firstName}_${reportData.learner.lastName}_Report_${timestamp}.pdf`;
      console.log('📝 Filename:', filename);

      console.log('🎨 Initializing jsPDF...');
      
      // Use jsPDF's native HTML rendering with html2canvas as backend
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 10
      });

      console.log('⏳ Starting HTML to PDF conversion (this may take 15-30 seconds)...');
      console.log('   Scale: 3x, Quality: Ultra-high, Format: JPEG 95%');
      
      // Render HTML to PDF with simple error handling
      try {
        await pdf.html(clone, {
          margin: [5, 5, 5, 5],
          html2canvas: {
            scale: 3,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            allowTaint: true,
            timeout: 90000, // 90 seconds for large renders
            imageTimeout: 30000
          },
          jsPDF: {
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
          }
        });
        
        const pageCount = pdf.internal.pages.length;
        console.log(`✅ PDF rendering complete - ${pageCount} page(s)`);
        console.log('💾 Saving PDF file...');

        // Save PDF
        pdf.save(filename);

        console.log('✅ PDF exported successfully');
        showSuccess(
          `Report exported successfully!\n"${filename}"\n${pageCount} page${pageCount > 1 ? 's' : ''}`
        );
      } catch (renderErr) {
        console.error('❌ PDF rendering failed:', renderErr);
        throw renderErr;
      }
    } catch (err) {
      console.error('❌ PDF export error:', err);
      console.error('   Error name:', err?.name);
      console.error('   Error message:', err?.message);
      if (err?.stack) console.error('   Stack:', err.stack);
      
      // Provide user-friendly error message based on error type
      let errorMessage = 'Failed to export PDF';
      const errMsg = err?.message || '';
      
      if (err?.name === 'TypeError') {
        errorMessage = 'Failed to process report. Try exporting a smaller report or check your browser.';
      } else if (errMsg.includes('timeout')) {
        errorMessage = 'Report rendering took too long (>90 seconds). Please try with fewer tests.';
      } else if (errMsg.includes('memory')) {
        errorMessage = 'Out of memory. Please try exporting a smaller report.';
      } else if (errMsg.includes('clone')) {
        errorMessage = 'Failed to process report content. Please refresh the page and try again.';
      }
      
      showError(`${errorMessage}\n\nError: ${errMsg}`);
    } finally {
      console.log('🔄 Resetting export state...');
      setIsExporting(false);
      console.log('✅ Export state reset');
    }
  };

  const handleGenerate = async () => {
    setStatusMessage('');

    if (!selectedType) {
      setStatusMessage('❌ Error: Please select a report type');
      showError('Please select a report type');
      return;
    }

    // Validation for LEARNER_REPORT
    if (selectedType === 'LEARNER_REPORT') {
      if (!learners || learners.length === 0) {
        setStatusMessage('❌ Error: No learners available');
        showError('No learners found in the system');
        return;
      }

      if (!selectedLearnerId) {
        setStatusMessage('❌ Error: Please select a learner');
        showError('Please select a learner');
        return;
      }

      if (selectedGrade === 'all') {
        setStatusMessage('❌ Error: Please select a grade');
        showError('Please select a grade');
        return;
      }
    }

    if (selectedType === 'STREAM_REPORT' && selectedStream === 'all') {
      setStatusMessage('❌ Error: Please select a stream');
      showError('Please select a stream');
      return;
    }

    setLoading(true);
    setStatusMessage('⏳ Generating report...');

    try {
      if (selectedType === 'LEARNER_REPORT') {
        // Fetch learner's ALL test results (optionally filtered by test type)
        const learner = learners?.find(l => l.id === selectedLearnerId);
        
        if (!learner) {
          setStatusMessage('❌ Error: Learner not found');
          showError('Learner not found');
          setLoading(false);
          return;
        }

        setStatusMessage(`📚 Loading results for ${learner.firstName} ${learner.lastName}...`);

        // Build query parameters
        const queryParams = {
          term: selectedTerm && selectedTerm !== 'all' ? selectedTerm : undefined,
          academicYear: 2026
        };

        // Remove undefined values
        Object.keys(queryParams).forEach(key => 
          queryParams[key] === undefined && delete queryParams[key]
        );

        console.log('📋 Fetching results with params:', queryParams);

        // Fetch learner's summative results using the correct API method
        const response = await api.assessments.getSummativeByLearner(selectedLearnerId, queryParams);

        console.log('📦 API Response:', response);

        const results = Array.isArray(response?.data) ? response.data : (response?.data ? [response.data] : []);

        console.log('✅ Parsed results:', results);

        // Filter by test group(s) (testType) if selected
        let filteredResults = results;
        
        if (selectedTestGroups && selectedTestGroups.length > 0) {
          // Find all test IDs that belong to the selected test group(s)
          const testIdsInGroups = availableTests
            .filter(t => selectedTestGroups.includes(t.testType))
            .map(t => t.id);
          
          filteredResults = results.filter(r => testIdsInGroups.includes(r.testId));
          console.log(`📌 Filtered by test groups [${selectedTestGroups.join(', ')}]: ${filteredResults.length} results`);
        }

        // Further filter by specific test IDs if selected
        if (selectedTestIds && selectedTestIds.length > 0) {
          filteredResults = filteredResults.filter(r => selectedTestIds.includes(r.testId));
          console.log(`📌 Further filtered by specific tests [${selectedTestIds.join(', ')}]: ${filteredResults.length} results`);
        }

        // Sort results by date (newest first)
        filteredResults.sort((a, b) => {
          const dateA = new Date(a.testDate || 0);
          const dateB = new Date(b.testDate || 0);
          return dateB - dateA;
        });

        if (filteredResults.length === 0) {
          setStatusMessage('⚠️ Warning: No assessment results found for this learner');
          showSuccess('No assessment results found, but report generated');
        } else {
          setStatusMessage(`✅ Success: Loaded ${filteredResults.length} test result(s)`);
        }

        setReportData({
          type: 'LEARNER_REPORT',
          learner: learner,
          results: filteredResults,
          term: selectedTerm,
          testGroups: selectedTestGroups.length > 0 ? selectedTestGroups : 'All Groups',
          selectedTests: selectedTestIds.length > 0 ? selectedTestIds.length : 'All Tests',
          stream: selectedStream !== 'all' ? selectedStream : 'All Streams',
          grade: selectedGrade,
          generatedAt: new Date(),
          totalTests: filteredResults.length,
          averageScore: filteredResults.length > 0 
            ? (filteredResults.reduce((sum, r) => sum + (r.score || 0), 0) / filteredResults.length).toFixed(1)
            : 0
        });

        showSuccess(`Report generated for ${learner.firstName} ${learner.lastName} - ${filteredResults.length} test(s) found`);
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ Error generating report:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to generate report';
      setStatusMessage(`❌ Error: ${errorMessage}`);
      showError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 max-w-7xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-8 pb-4 border-b">Summary Report</h2>

      {/* FILTER CONTROLS - Hidden from PDF */}
      <div className="no-print">
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
            onChange={(e) => {
              console.log('🎓 Grade changed to:', e.target.value);
              setSelectedGrade(e.target.value);
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {availableGrades.map(g => (
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
              <option key={s.id || s.name} value={s.value || s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Second Row: Term and Test Group */}
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
          <label className="block text-sm font-semibold text-gray-700 mb-2">Test Group</label>
          <button
            onClick={() => setShowTestGroupOptions(!showTestGroupOptions)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-left flex justify-between items-center"
          >
            <span>
              {selectedTestGroups.length === 0 
                ? 'All Test Groups' 
                : `${selectedTestGroups.length} group(s) selected`}
            </span>
            <span className="text-sm">▼</span>
          </button>
          
          {/* Test Group Checkboxes */}
          {showTestGroupOptions && (
            <div className="absolute z-10 mt-2 w-72 border border-gray-300 rounded-lg bg-white shadow-lg p-3 max-h-64 overflow-y-auto">
              <div className="mb-2 pb-2 border-b">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTestGroups.length === availableTestGroups.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTestGroups([...availableTestGroups]);
                      } else {
                        setSelectedTestGroups([]);
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-gray-700">Select All</span>
                </label>
              </div>
              
              {availableTestGroups.map(group => (
                <label key={group} className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={selectedTestGroups.includes(group)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTestGroups([...selectedTestGroups, group]);
                      } else {
                        setSelectedTestGroups(selectedTestGroups.filter(g => g !== group));
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-gray-700">{group}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Third Row: Specific Test (optional deeper filtering) and Learner (if applicable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Specific Tests (Optional)</label>
          <button
            onClick={() => setShowTestOptions(!showTestOptions)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-left flex justify-between items-center"
          >
            <span>
              {selectedTestIds.length === 0 
                ? 'All Tests in Group' 
                : `${selectedTestIds.length} test(s) selected`}
            </span>
            <span className="text-sm">▼</span>
          </button>
          
          {/* Specific Tests Checkboxes */}
          {showTestOptions && (
            <div className="absolute z-10 mt-2 w-72 border border-gray-300 rounded-lg bg-white shadow-lg p-3 max-h-64 overflow-y-auto">
              <div className="mb-2 pb-2 border-b">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedTestIds.length === testsInGroups.length && testsInGroups.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTestIds(testsInGroups.map(t => t.id));
                      } else {
                        setSelectedTestIds([]);
                      }
                    }}
                    disabled={testsInGroups.length === 0}
                    className="w-4 h-4 rounded"
                  />
                  <span className="font-semibold text-gray-700">Select All</span>
                </label>
              </div>
              
              {testsInGroups.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Select a test group first</p>
              ) : (
                testsInGroups.map(test => (
                  <label key={test.id} className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={selectedTestIds.includes(test.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTestIds([...selectedTestIds, test.id]);
                        } else {
                          setSelectedTestIds(selectedTestIds.filter(id => id !== test.id));
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-gray-700">{test.title || test.learningArea} ({test.totalMarks} marks)</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        {/* Learner Selector - Only shows for LEARNER_REPORT */}
        {selectedType === 'LEARNER_REPORT' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Learner<span className="text-red-500">*</span></label>
            {console.log('🧑 Learners available:', learners?.length, 'Grade:', selectedGrade, 'Stream:', selectedStream)}
            {learners && learners.length > 0 && console.log('   Sample learner:', {
              id: learners[0].id,
              name: `${learners[0].firstName} ${learners[0].lastName}`,
              grade: learners[0].grade,
              stream: learners[0].stream,
              gradeKey: Object.keys(learners[0]).find(k => k.toLowerCase().includes('grade')),
              streamKey: Object.keys(learners[0]).find(k => k.toLowerCase().includes('stream'))
            })}
            
            {/* Get filtered learners */}
            {(() => {
              const filteredLearners = (learners || [])
                .filter(l => {
                  // Normalize grade - handle various formats
                  const learnerGrade = l.grade?.toString().trim();
                  const filterGrade = selectedGrade?.toString().trim();
                  
                  // Normalize stream - handle various formats
                  const learnerStream = l.stream?.toString().trim();
                  const filterStream = selectedStream?.toString().trim();
                  
                  console.log(`   Checking learner: grade="${learnerGrade}" (filter="${filterGrade}"), stream="${learnerStream}" (filter="${filterStream}")`);
                  
                  // Filter by grade if selected (not 'all')
                  if (filterGrade && filterGrade !== 'all' && learnerGrade !== filterGrade) {
                    console.log(`   ❌ Grade mismatch: "${learnerGrade}" !== "${filterGrade}"`);
                    return false;
                  }
                  
                  // Filter by stream if selected (not 'all')
                  if (filterStream && filterStream !== 'all' && learnerStream !== filterStream) {
                    console.log(`   ❌ Stream mismatch: "${learnerStream}" !== "${filterStream}"`);
                    return false;
                  }
                  
                  console.log(`   ✅ Learner matches`);
                  return true;
                })
                .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

              // If no results with filters, show all learners as fallback
              const displayLearners = filteredLearners.length > 0 ? filteredLearners : (learners || []).sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
              
              const showingFallback = filteredLearners.length === 0 && learners && learners.length > 0;
              console.log('   Filtered learners:', filteredLearners.length, 'Display learners:', displayLearners.length, 'Fallback?', showingFallback);

              return (
                <>
                  <select
                    value={selectedLearnerId}
                    onChange={(e) => setSelectedLearnerId(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Select Learner</option>
                    {displayLearners.length > 0 ? (
                      displayLearners.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.firstName} {l.lastName} ({l.admissionNumber || 'N/A'})
                          {l.grade && ` - ${l.grade}`}
                          {l.stream && ` ${l.stream}`}
                        </option>
                      ))
                    ) : (
                      <option disabled>No learners available</option>
                    )}
                  </select>
                  {showingFallback && (
                    <p className="text-xs text-blue-600 mt-1">ℹ️ Showing all learners (no matches for selected grade/stream)</p>
                  )}
                  {learners?.length === 0 && (
                    <p className="text-xs text-orange-600 mt-1">⚠️ No learners loaded. Refreshing...</p>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex justify-end pt-4 mb-6">
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

      {/* Status Message */}
      {statusMessage && (
        <div className={`rounded-lg p-4 mb-6 border ${
          statusMessage.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' :
          statusMessage.includes('⚠️') ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
          statusMessage.includes('⏳') ? 'bg-blue-50 border-blue-200 text-blue-800' :
          'bg-red-50 border-red-200 text-red-800'
        }`}>
          <p className="font-medium">{statusMessage}</p>
        </div>
      )}
      </div>
      {/* End no-print filter section */}

      {/* LEARNER REPORT DISPLAY - COMPACT PROFESSIONAL LAYOUT */}
      {reportData?.type === 'LEARNER_REPORT' && reportData?.learner && (
        <div ref={reportRef} className="w-full bg-white" style={{ fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: '1.3', padding: '0.5cm' }}>
          
          {/* CORPORATE LETTERHEAD */}
          <div style={{ borderBottom: '3px solid #1e3a8a', paddingBottom: '8px', marginBottom: '8px', pageBreakAfter: 'avoid' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              {/* Logo */}
              {brandingSettings?.logoUrl && (
                <img 
                  src={brandingSettings.logoUrl} 
                  alt="Logo" 
                  style={{ height: '50px', width: 'auto', objectFit: 'contain', flexShrink: 0 }}
                />
              )}
              
              {/* School Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a8a', margin: '0' }}>
                  {user?.school?.name || brandingSettings?.schoolName || 'School'}
                </div>
                <div style={{ fontSize: '10px', color: '#666', margin: '2px 0 0 0' }}>Assessment Report System</div>
                <div style={{ fontSize: '9px', color: '#777', marginTop: '2px' }}>
                  {user?.school?.location && <div>{user.school.location}</div>}
                  {user?.school?.phone && <div>Tel: {user.school.phone}</div>}
                </div>
              </div>

              {/* Date Info */}
              <div style={{ textAlign: 'right', fontSize: '10px', color: '#666' }}>
                <div style={{ fontWeight: 'bold' }}>Academic Year: 2026</div>
                <div style={{ marginTop: '4px' }}>
                  {reportData.generatedAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Report Title */}
            <div style={{ textAlign: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #ddd' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e3a8a' }}>LEARNER ASSESSMENT REPORT</div>
              <div style={{ fontSize: '10px', color: '#777' }}>Individual Performance Summary</div>
            </div>
          </div>

          {/* LEARNER INFO - Compact 2-Column */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px', pageBreakAfter: 'avoid', fontSize: '11px' }}>
            <div style={{ backgroundColor: '#f9f9f9', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '6px', textTransform: 'uppercase' }}>Personal Info</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#444' }}>Name:</span>
                <span>{reportData.learner.firstName} {reportData.learner.lastName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#444' }}>Adm No:</span>
                <span>{reportData.learner.admissionNumber || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: '#444' }}>DOB:</span>
                <span style={{ fontSize: '10px' }}>
                  {reportData.learner.dateOfBirth 
                    ? new Date(reportData.learner.dateOfBirth).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
                    : '—'}
                </span>
              </div>
            </div>

            <div style={{ backgroundColor: '#f9f9f9', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '6px', textTransform: 'uppercase' }}>Academic Info</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#444' }}>Grade:</span>
                <span>{reportData.learner.grade?.replace('_', ' ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 'bold', color: '#444' }}>Stream:</span>
                <span>{reportData.learner.stream || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: '#444' }}>Term:</span>
                <span>{selectedTerm?.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* COMPREHENSIVE SUBJECTS TABLE */}
          <div style={{ marginBottom: '10px', pageBreakAfter: 'avoid' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '6px', paddingBottom: '4px', borderBottom: '2px solid #1e3a8a', textTransform: 'uppercase' }}>
              Assessment Results by Subject
            </div>

            {(() => {
              // Get all unique learning areas from streamConfigs or results
              const allLearningAreas = [];
              
              // First try to get from streamConfigs
              if (streamConfigs && streamConfigs.length > 0) {
                const gradeConfig = streamConfigs.find(sc => sc.grade === reportData.learner.grade);
                if (gradeConfig && gradeConfig.streams && gradeConfig.streams.length > 0) {
                  const streamConfig = gradeConfig.streams.find(s => !s.name || s.name === reportData.learner.stream);
                  if (streamConfig && streamConfig.learningAreas) {
                    allLearningAreas.push(...streamConfig.learningAreas);
                  }
                }
              }

              // If still empty, extract from results
              if (allLearningAreas.length === 0 && reportData.results) {
                const areasFromResults = new Set(reportData.results.map(r => r.learningArea || 'General'));
                allLearningAreas.push(...Array.from(areasFromResults));
              }

              // Group results by learning area
              const resultsByArea = {};
              reportData.results.forEach(result => {
                const area = result.learningArea || 'General';
                if (!resultsByArea[area]) {
                  resultsByArea[area] = [];
                }
                resultsByArea[area].push(result);
              });

              // Ensure all learning areas are shown, even if no results
              const areasToDisplay = allLearningAreas.length > 0 
                ? allLearningAreas.filter((area, idx, self) => self.indexOf(area) === idx)
                : Object.keys(resultsByArea);

              return (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
                      <th style={{ border: '1px solid #999', padding: '6px', textAlign: 'left', fontWeight: 'bold' }}>Subject/Learning Area</th>
                      <th style={{ border: '1px solid #999', padding: '6px', textAlign: 'center', fontWeight: 'bold', width: '60px' }}>Tests</th>
                      <th style={{ border: '1px solid #999', padding: '6px', textAlign: 'center', fontWeight: 'bold', width: '60px' }}>Score</th>
                      <th style={{ border: '1px solid #999', padding: '6px', textAlign: 'center', fontWeight: 'bold', width: '50px' }}>%</th>
                      <th style={{ border: '1px solid #999', padding: '6px', textAlign: 'left', fontWeight: 'bold', width: '70px' }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {areasToDisplay.map((area, idx) => {
                      const results = resultsByArea[area] || [];
                      const testCount = results.length;
                      const areaScore = results.reduce((sum, r) => sum + (r.score || 0), 0);
                      const areaTotal = results.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
                      const percentage = areaTotal > 0 ? ((areaScore / areaTotal) * 100).toFixed(1) : 0;

                      // Determine grade based on percentage
                      let gradeSymbol = '—';
                      if (percentage > 0) {
                        if (percentage >= 90) gradeSymbol = 'A';
                        else if (percentage >= 80) gradeSymbol = 'B';
                        else if (percentage >= 70) gradeSymbol = 'C';
                        else if (percentage >= 60) gradeSymbol = 'D';
                        else gradeSymbol = 'E';
                      }

                      return (
                        <tr key={area} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                          <td style={{ border: '1px solid #ddd', padding: '6px', fontWeight: 'bold', color: '#333' }}>{area}</td>
                          <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center', color: '#1e3a8a', fontWeight: 'bold' }}>{testCount}</td>
                          <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center', color: '#1e3a8a', fontWeight: 'bold' }}>
                            {testCount > 0 ? `${areaScore}/${areaTotal}` : '—'}
                          </td>
                          <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center', color: '#1e3a8a', fontWeight: 'bold' }}>
                            {testCount > 0 ? `${percentage}%` : '—'}
                          </td>
                          <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'center', fontWeight: 'bold', fontSize: '11px', color: testCount > 0 ? '#d32f2f' : '#999' }}>
                            {gradeSymbol}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            })()}
          </div>

          {/* OVERALL SUMMARY */}
          {reportData.results && reportData.results.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '8px', pageBreakAfter: 'avoid', fontSize: '10px' }}>
              {(() => {
                const totalTests = reportData.results.length;
                const totalScore = reportData.results.reduce((sum, r) => sum + (r.score || 0), 0);
                const totalMarks = reportData.results.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
                const avgPercentage = (totalScore / totalMarks * 100).toFixed(1);

                return (
                  <>
                    <div style={{ backgroundColor: '#e3f2fd', padding: '8px', border: '1px solid #1e3a8a', borderRadius: '3px', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '4px' }}>Tests Done</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1e3a8a' }}>{totalTests}</div>
                    </div>
                    <div style={{ backgroundColor: '#f3e5f5', padding: '8px', border: '1px solid #7b1fa2', borderRadius: '3px', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#7b1fa2', marginBottom: '4px' }}>Total Score</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#7b1fa2' }}>{totalScore}/{totalMarks}</div>
                    </div>
                    <div style={{ backgroundColor: '#e8f5e9', padding: '8px', border: '1px solid #2e7d32', borderRadius: '3px', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#2e7d32', marginBottom: '4px' }}>Average %</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>{avgPercentage}%</div>
                    </div>
                    <div style={{ backgroundColor: '#fff3e0', padding: '8px', border: '1px solid #e65100', borderRadius: '3px', textAlign: 'center' }}>
                      <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#e65100', marginBottom: '4px' }}>Overall</div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e65100' }}>
                        {avgPercentage >= 90 ? 'A' : avgPercentage >= 80 ? 'B' : avgPercentage >= 70 ? 'C' : avgPercentage >= 60 ? 'D' : 'E'}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* FOOTER */}
          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #ddd', fontSize: '9px', textAlign: 'center', color: '#777', pageBreakBefore: 'avoid' }}>
            <div>This is an official report generated by the Assessment System.</div>
            <div style={{ marginTop: '2px' }}>For inquiries, contact the administration office.</div>
          </div>

          {/* PRINT CONTROLS - Hidden from PDF */}
          <div className="no-print" style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setReportData(null)}
              disabled={isExporting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            <button
              data-export-button
              onClick={(e) => {
                console.log('🔘 Button clicked!', e);
                handleExportPDF();
              }}
              disabled={isExporting}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? '⏳ Exporting...' : '📥 Export PDF'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummativeReport;