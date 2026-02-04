/**
 * Learners List Page
 */

import React, { useState, useEffect } from 'react';
import { Plus, Upload, Eye, Edit, Trash2, LogOut, Lock, ChevronLeft, ChevronRight, Search, RefreshCw, Users, MoreVertical } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { usePermissions } from '../../../hooks/usePermissions';
import { useAuth } from '../../../hooks/useAuth';
import { configAPI } from '../../../services/api';
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
  onRefresh,
  onBulkDelete
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('ACTIVE');
  const [filterStream, setFilterStream] = useState('all');
  const [availableStreams, setAvailableStreams] = useState([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedLearners, setSelectedLearners] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { can, isRole } = usePermissions();
  const { user } = useAuth();

  // Check if user can create learners (only admins, head teachers, super admins)
  const canCreateLearner = can('CREATE_LEARNER');
  const isTeacher = isRole('TEACHER');

  // Fetch streams on mount
  useEffect(() => {
    const fetchStreams = async () => {
      if (user?.schoolId) {
        try {
          const resp = await configAPI.getStreamConfigs(user.schoolId);
          const arr = resp?.data || [];
          setAvailableStreams(arr.filter(s => s.active));
        } catch (error) {
          console.error('Failed to fetch streams:', error);
        }
      }
    };
    fetchStreams();
  }, [user?.schoolId]);

  // Server-side filtering effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onFetchLearners) {
        const params = {
          page: 1,
          search: searchTerm,
          limit: pagination?.limit || 50
        };

        if (filterGrade !== 'all') params.grade = filterGrade;
        if (filterStatus !== 'all') params.status = filterStatus;
        if (filterStream !== 'all') params.stream = filterStream;

        onFetchLearners(params);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterGrade, filterStatus, filterStream, onFetchLearners, pagination?.limit]);

  const handlePageChange = (newPage) => {
    if (onFetchLearners) {
      const params = {
        page: newPage,
        search: searchTerm,
        limit: pagination?.limit || 50
      };

      if (filterGrade !== 'all') params.grade = filterGrade;
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterStream !== 'all') params.stream = filterStream;

      onFetchLearners(params);
    }
  };

  const displayLearners = learners;

  const handleReset = () => {
    setSearchTerm('');
    setFilterGrade('all');
    setFilterStatus('ACTIVE');
    setSelectedLearners([]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLearners(displayLearners.map(l => l.id));
    } else {
      setSelectedLearners([]);
    }
  };

  const handleSelectLearner = (id) => {
    if (selectedLearners.includes(id)) {
      setSelectedLearners(selectedLearners.filter(learnerId => learnerId !== id));
    } else {
      setSelectedLearners([...selectedLearners, id]);
    }
  };

  const refreshData = () => {
    if (onFetchLearners) {
      const params = {
        page: pagination?.page || 1,
        search: searchTerm,
        limit: pagination?.limit || 50
      };

      if (filterGrade !== 'all') params.grade = filterGrade;
      if (filterStatus !== 'all') params.status = filterStatus;

      onFetchLearners(params);
    }
  };

  const handleIndividualDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      if (onBulkDelete) {
        await onBulkDelete([id]);
        refreshData();
      } else {
        await onDeleteLearner(id);
      }
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedLearners.length} students? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      if (onBulkDelete) {
        await onBulkDelete(selectedLearners);
      } else {
        await Promise.all(selectedLearners.map(id => onDeleteLearner(id)));
      }
      setSelectedLearners([]);
      refreshData();
    } catch (error) {
      console.error('Error deleting students:', error);
    } finally {
      setIsDeleting(false);
    }
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-brand-purple"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple bg-white"
              >
                <option value="all">All Grades</option>
                <optgroup label="Early Years">
                  <option value="CRECHE">Creche</option>
                  <option value="PLAYGROUP">Playgroup</option>
                  <option value="RECEPTION">Reception</option>
                  <option value="PP1">PP1</option>
                  <option value="PP2">PP2</option>
                  <option value="TRANSITION">Transition</option>
                </optgroup>
                <optgroup label="Primary">
                  <option value="GRADE_1">Grade 1</option>
                  <option value="GRADE_2">Grade 2</option>
                  <option value="GRADE_3">Grade 3</option>
                  <option value="GRADE_4">Grade 4</option>
                  <option value="GRADE_5">Grade 5</option>
                  <option value="GRADE_6">Grade 6</option>
                </optgroup>
                <optgroup label="Junior Secondary">
                  <option value="GRADE_7">Grade 7</option>
                  <option value="GRADE_8">Grade 8</option>
                  <option value="GRADE_9">Grade 9</option>
                </optgroup>
                <optgroup label="Senior Secondary">
                  <option value="GRADE_10">Grade 10</option>
                  <option value="GRADE_11">Grade 11</option>
                  <option value="GRADE_12">Grade 12</option>
                </optgroup>
              </select>

              <select
                value={filterStream}
                onChange={(e) => setFilterStream(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple bg-white"
              >
                <option value="all">All Streams</option>
                {availableStreams.map(stream => (
                  <option key={stream.id} value={stream.name}>
                    {stream.name}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple bg-white"
              >
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="DROPPED_OUT">Exited (Dropped Out)</option>
                <option value="TRANSFERRED_OUT">Transferred Out</option>
                <option value="GRADUATED">Graduated</option>
                <option value="SUSPENDED">Suspended</option>
              </select>

              {/* Reset Button */}
              {(searchTerm || filterGrade !== 'all' || filterStatus !== 'all' || filterStream !== 'all') && (
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

          {/* Action Buttons & Metrics */}
          <div className="flex gap-3 w-full xl:w-auto justify-end items-center">
            {/* Metrics */}
            <div className="hidden lg:flex items-center gap-4 mr-2 border-r pr-4 border-gray-200 h-10">
              <div className="text-right">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Students</p>
                <p className="text-xl font-bold text-gray-800 leading-none">{pagination?.total || 0}</p>
              </div>
            </div>

            {canCreateLearner ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="p-2 bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-lg transition"
                    title="Quick Actions"
                  >
                    <MoreVertical size={20} />
                  </button>
                  {showQuickActions && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowQuickActions(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1">
                        <button
                          onClick={() => {
                            setShowQuickActions(false);
                            setShowBulkModal(true);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Upload size={16} />
                          Bulk Operations
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={onAddLearner}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition shadow-sm font-bold"
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

      {/* Bulk Actions Toolbar */}
      {selectedLearners.length > 0 && (
        <div className="bg-brand-purple/5 border border-brand-purple/10 rounded-xl p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="bg-brand-purple text-white text-sm font-bold px-3 py-1 rounded-full">
              {selectedLearners.length}
            </span>
            <span className="text-brand-purple font-medium">Students Selected</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedLearners([])}
              className="px-4 py-2 text-brand-purple hover:bg-brand-purple/10 rounded-lg transition text-sm font-medium"
            >
              Cancel
            </button>
            {canCreateLearner && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Trash2 size={18} />
                )}
                <span>Delete Selected</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Learners Table */}
      {loading && displayLearners.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-teal"></div>
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
                <th className="px-3 py-2 w-4">
                  <input
                    type="checkbox"
                    checked={displayLearners.length > 0 && selectedLearners.length === displayLearners.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Admission No</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Guardian</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayLearners.map((learner) => (
                <tr key={learner.id} className={`hover:bg-gray-50 ${selectedLearners.includes(learner.id) ? 'bg-brand-purple/5' : ''}`}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={selectedLearners.includes(learner.id)}
                      onChange={() => handleSelectLearner(learner.id)}
                      className="w-4 h-4 text-brand-teal border-gray-300 rounded focus:ring-brand-teal"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{learner.avatar}</span>
                      <div>
                        <p className="font-semibold text-sm">{learner.firstName} {learner.lastName}</p>
                        <p className="text-xs text-gray-500">{learner.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">{learner.admNo}</td>
                  <td className="px-3 py-2 text-sm font-semibold">{learner.grade} {learner.stream}</td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-semibold">{learner.guardianName || (learner.parent ? `${learner.parent.firstName} ${learner.parent.lastName}` : '')}</p>
                    <p className="text-xs text-gray-500">{learner.guardianPhone || (learner.parent ? learner.parent.phone : '')}</p>
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={learner.status} size="sm" />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onViewLearner(learner)}
                        className="p-1.5 text-brand-teal hover:bg-brand-teal/10 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {!isTeacher && (
                        <>
                          <button
                            onClick={() => onEditLearner(learner)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          {learner.status === 'Active' && (
                            <button
                              onClick={() => onMarkAsExited(learner.id)}
                              className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Mark as Exited"
                            >
                              <LogOut size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleIndividualDelete(learner.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
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
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-bold text-brand-purple"
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
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-bold text-brand-purple"
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
        onUploadComplete={() => {
          setShowBulkModal(false);
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};

export default LearnersList;
