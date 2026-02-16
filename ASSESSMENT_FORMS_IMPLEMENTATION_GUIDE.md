# Assessment Forms Implementation Guide
## Step-by-Step Code Examples

---

## Part 1: Create Custom Hook (useCoreCompetencies)

Create file: `src/hooks/useCoreCompetencies.js`

```javascript
import { useState, useCallback } from 'react';
import { authAPI } from '../services/api';

export const useCoreCompetencies = (initialData = null) => {
  const [formData, setFormData] = useState({
    studentId: initialData?.studentId || '',
    studentName: initialData?.studentName || '',
    grade: initialData?.grade || '',
    term: initialData?.term || '',
    academicYear: initialData?.academicYear || '',
    assessmentDate: initialData?.assessmentDate || new Date().toISOString().split('T')[0],
    competencies: [
      {
        id: 1,
        name: 'Communication and Collaboration',
        descriptor: 'Ability to express ideas clearly and work effectively with others',
        rating: '',
        evidence: '',
        teacherComment: ''
      },
      {
        id: 2,
        name: 'Critical Thinking and Problem Solving',
        descriptor: 'Ability to analyze situations and develop creative solutions',
        rating: '',
        evidence: '',
        teacherComment: ''
      },
      {
        id: 3,
        name: 'Creativity and Imagination',
        descriptor: 'Demonstrates original thinking and innovative approaches',
        rating: '',
        evidence: '',
        teacherComment: ''
      },
      {
        id: 4,
        name: 'Citizenship',
        descriptor: 'Shows respect, responsibility, and engagement in community',
        rating: '',
        evidence: '',
        teacherComment: ''
      },
      {
        id: 5,
        name: 'Digital Literacy',
        descriptor: 'Effective and responsible use of technology and digital tools',
        rating: '',
        evidence: '',
        teacherComment: ''
      },
      {
        id: 6,
        name: 'Learning to Learn',
        descriptor: 'Self-direction, reflection, and continuous improvement',
        rating: '',
        evidence: '',
        teacherComment: ''
      }
    ],
    overallComment: initialData?.overallComment || '',
    nextSteps: initialData?.nextSteps || ''
  });

  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | success | error
  const [loading, setLoading] = useState(false);

  const ratingScale = [
    { value: 'EE', label: 'Exceeds Expectations', color: 'bg-green-100 border-green-300' },
    { value: 'ME', label: 'Meets Expectations', color: 'bg-blue-100 border-blue-300' },
    { value: 'AP', label: 'Approaching Expectations', color: 'bg-yellow-100 border-yellow-300' },
    { value: 'BE', label: 'Below Expectations', color: 'bg-red-100 border-red-300' }
  ];

  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const academicYears = ['2023/2024', '2024/2025', '2025/2026'];

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const handleCompetencyChange = useCallback((id, field, value) => {
    setFormData(prev => ({
      ...prev,
      competencies: prev.competencies.map(comp =>
        comp.id === id ? { ...comp, [field]: value } : comp
      )
    }));
    // Clear error
    if (errors[`competency_${id}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`competency_${id}_${field}`];
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.studentId?.trim()) newErrors.studentId = 'Student ID is required';
    if (!formData.studentName?.trim()) newErrors.studentName = 'Student name is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.term) newErrors.term = 'Term is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic year is required';

    // Check competencies
    formData.competencies.forEach(comp => {
      if (!comp.rating) {
        newErrors[`competency_${comp.id}_rating`] = 'Rating is required';
      }
      if (!comp.evidence?.trim()) {
        newErrors[`competency_${comp.id}_evidence`] = 'Evidence is required';
      }
    });

    if (!formData.overallComment?.trim()) newErrors.overallComment = 'Overall comment is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      studentId: '',
      studentName: '',
      grade: '',
      term: '',
      academicYear: '',
      assessmentDate: new Date().toISOString().split('T')[0],
      competencies: formData.competencies.map(c => ({
        ...c,
        rating: '',
        evidence: '',
        teacherComment: ''
      })),
      overallComment: '',
      nextSteps: ''
    });
    setErrors({});
    setSaveStatus('idle');
  }, [formData.competencies]);

  const handleSubmit = useCallback(async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }

    if (!validateForm()) {
      setSaveStatus('error');
      return null;
    }

    setSaveStatus('saving');
    setLoading(true);

    try {
      const response = await authAPI.post('/assessments/core-competencies', {
        ...formData
      });

      setSaveStatus('success');
      setLoading(false);
      
      // Reset after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
      
      return response.data;
    } catch (error) {
      console.error('Save error:', error);
      setErrors({ submit: error.message || 'Failed to save assessment' });
      setSaveStatus('error');
      setLoading(false);
      return null;
    }
  }, [formData, validateForm]);

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    saveStatus,
    setSaveStatus,
    loading,
    setLoading,
    ratingScale,
    grades,
    terms,
    academicYears,
    handleInputChange,
    handleCompetencyChange,
    validateForm,
    handleSubmit,
    resetForm
  };
};
```

---

## Part 2: Mobile Component (CoreCompetenciesFormMobile)

Create file: `src/pages/assessments/CoreCompetenciesFormMobile.jsx`

```jsx
import React, { useState } from 'react';
import { ArrowLeft, Check, AlertCircle, Loader, ChevronUp, ChevronDown } from 'lucide-react';
import { useCoreCompetencies } from '../../hooks/useCoreCompetencies';

const CoreCompetenciesFormMobile = ({ onBack, onSuccess }) => {
  const {
    formData,
    errors,
    saveStatus,
    loading,
    ratingScale,
    grades,
    terms,
    academicYears,
    handleInputChange,
    handleCompetencyChange,
    handleSubmit: originalHandleSubmit
  } = useCoreCompetencies();

  const [expandedCompetency, setExpandedCompetency] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await originalHandleSubmit(e);
      if (result && onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      // Error already handled in hook
    }
  };

  const toggleCompetency = (id) => {
    setExpandedCompetency(expandedCompetency === id ? null : id);
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col z-50 w-screen h-screen">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm flex-shrink-0">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                type="button"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
            )}
            <h1 className="text-lg font-bold text-gray-900">Core Competencies</h1>
          </div>
          {saveStatus === 'success' && (
            <div className="flex items-center gap-1 text-green-600">
              <Check size={16} />
            </div>
          )}
        </div>
      </div>

      {/* Main Form - Scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pb-24">
        <div className="px-4 py-4 space-y-4">
          {/* Error Alert */}
          {saveStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-900">Error Saving</p>
                  <p className="text-xs text-red-700">{errors.submit || 'Please check the form'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Student Info Section */}
          <div className="bg-white rounded-lg p-4 space-y-3 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Student Information</h2>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Student ID<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.studentId}
                onChange={(e) => handleInputChange('studentId', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-base ${
                  errors.studentId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., STU001"
              />
              {errors.studentId && (
                <p className="text-red-600 text-xs mt-1">{errors.studentId}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Student Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.studentName}
                onChange={(e) => handleInputChange('studentName', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-base ${
                  errors.studentName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Full name"
              />
              {errors.studentName && (
                <p className="text-red-600 text-xs mt-1">{errors.studentName}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Grade<span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-base ${
                    errors.grade ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select</option>
                  {grades.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Term<span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.term}
                  onChange={(e) => handleInputChange('term', e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-base ${
                    errors.term ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select</option>
                  {terms.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Academic Year<span className="text-red-500">*</span>
              </label>
              <select
                value={formData.academicYear}
                onChange={(e) => handleInputChange('academicYear', e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg text-base ${
                  errors.academicYear ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select</option>
                {academicYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Assessment Date
              </label>
              <input
                type="date"
                value={formData.assessmentDate}
                onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base"
              />
            </div>
          </div>

          {/* Competencies Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 px-4">Core Competencies</h2>
            
            {formData.competencies.map((competency) => (
              <div key={competency.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Competency Header - Clickable to expand */}
                <button
                  type="button"
                  onClick={() => toggleCompetency(competency.id)}
                  className="w-full p-4 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{competency.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{competency.descriptor}</p>
                    
                    {/* Show selected rating */}
                    {competency.rating && (
                      <div className="mt-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                          competency.rating === 'EE' ? 'bg-green-100 text-green-800' :
                          competency.rating === 'ME' ? 'bg-blue-100 text-blue-800' :
                          competency.rating === 'AP' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {ratingScale.find(r => r.value === competency.rating)?.label}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-shrink-0 ml-2">
                    {expandedCompetency === competency.id ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedCompetency === competency.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-200">
                    {/* Rating */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Rating<span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {ratingScale.map(rating => (
                          <button
                            key={rating.value}
                            type="button"
                            onClick={() => handleCompetencyChange(competency.id, 'rating', rating.value)}
                            className={`p-2 rounded-lg text-xs font-medium text-center border transition ${
                              competency.rating === rating.value
                                ? `${rating.color} border-current`
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {rating.label.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                      {errors[`competency_${competency.id}_rating`] && (
                        <p className="text-red-600 text-xs mt-1">{errors[`competency_${competency.id}_rating`]}</p>
                      )}
                    </div>

                    {/* Evidence */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Evidence<span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={competency.evidence}
                        onChange={(e) => handleCompetencyChange(competency.id, 'evidence', e.target.value)}
                        placeholder="Describe evidence supporting this rating..."
                        className={`w-full px-3 py-2.5 border rounded-lg text-base resize-none h-24 ${
                          errors[`competency_${competency.id}_evidence`] ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors[`competency_${competency.id}_evidence`] && (
                        <p className="text-red-600 text-xs mt-1">{errors[`competency_${competency.id}_evidence`]}</p>
                      )}
                    </div>

                    {/* Teacher Comment */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Teacher Comment (Optional)
                      </label>
                      <textarea
                        value={competency.teacherComment}
                        onChange={(e) => handleCompetencyChange(competency.id, 'teacherComment', e.target.value)}
                        placeholder="Additional comments..."
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base resize-none h-20"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overall Comments */}
          <div className="bg-white rounded-lg p-4 space-y-3 border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Overall Assessment</h2>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Overall Comment<span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.overallComment}
                onChange={(e) => handleInputChange('overallComment', e.target.value)}
                placeholder="Provide overall assessment summary..."
                className={`w-full px-3 py-2.5 border rounded-lg text-base resize-none h-24 ${
                  errors.overallComment ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.overallComment && (
                <p className="text-red-600 text-xs mt-1">{errors.overallComment}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Next Steps (Optional)
              </label>
              <textarea
                value={formData.nextSteps}
                onChange={(e) => handleInputChange('nextSteps', e.target.value)}
                placeholder="Recommendations for next term..."
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-base resize-none h-20"
              />
            </div>
          </div>

          {/* Spacing for sticky footer */}
          <div className="h-4" />
        </div>
      </form>

      {/* Footer - Sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex gap-3 z-30">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading || saveStatus === 'saving'}
          className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 flex items-center justify-center gap-2"
        >
          {loading || saveStatus === 'saving' ? (
            <>
              <Loader size={16} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            'Save Assessment'
          )}
        </button>
      </div>
    </div>
  );
};

export default CoreCompetenciesFormMobile;
```

---

## Part 3: Router Component (CoreCompetenciesForm)

Create/Update file: `src/pages/assessments/CoreCompetenciesForm.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import CoreCompetenciesFormMobile from './CoreCompetenciesFormMobile';
import CoreCompetenciesFormDesktop from './CoreCompetenciesFormDesktop';

/**
 * CoreCompetenciesForm - Responsive wrapper
 * Detects viewport and renders Mobile or Desktop version
 */
const CoreCompetenciesForm = ({ onBack, onSuccess }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      console.log(`📱 Viewport resized: ${mobile ? 'Mobile' : 'Desktop'} (${window.innerWidth}px)`);
    };

    window.addEventListener('resize', handleResize);
    console.log(`🔍 Initial viewport width: ${window.innerWidth}px (${isMobile ? 'Mobile' : 'Desktop'})`);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  if (isMobile) {
    return <CoreCompetenciesFormMobile onBack={onBack} onSuccess={onSuccess} />;
  } else {
    return <CoreCompetenciesFormDesktop onBack={onBack} onSuccess={onSuccess} />;
  }
};

export default CoreCompetenciesForm;
```

---

## Part 4: Key Features Summary

### ✅ What Makes It App-Like

1. **Fixed Header** - Always visible, doesn't scroll away
2. **Sticky Footer** - Save/Cancel buttons always accessible
3. **Accordion Content** - Competencies collapse/expand
4. **Large Touch Targets** - `py-2.5` for buttons, `text-base` for inputs
5. **Loading States** - Clear "Saving..." indication
6. **Error Highlighting** - Red borders + error text
7. **Status Indicators** - Green checkmark on success
8. **No Horizontal Scroll** - Everything fits on mobile width
9. **Auto-Collapse** - Only one competency expanded at a time
10. **Custom Hook** - All logic separated from UI

---

## Part 5: Implementation Checklist

- [ ] Create `useCoreCompetencies` hook file
- [ ] Create `CoreCompetenciesFormMobile.jsx`
- [ ] Create `CoreCompetenciesFormDesktop.jsx`  
- [ ] Update `CoreCompetenciesForm.jsx` with router logic
- [ ] Test on mobile device (< 768px)
- [ ] Test on tablet/desktop (≥ 768px)
- [ ] Test form validation
- [ ] Test save/error states
- [ ] Test navigating back
- [ ] Deploy to staging
- [ ] GA deploy

---

## Part 6: Next Forms to Convert

Repeat this pattern for:
1. ✅ **CoreCompetenciesForm** (Example above)
2. **ValuesAssessmentForm** (7 collapsible value cards)
3. **CoCurricularActivitiesForm** (Floating + button for adding activities)
4. **TermlyReportCommentsForm** (Scrollable subject cards instead of tabs)

Each follows the exact same architecture:
- 1 Custom Hook
- 2 Component Files (Mobile + Desktop)
- 1 Router Component

---

**Estimated time per form:** 2-3 days once pattern is established

