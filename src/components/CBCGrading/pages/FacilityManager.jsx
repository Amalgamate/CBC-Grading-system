/**
 * Facility Manager Component
 * Manage school facilities including classes, streams, and rooms
 * Accessible to Head Teachers and Admins
 */

import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, X, Save, Loader, AlertCircle, CheckCircle,
  BookOpen, Users, Grid, Search, RefreshCw, Eye, MoreVertical, Copy
} from 'lucide-react';
import { configAPI } from '../../../services/api';
import { useNotifications } from '../hooks/useNotifications';
import { getAdminSchoolId, getStoredUser } from '../../../services/tenantContext';
import { 
  Button, 
  Input, 
  Label, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../../components/ui';

const FacilityManager = () => {
  const { showSuccess, showError } = useNotifications();

  // State
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('view'); // view, create

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    capacity: 40,
    stream: 'A',
    level: '',
    description: ''
  });

  // Initialize
  useEffect(() => {
    let sid = getAdminSchoolId();
    if (!sid) {
      const user = getStoredUser();
      sid = user?.schoolId || user?.school?.id;
    }
    setSchoolId(sid);
    
    if (sid) {
      fetchClasses(sid);
    }
  }, []);

  // Fetch classes
  const fetchClasses = async (sid) => {
    setLoading(true);
    try {
      const response = await configAPI.getClasses(sid);
      setClasses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
      showError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      showError('Class name is required');
      return false;
    }
    if (!formData.code.trim()) {
      showError('Class code is required');
      return false;
    }
    if (formData.capacity < 1) {
      showError('Capacity must be at least 1');
      return false;
    }
    return true;
  };

  // Save class
  const handleSaveClass = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        schoolId,
        ...(editingId && { id: editingId })
      };

      const response = await configAPI.upsertClass(payload);
      
      showSuccess(editingId ? 'Class updated successfully!' : 'Class created successfully!');
      
      // Refresh list
      if (schoolId) {
        await fetchClasses(schoolId);
      }
      
      // Reset form
      resetForm();
      setActiveTab('view');
    } catch (error) {
      console.error('Error saving class:', error);
      showError(error.message || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit class
  const handleEditClass = (classItem) => {
    setFormData({
      name: classItem.name || '',
      code: classItem.code || '',
      capacity: classItem.capacity || 40,
      stream: classItem.stream || 'A',
      level: classItem.level || '',
      description: classItem.description || ''
    });
    setEditingId(classItem.id);
    setActiveTab('create');
  };

  // Delete class
  const handleDeleteClass = async (id) => {
    try {
      setSubmitting(true);
      await configAPI.deleteClass(id);
      showSuccess('Class deleted successfully!');
      
      if (schoolId) {
        await fetchClasses(schoolId);
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting class:', error);
      showError('Failed to delete class');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      capacity: 40,
      stream: 'A',
      level: '',
      description: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter classes
  const filteredClasses = classes.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!schoolId) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="pt-12 text-center">
          <AlertCircle size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">Unable to determine school. Please refresh the page.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Facility Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage classes, streams, and school facilities</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchClasses(schoolId)}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setActiveTab('create');
            }}
          >
            <Plus size={16} />
            New Class
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('view')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'view'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Classes ({filteredClasses.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'create'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          {editingId ? 'Edit Class' : 'Create New'}
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'view' ? (
          // Classes List View
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader size={32} className="animate-spin text-brand-purple" />
              </div>
            ) : filteredClasses.length === 0 ? (
              // Empty State
              <Card className="border-2 border-dashed text-center py-12">
                <CardContent>
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Classes Yet</h3>
                  <p className="text-gray-600 mb-4">Create your first class to get started</p>
                  <Button
                    onClick={() => {
                      resetForm();
                      setActiveTab('create');
                    }}
                  >
                    <Plus size={16} />
                    Create First Class
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Classes Grid
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClasses.map(classItem => (
                  <Card key={classItem.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle>{classItem.name}</CardTitle>
                          <CardDescription>Code: {classItem.code}</CardDescription>
                        </div>
                        <div className="relative group">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <MoreVertical size={16} className="text-gray-400" />
                          </button>
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-10">
                            <button
                              onClick={() => handleEditClass(classItem)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(classItem.id)}
                              className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Details */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Stream:</span>
                          <span className="font-bold text-gray-900">{classItem.stream || '-'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-bold text-gray-900">{classItem.capacity || 0} Students</span>
                        </div>
                        {classItem.level && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Level:</span>
                            <span className="font-bold text-gray-900">{classItem.level}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {classItem.description && (
                        <p className="text-xs text-gray-600 p-2 bg-gray-50 rounded">
                          {classItem.description}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          onClick={() => handleEditClass(classItem)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Edit size={14} />
                          Edit
                        </Button>
                        <Button
                          onClick={() => setDeleteConfirm(classItem.id)}
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Create/Edit Form
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? 'Edit Class' : 'Create New Class'}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Class Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Grade 5 Alpha"
                  />
                  <p className="text-xs text-gray-500">Descriptive name for the class</p>
                </div>

                {/* Class Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">Class Code *</Label>
                  <Input
                    id="code"
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="e.g., G5A"
                  />
                  <p className="text-xs text-gray-500">Unique identifier for the class</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Stream */}
                  <div className="space-y-2">
                    <Label htmlFor="stream">Stream</Label>
                    <Input
                      id="stream"
                      type="text"
                      name="stream"
                      value={formData.stream}
                      onChange={handleInputChange}
                      placeholder="A, B, C..."
                    />
                  </div>

                  {/* Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Student Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>
                </div>

                {/* Level */}
                <div className="space-y-2">
                  <Label htmlFor="level">Grade/Level</Label>
                  <Input
                    id="level"
                    type="text"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    placeholder="e.g., Grade 5, Class 3"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Additional information about this class..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveClass}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {editingId ? 'Update Class' : 'Create Class'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle size={20} className="text-rose-600" />
              Delete Class
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this class? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteClass(deleteConfirm)}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacilityManager;
