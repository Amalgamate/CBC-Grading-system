/**
 * Learner Admissions Page
 * Handle new learner admissions with multi-step form
 */

import React, { useState, useEffect } from 'react';
import { Save, X, ArrowRight, ArrowLeft, CheckCircle, User, Users as UsersIcon, Heart } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../../../hooks/useAuth';
import { configAPI } from '../../../services/api';

const AdmissionsPage = () => {
  const { showSuccess, showError } = useNotifications();
  const { user } = useAuth();
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
    firstName: '', middleName: '', lastName: '', gender: '', dob: '', birthCertNo: '',
    nationality: 'Kenyan', religion: '', admNo: '', grade: 'Grade 1', stream: 'A',
    dateOfAdmission: new Date().toISOString().split('T')[0], previousSchool: '', previousClass: '',
    guardian1Name: '', guardian1Relationship: 'Father', guardian1Phone: '', guardian1Email: '',
    guardian1IdNumber: '', guardian1Occupation: '', guardian1Employer: '', guardian1Address: '',
    guardian2Name: '', guardian2Relationship: 'Mother', guardian2Phone: '', guardian2Email: '',
    guardian2IdNumber: '', guardian2Occupation: '', bloodGroup: '', allergies: '', medicalConditions: '',
    doctorName: '', doctorPhone: '', transport: 'Walking', specialNeeds: '', photo: null
  };

  const [formData, setFormData] = useState(initialFormData);

  // Auto-restore draft on mount
  useEffect(() => {
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
  }, []);

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
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => { if (currentStep < 4) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.gender || !formData.dob) {
      showError('Please fill in all required fields'); setCurrentStep(1); return;
    }
    if (!formData.guardian1Name || !formData.guardian1Phone) {
      showError('Please fill in Guardian 1 information'); setCurrentStep(2); return;
    }
    showSuccess(`${formData.firstName} ${formData.lastName} admitted successfully!`);
    localStorage.removeItem('admission-form-draft');
    setFormData(initialFormData);
    setIsDraft(false);
    setLastSaved(null);
    setCurrentStep(1);
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Guardian Info', icon: UsersIcon },
    { number: 3, title: 'Medical Info', icon: Heart },
    { number: 4, title: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="max-w-5xl mx-auto px-2">
      <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Admission</h2>
          <p className="text-sm text-gray-500">Fill in the details below to admit a new student.</p>
        </div>
        {isDraft && (
          <div className="flex items-center gap-2 mb-1 px-3 py-1 bg-green-50 rounded-full border border-green-100 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">
              Draft Saved {lastSaved && lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}
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
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {isActive ? <StepIcon size={14} /> : step.number}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}`} />}
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
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder={`Enter ${field.label.toLowerCase()}`} required={field.required} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Gender <span className="text-red-500">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Birth Certificate No.</label>
                  <input type="text" name="birthCertNo" value={formData.birthCertNo} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Certificate number" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nationality</label>
                  <input type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Religion</label>
                  <input type="text" name="religion" value={formData.religion} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-bold text-gray-800 mb-4">Academic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Admission Number</label>
                    <input type="text" name="admNo" value={formData.admNo} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Auto-generated" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Grade <span className="text-red-500">*</span></label>
                    <select name="grade" value={formData.grade} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required>
                      {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Stream <span className="text-red-500">*</span></label>
                    <select name="stream" value={formData.stream} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required>
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
                    <input type="date" name="dateOfAdmission" value={formData.dateOfAdmission} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Previous School</label>
                    <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Previous Class</label>
                    <input type="text" name="previousClass" value={formData.previousClass} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="e.g., Grade 2" />
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
                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest">Primary Guardian</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="guardian1Name" value={formData.guardian1Name} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Relationship <span className="text-red-500">*</span></label>
                  <select name="guardian1Relationship" value={formData.guardian1Relationship} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required>
                    {['Father', 'Mother', 'Guardian', 'Grandparent', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Phone Number <span className="text-red-500">*</span></label>
                  <input type="tel" name="guardian1Phone" value={formData.guardian1Phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Guardian's phone number" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Email Address</label>
                  <input type="email" name="guardian1Email" value={formData.guardian1Email} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">ID Number</label>
                  <input type="text" name="guardian1IdNumber" value={formData.guardian1IdNumber} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Occupation</label>
                  <input type="text" name="guardian1Occupation" value={formData.guardian1Occupation} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Employer</label>
                  <input type="text" name="guardian1Employer" value={formData.guardian1Employer} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Residential Address</label>
                  <input type="text" name="guardian1Address" value={formData.guardian1Address} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Secondary Guardian</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Full Name</label>
                    <input type="text" name="guardian2Name" value={formData.guardian2Name} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Relationship</label>
                    <select name="guardian2Relationship" value={formData.guardian2Relationship} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      {['Mother', 'Father', 'Guardian', 'Grandparent', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Phone Number</label>
                    <input type="tel" name="guardian2Phone" value={formData.guardian2Phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Email Address</label>
                    <input type="email" name="guardian2Email" value={formData.guardian2Email} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">ID Number</label>
                    <input type="text" name="guardian2IdNumber" value={formData.guardian2IdNumber} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
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
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Transport Mode</label>
                  <select name="transport" value={formData.transport} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    {['Walking', 'Private', 'School Bus', 'Public Transport'].map(t => <option key={t} value={t}>{t === 'Private' ? 'Private Vehicle' : t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Known Allergies</label>
                <textarea name="allergies" value={formData.allergies} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="List any allergies" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Medical Conditions</label>
                <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="List any medical conditions" />
              </div>
              <div className="pt-4 mt-4 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Doctor Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Doctor Name</label>
                    <input type="text" name="doctorName" value={formData.doctorName} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Doctor Phone</label>
                    <input type="tel" name="doctorPhone" value={formData.doctorPhone} onChange={handleInputChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-tight mb-1">Special Needs</label>
                <textarea name="specialNeeds" value={formData.specialNeeds} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Any special needs" />
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
                  <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2 border-b border-blue-50 pb-1">Personal Info</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-semibold text-gray-800">{formData.firstName} {formData.middleName} {formData.lastName}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Gender:</span> <span className="font-semibold text-gray-800">{formData.gender}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">DOB:</span> <span className="font-semibold text-gray-800">{formData.dob}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Grade:</span> <span className="font-semibold text-gray-800">{formData.grade} - {formData.stream}</span></p>
                  </div>
                </div>
                <div className="border border-gray-100 rounded-md p-3 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2 border-b border-green-50 pb-1">Guardian Info</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-gray-500">Parent:</span> <span className="font-semibold text-gray-800">{formData.guardian1Name}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Phone:</span> <span className="font-semibold text-gray-800">{formData.guardian1Phone}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="font-semibold text-gray-800">{formData.guardian1Email || 'N/A'}</span></p>
                  </div>
                </div>
                <div className="border border-gray-100 rounded-md p-3 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2 border-b border-purple-50 pb-1">Medical & Extras</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-gray-500">Blood Group:</span> <span className="font-semibold text-gray-800">{formData.bloodGroup || 'N/A'}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Allergies:</span> <span className="font-semibold text-gray-800 truncate max-w-[150px]">{formData.allergies || 'None'}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Transport:</span> <span className="font-semibold text-gray-800">{formData.transport}</span></p>
                  </div>
                </div>
                <div className="border border-gray-100 rounded-md p-3 bg-gray-50/30">
                  <h4 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2 border-b border-orange-50 pb-1">Admin Info</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex justify-between"><span className="text-gray-500">Adm No:</span> <span className="font-semibold text-gray-800">{formData.admNo || 'Auto-generated'}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Adm Date:</span> <span className="font-semibold text-gray-800">{formData.dateOfAdmission}</span></p>
                    <p className="flex justify-between"><span className="text-gray-500">Prev School:</span> <span className="font-semibold text-gray-800 truncate max-w-[150px]">{formData.previousSchool || 'N/A'}</span></p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-md flex items-start gap-3 mt-4">
                <CheckCircle className="text-blue-600 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-blue-800 leading-relaxed font-medium">Please verify all information above before completing the admission. You can edit these details later in student management.</p>
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
                <button type="button" onClick={handleNext} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all shadow-sm text-sm font-bold">
                  Next Step <ArrowRight size={16} />
                </button>
              ) : (
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all shadow-md text-sm font-bold">
                  <Save size={18} /> Complete Admission
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
