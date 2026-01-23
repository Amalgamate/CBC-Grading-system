/**
 * Values Assessment Form
 * Assess the 7 national values for CBC
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User, Heart, Save, Shield } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';

const ValuesAssessment = ({ learners }) => {
  const { showSuccess, showError } = useNotifications();

  // Form state
  const [selectedLearnerId, setSelectedLearnerId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('TERM_1');
  const [academicYear, setAcademicYear] = useState(2026);
  const [saving, setSaving] = useState(false);

  // Values state
  const [values, setValues] = useState({
    love: 'ME1',
    responsibility: 'ME1',
    respect: 'ME1',
    unity: 'ME1',
    peace: 'ME1',
    patriotism: 'ME1',
    integrity: 'ME1',
    comment: ''
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

  const valueDefinitions = {
    love: {
      name: 'Love',
      description: 'Showing care, compassion and kindness to others',
      icon: '❤️'
    },
    responsibility: {
      name: 'Responsibility',
      description: 'Being accountable and reliable in duties and actions',
      icon: '🎯'
    },
    respect: {
      name: 'Respect',
      description: 'Valuing others, their rights and dignity',
      icon: '🙏'
    },
    unity: {
      name: 'Unity',
      description: 'Working together harmoniously with others',
      icon: '🤲'
    },
    peace: {
      name: 'Peace',
      description: 'Promoting harmony and resolving conflicts peacefully',
      icon: '☮️'
    },
    patriotism: {
      name: 'Patriotism',
      description: 'Love and loyalty to one\'s country',
      icon: '🇰🇪'
    },
    integrity: {
      name: 'Integrity',
      description: 'Being honest and having strong moral principles',
      icon: '⚖️'
    }
  };

  const selectedLearner = learners?.find(l => l.id === selectedLearnerId);

  // Load existing values when learner/term changes
  const loadExistingValues = useCallback(async () => {
    try {
      const response = await api.cbc.getValues(selectedLearnerId, {
        term: selectedTerm,
        academicYear
      });

      if (response.success && response.data) {
        setValues({
          love: response.data.love,
          responsibility: response.data.responsibility,
          respect: response.data.respect,
          unity: response.data.unity,
          peace: response.data.peace,
          patriotism: response.data.patriotism,
          integrity: response.data.integrity,
          comment: response.data.comment || ''
        });
        showSuccess('Loaded existing assessment');
      }
    } catch (error) {
      console.log('No existing assessment found');
      // Reset to defaults
      setValues({
        love: 'ME1',
        responsibility: 'ME1',
        respect: 'ME1',
        unity: 'ME1',
        peace: 'ME1',
        patriotism: 'ME1',
        integrity: 'ME1',
        comment: ''
      });
    }
  }, [selectedLearnerId, selectedTerm, academicYear, showSuccess]);

  useEffect(() => {
    if (selectedLearnerId && selectedTerm) {
      loadExistingValues();
    }
  }, [selectedLearnerId, selectedTerm, academicYear, loadExistingValues]);

  const handleSave = async () => {
    if (!selectedLearnerId) {
      showError('Please select a learner');
      return;
    }

    setSaving(true);
    try {
      const response = await api.cbc.saveValues({
        learnerId: selectedLearnerId,
        term: selectedTerm,
        academicYear,
        ...values
      });

      if (response.success) {
        showSuccess('Values assessment saved successfully!');
      } else {
        throw new Error(response.message || 'Failed to save');
      }
    } catch (error) {
      showError(error.message || 'Failed to save values assessment');
    } finally {
      setSaving(false);
    }
  };

  const updateValue = (field, value) => {
    setValues(prev => ({
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
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Heart size={28} />
          National Values Assessment
        </h2>
        <p className="text-rose-100">Assess the 7 national values as per CBC framework</p>
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
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Assessment Form */}
      {selectedLearner && (
        <>
          {/* Learner Info Card */}
          <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <div className="bg-rose-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
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

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(valueDefinitions).map(([key, definition]) => (
              <div key={key} className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 hover:border-rose-300 transition">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-3xl">{definition.icon}</div>
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{definition.name}</h4>
                    <p className="text-sm text-gray-600">{definition.description}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                  <select
                    value={values[key]}
                    onChange={(e) => updateValue(key, e.target.value)}
                    className={`w-full px-4 py-2 border-2 rounded-lg focus:ring-2 focus:ring-rose-500 font-semibold ${getRatingColor(values[key])}`}
                  >
                    {ratings.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* General Comment */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              General Comment (Optional)
            </label>
            <textarea
              value={values.comment}
              onChange={(e) => updateValue('comment', e.target.value)}
              placeholder="Add overall observations about the learner's demonstration of values..."
              rows={4}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 resize-none"
            />
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-lg hover:from-rose-700 hover:to-pink-700 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save Values Assessment'}
            </button>
          </div>
        </>
      )}

      {/* Empty State */}
      {!selectedLearnerId && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Shield className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Select a Learner</h3>
          <p className="text-gray-600">Choose a learner from the dropdown above to begin assessment</p>
        </div>
      )}
    </div>
  );
};

export default ValuesAssessment;
