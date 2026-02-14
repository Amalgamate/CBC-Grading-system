/**
 * Fee Structure Page
 * Manage fee types, amounts, and academic year structures
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Plus, Edit2, Trash2, Copy, BookOpen,
  Search, AlertCircle, CheckCircle, Info
} from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import LoadingSpinner from '../shared/LoadingSpinner';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';

const FeeStructurePage = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterTerm, setFilterTerm] = useState('all');
  const { showSuccess, showError } = useNotifications();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade: 'PP1',
    term: 'TERM_1',
    academicYear: new Date().getFullYear(),
    mandatory: true,
    active: true,
    feeItems: [] // Array of { feeTypeId, amount, mandatory }
  });

  const grades = ['PP1', 'PP2', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9'];
  const terms = ['TERM_1', 'TERM_2', 'TERM_3'];

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [structuresRes, typesRes] = await Promise.all([
        api.fees.getAllFeeStructures(),
        api.fees.getAllFeeTypes({ active: true })
      ]);
      setFeeStructures(structuresRes.data || []);
      setFeeTypes(typesRes || []);
    } catch (error) {
      showError('Failed to load fee data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateTotalAmount = (items) => {
    return items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  };

  const handleAddFeeItem = () => {
    setFormData(prev => ({
      ...prev,
      feeItems: [
        ...prev.feeItems,
        { feeTypeId: '', amount: '', mandatory: true } // Default state for new item
      ]
    }));
  };

  const handleRemoveFeeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      feeItems: prev.feeItems.filter((_, i) => i !== index)
    }));
  };

  const handleFeeItemChange = (index, field, value) => {
    const newItems = [...formData.feeItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, feeItems: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.feeItems.length === 0) {
      showError('Please fill in required fields and add at least one fee item');
      return;
    }

    // Validate items
    const validItems = formData.feeItems.every(item => item.feeTypeId && item.amount);
    if (!validItems) {
      showError('All fee items must have a type and amount');
      return;
    }

    const payload = {
      ...formData,
      feeItems: formData.feeItems.map(item => ({
        feeTypeId: item.feeTypeId,
        amount: parseFloat(item.amount),
        mandatory: item.mandatory
      }))
    };

    try {
      if (editingStructure) {
        await api.fees.updateFeeStructure(editingStructure.id, payload);
        showSuccess('Fee structure updated successfully!');
      } else {
        await api.fees.createFeeStructure(payload);
        showSuccess('Fee structure created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      showError(error.message || 'Failed to save fee structure');
    }
  };

  const handleEdit = (structure) => {
    setEditingStructure(structure);
    // Transform existing items to form format
    const formItems = (structure.feeItems || []).map(item => ({
      feeTypeId: item.feeTypeId || item.feeType?.id, // Handle potential structure differences
      amount: item.amount.toString(),
      mandatory: item.mandatory
    }));

    setFormData({
      name: structure.name,
      description: structure.description || '',
      grade: structure.grade,
      term: structure.term,
      academicYear: structure.academicYear,
      mandatory: structure.mandatory,
      active: structure.active,
      feeItems: formItems
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!structureToDelete) return;

    try {
      await api.fees.deleteFeeStructure(structureToDelete.id);
      showSuccess('Fee structure deleted successfully!');
      setShowDeleteDialog(false);
      setStructureToDelete(null);
      fetchData();
    } catch (error) {
      showError(error.message || 'Failed to delete fee structure');
    }
  };

  const handleDuplicate = (structure) => {
    setEditingStructure(null);
    const formItems = (structure.feeItems || []).map(item => ({
      feeTypeId: item.feeTypeId || item.feeType?.id,
      amount: item.amount.toString(),
      mandatory: item.mandatory
    }));

    setFormData({
      name: `${structure.name} (Copy)`,
      description: structure.description || '',
      grade: structure.grade,
      term: structure.term,
      academicYear: new Date().getFullYear(),
      mandatory: structure.mandatory,
      active: true,
      feeItems: formItems
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      grade: 'PP1',
      term: 'TERM_1',
      academicYear: new Date().getFullYear(),
      mandatory: true,
      active: true,
      feeItems: []
    });
    setEditingStructure(null);
  };

  const filteredStructures = feeStructures.filter(structure => {
    const matchesSearch = structure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      structure.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || structure.grade === filterGrade;
    const matchesTerm = filterTerm === 'all' || structure.term === filterTerm;
    return matchesSearch && matchesGrade && matchesTerm;
  });

  // Group structures by grade and term
  const groupedStructures = filteredStructures.reduce((acc, structure) => {
    const key = `${structure.grade}-${structure.term}-${structure.academicYear}`;
    if (!acc[key]) {
      acc[key] = {
        grade: structure.grade,
        term: structure.term,
        academicYear: structure.academicYear,
        structures: []
      };
    }
    acc[key].structures.push(structure);
    return acc;
  }, {});

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Fee Structure
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search fee structures (e.g., Grade 1 Term 1)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Grades</option>
            {grades.map(grade => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
          <select
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Terms</option>
            {terms.map(term => (
              <option key={term} value={term}>{term}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Fee Structures List */}
      {Object.keys(groupedStructures).length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No Fee Structures Found"
          message={searchTerm ? "No fee structures match your search." : "Start by creating your first fee structure."}
          actionText="Add Fee Structure"
          onAction={() => {
            resetForm();
            setShowModal(true);
          }}
        />
      ) : (
        <div className="space-y-6">
          {Object.values(groupedStructures).map((group, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">{group.grade} - {group.term}</h3>
                    <p className="text-blue-100 text-sm">Academic Year {group.academicYear}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">
                      {group.structures.length} Fee Structures
                    </p>
                    {/* Sum of all structures' totals */}
                    <p className="text-blue-100 text-sm">
                      Total: KES {group.structures.reduce((acc, s) => acc + calculateTotalAmount(s.feeItems || []), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y">
                {group.structures.map((structure) => {
                  const total = calculateTotalAmount(structure.feeItems || []);
                  return (
                    <div key={structure.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{structure.name}</h4>
                            {structure.mandatory && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                                <AlertCircle size={12} />
                                Mandatory
                              </span>
                            )}
                            {structure.active ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                <CheckCircle size={12} />
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                Inactive
                              </span>
                            )}
                          </div>
                          {structure.description && (
                            <p className="text-sm text-gray-600 mb-3">{structure.description}</p>
                          )}

                          {/* Fee Items Summary */}
                          <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <h5 className="text-xs font-semibold text-gray-500 uppercase mb-2">Breakdown</h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                              {(structure.feeItems || []).map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    {item.feeType?.name || 'Unknown'}
                                  </span>
                                  <span className="font-medium">KES {parseFloat(item.amount).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-900">
                              <span>Total</span>
                              <span>KES {total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleDuplicate(structure)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                            title="Duplicate"
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(structure)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setStructureToDelete(structure);
                              setShowDeleteDialog(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingStructure ? 'Edit Fee Structure' : 'Add Fee Structure'}
              </h3>
              <div className="text-blue-100 text-sm">
                Total: KES {calculateTotalAmount(formData.feeItems).toLocaleString()}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Structure Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Grade 1 Term 1 2024 Fees"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Grade *</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {grades.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Term *</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {terms.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Academic Year *</label>
                  <input
                    type="number"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="2020"
                    max="2099"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    placeholder="Optional description"
                  />
                </div>
              </div>

              {/* Fee Items Section */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-700">Fee Items</h4>
                  <button
                    type="button"
                    onClick={handleAddFeeItem}
                    className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Item
                  </button>
                </div>

                {formData.feeItems.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-gray-500 text-sm">No fee items added yet.</p>
                    <button
                      type="button"
                      onClick={handleAddFeeItem}
                      className="mt-2 text-blue-600 text-sm font-medium hover:underline"
                    >
                      Add first item
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.feeItems.map((item, index) => (
                      <div key={index} className="flex flex-col md:flex-row gap-3 items-start md:items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex-1 w-full">
                          <select
                            value={item.feeTypeId}
                            onChange={(e) => handleFeeItemChange(index, 'feeTypeId', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Fee Type</option>
                            {feeTypes.map(type => (
                              <option key={type.id} value={type.id}>{type.name} ({type.code})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full md:w-32">
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => handleFeeItemChange(index, 'amount', e.target.value)}
                            placeholder="Amount"
                            className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={item.mandatory}
                              onChange={(e) => handleFeeItemChange(index, 'mandatory', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-600">Mandatory</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeeItem(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded bg-white border border-gray-200"
                            title="Remove Item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Toggles */}
              <div className="border-t pt-4 grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.mandatory}
                    onChange={(e) => setFormData({ ...formData, mandatory: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <span className="block text-sm font-semibold">Mandatory Structure</span>
                    <span className="block text-xs text-gray-500">Should apply to all students by default</span>
                  </div>
                </label>

                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <span className="block text-sm font-semibold">Active Status</span>
                    <span className="block text-xs text-gray-500">Visible for invoicing</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition shadow-md"
                >
                  {editingStructure ? 'Update Fee Structure' : 'Create Fee Structure'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        show={showDeleteDialog}
        title="Delete Fee Structure"
        message={`Are you sure you want to delete "${structureToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setStructureToDelete(null);
        }}
      />
    </div>
  );
};

export default FeeStructurePage;
