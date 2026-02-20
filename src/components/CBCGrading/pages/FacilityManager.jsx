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
import { configAPI, facilityAPI } from '../../../services/api';
import { useNotifications } from '../hooks/useNotifications';
import { getAdminSchoolId, getStoredUser } from '../../../services/tenantContext';
import { GRADES } from '../../../constants/grades';
import api from '../../../services/api';
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
  const [streams, setStreams] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [schoolId, setSchoolId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('classes'); // classes, streams, create-class, create-stream
  const [seedingClasses, setSeedingClasses] = useState(false);
  const [seedingStreams, setSeedingStreams] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    capacity: 40,
    stream: 'A',
    grade: 'GRADE_1',
    teacherId: '',
    branchId: '',
    description: ''
  });

  // Handle Seeding Classes
  const handleSeedClasses = async () => {
    if (!schoolId) return;
    try {
      setSeedingClasses(true);
      const result = await configAPI.seedClasses(schoolId);
      showSuccess(`✏️ Classes seeded! Created: ${result.created || 0}, Skipped: ${result.skipped || 0}`);
      await fetchInitialData(schoolId);
    } catch (error) {
      console.error('Error seeding classes:', error);
      showError(error?.message || 'Failed to seed classes');
    } finally {
      setSeedingClasses(false);
    }
  };

  // Handle Seeding Streams
  const handleSeedStreams = async () => {
    if (!schoolId) return;
    try {
      setSeedingStreams(true);
      const result = await configAPI.seedStreams(schoolId);
      showSuccess(`🌊 Streams seeded! Created: ${result.created || 0}, Skipped: ${result.skipped || 0}`);
      await fetchInitialData(schoolId);
    } catch (error) {
      console.error('Error seeding streams:', error);
      showError(error?.message || 'Failed to seed streams');
    } finally {
      setSeedingStreams(false);
    }
  };

  const [streamFormData, setStreamFormData] = useState({
    name: '',
    active: true
  });
  const [editingStreamId, setEditingStreamId] = useState(null);
  const [deleteConfirmStream, setDeleteConfirmStream] = useState(null);

  // Initialize
  useEffect(() => {
    let sid = getAdminSchoolId();
    if (!sid) {
      const user = getStoredUser();
      sid = user?.schoolId || user?.school?.id;
    }
    setSchoolId(sid);

    if (sid) {
      const user = getStoredUser();
      const initialBranchId = user?.branchId || null;
      setSelectedBranchId(initialBranchId);
      fetchInitialData(sid, initialBranchId);
    }
  }, []);

  // Fetch all initial data
  const fetchInitialData = async (sid, bid = selectedBranchId) => {
    try {
      setLoading(true);
      console.log('📝 Fetching initial data for school:', sid);

      // Fetch classes
      const classesResponse = await configAPI.getClasses(sid);
      console.log('✅ Classes fetched:', classesResponse.data);
      setClasses(classesResponse.data || []);

      // Fetch branches
      try {
        const branchesResponse = await configAPI.getBranches(sid);
        console.log('✅ Branches fetched:', branchesResponse.data);
        const branchesList = branchesResponse.data || [];
        setBranches(branchesList);

        // If no selected branch and branches exist, select the first one
        if (!bid && branchesList.length > 0) {
          const defaultBranch = branchesList[0].id;
          setSelectedBranchId(defaultBranch);
          bid = defaultBranch; // Update local var for stream fetching
        }
      } catch (err) {
        console.error('⚠️ Failed to fetch branches:', err);
        setBranches([]);
      }

      // Fetch streams (Use School Config instead of Branch Streams)
      try {
        const streamsResponse = await configAPI.getStreamConfigs(sid);
        console.log('✅ Streams fetched for school:', sid, streamsResponse);
        const streamsData = Array.isArray(streamsResponse) ? streamsResponse : (streamsResponse.data || []);
        setStreams(streamsData);
      } catch (err) {
        console.error('⚠️ Failed to fetch streams:', err);
        setStreams([]);
      }

      // Fetch teachers (no parameters - backend filters by authenticated user's school)
      try {
        const teachersResponse = await api.teachers.getAll();
        console.log('✅ Teachers fetched:', teachersResponse);
        const teachersList = teachersResponse?.data || teachersResponse || [];
        console.log('📊 Setting teachers list with', teachersList.length, 'teachers');
        setTeachers(teachersList);
      } catch (err) {
        console.error('⚠️ Failed to fetch teachers:', err);
        setTeachers([]);
      }
    } catch (error) {
      console.error('❌ Failed to fetch initial data:', error);
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Save stream
  const handleSaveStream = async () => {
    if (!streamFormData.name.trim()) {
      showError('Stream name is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: streamFormData.name,
        schoolId: schoolId,
        id: editingStreamId || undefined,
        active: editingStreamId ? streamFormData.active : true
      };

      console.log('Saving stream config with payload:', payload);

      await configAPI.upsertStreamConfig(payload);

      showSuccess(editingStreamId ? 'Stream updated!' : 'Stream created!');

      if (schoolId) {
        await fetchInitialData(schoolId, selectedBranchId);
      }

      resetStreamForm();
      setActiveTab('streams');
    } catch (error) {
      console.error('Error saving stream:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        stack: error?.stack
      });

      if (error?.message?.includes('already exists')) {
        showError('Stream name already exists');
      } else if (error?.message?.includes('Unauthorized') || error?.response?.status === 403) {
        showError('Session expired. Please log in again.');
      } else {
        showError(error?.response?.data?.error?.message || error?.message || 'Failed to save stream. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Edit stream
  const handleEditStream = (stream) => {
    setStreamFormData({
      name: stream.name || '',
      active: stream.active !== false
    });
    setEditingStreamId(stream.id);
    setActiveTab('create-stream');
  };

  // Delete stream
  const handleDeleteStream = async (id) => {
    try {
      setSubmitting(true);
      await configAPI.deleteStreamConfig(id);
      showSuccess('Stream deleted!');

      if (schoolId) {
        await fetchInitialData(schoolId, selectedBranchId);
      }
      setDeleteConfirmStream(null);
    } catch (error) {
      console.error('Error deleting stream:', error);
      showError('Failed to delete stream');
    } finally {
      setSubmitting(false);
    }
  };

  // Reset stream form
  const resetStreamForm = () => {
    setStreamFormData({
      name: '',
      active: true
    });
    setEditingStreamId(null);
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
        name: formData.name,
        code: formData.code,
        capacity: parseInt(formData.capacity) || 40,
        stream: formData.stream,
        grade: formData.grade,
        teacherId: formData.teacherId || undefined,
        branchId: formData.branchId || undefined,
        schoolId,
        ...(editingId && { id: editingId })
      };

      console.log('Saving class with payload:', payload);

      const response = await configAPI.upsertClass(payload);

      showSuccess(editingId ? 'Class updated successfully!' : 'Class created successfully!');

      // Refresh list
      if (schoolId) {
        await fetchInitialData(schoolId);
      }

      // Reset form
      resetForm();
      setActiveTab('classes');
    } catch (error) {
      console.error('Error saving class:', error);
      showError(error?.response?.data?.error?.message || error?.message || 'Failed to save class');
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
      grade: classItem.grade || 'GRADE_1',
      teacherId: classItem.teacherId || '',
      branchId: classItem.branchId || '',
      description: classItem.description || ''
    });
    setEditingId(classItem.id);
    setActiveTab('create-class');
  };

  // Delete class
  const handleDeleteClass = async (id) => {
    try {
      setSubmitting(true);
      await configAPI.deleteClass(id);
      showSuccess('Class deleted successfully!');

      if (schoolId) {
        await fetchInitialData(schoolId);
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
      grade: 'GRADE_1',
      teacherId: '',
      branchId: '',
      description: ''
    });
    setEditingId(null);
    setShowForm(false);
    setActiveTab('classes');
  };

  // Get current lesson based on time
  const getCurrentLesson = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentMinutes = hour * 60 + minute;

    // Define lesson slots (time in minutes from midnight)
    const lessons = [
      { start: 8 * 60, end: 9.5 * 60, name: 'First Lesson', color: 'bg-amber-100 text-amber-900' },
      { start: 10 * 60, end: 11.5 * 60, name: 'Second Lesson', color: 'bg-blue-100 text-blue-900' },
      { start: 13 * 60, end: 14.5 * 60, name: 'Third Lesson', color: 'bg-green-100 text-green-900' },
      { start: 15 * 60, end: 16.5 * 60, name: 'Fourth Lesson', color: 'bg-purple-100 text-purple-900' },
    ];

    return lessons.find(l => currentMinutes >= l.start && currentMinutes < l.end) || { name: 'No active lesson', color: 'bg-gray-100 text-gray-900' };
  };

  // Get student count for a class
  const getStudentCount = (classItem) => {
    // Mock enrollment for now - in production, this would come from enrollments data
    const mockCounts = {
      'Grade 1 - A': 28,
      'Grade 2 - A': 32,
      'Grade 3 - A': 25,
      'Grade 4 - A': 30,
      'Grade 5 - A': 34,
      'Grade 6 - A': 28,
      'Grade 7 - A': 35,
      'Grade 8 - A': 29,
      'Grade 9 - A': 31,
      'Grade 10 - A': 27,
      'Grade 11 - A': 26,
      'Grade 12 - A': 24,
    };
    return mockCounts[classItem?.name] || 0;
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Grid className="text-brand-purple" />
            Facility Management
          </h2>
          <p className="text-gray-500 mt-1">Manage classes, streams, and school facilities</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => {
              if (schoolId) {
                fetchInitialData(schoolId);
              }
            }}
            disabled={loading}
            variant="outline"
            className="h-10 border-gray-200"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>

          <Button
            onClick={handleSeedClasses}
            disabled={seedingClasses || loading}
            variant="outline"
            className="h-10 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
          >
            {seedingClasses ? <RefreshCw className="animate-spin" size={16} /> : <span>🌱</span>}
            {seedingClasses ? 'Seeding...' : 'Seed Classes'}
          </Button>

          <Button
            onClick={handleSeedStreams}
            disabled={seedingStreams || loading}
            variant="outline"
            className="h-10 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
          >
            {seedingStreams ? <RefreshCw className="animate-spin" size={16} /> : <span>🌊</span>}
            {seedingStreams ? 'Seeding...' : 'Seed Streams'}
          </Button>

          {(activeTab === 'classes') && (
            <Button
              onClick={() => {
                resetForm();
                setActiveTab('create-class');
              }}
              className="h-10 bg-brand-purple text-white hover:bg-brand-purple/90"
            >
              <Plus size={16} />
              New Class
            </Button>
          )}
          {(activeTab === 'streams') && (
            <Button
              onClick={() => {
                resetStreamForm();
                setActiveTab('create-stream');
              }}
              className="h-10 bg-brand-purple text-white hover:bg-brand-purple/90"
            >
              <Plus size={16} />
              New Stream
            </Button>
          )}
        </div>
      </div>

      {/* Branch Selector using Tabs (Visible only on Streams tab and if multiple branches exist) */}
      {/* Branch Selector for Classes */}
      {activeTab === 'classes' && branches.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {branches.map(branch => (
            <button
              key={branch.id}
              onClick={() => {
                setSelectedBranchId(branch.id);
                fetchInitialData(schoolId, branch.id);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedBranchId === branch.id
                ? 'bg-brand-purple text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {branch.name}
            </button>
          ))}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('classes')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'classes'
            ? 'border-brand-purple text-brand-purple'
            : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Classes ({filteredClasses.length})
        </button>
        <button
          onClick={() => setActiveTab('streams')}
          className={`px-4 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'streams'
            ? 'border-brand-purple text-brand-purple'
            : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
        >
          Streams ({streams.length})
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'classes' ? (
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
                      setActiveTab('create-class');
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
                {filteredClasses.map(classItem => {
                  const currentLesson = getCurrentLesson();
                  const studentCount = getStudentCount(classItem);

                  return (
                    <Card key={classItem.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-brand-purple">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{classItem.name}</CardTitle>
                            <CardDescription className="text-xs">Grade: {classItem.grade}</CardDescription>
                          </div>
                          <div className="text-right text-xs bg-brand-purple/10 px-2 py-1 rounded text-brand-purple font-bold">
                            {currentLesson.name}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Teacher Info */}
                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                          <p className="text-xs text-amber-900 font-bold uppercase tracking-tight mb-1">Class Teacher</p>
                          <p className="text-sm font-bold text-gray-900">{classItem.teacher?.firstName || 'Unassigned'} {classItem.teacher?.lastName || ''}</p>
                          {classItem.teacher?.phone && (
                            <p className="text-xs text-gray-600 mt-1">{classItem.teacher.phone}</p>
                          )}
                        </div>

                        {/* Student Count */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
                            <p className="text-xs text-blue-900 font-bold uppercase tracking-tight">Students</p>
                            <p className="text-2xl font-black text-blue-600 mt-1">{studentCount}/{classItem.capacity}</p>
                            <p className="text-xs text-blue-700 mt-1">Enrolled</p>
                          </div>

                          {/* Capacity Utilization */}
                          <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                            <p className="text-xs text-green-900 font-bold uppercase tracking-tight">Utilization</p>
                            <p className="text-2xl font-black text-green-600 mt-1">{Math.round((studentCount / classItem.capacity) * 100)}%</p>
                            <div className="w-full bg-green-200 rounded-full h-1.5 mt-2">
                              <div
                                className="bg-green-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min((studentCount / classItem.capacity) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Current Activity */}
                        <div className={`${currentLesson.color} border border-current rounded-lg p-3`}>
                          <p className="text-xs font-bold uppercase tracking-tight opacity-70 mb-1">Current Activity</p>
                          <p className="text-sm font-bold">{currentLesson.name}</p>
                        </div>

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
                            variant="outline"
                            size="sm"
                            className="flex-1 text-brand-purple hover:text-brand-purple hover:bg-brand-purple/5"
                          >
                            <Trash2 size={14} />
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'streams' ? (
          // Streams List View
          <div className="space-y-4">
            {/* Streams Table */}
            {streams.length === 0 ? (
              <Card className="border-2 border-dashed text-center py-12">
                <CardContent>
                  <Grid size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">No Streams Yet</h3>
                  <p className="text-gray-600 mb-4">Create your first stream to get started</p>
                  <Button
                    onClick={() => {
                      resetStreamForm();
                      setActiveTab('create-stream');
                    }}
                  >
                    <Plus size={16} />
                    Create First Stream
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Stream Name</th>
                      <th className="px-6 py-3 text-left text-sm font-bold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-right text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {streams.map(stream => (
                      <tr key={stream.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">{stream.name}</p>
                        </td>
                        <td className="px-6 py-4">
                          {stream.active ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                              <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              onClick={() => handleEditStream(stream)}
                              variant="outline"
                              size="sm"
                            >
                              <Edit size={14} />
                            </Button>
                            <Button
                              onClick={() => setDeleteConfirmStream(stream.id)}
                              variant="outline"
                              size="sm"
                              className="text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : activeTab === 'create-class' ? (
          // Create/Edit Class Form
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
                  {/* Grade */}
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade *</Label>
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                    >
                      <option value="">Select Grade</option>
                      {GRADES.map(grade => (
                        <option key={grade.value} value={grade.value}>
                          {grade.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stream */}
                  <div className="space-y-2">
                    <Label htmlFor="stream">Stream *</Label>
                    <select
                      id="stream"
                      name="stream"
                      value={formData.stream}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                    >
                      <option value="">Select Stream</option>
                      {streams.length > 0 ? (
                        streams.map(s => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))
                      ) : (
                        <option disabled>No streams available</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Student Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      min="1"
                    />
                  </div>

                  {/* Teacher */}
                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Class Teacher</Label>
                    <select
                      id="teacherId"
                      name="teacherId"
                      value={formData.teacherId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                    >
                      <option value="">Assign Teacher (Optional)</option>
                      {teachers.length > 0 ? (
                        teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.firstName} {teacher.lastName}
                          </option>
                        ))
                      ) : (
                        <option disabled>No teachers available</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Branch */}
                {branches.length > 1 && (
                  <div className="space-y-2">
                    <Label htmlFor="branchId">Branch</Label>
                    <select
                      id="branchId"
                      name="branchId"
                      value={formData.branchId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent"
                    >
                      <option value="">Select Branch</option>
                      {branches.map(branch => (
                        <option key={branch.id} value={branch.id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
        ) : activeTab === 'create-stream' ? (
          // Create/Edit Stream Form
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>{editingStreamId ? 'Edit Stream' : 'Create New Stream'}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Stream Name */}
                <div className="space-y-2">
                  <Label htmlFor="stream-name">Stream Name *</Label>
                  <Input
                    id="stream-name"
                    type="text"
                    value={streamFormData.name}
                    onChange={(e) => setStreamFormData({ ...streamFormData, name: e.target.value })}
                    placeholder="e.g., A, B, C, Alpha, Blue"
                  />
                  <p className="text-xs text-gray-500">Name or code for this stream</p>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="stream-active"
                    checked={streamFormData.active}
                    onChange={(e) => setStreamFormData({ ...streamFormData, active: e.target.checked })}
                    className="w-4 h-4 text-brand-purple rounded focus:ring-2 focus:ring-brand-purple border-gray-300"
                  />
                  <Label htmlFor="stream-active" className="font-normal">Active Stream</Label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => {
                      resetStreamForm();
                      setActiveTab('streams');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveStream}
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
                        {editingStreamId ? 'Update Stream' : 'Create Stream'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      {/* Delete Class Confirmation Dialog */}
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

      {/* Delete Stream Confirmation Dialog */}
      <Dialog open={!!deleteConfirmStream} onOpenChange={(open) => !open && setDeleteConfirmStream(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle size={20} className="text-rose-600" />
              Delete Stream
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this stream? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmStream(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteStream(deleteConfirmStream)}
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
