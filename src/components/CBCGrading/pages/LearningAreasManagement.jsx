import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import api from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

const LearningAreasManagement = () => {
  const { user } = useAuth();
  const [learningAreas, setLearningAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code: '',
  });

  // Fetch learning areas
  useEffect(() => {
    fetchLearningAreas();
  }, []);

  const fetchLearningAreas = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getLearningAreas(user?.schoolId);
      setLearningAreas(data || []);
    } catch (err) {
      setError('Failed to load learning areas: ' + err.message);
      console.error('Error fetching learning areas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setFormData({ name: '', description: '', code: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (area) => {
    setFormData({
      name: area.name || '',
      description: area.description || '',
      code: area.code || '',
    });
    setEditingId(area.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', description: '', code: '' });
  };

  const handleSubmit = async () => {
    try {
      setError('');

      if (!formData.name.trim()) {
        setError('Learning area name is required');
        return;
      }

      if (editingId) {
        // Update existing
        await api.updateLearningArea(editingId, formData);
      } else {
        // Create new
        await api.createLearningArea({
          ...formData,
          schoolId: user?.schoolId,
        });
      }

      await fetchLearningAreas();
      handleCancel();
    } catch (err) {
      setError('Failed to save learning area: ' + err.message);
      console.error('Error saving learning area:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this learning area?')) return;

    try {
      setError('');
      await api.deleteLearningArea(id);
      await fetchLearningAreas();
    } catch (err) {
      setError('Failed to delete learning area: ' + err.message);
      console.error('Error deleting learning area:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading learning areas...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Learning Areas Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage learning areas for your school
            </p>
          </div>
          <button
            onClick={handleAddNew}
            disabled={showForm}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={18} />
            Add Learning Area
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editingId ? 'Edit Learning Area' : 'Add New Learning Area'}
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Language and Literacy"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., LL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-gray-500 text-xs">(optional)</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description for this learning area"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Check size={16} />
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Learning Areas List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {learningAreas.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No learning areas created yet</p>
            <p className="text-sm text-gray-400 mt-2">Click "Add Learning Area" to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {learningAreas.map((area) => (
                  <tr key={area.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{area.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{area.code || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {area.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(area)}
                          disabled={showForm}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(area.id)}
                          disabled={showForm}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Learning areas are used across the assessment module. Create your learning areas here 
          before setting up assessment scales and tests.
        </p>
      </div>
    </div>
  );
};

export default LearningAreasManagement;
