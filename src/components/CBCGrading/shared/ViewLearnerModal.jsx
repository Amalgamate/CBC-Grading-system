/**
 * View Learner Modal
 * Display detailed learner information
 */

import React from 'react';
import { X, User, Calendar, MapPin, Phone, Mail, Users, Heart, AlertCircle } from 'lucide-react';

const ViewLearnerModal = ({ show, onClose, learner }) => {
  if (!show || !learner) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Student Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Profile Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {learner.firstName?.[0]}{learner.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {learner.firstName} {learner.middleName} {learner.lastName}
                  </h3>
                  <p className="text-blue-600 font-semibold">
                    {learner.admissionNumber || learner.admNo}
                  </p>
                  <p className="text-sm text-gray-600">
                    {learner.grade} {learner.stream} • {learner.gender}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="text-purple-600" size={20} />
                <h3 className="text-lg font-bold text-purple-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Date of Birth</label>
                  <p className="text-gray-800">{formatDate(learner.dateOfBirth)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Age</label>
                  <p className="text-gray-800">{calculateAge(learner.dateOfBirth)} years</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Gender</label>
                  <p className="text-gray-800">{learner.gender}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Status</label>
                  <p className="text-gray-800">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      learner.status === 'ACTIVE' || learner.status === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {learner.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-blue-600" size={20} />
                <h3 className="text-lg font-bold text-blue-900">Academic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Admission Number</label>
                  <p className="text-gray-800">{learner.admissionNumber || learner.admNo}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Date of Admission</label>
                  <p className="text-gray-800">{formatDate(learner.dateOfAdmission)}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Grade</label>
                  <p className="text-gray-800">{learner.grade}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Stream</label>
                  <p className="text-gray-800">{learner.stream}</p>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-green-600" size={20} />
                <h3 className="text-lg font-bold text-green-900">Guardian Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Primary Guardian</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Name</label>
                      <p className="text-gray-800">{learner.guardianName || learner.guardian1Name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Phone</label>
                      <p className="text-gray-800">{learner.guardianPhone || learner.guardian1Phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {learner.emergencyContact && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Name</label>
                        <p className="text-gray-800">{learner.emergencyContact}</p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Phone</label>
                        <p className="text-gray-800">{learner.emergencyPhone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-orange-600" size={20} />
                <h3 className="text-lg font-bold text-orange-900">Location Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">County</label>
                  <p className="text-gray-800">{learner.county || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Address</label>
                  <p className="text-gray-800">{learner.address || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            {(learner.medicalConditions || learner.allergies) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="text-red-600" size={20} />
                  <h3 className="text-lg font-bold text-red-900">Medical Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {learner.medicalConditions && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Medical Conditions</label>
                      <p className="text-gray-800">{learner.medicalConditions}</p>
                    </div>
                  )}
                  {learner.allergies && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Allergies</label>
                      <p className="text-gray-800">{learner.allergies}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewLearnerModal;
