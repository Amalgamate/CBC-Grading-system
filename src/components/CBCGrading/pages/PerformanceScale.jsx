/**
 * Performance Level Scale Management - Database Integrated
 * Full page interface for managing grading scales by grade and learning area
 */

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Save, Plus, Trash2, AlertCircle, Loader, Check, Search, Filter, MoreVertical, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import { gradingAPI } from '../../../services/api';
import { useNotifications } from '../hooks/useNotifications';

const PerformanceScale = () => {
  const { showSuccess, showError } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  
  // Get schoolId from localStorage (adjust based on your auth implementation)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Try multiple sources for schoolId with better fallback
  let schoolId = user?.school?.id || user?.schoolId || localStorage.getItem('schoolId');
  
  // If still no schoolId, use the default one from your database
  if (!schoolId) {
    schoolId = 'default-school-e082e9a4';
    console.warn('⚠️ Using default schoolId. Please ensure your user account is linked to a school.');
  }
  
  console.log('🏫 Using schoolId:', schoolId);
  
  const [selectedGrade, setSelectedGrade] = useState('GRADE 1');
  const [selectedArea, setSelectedArea] = useState('MATHEMATICAL ACTIVITIES');
  const [scaleName, setScaleName] = useState('');
  const [gradingSystems, setGradingSystems] = useState([]);
  const [currentSystem, setCurrentSystem] = useState(null);
  const [ranges, setRanges] = useState([
    { mark: 80, score: 4, description: '{{learner}} consistently and with high level of accuracy displays the knowledge, skills and attitudes/values as:' },
    { mark: 50, score: 3, description: '{{learner}} displays the knowledge, skills and attitudes/values as:' },
    { mark: 30, score: 2, description: '{{learner}} displays the knowledge, skills and attitudes/values as:' },
    { mark: 1, score: 1, description: '{{learner}} attempts to displays the knowledge, skills and attitude:' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGrades, setExpandedGrades] = useState([]); // Track which grades are expanded

  const grades = [
    'PLAYGROUP', 'PRE-PRIMARY 1', 'PRE-PRIMARY 2',
    'GRADE 1', 'GRADE 2', 'GRADE 3', 'GRADE 4', 'GRADE 5', 'GRADE 6',
    'GRADE 7', 'GRADE 8', 'GRADE 9', 'GRADE 10', 'GRADE 11', 'GRADE 12'
  ];

  const learningAreas = [
    'INSHA',
    'ABACUS',
    'CREATIVE WRITING',
    'KUSOMA',
    'READING',
    'COMPUTER STUDIES ACTIVITIES ( Interactive)',
    'FRENCH LANGUAGE ACTIVITIES',
    'ISLAMIC RELIGIOUS ACTIVITIES',
    'CHRISTIAN RELIGIOUS EDUCATION ACTIVITIES',
    'INDIGENOUS LANGUAGE ACTIVITIES',
    'CREATIVE ACTIVITIES',
    'ENVIRONMENTAL ACTIVITIES',
    'SHUGHULI ZA KISWAHILI LUGHA',
    'ENGLISH LANGUAGE ACTIVITIES',
    'MATHEMATICAL ACTIVITIES'
  ];

  useEffect(() => {
    loadGradingSystems();
  }, [schoolId]);

  useEffect(() => {
    // Only run this logic if we are in form mode or transitioning
    if (gradingSystems.length > 0) {
      const system = gradingSystems.find(
        s => (s.grade === selectedGrade && s.learningArea === selectedArea) || 
             (s.name.includes(selectedGrade) && s.name.includes(selectedArea))
      );
      
      if (system && system.ranges) {
        setCurrentSystem(system);
        setScaleName(system.name);
        // Convert ranges to our format
        const convertedRanges = system.ranges.map(r => ({
          mark: r.minPercentage,
          score: r.points || 4,
          description: r.description || ''
        })).sort((a, b) => b.mark - a.mark);
        setRanges(convertedRanges);
      } else {
        setCurrentSystem(null);
        setScaleName(`${selectedGrade} - ${selectedArea}`);
        // Reset to default ranges
        setRanges([
          { mark: 80, score: 4, description: '{{learner}} consistently and with high level of accuracy displays the knowledge, skills and attitudes/values as:' },
          { mark: 50, score: 3, description: '{{learner}} displays the knowledge, skills and attitudes/values as:' },
          { mark: 30, score: 2, description: '{{learner}} displays the knowledge, skills and attitudes/values as:' },
          { mark: 1, score: 1, description: '{{learner}} attempts to displays the knowledge, skills and attitude:' }
        ]);
      }
    }
  }, [selectedGrade, selectedArea, gradingSystems]);

  const loadGradingSystems = async () => {
    try {
      setLoading(true);
      const systems = await gradingAPI.getSystems(schoolId);
      setGradingSystems(Array.isArray(systems) ? systems : []);
      console.log('✅ Loaded grading systems from database:', systems.length);
    } catch (err) {
      console.error('❌ Error loading grading systems:', err);
      showError('Failed to load grading systems from database');
      setGradingSystems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = (index, field, value) => {
    const newRanges = [...ranges];
    newRanges[index] = { ...newRanges[index], [field]: value };
    setRanges(newRanges);
  };

  const handleAddRange = () => {
    setRanges([...ranges, { mark: 0, score: 1, description: '' }]);
  };

  const handleRemoveRange = (index) => {
    if (ranges.length > 1) {
      setRanges(ranges.filter((_, i) => i !== index));
    }
  };

  const handleCreate = () => {
    // Reset to defaults or first available
    setSelectedGrade(grades[0]);
    setSelectedArea(learningAreas[0]);
    setCurrentSystem(null);
    setScaleName(`${grades[0]} - ${learningAreas[0]}`);
    setViewMode('form');
  };

  const handleEdit = (system) => {
    // Parse grade and area from system name or use fields if available
    const foundGrade = system.grade || grades.find(g => system.name.includes(g));
    const foundArea = system.learningArea || learningAreas.find(a => system.name.includes(a));
    
    if (foundGrade) setSelectedGrade(foundGrade);
    if (foundArea) setSelectedArea(foundArea);
    
    setScaleName(system.name);
    setCurrentSystem(system); // Ensure this is set
    setViewMode('form');
  };

  const handleDuplicate = (system) => {
    // Create a duplicate with modified name
    const duplicateName = `${system.name} (Copy)`;
    setScaleName(duplicateName);
    setCurrentSystem(null); // New scale, not updating existing
    
    // Parse grade and area
    const foundGrade = system.grade || grades.find(g => system.name.includes(g));
    const foundArea = system.learningArea || learningAreas.find(a => system.name.includes(a));
    
    if (foundGrade) setSelectedGrade(foundGrade);
    if (foundArea) setSelectedArea(foundArea);
    
    // Copy the ranges
    if (system.ranges) {
      const duplicatedRanges = system.ranges.map(r => ({
        mark: r.minPercentage,
        score: r.points || 4,
        description: r.description || ''
      })).sort((a, b) => b.mark - a.mark);
      setRanges(duplicatedRanges);
    }
    
    setViewMode('form');
    showSuccess('Scale duplicated! Modify and save as a new scale.');
  };

  const handleDelete = async (system) => {
    // Check if it's a default scale
    if (system.isDefault) {
      showError('Cannot delete default scales');
      return;
    }
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${system.name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await gradingAPI.deleteSystem(system.id);
      showSuccess('Performance scale deleted successfully!');
      await loadGradingSystems();
    } catch (error) {
      console.error('❌ Error deleting scale:', error);
      showError('Failed to delete scale: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Validate ranges
      const sortedRanges = [...ranges].sort((a, b) => b.mark - a.mark);
      
      // Check for duplicates or invalid data
      for (let i = 0; i < sortedRanges.length; i++) {
        if (!sortedRanges[i].description.trim()) {
          showError(`Description is required for mark ${sortedRanges[i].mark}`);
          return;
        }
      }
      
      // Convert our ranges format to API format
      const apiRanges = sortedRanges.map((range, index, arr) => {
        const nextRange = arr[index + 1];
        return {
          label: `Level ${range.score}`,
          minPercentage: parseFloat(range.mark),
          maxPercentage: nextRange ? parseFloat(nextRange.mark) - 0.01 : 100,
          points: parseInt(range.score),
          description: range.description,
          rubricRating: `EE${range.score}`, // Exceeds Expectations format
          color: getColorForScore(range.score)
        };
      });

      const systemData = {
        schoolId,
        name: scaleName || `${selectedGrade} - ${selectedArea}`,
        grade: selectedGrade,
        learningArea: selectedArea,
        type: 'SUMMATIVE',
        ranges: apiRanges
      };

      if (currentSystem) {
        await gradingAPI.updateSystem(currentSystem.id, systemData);
        showSuccess('Performance scale updated successfully!');
      } else {
        await gradingAPI.createSystem(systemData);
        showSuccess('Performance scale created successfully!');
      }

      // Reload systems and go back to list
      await loadGradingSystems();
      setViewMode('list');
    } catch (err) {
      console.error('❌ Error saving grading system:', err);
      showError('Failed to save performance scale: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getColorForScore = (score) => {
    const colors = {
      4: '#10b981',
      3: '#3b82f6',
      2: '#f59e0b',
      1: '#ef4444'
    };
    return colors[score] || '#6b7280';
  };

  const filteredSystems = gradingSystems.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group scales by grade
  const groupedScales = useMemo(() => {
    const groups = {};
    
    filteredSystems.forEach(scale => {
      // Extract grade from scale
      let gradeKey = scale.grade || 'General Scales';
      
      // Try to extract from name if no grade field
      if (gradeKey === 'General Scales' && scale.name.includes(' - ')) {
        const nameParts = scale.name.split(' - ');
        const possibleGrade = nameParts[0].trim();
        if (possibleGrade.includes('GRADE') || 
            possibleGrade.includes('PLAYGROUP') || 
            possibleGrade.includes('PP') ||
            possibleGrade.includes('PRE-PRIMARY')) {
          gradeKey = possibleGrade;
        }
      }
      
      if (!groups[gradeKey]) {
        groups[gradeKey] = [];
      }
      groups[gradeKey].push(scale);
    });
    
    return groups;
  }, [filteredSystems]);

  const toggleGrade = (grade) => {
    setExpandedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading performance scales...</p>
        </div>
      </div>
    );
  }

  // LIST VIEW
  if (viewMode === 'list') {
    return (
      <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Performance Scales</h1>
            <p className="text-gray-500 text-sm mt-1">Manage grading rubric scales for different subjects and grades</p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a237e] text-white rounded-lg hover:bg-[#151b60] transition shadow-sm font-semibold"
          >
            <Plus size={18} />
            New Scale
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by grade or subject..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Grouped Scales - Accordion Style */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Object.keys(groupedScales).length > 0 ? (
            <div className="divide-y divide-gray-100">
              {Object.entries(groupedScales).map(([grade, scales]) => {
                const isExpanded = expandedGrades.includes(grade);
                return (
                  <div key={grade}>
                    {/* Grade Header - Clickable */}
                    <button
                      onClick={() => toggleGrade(grade)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown size={20} className="text-gray-500 transition-transform" />
                        ) : (
                          <ChevronRight size={20} className="text-gray-500 transition-transform" />
                        )}
                        <div className="text-left">
                          <h3 className="text-base font-bold text-gray-800">{grade}</h3>
                          <p className="text-xs text-gray-500">{scales.length} scale{scales.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {scales.length} {scales.length === 1 ? 'Scale' : 'Scales'}
                      </span>
                    </button>

                    {/* Scales List - Collapsible */}
                    {isExpanded && (
                      <div className="bg-gray-50">
                        {scales.map((system) => (
                          <div
                            key={system.id}
                            className="px-6 py-4 mx-4 mb-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition cursor-pointer group"
                            onClick={() => handleEdit(system)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-gray-800">{system.name}</h4>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {system.ranges ? system.ranges.length : 0} Levels
                                  </span>
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                    Active
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">{system.type}</p>
                              </div>
                              
                              <div className="flex items-center gap-1 ml-4">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEdit(system); }}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDuplicate(system); }}
                                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                                  title="Duplicate"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(system); }}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <AlertCircle size={32} className="text-gray-300 mx-auto mb-2" />
              <p>No performance scales found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // FORM VIEW
  return (
    <div className="p-4 max-w-screen-2xl mx-auto">
      {/* Compact Sticky Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-3 px-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-4 z-20">
        <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto no-scrollbar">
           <button 
             onClick={() => setViewMode('list')} 
             className="p-2.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors border border-gray-200 hover:border-gray-300 shadow-sm" 
             title="Back to List"
             type="button"
           >
             <ArrowLeft size={20} />
           </button>
           
           <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
           
           <div className="flex flex-col min-w-[200px]">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Scale Name</label>
             <input 
               type="text" 
               value={scaleName} 
               onChange={(e) => setScaleName(e.target.value)}
               placeholder="Enter scale name..."
               className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all hover:border-gray-300"
             />
           </div>

           <div className="flex flex-col min-w-[160px]">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Grade Level</label>
             <select 
               value={selectedGrade} 
               onChange={(e) => setSelectedGrade(e.target.value)}
               className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all cursor-pointer hover:border-gray-300"
             >
               {grades.map(g => <option key={g} value={g}>{g}</option>)}
             </select>
           </div>

           <div className="flex flex-col flex-1 min-w-[240px]">
             <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Learning Area</label>
             <select 
               value={selectedArea} 
               onChange={(e) => setSelectedArea(e.target.value)}
               className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all cursor-pointer hover:border-gray-300 truncate"
             >
               {learningAreas.map(a => <option key={a} value={a}>{a}</option>)}
             </select>
           </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
          {currentSystem ? (
            <span className="hidden md:flex text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium items-center gap-1 border border-green-100">
              <Check size={12} />
              Saved
            </span>
          ) : (
            <span className="hidden md:flex text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full font-medium items-center gap-1 border border-amber-100">
              <AlertCircle size={12} />
              New Scale
            </span>
          )}
          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold shadow-sm disabled:opacity-50 active:scale-95 transform duration-100"
          >
            {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
            Save Scale
          </button>
        </div>
      </div>

      {/* Main Content - Compact Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         {/* Table Header */}
         <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Mark (%)</div>
            <div className="col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Score (1-4)</div>
            <div className="col-span-7 text-xs font-bold text-gray-500 uppercase tracking-wider">Performance Description</div>
            <div className="col-span-1 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</div>
         </div>

         <div className="divide-y divide-gray-100 bg-white">
            {ranges.sort((a, b) => b.mark - a.mark).map((range, index) => (
               <div key={index} className="grid grid-cols-12 gap-4 px-6 py-3 items-start hover:bg-blue-50/30 transition group">
                  <div className="col-span-2">
                    <div className="relative">
                      <input 
                        type="number" 
                        value={range.mark} 
                        onChange={(e) => handleRangeChange(index, 'mark', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-xs font-medium">%</span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="relative">
                       <input 
                         type="number" 
                         value={range.score} 
                         onChange={(e) => handleRangeChange(index, 'score', parseInt(e.target.value) || 1)}
                         className={`w-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow ${
                           range.score === 4 ? 'text-green-600 bg-green-50/50' : 
                           range.score === 3 ? 'text-blue-600 bg-blue-50/50' : 
                           range.score === 2 ? 'text-amber-600 bg-amber-50/50' : 
                           'text-red-600 bg-red-50/50'
                         }`}
                         min="1"
                         max="4"
                       />
                       <div className={`absolute right-3 top-3 w-2 h-2 rounded-full ${
                          range.score === 4 ? 'bg-green-500' : 
                          range.score === 3 ? 'bg-blue-500' : 
                          range.score === 2 ? 'bg-amber-500' : 
                          'bg-red-500'
                       }`}></div>
                    </div>
                  </div>
                  <div className="col-span-7">
                    <textarea 
                      value={range.description} 
                      onChange={(e) => handleRangeChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-shadow leading-relaxed"
                      rows={2}
                      placeholder="Describe the learner's performance level..."
                    />
                  </div>
                  <div className="col-span-1 text-right flex justify-end pt-1">
                     <button 
                       onClick={() => handleRemoveRange(index)}
                       disabled={ranges.length === 1}
                       className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                       title="Remove Level"
                     >
                       <Trash2 size={18} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
         
         <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-gray-500">
               <AlertCircle size={14} className="text-blue-500" />
               <span className="italic">Use <code className="bg-white px-1 py-0.5 border border-gray-200 rounded text-blue-600 font-mono">{'{{learner}}'}</code> as a placeholder for the student's name. Marks indicate the minimum percentage required.</span>
            </div>
            <button 
              onClick={handleAddRange}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 text-sm font-medium shadow-sm transition-all"
            >
              <Plus size={16} />
              Add Level
            </button>
         </div>
      </div>
    </div>
  );
};

export default PerformanceScale;
