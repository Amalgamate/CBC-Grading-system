/**
 * Formative Assessment Page - UPDATED with 8-level CBC Rubric & WhatsApp Integration
 * Record formative assessments using detailed CBC rubrics and save to backend
 * Send results to parents via WhatsApp
 */

import React, { useState } from 'react';
import { CheckCircle, Send, Save } from 'lucide-react';
import RatingSelector from '../shared/RatingSelector';
import RatingBadge from '../shared/RatingBadge';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';

const FormativeAssessment = ({ learners }) => {
  const { showSuccess, showError } = useNotifications();
  const [selectedGrade, setSelectedGrade] = useState('GRADE_3');
  const [selectedTerm, setSelectedTerm] = useState('TERM_1');
  const [selectedArea, setSelectedArea] = useState('Mathematics');
  const [strand, setStrand] = useState('Numbers');
  const [subStrand, setSubStrand] = useState('Addition and Subtraction');
  
  const [assessments, setAssessments] = useState({});
  const [savedAssessments, setSavedAssessments] = useState({});
  const [saving, setSaving] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState({});

  const learningAreas = [
    'Mathematics', 
    'English Activities', 
    'Kiswahili Activities', 
    'Environmental Activities',
    'Integrated Science',
    'Social Studies',
    'Creative Arts & Sports',
    'Religious Education'
  ];

  const grades = [
    { value: 'PP1', label: 'PP1' },
    { value: 'PP2', label: 'PP2' },
    { value: 'GRADE_1', label: 'Grade 1' },
    { value: 'GRADE_2', label: 'Grade 2' },
    { value: 'GRADE_3', label: 'Grade 3' },
    { value: 'GRADE_4', label: 'Grade 4' },
    { value: 'GRADE_5', label: 'Grade 5' },
    { value: 'GRADE_6', label: 'Grade 6' }
  ];

  const terms = [
    { value: 'TERM_1', label: 'Term 1' },
    { value: 'TERM_2', label: 'Term 2' },
    { value: 'TERM_3', label: 'Term 3' }
  ];

  // Filter learners by selected grade
  const classLearners = learners?.filter(l => 
    l.grade === selectedGrade && (l.status === 'ACTIVE' || l.status === 'Active')
  ) || [];

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
        if (assessment.detailedRating) {
          try {
            const response = await api.assessments.createFormative({
              learnerId,
              term: selectedTerm,
              academicYear: 2026,
              learningArea: selectedArea,
              strand,
              subStrand,
              detailedRating: assessment.detailedRating,
              percentage: assessment.percentage,
              strengths: assessment.strengths,
              areasImprovement: assessment.areasImprovement,
              recommendations: assessment.recommendations
            });

            if (response.success) {
              successCount++;
              newSavedAssessments[learnerId] = true;
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
        // Mark assessments as saved but don't clear them
        setSavedAssessments(prev => ({ ...prev, ...newSavedAssessments }));
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

  const handleSendBulkWhatsApp = async () => {
    try {
      setSaving(true);
      
      // Get all learner IDs that have saved assessments
      const learnerIds = Object.keys(savedAssessments).filter(
        id => savedAssessments[id] && assessments[id]?.detailedRating
      );

      if (learnerIds.length === 0) {
        showError('No saved assessments to send');
        return;
      }

      const response = await api.notifications.sendBulkAssessmentNotifications({
        learnerIds,
        assessmentType: 'Formative',
        subject: selectedArea,
        grade: selectedGrade,
        term: selectedTerm
      });

      if (response.success) {
        showSuccess(`Sent ${response.data.sent} notifications via WhatsApp!`);
        if (response.data.failed > 0) {
          showError(`${response.data.failed} notifications failed to send`);
        }
      } else {
        showError('Failed to send bulk notifications');
      }

    } catch (error) {
      console.error('Error sending bulk WhatsApp:', error);
      showError(error.message || 'Failed to send bulk notifications');
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">

      {/* Selection Panel */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Assessment Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
            <select 
              value={selectedGrade} 
              onChange={(e) => {
                setSelectedGrade(e.target.value);
                setAssessments({});
                setSavedAssessments({});
              }} 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {grades.map(g => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Term</label>
            <select 
              value={selectedTerm} 
              onChange={(e) => setSelectedTerm(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {terms.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Area</label>
            <select 
              value={selectedArea} 
              onChange={(e) => setSelectedArea(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {learningAreas.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Strand</label>
            <input 
              type="text" 
              value={strand} 
              onChange={(e) => setStrand(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              placeholder="e.g., Numbers, Patterns, Shapes"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Strand (Optional)</label>
            <input 
              type="text" 
              value={subStrand} 
              onChange={(e) => setSubStrand(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
              placeholder="e.g., Addition and Subtraction"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
        <h4 className="font-bold text-blue-900 mb-4">Assessment Progress</h4>
        <div className="grid grid-cols-3 md:grid-cols-11 gap-3">
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-xs text-gray-600 font-semibold">Total</p>
            <p className="text-xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-700 font-semibold">Done</p>
            <p className="text-xl font-bold text-blue-800">{stats.assessed}</p>
          </div>
          <div className="bg-purple-100 rounded-lg p-3 text-center">
            <p className="text-xs text-purple-700 font-semibold">Saved</p>
            <p className="text-xl font-bold text-purple-800">{stats.saved}</p>
          </div>
          <div className="bg-green-100 rounded-lg p-3 text-center">
            <p className="text-xs text-green-700 font-semibold">EE1</p>
            <p className="text-xl font-bold text-green-800">{stats.ee1}</p>
          </div>
          <div className="bg-green-100 rounded-lg p-3 text-center">
            <p className="text-xs text-green-700 font-semibold">EE2</p>
            <p className="text-xl font-bold text-green-800">{stats.ee2}</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-700 font-semibold">ME1</p>
            <p className="text-xl font-bold text-blue-800">{stats.me1}</p>
          </div>
          <div className="bg-blue-100 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-700 font-semibold">ME2</p>
            <p className="text-xl font-bold text-blue-800">{stats.me2}</p>
          </div>
          <div className="bg-yellow-100 rounded-lg p-3 text-center">
            <p className="text-xs text-yellow-700 font-semibold">AE1</p>
            <p className="text-xl font-bold text-yellow-800">{stats.ae1}</p>
          </div>
          <div className="bg-orange-100 rounded-lg p-3 text-center">
            <p className="text-xs text-orange-700 font-semibold">AE2</p>
            <p className="text-xl font-bold text-orange-800">{stats.ae2}</p>
          </div>
          <div className="bg-red-100 rounded-lg p-3 text-center">
            <p className="text-xs text-red-700 font-semibold">BE1</p>
            <p className="text-xl font-bold text-red-800">{stats.be1}</p>
          </div>
          <div className="bg-red-100 rounded-lg p-3 text-center">
            <p className="text-xs text-red-700 font-semibold">BE2</p>
            <p className="text-xl font-bold text-red-800">{stats.be2}</p>
          </div>
        </div>
      </div>

      {/* Assessment List */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-6">
          Assess Learners - {grades.find(g => g.value === selectedGrade)?.label}
          <span className="text-sm font-normal text-gray-500 ml-2">
            ({classLearners.length} learners)
          </span>
        </h3>

        {classLearners.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No learners found for selected grade</p>
          </div>
        ) : (
          <div className="space-y-6">
            {classLearners.map(learner => {
              const assessment = assessments[learner.id];
              const isSaved = savedAssessments[learner.id];
              
              return (
                <div 
                  key={learner.id} 
                  className={`
                    border-2 rounded-xl p-5 transition-all
                    ${isSaved
                      ? 'border-purple-300 bg-purple-50' 
                      : assessment?.detailedRating 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {/* Learner Header */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {learner.firstName[0]}{learner.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800">
                        {learner.firstName} {learner.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {learner.admissionNumber} • {learner.grade}
                      </p>
                    </div>
                    {assessment?.detailedRating && (
                      <div className="flex items-center gap-2">
                        {isSaved && (
                          <CheckCircle className="text-purple-600" size={20} />
                        )}
                        <RatingBadge 
                          detailedRating={assessment.detailedRating}
                          points={assessment.points}
                          percentage={assessment.percentage}
                        />
                        {isSaved && (
                          <button
                            onClick={() => handleSendWhatsApp(learner.id)}
                            disabled={sendingWhatsApp[learner.id]}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sendingWhatsApp[learner.id] ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send size={16} />
                                WhatsApp
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Rating Selector */}
                  <div className="mb-4">
                    <RatingSelector
                      value={assessment?.detailedRating || ''}
                      onChange={(code, points, percentage) => 
                        handleRatingChange(learner.id, code, points, percentage)
                      }
                      label="Performance Level"
                      showDescription={true}
                      required={false}
                    />
                  </div>

                  {/* Feedback Fields (only show if rated) */}
                  {assessment?.detailedRating && (
                    <div className="space-y-3 mt-4 pt-4 border-t-2 border-gray-200">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Strengths
                        </label>
                        <textarea
                          value={assessment.strengths || ''}
                          onChange={(e) => handleFeedbackChange(learner.id, 'strengths', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="What did the learner do well?"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Areas for Improvement
                        </label>
                        <textarea
                          value={assessment.areasImprovement || ''}
                          onChange={(e) => handleFeedbackChange(learner.id, 'areasImprovement', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="What needs more practice?"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Recommendations
                        </label>
                        <textarea
                          value={assessment.recommendations || ''}
                          onChange={(e) => handleFeedbackChange(learner.id, 'recommendations', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="What should be done at home/school?"
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

      {/* Action Buttons */}
      {stats.assessed > 0 && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setAssessments({});
              setSavedAssessments({});
            }}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            disabled={saving}
          >
            Clear All
          </button>
          
          {stats.saved > 0 && (
            <button
              onClick={handleSendBulkWhatsApp}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              Send All to Parents ({stats.saved})
            </button>
          )}
          
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save {stats.assessed} Assessment{stats.assessed !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default FormativeAssessment;
