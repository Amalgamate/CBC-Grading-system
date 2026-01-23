/**
 * Learners List Page
 * Display and manage all learners
 * Add Student button is restricted for teachers (view-only)
 */

import React, { useState, useEffect } from 'react';
import { Plus, Upload, Eye, Edit, Trash2, LogOut, Lock, ChevronLeft, ChevronRight, Search, RefreshCw, Users } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { usePermissions } from '../../../hooks/usePermissions';
import { useAuth } from '../../../hooks/useAuth';
import BulkOperationsModal from '../shared/bulk/BulkOperationsModal';

const LearnersList = ({ 
  learners, 
  loading,
  pagination,
  onFetchLearners,
  onAddLearner, 
  onEditLearner, 
  onViewLearner, 
  onMarkAsExited, 
  onDeleteLearner, 
  onRefresh 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const { can, isRole } = usePermissions();
  const { user } = useAuth();

  // Check if user can create learners (only admins, head teachers, super admins)
  const canCreateLearner = can('CREATE_LEARNER');
  const isTeacher = isRole('TEACHER');

  // Server-side filtering effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFetchLearners) {
        const params = {
          page: 1, // Reset to page 1 on filter change
          search: searchTerm,
          limit: pagination?.limit || 50
        };

        // Only add filters if they are not 'all'
        // undefined values are converted to string "undefined" by URLSearchParams, causing 0 results
        if (filterGrade !== 'all') params.grade = filterGrade;
        if (filterStatus !== 'all') params.status = filterStatus;

        onFetchLearners(params);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterGrade, filterStatus, onFetchLearners, pagination?.limit]);

  const handlePageChange = (newPage) => {
    if (onFetchLearners) {
      const params = {
        page: newPage,
        search: searchTerm,
        limit: pagination?.limit || 50
      };

      if (filterGrade !== 'all') params.grade = filterGrade;
      if (filterStatus !== 'all') params.status = filterStatus;

      onFetchLearners(params);
    }
  };

  const displayLearners = learners;

  const handleReset = () => {
    setSearchTerm('');
    setFilterGrade('all');
    setFilterStatus('all');
  };

  return (
    <div className="space-y-4">
      {/* Compact Quick Actions Toolbar */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-1">
            {/* Search */}
            <div className="relative flex-grow md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or admission number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Grades</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Exited">Exited</option>
                <option value="Deactivated">Deactivated</option>
              </select>
              
              {/* Reset Button */}
              {(searchTerm || filterGrade !== 'all' || filterStatus !== 'all') && (
                <button
                  onClick={handleReset}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                  title="Reset filters"
                >
                  <RefreshCw size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full xl:w-auto justify-end">
            {canCreateLearner ? (
              <>
                <button 
                  onClick={() => setShowBulkModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-green-700 border border-green-200 rounded-lg hover:bg-green-50 transition"
                  title="Bulk import/export students"
                >
                  <Upload size={18} />
                  <span className="hidden sm:inline">Bulk Operations</span>
                </button>
                <button 
                  onClick={onAddLearner}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">Add Student</span>
                  <span className="inline sm:hidden">Add</span>
                </button>
              </>
            ) : (
              <div className="relative group">
                <button 
                  disabled
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 border border-gray-200 rounded-lg cursor-not-allowed"
                >
                  <Lock size={18} />
                  <span>Add Student</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learners Table */}
      {loading && displayLearners.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : displayLearners.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Found"
          message={searchTerm || filterGrade !== 'all' || filterStatus !== 'all' 
            ? "No students match your search criteria." 
            : "No students have been added yet."}
          actionText={!searchTerm && filterGrade === 'all' && filterStatus === 'all' && canCreateLearner ? "Add Your First Student" : null}
          onAction={canCreateLearner ? onAddLearner : undefined}
        />
      ) : (
        <div className={`bg-white rounded-xl shadow-md overflow-hidden ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admission No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Guardian</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayLearners.map((learner) => (
                <tr key={learner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{learner.avatar}</span>
                      <div>
                        <p className="font-semibold">{learner.firstName} {learner.lastName}</p>
                        <p className="text-sm text-gray-500">{learner.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{learner.admNo}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{learner.grade} {learner.stream}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold">{learner.guardian1Name}</p>
                    <p className="text-xs text-gray-500">{learner.guardian1Phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={learner.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onViewLearner(learner)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      {!isTeacher && (
                        <>
                          <button 
                            onClick={() => onEditLearner(learner)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" 
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          {learner.status === 'Active' && (
                            <button 
                              onClick={() => onMarkAsExited(learner.id)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition" 
                              title="Mark as Exited"
                            >
                              <LogOut size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => onDeleteLearner(learner.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="flex items-center px-2 text-sm font-medium text-gray-700">
                  Page {pagination.page} of {pagination.pages}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium text-gray-700"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Operations Modal */}
      <BulkOperationsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Student Operations"
        entityType="learners"
        userRole={user?.role}
        onUploadComplete={() => {
          setShowBulkModal(false);
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};

export default LearnersList;
