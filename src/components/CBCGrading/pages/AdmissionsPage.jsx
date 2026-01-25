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
    setFormData(initialFormData);
    setCurrentStep(1);
  };

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Guardian Info', icon: UsersIcon },
    { number: 3, title: 'Medical Info', icon: Heart },
    { number: 4, title: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="space-y-6">

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full ${currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    <StepIcon size={24} />
                  </div>
                  <div className="ml-3">
                    <p className={`font-semibold ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'}`}>Step {step.number}</p>
                    <p className="text-sm text-gray-600">{step.title}</p>
                  </div>
                </div>
                {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}`} />}
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
                {[{name: 'firstName', label: 'First Name', required: true}, 
                  {name: 'middleName', label: 'Middle Name', required: false},
                  {name: 'lastName', label: 'Last Name', required: true}].map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input type="text" name={field.name} value={formData[field.name]} onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter ${field.label.toLowerCase()}`} required={field.required} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Birth Certificate No.</label>
                  <input type="text" name="birthCertNo" value={formData.birthCertNo} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Certificate number" />
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Admission Number</label>
                    <input type="text" name="admNo" value={formData.admNo} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Auto-generated" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grade <span className="text-red-500">*</span></label>
                    <select name="grade" value={formData.grade} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                      {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stream <span className="text-red-500">*</span></label>
                    <select name="stream" value={formData.stream} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date of Admission</label>
                    <input type="date" name="dateOfAdmission" value={formData.dateOfAdmission} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Previous School</label>
                    <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Previous Class</label>
                    <input type="text" name="previousClass" value={formData.previousClass} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="e.g., Grade 2" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Guardian Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Guardian Information</h3>
              <div className="border-b pb-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Primary Guardian</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" name="guardian1Name" value={formData.guardian1Name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship <span className="text-red-500">*</span></label>
                    <select name="guardian1Relationship" value={formData.guardian1Relationship} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                      {['Father', 'Mother', 'Guardian', 'Grandparent', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                    <input type="tel" name="guardian1Phone" value={formData.guardian1Phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="+254712345678" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input type="email" name="guardian1Email" value={formData.guardian1Email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ID Number</label>
                    <input type="text" name="guardian1IdNumber" value={formData.guardian1IdNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Occupation</label>
                    <input type="text" name="guardian1Occupation" value={formData.guardian1Occupation} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employer</label>
                    <input type="text" name="guardian1Employer" value={formData.guardian1Employer} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Residential Address</label>
                    <input type="text" name="guardian1Address" value={formData.guardian1Address} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Secondary Guardian (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input type="text" name="guardian2Name" value={formData.guardian2Name} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Relationship</label>
                    <select name="guardian2Relationship" value={formData.guardian2Relationship} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      {['Mother', 'Father', 'Guardian', 'Grandparent', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <input type="tel" name="guardian2Phone" value={formData.guardian2Phone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input type="email" name="guardian2Email" value={formData.guardian2Email} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ID Number</label>
                    <input type="text" name="guardian2IdNumber" value={formData.guardian2IdNumber} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Occupation</label>
                  <input type="text" name="guardian2Occupation" value={formData.guardian2Occupation} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group</label>
                  <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Transport Mode</label>
                  <select name="transport" value={formData.transport} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    {['Walking', 'Private', 'School Bus', 'Public Transport'].map(t => <option key={t} value={t}>{t === 'Private' ? 'Private Vehicle' : t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Known Allergies</label>
                <textarea name="allergies" value={formData.allergies} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="List any allergies" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Medical Conditions</label>
                <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="List any medical conditions" />
              </div>
              <div className="border-t pt-6 mt-6">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">Doctor Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor Name</label>
                    <input type="text" name="doctorName" value={formData.doctorName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor Phone</label>
                    <input type="tel" name="doctorPhone" value={formData.doctorPhone} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Special Needs</label>
                <textarea name="specialNeeds" value={formData.specialNeeds} onChange={handleInputChange} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Any special needs" />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Review Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-3">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Name:</span> {formData.firstName} {formData.middleName} {formData.lastName}</p>
                    <p><span className="font-semibold">Gender:</span> {formData.gender}</p>
                    <p><span className="font-semibold">DOB:</span> {formData.dob}</p>
                    <p><span className="font-semibold">Grade:</span> {formData.grade} - Stream {formData.stream}</p>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-3">Guardian Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Name:</span> {formData.guardian1Name}</p>
                    <p><span className="font-semibold">Phone:</span> {formData.guardian1Phone}</p>
                    <p><span className="font-semibold">Email:</span> {formData.guardian1Email || 'N/A'}</p>
                  </div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-bold text-purple-800 mb-3">Medical Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Blood Group:</span> {formData.bloodGroup || 'N/A'}</p>
                    <p><span className="font-semibold">Allergies:</span> {formData.allergies || 'None'}</p>
                    <p><span className="font-semibold">Transport:</span> {formData.transport}</p>
                  </div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-bold text-orange-800 mb-3">Academic Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Admission No:</span> {formData.admNo || 'Auto-generated'}</p>
                    <p><span className="font-semibold">Admission Date:</span> {formData.dateOfAdmission}</p>
                    <p><span className="font-semibold">Previous School:</span> {formData.previousSchool || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <button type="button" onClick={handlePrevious} disabled={currentStep === 1} className={`flex items-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${currentStep === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
              <ArrowLeft size={20} /> Previous
            </button>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => { setFormData(initialFormData); setCurrentStep(1); }} className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">
                <X size={20} /> Clear Form
              </button>
              {currentStep < 4 ? (
                <button type="button" onClick={handleNext} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                  Next <ArrowRight size={20} />
                </button>
              ) : (
                <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
                  <Save size={20} /> Submit Admission
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
