/**
 * Add/Edit Parent Modal
 * Modal for adding or editing parent/guardian information
 */

import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, MapPin, Briefcase, Users } from 'lucide-react';

const AddEditParentModal = ({ show, onClose, onSave, parent = null, learners = [] }) => {
  const isEdit = parent !== null;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: 'Father',
    occupation: '',
    employer: '',
    idNumber: '',
    county: 'Nairobi',
    subcounty: '',
    address: '',
    learnerIds: []
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (parent) {
      setFormData(parent);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        relationship: 'Father',
        occupation: '',
        employer: '',
        idNumber: '',
        county: 'Nairobi',
        subcounty: '',
        address: '',
        learnerIds: []
      });
    }
  }, [parent, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLearnerToggle = (learnerId) => {
    setFormData(prev => ({
      ...prev,
      learnerIds: prev.learnerIds.includes(learnerId)
        ? prev.learnerIds.filter(id => id !== learnerId)
        : [...prev.learnerIds, learnerId]
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    const parentData = {
      ...formData,
      id: parent?.id || Date.now()
    };
    
    onSave(parentData);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            {isEdit ? 'Edit Parent/Guardian' : 'Add Parent/Guardian'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="text-purple-600" size={20} />
                <h3 className="text-lg font-bold text-purple-900">Personal Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Relationship
                  </label>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    ID Number
                  </label>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="ID Number"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="text-blue-600" size={20} />
                <h3 className="text-lg font-bold text-blue-900">Contact Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+254712345678"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Employment Information */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="text-green-600" size={20} />
                <h3 className="text-lg font-bold text-green-900">Employment Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    name="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Teacher, Engineer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employer
                  </label>
                  <input
                    type="text"
                    name="employer"
                    value={formData.employer}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Company/Organization"
                  />
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="text-orange-600" size={20} />
                <h3 className="text-lg font-bold text-orange-900">Location Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    County
                  </label>
                  <input
                    type="text"
                    name="county"
                    value={formData.county}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Nairobi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sub-County
                  </label>
                  <input
                    type="text"
                    name="subcounty"
                    value={formData.subcounty}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Westlands"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Street address"
                  />
                </div>
              </div>
            </div>

            {/* Link to Learners */}
            {learners.length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="text-indigo-600" size={20} />
                  <h3 className="text-lg font-bold text-indigo-900">Linked Learners</h3>
                </div>
                
                <div className="space-y-2">
                  {learners.map(learner => (
                    <label key={learner.id} className="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-indigo-50 transition">
                      <input
                        type="checkbox"
                        checked={formData.learnerIds.includes(learner.id)}
                        onChange={() => handleLearnerToggle(learner.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-2xl">{learner.avatar}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{learner.firstName} {learner.lastName}</p>
                        <p className="text-xs text-gray-500">{learner.admNo} - {learner.grade} {learner.stream}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-semibold shadow-md"
          >
            <Save size={18} />
            {isEdit ? 'Update Parent' : 'Add Parent'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEditParentModal;
