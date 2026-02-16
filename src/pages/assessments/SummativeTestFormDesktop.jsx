import React from 'react';
import { ArrowLeft, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useSummativeTestForm } from '../../hooks/useSummativeTestForm';
import { getLearningAreasByGrade } from '../../constants/learningAreas';

const SummativeTestFormDesktop = ({ onBack, onSuccess }) => {
  const {
    formData,
    scales,
    grades,
    terms,
    errors,
    saveStatus,
    saving,
    loadingScales,
    loadingGrades,
    testTypes,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    getSelectedScale
  } = useSummativeTestForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const createdTest = await originalHandleSubmit(e);
      if (createdTest && onSuccess) {
        onSuccess(createdTest);
      }
    } catch (error) {
      // Error already handled in hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  type="button"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">New Test</h1>
              </div>
            </div>

            {/* Status Indicator */}
            {saveStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <Check size={20} />
                <span className="font-medium">Test created successfully!</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                <AlertCircle size={20} />
                <span className="font-medium">Please fix errors</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {/* Form Fields */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Summative Test"
                />
                {errors.title && (
                  <p className="text-red-600 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Type</option>
                  {testTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-600 text-xs mt-1">{errors.type}</p>
                )}
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.grade ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loadingGrades}
                >
                  {loadingGrades ? (
                    <option value="">Loading grades...</option>
                  ) : grades.length === 0 ? (
                    <option value="">No grades available</option>
                  ) : (
                    <>
                      <option value="">Select Grade</option>
                      {grades.map(grade => (
                        <option key={grade} value={grade}>
                          {grade.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </>
                  )}
                </select>
                {errors.grade && (
                  <p className="text-red-600 text-xs mt-1">{errors.grade}</p>
                )}
              </div>

              {/* Learning Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Area<span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.learningArea}
                  onChange={(e) => handleInputChange('learningArea', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.learningArea ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!formData.grade}
                >
                  <option value="">{formData.grade ? 'Select Learning Area' : 'Select Grade first'}</option>
                  {formData.grade && getLearningAreasByGrade(formData.grade).map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
                {errors.learningArea && (
                  <p className="text-red-600 text-xs mt-1">{errors.learningArea}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Academic Term */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Term
                </label>
                <select
                  value={formData.term}
                  onChange={(e) => handleInputChange('term', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.term ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loadingGrades}
                >
                  {loadingGrades ? (
                    <option value="">Loading terms...</option>
                  ) : terms.length === 0 ? (
                    <option value="">No terms available</option>
                  ) : (
                    <>
                      <option value="">Select Academic Term</option>
                      {terms.map(term => (
                        <option key={term.value} value={term.value}>{term.label}</option>
                      ))}
                    </>
                  )}
                </select>
                {errors.term && (
                  <p className="text-red-600 text-xs mt-1">{errors.term}</p>
                )}
              </div>

              {/* Scale */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scale
                </label>
                <select
                  value={formData.scaleId}
                  onChange={(e) => handleInputChange('scaleId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loadingScales}
                >
                  {loadingScales ? (
                    <option value="">Loading scales...</option>
                  ) : scales.length === 0 ? (
                    <option value="">No scales available</option>
                  ) : (
                    <>
                      <option value="">Select Scale</option>
                      {scales
                        .filter(s => {
                          const isSummative = s.type === 'SUMMATIVE';
                          if (!isSummative) return false;
                          if (!formData.grade) return true;
                          const gradeMatches = s.grade === formData.grade ||
                            (s.name && s.name.toUpperCase().includes(formData.grade.toUpperCase().replace(/_/g, ' ')));
                          return gradeMatches;
                        })
                        .map(scale => (
                          <option key={scale.id} value={scale.id}>{scale.name}</option>
                        ))}
                    </>
                  )}
                </select>
                {!loadingScales && scales.filter(s => s.type === 'SUMMATIVE').length === 0 && (
                  <p className="text-amber-600 text-xs mt-1">No summative performance scales found. Please create scales in settings.</p>
                )}
              </div>
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional test description"
                  rows="3"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => handleInputChange('instructions', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional test instructions"
                  rows="3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900">Error Saving Test</h4>
                <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
                if (onBack) {
                  onBack();
                }
              }
            }}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-2.5 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SummativeTestFormDesktop;
