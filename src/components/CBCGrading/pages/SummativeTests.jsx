/**
 * Summative Tests Page
 * Create and manage summative tests
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Eye, Loader, Send, CheckCircle, XCircle, ClipboardList, Database } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../../../hooks/useAuth';
import { assessmentAPI, classAPI, workflowAPI } from '../../../services/api';
import SummativeTestForm from '../../../pages/assessments/SummativeTestForm';
import ConfirmDialog from '../shared/ConfirmDialog';
import EmptyState from '../shared/EmptyState';

const SummativeTests = ({ onNavigate }) => {
  const { showSuccess, showError } = useNotifications();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // View State: 'list' | 'create' | 'edit'
  const [viewMode, setViewMode] = useState('list');

  const [selectedTest, setSelectedTest] = useState(null);
  const [, setTestData] = useState({
    title: '', grade: '', learningArea: '', term: 'Term 1',
    year: '2026', testType: 'End of Term', date: '', duration: 90, totalMarks: 100,
    passMarks: 50, instructions: '', weight: 1.0
  });

  const [tests, setTests] = useState([]);
  const [, setAvailableGrades] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', message: '', onConfirm: () => { } });

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
      setAvailableGrades(['PP1', 'PP2', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9']);
    } catch (error) {
      console.error('Error fetching classes:', error);
      // Fallback to default grades if fetch fails
      setAvailableGrades(['PP1', 'PP2', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9']);
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
    // Map test fields to testData format if needed
    setTestData({
      ...test,
      title: test.title || test.name || '',
      date: test.testDate ? new Date(test.testDate).toISOString().split('T')[0] : (test.date || '')
    });
    setViewMode('edit');
  };

  const handleDelete = async (id) => {
    const test = tests.find(t => t.id === id);
    setConfirmConfig({
      title: 'Delete Assessment',
      message: `Are you sure you want to delete "${test?.title || 'this test'}"?\n\nIf this test has associated results, it will be archived instead of permanently deleted.`,
      confirmText: 'Delete Test',
      onConfirm: async () => {
        try {
          setShowConfirm(false);
          const response = await assessmentAPI.deleteTest(id);
          if (response.success) {
            if (response.message.includes('archived')) {
              showSuccess(response.message);
              // Update the test status to archived in the frontend state
              setTests(prev => prev.map(t => t.id === id ? { ...t, archived: true, status: 'ARCHIVED' } : t));
            } else {
              showSuccess('Test permanently deleted successfully!');
              setTests(prev => prev.filter(t => t.id !== id));
            }
          } else {
            showError(response.message || 'Failed to delete test');
          }
        } catch (error) {
          console.error('Error deleting test:', error);
          showError('Failed to delete test: ' + error.message);
        } finally {
          fetchTests(); // Refresh the list to reflect any changes, including archival
        }
      }
    });
    setShowConfirm(true);
  };

  const handleArchive = (id) => {
    setTests(prev => prev.map(t => t.id === id ? { ...t, archived: true, status: 'ARCHIVED' } : t));
    showSuccess('Test archived!');
  };

  // eslint-disable-next-line no-unused-vars -- reserved for SummativeTestForm integration
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
          const newStatus = user?.role === 'SUPER_ADMIN' ? 'APPROVED' : 'DRAFT';
          const newTest = await assessmentAPI.createTest({ ...payload, status: newStatus });
          setTests(prev => [...prev, newTest]);
          showSuccess(newStatus === 'APPROVED' ? 'Test created and approved!' : 'Test created successfully!');
        } else {
          const updatedTest = await assessmentAPI.updateTest(selectedTest.id, payload);
          setTests(prev => prev.map(t => t.id === selectedTest.id ? updatedTest : t));
          showSuccess('Test updated successfully!');
        }
        fetchTests(); // Refresh after save
      } catch (apiError) {
        console.log('API not available, saving to localStorage');

        // Fallback to localStorage
        const localTests = localStorage.getItem('summative-tests-local');
        let tests = localTests ? JSON.parse(localTests) : [];

        if (viewMode === 'create') {
          const newStatus = user?.role === 'SUPER_ADMIN' ? 'APPROVED' : 'DRAFT';
          const newTest = { ...payload, status: newStatus };
          tests.push(newTest);
          setTests(prev => [...prev, newTest]);
          showSuccess(newStatus === 'APPROVED' ? 'Test created and approved locally!' : 'Test created in localStorage!');
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

  const handleAutoApprove = async (test) => {
    try {
      // Logic Flow:
      // 1. If DRAFT -> Submit First
      // 2. Then Approve (works for both DRAFT->SUBMITTED and existing SUBMITTED)

      const isDraft = ['DRAFT', 'draft'].includes(test.status);
      const isSubmitted = ['SUBMITTED', 'submitted'].includes(test.status);

      if (isDraft) {
        await workflowAPI.submit({ assessmentId: test.id, assessmentType: 'summative', comments: 'Auto-submitted by Admin' });
      } else if (!isSubmitted) {
        // Should not happen given UI logic, but safety check
        console.warn('Auto-approve called on invalid status:', test.status);
      }

      // 2. Approve
      await workflowAPI.approve('summative', test.id, { comments: 'Auto-approved by Admin' });

      setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Approved' } : t));
      showSuccess(`${test.title} successfully approved!`);
    } catch (error) {
      console.error('Auto-approve failed:', error);
      showError('Failed to approve test: ' + (error.message || 'Unknown error'));
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
      const existingResultsResponse = await assessmentAPI.getTestResults(test.id);
      const existingResults = existingResultsResponse.data || existingResultsResponse || [];

      if (existingResults.length > 0) {
        // If results exist, do not allow direct publishing, instead, show an error and suggest locking
        showError(
          `Cannot publish test with ${existingResults.length} existing results. \n\n` +
          `Please lock the test from the assessment entry page if you want to finalize it, \n` +
          `or delete all results first to allow editing.`
        );
        return;
      }

      // Proceed with publishing if no results exist
      await workflowAPI.publish('summative', test.id);
      
      // After publishing, automatically lock the test to prevent further edits to its structure
      await assessmentAPI.updateTest(test.id, { locked: true });

      setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Published', locked: true } : t));
      showSuccess(`${test.title} published and locked successfully!`);
    } catch (error) {
      console.error('Error publishing test:', error);
      showError('Failed to publish test');
    }
  };

  const handleBulkDelete = async () => {
    setConfirmConfig({
      title: 'Bulk Delete Assessments',
      message: `You are about to delete ${selectedIds.length} summative tests.\n\nTests with associated results will be archived, while those without will be permanently deleted.`,
      confirmText: 'Bulk Delete',
      onConfirm: async () => {
        try {
          setShowConfirm(false);
          setLoading(true);
          const deletePromises = selectedIds.map(id => assessmentAPI.deleteTest(id));
          const responses = await Promise.allSettled(deletePromises);

          let deletedCount = 0;
          let archivedCount = 0;
          let failedCount = 0;

          responses.forEach(result => {
            if (result.status === 'fulfilled') {
              const response = result.value;
              if (response.success) {
                if (response.message.includes('archived')) {
                  archivedCount++;
                } else {
                  deletedCount++;
                }
              } else {
                failedCount++;
                console.error('Failed to process test:', response.message);
              }
            } else {
              failedCount++;
              console.error('Error during bulk delete operation:', result.reason);
            }
          });

          let finalMessage = `Bulk Operation Complete:\n\n`;
          if (deletedCount > 0) finalMessage += `✅ Permanently deleted ${deletedCount} test(s).\n`;
          if (archivedCount > 0) finalMessage += `📦 Archived ${archivedCount} test(s) (had existing results).\n`;
          if (failedCount > 0) finalMessage += `❌ Failed to process ${failedCount} test(s).\n`;

          showSuccess(finalMessage);
          setSelectedIds([]);
          fetchTests();
        } catch (error) {
          console.error('Bulk delete operation failed:', error);
          showError('Operational Failure: Failed to complete bulk delete');
          fetchTests();
        } finally {
          setLoading(false);
        }
      }
    });
    setShowConfirm(true);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === tests.length && tests.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tests.map(t => t.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
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
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

    try {
      if (status === 'DRAFT' && canSubmit) {
        // Admins can auto-approve their own tests
        if (isAdmin) {
          // Submit first
          await workflowAPI.submit({ assessmentId: test.id, assessmentType: 'summative', comments: 'Auto-submitted by Admin' });
          // Then Approve
          await workflowAPI.approve('summative', test.id, { comments: 'Self-approved by Admin' });

          setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Approved' } : t));
          showSuccess(`${test.title} auto-approved!`);
        } else {
          // Teachers and Head Teachers must submit for approval
          await workflowAPI.submit({ assessmentId: test.id, assessmentType: 'summative', comments: 'Submitted for approval' });
          setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Submitted' } : t));
          showSuccess(`${test.title} submitted for review!`);
        }
      } else if (status === 'SUBMITTED' && canApprove) {
        // All admins can approve their own tests, others cannot
        const isOwnTest = test.submittedBy === user?.userId;
        
        // Debug logging
        console.log('=== APPROVAL CHECK DEBUG ===');
        console.log('User ID:', user?.userId);
        console.log('User Role:', user?.role);
        console.log('Test submittedBy:', test.submittedBy);
        console.log('Is own test:', isOwnTest);
        console.log('Is admin:', isAdmin);
        console.log('Can approve:', canApprove);
        console.log('==========================');
        
        if (isOwnTest && !isAdmin) {
          showError('You cannot approve your own test. Please wait for an administrator to review it.');
          return;
        }

        await workflowAPI.approve('summative', test.id, { comments: isAdmin && isOwnTest ? 'Self-approved by Admin' : 'Approved' });
        setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Approved' } : t));
        showSuccess(`${test.title} approved!`);
      } else if (status === 'APPROVED' && canPublish) {
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
          {selectedIds.length > 0 ? (
            <div className="flex items-center gap-4 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 flex-1">
              <span className="text-sm font-bold text-blue-700">{selectedIds.length} Selected</span>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-md hover:bg-red-700 transition"
                >
                  <Trash2 size={14} /> Bulk Delete
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 bg-white text-gray-600 text-xs font-bold rounded-md border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
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
          )}

          {/* Actions */}
          <div className="flex-shrink-0">
            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-bold">
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
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={tests.length > 0 && selectedIds.length === tests.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Test Name</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Learning Area</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Weight</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase text-center">Marks</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tests.map(test => (
                <tr key={test.id} className={`hover:bg-gray-50 transition ${selectedIds.includes(test.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(test.id)}
                      onChange={() => toggleSelect(test.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <p className="font-semibold text-gray-800 text-sm">{test.title || test.name}</p>
                    <p className="text-xs text-gray-500">{test.term} {test.academicYear || test.year}</p>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{test.grade?.replace('_', ' ')}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{test.learningArea || test.subject || 'General'}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${test.testType === 'End of Term' ? 'bg-purple-100 text-purple-800' :
                      test.testType === 'Mid-term' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>{test.testType || test.type || 'Exam'}</span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{test.weight || 1}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">
                    {test.testDate ? new Date(test.testDate).toLocaleDateString() : test.date}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700 text-center">{test.totalMarks}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleStatusClick(test)}
                      title={
                        ['DRAFT', 'draft'].includes(test.status) ? 'Click to Submit' :
                          ['SUBMITTED', 'submitted'].includes(test.status) ? 'Click to Approve' :
                            ['APPROVED', 'approved'].includes(test.status) ? 'Click to Publish' : ''
                      }
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold transition-transform hover:scale-105 ${['PUBLISHED', 'published'].includes(test.status) ? 'bg-green-100 text-green-800 cursor-default' :
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
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {['DRAFT', 'draft'].includes(test.status) ? (
                        <>
                          <button onClick={() => handleEdit(test)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                            <Edit size={16} />
                          </button>

                          {['ADMIN', 'SUPER_ADMIN'].includes(user?.role) ? (
                            <button onClick={() => handleAutoApprove(test)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition" title="Auto Approve Now">
                              <CheckCircle size={16} />
                            </button>
                          ) : (
                            <button onClick={() => handleSubmit(test)} className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Submit for Approval">
                              <Send size={16} />
                            </button>
                          )}
                        </>
                      ) : (
                        ['PUBLISHED', 'published', 'APPROVED', 'approved'].includes(test.status) && (
                          <button
                            onClick={() => onNavigate && onNavigate('assess-summative-assessment', { initialTestId: test.id })}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Record Marks"
                          >
                            <ClipboardList size={16} />
                          </button>
                        )
                      )}

                      {['SUBMITTED', 'submitted'].includes(test.status) && (['ADMIN', 'SUPER_ADMIN', 'HEAD_TEACHER'].includes(user?.role)) && (
                        <>
                          {/* Only show approve button if it's not their own OR they are Admin/Super Admin */}
                          {(test.submittedBy !== user?.userId || ['ADMIN', 'SUPER_ADMIN'].includes(user?.role)) ? (
                            <button onClick={() => handleApprove(test)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve">
                              <CheckCircle size={16} />
                            </button>
                          ) : (
                            <span className="p-1.5 text-gray-400 italic" title="Awaiting review by another admin">
                              <Loader size={12} className="animate-spin inline mr-1" />
                              Reviewing
                            </span>
                          )}
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

                      {/* Archive button for all tests */}
                      <button
                        onClick={() => handleArchive(test.id)}
                        className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                        title={test.archived ? "Archived" : "Archive"}
                        disabled={test.archived}
                      >
                        <ClipboardList size={16} />
                      </button>
                      {/* Always show delete for all tests to ensure cleanup is possible */}
                      <button onClick={() => handleDelete(test.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tests.length === 0 && !loading && (
            <EmptyState
              icon={Database}
              title="No Summative Tests Found"
              message="Your assessment repository is currently empty. Start by creating a new summative test architecture for your classes."
              actionText="Create New Test"
              onAction={handleAdd}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        show={showConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText || 'Confirm'}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setShowConfirm(false)}
        confirmButtonClass={confirmConfig.title.includes('Delete') ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}
      />
    </div>
  );
};

export default SummativeTests;
