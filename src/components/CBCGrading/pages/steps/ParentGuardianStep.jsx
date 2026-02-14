/**
 * Parent/Guardian Selection Step
 * Intelligent hierarchical parent selection: Father → Mother → Guardian
 * Minimalist UI with color-coded sections
 */

import React, { useState, useMemo } from 'react';
import { AlertCircle, Phone, Mail, Users } from 'lucide-react';

// Guardian type configuration
const GUARDIAN_CONFIG = {
  FATHER: {
    label: "👨 Father",
    title: "Father's Information",
    description: "Father is the primary guardian",
    warning: null,
    nameField: 'fatherName',
    phoneField: 'fatherPhone',
    emailField: 'fatherEmail',
    deceasedField: 'fatherDeceased',
    showEmail: true,
    showRelation: false,
    color: 'blue',
    borderColor: 'border-blue-300',
    bgColor: 'bg-blue-50',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  MOTHER: {
    label: "👩 Mother",
    title: "Mother's Information",
    description: "Mother is the primary guardian",
    warning: "⚠️ Father is marked as deceased",
    nameField: 'motherName',
    phoneField: 'motherPhone',
    emailField: 'motherEmail',
    deceasedField: 'motherDeceased',
    showEmail: true,
    showRelation: false,
    color: 'amber',
    borderColor: 'border-amber-300',
    bgColor: 'bg-amber-50',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  GUARDIAN: {
    label: "👤 Guardian",
    title: "Guardian Information",
    description: "Guardian is the primary caretaker",
    warning: "⚠️ Both parents are marked as deceased",
    nameField: 'guardianName',
    phoneField: 'guardianPhone',
    emailField: 'guardianEmail',
    deceasedField: null,
    showEmail: false,
    showRelation: true,
    relationshipOptions: ['Aunt', 'Uncle', 'Grandfather', 'Grandmother', 'Sibling', 'Cousin', 'Other'],
    color: 'rose',
    borderColor: 'border-rose-300',
    bgColor: 'bg-rose-50',
    badgeColor: 'bg-rose-100 text-rose-800'
  }
};

const ParentGuardianStep = ({ formData = {}, onChange }) => {
  // Determine which guardian should be selected by default
  const defaultGuardianType = useMemo(() => {
    // Default to Father unless marked deceased
    if (!formData.fatherDeceased) {
      return 'FATHER';
    } else if (!formData.motherDeceased) {
      return 'MOTHER';
    } else {
      return 'GUARDIAN';
    }
  }, [formData.fatherDeceased, formData.motherDeceased]);

  const [selectedGuardian, setSelectedGuardian] = useState(defaultGuardianType);
  const config = GUARDIAN_CONFIG[selectedGuardian];

  // Check if either parent is marked as deceased
  const isEitherParentDeceased = formData.fatherDeceased || formData.motherDeceased;

  // Handle guardian type change
  const handleGuardianChange = (guardianType) => {
    setSelectedGuardian(guardianType);
  };

  // Handle form field changes
  const handleFieldChange = (fieldName, value) => {
    onChange({
      ...formData,
      [fieldName]: value
    });
  };

  // Handle deceased checkbox
  const handleDeceasedChange = (deceasedField, isDeceased) => {
    onChange({
      ...formData,
      [deceasedField]: isDeceased
    });
  };

  return (
    <div className="space-y-3 max-w-2xl mx-auto">
      {/* Header */}
      <div className="pb-2">
        <h3 className="text-lg font-bold text-gray-900">Parent/Guardian Information</h3>
        <p className="text-xs text-gray-600 mt-0.5">Select primary guardian and provide contact</p>
      </div>

      {/* Guardian Type Selection - Radio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {Object.entries(GUARDIAN_CONFIG).map(([type, cfg]) => {
          const isGuardianDisabled = type === 'GUARDIAN' && !isEitherParentDeceased;
          
          return (
            <label
              key={type}
              className={`flex items-start gap-2 p-3 border-2 rounded-lg transition-all ${
                isGuardianDisabled
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  : selectedGuardian === type
                  ? `border-${cfg.color}-500 ${cfg.bgColor} cursor-pointer`
                  : 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer'
              }`}
            >
              <input
                type="radio"
                value={type}
                checked={selectedGuardian === type}
                onChange={() => !isGuardianDisabled && handleGuardianChange(type)}
                disabled={isGuardianDisabled}
                className="w-4 h-4 mt-0.5 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{cfg.label}</p>
                <p className={`text-xs ${isGuardianDisabled ? 'text-gray-500' : 'text-gray-600'}`}>
                  {type === 'GUARDIAN' && !isEitherParentDeceased ? 'Enabled when a parent is marked deceased' : cfg.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Conditional Warning Banner */}
      {config.warning && (
        <div className="flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800 font-medium">{config.warning}</p>
        </div>
      )}

      {/* Guardian Information Form Section */}
      <div className={`border-l-4 p-4 rounded-lg space-y-3 ${config.bgColor} ${config.borderColor}`}>
        <div className="flex items-center gap-2">
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${config.badgeColor}`}>
            {config.label}
          </div>
          <h4 className="text-base font-bold text-gray-900">{config.title}</h4>
        </div>

        {/* Full Name Field */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-tight mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData[config.nameField] || ''}
            onChange={(e) => handleFieldChange(config.nameField, e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder={`Enter ${config.label.replace(/📱|👨|👩|👤/g, '').trim().toLowerCase()}'s full name`}
            required
          />
        </div>

        {/* Phone Number Field */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-tight mb-1">
            <Phone size={13} className="inline mr-0.5" /> Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={formData[config.phoneField] || ''}
            onChange={(e) => handleFieldChange(config.phoneField, e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            placeholder="0712345678 or +254712345678"
          />
          <p className="text-xs text-gray-500 mt-0.5">Used for SMS & broadcasts</p>
        </div>

        {/* Email Field (if applicable) */}
        {config.showEmail && (
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-tight mb-1">
              <Mail size={13} className="inline mr-0.5" /> Email (Optional)
            </label>
            <input
              type="email"
              value={formData[config.emailField] || ''}
              onChange={(e) => handleFieldChange(config.emailField, e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="parent@example.com"
            />
          </div>
        )}

        {/* Relationship Field (for Guardian only) */}
        {config.showRelation && (
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-tight mb-1">
              <Users size={13} className="inline mr-0.5" /> Relationship <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.guardianRelation || ''}
              onChange={(e) => handleFieldChange('guardianRelation', e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            >
              <option value="">Select relationship</option>
              {config.relationshipOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Deceased Checkbox (if applicable) */}
        {config.deceasedField && (
          <div className="border-t pt-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData[config.deceasedField] || false}
                onChange={(e) => handleDeceasedChange(config.deceasedField, e.target.checked)}
                className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-2 focus:ring-red-500"
              />
              <span className="text-xs font-medium text-gray-700">
                Mark as deceased
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Helpful Note - Compact */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
        <p className="text-xs text-blue-800">
          <strong>ℹ️</strong> Phone is used for SMS & broadcasts. System auto-switches to next contact if parent is deceased.
        </p>
      </div>
    </div>
  );
};

export default ParentGuardianStep;
