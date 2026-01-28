import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  AlertCircle, 
  CheckCircle,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import performanceScaleService from '../../../services/api/performanceScaleService';
import { useAuth } from '../../../contexts/AuthContext';

const PerformanceScales = () => {
  const { user } = useAuth();
  const [scales, setScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingScale, setEditingScale] = useState(null);
  const [expandedScale, setExpandedScale] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'CBC',
    active: true,
    isDefault: false,
    ranges: [
      { label: 'Level 4', minPercentage: 80, maxPercentage: 100, points: 4, color: '#10b981', description: '', rubricRating: 'EE1' },
      { label: 'Level 3', minPercentage: 50, maxPercentage: 79, points: 3, color: '#3b82f6', description: '', rubricRating: 'ME1' },
      { label: 'Level 2', minPercentage: 30, maxPercentage: 49, points: 2, color: '#f59e0b', description: '', rubricRating: 'AE1' },
      { label: 'Level 1', minPercentage: 0, maxPercentage: 29, points: 1, color: '#ef4444', description: '', rubricRating: 'BE1' }
    ]
  });

  // CBC Rubric Rating options
  const rubricRatings = [
    { value: 'EE1', label: 'EE1 - Exceeds Expectations (Level 4)' },
    { value: 'EE2', label: 'EE2 - Exceeds Expectations (Level 4)' },
    { value: 'EE3', label: 'EE3 - Exceeds Expectations (Level 4)' },
    { value: 'EE4', label: 'EE4 - Exceeds Expectations (Level 4)' },
    { value: 'ME1', label: 'ME1 - Meets Expectations (Level 3)' },
    { value: 'ME2', label: 'ME2 - Meets Expectations (Level 3)' },
    { value: 'ME3', label: 'ME3 - Meets Expectations (Level 3)' },
    { value: 'ME4', label: 'ME4 - Meets Expectations (Level 3)' },
    { value: 'AE1', label: 'AE1 - Approaches Expectations (Level 2)' },
    { value: 'AE2', label: 'AE2 - Approaches Expectations (Level 2)' },
    { value: 'AE3', label: 'AE3 - Approaches Expectations (Level 2)' },
    { value: 'AE4', label: 'AE4 - Approaches Expectations (Level 2)' },
    { value: 'BE1', label: 'BE1 - Below Expectations (Level 1)' },
    { value: 'BE2', label: 'BE2 - Below Expectations (Level 1)' },
    { value: 'BE3', label: 'BE3 - Below Expectations (Level 1)' },
    { value: 'BE4', label: 'BE4 - Below Expectations (Level 1)' }
  ];

  // Summative Grade options
  const summativeGrades = [
    { value: 'A', label: 'A - Excellent' },
    { value: 'A_MINUS', label: 'A- - Very Good' },
    { value: 'B_PLUS', label: 'B+ - Good' },
    { value: 'B', label: 'B - Above Average' },
    { value: 'B_MINUS', label: 'B- - Average' },
    { value: 'C_PLUS', label: 'C+ - Below Average' },
    { value: 'C', label: 'C - Fair' },
    { value: 'C_MINUS', label: 'C- - Pass' },
    { value: 'D_PLUS', label: 'D+ - Weak' },
    { value: 'D', label: 'D - Poor' },
    { value: 'D_MINUS', label: 'D- - Very Poor' },
    { value: 'E', label: 'E - Fail' }
  ];

  useEffect(() => {
    if (user?.schoolId) {
      loadScales();
    }
  }, [user]);

  const loadScales = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceScaleService.getPerformanceScales(user.schoolId);
      setScales(data);
    } catch (err) {
      setError('Failed to load performance scales. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'CBC',
      active: true,
      isDefault: false,
      ranges: [
        { label: 'Level 4', minPercentage: 80, maxPercentage: 100, points: 4, color: '#10b981', description: '', rubricRating: 'EE1' },
        { label: 'Level 3', minPercentage: 50, maxPercentage: 79, points: 3, color: '#3b82f6', description: '', rubricRating: 'ME1' },
        { label: 'Level 2', minPercentage: 30, maxPercentage: 49, points: 2, color: '#f59e0b', description: '', rubricRating: 'AE1' },
        { label: 'Level 1', minPercentage: 0, maxPercentage: 29, points: 1, color: '#ef4444', description: '', rubricRating: 'BE1' }
      ]
    });
    setIsCreating(false);
    setEditingScale(null);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingScale(null);
    resetForm();
  };

  const handleEdit = (scale) => {
    setEditingScale(scale);
    setIsCreating(false);
    setFormData({
      name: scale.name,
      type: scale.type,
      active: scale.active,
      isDefault: scale.isDefault,
      ranges: scale.ranges.map(r => ({
        id: r.id,
        label: r.label,
        minPercentage: r.minPercentage,
        maxPercentage: r.maxPercentage,
        points: r.points || 0,
        color: r.color || '#000000',
        description: r.description || '',
        summativeGrade: r.summativeGrade,
        rubricRating: r.rubricRating
      }))
    });
  };

  const handleDuplicate = (scale) => {
    setIsCreating(true);
    setEditingScale(null);
    setFormData({
      name: `${scale.name} (Copy)`,
      type: scale.type,
      active: scale.active,
      isDefault: false,
      ranges: scale.ranges.map(r => ({
        label: r.label,
        minPercentage: r.minPercentage,
        maxPercentage: r.maxPercentage,
        points: r.points || 0,
        color: r.color || '#000000',
        description: r.description || '',
        summativeGrade: r.summativeGrade,
        rubricRating: r.rubricRating
      }))
    });
  };

  const handleSave = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Validation
      if (!formData.name.trim()) {
        setError('Please enter a scale name');
        return;
      }

      if (formData.ranges.length === 0) {
        setError('Please add at least one grading range');
        return;
      }

      // Validate ranges
      for (const range of formData.ranges) {
        if (!range.label || range.minPercentage === '' || range.maxPercentage === '') {
          setError('Please fill in all range fields');
          return;
        }
        if (parseFloat(range.minPercentage) > parseFloat(range.maxPercentage)) {
          setError(`Invalid range: ${range.label} - min cannot be greater than max`);
          return;
        }
      }

      const payload = {
        schoolId: user.schoolId,
        name: formData.name,
        type: formData.type,
        active: formData.active,
        isDefault: formData.isDefault,
        ranges: formData.ranges.map(r => ({
          label: r.label,
          minPercentage: parseFloat(r.minPercentage),
          maxPercentage: parseFloat(r.maxPercentage),
          points: r.points ? parseInt(r.points) : null,
          color: r.color,
          description: r.description,
          summativeGrade: formData.type === 'SUMMATIVE' ? r.summativeGrade : null,
          rubricRating: formData.type === 'CBC' ? r.rubricRating : null
        }))
      };

      if (editingScale) {
        await performanceScaleService.updatePerformanceScale(editingScale.id, payload);
        setSuccess('Performance scale updated successfully');
      } else {
        await performanceScaleService.createPerformanceScale(payload);
        setSuccess('Performance scale created successfully');
      }

      await loadScales();
      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save performance scale');
      console.error(err);
    }
  };

  const handleDelete = async (scaleId) => {
    if (!window.confirm('Are you sure you want to delete this performance scale?')) {
      return;
    }

    try {
      setError(null);
      await performanceScaleService.deletePerformanceScale(scaleId);
      setSuccess('Performance scale deleted successfully');
      await loadScales();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete performance scale');
      console.error(err);
    }
  };

  const addRange = () => {
    setFormData({
      ...formData,
      ranges: [
        ...formData.ranges,
        { label: '', minPercentage: 0, maxPercentage: 0, points: 0, color: '#000000', description: '', rubricRating: 'EE1' }
      ]
    });
  };

  const removeRange = (index) => {
    const newRanges = formData.ranges.filter((_, i) => i !== index);
    setFormData({ ...formData, ranges: newRanges });
  };

  const updateRange = (index, field, value) => {
    const newRanges = [...formData.ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setFormData({ ...formData, ranges: newRanges });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Scales</h1>
            <p className="mt-2 text-gray-600">
              Create and manage grading scales for assessments
            </p>
          </div>
          {!isCreating && !editingScale && (
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Scale
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(isCreating || editingScale) && (
        <div className="mb-8 bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingScale ? 'Edit Performance Scale' : 'Create Performance Scale'}
            </h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Basic Information */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scale Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grade 1 - Mathematics"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scale Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="CBC">CBC Rubric</option>
                  <option value="SUMMATIVE">Summative Grades</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Set as Default</span>
                </label>
              </div>
            </div>
          </div>

          {/* Grading Ranges */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Grading Ranges</h3>
              <button
                onClick={addRange}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Range
              </button>
            </div>

            <div className="space-y-3">
              {formData.ranges.map((range, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                      <input
                        type="text"
                        value={range.label}
                        onChange={(e) => updateRange(index, 'label', e.target.value)}
                        placeholder="A, Level 4"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Min %</label>
                      <input
                        type="number"
                        value={range.minPercentage}
                        onChange={(e) => updateRange(index, 'minPercentage', e.target.value)}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Max %</label>
                      <input
                        type="number"
                        value={range.maxPercentage}
                        onChange={(e) => updateRange(index, 'maxPercentage', e.target.value)}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Points</label>
                      <input
                        type="number"
                        value={range.points}
                        onChange={(e) => updateRange(index, 'points', e.target.value)}
                        min="0"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                      <input
                        type="color"
                        value={range.color}
                        onChange={(e) => updateRange(index, 'color', e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {formData.type === 'CBC' ? 'Rubric' : 'Grade'}
                      </label>
                      {formData.type === 'CBC' ? (
                        <select
                          value={range.rubricRating || 'EE1'}
                          onChange={(e) => updateRange(index, 'rubricRating', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          {rubricRatings.map(rating => (
                            <option key={rating.value} value={rating.value}>
                              {rating.value}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <select
                          value={range.summativeGrade || 'A'}
                          onChange={(e) => updateRange(index, 'summativeGrade', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          {summativeGrades.map(grade => (
                            <option key={grade.value} value={grade.value}>
                              {grade.value}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="md:col-span-6">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                      <textarea
                        value={range.description}
                        onChange={(e) => updateRange(index, 'description', e.target.value)}
                        placeholder="Optional description for this grade range..."
                        rows="2"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeRange(index)}
                    className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-5 h-5" />
              {editingScale ? 'Update Scale' : 'Create Scale'}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Scales List */}
      <div className="grid grid-cols-1 gap-6">
        {scales.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No performance scales found. Create one to get started.</p>
          </div>
        ) : (
          scales.map((scale) => (
            <div key={scale.id} className="bg-white rounded-lg shadow border border-gray-200">
              {/* Scale Header */}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{scale.name}</h3>
                      {scale.isDefault && (
                        <span className="px-2.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                          Default
                        </span>
                      )}
                      {scale.active ? (
                        <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          Inactive
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {scale.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{scale.ranges.length} grading ranges</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedScale(expandedScale === scale.id ? null : scale.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View details"
                    >
                      {expandedScale === scale.id ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDuplicate(scale)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(scale)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(scale.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Expanded View */}
                {expandedScale === scale.id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Grading Ranges</h4>
                    <div className="space-y-2">
                      {scale.ranges.map((range) => (
                        <div key={range.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: range.color }}
                          />
                          <div className="flex-1 grid grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">{range.label}</span>
                            </div>
                            <div className="text-gray-600">
                              {range.minPercentage}% - {range.maxPercentage}%
                            </div>
                            <div className="text-gray-600">
                              {range.points} {range.points === 1 ? 'point' : 'points'}
                            </div>
                            <div className="text-gray-600">
                              {scale.type === 'CBC' ? range.rubricRating : range.summativeGrade}
                            </div>
                            {range.description && (
                              <div className="col-span-5 text-gray-500 text-xs mt-1">
                                {range.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PerformanceScales;
