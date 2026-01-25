/**
 * Academic Settings Page
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Save, BookOpen, Plus, Edit, Trash2, Calculator, Users } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../../../hooks/useAuth';
import { configAPI } from '../../../../services/api';

const AcademicSettings = () => {
  const { showSuccess, showError } = useNotifications();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('terms'); // 'terms', 'learning-areas', 'aggregation'
  
  const [termConfigs, setTermConfigs] = useState([]);
  const [aggregationConfigs, setAggregationConfigs] = useState([]);
  const [streamConfigs, setStreamConfigs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load Configs
  useEffect(() => {
    if (user?.school?.id || user?.schoolId) {
      loadConfigs();
    }
  }, [user?.school?.id, user?.schoolId]);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const sid = user?.school?.id || user?.schoolId;
      const [terms, aggregations, streams] = await Promise.all([
        configAPI.getTermConfigs(sid),
        configAPI.getAggregationConfigs(sid),
        configAPI.getStreamConfigs(sid)
      ]);
      
      // Initialize terms if empty (default structure)
      if (terms.length === 0) {
        // We'll let the UI handle empty state or defaults
        setTermConfigs([]);
      } else {
        setTermConfigs(terms);
      }

      setAggregationConfigs(aggregations || []);
      setStreamConfigs(streams?.data || []);
    } catch (error) {
      console.error('Failed to load configs:', error);
      // showError('Failed to load academic settings');
    } finally {
      setLoading(false);
    }
  };

  // State for manual academic year input if no terms exist
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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
  const [showAggModal, setShowAggModal] = useState(false); // Aggregation Modal
  const [showStreamModal, setShowStreamModal] = useState(false); // Stream Modal
  const [editingArea, setEditingArea] = useState(null);
  const [editingAgg, setEditingAgg] = useState(null); // Aggregation Edit
  const [editingStream, setEditingStream] = useState(null); // Stream Edit

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
      showError('Failed to save term configuration');
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
      showError('Failed to save aggregation rule');
    }
  };

  const handleSaveStream = async () => {
    if (!streamFormData.name || !streamFormData.name.trim()) {
      showError('Stream name is required');
      return;
    }

    // Validate schoolId
    if (!(user?.school?.id || user?.schoolId)) {
      showError('School ID is missing. Please log in again.');
      console.error('User object:', user);
      return;
    }

    try {
      const sid = user?.school?.id || user?.schoolId;
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
      showError('Failed to delete rule');
    }
  };

  const handleDeleteStream = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stream?')) return;
    try {
      await configAPI.deleteStreamConfig(id);
      showSuccess('Stream deleted');
      loadConfigs();
    } catch (error) {
      showError('Failed to delete stream');
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
            <button
              onClick={() => setActiveTab('aggregation')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'aggregation'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Calculator size={20} />
              Grading Rules
            </button>
            <button
              onClick={() => setActiveTab('streams')}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                activeTab === 'streams'
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
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
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
                            onChange={(e) => handleSaveTerm({...config, isActive: e.target.checked})}
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
                            onChange={(e) => handleSaveTerm({...config, startDate: e.target.value})}
                            className="w-full px-3 py-2 border rounded text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
                          <input 
                            type="date" 
                            value={config.endDate ? new Date(config.endDate).toISOString().split('T')[0] : ''} 
                            onChange={(e) => handleSaveTerm({...config, endDate: e.target.value})}
                            className="w-full px-3 py-2 border rounded text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Formative Weight (%)</label>
                          <input 
                            type="number" 
                            value={config.formativeWeight} 
                            onChange={(e) => handleSaveTerm({...config, formativeWeight: Number(e.target.value)})}
                            className="w-full px-3 py-2 border rounded text-sm" 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Summative Weight (%)</label>
                          <input 
                            type="number" 
                            value={config.summativeWeight} 
                            onChange={(e) => handleSaveTerm({...config, summativeWeight: Number(e.target.value)})}
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

      {/* Streams Tab */}
      {activeTab === 'streams' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Manage Streams</h3>
            <button
              onClick={() => openStreamModal()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              <Plus size={18} />
              Add Stream
            </button>
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
                  onChange={(e) => setStreamFormData({...streamFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., North, Blue, A"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={streamFormData.active}
                  onChange={(e) => setStreamFormData({...streamFormData, active: e.target.checked})}
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
                  onChange={(e) => setAggFormData({...aggFormData, type: e.target.value})}
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
                  onChange={(e) => setAggFormData({...aggFormData, strategy: e.target.value})}
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
                    onChange={(e) => setAggFormData({...aggFormData, nValue: e.target.value})}
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
                  onChange={(e) => setAggFormData({...aggFormData, weight: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Grade (Optional)</label>
                  <input
                    type="text"
                    value={aggFormData.grade}
                    onChange={(e) => setAggFormData({...aggFormData, grade: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g. Grade 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject (Optional)</label>
                  <input
                    type="text"
                    value={aggFormData.learningArea}
                    onChange={(e) => setAggFormData({...aggFormData, learningArea: e.target.value})}
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
