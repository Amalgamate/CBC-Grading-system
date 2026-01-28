/**
 * Performance Level Scale Management - Enterprise 8-Point System
 * Standard Table Interface for managing grading architecture.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Save, Plus, Trash2, AlertCircle,
  Loader, Check, Search, Filter, Edit,
  ChevronDown, ChevronRight, RefreshCcw,
  Info, Layers, MoreVertical, Copy, Database
} from 'lucide-react';
import { gradingAPI } from '../../../services/api';
import { useNotifications } from '../hooks/useNotifications';
import EmptyState from '../shared/EmptyState';
import ConfirmDialog from '../shared/ConfirmDialog';

// Define the 8-Point Standard Template
const EIGHT_POINT_TEMPLATE = [
  { mark: 90, score: 8, rating: 'EE1', title: 'Exceeding Expectations 1', desc: 'Exceeds expectations with distinction and demonstrates mastery of all concepts.' },
  { mark: 75, score: 7, rating: 'EE2', title: 'Exceeding Expectations 2', desc: 'Consistently exceeds expectations and applies skills independently.' },
  { mark: 58, score: 6, rating: 'ME1', title: 'Meeting Expectations 1', desc: 'Meets all expectations with a high degree of proficiency.' },
  { mark: 41, score: 5, rating: 'ME2', title: 'Meeting Expectations 2', desc: 'Meets expectations and demonstrates adequate understanding.' },
  { mark: 31, score: 4, rating: 'AE1', title: 'Approaching Expectations 1', desc: 'Is approaching expectations and showing steady progress.' },
  { mark: 21, score: 3, rating: 'AE2', title: 'Approaching Expectations 2', desc: 'Is approaching expectations but needs occasional guidance.' },
  { mark: 11, score: 2, rating: 'BE1', title: 'Below Expectations 1', desc: 'Is below expectations and requires additional support.' },
  { mark: 1, score: 1, rating: 'BE2', title: 'Below Expectations 2', desc: 'Is below expectations and requires intensive intervention.' }
];

const PerformanceScale = () => {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGrades, setExpandedGrades] = useState([]);

  // Dialog States
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

  const [schoolId] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.schoolId || user?.school?.id || localStorage.getItem('currentSchoolId');
    } catch (e) { return null; }
  });

  const [selectedGrade, setSelectedGrade] = useState('GRADE_1');
  const [selectedArea, setSelectedArea] = useState('MATHEMATICAL ACTIVITIES');
  const [scaleName, setScaleName] = useState('');
  const [gradingSystems, setGradingSystems] = useState([]);
  const [currentSystem, setCurrentSystem] = useState(null);
  const [ranges, setRanges] = useState(EIGHT_POINT_TEMPLATE.map(t => ({
    mark: t.mark,
    score: t.score,
    description: t.desc,
    rating: t.rating
  })));

  useEffect(() => {
    loadGradingSystems();
  }, [schoolId]);

  useEffect(() => {
    if (viewMode === 'form' && gradingSystems.length > 0) {
      const system = gradingSystems.find(
        s => (s.grade === selectedGrade && s.learningArea === selectedArea)
      );

      if (system && system.ranges) {
        setCurrentSystem(system);
        setScaleName(system.name);
        const converted = system.ranges.map(r => ({
          mark: r.minPercentage,
          score: r.points || r.score,
          description: r.description || '',
          rating: r.rubricRating || ''
        })).sort((a, b) => b.mark - a.mark);
        setRanges(converted);
      } else {
        resetToDefault();
      }
    }
  }, [selectedGrade, selectedArea, gradingSystems, viewMode]);

  const resetToDefault = () => {
    setCurrentSystem(null);
    setScaleName(`${selectedGrade.replace('_', ' ')} - ${selectedArea}`);
    setRanges(EIGHT_POINT_TEMPLATE.map(t => ({
      mark: t.mark,
      score: t.score,
      description: t.desc,
      rating: t.rating
    })));
  };

  const loadGradingSystems = async () => {
    if (!schoolId) return setLoading(false);
    try {
      setLoading(true);
      const systems = await gradingAPI.getSystems(schoolId);
      setGradingSystems(Array.isArray(systems) ? systems : []);
    } catch (err) {
      showError('Failed to load grading systems');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    setConfirmConfig({
      title: 'Clear All Scales',
      message: 'ARE YOU ABSOLUTELY SURE? This will permanently delete ALL grading scales for this school. This action cannot be undone.',
      confirmText: 'Delete All',
      onConfirm: async () => {
        try {
          setShowConfirm(false);
          setLoading(true);
          const deletePromises = gradingSystems.map(system => gradingAPI.deleteSystem(system.id));
          await Promise.all(deletePromises);
          showSuccess("Database Purged: All scales have been cleared successfully.");
          await loadGradingSystems();
        } catch (err) {
          showError("Database Error: Failed to clear some scales: " + err.message);
          await loadGradingSystems();
        } finally {
          setLoading(false);
        }
      }
    });
    setShowConfirm(true);
  };

  const handleDeleteGradeGroup = async (e, gradeKey, groupScales) => {
    e.stopPropagation();
    setConfirmConfig({
      title: 'Delete Grade Group',
      message: `Are you sure you want to delete all ${groupScales.length} scales in ${formatGradeDisplay(gradeKey)}?`,
      confirmText: 'Delete Group',
      onConfirm: async () => {
        try {
          setShowConfirm(false);
          setLoading(true);
          const deletePromises = groupScales.map(system => gradingAPI.deleteSystem(system.id));
          await Promise.all(deletePromises);
          showSuccess(`Group Deleted: All scales for ${formatGradeDisplay(gradeKey)} removed.`);
          await loadGradingSystems();
        } catch (err) {
          showError("Error: Failed to delete grade scales");
          await loadGradingSystems();
        } finally {
          setLoading(false);
        }
      }
    });
    setShowConfirm(true);
  };

  const handleConfirmSave = () => {
    setConfirmConfig({
      title: 'Save Performance Scale',
      message: `Do you want to ${currentSystem ? 'update' : 'create'} the "${scaleName}" performance scale?`,
      confirmText: 'Save Now',
      onConfirm: () => handleSave()
    });
    setShowConfirm(true);
  };

  const handleSave = async () => {
    setShowConfirm(false);
    if (!schoolId) return showError('Authentication error');
    setSaving(true);
    try {
      const sortedRanges = [...ranges].sort((a, b) => b.mark - a.mark);
      const apiRanges = sortedRanges.map((range, index, arr) => {
        const prevRange = arr[index - 1]; // Use prevRange because index 0 is the highest mark (e.g. 90)
        const t = EIGHT_POINT_TEMPLATE.find(temp => temp.score === range.score) || {};
        return {
          label: t.title || `Level ${range.score}`,
          minPercentage: parseFloat(range.mark),
          maxPercentage: prevRange ? parseFloat(prevRange.mark) - 0.01 : 100,
          points: parseInt(range.score),
          description: range.description,
          rubricRating: range.rating || t.rating || 'BE2',
          summativeGrade: getSummativeGrade(range.score),
          color: getColorForScore(range.score)
        };
      });

      const payload = {
        schoolId,
        name: scaleName || `${selectedGrade} - ${selectedArea}`,
        grade: selectedGrade,
        learningArea: selectedArea,
        type: 'SUMMATIVE',
        ranges: apiRanges
      };

      if (currentSystem) {
        await gradingAPI.updateSystem(currentSystem.id, payload);
        showSuccess('Performance scale updated!');
      } else {
        await gradingAPI.createSystem(payload);
        showSuccess('New performance scale created!');
      }

      await loadGradingSystems();
      setViewMode('list');
    } catch (err) {
      console.error('Performance Scale Save Error:', err);
      showError('Save failed: ' + (err.message || 'Check console for details'));
    } finally {
      setSaving(false);
    }
  };

  const getSummativeGrade = (score) => {
    // Must match Prisma enum: A, B, C, D, E
    // Mapping 8-points to 5-grades:
    const map = {
      8: 'A', 7: 'A',
      6: 'B', 5: 'B',
      4: 'C', 3: 'C',
      2: 'D',
      1: 'E'
    };
    return map[score] || 'E';
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
    if (!grade || grade === 'GENERAL') return 'Unassigned Grades';
    return grade.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const toggleGrade = (grade) => {
    setExpandedGrades(prev =>
      prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
    );
  };

  // Group scales by grade for the accordion list
  const groupedScales = useMemo(() => {
    const filtered = gradingSystems.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups = {};
    filtered.forEach(scale => {
      if (!scale.grade) return; // Filter out scales without a specific grade if they seem 'hardcoded' or invalid
      const g = scale.grade;
      if (!groups[g]) groups[g] = [];
      groups[g].push(scale);
    });
    return groups;
  }, [gradingSystems, searchTerm]);

  const grades = [
    'PLAYGROUP', 'PP1', 'PP2',
    'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6',
    'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12'
  ];

  const learningAreas = [
    'MATHEMATICAL ACTIVITIES', 'ENGLISH LANGUAGE ACTIVITIES', 'SHUGHULI ZA KISWAHILI LUGHA',
    'ENVIRONMENTAL ACTIVITIES', 'CREATIVE ACTIVITIES', 'RELIGIOUS EDUCATION',
    'SCIENCE & TECHNOLOGY', 'SOCIAL STUDIES', 'MUSIC', 'ART & CRAFT', 'PHYSICAL EDUCATION',
    'INSHA', 'READING', 'ABACUS'
  ];

  // LIST VIEW with Accordions
  if (viewMode === 'list') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Performance Scales</h1>
            <p className="text-sm text-gray-500">Manage grading rubrics and 8-point system scales</p>
          </div>
          <div className="flex items-center gap-3">
            {gradingSystems.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition shadow-sm"
              >
                <Trash2 size={18} />
                Clear All
              </button>
            )}
            <button
              onClick={() => { resetToDefault(); setViewMode('form'); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-blue-800 transition shadow-sm font-semibold"
            >
              <Plus size={18} />
              New Scale
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
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

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {Object.keys(groupedScales).length > 0 ? (
            <div className="divide-y divide-gray-100">
              {Object.entries(groupedScales).map(([gradeKey, scales]) => {
                const isExpanded = expandedGrades.includes(gradeKey);
                return (
                  <div key={gradeKey} className="flex flex-col">
                    <div className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition group">
                      <div
                        onClick={() => toggleGrade(gradeKey)}
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                      >
                        {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                        <h3 className="font-bold text-gray-700">{formatGradeDisplay(gradeKey)}</h3>
                        <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                          {scales.length} Scales
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteGradeGroup(e, gradeKey, scales)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete Group"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="bg-gray-50/50 pb-4">
                        <div className="mx-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Scale Name</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Learning Area</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Levels</th>
                                <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {scales.map(scale => (
                                <tr key={scale.id} className="hover:bg-blue-50/30 transition-colors">
                                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{scale.name}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{scale.learningArea}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex gap-1">
                                      {scale.ranges?.slice(0, 8).map((r, i) => (
                                        <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color || '#ddd' }} />
                                      ))}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        onClick={() => { setCurrentSystem(scale); setViewMode('form'); }}
                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                      >
                                        <Edit size={16} />
                                      </button>
                                      <button
                                        onClick={async () => {
                                          setConfirmConfig({
                                            title: 'Delete Performance Scale',
                                            message: `Delete the "${scale.name}" scale? This cannot be undone.`,
                                            onConfirm: async () => {
                                              setShowConfirm(false);
                                              await gradingAPI.deleteSystem(scale.id);
                                              showSuccess('Scale deleted successfully');
                                              loadGradingSystems();
                                            }
                                          });
                                          setShowConfirm(true);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Database}
              title="No Performance Scales Found"
              message="You haven't architecturalized any grading scales yet. Create your first 8-point scale to begin assessing your learners."
              actionText="Create New Scale"
              onAction={() => { resetToDefault(); setViewMode('form'); }}
            />
          )}
        </div>

        <ConfirmDialog
          show={showConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText || 'Confirm'}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setShowConfirm(false)}
          confirmButtonClass={confirmConfig.title.includes('Delete') || confirmConfig.title.includes('Clear') ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
        />
      </div>
    );
  }

  // FORM VIEW - Standard Table Format
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => { setShowConfirm(false); setViewMode('list'); }}
            className="p-2 hover:bg-gray-100 rounded-lg transition border border-gray-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{currentSystem ? 'Edit Performance Scale' : 'New Performance Scale'}</h1>
            <p className="text-sm text-gray-500">Configure 8-point grading criteria</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefault}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCcw size={16} />
            Reset to 8-Points
          </button>
          <button
            onClick={handleConfirmSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-bold disabled:opacity-50"
          >
            {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
            Save Scale Architecture
          </button>
        </div>
      </div>

      {/* Form Controls Row */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Scale Name</label>
          <input
            type="text"
            value={scaleName}
            onChange={(e) => setScaleName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            placeholder="e.g. End Year Maths Scale"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Grade Level</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            {grades.map(g => <option key={g} value={g}>{formatGradeDisplay(g)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Learning Area</label>
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            {learningAreas.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* The 8-Point Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-32">Min Mark (%)</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-32">Points (1-8)</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Performance Description</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase w-20 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ranges.map((range, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="relative">
                    <input
                      type="number"
                      value={range.mark}
                      onChange={(e) => {
                        const nr = [...ranges];
                        nr[index].mark = parseInt(e.target.value) || 0;
                        setRanges(nr);
                      }}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute right-2 top-2 text-gray-400 text-xs mt-0.5">%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm" style={{ backgroundColor: getColorForScore(range.score) }}>
                      {range.score}
                    </div>
                    <span className="text-xs font-bold text-gray-600">{range.rating}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <textarea
                    value={range.description}
                    onChange={(e) => {
                      const nr = [...ranges];
                      nr[index].description = e.target.value;
                      setRanges(nr);
                    }}
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Enter description..."
                  />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setRanges(ranges.filter((_, i) => i !== index))}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-20"
                    disabled={ranges.length === 1}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center px-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info size={14} className="text-blue-500" />
            <span>The system will automatically prefix the learner's name during report generation.</span>
          </div>
          <button
            onClick={() => setRanges([...ranges, { mark: 0, score: 1, description: '', rating: 'BE2' }])}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <Plus size={16} />
            Add Level
          </button>
        </div>
      </div>
      <ConfirmDialog
        show={showConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText || 'Confirm'}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setShowConfirm(false)}
        confirmButtonClass={confirmConfig.title.includes('Delete') || confirmConfig.title.includes('Clear') ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
      />
    </div >
  );
};

export default PerformanceScale;
