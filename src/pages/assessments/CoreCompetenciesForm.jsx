import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';

const CoreCompetenciesForm = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    grade: '',
    term: '',
    academicYear: '',
    assessmentDate: new Date().toISOString().split('T')[0],
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
    overallComment: '',
    nextSteps: '',
    teacherName: '',
    teacherSignature: ''
  });

  const [errors, setErrors] = useState({});
  const [saveStatus, setSaveStatus] = useState('');

  const ratingScale = [
    { value: 'EE', label: 'Exceeds Expectations', color: 'bg-green-100 border-green-300' },
    { value: 'ME', label: 'Meets Expectations', color: 'bg-blue-100 border-blue-300' },
    { value: 'AP', label: 'Approaching Expectations', color: 'bg-yellow-100 border-yellow-300' },
    { value: 'BE', label: 'Below Expectations', color: 'bg-red-100 border-red-300' }
  ];

  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
  const terms = ['Term 1', 'Term 2', 'Term 3'];

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

  const handleCompetencyChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      competencies: prev.competencies.map(comp =>
        comp.id === id ? { ...comp, [field]: value } : comp
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.studentId) newErrors.studentId = 'Student ID is required';
    if (!formData.studentName) newErrors.studentName = 'Student name is required';
    if (!formData.grade) newErrors.grade = 'Grade is required';
    if (!formData.term) newErrors.term = 'Term is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic year is required';
    if (!formData.teacherName) newErrors.teacherName = 'Teacher name is required';

    // Check if at least one competency is rated
    const hasRatings = formData.competencies.some(comp => comp.rating);
    if (!hasRatings) {
      newErrors.competencies = 'Please rate at least one competency';
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

    try {
      setSaveStatus('saving');
      // TODO: Implement API call to save data
      console.log('Saving form data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving form:', error);
      setSaveStatus('error');
    }
  };

  const getRatingColor = (rating) => {
    const scale = ratingScale.find(r => r.value === rating);
    return scale ? scale.color : '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Core Competencies Assessment Form
          </h1>
          <p className="text-gray-600">
            Assess student development across key CBC competencies
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student ID *
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => handleInputChange('studentId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.studentId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter student ID"
                />
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => handleInputChange('studentName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.studentName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter student name"
                />
                {errors.studentName && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.grade ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
                {errors.grade && (
                  <p className="mt-1 text-sm text-red-600">{errors.grade}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term *
                </label>
                <select
                  value={formData.term}
                  onChange={(e) => handleInputChange('term', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.term ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select term</option>
                  {terms.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
                {errors.term && (
                  <p className="mt-1 text-sm text-red-600">{errors.term}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Year *
                </label>
                <input
                  type="text"
                  value={formData.academicYear}
                  onChange={(e) => handleInputChange('academicYear', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.academicYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 2024-2025"
                />
                {errors.academicYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.academicYear}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Date
                </label>
                <input
                  type="date"
                  value={formData.assessmentDate}
                  onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Rating Scale Legend */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Rating Scale</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {ratingScale.map(rating => (
                <div
                  key={rating.value}
                  className={`p-3 border-2 rounded-lg ${rating.color}`}
                >
                  <div className="font-semibold text-gray-900">{rating.value}</div>
                  <div className="text-sm text-gray-700">{rating.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Competencies Assessment */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Competency Assessment</h2>
            {errors.competencies && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center text-red-800">
                <AlertCircle className="w-5 h-5 mr-2" />
                {errors.competencies}
              </div>
            )}
            
            <div className="space-y-6">
              {formData.competencies.map((competency, index) => (
                <div key={competency.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {index + 1}. {competency.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{competency.descriptor}</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ratingScale.map(rating => (
                          <button
                            key={rating.value}
                            type="button"
                            onClick={() => handleCompetencyChange(competency.id, 'rating', rating.value)}
                            className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                              competency.rating === rating.value
                                ? rating.color + ' ring-2 ring-blue-500'
                                : 'bg-white border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {rating.value}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Evidence / Examples
                      </label>
                      <textarea
                        value={competency.evidence}
                        onChange={(e) => handleCompetencyChange(competency.id, 'evidence', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Provide specific examples of student work or behavior..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teacher Comment
                      </label>
                      <textarea
                        value={competency.teacherComment}
                        onChange={(e) => handleCompetencyChange(competency.id, 'teacherComment', e.target.value)}
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Additional observations or recommendations..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Overall Summary</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Comment
                </label>
                <textarea
                  value={formData.overallComment}
                  onChange={(e) => handleInputChange('overallComment', e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide an overall summary of the student's competency development..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Steps / Recommendations
                </label>
                <textarea
                  value={formData.nextSteps}
                  onChange={(e) => handleInputChange('nextSteps', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Outline areas for growth and recommended next steps..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher Name *
                  </label>
                  <input
                    type="text"
                    value={formData.teacherName}
                    onChange={(e) => handleInputChange('teacherName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.teacherName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter teacher name"
                  />
                  {errors.teacherName && (
                    <p className="mt-1 text-sm text-red-600">{errors.teacherName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher Signature
                  </label>
                  <input
                    type="text"
                    value={formData.teacherSignature}
                    onChange={(e) => handleInputChange('teacherSignature', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Type your name to sign"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2">
                {saveStatus === 'success' && (
                  <div className="text-green-600 font-medium">✓ Saved successfully</div>
                )}
                {saveStatus === 'error' && (
                  <div className="text-red-600 font-medium">✗ Please fix errors and try again</div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveStatus === 'saving'}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:bg-blue-400"
                >
                  <Save className="w-4 h-4" />
                  {saveStatus === 'saving' ? 'Saving...' : 'Save Assessment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CoreCompetenciesForm;
