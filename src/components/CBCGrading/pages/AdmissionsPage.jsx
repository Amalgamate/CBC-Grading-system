/**
 * Learner Admissions Page
 * Handle new learner admissions with multi-step form
 */

import React, { useState, useEffect } from 'react';
import { Save, X, ArrowRight, ArrowLeft, CheckCircle, User, Users as UsersIcon, Heart } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../../../hooks/useAuth';
import { configAPI } from '../../../services/api';

const AdmissionsPage = ({ onSave, onCancel, learner = null }) => {
  const { showSuccess, showError } = useNotifications();
  const { user } = useAuth();
  const isEdit = !!learner;
  const [currentStep, setCurrentStep] = useState(1);
  const [availableStreams, setAvailableStreams] = useState([]);
  const [isDraft, setIsDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Fetch streams
  useEffect(() => {
    const fetchStreams = async () => {
      if (user?.schoolId) {
        try {
          const resp = await configAPI.getStreamConfigs(user.schoolId);
          const arr = resp?.data || [];
          setAvailableStreams(arr.filter(s => s.active));
        } catch (error) {
          console.error('Failed to fetch streams:', error);
        }
      }
    };
    fetchStreams();
  }, [user?.schoolId]);

  const initialFormData = {
    firstName: '', middleName: '', lastName: '', gender: 'MALE', dateOfBirth: '', birthCertNo: '',
    nationality: 'Kenyan', religion: 'Christianity', admissionNumber: '', grade: 'GRADE_1', stream: 'A',
    dateOfAdmission: new Date().toISOString().split('T')[0], previousSchool: '', previousClass: '',
    guardianName: '', guardian1Relationship: 'Father', guardianPhone: '', guardianEmail: '',
    guardian1IdNumber: '', guardian1Occupation: '', guardian1Employer: '', guardian1Address: '',
    guardian2Name: '', guardian2Relationship: 'Mother', guardian2Phone: '', guardian2Email: '',
    guardian2IdNumber: '', guardian2Occupation: '', bloodGroup: '', allergies: '', medicalConditions: '',
    doctorName: '', doctorPhone: '', transport: 'Walking', specialNeeds: '', photo: null,
    emergencyContact: '', emergencyPhone: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  // Initialize form with learner data if editing
  useEffect(() => {
    if (learner) {
      setFormData({
        ...initialFormData,
        ...learner,
        dateOfBirth: learner.dateOfBirth ? (typeof learner.dateOfBirth === 'string' ? learner.dateOfBirth.split('T')[0] : new Date(learner.dateOfBirth).toISOString().split('T')[0]) : '',
        dateOfAdmission: learner.admissionDate ? (typeof learner.admissionDate === 'string' ? learner.admissionDate.split('T')[0] : new Date(learner.admissionDate).toISOString().split('T')[0]) : initialFormData.dateOfAdmission,
      });
    } else {
      const savedDraft = localStorage.getItem('admission-form-draft');
      if (savedDraft) {
        try {
          const parsedDraft = JSON.parse(savedDraft);
          setFormData(parsedDraft);
          setIsDraft(true);
          setLastSaved(new Date());
          showSuccess('Restored unsaved admission progress');
        } catch (error) {
          console.error('Failed to parse admission draft:', error);
        }
      }
    }
  }, [learner, initialFormData, showSuccess]);

  // Debounced auto-save to localStorage
  useEffect(() => {
    // Check if the form has been interacted with (not initial state)
    const isInitial = JSON.stringify(formData) === JSON.stringify(initialFormData);
    if (isInitial) return;

    const timeoutId = setTimeout(() => {
      localStorage.setItem('admission-form-draft', JSON.stringify(formData));
      setIsDraft(true);
      setLastSaved(new Date());
      console.log('Admission draft saved.');
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData, initialFormData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => { if (currentStep < 4) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.gender || !formData.dateOfBirth) {
      showError('Please fill in all required fields'); setCurrentStep(1); return;
    }
    if (!formData.guardianName || !formData.guardianPhone) {
      showError('Please fill in Guardian 1 information'); setCurrentStep(2); return;
    }

    // Success logic managed by onSave handler
    if (onSave) {
      const result = await onSave(formData);
      if (result) {
        localStorage.removeItem('admission-form-draft');
        if (!isEdit) {
          setFormData(initialFormData);
          setIsDraft(false);
          setLastSaved(null);
          setCurrentStep(1);
        }
        if (onCancel) onCancel(); // Go back to list
      }
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Guardian Info', icon: UsersIcon },
    { number: 3, title: 'Medical Info', icon: Heart },
    { number: 4, title: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="space-y-6 px-2">
      <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Student Details' : 'Student Admission'}</h2>
          <p className="text-sm text-gray-500">{isEdit ? 'Update student records below.' : 'Fill in the details below to admit a new student.'}</p>
        </div>
        {isDraft && !isEdit && (
          <div className="flex items-center gap-2 mb-1 px-3 py-1 bg-green-50 rounded-full border border-green-100 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">
              Draft Saved {lastSaved && lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all text-sm font-medium border border-gray-200"
        >
          <ArrowLeft size={16} /> Back to List
        </button>
      </div>

      <div className="space-y-6">
        {/* Progress Steps - More Compact */}
        <div className="flex items-center justify-between bg-gray-50/50 rounded-lg p-3 border border-gray-100">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep >= step.number;
            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${isActive ? 'bg-brand-purple text-white shadow-md shadow-brand-purple/20' : 'bg-gray-200 text-gray-500'}`}>
                    {isActive ? <StepIcon size={14} /> : step.number}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-brand-purple' : 'text-gray-400'}`}>{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${currentStep > step.number ? 'bg-brand-purple' : 'bg-gray-200'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{ name: 'firstName', label: 'First Name', required: true },
                { name: 'middleName', label: 'Middle Name', required: false },
                { name: 'lastName', label: 'Last Name', required: true }].map(field => (
                  <div key={field.name}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input type="text" name={field.name} value={formData[field.name]} onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple transition-all"
                      placeholder={`Enter ${field.label.toLowerCase()}`} required={field.required} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Gender <span className="text-red-500">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" required>
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Birth Certificate No.</label>
                  <input type="text" name="birthCertNo" value={formData.birthCertNo} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" placeholder="Certificate number" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
                  <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Religion</label>
                  <input type="text" name="religion" value={formData.religion} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple" />
                </div>
              </div>
              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Academic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Admission Number</label>
                    <input type="text" name="admissionNumber" value={formData.admissionNumber} onChange={handleInputChange} disabled={isEdit} className={`w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple ${isEdit ? 'bg-gray-100 cursor-not-allowed' : ''}`} placeholder="Auto-generated" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Grade <span className="text-red-500">*</span></label>
                    <select name="grade" value={formData.grade} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" required>
                      {[
                        { val: 'PP1', label: 'PP1' },
                        { val: 'PP2', label: 'PP2' },
                        { val: 'GRADE_1', label: 'Grade 1' },
                        { val: 'GRADE_2', label: 'Grade 2' },
                        { val: 'GRADE_3', label: 'Grade 3' },
                        { val: 'GRADE_4', label: 'Grade 4' },
                        { val: 'GRADE_5', label: 'Grade 5' },
                        { val: 'GRADE_6', label: 'Grade 6' },
                        { val: 'GRADE_7', label: 'Grade 7' }
                      ].map(g => <option key={g.val} value={g.val}>{g.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Stream <span className="text-red-500">*</span></label>
                    <select name="stream" value={formData.stream} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" required>
                      <option value="">Select Stream</option>
                      {availableStreams.length > 0 ? (
                        availableStreams.map(s => (
                          <option key={s.id} value={s.name}>{s.name}</option>
                        ))
                      ) : (
                        // Fallback if no streams configured
                        ['A', 'B', 'C', 'Red', 'Blue', 'Green'].map(s => <option key={s} value={s}>{s}</option>)
                      )}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Date of Admission</label>
                    <input type="date" name="dateOfAdmission" value={formData.dateOfAdmission} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Previous School</label>
                    <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Previous Class</label>
                    <input type="text" name="previousClass" value={formData.previousClass} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" placeholder="e.g., Grade 2" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Guardian Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Guardian Information</h3>
              <div className="border-b border-gray-100 pb-4 mb-4">
                <h4 className="text-sm font-black text-brand-purple uppercase tracking-widest">Primary Guardian</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="guardianName" value={formData.guardianName} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Relationship <span className="text-red-500">*</span></label>
                  <select name="guardian1Relationship" value={formData.guardian1Relationship} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" required>
                    {['Father', 'Mother', 'Guardian', 'Grandparent', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="guardianPhone" value={formData.guardianPhone} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" placeholder="Guardian's phone number" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Email Address</label>
                  <input type="email" name="guardianEmail" value={formData.guardianEmail} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">ID Number</label>
                  <input type="text" name="guardian1IdNumber" value={formData.guardian1IdNumber} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Occupation</label>
                  <input type="text" name="guardian1Occupation" value={formData.guardian1Occupation} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Employer</label>
                  <input type="text" name="guardian1Employer" value={formData.guardian1Employer} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Residential Address</label>
                  <input type="text" name="guardian1Address" value={formData.guardian1Address} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Secondary Guardian</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Full Name</label>
                    <input type="text" name="guardian2Name" value={formData.guardian2Name} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Relationship</label>
                    <select name="guardian2Relationship" value={formData.guardian2Relationship} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple">
                      {['Mother', 'Father', 'Guardian', 'Grandparent', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Phone Number</label>
                    <input type="tel" name="guardian2Phone" value={formData.guardian2Phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Email Address</label>
                    <input type="email" name="guardian2Email" value={formData.guardian2Email} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">ID Number</label>
                    <input type="text" name="guardian2IdNumber" value={formData.guardian2IdNumber} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Medical Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Medical Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple">
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Transport Mode</label>
                  <select name="transport" value={formData.transport} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple">
                    {['Walking', 'Private', 'School Bus', 'Public Transport'].map(t => <option key={t} value={t}>{t === 'Private' ? 'Private Vehicle' : t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Known Allergies</label>
                <textarea name="allergies" value={formData.allergies} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" placeholder="List any allergies" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Medical Conditions</label>
                <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" placeholder="List any medical conditions" />
              </div>
              <div className="pt-4 mt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Doctor Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Doctor Name</label>
                    <input type="text" name="doctorName" value={formData.doctorName} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Doctor Phone</label>
                    <input type="tel" name="doctorPhone" value={formData.doctorPhone} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Special Needs</label>
                <textarea name="specialNeeds" value={formData.specialNeeds} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-brand-purple focus:ring-1 focus:ring-brand-purple" placeholder="Any special needs" />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-2 mb-4">
                <h3 className="text-lg font-bold text-gray-800">Review Admission Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-md p-3 bg-gray-50/30">
                  <h4 className="text-xs font-black text-brand-purple uppercase tracking-widest mb-2 border-b border-brand-purple/10 pb-1">Personal Info</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-800">{formData.firstName} {formData.middleName} {formData.lastName}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Gender:</span> <span className="font-semibold text-gray-800">{formData.gender === 'MALE' ? 'Male' : 'Female'}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">DOB:</span> <span className="font-semibold text-gray-800">{formData.dateOfBirth}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Grade:</span> <span className="font-semibold text-gray-800">{formData.grade?.replace('GRADE_', 'Grade ')} - {formData.stream}</span></p>
                  </div>
                </div>
                <div className="border border-gray-100 rounded-md p-3 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2 border-b border-green-50 pb-1">Guardian Info</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-gray-500">Parent:</span> <span className="font-semibold text-gray-800">{formData.guardianName}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-semibold text-gray-800">{formData.guardianPhone}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-semibold text-gray-800">{formData.guardianEmail || 'N/A'}</span></p>
                  </div>
                </div>
                <div className="border border-gray-100 rounded-md p-3 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-brand-purple uppercase tracking-widest mb-2 border-b border-brand-purple/10 pb-1">Medical & Extras</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-gray-500">Blood Group:</span> <span className="font-semibold text-gray-800">{formData.bloodGroup || 'N/A'}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Allergies:</span> <span className="font-semibold text-gray-800 truncate max-w-[150px]">{formData.allergies || 'None'}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Transport:</span> <span className="font-semibold text-gray-800">{formData.transport}</span></p>
                  </div>
                </div>
                <div className="border border-gray-100 rounded-md p-3 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2 border-b border-orange-50 pb-1">Admin Info</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-gray-500">Adm No:</span> <span className="font-semibold text-gray-800">{formData.admissionNumber || 'Auto-generated'}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Adm Date:</span> <span className="font-semibold text-gray-800">{formData.dateOfAdmission}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Prev School:</span> <span className="font-semibold text-gray-800 truncate max-w-[150px]">{formData.previousSchool || 'N/A'}</span></p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-brand-purple/5 border border-brand-purple/10 rounded-md flex items-start gap-3 mt-4">
                <CheckCircle className="text-brand-purple shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-brand-purple leading-relaxed font-bold">Please verify all information above before completing the admission. You can edit these details later in student management.</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            <button type="button" onClick={handlePrevious} disabled={currentStep === 1} className={`flex items-center gap-2 px-5 py-2.5 rounded-md transition-all text-sm font-bold ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <ArrowLeft size={16} /> Previous
            </button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => { setFormData(initialFormData); setCurrentStep(1); }} className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-all text-sm font-bold border border-gray-200">
                <X size={16} /> Clear
              </button>
              {currentStep < 4 ? (
                <button type="button" onClick={handleNext} className="flex items-center gap-2 px-5 py-2.5 bg-brand-teal text-white rounded-md hover:bg-brand-teal/90 transition-all shadow-sm text-sm font-bold">
                  Next Step <ArrowRight size={16} />
                </button>
              ) : (
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-brand-teal text-white rounded-md hover:bg-brand-teal/90 transition-all shadow-md text-sm font-bold">
                  <Save size={18} /> {isEdit ? 'Update Student' : 'Complete Admission'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmissionsPage;
