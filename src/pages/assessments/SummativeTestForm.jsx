import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  Check
} from 'lucide-react';
import api from '../../services/api';

const SummativeTestForm = ({ onBack, onSuccess }) => {

  const [scales, setScales] = useState([]);
  const [grades, setGrades] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loadingScales, setLoadingScales] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    grade: '',
    term: 'TERM_1',
    academicYear: new Date().getFullYear(),
    scaleId: '',
    testDate: new Date().toISOString().split('T')[0],
    totalMarks: 100,
    passMarks: 50,
    duration: 60,
    description: '',
    instructions: '',
    curriculum: 'CBC_AND_EXAM',
    weight: 100.0,
    status: 'DRAFT'
  });

  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('');

  const testTypes = [
    { value: 'MONTHLY_TEST', label: 'Monthly Test' },
    { value: 'TUNNER_UP', label: 'Tunner-Up' },
    { value: 'MIDTERM', label: 'Midterm' },
    { value: 'END_OF_TERM', label: 'End of the Term' }
  ];

  // Load grades, terms, and scales on component mount
  useEffect(() => {
    loadGrades();
    loadScales();
  }, []);

  const loadGrades = async () => {
    setLoadingGrades(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const schoolId = user?.school?.id || user?.schoolId;
      
      if (!schoolId) {
        console.warn('No schoolId found, using default grades');
        setDefaultGradesAndTerms();
        return;
      }

      console.log('🔍 Loading grades and terms for schoolId:', schoolId);
      const response = await api.get(`/classes?schoolId=${schoolId}`);
      console.log('📊 Classes response:', response.data);
      
      const classesData = response.data?.data || response.data || [];
      
      // Extract unique grades from classes
      const uniqueGrades = [...new Set(classesData.map(c => c.grade))].filter(Boolean).sort();
      const uniqueTerms = [...new Set(classesData.map(c => c.term))].filter(Boolean);
      
      // If we have grades from classes, use them; otherwise use defaults
      if (uniqueGrades.length > 0) {
        setGrades(uniqueGrades);
        console.log('✅ Loaded', uniqueGrades.length, 'grades from classes:', uniqueGrades);
      } else {
        setDefaultGrades();
        console.log('⚠️ No grades found in classes, using defaults');
      }
      
      // Set terms
      if (uniqueTerms.length > 0) {
        setTerms(uniqueTerms.map(term => ({
          value: term,
          label: term.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        })));
      } else {
        setDefaultTerms();
      }
    } catch (error) {
      console.error('❌ Error loading grades:', error);
      console.error('Error details:', error.response?.data || error.message);
      setDefaultGradesAndTerms();
    } finally {
      setLoadingGrades(false);
    }
  };

  const setDefaultGrades = () => {
    setGrades([
      'PLAYGROUP',
      'PRE_PRIMARY_1',
      'PRE_PRIMARY_2',
      'GRADE_1',
      'GRADE_2',
      'GRADE_3',
      'GRADE_4',
      'GRADE_5',
      'GRADE_6'
    ]);
  };

  const setDefaultTerms = () => {
    setTerms([
      { value: 'TERM_1', label: 'Term 1' },
      { value: 'TERM_2', label: 'Term 2' },
      { value: 'TERM_3', label: 'Term 3' }
    ]);
  };

  const setDefaultGradesAndTerms = () => {
    setDefaultGrades();
    setDefaultTerms();
  };

  const loadScales = async () => {
    setLoadingScales(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const schoolId = user?.school?.id || user?.schoolId || 'default-school-e082e9a4';
      
      console.log('🔍 Loading scales for schoolId:', schoolId);
      const response = await api.get(`/grading/systems/${schoolId}`);
      console.log('📊 Grading systems response:', response.data);
      
      const systems = response.data || [];
      // Load all scales, not just CBC ones
      setScales(systems);
      console.log('✅ Loaded', systems.length, 'scales:', systems);
    } catch (error) {
      console.error('❌ Error loading scales:', error);
      console.error('Error details:', error.response?.data || error.message);
      setScales([]);
    } finally {
      setLoadingScales(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Test name is required';
    }
    if (!formData.type) {
      newErrors.type = 'Test type is required';
    }
    if (!formData.grade) {
      newErrors.grade = 'Grade is required';
    }
    if (!formData.term) {
      newErrors.term = 'Academic term is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSaveStatus('error');
      return;
    }

    setSaving(true);
    setSaveStatus('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Get the selected scale
      const selectedScale = getSelectedScale();
      
      // Prepare test data
      const testData = {
        ...formData,
        totalMarks: parseInt(formData.totalMarks),
        passMarks: parseInt(formData.passMarks),
        duration: parseInt(formData.duration) || null,
        createdBy: userId,
        published: false,
        active: true,
        // Include scale information if available
        scaleId: selectedScale?.id || null,
        scaleName: selectedScale?.name || null
      };

      console.log('📤 Submitting test:', testData);
      console.log('📊 Selected scale:', selectedScale);

      // Create the test
      const response = await api.post('/assessments/tests', testData);
      const createdTest = response.data;

      console.log('✅ Test created successfully:', createdTest);

      setSaveStatus('success');
      
      // Show success and reset form
      setTimeout(() => {
        resetForm();
        setSaveStatus('');
        if (onBack) {
          onBack();
        }
      }, 2000);
    } catch (error) {
      console.error('❌ Error saving test:', error);
      setSaveStatus('error');
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.error || error.message || 'Failed to save test'
      }));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: '',
      grade: '',
      term: 'TERM_1',
      academicYear: new Date().getFullYear(),
      scaleId: '',
      testDate: new Date().toISOString().split('T')[0],
      totalMarks: 100,
      passMarks: 50,
      duration: 60,
      description: '',
      instructions: '',
      curriculum: 'CBC_AND_EXAM',
      weight: 100.0,
      status: 'DRAFT'
    });

    setErrors({});
  };

  const getSelectedScale = () => {
    if (!formData.scaleId) return null;
    return scales.find(s => s.id === formData.scaleId);
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
                        {scales.map(scale => (
                          <option key={scale.id} value={scale.id}>{scale.name}</option>
                        ))}
                      </>
                    )}
                  </select>
                  {!loadingScales && scales.length === 0 && (
                    <p className="text-amber-600 text-xs mt-1">No performance scales found. Please create scales in Performance Scales section.</p>
                  )}
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

export default SummativeTestForm;
