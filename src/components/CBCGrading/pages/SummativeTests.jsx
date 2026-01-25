/**
 * Summative Tests Page
 * Create and manage summative tests
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Eye, X, Loader, Send, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../../../hooks/useAuth';
import { assessmentAPI, classAPI, workflowAPI } from '../../../services/api';
import { learningAreas } from '../data/learningAreas';
import SummativeTestForm from '../../../pages/assessments/SummativeTestForm';

const SummativeTests = () => {
  const { showSuccess, showError } = useNotifications();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // View State: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState('list');
  
  const [selectedTest, setSelectedTest] = useState(null);
  const [testData, setTestData] = useState({
    title: '', grade: '', learningArea: '', term: 'Term 1',
    year: '2026', testType: 'End of Term', date: '', duration: 90, totalMarks: 100,
    passMarks: 50, instructions: '', weight: 1.0
  });

  const [tests, setTests] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);

  useEffect(() => {
    fetchTests();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      let classes = [];
      
      if (Array.isArray(response)) {
        classes = response;
      } else if (response && Array.isArray(response.data)) {
        classes = response.data;
      }

      if (classes.length > 0) {
        // Extract unique grades from classes
        const uniqueGrades = [...new Set(classes.map(c => c.grade))].filter(Boolean).sort();
        if (uniqueGrades.length > 0) {
          setAvailableGrades(uniqueGrades);
          return;
        }
      }
      
      // Fallback if no grades found
      setAvailableGrades(['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9']);
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Fallback to default grades if fetch fails
      setAvailableGrades(['PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9']);
    }
  };

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await assessmentAPI.getTests();
      
      // Handle different response formats
      let testsData = [];
      if (response && response.data && Array.isArray(response.data)) {
        testsData = response.data;
      } else if (Array.isArray(response)) {
        testsData = response;
      }
      
      setTests(testsData);
      console.log('✅ Loaded tests from database:', testsData.length);
    } catch (error) {
      console.error('❌ Error fetching tests:', error);
      showError('Failed to load tests from database');
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setTestData({ 
      title: '', grade: '', learningArea: '', 
      term: 'Term 1', year: new Date().getFullYear().toString(), 
      testType: 'End of Term', date: new Date().toISOString().split('T')[0], 
      duration: 60, totalMarks: 100, passMarks: 40, instructions: '', weight: 1.0 
    });
    setViewMode('create');
  };

  const handleEdit = (test) => {
    setSelectedTest(test);
    // Map test fields to testData format if needed, assuming they match
    setTestData(test);
    setViewMode('edit');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      await assessmentAPI.deleteTest(id);
      setTests(prev => prev.filter(t => t.id !== id));
      showSuccess('Test deleted successfully!');
    } catch (error) {
      showError('Failed to delete test');
    }
  };

  const handleSaveTest = async (formData) => {
    console.log('=== SAVING TEST ===');
    console.log('View mode:', viewMode);
    console.log('Form data:', formData);
    
    try {
      // Ensure testDate is present (backend expects testDate, frontend uses date)
      const payload = {
        ...formData,
        testDate: formData.date || formData.testDate || new Date().toISOString(),
        id: viewMode === 'create' ? Date.now().toString() : selectedTest?.id,
        createdAt: viewMode === 'create' ? new Date().toISOString() : selectedTest?.createdAt,
        updatedAt: new Date().toISOString()
      };

      // Try API first, fall back to localStorage
      try {
        if (viewMode === 'create') {
          const newTest = await assessmentAPI.createTest({ ...payload, status: 'DRAFT' });
          setTests(prev => [...prev, newTest]);
          showSuccess('Test created successfully!');
        } else {
          const updatedTest = await assessmentAPI.updateTest(selectedTest.id, payload);
          setTests(prev => prev.map(t => t.id === selectedTest.id ? updatedTest : t));
          showSuccess('Test updated successfully!');
        }
      } catch (apiError) {
        console.log('API not available, saving to localStorage');
        
        // Fallback to localStorage
        const localTests = localStorage.getItem('summative-tests-local');
        let tests = localTests ? JSON.parse(localTests) : [];
        
        if (viewMode === 'create') {
          const newTest = { ...payload, status: 'DRAFT' };
          tests.push(newTest);
          setTests(prev => [...prev, newTest]);
          showSuccess('Test created in localStorage!');
        } else {
          tests = tests.map(t => t.id === selectedTest.id ? payload : t);
          setTests(prev => prev.map(t => t.id === selectedTest.id ? payload : t));
          showSuccess('Test updated in localStorage!');
        }
        
        localStorage.setItem('summative-tests-local', JSON.stringify(tests));
      }
      
      console.log('✅ Save completed');
      setViewMode('list');
    } catch (error) {
      console.error('❌ Save failed:', error);
      showError('Failed to save test: ' + error.message);
      throw error; // Re-throw so CreateTestPage can catch it
    }
  };

  const handleSubmit = async (test) => {
    try {
      await workflowAPI.submit({ assessmentId: test.id, assessmentType: 'summative', comments: 'Submitted for approval' });
      setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Submitted' } : t));
      showSuccess(`${test.title} submitted for approval!`);
    } catch (error) {
      showError('Failed to submit test');
    }
  };

  const handleApprove = async (test) => {
    try {
      await workflowAPI.approve('summative', test.id, { comments: 'Approved' });
      setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Approved' } : t));
      showSuccess(`${test.title} approved!`);
    } catch (error) {
      showError('Failed to approve test');
    }
  };

  const handleReject = async (test) => {
    if (!window.confirm('Are you sure you want to reject this test?')) return;
    try {
      await workflowAPI.reject('summative', test.id, { comments: 'Rejected' });
      setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Draft' } : t));
      showSuccess(`${test.title} rejected!`);
    } catch (error) {
      showError('Failed to reject test');
    }
  };

  const handlePublish = async (test) => {
    try {
      await workflowAPI.publish('summative', test.id);
      setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Published' } : t));
      showSuccess(`${test.title} published successfully!`);
    } catch (error) {
      showError('Failed to publish test');
    }
  };

  const stats = useMemo(() => ({
    total: tests.length,
    draft: tests.filter(t => ['Draft', 'DRAFT'].includes(t.status)).length,
    published: tests.filter(t => ['Published', 'PUBLISHED'].includes(t.status)).length,
    completed: tests.filter(t => ['Completed', 'COMPLETED', 'Locked', 'LOCKED'].includes(t.status)).length
  }), [tests]);

  const handleStatusClick = async (test) => {
    const status = test.status?.toUpperCase();
    
    // Check permissions
    const canSubmit = ['TEACHER', 'HEAD_TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role);
    const canApprove = ['HEAD_TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(user?.role);
    const canPublish = ['ADMIN', 'HEAD_TEACHER', 'SUPER_ADMIN'].includes(user?.role);

    try {
      if ((status === 'DRAFT' || status === 'DRAFT') && canSubmit) {
        // Auto-approve logic for Admins: Submit AND Approve
        if (canApprove) {
          // Submit first
          await workflowAPI.submit({ assessmentId: test.id, assessmentType: 'summative', comments: 'Auto-submitted by Admin' });
          // Then Approve
          await workflowAPI.approve('summative', test.id, { comments: 'Auto-approved by Admin' });
          
          setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Approved' } : t));
          showSuccess(`${test.title} auto-approved!`);
        } else {
          // Just Submit for regular teachers
          await workflowAPI.submit({ assessmentId: test.id, assessmentType: 'summative', comments: 'Submitted for approval' });
          setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Submitted' } : t));
          showSuccess(`${test.title} submitted!`);
        }
      } else if ((status === 'SUBMITTED' || status === 'SUBMITTED') && canApprove) {
        await workflowAPI.approve('summative', test.id, { comments: 'Approved' });
        setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Approved' } : t));
        showSuccess(`${test.title} approved!`);
      } else if ((status === 'APPROVED' || status === 'APPROVED') && canPublish) {
        await workflowAPI.publish('summative', test.id);
        setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Published' } : t));
        showSuccess(`${test.title} published!`);
      }
    } catch (error) {
      console.error('Workflow action failed:', error);
      showError('Action failed: ' + (error.message || 'Unknown error'));
    }
  };

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <SummativeTestForm
        onBack={() => setViewMode('list')}
        onSuccess={(createdTest, selectedLearners) => {
          console.log('Test created:', createdTest);
          console.log('Selected learners:', selectedLearners);
          fetchTests(); // Refresh the tests list
          setViewMode('list');
          showSuccess('Test created successfully!');
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Compact Toolbar with Metrics */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Metrics */}
          <div className="flex items-center gap-4 overflow-x-auto pb-2 md:pb-0">
             <div className="text-right border-r pr-4 border-gray-200 min-w-[80px]">
               <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Tests</p>
               <p className="text-xl font-bold text-gray-800 leading-none">{stats.total}</p>
             </div>
             <div className="text-right border-r pr-4 border-gray-200 min-w-[60px]">
               <p className="text-[10px] text-orange-600 uppercase font-bold tracking-wider">Draft</p>
               <p className="text-xl font-bold text-orange-700 leading-none">{stats.draft}</p>
             </div>
             <div className="text-right border-r pr-4 border-gray-200 min-w-[80px]">
               <p className="text-[10px] text-green-600 uppercase font-bold tracking-wider">Published</p>
               <p className="text-xl font-bold text-green-700 leading-none">{stats.published}</p>
             </div>
             <div className="text-right min-w-[80px]">
               <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Completed</p>
               <p className="text-xl font-bold text-gray-800 leading-none">{stats.completed}</p>
             </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0">
            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
              <Plus size={20} /> <span className="hidden sm:inline">Create New Test</span><span className="inline sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Test Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Learning Area</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Weight</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Marks</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tests.map(test => (
                <tr key={test.id} className="hover:bg-gray-50 transition">
                  <td className="px-3 py-2">
                    <p className="font-semibold text-gray-800 text-sm">{test.name}</p>
                    <p className="text-xs text-gray-500">{test.term} {test.year}</p>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{test.grade}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{test.learningArea}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                      test.testType === 'End of Term' ? 'bg-purple-100 text-purple-800' :
                      test.testType === 'Mid-term' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>{test.testType}</span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{test.weight || 1.0}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{test.date}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{test.totalMarks}</td>
                  <td className="px-3 py-2">
                    <button 
                      onClick={() => handleStatusClick(test)}
                      title={
                        ['DRAFT', 'draft'].includes(test.status) ? 'Click to Submit' :
                        ['SUBMITTED', 'submitted'].includes(test.status) ? 'Click to Approve' :
                        ['APPROVED', 'approved'].includes(test.status) ? 'Click to Publish' : ''
                      }
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold transition-transform hover:scale-105 ${
                        ['PUBLISHED', 'published'].includes(test.status) ? 'bg-green-100 text-green-800 cursor-default' :
                        ['APPROVED', 'approved'].includes(test.status) ? 'bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200' :
                        ['SUBMITTED', 'submitted'].includes(test.status) ? 'bg-purple-100 text-purple-800 cursor-pointer hover:bg-purple-200' :
                        ['REJECTED', 'rejected'].includes(test.status) ? 'bg-red-100 text-red-800 cursor-default' :
                        ['COMPLETED', 'completed', 'LOCKED', 'locked'].includes(test.status) ? 'bg-gray-100 text-gray-800 cursor-default' :
                        'bg-orange-100 text-orange-800 cursor-pointer hover:bg-orange-200'
                      }`}
                    >
                      {test.status}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      {['DRAFT', 'draft'].includes(test.status) && (
                        <>
                          <button onClick={() => handleEdit(test)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                            <Edit size={16} />
                          </button>
                          <button onClick={() => handleSubmit(test)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Submit for Approval">
                            <Send size={16} />
                          </button>
                          <button onClick={() => handleDelete(test.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}

                      {['SUBMITTED', 'submitted'].includes(test.status) && (['ADMIN', 'SUPER_ADMIN', 'HEAD_TEACHER'].includes(user?.role)) && (
                        <>
                          <button onClick={() => handleApprove(test)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => handleReject(test)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}

                      {['APPROVED', 'approved'].includes(test.status) && (['ADMIN', 'SUPER_ADMIN'].includes(user?.role)) && (
                        <button onClick={() => handlePublish(test)} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Publish">
                          <Eye size={16} />
                        </button>
                      )}

                      {['PUBLISHED', 'published'].includes(test.status) && (
                         <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">Live</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>


    </div>
  );
};

export default SummativeTests;
