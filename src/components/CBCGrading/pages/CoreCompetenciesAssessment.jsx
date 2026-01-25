/**
 * Core Competencies Assessment Form
 * Assess the 6 core competencies for CBC
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Save, User, BookOpen, Edit3, ArrowRight } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';
import SmartLearnerSearch from '../shared/SmartLearnerSearch';
import { getCurrentAcademicYear } from '../utils/academicYear';

const CoreCompetenciesAssessment = ({ learners }) => {
  const { showSuccess, showError } = useNotifications();

  // View State
  const [viewMode, setViewMode] = useState('setup'); // 'setup' | 'assess'

  // Form state
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('TERM_1');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [saving, setSaving] = useState(false);

  // Competencies state
  const [competencies, setCompetencies] = useState({
    communication: 'ME1',
    communicationComment: '',
    criticalThinking: 'ME1',
    criticalThinkingComment: '',
    creativity: 'ME1',
    creativityComment: '',
    collaboration: 'ME1',
    collaborationComment: '',
    citizenship: 'ME1',
    citizenshipComment: '',
    learningToLearn: 'ME1',
    learningToLearnComment: ''
  });

  const terms = [
    { value: 'TERM_1', label: 'Term 1' },
    { value: 'TERM_2', label: 'Term 2' },
    { value: 'TERM_3', label: 'Term 3' }
  ];

  const ratings = [
    { value: 'EE1', label: 'EE1 - Outstanding (90-100%)', color: 'green' },
    { value: 'EE2', label: 'EE2 - Very High (75-89%)', color: 'green' },
    { value: 'ME1', label: 'ME1 - High Average (58-74%)', color: 'blue' },
    { value: 'ME2', label: 'ME2 - Average (41-57%)', color: 'blue' },
    { value: 'AE1', label: 'AE1 - Low Average (31-40%)', color: 'yellow' },
    { value: 'AE2', label: 'AE2 - Below Average (21-30%)', color: 'yellow' },
    { value: 'BE1', label: 'BE1 - Low (11-20%)', color: 'red' },
    { value: 'BE2', label: 'BE2 - Very Low (1-10%)', color: 'red' }
  ];

  const competencyDefinitions = {
    communication: {
      name: 'Communication',
      description: 'Ability to listen, speak, read, write and use language effectively',
      icon: '💬'
    },
    criticalThinking: {
      name: 'Critical Thinking',
      description: 'Ability to think logically, analyze and solve problems',
      icon: '🧠'
    },
    creativity: {
      name: 'Creativity & Imagination',
      description: 'Ability to use imagination and innovation to create new things',
      icon: '🎨'
    },
    collaboration: {
      name: 'Collaboration',
      description: 'Ability to work effectively with others',
      icon: '🤝'
    },
    citizenship: {
      name: 'Citizenship',
      description: 'Understanding rights, responsibilities and participating in society',
      icon: '🏛️'
    },
    learningToLearn: {
      name: 'Learning to Learn',
      description: 'Ability to pursue and persist in learning independently',
      icon: '📚'
    }
  };

  const selectedLearner = learners?.find(l => l.id === selectedLearnerId);

  const loadExistingCompetencies = useCallback(async () => {
    try {
      const response = await api.cbc.getCompetencies(selectedLearnerId, {
        term: selectedTerm,
        academicYear
      });

      if (response.success && response.data) {
        setCompetencies({
          communication: response.data.communication || 'ME1',
          communicationComment: response.data.communicationComment || '',
          criticalThinking: response.data.criticalThinking || 'ME1',
          criticalThinkingComment: response.data.criticalThinkingComment || '',
          creativity: response.data.creativity || 'ME1',
          creativityComment: response.data.creativityComment || '',
          collaboration: response.data.collaboration || 'ME1',
          collaborationComment: response.data.collaborationComment || '',
          citizenship: response.data.citizenship || 'ME1',
          citizenshipComment: response.data.citizenshipComment || '',
          learningToLearn: response.data.learningToLearn || 'ME1',
          learningToLearnComment: response.data.learningToLearnComment || ''
        });
        showSuccess('Loaded existing assessment');
      }
    } catch (error) {
      console.log('No existing assessment found');
      // Reset to defaults
      setCompetencies({
        communication: 'ME1',
        communicationComment: '',
        criticalThinking: 'ME1',
        criticalThinkingComment: '',
        creativity: 'ME1',
        creativityComment: '',
        collaboration: 'ME1',
        collaborationComment: '',
        citizenship: 'ME1',
        citizenshipComment: '',
        learningToLearn: 'ME1',
        learningToLearnComment: ''
      });
    }
  }, [selectedLearnerId, selectedTerm, academicYear, showSuccess]);

  // Load existing competencies when learner/term changes
  useEffect(() => {
    if (selectedLearnerId && selectedTerm) {
      loadExistingCompetencies();
    }
  }, [selectedLearnerId, selectedTerm, academicYear, loadExistingCompetencies]);

  const handleSave = async () => {
    if (!selectedLearnerId) {
      showError('Please select a learner');
      return;
    }

    setSaving(true);
    try {
      const response = await api.cbc.saveCompetencies({
        learnerId: selectedLearnerId,
        term: selectedTerm,
        academicYear,
        ...competencies
      });

      if (response.success) {
        showSuccess('Core competencies saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to save');
      }
    } catch (error) {
      showError(error.message || 'Failed to save core competencies');
    } finally {
      setSaving(false);
    }
  };

  const handleStartAssessment = () => {
    if (!selectedLearnerId) {
      showError('Please select a learner first');
      return;
    }
    setViewMode('assess');
    window.scrollTo(0, 0);
  };

  const updateCompetency = (field, value) => {
    setCompetencies(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getRatingColor = (rating) => {
    if (rating.startsWith('EE')) return 'bg-green-100 border-green-300 text-green-800';
    if (rating.startsWith('ME')) return 'bg-blue-100 border-blue-300 text-blue-800';
    if (rating.startsWith('AE')) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    if (rating.startsWith('BE')) return 'bg-red-100 border-red-300 text-red-800';
    return 'bg-gray-100 border-gray-300 text-gray-800';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* SETUP MODE */}
      {viewMode === 'setup' && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 max-w-3xl mx-auto mt-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
               <BookOpen size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Core Competencies Assessment</h2>
            <p className="text-gray-500">Select a learner to begin assessing competencies</p>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Learner</label>
              <SmartLearnerSearch
                learners={learners?.filter(l => l.status === 'ACTIVE' || l.status === 'Active') || []}
                selectedLearnerId={selectedLearnerId}
                onSelect={setSelectedLearnerId}
                placeholder="Search by name, adm no..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Term</label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {terms.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              onClick={handleStartAssessment}
              disabled={!selectedLearnerId}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Start Assessment
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ASSESS MODE */}
      {viewMode === 'assess' && selectedLearner && (
        <>
          {/* Compact Context Header */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-purple-100 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-20">
             <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {selectedLearner.firstName[0]}{selectedLearner.lastName[0]}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                  {selectedLearner.firstName} {selectedLearner.lastName}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                  <span>{selectedLearner.admissionNumber}</span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                    {terms.find(t => t.value === selectedTerm)?.label} {academicYear}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setViewMode('setup')}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
              >
                <Edit3 size={16} />
                Change Learner
              </button>
              <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-sm font-semibold disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Assessment'}
                <Save size={18} />
              </button>
            </div>
          </div>

          {/* Competencies Grid */}
          <div className="space-y-6">
            {Object.entries(competencyDefinitions).map(([key, definition]) => (
              <div key={key} className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100 hover:border-purple-200 transition-all hover:shadow-md">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl filter drop-shadow-sm">{definition.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-800">{definition.name}</h4>
                    <p className="text-sm text-gray-500">{definition.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rating Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rating</label>
                    <select
                      value={competencies[key]}
                      onChange={(e) => updateCompetency(key, e.target.value)}
                      className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 font-semibold ${getRatingColor(competencies[key])}`}
                    >
                      {ratings.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Observation / Comment</label>
                    <textarea
                      value={competencies[`${key}Comment`]}
                      onChange={(e) => updateCompetency(`${key}Comment`, e.target.value)}
                      placeholder="Add specific observations..."
                      rows={2}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex justify-end gap-4 pb-12">
            <button
              onClick={() => {
                handleSave();
              }}
              className="px-8 py-3 bg-white border-2 border-purple-100 text-purple-600 font-bold rounded-xl hover:bg-purple-50 transition"
            >
              Save & Stay
            </button>
            <button
              onClick={() => {
                handleSave();
                setViewMode('setup');
                setSelectedLearnerId(''); // Reset for next learner
                window.scrollTo(0, 0);
              }}
              className="px-8 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition flex items-center gap-2 shadow-lg"
            >
              Finish & Next Learner
              <ArrowRight size={20} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CoreCompetenciesAssessment;
