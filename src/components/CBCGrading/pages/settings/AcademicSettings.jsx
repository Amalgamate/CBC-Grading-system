/**
 * Academic Settings Page
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Save, BookOpen, Plus, Edit, Trash2, Calculator, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../../../hooks/useAuth';
import { configAPI, authAPI, schoolAPI, userAPI } from '../../../../services/api';
import academicYearConfig from '../../utils/academicYear';
import {} from '../../../../constants/learningAreas';
import { gradeStructure } from '../../data/gradeStructure';
import HierarchicalLearningAreas from './HierarchicalLearningAreas';

const AcademicSettings = () => {
  const { showSuccess, showError } = useNotifications();
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'terms';
  const setActiveTab = (tab) => setSearchParams({ tab }, { replace: true });

  // Helper function to show success notifications with both toast and hook
  const notifySuccess = (message) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '600',
        fontSize: '14px',
        padding: '16px',
        borderRadius: '8px'
      }
    });
    showSuccess(message);
  };

  const [termConfigs, setTermConfigs] = useState([]);
  const [aggregationConfigs, setAggregationConfigs] = useState([]);
  const [streamConfigs, setStreamConfigs] = useState([]);
  const [classConfigs, setClassConfigs] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showContextPrompt, setShowContextPrompt] = useState(false);
  const [schools] = useState([]);
  const [selectedContextSchool, setSelectedContextSchool] = useState('');
  const [branches, setBranches] = useState([]);
  const [selectedContextBranch, setSelectedContextBranch] = useState('');

  // Load Configs
  const loadConfigs = React.useCallback(async () => {
    try {
      setLoading(true);
      let sid = user?.school?.id || user?.schoolId;
      if (!sid) {
        try {
          const me = await authAPI.me();
          const u = me.data || me;
          sid = u.schoolId || (u.school && u.school.id) || sid;
          if (sid) {
            updateUser({ schoolId: sid, school: u.school || null });
          }
        } catch { }
      }
      if (!sid) {
        showError('School ID not detected. Please re-login.');
        setStreamConfigs([]);
        setAggregationConfigs([]);
        setTermConfigs([]);
        return;
      }
      const [terms, aggregations, streams, classes, teachersList] = await Promise.all([
        configAPI.getTermConfigs(sid),
        configAPI.getAggregationConfigs(sid),
        configAPI.getStreamConfigs(sid),
        configAPI.getClasses(sid),
        userAPI.getAll()
      ]);
      const termsArr = Array.isArray(terms) ? terms : (terms && terms.data) ? terms.data : [];
      const aggsArr = Array.isArray(aggregations) ? aggregations : (aggregations && aggregations.data) ? aggregations.data : [];
      const streamsArr = Array.isArray(streams) ? streams : (streams && streams.data) ? streams.data : [];
      const classesArr = Array.isArray(classes) ? classes : (classes && classes.data) ? classes.data : [];
      const teachersArr = Array.isArray(teachersList) ? teachersList : (teachersList && teachersList.data) ? teachersList.data : [];
      setTermConfigs(termsArr);
      setAggregationConfigs(aggsArr || []);
      setStreamConfigs(streamsArr || []);
      setClassConfigs(classesArr || []);
      setTeachers(teachersArr.filter(t => t.role === 'TEACHER' || t.role === 'HEAD_TEACHER') || []);
    } catch (error) {
      console.error('Failed to load configs:', error);
      showError('Failed to load settings. Check network and authentication.');
    } finally {
      setLoading(false);
    }
  }, [user?.school?.id, user?.schoolId, updateUser, showError]);

  // Load Learning Areas from Database
  const loadLearningAreas = React.useCallback(async () => {
    try {
      let sid = user?.school?.id || user?.schoolId;
      if (!sid) {
        try {
          const me = await authAPI.me();
          const u = me.data || me;
          sid = u.schoolId || (u.school && u.school.id) || sid;
        } catch { }
      }
      if (!sid) {
        setLearningAreas([]);
        return;
      }

      const areas = await configAPI.getLearningAreas(sid);
      const areasArr = Array.isArray(areas) ? areas : (areas && areas.data) ? areas.data : [];
      setLearningAreas(areasArr);
    } catch (error) {
      console.error('Failed to load learning areas:', error);
      // Silently fail - don't show error for this non-critical feature
      setLearningAreas([]);
    }
  }, [user?.school?.id, user?.schoolId]);

  // Seed Learning Areas
  const handleSeedLearningAreas = React.useCallback(async () => {
    try {
      setSeedingLearningAreas(true);
      const result = await configAPI.seedLearningAreas();
      
      // Show success with toast AND notification
      toast.success(`📚 Learning areas seeded! Created: ${result.created || 0}, Skipped: ${result.skipped || 0}`, {
        duration: 4000,
        position: 'top-right',
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: '600',
          fontSize: '14px',
          padding: '16px',
          borderRadius: '8px'
        }
      });
      
      await loadLearningAreas();
    } catch (error) {
      console.error('Error seeding learning areas:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to seed learning areas';
      
      toast.error(`❌ ${errorMsg}`, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#ef4444',
          color: '#fff',
          fontWeight: '600',
          fontSize: '14px',
          padding: '16px',
          borderRadius: '8px'
        }
      });
    } finally {
      setSeedingLearningAreas(false);
    }
  }, [loadLearningAreas]);

  // Seed Classes
  const handleSeedClasses = React.useCallback(async () => {
    try {
      setSeedingClasses(true);
      const result = await configAPI.seedClasses();
      notifySuccess(`✏️ Classes seeded! Created: ${result.created || 0}, Skipped: ${result.skipped || 0}`);
      await loadConfigs();
    } catch (error) {
      console.error('Error seeding classes:', error);
      showError(error?.message || 'Failed to seed classes');
    } finally {
      setSeedingClasses(false);
    }
  }, [loadConfigs, notifySuccess, showError]);

  // Seed Streams
  const handleSeedStreams = React.useCallback(async () => {
    try {
      setSeedingStreams(true);
      const result = await configAPI.seedStreams();
      notifySuccess(`🌊 Streams seeded! Created: ${result.created || 0}, Skipped: ${result.skipped || 0}`);
      await loadConfigs();
    } catch (error) {
      console.error('Error seeding streams:', error);
      showError(error?.message || 'Failed to seed streams');
    } finally {
      setSeedingStreams(false);
    }
  }, [loadConfigs, notifySuccess, showError]);

  useEffect(() => {
    if (user?.school?.id || user?.schoolId) {
      loadConfigs();
    }
  }, [user?.school?.id, user?.schoolId, loadConfigs]);

  useEffect(() => {
    if (activeTab === 'streams' || activeTab === 'classes') {
      loadConfigs();
    }
  }, [activeTab, loadConfigs]);

  useEffect(() => {
    if (activeTab === 'learning-areas') {
      loadLearningAreas();
    }
  }, [activeTab, loadLearningAreas]);

  useEffect(() => {
    if (selectedContextSchool) {
      (async () => {
        try {
          const res = await schoolAPI.getBranches(selectedContextSchool);
          const list = Array.isArray(res) ? res : (res.data || res.branches || []);
          setBranches(list);
        } catch {
          setBranches([]);
        }
      })();
    } else {
      setBranches([]);
      setSelectedContextBranch('');
    }
  }, [selectedContextSchool]);

  const applyContext = async () => {
    if (!selectedContextSchool) {
      showError('Select a school to continue');
      return;
    }
    // no local storage usage; persist via user context only
    updateUser({ schoolId: selectedContextSchool });
    setShowContextPrompt(false);
    await loadConfigs();
    showSuccess('Context applied');
  };

  // State for manual academic year input if no terms exist
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Initialize learning areas from database
  const [learningAreas, setLearningAreas] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAggModal, setShowAggModal] = useState(false); // Aggregation Modal
  const [showStreamModal, setShowStreamModal] = useState(false); // Stream Modal
  const [showClassModal, setShowClassModal] = useState(false); // Class Modal
  const [editingArea, setEditingArea] = useState(null);
  const [editingAgg, setEditingAgg] = useState(null); // Aggregation Edit
  const [editingStream, setEditingStream] = useState(null); // Stream Edit
  const [editingClass, setEditingClass] = useState(null); // Class Edit

  // Seeding states
  const [seedingLearningAreas, setSeedingLearningAreas] = useState(false);
  const [seedingClasses, setSeedingClasses] = useState(false);
  const [seedingStreams, setSeedingStreams] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    gradeLevel: 'Lower Primary',
    color: '#3b82f6',
    icon: '📚'
  });

  const [aggFormData, setAggFormData] = useState({
    type: 'QUIZ',
    strategy: 'SIMPLE_AVERAGE',
    nValue: '',
    weight: 1.0,
    grade: '',
    learningArea: ''
  });

  const [streamFormData, setStreamFormData] = useState({
    name: '',
    active: true
  });

  const [classFormData, setClassFormData] = useState({
    name: '',
    grade: '',
    stream: '',
    teacherId: '',
    capacity: 40,
    room: '',
    academicYear: new Date().getFullYear(),
    term: 'TERM_1',
    active: true
  });

  const handleSaveTerm = async (termData) => {
    try {
      const sid = user?.school?.id || user?.schoolId;
      await configAPI.upsertTermConfig({
        ...termData,
        schoolId: sid
      });
      showSuccess(`Term ${termData.term} saved successfully!`);
      loadConfigs(); // Refresh
    } catch (error) {
      showError(error.message || 'Failed to save term configuration');
    }
  };

  const handleAddEditAgg = async () => {
    try {
      const sid = user?.school?.id || user?.schoolId;
      const payload = {
        ...aggFormData,
        schoolId: sid,
        nValue: aggFormData.nValue ? Number(aggFormData.nValue) : null,
        weight: Number(aggFormData.weight)
      };

      if (editingAgg) {
        await configAPI.updateAggregationConfig(editingAgg.id, payload);
        showSuccess('Aggregation rule updated');
      } else {
        await configAPI.createAggregationConfig(payload);
        showSuccess('Aggregation rule created');
      }

      setShowAggModal(false);
      setEditingAgg(null);
      loadConfigs();
    } catch (error) {
      showError(error.message || 'Failed to save aggregation rule');
    }
  };

  const handleSaveStream = async () => {
    if (!streamFormData.name || !streamFormData.name.trim()) {
      showError('Stream name is required');
      return;
    }
    if (streamConfigs.some((s) => (s.name || '').toLowerCase() === streamFormData.name.trim().toLowerCase())) {
      showError('Stream name already exists');
      return;
    }

    // Validate schoolId
    const sidCtx = user?.school?.id || user?.schoolId || localStorage.getItem('currentSchoolId');
    if (!sidCtx) {
      showError('School ID is missing. Please log in again.');
      console.error('User object:', user);
      return;
    }

    try {
      const sid = sidCtx;
      // removed debug log

      const payload = {
        ...streamFormData,
        schoolId: sid
      };

      if (editingStream) {
        await configAPI.upsertStreamConfig({ ...payload, id: editingStream.id });
        showSuccess('Stream updated successfully');
      } else {
        await configAPI.upsertStreamConfig(payload);
        showSuccess('Stream added successfully');
      }

      setShowStreamModal(false);
      setEditingStream(null);
      setStreamFormData({ name: '', active: true });
      await loadConfigs(); // Make sure to wait for reload
    } catch (error) {
      console.error('Error saving stream:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        stack: error.stack
      });

      if (error.message && error.message.includes('already exists')) {
        showError('Stream name already exists');
      } else if (error.message && error.message.includes('Unauthorized')) {
        showError('Session expired. Please log in again.');
      } else {
        showError(error.message || 'Failed to save stream. Please try again.');
      }
    }
  };

  const handleDeleteAgg = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      await configAPI.deleteAggregationConfig(id);
      showSuccess('Rule deleted');
      loadConfigs();
    } catch (error) {
      showError(error.message || 'Failed to delete rule');
    }
  };

  const handleDeleteStream = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stream?')) return;
    try {
      await configAPI.deleteStreamConfig(id);
      showSuccess('Stream deleted');
      loadConfigs();
    } catch (error) {
      showError(error.message || 'Failed to delete stream');
    }
  };

  const openAggModal = (agg = null) => {
    if (agg) {
      setEditingAgg(agg);
      setAggFormData({
        type: agg.type,
        strategy: agg.strategy,
        nValue: agg.nValue || '',
        weight: agg.weight || 1.0,
        grade: agg.grade || '',
        learningArea: agg.learningArea || ''
      });
    } else {
      setEditingAgg(null);
      setAggFormData({
        type: 'QUIZ',
        strategy: 'SIMPLE_AVERAGE',
        nValue: '',
        weight: 1.0,
        grade: '',
        learningArea: ''
      });
    }
    setShowAggModal(true);
  };

  const openStreamModal = (stream = null) => {
    if (stream) {
      setEditingStream(stream);
      setStreamFormData({ name: stream.name, active: stream.active });
    } else {
      setEditingStream(null);
      setStreamFormData({ name: '', active: true });
    }
    setShowStreamModal(true);
  };

  const openClassModal = (classItem = null) => {
    if (classItem) {
      setEditingClass(classItem);
      setClassFormData({
        name: classItem.name || '',
        grade: classItem.grade || '',
        stream: classItem.stream || '',
        teacherId: classItem.teacherId || '',
        capacity: classItem.capacity || 40,
        room: classItem.room || '',
        academicYear: classItem.academicYear || new Date().getFullYear(),
        term: classItem.term || 'TERM_1',
        active: classItem.active !== undefined ? classItem.active : true
      });
    } else {
      setEditingClass(null);
      setClassFormData({
        name: '',
        grade: '',
        stream: '',
        teacherId: '',
        capacity: 40,
        room: '',
        academicYear: new Date().getFullYear(),
        term: 'TERM_1',
        active: true
      });
    }
    setShowClassModal(true);
  };

  const handleSaveClass = async () => {
    if (!classFormData.name || !classFormData.grade) {
      showError('Class name and grade are required');
      return;
    }

    const sid = user?.school?.id || user?.schoolId;
    if (!sid) {
      showError('School ID is missing. Please log in again.');
      return;
    }

    try {
      const payload = {
        ...classFormData,
        schoolId: sid,
        branchId: user?.branchId || null
      };

      if (editingClass) {
        await configAPI.upsertClass({ ...payload, id: editingClass.id });
        notifySuccess('✏️ Class updated successfully');
      } else {
        await configAPI.upsertClass(payload);
        notifySuccess('✨ Class created successfully');
      }

      setShowClassModal(false);
      setEditingClass(null);
      setClassFormData({
        name: '',
        grade: '',
        stream: '',
        teacherId: '',
        capacity: 40,
        room: '',
        academicYear: new Date().getFullYear(),
        term: 'TERM_1',
        active: true
      });
      await loadConfigs();
    } catch (error) {
      console.error('Error saving class:', error);
      // Show the actual error message from the server if available
      showError(error.message || 'Failed to save class. Please try again.');
    }
  };

  const handleDeleteClass = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    try {
      await configAPI.deleteClass(id);
      notifySuccess('🗑️ Class deleted successfully');
      loadConfigs();
    } catch (error) {
      showError(error.message || 'Failed to delete class');
    }
  };

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
      {showContextPrompt && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-yellow-800">Select School Context</h3>
              <p className="text-xs text-yellow-700">Choose the school (and optional branch) to manage academic settings.</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">School</label>
              <select
                value={selectedContextSchool}
                onChange={(e) => setSelectedContextSchool(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select School</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Branch (optional)</label>
              <select
                value={selectedContextBranch}
                onChange={(e) => setSelectedContextBranch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                disabled={!branches.length}
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name || b.code}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={applyContext}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Context
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'terms'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Calendar size={20} />
              Terms & Academic Year
            </button>
            <button
              onClick={() => setActiveTab('learning-areas')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'learning-areas'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <BookOpen size={20} />
              Learning Areas
            </button>
            <button
              onClick={() => setActiveTab('aggregation')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'aggregation'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Calculator size={20} />
              Grading Rules
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'classes'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Users size={20} />
              Classes
            </button>
            <button
              onClick={() => setActiveTab('streams')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${activeTab === 'streams'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              <Users size={20} />
              Streams
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  {academicYearConfig.getAcademicYearOptions().map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-bold mb-4">Term Configuration</h3>
              {loading ? <p>Loading settings...</p> : (
                <div className="space-y-6">
                  {['TERM_1', 'TERM_2', 'TERM_3'].map((termName, index) => {
                    const config = termConfigs.find(c => c.academicYear === selectedYear && c.term === termName) || {
                      academicYear: selectedYear,
                      term: termName,
                      startDate: '',
                      endDate: '',
                      formativeWeight: 50,
                      summativeWeight: 50,
                      isActive: false
                    };

                    return (
                      <div key={termName} className={`border rounded-lg p-4 ${config.isActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-gray-800">Term {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={config.isActive}
                              onChange={(e) => handleSaveTerm({ ...config, isActive: e.target.checked })}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-sm font-medium">Active Term</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={config.startDate ? new Date(config.startDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleSaveTerm({ ...config, startDate: e.target.value })}
                              className="w-full px-3 py-2 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                            <input
                              type="date"
                              value={config.endDate ? new Date(config.endDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleSaveTerm({ ...config, endDate: e.target.value })}
                              className="w-full px-3 py-2 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Formative Weight (%)</label>
                            <input
                              type="number"
                              value={config.formativeWeight}
                              onChange={(e) => handleSaveTerm({ ...config, formativeWeight: Number(e.target.value) })}
                              className="w-full px-3 py-2 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">Summative Weight (%)</label>
                            <input
                              type="number"
                              value={config.summativeWeight}
                              onChange={(e) => handleSaveTerm({ ...config, summativeWeight: Number(e.target.value) })}
                              className="w-full px-3 py-2 border rounded text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aggregation Tab */}
      {activeTab === 'aggregation' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Assessment Aggregation Rules</h3>
            <button
              onClick={() => openAggModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <Plus size={18} />
              Add Rule
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 font-semibold text-gray-600">Type</th>
                  <th className="p-4 font-semibold text-gray-600">Strategy</th>
                  <th className="p-4 font-semibold text-gray-600">Parameters</th>
                  <th className="p-4 font-semibold text-gray-600">Scope</th>
                  <th className="p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {aggregationConfigs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No aggregation rules defined.</td>
                  </tr>
                ) : (
                  aggregationConfigs.map(config => (
                    <tr key={config.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{config.type}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                          {config.strategy.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-sm">
                        {config.strategy === 'BEST_N' && `Best ${config.nValue}`}
                        {config.strategy === 'DROP_LOWEST_N' && `Drop Lowest ${config.nValue}`}
                        {config.weight !== 1 && <div>Weight: {config.weight}x</div>}
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {config.grade ? `Grade: ${config.grade}` : 'All Grades'}
                        <br />
                        {config.learningArea ? `Subject: ${config.learningArea}` : 'All Subjects'}
                      </td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => openAggModal(config)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteAgg(config.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Learning Areas Tab */}
      {activeTab === 'learning-areas' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Manage Learning Areas & Strands</h3>
              <p className="text-sm text-gray-600 mt-1">Organized by grade level with curriculum strands</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSeedLearningAreas}
                disabled={seedingLearningAreas}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition font-semibold ${
                  seedingLearningAreas
                    ? 'bg-gray-400 text-white cursor-not-allowed opacity-75'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                title="Seed default learning areas for all grades"
              >
                {seedingLearningAreas ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Seeding...</span>
                  </>
                ) : (
                  <>
                    <span>🌱</span>
                    <span>Seed Areas</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                <Plus size={18} />
                Add Learning Area
              </button>
            </div>
          </div>

          {learningAreas.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">No learning areas added yet</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Your First Learning Area
              </button>
            </div>
          ) : (
            <HierarchicalLearningAreas
              learningAreas={learningAreas}
              gradeStructure={gradeStructure}
              onEdit={(area) => handleOpenModal(area)}
              onDelete={(area) => {
                if (window.confirm(`Delete ${area.name}?`)) {
                  setLearningAreas(learningAreas.filter(a => a.id !== area.id));
                  showSuccess('Learning area deleted');
                }
              }}
              onAddStrand={(area, strand) => {
                // Placeholder for future strand assessment creation
                console.log(`Add strand assessment for ${area.name} - ${strand}`);
              }}
            />
          )}
        </div>
      )}


      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Manage Classes</h3>
            <div className="flex gap-2">
              <button
                onClick={handleSeedClasses}
                disabled={seedingClasses}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                title="Seed default classes for all grades"
              >
                {seedingClasses ? '⏳ Seeding...' : '🌱 Seed Classes'}
              </button>
              <button
                onClick={() => openClassModal()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                <Plus size={18} />
                Add Class
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 font-semibold text-gray-600">Class Name</th>
                  <th className="p-4 font-semibold text-gray-600">Grade</th>
                  <th className="p-4 font-semibold text-gray-600">Stream</th>
                  <th className="p-4 font-semibold text-gray-600">Teacher</th>
                  <th className="p-4 font-semibold text-gray-600">Capacity</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classConfigs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">No classes defined.</td>
                  </tr>
                ) : (
                  classConfigs.map(classItem => {
                    const teacher = teachers.find(t => t.id === classItem.teacherId);
                    return (
                      <tr key={classItem.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{classItem.name}</td>
                        <td className="p-4">{classItem.grade}</td>
                        <td className="p-4">{classItem.stream || '-'}</td>
                        <td className="p-4 text-sm">{teacher ? `${teacher.firstName} ${teacher.lastName}` : '-'}</td>
                        <td className="p-4">{classItem.capacity}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${classItem.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {classItem.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => openClassModal(classItem)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                          <button onClick={() => handleDeleteClass(classItem.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Streams Tab */}
      {activeTab === 'streams' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Manage Streams</h3>
              <div className="text-xs text-gray-500 mt-1">
                Current School: {user?.school?.name || 'Unknown'} ({user?.school?.id || user?.schoolId || '—'})
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSeedStreams}
                disabled={seedingStreams}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                title="Seed default streams (A, B, C, D)"
              >
                {seedingStreams ? '⏳ Seeding...' : '🌱 Seed Streams'}
              </button>
              <button
                onClick={() => openStreamModal()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                <Plus size={18} />
                Add Stream
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 font-semibold text-gray-600">Stream Name</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {streamConfigs.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-500">No streams defined.</td>
                  </tr>
                ) : (
                  streamConfigs.map(stream => (
                    <tr key={stream.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{stream.name}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${stream.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {stream.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        <button onClick={() => openStreamModal(stream)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteStream(stream.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stream Modal */}
      {showStreamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                {editingStream ? 'Edit Stream' : 'Add Stream'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stream Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={streamFormData.name}
                  onChange={(e) => setStreamFormData({ ...streamFormData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., North, Blue, A"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={streamFormData.active}
                  onChange={(e) => setStreamFormData({ ...streamFormData, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">Active Stream</label>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowStreamModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStream}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold"
              >
                <Save size={18} />
                {editingStream ? 'Update' : 'Add'} Stream
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 rounded-t-2xl sticky top-0">
              <h3 className="text-xl font-bold text-white">
                {editingClass ? 'Edit Class' : 'Add Class'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Class Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={classFormData.name}
                    onChange={(e) => setClassFormData({ ...classFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Grade 1 East"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={classFormData.grade}
                    onChange={(e) => setClassFormData({ ...classFormData, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Grade</option>
                    {gradeStructure.map(g => (
                      <option key={g.code} value={g.code}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stream (Optional)
                  </label>
                  <select
                    value={classFormData.stream}
                    onChange={(e) => setClassFormData({ ...classFormData, stream: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No Stream</option>
                    {streamConfigs.filter(s => s.active).map(stream => (
                      <option key={stream.id} value={stream.name}>{stream.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Class Teacher (Optional)
                  </label>
                  <select
                    value={classFormData.teacherId}
                    onChange={(e) => setClassFormData({ ...classFormData, teacherId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No Teacher Assigned</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={classFormData.capacity}
                    onChange={(e) => setClassFormData({ ...classFormData, capacity: parseInt(e.target.value) || 40 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Room (Optional)
                  </label>
                  <input
                    type="text"
                    value={classFormData.room}
                    onChange={(e) => setClassFormData({ ...classFormData, room: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Room 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Academic Year
                  </label>
                  <input
                    type="number"
                    value={classFormData.academicYear}
                    onChange={(e) => setClassFormData({ ...classFormData, academicYear: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Term
                  </label>
                  <select
                    value={classFormData.term}
                    onChange={(e) => setClassFormData({ ...classFormData, term: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TERM_1">Term 1</option>
                    <option value="TERM_2">Term 2</option>
                    <option value="TERM_3">Term 3</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={classFormData.active}
                  onChange={(e) => setClassFormData({ ...classFormData, active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">Active Class</label>
              </div>
            </div>

            <div className="border-t px-6 py-4 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl sticky bottom-0">
              <button
                onClick={() => setShowClassModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveClass}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold"
              >
                <Save size={18} />
                {editingClass ? 'Update' : 'Create'} Class
              </button>
            </div>
          </div>
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Early Years">Early Years</option>
                  <option value="Pre-Primary">Pre-Primary</option>
                  <option value="Lower Primary">Lower Primary</option>
                  <option value="Upper Primary">Upper Primary</option>
                  <option value="Junior School">Junior School</option>
                  <option value="Senior School">Senior School</option>
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
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
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
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
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

      {/* Aggregation Rule Modal */}
      {showAggModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">
                {editingAgg ? 'Edit Aggregation Rule' : 'Add Aggregation Rule'}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Type</label>
                <select
                  value={aggFormData.type}
                  onChange={(e) => setAggFormData({ ...aggFormData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="QUIZ">Quiz</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="PROJECT">Project</option>
                  <option value="EXAM">Exam</option>
                  <option value="OBSERVATION">Observation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Strategy</label>
                <select
                  value={aggFormData.strategy}
                  onChange={(e) => setAggFormData({ ...aggFormData, strategy: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="SIMPLE_AVERAGE">Simple Average</option>
                  <option value="BEST_N">Best N</option>
                  <option value="DROP_LOWEST_N">Drop Lowest N</option>
                  <option value="WEIGHTED_AVERAGE">Weighted Average</option>
                  <option value="MEDIAN">Median</option>
                </select>
              </div>

              {(aggFormData.strategy === 'BEST_N' || aggFormData.strategy === 'DROP_LOWEST_N') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">N Value</label>
                  <input
                    type="number"
                    value={aggFormData.nValue}
                    onChange={(e) => setAggFormData({ ...aggFormData, nValue: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g. 3"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (Multiplier)</label>
                <input
                  type="number"
                  step="0.1"
                  value={aggFormData.weight}
                  onChange={(e) => setAggFormData({ ...aggFormData, weight: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Grade (Optional)</label>
                  <input
                    type="text"
                    value={aggFormData.grade}
                    onChange={(e) => setAggFormData({ ...aggFormData, grade: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g. Grade 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject (Optional)</label>
                  <input
                    type="text"
                    value={aggFormData.learningArea}
                    onChange={(e) => setAggFormData({ ...aggFormData, learningArea: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g. Math"
                  />
                </div>
              </div>

            </div>

            <div className="border-t px-6 py-4 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowAggModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEditAgg}
                className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold"
              >
                <Save size={18} />
                {editingAgg ? 'Update Rule' : 'Create Rule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicSettings;
