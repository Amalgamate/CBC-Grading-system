/**
 * Core Competencies Assessment Form
 * Assess the 6 core competencies for CBC
 */

import React, { useState, useEffect } from 'react';
import { Save, User, Calendar, BookOpen } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';

const CoreCompetenciesAssessment = ({ learners }) => {
  const { showSuccess, showError } = useNotifications();

  // Form state
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('TERM_1');
  const [academicYear, setAcademicYear] = useState(2026);
  const [loading, setLoading] = useState(false);
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

  // Load existing competencies when learner/term changes
  useEffect(() => {
    if (selectedLearnerId && selectedTerm) {
      loadExistingCompetencies();
    }
  }, [selectedLearnerId, selectedTerm, academicYear]);

  const loadExistingCompetencies = async () => {
    setLoading(true);
    try {
      const response = await api.cbc.getCompetencies(selectedLearnerId, {
        term: selectedTerm,
        academicYear
      });

      if (response.success && response.data) {
        setCompetencies({
          communication: response.data.communication,
          communicationComment: response.data.communicationComment || '',
          criticalThinking: response.data.criticalThinking,
          criticalThinkingComment: response.data.criticalThinkingComment || '',
          creativity: response.data.creativity,
          creativityComment: response.data.creativityComment || '',
          collaboration: response.data.collaboration,
          collaborationComment: response.data.collaborationComment || '',
          citizenship: response.data.citizenship,
          citizenshipComment: response.data.citizenshipComment || '',
          learningToLearn: response.data.learningToLearn,
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
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Core Competencies Assessment</h2>
        <p className="text-purple-100">Assess the 6 core competencies as per CBC framework</p>
      </div>

      {/* Selection Panel */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <User size={20} />
          Select Learner & Term
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Learner</label>
            <select
              value={selectedLearnerId}
              onChange={(e) => setSelectedLearnerId(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Learner</option>
              {learners?.filter(l => l.status === 'ACTIVE' || l.status === 'Active').map(l => (
                <option key={l.id} value={l.id}>
                  {l.firstName} {l.lastName} - {l.grade} {l.stream || ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {terms.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year</label>
            <input
              type="number"
              value={academicYear}
              onChange={(e) => setAcademicYear(parseInt(e.target.value))}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Assessment Form */}
      {selectedLearner && (
        <>
          {/* Learner Info Card */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                {selectedLearner.firstName[0]}{selectedLearner.lastName[0]}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  {selectedLearner.firstName} {selectedLearner.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedLearner.admissionNumber} • {selectedLearner.grade} {selectedLearner.stream || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Competencies Grid */}
          <div className="space-y-6">
            {Object.entries(competencyDefinitions).map(([key, definition]) => (
              <div key={key} className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 hover:border-purple-300 transition">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{definition.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-800">{definition.name}</h4>
                    <p className="text-sm text-gray-600">{definition.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rating Dropdown */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Comment (Optional)</label>
                    <textarea
                      value={competencies[`${key}Comment`]}
                      onChange={(e) => updateCompetency(`${key}Comment`, e.target.value)}
                      placeholder="Add specific observations..."
                      rows={2}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Core Competencies Assessment'}
            </button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedLearnerId && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Learner</h3>
          <p className="text-gray-600">Choose a learner from the dropdown above to begin assessment</p>
        </div>
      )}
    </div>
  );
};

export default CoreCompetenciesAssessment;
