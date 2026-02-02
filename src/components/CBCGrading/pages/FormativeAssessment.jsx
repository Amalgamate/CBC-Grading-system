/**
 * Formative Assessment Page - UPDATED with 3-Step Wizard Flow & 8-level CBC Rubric
 * Optimized for User Experience: Setup -> Assess -> Review
 */

import React, { useState } from 'react';
import { CheckCircle, Check, Send, Save, ArrowRight, Edit3, FileText, Users, BarChart2 } from 'lucide-react';
import RatingSelector from '../shared/RatingSelector';
import { useNotifications } from '../hooks/useNotifications';
import api, { workflowAPI } from '../../../services/api';
import SmartLearnerSearch from '../shared/SmartLearnerSearch';
import { useAssessmentSetup } from '../hooks/useAssessmentSetup';
import { useLearnerSelection } from '../hooks/useLearnerSelection';
import { useLearningAreas } from '../hooks/useLearningAreas';

const FormativeAssessment = ({ learners }) => {
  const { showSuccess, showError } = useNotifications();

  // Use centralized hooks for assessment state management
  const setup = useAssessmentSetup({ defaultTerm: 'TERM_1' });
  const selection = useLearnerSelection(learners || [], { status: ['ACTIVE', 'Active'] });
  const learningAreas = useLearningAreas(setup.selectedGrade);

  // View State
  const [viewMode, setViewMode] = useState('setup'); // 'setup' | 'assess' | 'review'

  // Context State (Step 1) - FormativeAssessment specific
  const [selectedArea, setSelectedArea] = useState('Mathematics');
  const [strand, setStrand] = useState('Numbers');
  const [subStrand, setSubStrand] = useState('Addition and Subtraction');

  // New Fields for Assessment Metadata
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentType, setAssessmentType] = useState('QUIZ');
  const [assessmentWeight, setAssessmentWeight] = useState(1.0);
  const [maxScore, setMaxScore] = useState(null);

  // Assessment State (Step 2)
  const [assessments, setAssessments] = useState({});
  const [savedAssessments, setSavedAssessments] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState({});

  // Use grades and selection from setup hook
  const grades = setup.grades || [];
  const loadingGrades = false; // Grades are static in the hook
  const setSelectedGrade = setup.updateGrade;
  const selectedGrade = setup.selectedGrade;
  const setSelectedTerm = setup.updateTerm;
  const selectedTerm = setup.selectedTerm;
  const terms = setup.terms;
  const academicYear = setup.academicYear;
  const searchLearnerId = selection.selectedLearnerId;
  const setSearchLearnerId = selection.selectLearner;

  // Fetch Grades from DB
  // Grades are now managed by setup hook

  // Filter learners by selected grade
  const classLearners = learners?.filter(l =>
    l.grade === selectedGrade && (l.status === 'ACTIVE' || l.status === 'Active')
  ) || [];

  const filteredLearners = classLearners.filter(l => {
    if (!searchLearnerId) return true;
    return l.id === searchLearnerId;
  });

  // Navigation Handlers
  const goToNextStep = () => {
    if (viewMode === 'setup') {
      if (!assessmentTitle) {
        showError('Please enter an Assessment Title');
        return;
      }
      if (!strand) {
        showError('Please enter a Strand to continue');
        return;
      }
    }

    if (viewMode === 'setup') setViewMode('assess');
    else if (viewMode === 'assess') setViewMode('review');

    window.scrollTo(0, 0);
  };

  const goToPrevStep = () => {
    if (viewMode === 'assess') setViewMode('setup');
    else if (viewMode === 'review') setViewMode('assess');

    window.scrollTo(0, 0);
  };

  const handleLearnerSelect = (id) => {
    selection.selectLearner(id);
    if (id) {
      const learner = learners.find(l => l.id === id);
      if (learner && learner.grade !== selectedGrade) {
        if (viewMode === 'assess') {
          showError(`Learner is in ${learner.grade}. Please switch grade in Setup step.`);
        } else {
          setSelectedGrade(learner.grade);
        }
      }
    }
  };

  const handleRatingChange = (learnerId, code, points, percentage) => {
    setAssessments(prev => ({
      ...prev,
      [learnerId]: {
        ...prev[learnerId],
        detailedRating: code,
        points,
        percentage: Math.round(percentage),
        strengths: prev[learnerId]?.strengths || '',
        areasImprovement: prev[learnerId]?.areasImprovement || '',
        recommendations: prev[learnerId]?.recommendations || ''
      }
    }));
  };

  const handleFeedbackChange = (learnerId, field, value) => {
    setAssessments(prev => ({
      ...prev,
      [learnerId]: {
        ...prev[learnerId],
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      let successCount = 0;
      let errorCount = 0;
      const newSavedAssessments = {};

      // Save each assessment
      for (const [learnerId, assessment] of Object.entries(assessments)) {
        if (assessment.detailedRating && !savedAssessments[learnerId]) {
          try {
            const response = await api.assessments.createFormative({
              learnerId,
              term: selectedTerm,
              academicYear: academicYear,
              learningArea: selectedArea,
              strand,
              subStrand,
              title: assessmentTitle,
              type: assessmentType,
              weight: assessmentWeight,
              maxScore: maxScore,
              detailedRating: assessment.detailedRating,
              percentage: assessment.percentage,
              strengths: assessment.strengths,
              areasImprovement: assessment.areasImprovement,
              recommendations: assessment.recommendations
            });

            if (response.success) {
              successCount++;
              newSavedAssessments[learnerId] = response.data;
            } else {
              errorCount++;
            }
          } catch (err) {
            console.error(`Error saving assessment for learner ${learnerId}:`, err);
            errorCount++;
          }
        }
      }

      if (successCount > 0) {
        showSuccess(`Successfully saved ${successCount} assessment(s)!`);
        setSavedAssessments(prev => ({ ...prev, ...newSavedAssessments }));
      } else if (errorCount === 0) {
        showSuccess('No new assessments to save.');
      }

      if (errorCount > 0) {
        showError(`Failed to save ${errorCount} assessment(s)`);
      }

    } catch (error) {
      console.error('Error saving assessments:', error);
      showError('Failed to save assessments');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    try {
      setSubmitting(true);
      let successCount = 0;
      let errorCount = 0;
      const updatedSavedAssessments = { ...savedAssessments };

      // Submit each saved assessment
      for (const [learnerId, assessment] of Object.entries(savedAssessments)) {
        if (assessment && assessment.id && assessment.status === 'DRAFT') {
          try {
            const response = await workflowAPI.submit({
              assessmentId: assessment.id,
              assessmentType: 'formative',
              comments: 'Submitted for approval'
            });

            if (response.success) {
              successCount++;
              updatedSavedAssessments[learnerId] = { ...assessment, status: 'SUBMITTED' };
            } else {
              errorCount++;
            }
          } catch (err) {
            console.error(`Error submitting assessment for learner ${learnerId}:`, err);
            errorCount++;
          }
        }
      }

      if (successCount > 0) {
        showSuccess(`Successfully submitted ${successCount} assessment(s) for approval!`);
        setSavedAssessments(updatedSavedAssessments);
      }

      if (errorCount > 0) {
        showError(`Failed to submit ${errorCount} assessment(s)`);
      } else if (successCount === 0) {
        showError('No draft assessments found to submit. Please save assessments first.');
      }

    } catch (error) {
      console.error('Error submitting assessments:', error);
      showError('Failed to submit assessments');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWhatsApp = async (learnerId) => {
    try {
      setSendingWhatsApp(prev => ({ ...prev, [learnerId]: true }));

      const response = await api.notifications.sendAssessmentNotification({
        learnerId,
        assessmentType: 'Formative',
        subject: selectedArea,
        grade: selectedGrade,
        term: selectedTerm
      });

      if (response.success) {
        showSuccess('Assessment results sent to parent via WhatsApp!');
      } else {
        showError('Failed to send WhatsApp notification');
      }

    } catch (error) {
      console.error('Error sending WhatsApp:', error);
      showError(error.message || 'Failed to send WhatsApp notification');
    } finally {
      setSendingWhatsApp(prev => ({ ...prev, [learnerId]: false }));
    }
  };

  // Statistics
  const stats = {
    total: classLearners.length,
    assessed: Object.keys(assessments).filter(id => assessments[id]?.detailedRating).length,
    saved: Object.keys(savedAssessments).filter(id => savedAssessments[id]).length,
    ee1: Object.values(assessments).filter(a => a?.detailedRating === 'EE1').length,
    ee2: Object.values(assessments).filter(a => a?.detailedRating === 'EE2').length,
    me1: Object.values(assessments).filter(a => a?.detailedRating === 'ME1').length,
    me2: Object.values(assessments).filter(a => a?.detailedRating === 'ME2').length,
    ae1: Object.values(assessments).filter(a => a?.detailedRating === 'AE1').length,
    ae2: Object.values(assessments).filter(a => a?.detailedRating === 'AE2').length,
    be1: Object.values(assessments).filter(a => a?.detailedRating === 'BE1').length,
    be2: Object.values(assessments).filter(a => a?.detailedRating === 'BE2').length
  };

  // Step Indicator Component
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center">
        {/* Step 1 */}
        <div className={`flex flex-col items-center relative z-10 ${viewMode !== 'setup' ? 'text-blue-600' : 'text-blue-600'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${viewMode === 'setup' || viewMode === 'assess' || viewMode === 'review' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300'}`}>
            {viewMode !== 'setup' ? <Check size={20} /> : <FileText size={20} />}
          </div>
          <span className="text-xs font-semibold mt-2">Setup</span>
        </div>

        {/* Connector */}
        <div className={`w-24 h-1 -mt-6 mx-2 ${viewMode === 'assess' || viewMode === 'review' ? 'bg-blue-600' : 'bg-gray-200'}`} />

        {/* Step 2 */}
        <div className={`flex flex-col items-center relative z-10 ${viewMode === 'assess' || viewMode === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${viewMode === 'assess' || viewMode === 'review' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300'}`}>
            {viewMode === 'review' ? <Check size={20} /> : <Users size={20} />}
          </div>
          <span className="text-xs font-semibold mt-2">Assess</span>
        </div>

        {/* Connector */}
        <div className={`w-24 h-1 -mt-6 mx-2 ${viewMode === 'review' ? 'bg-blue-600' : 'bg-gray-200'}`} />

        {/* Step 3 */}
        <div className={`flex flex-col items-center relative z-10 ${viewMode === 'review' ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${viewMode === 'review' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300'}`}>
            <BarChart2 size={20} />
          </div>
          <span className="text-xs font-semibold mt-2">Review</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Wizard Progress */}
      <StepIndicator />

      {/* STEP 1: SETUP */}
      {viewMode === 'setup' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Assessment Configuration</h2>
              <p className="text-xs text-gray-500">Configure the class, subject, and assessment details</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">Step 1 of 3</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Academic Context */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Users size={16} className="text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Academic Context</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Grade / Class</label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => {
                        setSelectedGrade(e.target.value);
                        setAssessments({}); // Clear assessments when grade changes
                        setSavedAssessments({});
                      }}
                      disabled={loadingGrades}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {loadingGrades ? (
                        <option>Loading grades...</option>
                      ) : (
                        grades.map(g => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Term</label>
                    <select
                      value={selectedTerm}
                      onChange={(e) => setSelectedTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                    >
                      {terms.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Learning Area</label>
                  <select
                    value={selectedArea}
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      learningAreas.selectLearningArea(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                    disabled={!setup.selectedGrade}
                  >
                    <option value="">Select a learning area</option>
                    {learningAreas.flatLearningAreas.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  {learningAreas.hasAreas && (
                    <p className="text-xs text-gray-500 mt-1">{learningAreas.areaCount} learning areas available</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Strand</label>
                  <input
                    type="text"
                    value={strand}
                    onChange={(e) => setStrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    placeholder="e.g., Numbers"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sub-Strand <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <input
                    type="text"
                    value={subStrand}
                    onChange={(e) => setSubStrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    placeholder="e.g., Addition and Subtraction"
                  />
                </div>
              </div>

              {/* Right Column: Assessment Details */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <FileText size={16} className="text-gray-400" />
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assessment Details</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assessment Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={assessmentTitle}
                    onChange={(e) => setAssessmentTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                    placeholder="e.g., Weekly Quiz 1"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assessment Type</label>
                  <select
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white"
                  >
                    <option value="QUIZ">Quiz</option>
                    <option value="ASSIGNMENT">Assignment</option>
                    <option value="PROJECT">Project</option>
                    <option value="EXAM">Exam</option>
                    <option value="OBSERVATION">Observation</option>
                    <option value="ORAL">Oral</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Weight</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={assessmentWeight}
                        onChange={(e) => setAssessmentWeight(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">pts</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Score <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <input
                      type="number"
                      min="0"
                      value={maxScore || ''}
                      onChange={(e) => setMaxScore(e.target.value ? Number(e.target.value) : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      placeholder="e.g. 100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
            <button
              onClick={goToNextStep}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-sm hover:shadow text-sm"
            >
              Start Assessment
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ASSESS */}
      {viewMode === 'assess' && (
        <div className="space-y-6">
          {/* Context Header */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                <FileText size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <span>{grades.find(g => g.value === selectedGrade)?.label}</span>
                  <span>•</span>
                  <span>{terms.find(t => t.value === selectedTerm)?.label}</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">
                  {selectedArea} <span className="text-gray-400 mx-2">|</span> {strand}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {assessmentTitle} ({assessmentType}) - Weight: {assessmentWeight}x
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode('setup')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
              >
                <Edit3 size={16} />
                Edit Context
              </button>
              <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm font-semibold disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Progress'}
                <Save size={18} />
              </button>
              <button
                onClick={goToNextStep}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-sm font-semibold"
              >
                Review
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Main Assessment Area */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="font-bold text-gray-700">
                Learner List ({classLearners.length})
              </h3>
              <div className="w-full md:w-96">
                <SmartLearnerSearch
                  learners={classLearners}
                  selectedLearnerId={searchLearnerId}
                  onSelect={handleLearnerSelect}
                  placeholder="Find learner by name or adm no..."
                />
              </div>
            </div>

            <div className="p-6">
              {classLearners.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No learners found for selected grade</p>
                </div>
              ) : filteredLearners.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No learners match your search</p>
                  <button
                    onClick={() => setSearchLearnerId(null)}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredLearners.map(learner => {
                    const assessment = assessments[learner.id];
                    const isSaved = savedAssessments[learner.id];

                    return (
                      <div
                        key={learner.id}
                        className={`
                          border-2 rounded-xl p-6 transition-all duration-200
                          ${isSaved
                            ? 'border-purple-200 bg-purple-50/50'
                            : assessment?.detailedRating
                              ? 'border-green-200 bg-green-50/50'
                              : 'border-gray-100 hover:border-blue-200 hover:shadow-md'
                          }
                        `}
                      >
                        {/* Learner Header */}
                        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                          <div className="flex items-center gap-4 min-w-[200px]">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
                              {learner.firstName[0]}{learner.lastName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-lg">
                                {learner.firstName} {learner.lastName}
                              </p>
                              <p className="text-sm text-gray-500 font-medium">
                                {learner.admissionNumber}
                              </p>
                            </div>
                          </div>

                          <div className="flex-1">
                            <RatingSelector
                              value={assessment?.detailedRating || ''}
                              onChange={(code, points, percentage) =>
                                handleRatingChange(learner.id, code, points, percentage)
                              }
                              label="Rating"
                              showDescription={false}
                              required={false}
                            />
                          </div>

                          {assessment?.detailedRating && (
                            <div className="flex items-center gap-3">
                              {isSaved && <CheckCircle className="text-purple-600" size={24} />}
                              {isSaved && (
                                <button
                                  onClick={() => handleSendWhatsApp(learner.id)}
                                  disabled={sendingWhatsApp[learner.id]}
                                  className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
                                  title="Send WhatsApp"
                                >
                                  {sendingWhatsApp[learner.id] ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent" />
                                  ) : (
                                    <Send size={20} />
                                  )}
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Feedback Fields (Collapsed unless rated) */}
                        {assessment?.detailedRating && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200/50 animate-in fade-in slide-in-from-top-2">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Strengths
                              </label>
                              <textarea
                                value={assessment.strengths || ''}
                                onChange={(e) => handleFeedbackChange(learner.id, 'strengths', e.target.value)}
                                rows="2"
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Key strengths..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Areas for Improvement
                              </label>
                              <textarea
                                value={assessment.areasImprovement || ''}
                                onChange={(e) => handleFeedbackChange(learner.id, 'areasImprovement', e.target.value)}
                                rows="2"
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Areas to improve..."
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW */}
      {viewMode === 'review' && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Assessment Summary</h2>
            <p className="text-gray-500">Review your progress for {grades.find(g => g.value === selectedGrade)?.label} - {selectedArea}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm text-blue-600 font-semibold uppercase">Total Learners</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-green-600 font-semibold uppercase">Assessed</p>
              <p className="text-3xl font-bold text-green-900">{stats.assessed}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-sm text-purple-600 font-semibold uppercase">Saved</p>
              <p className="text-3xl font-bold text-purple-900">{stats.saved}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-600 font-semibold uppercase">Remaining</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total - stats.assessed}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
            <button
              onClick={goToPrevStep}
              className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold transition"
            >
              Back to Assessment
            </button>
            <button
              onClick={() => {
                setAssessments({});
                setSavedAssessments({});
                setStrand('');
                setSubStrand('');
                setViewMode('setup');
                window.scrollTo(0, 0);
              }}
              className="px-8 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 font-semibold shadow-sm hover:shadow-md transition"
            >
              Start New Assessment
            </button>
            <button
              onClick={handleSubmitForApproval}
              disabled={submitting}
              className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold shadow-lg hover:shadow-xl transition flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit for Approval
                  <Check size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormativeAssessment;
