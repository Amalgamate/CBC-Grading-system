/**
 * Performance Level Scale Management
 * Create and manage custom grading scales for different grades and terms
 */

import React, { useState } from 'react';
import { Award, Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const PerformanceScale = () => {
  const { showSuccess, showError } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingScale, setEditingScale] = useState(null);
  const [viewingScale, setViewingScale] = useState(null);

  // Initial scales data
  const [scales, setScales] = useState([
    { 
      id: 1, 
      grade: 'GRADE 8', 
      type: 'Custom', 
      name: 'longhorn term 2 summative scale -2025',
      term: 'Term 2',
      session: '2025',
      gradeBoundaries: [
        { grade: 'A', minPercent: 80, maxPercent: 100, description: 'Exceeds Expectations' },
        { grade: 'B', minPercent: 65, maxPercent: 79, description: 'Meets Expectations' },
        { grade: 'C', minPercent: 50, maxPercent: 64, description: 'Approaches Expectations' },
        { grade: 'D', minPercent: 40, maxPercent: 49, description: 'Below Expectations' },
        { grade: 'E', minPercent: 0, maxPercent: 39, description: 'Does Not Meet Expectations' }
      ]
    },
    { 
      id: 2, 
      grade: 'GRADE 7', 
      type: 'Custom', 
      name: 'longhorn term 2 summative scale-2025',
      term: 'Term 2',
      session: '2025',
      gradeBoundaries: [
        { grade: 'A', minPercent: 80, maxPercent: 100, description: 'Exceeds Expectations' },
        { grade: 'B', minPercent: 65, maxPercent: 79, description: 'Meets Expectations' },
        { grade: 'C', minPercent: 50, maxPercent: 64, description: 'Approaches Expectations' },
        { grade: 'D', minPercent: 40, maxPercent: 49, description: 'Below Expectations' },
        { grade: 'E', minPercent: 0, maxPercent: 39, description: 'Does Not Meet Expectations' }
      ]
    },
    { 
      id: 3, 
      grade: 'GRADE 6', 
      type: 'Custom', 
      name: 'longhorn term 2 summative scale-2025',
      term: 'Term 2',
      session: '2025',
      gradeBoundaries: [
        { grade: 'A', minPercent: 80, maxPercent: 100, description: 'Exceeds Expectations' },
        { grade: 'B', minPercent: 65, maxPercent: 79, description: 'Meets Expectations' },
        { grade: 'C', minPercent: 50, maxPercent: 64, description: 'Approaches Expectations' },
        { grade: 'D', minPercent: 40, maxPercent: 49, description: 'Below Expectations' },
        { grade: 'E', minPercent: 0, maxPercent: 39, description: 'Does Not Meet Expectations' }
      ]
    }
  ]);

  const [formData, setFormData] = useState({
    grade: 'GRADE 1',
    name: '',
    term: 'Term 1',
    session: '2026',
    type: 'Custom',
    gradeBoundaries: [
      { grade: 'A', minPercent: 80, maxPercent: 100, description: 'Exceeds Expectations' },
      { grade: 'B', minPercent: 65, maxPercent: 79, description: 'Meets Expectations' },
      { grade: 'C', minPercent: 50, maxPercent: 64, description: 'Approaches Expectations' },
      { grade: 'D', minPercent: 40, maxPercent: 49, description: 'Below Expectations' },
      { grade: 'E', minPercent: 0, maxPercent: 39, description: 'Does Not Meet Expectations' }
    ]
  });

  const grades = [
    'PLAYGROUP', 'PRE-PRIMARY 1', 'PRE-PRIMARY 2',
    'GRADE 1', 'GRADE 2', 'GRADE 3', 'GRADE 4', 'GRADE 5', 'GRADE 6',
    'GRADE 7', 'GRADE 8', 'GRADE 9', 'GRADE 10', 'GRADE 11', 'GRADE 12'
  ];

  const filteredScales = scales.filter(scale =>
    scale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scale.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (scale = null) => {
    if (scale) {
      setEditingScale(scale);
      setFormData({
        grade: scale.grade,
        name: scale.name,
        term: scale.term,
        session: scale.session,
        type: scale.type,
        gradeBoundaries: [...scale.gradeBoundaries]
      });
    } else {
      setEditingScale(null);
      setFormData({
        grade: 'GRADE 1',
        name: '',
        term: 'Term 1',
        session: '2026',
        type: 'Custom',
        gradeBoundaries: [
          { grade: 'A', minPercent: 80, maxPercent: 100, description: 'Exceeds Expectations' },
          { grade: 'B', minPercent: 65, maxPercent: 79, description: 'Meets Expectations' },
          { grade: 'C', minPercent: 50, maxPercent: 64, description: 'Approaches Expectations' },
          { grade: 'D', minPercent: 40, maxPercent: 49, description: 'Below Expectations' },
          { grade: 'E', minPercent: 0, maxPercent: 39, description: 'Does Not Meet Expectations' }
        ]
      });
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      showError('Please enter a scale name');
      return;
    }

    if (editingScale) {
      setScales(scales.map(s => s.id === editingScale.id ? { ...editingScale, ...formData } : s));
      showSuccess('Performance scale updated successfully!');
    } else {
      setScales([...scales, { id: Date.now(), ...formData }]);
      showSuccess('Performance scale created successfully!');
    }

    setShowModal(false);
    setEditingScale(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this performance scale?')) {
      setScales(scales.filter(s => s.id !== id));
      showSuccess('Performance scale deleted successfully!');
    }
  };

  const handleBoundaryChange = (index, field, value) => {
    const newBoundaries = [...formData.gradeBoundaries];
    newBoundaries[index] = { ...newBoundaries[index], [field]: value };
    setFormData({ ...formData, gradeBoundaries: newBoundaries });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Plus size={20} />
            New Performance Level Scale
          </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or grade..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Scales Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">No</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Term</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Session</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredScales.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  <Award className="mx-auto mb-3 text-gray-400" size={48} />
                  <p>No performance scales found</p>
                  <button
                    onClick={() => handleOpenModal()}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Create Your First Scale
                  </button>
                </td>
              </tr>
            ) : (
              filteredScales.map((scale, index) => (
                <tr key={scale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {scale.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{scale.type}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-800">{scale.name}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{scale.term}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{scale.session}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingScale(scale)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="View Scale"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleOpenModal(scale)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(scale.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Placeholder */}
        {filteredScales.length > 0 && (
          <div className="border-t px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredScales.length} of {scales.length} scales
            </p>
            <div className="text-sm text-gray-600">
              Total: {scales.length}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">
                {editingScale ? 'Edit Performance Scale' : 'New Performance Scale'}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Scale Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., term 2 summative scale -2026"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Term
                  </label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Session/Year
                  </label>
                  <input
                    type="text"
                    value={formData.session}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2026"
                  />
                </div>
              </div>

              {/* Grade Boundaries */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-bold mb-4">Grade Boundaries</h4>
                <div className="space-y-3">
                  {formData.gradeBoundaries.map((boundary, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Grade</label>
                        <input
                          type="text"
                          value={boundary.grade}
                          onChange={(e) => handleBoundaryChange(index, 'grade', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Min %</label>
                        <input
                          type="number"
                          value={boundary.minPercent}
                          onChange={(e) => handleBoundaryChange(index, 'minPercent', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Max %</label>
                        <input
                          type="number"
                          value={boundary.maxPercent}
                          onChange={(e) => handleBoundaryChange(index, 'maxPercent', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                        <input
                          type="text"
                          value={boundary.description}
                          onChange={(e) => handleBoundaryChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingScale(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold"
              >
                {editingScale ? 'Update Scale' : 'Create Scale'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Scale Modal */}
      {viewingScale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">View Performance Scale</h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold text-gray-600">Grade</p>
                  <p className="text-lg font-bold text-gray-800">{viewingScale.grade}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600">Scale Name</p>
                  <p className="text-lg font-bold text-gray-800">{viewingScale.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600">Term</p>
                  <p className="text-lg font-bold text-gray-800">{viewingScale.term}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600">Session</p>
                  <p className="text-lg font-bold text-gray-800">{viewingScale.session}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-bold text-gray-800 mb-3">Grade Boundaries</h4>
                <div className="space-y-2">
                  {viewingScale.gradeBoundaries.map((boundary, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                          {boundary.grade}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{boundary.description}</p>
                          <p className="text-sm text-gray-600">{boundary.minPercent}% - {boundary.maxPercent}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t px-6 py-4 bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewingScale(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceScale;
