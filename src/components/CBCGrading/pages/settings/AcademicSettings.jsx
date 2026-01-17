/**
 * Academic Settings Page
 */

import React, { useState } from 'react';
import { Calendar, Save, BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../../shared/PageHeader';
import { useNotifications } from '../../hooks/useNotifications';

const AcademicSettings = () => {
  const { showSuccess } = useNotifications();
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' or 'learning-areas'
  
  const [settings, setSettings] = useState({
    academicYear: '2026',
    term1Start: '2026-01-06',
    term1End: '2026-03-31',
    term2Start: '2026-05-05',
    term2End: '2026-08-07',
    term3Start: '2026-09-07',
    term3End: '2026-11-20'
  });

  const [learningAreas, setLearningAreas] = useState([
    { id: 1, name: 'Mathematics Activities', shortName: 'Math', gradeLevel: 'Lower Primary', color: '#3b82f6', icon: '🔢' },
    { id: 2, name: 'English Activities', shortName: 'English', gradeLevel: 'Lower Primary', color: '#10b981', icon: '📚' },
    { id: 3, name: 'Kiswahili Activities', shortName: 'Kiswahili', gradeLevel: 'Lower Primary', color: '#f59e0b', icon: '🗣️' },
    { id: 4, name: 'Environmental Activities', shortName: 'Environmental', gradeLevel: 'Lower Primary', color: '#22c55e', icon: '🌱' },
    { id: 5, name: 'Religious Education', shortName: 'CRE', gradeLevel: 'Lower Primary', color: '#8b5cf6', icon: '✝️' },
    { id: 6, name: 'Creative Arts', shortName: 'Arts', gradeLevel: 'Lower Primary', color: '#ec4899', icon: '🎨' },
    { id: 7, name: 'Physical Education', shortName: 'PE', gradeLevel: 'Lower Primary', color: '#f97316', icon: '⚽' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    gradeLevel: 'Lower Primary',
    color: '#3b82f6',
    icon: '📚'
  });

  const handleAddEdit = () => {
    if (!formData.name || !formData.shortName) {
      showSuccess('Please fill all required fields');
      return;
    }

    if (editingArea) {
      // Edit existing
      setLearningAreas(learningAreas.map(area => 
        area.id === editingArea.id ? { ...area, ...formData } : area
      ));
      showSuccess('Learning area updated successfully!');
    } else {
      // Add new
      setLearningAreas([...learningAreas, { id: Date.now(), ...formData }]);
      showSuccess('Learning area added successfully!');
    }
    
    setShowAddModal(false);
    setEditingArea(null);
    setFormData({ name: '', shortName: '', gradeLevel: 'Lower Primary', color: '#3b82f6', icon: '📚' });
  };

  const handleOpenModal = (area = null) => {
    if (area) {
      setEditingArea(area);
      setFormData({
        name: area.name,
        shortName: area.shortName,
        gradeLevel: area.gradeLevel,
        color: area.color,
        icon: area.icon
      });
    } else {
      setFormData({ name: '', shortName: '', gradeLevel: 'Lower Primary', color: '#3b82f6', icon: '📚' });
    }
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Academic Settings" subtitle="Configure academic year and terms" icon={Calendar} />

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'terms'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calendar size={20} />
              Terms & Academic Year
            </button>
            <button
              onClick={() => setActiveTab('learning-areas')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'learning-areas'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BookOpen size={20} />
              Learning Areas
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'terms' && (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Academic Year</h3>
            <div className="max-w-md">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Academic Year</label>
              <select value={settings.academicYear} onChange={(e) => setSettings({...settings, academicYear: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>2025</option>
                <option>2026</option>
                <option>2027</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Term Dates</h3>
            <div className="space-y-6">
              {[1, 2, 3].map(term => (
                <div key={term} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-3">Term {term}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                      <input type="date" value={settings[`term${term}Start`]} onChange={(e) => setSettings({...settings, [`term${term}Start`]: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                      <input type="date" value={settings[`term${term}End`]} onChange={(e) => setSettings({...settings, [`term${term}End`]: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button onClick={() => showSuccess('Academic settings saved!')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
              <Save size={20} /> Save Changes
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Learning Areas Tab */}
      {activeTab === 'learning-areas' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Manage Learning Areas</h3>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <Plus size={18} />
              Add Learning Area
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {learningAreas.map((area) => (
              <div
                key={area.id}
                className="border-2 rounded-lg p-4 hover:shadow-md transition"
                style={{ borderColor: area.color }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{area.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-800">{area.shortName}</h4>
                      <p className="text-xs text-gray-500">{area.gradeLevel}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal(area)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete ${area.name}?`)) {
                          setLearningAreas(learningAreas.filter(a => a.id !== area.id));
                          showSuccess('Learning area deleted');
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{area.name}</p>
                <div
                  className="h-2 rounded-full"
                  style={{ backgroundColor: area.color }}
                ></div>
              </div>
            ))}
          </div>

          {learningAreas.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">No learning areas added yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Your First Learning Area
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                {editingArea ? 'Edit Learning Area' : 'Add Learning Area'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Mathematics Activities"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.shortName}
                  onChange={(e) => setFormData({...formData, shortName: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Math"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Grade Level
                </label>
                <select
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Early Years">Early Years</option>
                  <option value="Lower Primary">Lower Primary (Grades 1-3)</option>
                  <option value="Upper Primary">Upper Primary (Grades 4-6)</option>
                  <option value="Junior School">Junior School (Grades 7-9)</option>
                  <option value="Senior School">Senior School (Grades 10-12)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-2xl text-center"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Preview:</p>
                <div
                  className="border-2 rounded-lg p-4"
                  style={{ borderColor: formData.color }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{formData.icon}</span>
                    <div>
                      <h4 className="font-bold text-gray-800">{formData.shortName || 'Short Name'}</h4>
                      <p className="text-xs text-gray-500">{formData.gradeLevel}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{formData.name || 'Full Name'}</p>
                  <div className="h-2 rounded-full mt-2" style={{ backgroundColor: formData.color }}></div>
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingArea(null);
                  setFormData({ name: '', shortName: '', gradeLevel: 'Lower Primary', color: '#3b82f6', icon: '📚' });
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEdit}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold"
              >
                <Save size={18} />
                {editingArea ? 'Update' : 'Add'} Learning Area
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicSettings;
