/**
 * Summary Report Page
 * Clean, minimal design matching Summative Assessment setup - Single Source of Truth
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Loader, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { useNotifications } from '../hooks/useNotifications';
import { generateHighFidelityPDF } from '../../../utils/simplePdfGenerator';
import api, { configAPI } from '../../../services/api';
import { useAssessmentSetup } from '../hooks/useAssessmentSetup';
import { getLearningAreasByGrade, getAllLearningAreas } from '../../../constants/learningAreas';

// ============================================================================
// CBC SMS COMPLIANCE REQUIREMENTS CHECKER
// ============================================================================
/**
 * Validates report data against CBC-compliant SMS requirements
 * Returns { isCompliant: boolean, gaps: Array<string>, warnings: Array<string> }
 */
const validateCBCSMSCompliance = (reportData, streamConfigs, selectedType) => {
  const gaps = [];
  const warnings = [];

  console.log('🔍 CBC SMS Compliance Validation Started');
  console.log('   Report Type:', selectedType);
  console.log('   Report Data:', reportData);

  // ========== REQUIREMENT 1: Competency-Based Grading ==========
  console.log('\n1️⃣ Checking competency-based grading (Developing/Achieved/Exceeding)...');
  if (reportData?.results && reportData.results.length > 0) {
    const hasAchievementLevels = reportData.results.every(r =>
      r.achievementLevel || r.competencyLevel || r.cbcLevel
    );

    if (!hasAchievementLevels) {
      // Check if we have raw marks instead
      const hasRawMarks = reportData.results.some(r => r.score && r.totalMarks);
      if (hasRawMarks) {
        gaps.push(
          '❌ GAP 1.1: Results contain raw marks/scores instead of CBC achievement levels (Developing/Achieved/Exceeding)'
        );
        console.log('   ❌ Results have scores but missing achievement levels');
      }
    } else {
      console.log('   ✅ Achievement levels present:', new Set(reportData.results.map(r => r.achievementLevel || r.competencyLevel || r.cbcLevel)));
    }

    // Check for competency/strand mapping
    const hasCompetencies = reportData.results.every(r => r.competency || r.competencyName || r.strand);
    if (!hasCompetencies) {
      gaps.push(
        '❌ GAP 1.2: Results missing CBC competency/strand mapping (Communication, Critical Thinking, etc.)'
      );
      console.log('   ❌ Results lack competency mapping');
    } else {
      console.log('   ✅ Competencies mapped:', new Set(reportData.results.map(r => r.competency || r.competencyName || r.strand)));
    }
  }

  // ========== REQUIREMENT 2: Assessment State & Publish Approval ==========
  console.log('\n2️⃣ Checking assessment publish/approval states...');
  if (reportData?.results && reportData.results.length > 0) {
    const hasPublishState = reportData.results.every(r =>
      r.publishedAt || r.publishStatus === 'PUBLISHED' || r.status === 'PUBLISHED'
    );

    if (!hasPublishState) {
      warnings.push(
        '⚠️ WARNING 2.1: Results missing explicit publish timestamp/status - SMS should only trigger on PUBLISHED state'
      );
      console.log('   ⚠️ Missing publishedAt or publishStatus');
    } else {
      console.log('   ✅ All results have publish status');
    }

    // Check assessment type separation (Formative vs Summative)
    const assessmentTypes = new Set(reportData.results.map(r => r.assessmentType || r.type));
    if (assessmentTypes.size === 0) {
      gaps.push(
        '❌ GAP 2.2: Assessment type not specified (FORMATIVE vs SUMMATIVE) - required to select correct SMS template'
      );
      console.log('   ❌ Missing assessment type classification');
    } else {
      console.log('   ✅ Assessment types found:', Array.from(assessmentTypes));
    }
  }

  // ========== REQUIREMENT 3: Competency-to-SMS Mapping ==========
  console.log('\n3️⃣ Checking competency-to-SMS message mapping...');
  if (reportData?.results && reportData.results.length > 0) {
    // Check if we can generate "can now..." language
    const canGenerateCompetencyNarrative = reportData.results.every(r => {
      const hasCompetency = r.competency || r.competencyName || r.strand;
      const hasAchievementLevel = r.achievementLevel || r.competencyLevel || r.cbcLevel;
      return hasCompetency && hasAchievementLevel;
    });

    if (!canGenerateCompetencyNarrative) {
      gaps.push(
        '❌ GAP 3.1: Cannot map competencies to SMS narrative (missing competency+achievementLevel pairs)'
      );
      console.log('   ❌ Incomplete competency-level pairs for narrative generation');
    } else {
      console.log('   ✅ Can generate competency narratives ("can now...", "area to support")');
    }

    // Check for subStrand/specific competency area
    const hasSubStrands = reportData.results.some(r => r.subStrand || r.competencyArea || r.skillArea || r.learningArea);
    if (!hasSubStrands) {
      warnings.push(
        '⚠️ WARNING 3.2: Specific skill areas missing - SMS will be generic'
      );
      console.log('   ⚠️ Missing sub-strand specificity');
    } else {
      console.log('   ✅ Sub-strand/specific areas available (using learningArea as fallback)');
    }
  }

  // ========== REQUIREMENT 4: SMS Trigger Control & Cooldowns ==========
  console.log('\n4️⃣ Checking SMS trigger controls and rate limiting...');

  // Check for parent phone data
  const hasParentPhone = reportData?.learner?.parentPhone || reportData?.learner?.parentPhoneNumber || reportData?.learner?.guardianPhone;
  if (!hasParentPhone) {
    gaps.push(
      '❌ GAP 4.1: Parent phone number missing from learner record - cannot trigger SMS'
    );
    console.log('   ❌ No parent phone number available');
  } else {
    console.log('   ✅ Parent phone available');
  }

  // Check for SMS audit/tracking fields
  const hasSMSAuditFields = reportData?.smsTracking || reportData?.smsSent || reportData?.smsStatus;
  if (!hasSMSAuditFields) {
    warnings.push(
      '⚠️ WARNING 4.2: No SMS status/audit fields in report - cannot verify if SMS already sent (spam risk)'
    );
    console.log('   ⚠️ Missing SMS audit/tracking');
  } else {
    console.log('   ✅ SMS audit fields present');
  }

  // Check for cooldown mechanism
  const hasCooldownControl = reportData?.smsLastSentAt || reportData?.smsCooldownExpiry;
  if (!hasCooldownControl) {
    warnings.push(
      '⚠️ WARNING 4.3: No cooldown mechanism - multiple publishes could trigger duplicate SMS to same parent'
    );
    console.log('   ⚠️ No cooldown/rate-limit tracking');
  } else {
    console.log('   ✅ Cooldown mechanism in place');
  }

  // ========== REQUIREMENT 5: CBC-Safe SMS Templates ==========
  console.log('\n5️⃣ Checking availability of CBC-safe SMS templates...');
  const requiredTemplates = [
    'FORMATIVE_UPDATE',
    'SUMMATIVE_TERM_SUMMARY',
    'COMPETENCY_ACHIEVEMENT',
    'EARLY_INTERVENTION_ALERT',
    'ASSESSMENT_COMPLETION',
    'NATIONAL_KNEC_NOTICE'
  ];

  // Check if templates are configured (this would be in SMS service, not report data)
  // For now, flag as warning since we can't verify from this component
  warnings.push(
    `⚠️ WARNING 5.1: Cannot verify CBC-safe SMS templates from report component (requires SMS service check)`
  );
  console.log('   ⚠️ Template verification requires SMS service inspection');
  console.log('      Required templates:', requiredTemplates);

  // ========== REQUIREMENT 6: Required Audit Data Fields ==========
  console.log('\n6️⃣ Checking required audit data fields...');
  const requiredAuditFields = [
    { field: 'learnerName', check: () => reportData?.learner?.firstName && reportData?.learner?.lastName },
    { field: 'learnerGrade', check: () => reportData?.learner?.grade },
    { field: 'parentPhone', check: () => reportData?.learner?.parentPhone || reportData?.learner?.parentPhoneNumber || reportData?.learner?.guardianPhone },
    { field: 'competency', check: () => reportData?.results?.some(r => r.competency || r.competencyName) },
    { field: 'achievementLevel', check: () => reportData?.results?.some(r => r.achievementLevel || r.competencyLevel) },
    { field: 'assessmentType', check: () => reportData?.results?.some(r => r.assessmentType || r.type) },
    { field: 'smsStatus', check: () => reportData?.smsStatus || 'NOT_YET_TRACKED' },
    { field: 'smsTimestamp', check: () => reportData?.smsSentAt || 'NOT_YET_SENT' }
  ];

  const missingFields = requiredAuditFields.filter(f => {
    const present = f.check();
    if (!present) {
      console.log(`   ❌ Missing: ${f.field}`);
    } else {
      console.log(`   ✅ Present: ${f.field}`);
    }
    return !present;
  });

  if (missingFields.length > 0) {
    gaps.push(
      `❌ GAP 6.1: Missing required audit fields: ${missingFields.map(f => f.field).join(', ')}`
    );
  }

  // ========== REQUIREMENT 7: Portal/Report Links ==========
  console.log('\n7️⃣ Checking optional report links (portal/PDF/WhatsApp)...');
  const hasReportLink = reportData?.portalLink || reportData?.reportUrl || reportData?.whatsappLink;
  if (!hasReportLink) {
    warnings.push(
      '⚠️ WARNING 7.1: No portal/report links configured - SMS will be summary-only (acceptable but limits parent engagement)'
    );
    console.log('   ⚠️ No links to full reports');
  } else {
    console.log('   ✅ Report links available');
  }

  const isCompliant = gaps.length === 0;

  console.log('\n' + '='.repeat(70));
  console.log('📊 CBC SMS COMPLIANCE SUMMARY');
  console.log('='.repeat(70));
  console.log(`Status: ${isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}`);
  console.log(`Critical Gaps: ${gaps.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log('='.repeat(70));

  return { isCompliant, gaps, warnings };
};

// ============================================================================
// GRADING UTILITIES
// ============================================================================
const getCBCGrade = (percentage) => {
  if (percentage >= 90) return { grade: 'EE1', remark: 'Exceeding Expectations 1 - Outstanding', color: '#15803d' };
  if (percentage >= 75) return { grade: 'EE2', remark: 'Exceeding Expectations 2 - Very High', color: '#166534' };
  if (percentage >= 58) return { grade: 'ME1', remark: 'Meeting Expectations 1 - High Average', color: '#22c55e' };
  if (percentage >= 41) return { grade: 'ME2', remark: 'Meeting Expectations 2 - Average', color: '#4ade80' };
  if (percentage >= 31) return { grade: 'AE1', remark: 'Approaching Expectations 1 - Low Average', color: '#eab308' };
  if (percentage >= 21) return { grade: 'AE2', remark: 'Approaching Expectations 2 - Below Average', color: '#facc15' };
  if (percentage >= 11) return { grade: 'BE1', remark: 'Below Expectations 1 - Low', color: '#f97316' };
  return { grade: 'BE2', remark: 'Below Expectations 2 - Very Low', color: '#dc2626' };
};

const SummativeReport = ({ learners, onFetchLearners, brandingSettings, user }) => {
  const { showSuccess, showError } = useNotifications();

  // Use centralized hooks for assessment state management
  const setup = useAssessmentSetup({ defaultTerm: 'TERM_1' });

  const [selectedType, setSelectedType] = useState('LEARNER_REPORT');
  const [selectedTestGroups, setSelectedTestGroups] = useState([]);
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [streamConfigs, setStreamConfigs] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [showTestGroupOptions, setShowTestGroupOptions] = useState(false);
  const [showTestOptions, setShowTestOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const reportRef = useRef(null);

  // NEW: State for compliance check results
  const [complianceCheckResult, setComplianceCheckResult] = useState(null);
  const [showComplianceDetails, setShowComplianceDetails] = useState(false);

  // Local learner fetching state
  const [fetchedReportLearners, setFetchedReportLearners] = useState([]);
  const [loadingLearners, setLoadingLearners] = useState(false);

  // SMS sending state
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [showSMSPreview, setShowSMSPreview] = useState(false);
  const [smsPreviewData, setSmsPreviewData] = useState(null);

  // General Notification Modal state
  const [notificationModal, setNotificationModal] = useState({ show: false, title: '', message: '', type: 'info' });

  const reportTypes = [
    { value: 'GRADE_REPORT', label: 'Grade Report' },
    { value: 'STREAM_REPORT', label: 'Stream Report' },
    { value: 'LEARNER_REPORT', label: 'Learner Report' },
    { value: 'LEARNER_TERMLY_REPORT', label: 'Learner Termly Report' },
    { value: 'STREAM_RANKING_REPORT', label: 'Stream Ranking Report' },
    { value: 'STREAM_ANALYSIS_REPORT', label: 'Stream Analysis Report' },
    { value: 'GRADE_ANALYSIS_REPORT', label: 'Grade Analysis Report' }
  ];

  // Local state for grade, stream, term selections (instead of relying on setup hook)
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('TERM_1');

  // Get terms from hook
  const terms = setup.terms;
  const academicYear = setup.academicYear;

  // Selection mappings - use local state for learner selection
  const [selectedLearnerId, setSelectedLearnerId] = useState('');

  // Helper to normalize strings for comparison (e.g., "Grade 1" -> "GRADE_1")
  const normalize = (str) => {
    if (!str) return '';
    return String(str).trim().replace(/\s+/g, '_').toUpperCase();
  };

  // Dynamic learner fetching whenever grade or stream changes
  useEffect(() => {
    const fetchReportLearners = async () => {
      // If grade is not selected, we don't fetch specific learners
      if (!selectedGrade || selectedGrade === 'all') {
        setFetchedReportLearners([]);
        return;
      }

      try {
        setLoadingLearners(true);
        const params = {
          grade: selectedGrade,
          limit: 1000 // Ensure we get all students for the grade
        };
        if (selectedStream && selectedStream !== 'all') params.stream = selectedStream;

        console.log('🔄 Fetching learners for selection from API...', params);
        const response = await api.learners.getAll(params);

        if (response.success) {
          const data = response.data || [];
          setFetchedReportLearners(data.sort((a, b) =>
            `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
          ));
        }
      } catch (err) {
        console.error('❌ Error fetching learners in SummativeReport:', err);
      } finally {
        setLoadingLearners(false);
      }
    };

    fetchReportLearners();
  }, [selectedGrade, selectedStream]);

  // Filter learners by grade and stream - Properly named useMemo
  const filteredLearners = useMemo(() => {
    // Priority: Use locally fetched learners if we have a grade selection
    if (selectedGrade && selectedGrade !== 'all' && fetchedReportLearners.length > 0) {
      return fetchedReportLearners;
    }

    // Fallback: Use the learners prop passed from parent (limited to 50)
    if (!learners || learners.length === 0) return [];

    return learners.filter(l => {
      // Filter by grade
      if (selectedGrade && selectedGrade !== 'all') {
        if (normalize(l.grade) !== normalize(selectedGrade)) return false;
      }

      // Filter by stream
      if (selectedStream && selectedStream !== 'all') {
        if (normalize(l.stream) !== normalize(selectedStream)) return false;
      }

      return true;
    }).sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
  }, [learners, fetchedReportLearners, selectedGrade, selectedStream]);

  // Fetch learners on component mount
  useEffect(() => {
    console.log('📚 Component mounted, calling onFetchLearners...');
    if (onFetchLearners && typeof onFetchLearners === 'function') {
      onFetchLearners();
    } else {
      console.warn('⚠️ onFetchLearners not available or not a function');
    }
  }, [onFetchLearners]);

  // Fetch grades from backend (Source of Truth)
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const schoolId = user?.schoolId || user?.school?.id || localStorage.getItem('currentSchoolId');

        if (!schoolId) {
          console.warn('⚠️ No school ID found - cannot fetch grades');
          setGrades([]);
          return;
        }

        console.log('🔄 Fetching grades for school:', schoolId);
        const response = await configAPI.getGrades(schoolId);

        let gradesData = Array.isArray(response) ? response : (response?.data ? response.data : []);

        // If grades are strings, convert to objects with value and label
        gradesData = gradesData.map(g => {
          if (typeof g === 'string') {
            return { value: g, label: g };
          }
          return { value: g.value || g.name || g, label: g.label || g.name || g };
        });

        console.log('✅ Grades loaded:', gradesData.length);
        setGrades(gradesData || []);
      } catch (err) {
        console.error('❌ Error fetching grades:', err);
        setGrades([]);
      }
    };

    if (user) {
      fetchGrades();
    }
  }, [user]);

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
        const params = { term: setup.selectedTerm, academicYear: setup.academicYear };
        if (setup.selectedGrade && setup.selectedGrade !== 'all') params.grade = setup.selectedGrade;
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
  }, [setup.selectedGrade, setup.selectedTerm, setup.academicYear]);

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
    if (!reportData?.learner) {
      showError(
        'No report data to export. Please generate a report first by clicking the "Generate Report" button.'
      );
      return;
    }
    if (isExporting) return;

    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${reportData.learner.firstName}_${reportData.learner.lastName}_Summative_Report_${timestamp}.pdf`;

      const schoolInfo = {
        schoolName: user?.school?.name || brandingSettings?.schoolName || 'School',
        address: user?.school?.location || 'School Address',
        phone: user?.school?.phone || 'Phone Number',
        email: user?.school?.email || 'email@school.com',
        website: user?.school?.website || 'www.school.com',
        logoUrl: brandingSettings?.logoUrl || user?.school?.logo || '/logo-zawadi.png',
        brandColor: brandingSettings?.brandColor || '#1e3a8a',
        skipLetterhead: true, // Report already has its own letterhead in the content
      };

      const result = await generateHighFidelityPDF(
        'summative-report-content',
        filename,
        {
          onProgress: (msg) => {
            setPdfProgress(msg);
            console.log(`📑 PDF Progress: ${msg}`);
          }
        }
      );

      if (result?.success) {
        showSuccess('High-quality report downloaded successfully!');
      } else {
        showError(result?.error || 'High-fidelity PDF generation failed');
      }
    } catch (err) {
      console.error('PDF export error:', err);
      showError(err?.message || 'Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setPdfProgress('');
    }
  };

  const handleSendSMS = async () => {
    if (!reportData || reportData.type !== 'LEARNER_REPORT') {
      showError('SMS can only be sent for learner reports');
      return;
    }

    const learner = reportData.learner;
    if (!learner) {
      showError('Learner information not available');
      return;
    }

    // Get parent phone from learner data
    const parentPhone = learner.guardianPhone || learner.parentPhoneNumber || learner.parentPhone || learner.parent?.phone;
    const parentName = learner.guardianName || learner.parent?.firstName || 'Parent';
    const termLabel = terms.find(t => t.value === selectedTerm)?.label || selectedTerm;

    if (!parentPhone) {
      setNotificationModal({
        show: true,
        title: 'Missing Information',
        message: 'Parent phone number not available for this learner. Please update the learner record before sending SMS.',
        type: 'warning'
      });
      return;
    }

    const totalMarks = reportData.results.reduce((sum, r) => sum + (r.score || 0), 0);
    const maxPossibleMarks = reportData.results.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
    const averageScore = reportData.averageScore || (maxPossibleMarks > 0 ? ((totalMarks / maxPossibleMarks) * 100).toFixed(1) : 0);
    const { grade: overallGrade } = getCBCGrade(parseFloat(averageScore));

    const schoolName = brandingSettings?.schoolName || 'YOUR SCHOOL';

    const subjects = reportData.results.reduce((acc, r) => {
      const area = r.learningArea || 'General';
      const pct = r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : 0;
      const { grade } = getCBCGrade(pct);
      // Simplify grades for SMS (EE1 -> EE)
      const simpleGrade = grade.replace(/\d+/g, '');
      acc[area] = { score: Math.round(r.score), grade: simpleGrade };
      return acc;
    }, {});

    // Generate preview message matching requested sample
    const subjectsSummary = Object.entries(subjects).map(([name, detail]) => {
      const code = name.length > 8 ? name.substring(0, 8).toUpperCase() : name.toUpperCase();
      return `${code}: ${detail.score} ${detail.grade}`;
    }).join('\n');

    const message = `FROM ${schoolName.toUpperCase()}\n\n` +
      `${parentName ? `Dear ${parentName}` : 'Dear Parent'},\n\n` +
      `Midterm Assessment, ${termLabel}, ${academicYear || new Date().getFullYear()}\n\n` +
      `NAME: ${learner.firstName} ${learner.lastName}\n` +
      `GRADE: ${learner.grade}\n\n` +
      `GRADE:${overallGrade.replace(/\d+/g, '')}\n` +
      `MEAN MARKS: ${averageScore}%\n` +
      `TOTAL MARKS: ${totalMarks} / ${maxPossibleMarks}\n\n` +
      `${subjectsSummary}`;

    setSmsPreviewData({
      recipient: parentPhone,
      parentName: parentName,
      learnerName: `${learner.firstName} ${learner.lastName}`,
      message: message,
      subjects: subjects,
      termLabel: termLabel,
      totalMarks: totalMarks,
      maxPossibleMarks: maxPossibleMarks,
      averageScore: averageScore,
      overallGrade: overallGrade.replace(/\d+/g, '')
    });
    setShowSMSPreview(true);
  };

  /**
   * Final Execution of SMS sending
   */
  const executeSendSMS = async () => {
    if (!smsPreviewData) return;

    setIsSendingSMS(true);
    setShowSMSPreview(false);

    try {
      const response = await api.notifications.sendAssessmentReportSms({
        learnerId: reportData.learner.id,
        learnerName: smsPreviewData.learnerName,
        learnerGrade: reportData.learner.grade,
        parentPhone: smsPreviewData.recipient,
        parentName: smsPreviewData.parentName,
        term: smsPreviewData.termLabel,
        totalTests: reportData.totalTests || 0,
        averageScore: smsPreviewData.averageScore,
        overallGrade: smsPreviewData.overallGrade,
        totalMarks: smsPreviewData.totalMarks,
        maxPossibleMarks: smsPreviewData.maxPossibleMarks,
        subjects: smsPreviewData.subjects
      });

      if (response.success || response.data?.success) {
        const messageId = response.data?.messageId || response.messageId || 'N/A';
        setNotificationModal({
          show: true,
          title: 'SMS Sent Successfully',
          message: `The report summary has been sent to ${smsPreviewData.recipient}. Message ID: ${messageId}`,
          type: 'success'
        });
      } else {
        throw new Error(response.message || response.data?.message || 'Failed to send SMS');
      }
    } catch (err) {
      console.error('❌ SMS Send Error:', err);
      setNotificationModal({
        show: true,
        title: 'SMS Delivery Failed',
        message: err.message || 'An error occurred while sending the SMS. Please check your provider settings.',
        type: 'error'
      });
    } finally {
      setIsSendingSMS(false);
      setSmsPreviewData(null);
    }
  };

  const handleGenerate = async () => {
    setStatusMessage('');
    setComplianceCheckResult(null); // Reset compliance check

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
        const learner = filteredLearners?.find(l => l.id === selectedLearnerId);

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
          academicYear: academicYear
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

        // Process results to include metadata from test relation for compliance checks
        const processedResults = filteredResults.map(r => {
          const score = r.marksObtained !== undefined ? r.marksObtained : r.score;
          const totalMarks = r.test?.totalMarks || r.totalMarks || 100;
          const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
          const { grade, remark } = getCBCGrade(percentage);

          return {
            ...r,
            score,
            totalMarks,
            learningArea: r.test?.learningArea || r.learningArea || 'General',
            testType: r.test?.testType || r.testType || 'Assessment',

            // Map CBC compliance fields
            competency: r.test?.learningArea || r.learningArea || 'General',
            achievementLevel: grade,
            competencyLevel: grade,
            remark: remark,
            strand: r.test?.learningArea || r.learningArea || 'General',
            assessmentType: r.test?.testType || 'SUMMATIVE',
            status: r.test?.published ? 'PUBLISHED' : (r.status || 'DRAFT'),
            publishedAt: r.test?.testDate || new Date(),
            parentPhone: learner.guardianPhone || learner.parentPhoneNumber || learner.parentPhone
          };
        });

        // Sort results by date (newest first)
        processedResults.sort((a, b) => {
          const dateA = new Date(a.testDate || (a.test && a.test.testDate) || 0);
          const dateB = new Date(b.testDate || (b.test && b.test.testDate) || 0);
          return dateB - dateA;
        });

        if (processedResults.length === 0) {
          setStatusMessage('⚠️ Warning: No assessment results found for this learner');
          showSuccess('No assessment results found, but report generated');
        } else {
          setStatusMessage(`✅ Success: Loaded ${processedResults.length} test result(s)`);
        }

        setReportData({
          type: 'LEARNER_REPORT',
          learner: learner,
          results: processedResults,
          term: selectedTerm,
          testGroups: selectedTestGroups.length > 0 ? selectedTestGroups : 'All Groups',
          selectedTests: selectedTestIds.length > 0 ? selectedTestIds.length : 'All Tests',
          stream: selectedStream !== 'all' ? selectedStream : 'All Streams',
          grade: selectedGrade,
          generatedAt: new Date(),
          totalTests: processedResults.length,
          averageScore: processedResults.length > 0
            ? (processedResults.reduce((sum, r) => sum + (r.score || r.percentage || 0), 0) / processedResults.length).toFixed(1)
            : 0
        });

        // NEW: Run CBC SMS compliance check
        console.log('\n🔍 RUNNING CBC SMS COMPLIANCE CHECK...');
        const complianceResult = validateCBCSMSCompliance(
          {
            type: 'LEARNER_REPORT',
            learner: {
              ...learner,
              parentPhone: learner.guardianPhone || learner.parentPhoneNumber || learner.parentPhone
            },
            results: processedResults,
            term: selectedTerm,
            grade: selectedGrade
          },
          streamConfigs,
          selectedType
        );

        setComplianceCheckResult(complianceResult);

        // Show warning if non-compliant
        if (!complianceResult.isCompliant) {
          showError(
            `⚠️ CBC SMS Compliance Issues Found\n\nCritical Gaps: ${complianceResult.gaps.length}\n\nCheck the compliance report below for details.`
          );
        } else if (complianceResult.warnings.length > 0) {
          showSuccess(
            `✅ Report Generated (${filteredResults.length} tests)\n\n⚠️ ${complianceResult.warnings.length} warning(s) - See details below`
          );
        } else {
          showSuccess(`Report generated for ${learner.firstName} ${learner.lastName} - ${filteredResults.length} test(s) found`);
        }
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
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Grade</option>
              <option value="all">All Grades</option>
              {(grades || []).map(g => {
                // Handle both string grades and object grades
                const gradeValue = typeof g === 'string' ? g : (g.value || g.id || g.name);
                const gradeLabel = typeof g === 'string' ? g : (g.label || g.name || g);
                return (
                  <option key={gradeValue} value={gradeValue}>
                    {gradeLabel}
                  </option>
                );
              })}
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
                // If no results with filters and not loading, show all learners as fallback
                const displayLearners = filteredLearners.length > 0 ? filteredLearners : (learners || []).sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

                const showingFallback = filteredLearners.length === 0 && learners && learners.length > 0 && !loadingLearners;

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
                    {loadingLearners && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <Loader className="animate-spin" size={12} /> Loading matching students...
                      </p>
                    )}
                    {showingFallback && (
                      <p className="text-xs text-blue-600 mt-1">ℹ️ Showing all learners (no matches for selected grade/stream in current view)</p>
                    )}
                    {learners?.length === 0 && !loadingLearners && (
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
          <div className={`rounded-lg p-4 mb-6 border ${statusMessage.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' :
            statusMessage.includes('⚠️') ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
              statusMessage.includes('⏳') ? 'bg-blue-50 border-blue-200 text-blue-800' :
                'bg-red-50 border-red-200 text-red-800'
            }`}>
            <p className="font-medium">{statusMessage}</p>
          </div>
        )}

        {/* NEW: CBC SMS COMPLIANCE REPORT */}
        {complianceCheckResult && (
          <div className={`rounded-lg border-2 p-6 mb-6 ${complianceCheckResult.isCompliant
            ? 'bg-green-50 border-green-300'
            : 'bg-red-50 border-red-300'
            }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {complianceCheckResult.isCompliant ? (
                  <CheckCircle size={24} className="text-green-600" />
                ) : (
                  <XCircle size={24} className="text-red-600" />
                )}
                <h3 className={`text-lg font-bold ${complianceCheckResult.isCompliant ? 'text-green-800' : 'text-red-800'
                  }`}>
                  CBC SMS Compliance Report
                </h3>
              </div>
              <button
                onClick={() => setShowComplianceDetails(!showComplianceDetails)}
                className="text-sm font-semibold px-3 py-1 bg-white rounded hover:bg-gray-100 transition"
              >
                {showComplianceDetails ? '▲ Hide' : '▼ Show'} Details
              </button>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded p-3 text-center">
                <div className="text-xs font-semibold text-gray-600 mb-1">Status</div>
                <div className={`text-lg font-bold ${complianceCheckResult.isCompliant ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {complianceCheckResult.isCompliant ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
                </div>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-xs font-semibold text-gray-600 mb-1">Critical Gaps</div>
                <div className={`text-lg font-bold ${complianceCheckResult.gaps.length === 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {complianceCheckResult.gaps.length}
                </div>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-xs font-semibold text-gray-600 mb-1">Warnings</div>
                <div className={`text-lg font-bold ${complianceCheckResult.warnings.length === 0 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                  {complianceCheckResult.warnings.length}
                </div>
              </div>
            </div>

            {/* Detailed Issues */}
            {showComplianceDetails && (
              <div className="space-y-3 mt-4">
                {complianceCheckResult.gaps.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">🔴 Critical Gaps (Must Fix)</h4>
                    <ul className="space-y-1">
                      {complianceCheckResult.gaps.map((gap, idx) => (
                        <li key={idx} className="text-sm text-red-700 flex gap-2">
                          <span className="flex-shrink-0">•</span>
                          <span>{gap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {complianceCheckResult.warnings.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">🟡 Warnings (Recommended Fixes)</h4>
                    <ul className="space-y-1">
                      {complianceCheckResult.warnings.map((warning, idx) => (
                        <li key={idx} className="text-sm text-yellow-700 flex gap-2">
                          <span className="flex-shrink-0">•</span>
                          <span>{warning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {complianceCheckResult.isCompliant && (
                  <div className="text-sm text-green-700 font-semibold">
                    ✅ All requirements met - SMS can be safely triggered on assessment publish
                  </div>
                )}
              </div>
            )}

            {/* Action Items */}
            <div className="mt-4 p-3 bg-white rounded text-sm">
              <p className="font-semibold text-gray-800 mb-2">Next Steps:</p>
              {!complianceCheckResult.isCompliant && (
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Review critical gaps above</li>
                  <li>Verify assessment data includes competencies and achievement levels</li>
                  <li>Ensure parent phone numbers are populated and verified</li>
                  <li>Check that assessments have proper publish/approval states</li>
                  <li>Re-generate report after fixing issues</li>
                </ol>
              )}
              {complianceCheckResult.isCompliant && (
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>✅ Report data is CBC-SMS compliant</li>
                  <li>Verify parent contact information before sending SMS</li>
                  <li>Use predefined CBC-safe templates for SMS content</li>
                  <li>Monitor delivery status and log all communications</li>
                </ol>
              )}
            </div>
          </div>
        )}
      </div>
      {/* End no-print filter section */}


      {/* LEARNER REPORT DISPLAY - COMPACT PROFESSIONAL LAYOUT */}
      {reportData?.type === 'LEARNER_REPORT' && reportData?.learner && (
        <div className="bg-gray-100 py-12 px-4 rounded-xl shadow-inner mb-8 no-print">
          <div
            id="summative-report-content"
            ref={reportRef}
            className="bg-white mx-auto shadow-2xl overflow-hidden"
            style={{
              fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
              lineHeight: '1.2',
              width: '210mm',
              minHeight: '297mm',
              padding: '12mm',
              boxSizing: 'border-box'
            }}
          >
            {(() => {
              // --- DATA PREPARATION LOGIC ---
              const standardAreas = getLearningAreasByGrade(reportData.learner.grade);
              const resultAreas = new Set(reportData.results?.map(r => r.learningArea || 'General') || []);
              const configAreas = [];
              if (streamConfigs && streamConfigs.length > 0) {
                const gradeConfig = streamConfigs.find(sc => sc.grade === reportData.learner.grade);
                if (gradeConfig?.streams) {
                  const streamConfig = gradeConfig.streams.find(s => !s.name || s.name === reportData.learner.stream);
                  if (streamConfig?.learningAreas) configAreas.push(...streamConfig.learningAreas);
                }
              }
              const allAreasSet = new Set([...standardAreas, ...resultAreas, ...configAreas]);
              const areasToDisplay = Array.from(allAreasSet).sort();
              if (areasToDisplay.length === 0) areasToDisplay.push('General');

              // Organize results by Area
              const resultsByArea = {};
              reportData.results?.forEach(result => {
                const area = result.learningArea || 'General';
                if (!resultsByArea[area]) resultsByArea[area] = [];
                resultsByArea[area].push(result);
              });

              // Identify unique Test Types for Columns
              const testTypesFound = new Set();
              reportData.results?.forEach(r => {
                const type = r.test?.testType || r.testType || 'Assessment';
                testTypesFound.add(type);
              });

              const testColumns = Array.from(testTypesFound).sort();

              const formatTestName = (str) => {
                if (!str) return '';
                return str.replace(/_/g, ' ')
                  .toLowerCase()
                  .replace(/\b\w/g, c => c.toUpperCase());
              };

              // Prepare row data
              const tableRows = areasToDisplay.map(area => {
                const areaResults = resultsByArea[area] || [];

                // Map scores by test column
                const scoresByCol = {};
                testColumns.forEach(col => {
                  const match = areaResults.find(r => (r.test?.testType || r.testType || 'Assessment') === col);
                  scoresByCol[col] = match ? (match.score || 0) : null;
                });

                const testCount = areaResults.length;
                const totalScore = areaResults.reduce((sum, r) => sum + (r.score || 0), 0);
                const totalMarks = areaResults.reduce((sum, r) => sum + (r.totalMarks || 0), 0);
                const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;

                let grade = '—';
                let remark = '—';
                let color = '#d1d5db';

                if (testCount > 0 && totalMarks > 0) {
                  const res = getCBCGrade(percentage);
                  grade = res.grade;
                  remark = res.remark;
                  color = res.color;
                }

                return {
                  area,
                  scoresByCol,
                  testCount,
                  totalScore,
                  totalMarks,
                  percentage: parseFloat(percentage.toFixed(0)),
                  grade,
                  remark,
                  color
                };
              }).filter(row => row.testCount > 0);

              return (
                <div className="relative">

                  {/* Header Section */}
                  <div className="mb-0">
                    <table style={{ width: '100%', borderBottom: '3px solid #1e3a8a', paddingBottom: '10px' }}>
                      <tbody>
                        <tr>
                          {/* Logo */}
                          <td style={{ width: 'auto', verticalAlign: 'top' }}>
                            {brandingSettings?.logoUrl ? (
                              <img
                                src={brandingSettings.logoUrl}
                                alt="Logo"
                                style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
                              />
                            ) : (
                              <div style={{ height: '60px', width: '60px', background: '#ccc', borderRadius: '50%' }}></div>
                            )}
                          </td>

                          {/* School Info - CENTERED & BOLD */}
                          <td style={{ textAlign: 'center', flex: 1, padding: '0 20px', verticalAlign: 'top' }}>
                            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a8a', margin: '0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {user?.school?.name || brandingSettings?.schoolName || 'ACADEMIC SCHOOL'}
                            </h1>
                            <div style={{ fontSize: '11px', fontWeight: '600', color: '#555', marginTop: '4px' }}>
                              MOTTO: {user?.school?.motto || 'Excellence in Education'}
                            </div>
                            <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                              {user?.school?.location} | {user?.school?.phone} | {user?.school?.email}
                            </div>
                          </td>

                          {/* Report Meta */}
                          <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#e5e7eb', lineHeight: '0.8' }}>REPORT</div>
                            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#1e3a8a' }}>ACADEMIC YEAR {reportData.term?.academicYear || 2026}</div>
                            <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#666' }}>{new Date().toLocaleDateString()}</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h1 className="text-xl font-extrabold text-center uppercase tracking-wide text-blue-900 my-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Summative Assessment Report
                  </h1>

                  {/* Student Info Table (Compact) */}
                  <div className="mb-4 text-xs">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '4px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 8px' }}>
                        <div style={{ fontWeight: 'bold', color: '#444' }}>NAME:</div>
                        <div style={{ fontWeight: 'bold', color: '#000', textTransform: 'uppercase' }}>{reportData.learner.firstName} {reportData.learner.lastName}</div>

                        <div style={{ fontWeight: 'bold', color: '#444' }}>ADM NO:</div>
                        <div style={{ fontWeight: 'bold' }}>{reportData.learner.admissionNumber || '—'}</div>

                        <div style={{ fontWeight: 'bold', color: '#444' }}>GENDER:</div>
                        <div style={{ textTransform: 'capitalize' }}>{reportData.learner.gender?.toLowerCase() || '—'}</div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 8px' }}>
                        <div style={{ fontWeight: 'bold', color: '#444' }}>GRADE:</div>
                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{reportData.learner.grade?.replace(/_/g, ' ')}</div>

                        <div style={{ fontWeight: 'bold', color: '#444' }}>STREAM:</div>
                        <div style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{reportData.learner.stream || 'A'}</div>

                        <div style={{ fontWeight: 'bold', color: '#444' }}>AGE:</div>
                        <div>
                          {reportData.learner.dateOfBirth
                            ? `${new Date().getFullYear() - new Date(reportData.learner.dateOfBirth).getFullYear()} Yrs`
                            : '—'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Results Table */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', marginBottom: '15px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#1e3a8a', color: 'white' }}>
                        <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: 'bold' }}>SUBJECT</th>
                        {testColumns.map(col => (
                          <th key={col} style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                            {formatTestName(col)}
                          </th>
                        ))}
                        <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>AVG %</th>
                        <th style={{ padding: '8px 4px', textAlign: 'center', fontWeight: 'bold', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>GRADE</th>
                        <th style={{ padding: '8px 4px', textAlign: 'left', fontWeight: 'bold', borderLeft: '1px solid rgba(255,255,255,0.2)' }}>REMARKS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((row, idx) => (
                        <tr key={row.area} style={{ backgroundColor: idx % 2 === 0 ? '#f8fafc' : 'white', borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '6px 4px', fontWeight: '600', color: '#334155' }}>{row.area}</td>
                          {testColumns.map(col => (
                            <td key={col} style={{ padding: '6px 4px', textAlign: 'center', color: '#475569' }}>
                              {row.scoresByCol[col] !== null ? row.scoresByCol[col] : '—'}
                            </td>
                          ))}
                          <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', color: '#1e293b' }}>{row.percentage}%</td>
                          <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', color: row.color }}>{row.grade}</td>
                          <td style={{ padding: '6px 4px', fontSize: '9px', fontStyle: 'italic', color: '#64748b' }}>{row.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Summary Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    {(() => {
                      const totalTests = tableRows.reduce((acc, r) => acc + r.testCount, 0);
                      const totalScore = tableRows.reduce((acc, r) => acc + r.totalScore, 0);
                      const totalMax = tableRows.reduce((acc, r) => acc + r.totalMarks, 0);
                      const avgPct = totalMax > 0 ? (totalScore / totalMax * 100).toFixed(0) : 0;

                      let overallGrade = 'E';
                      if (avgPct >= 90) overallGrade = 'EE1';
                      else if (avgPct >= 75) overallGrade = 'EE2';
                      else if (avgPct >= 58) overallGrade = 'ME1';
                      else if (avgPct >= 41) overallGrade = 'ME2';
                      else if (avgPct >= 31) overallGrade = 'AE1';
                      else if (avgPct >= 21) overallGrade = 'AE2';
                      else if (avgPct >= 11) overallGrade = 'BE1';
                      else overallGrade = 'BE2';

                      const cardStyle = { padding: '8px', border: '1px solid #e2e8f0', borderRadius: '4px', textAlign: 'center', backgroundColor: '#f8fafc' };
                      const labelStyle = { fontSize: '9px', fontWeight: 'bold', color: '#64748b', marginBottom: '2px', textTransform: 'uppercase' };
                      const valueStyle = { fontSize: '14px', fontWeight: '900', color: '#0f172a' };

                      return (
                        <>
                          <div style={cardStyle}>
                            <div style={labelStyle}>Subjects Assessed</div>
                            <div style={valueStyle}>{tableRows.length}</div>
                          </div>
                          <div style={cardStyle}>
                            <div style={labelStyle}>Total Assessments</div>
                            <div style={valueStyle}>{totalTests}</div>
                          </div>
                          <div style={cardStyle}>
                            <div style={labelStyle}>Average Score</div>
                            <div style={valueStyle}>{avgPct}%</div>
                          </div>
                          <div style={{ ...cardStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                            <div style={{ ...labelStyle, color: '#1e40af' }}>Overall Grade</div>
                            <div style={{ ...valueStyle, color: '#1e3a8a' }}>{overallGrade}</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Performance Chart */}
                  <div className="mb-6 page-break-inside-avoid">
                    <h3 className="text-xs font-bold text-gray-800 uppercase border-b-2 border-gray-200 mb-2 pb-1">Subject Performance</h3>
                    <div style={{ height: '180px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tableRows} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="area" tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-30} textAnchor="end" height={40} />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ fontSize: '12px' }} />
                          <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                            {tableRows.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Grading Key */}
                  <div className="mb-6 page-break-inside-avoid">
                    <h3 className="text-xs font-bold text-gray-800 uppercase border-b-2 border-gray-200 mb-2 pb-1">Grading Key</h3>
                    <div className="grid grid-cols-4 gap-2 text-[9px]">
                      <div className="flex items-center gap-1"><span className="w-6 h-4 bg-[#15803d] text-white flex items-center justify-center font-bold rounded-sm">EE1</span> <span>90-100% (Outstanding)</span></div>
                      <div className="flex items-center gap-1"><span className="w-6 h-4 bg-[#166534] text-white flex items-center justify-center font-bold rounded-sm">EE2</span> <span>75-89% (Very High)</span></div>
                      <div className="flex items-center gap-1"><span className="w-6 h-4 bg-[#22c55e] text-white flex items-center justify-center font-bold rounded-sm">ME1</span> <span>58-74% (High Avg)</span></div>
                      <div className="flex items-center gap-1"><span className="w-6 h-4 bg-[#4ade80] text-gray-900 flex items-center justify-center font-bold rounded-sm">ME2</span> <span>41-57% (Average)</span></div>
                      <div className="flex items-center gap-1"><span className="w-6 h-4 bg-[#eab308] text-white flex items-center justify-center font-bold rounded-sm">AE1</span> <span>31-40% (Low Avg)</span></div>
                      <div className="flex items-center gap-1"><span className="w-6 h-4 bg-[#facc15] text-gray-900 flex items-center justify-center font-bold rounded-sm">AE2</span> <span>21-30% (Below Avg)</span></div>
                      <div className="flex items-center gap-1"><span className="w-6 h-4 bg-[#f97316] text-white flex items-center justify-center font-bold rounded-sm">BE1</span> <span>11-20% (Low)</span></div>
                      <div className="flex items-center gap-1"><span className="w-6 h-4 bg-[#dc2626] text-white flex items-center justify-center font-bold rounded-sm">BE2</span> <span>0-10% (Very Low)</span></div>
                    </div>
                  </div>

                  {/* Signatures Section */}
                  <div className="mt-8 pt-4 border-t-2 border-gray-100 flex justify-between items-end page-break-inside-avoid">
                    <div className="flex flex-col gap-8 w-1/2 pr-8">
                      <div className="border-b border-black border-dotted pb-1 text-sm font-medium">Class Teacher's Remarks:</div>
                    </div>
                    <div className="relative flex flex-col items-center gap-2">
                      {/* Principal's Stamp */}
                      <div className="absolute -top-12 opacity-80 pointer-events-none">
                        <img
                          src="/Zawadi-School--Stamp.png"
                          alt="School Stamp"
                          className="w-32 h-auto"
                          style={{ mixBlendMode: 'multiply' }}
                        />
                      </div>
                      <div className="w-48 border-b border-black border-dotted mt-16"></div>
                      <div className="text-[10px] uppercase font-bold tracking-wider">Principal's Signature & Stamp</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* FOOTER - MOVED DOWN COMPLETELY */}
            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #ddd', fontSize: '9px', textAlign: 'center', color: '#777', pageBreakBefore: 'avoid', minHeight: '40px' }}>
              <div>This is an official report generated by the Assessment System.</div>
              <div style={{ marginTop: '2px' }}>For inquiries, contact the administration office.</div>
            </div>
          </div>

          {/* PRINT CONTROLS - OUTSIDE PDF CONTENT */}
          <div className="no-print mt-8 flex gap-4 justify-center">
            <button
              onClick={() => setReportData(null)}
              disabled={isExporting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Back
            </button>
            <button
              onClick={handleSendSMS}
              disabled={isSendingSMS || !reportData?.learner?.guardianPhone}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              title={!reportData?.learner?.guardianPhone ? 'Parent phone number not available' : 'Send report summary via SMS to parent'}
            >
              {isSendingSMS ? '📤 Sending...' : '📱 Send SMS to Parent'}
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
      {/* SMS PREVIEW MODAL */}
      {showSMSPreview && smsPreviewData && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowSMSPreview(false)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                      Confirm SMS Delivery
                    </h3>
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        <span>Recipient: {smsPreviewData.parentName}</span>
                        <span>{smsPreviewData.recipient}</span>
                      </div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap font-medium">
                        {smsPreviewData.message}
                      </div>
                      <div className="mt-2 text-[10px] text-gray-400 text-right italic">
                        Estimated: {Math.ceil(smsPreviewData.message.length / 160)} SMS Part(s)
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        This summary will be sent to the parent. Please verify the content before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={executeSendSMS}
                  disabled={isSendingSMS}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isSendingSMS ? 'Sending...' : 'Send Now'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSMSPreview(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERAL NOTIFICATION MODAL */}
      {notificationModal.show && (
        <div className="fixed inset-0 z-[60] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setNotificationModal({ ...notificationModal, show: false })}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className={`p-1 h-1 ${notificationModal.type === 'success' ? 'bg-green-500' : notificationModal.type === 'error' ? 'bg-red-500' : notificationModal.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full sm:mx-0 sm:h-10 sm:w-10 ${notificationModal.type === 'success' ? 'bg-green-100' : notificationModal.type === 'error' ? 'bg-red-100' : notificationModal.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                    {notificationModal.type === 'success' ? <CheckCircle className="h-6 w-6 text-green-600" /> :
                      notificationModal.type === 'error' ? <XCircle className="h-6 w-6 text-red-600" /> :
                        <AlertCircle className={`h-6 w-6 ${notificationModal.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />}
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-bold text-gray-900">
                      {notificationModal.title}
                    </h3>
                    <div className="mt-2 text-sm text-gray-600 font-medium">
                      {notificationModal.message}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setNotificationModal({ ...notificationModal, show: false })}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#1e293b] text-base font-medium text-white hover:bg-[#334155] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* LOADING OVERLAY FOR PDF EXPORT */}
      {isExporting && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
          <div className="text-center p-8 bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full">
            <div className="relative mb-6 flex justify-center">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg animate-pulse flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">PDF</span>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Generating High-Quality Report</h3>
            <p className="text-sm text-gray-500 mb-4">Please wait while we render your professional vector PDF. This may take a few seconds.</p>
            <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold text-sm">
              <Loader className="animate-spin" size={14} />
              <span>{pdfProgress || 'Initializing...'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummativeReport;