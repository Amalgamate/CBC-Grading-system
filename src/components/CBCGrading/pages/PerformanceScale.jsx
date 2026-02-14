/**
 * Performance Scale Management - Scale Group System  
 * Create one scale, auto-generate for all learning areas
 * ENHANCED: Multi-grade selection with "Select All"
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Plus, Trash2, Loader, Search,
  ChevronDown, ChevronRight, CheckCircle, Info, Database, ListChecks
} from 'lucide-react';
import { gradingAPI } from '../../../services/api';
import { useNotifications } from '../hooks/useNotifications';
import EmptyState from '../shared/EmptyState';
import ConfirmDialog from '../shared/ConfirmDialog';

const EIGHT_POINT_TEMPLATE = [
  { mark: 90, score: 8, rating: 'EE1', title: 'Exceeding Expectations 1', desc: 'The learner has achieved the learning outcome perfectly and can apply the skill/content in novel situations' },
  { mark: 75, score: 7, rating: 'EE2', title: 'Exceeding Expectations 2', desc: 'The learner has achieved the learning outcome very well and can apply the skill/content in most situations' },
  { mark: 58, score: 6, rating: 'ME1', title: 'Meeting Expectations 1', desc: 'The learner has achieved the learning outcome and can apply the skill/content in most situations with some support' },
  { mark: 41, score: 5, rating: 'ME2', title: 'Meeting Expectations 2', desc: 'The learner has achieved the learning outcome and can apply the skill/content in familiar situations with support' },
  { mark: 31, score: 4, rating: 'AE1', title: 'Approaching Expectations 1', desc: 'The learner has partially achieved the learning outcome and is beginning to apply the skill/content in familiar situations' },
  { mark: 21, score: 3, rating: 'AE2', title: 'Approaching Expectations 2', desc: 'The learner has partially achieved the learning outcome and requires considerable support to apply the skill/content' },
  { mark: 11, score: 2, rating: 'BE1', title: 'Below Expectations 1', desc: 'The learner has not achieved the learning outcome and requires substantial support to demonstrate the skill/content' },
  { mark: 1, score: 1, rating: 'BE2', title: 'Below Expectations 2', desc: 'The learner has not achieved the learning outcome and demonstrates minimal understanding of the skill/content' }
];

const LEARNING_AREAS = [
  'MATHEMATICAL ACTIVITIES',
  'ENGLISH LANGUAGE ACTIVITIES',
  'SHUGHULI ZA KISWAHILI LUGHA',
  'ENVIRONMENTAL ACTIVITIES',
  'CREATIVE ACTIVITIES',
  'RELIGIOUS EDUCATION',
  'SCIENCE & TECHNOLOGY',
  'SOCIAL STUDIES',
  'MUSIC',
  'ART & CRAFT',
  'PHYSICAL EDUCATION',
  'INSHA',
  'READING',
  'ABACUS',
  'AGRICULTURE'
];

const GRADES = [
  'PLAYGROUP', 'PP1', 'PP2',
  'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6',
  'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12'
];

const PerformanceScale = () => {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGrades, setExpandedGrades] = useState([]);

  const [scaleName, setScaleName] = useState('');
  const [selectedGrades, setSelectedGrades] = useState(['GRADE_6']);
  const [ranges, setRanges] = useState(EIGHT_POINT_TEMPLATE.map(t => ({
    mark: t.mark,
    score: t.score,
    description: t.desc,
    rating: t.rating,
    title: t.title
  })));

  const [scaleGroups, setScaleGroups] = useState([]);
  const [gradingSystems, setGradingSystems] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

  const [schoolId] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.schoolId || user?.school?.id || localStorage.getItem('currentSchoolId');
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    loadData();
  }, [schoolId, showError]);

  const loadData = async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const [groups, systems] = await Promise.all([
        gradingAPI.getScaleGroups(),
        gradingAPI.getSystems(schoolId)
      ]);
      setScaleGroups(groups.data || []);
      setGradingSystems(systems || []);
    } catch (err) {
      showError('Failed to load performance scales: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeToggle = (grade) => {
    setSelectedGrades(prev => {
      if (prev.includes(grade)) {
        return prev.filter(g => g !== grade);
      } else {
        return [...prev, grade];
      }
    });
  };

  const handleSelectAllGrades = () => {
    if (selectedGrades.length === GRADES.length) {
      setSelectedGrades([]);
    } else {
      setSelectedGrades([...GRADES]);
    }
  };

  const handleCreateScale = async () => {
    if (!scaleName.trim()) {
      showError('Please enter a scale name');
      return;
    }

    if (selectedGrades.length === 0) {
      showError('Please select at least one grade level');
      return;
    }

    setSaving(true);
    try {
      const gradeList = selectedGrades.length === GRADES.length
        ? 'All Grades'
        : selectedGrades.map(formatGradeDisplay).join(', ');

      const groupResponse = await gradingAPI.createScaleGroup({
        name: scaleName,
        description: `Performance scale for ${gradeList}`
      });

      const scaleGroupId = groupResponse.data.id;

      const sortedRanges = [...ranges].sort((a, b) => b.mark - a.mark);
      const apiRanges = sortedRanges.map((range, index, arr) => {
        const prevRange = arr[index - 1];
        return {
          label: range.title,
          minPercentage: parseFloat(range.mark),
          maxPercentage: prevRange ? parseFloat(prevRange.mark) - 0.01 : 100,
          points: parseInt(range.score),
          description: range.description,
          rubricRating: range.rating
        };
      });

      await gradingAPI.generateGradesForGroup(scaleGroupId, {
        grades: selectedGrades,
        ranges: apiRanges
      });

      const totalSystems = selectedGrades.length * LEARNING_AREAS.length;
      showSuccess(`✓ Created "${scaleName}" with ${totalSystems} grading systems across ${selectedGrades.length} grade(s)!`);

      setScaleName('');
      setSelectedGrades(['GRADE_6']);
      setRanges(EIGHT_POINT_TEMPLATE.map(t => ({
        mark: t.mark,
        score: t.score,
        description: t.desc,
        rating: t.rating,
        title: t.title
      })));
      setViewMode('list');
      await loadData();

    } catch (err) {
      console.error('Error creating scale:', err);
      showError('Failed to create performance scale: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScale = async (scaleGroupId, scaleName) => {
    if (!scaleGroupId) {
      showError('Cannot delete: Invalid scale group ID');
      return;
    }

    setConfirmConfig({
      title: 'Delete Performance Scale',
      message: `Delete "${scaleName}" and all its learning areas? This cannot be undone.`,
      confirmText: 'Delete Scale',
      onConfirm: async () => {
        setShowConfirm(false);
        setLoading(true);
        try {
          await gradingAPI.deleteScaleGroup(scaleGroupId);
          showSuccess('Performance scale deleted successfully');
          await loadData();
        } catch (err) {
          showError('Failed to delete scale: ' + err.message);
        } finally {
          setLoading(false);
        }
      }
    });
    setShowConfirm(true);
  };

  const getColorForScore = (score) => {
    const map = {
      8: '#065f46', 7: '#10b981',
      6: '#1e40af', 5: '#3b82f6',
      4: '#92400e', 3: '#f59e0b',
      2: '#991b1b', 1: '#ef4444'
    };
    return map[score] || '#6b7280';
  };

  const formatGradeDisplay = (grade) => {
    return grade.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const toggleGrade = (grade) => {
    setExpandedGrades(prev =>
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  const groupedData = {};
  gradingSystems.forEach(system => {
    if (!system.grade) return;
    const gradeKey = system.grade;
    if (!groupedData[gradeKey]) {
      groupedData[gradeKey] = {};
    }
    const scaleGroup = scaleGroups.find(g => g.id === system.scaleGroupId);
    const scaleGroupName = scaleGroup?.name || 'Individual Scales';
    if (!groupedData[gradeKey][scaleGroupName]) {
      groupedData[gradeKey][scaleGroupName] = {
        scaleGroupId: system.scaleGroupId,
        learningAreas: []
      };
    }
    groupedData[gradeKey][scaleGroupName].learningAreas.push(system);
  });

  if (viewMode === 'create') {
    const allSelected = selectedGrades.length === GRADES.length;
    const someSelected = selectedGrades.length > 0 && selectedGrades.length < GRADES.length;

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setViewMode('list')} className="p-2 hover:bg-gray-100 rounded-lg transition border border-gray-200">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Create Performance Scale</h1>
              <p className="text-sm text-gray-500">Configure once, applies to all learning areas</p>
            </div>
          </div>
          <button
            onClick={handleCreateScale}
            disabled={saving || !scaleName.trim() || selectedGrades.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />}
            {saving ? 'Creating...' : 'Create & Auto-Generate'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Performance Scale Name *</label>
            <input
              type="text"
              value={scaleName}
              onChange={(e) => setScaleName(e.target.value)}
              placeholder="e.g., Elimcrown Internal Exams"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
            />
            <p className="mt-2 text-xs text-gray-500">This name will identify this scale across all subjects</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">
              Grade Levels * <span className="text-gray-500 font-normal">({selectedGrades.length} selected)</span>
            </label>

            <div className="mb-4">
              <button
                type="button"
                onClick={handleSelectAllGrades}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition font-semibold ${allSelected
                  ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                  : someSelected
                    ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                    : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${allSelected ? 'bg-white border-white' : someSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'
                  }`}>
                  {allSelected && <CheckCircle size={16} className="text-blue-600" />}
                  {someSelected && !allSelected && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                </div>
                {allSelected ? 'Deselect All Grades' : 'Select All Grades'}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {GRADES.map(grade => {
                const isSelected = selectedGrades.includes(grade);
                return (
                  <label
                    key={grade}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition ${isSelected
                      ? 'bg-blue-50 border-blue-500 hover:bg-blue-100'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleGradeToggle(grade)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                      {formatGradeDisplay(grade)}
                    </span>
                  </label>
                );
              })}
            </div>

            <p className="mt-3 text-xs text-gray-500">
              Select one or more grades. The scale will be created for all learning areas in the selected grades.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ListChecks className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 mb-1">Auto-Generation Preview</h3>
                <p className="text-sm text-blue-800 mb-3">This will automatically create grading scales for:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-blue-900">{LEARNING_AREAS.length}</span>
                    <span className="text-blue-800">learning areas per grade</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-blue-900">{selectedGrades.length}</span>
                    <span className="text-blue-800">grade level(s) selected</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm pt-2 border-t border-blue-200">
                    <span className="font-bold text-lg text-blue-900">{LEARNING_AREAS.length * selectedGrades.length}</span>
                    <span className="text-blue-800">total grading systems will be created!</span>
                  </div>
                </div>

                {selectedGrades.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 mb-2">Selected Grades:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedGrades.map(grade => (
                        <span key={grade} className="px-2 py-1 bg-blue-200 text-blue-900 rounded text-xs font-medium">
                          {formatGradeDisplay(grade)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="font-bold text-gray-800">8-Point CBC Rubric Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">This rubric will apply to all {LEARNING_AREAS.length} learning areas across {selectedGrades.length} grade(s)</p>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase w-32">Min Mark (%)</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase w-32">Points</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Performance Description</th>
                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ranges.map((range, index) => (
                <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      value={range.mark}
                      onChange={(e) => {
                        const newRanges = [...ranges];
                        newRanges[index].mark = parseInt(e.target.value) || 0;
                        setRanges(newRanges);
                      }}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm"
                        style={{ backgroundColor: getColorForScore(range.score) }}
                      >
                        {range.score}
                      </div>
                      <span className="text-sm font-bold text-gray-700">{range.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <textarea
                      value={range.description}
                      onChange={(e) => {
                        const newRanges = [...ranges];
                        newRanges[index].description = e.target.value;
                        setRanges(newRanges);
                      }}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="Enter performance description..."
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setRanges(ranges.filter((_, i) => i !== index))}
                      disabled={ranges.length <= 1}
                      className="p-2 text-gray-400 hover:text-red-600 transition disabled:opacity-20"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info size={16} className="text-blue-500" />
              <span>These performance levels will be used across all learning areas</span>
            </div>
            <button
              onClick={() => setRanges([...ranges, { mark: 0, score: 1, description: '', rating: 'BE2', title: 'Below Expectations 2' }])}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <Plus size={16} />
              Add Level
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Performance Scales</h1>
          <p className="text-sm text-gray-500">Manage grading rubrics for all learning areas</p>
        </div>
        <button
          onClick={() => setViewMode('create')}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-blue-800 transition shadow-sm font-semibold"
        >
          <Plus size={18} />
          New Performance Scale
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search scales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      ) : Object.keys(groupedData).length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {Object.entries(groupedData).map(([gradeKey, scaleGroups]) => {
              const isExpanded = expandedGrades.includes(gradeKey);
              const scaleCount = Object.keys(scaleGroups).length;

              return (
                <div key={gradeKey}>
                  <div
                    onClick={() => toggleGrade(gradeKey)}
                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                      <h3 className="font-bold text-gray-800 text-lg">{formatGradeDisplay(gradeKey)}</h3>
                      <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-full border border-blue-100">
                        {scaleCount} {scaleCount === 1 ? 'Scale' : 'Scales'}
                      </span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-gray-50/50 px-6 pb-4">
                      {Object.entries(scaleGroups).map(([scaleName, data]) => (
                        <div key={scaleName} className="mb-4 last:mb-0">
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-gray-800">{scaleName}</h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  {data.learningAreas.length} learning {data.learningAreas.length === 1 ? 'area' : 'areas'}
                                </p>
                              </div>
                              {data.scaleGroupId && (
                                <button
                                  onClick={() => handleDeleteScale(data.scaleGroupId, scaleName)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete this scale"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>

                            <div className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {data.learningAreas.map(system => (
                                  <div
                                    key={system.id}
                                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition"
                                  >
                                    <CheckCircle size={14} className="text-green-600 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 truncate">{system.learningArea}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Database}
          title="No Performance Scales Yet"
          message="Create your first performance scale and we'll automatically generate it for all learning areas."
          actionText="Create First Scale"
          onAction={() => setViewMode('create')}
        />
      )}

      <ConfirmDialog
        show={showConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText || 'Confirm'}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setShowConfirm(false)}
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default PerformanceScale;
