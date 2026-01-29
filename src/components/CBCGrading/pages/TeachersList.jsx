/**
 * Teachers List Page
 * Display and manage all teachers in table format
 */

import React, { useState } from 'react';
import { Plus, Upload, Eye, Edit, Trash2, GraduationCap, BookOpen, Search, RefreshCw, MoreVertical } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { useAuth } from '../../../hooks/useAuth';
import BulkOperationsModal from '../shared/bulk/BulkOperationsModal';
import AssignClassModal from '../shared/AssignClassModal';

const TeachersList = ({ teachers, onAddTeacher, onEditTeacher, onViewTeacher, onDeleteTeacher, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [selectedTeacherForAssignment, setSelectedTeacherForAssignment] = useState(null);
  useAuth();

  // Filter teachers
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch =
      t.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.employeeNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleReset = () => {
    setSearchTerm('');
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
                placeholder="Search by name, employee number, or subject..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>

              {/* Reset Button */}
              {(searchTerm || filterStatus !== 'all') && (
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
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Tutors</p>
                <p className="text-xl font-bold text-gray-800 leading-none">{teachers?.length || 0}</p>
              </div>
            </div>

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
              onClick={onAddTeacher}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Tutor</span>
              <span className="inline sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      {filteredTeachers.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No Teachers Found"
          message={searchTerm || filterStatus !== 'all'
            ? "No teachers match your search criteria."
            : "No teachers have been added yet."}
          actionText={!searchTerm && filterStatus === 'all' ? "Add Your First Teacher" : null}
          onAction={onAddTeacher}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Teacher</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Employee No</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{teacher.avatar}</span>
                      <div>
                        <p className="font-semibold text-sm">{teacher.firstName} {teacher.lastName}</p>
                        <p className="text-xs text-gray-500">{teacher.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">{teacher.employeeNo}</td>
                  <td className="px-3 py-2 text-sm font-semibold">{teacher.role}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <BookOpen size={16} className="text-blue-600" />
                      <span className="text-sm">{teacher.subject}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <p className="text-sm font-semibold">{teacher.email}</p>
                    <p className="text-xs text-gray-500">{teacher.phone}</p>
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={teacher.status} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedTeacherForAssignment(teacher)}
                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Assign to Grade"
                      >
                        <GraduationCap size={16} />
                      </button>
                      <button
                        onClick={() => onViewTeacher(teacher)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEditTeacher(teacher)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteTeacher(teacher.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Operations Modal */}
      <BulkOperationsModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        title="Bulk Tutor Operations"
        entityType="teachers"
        onUploadComplete={() => {
          setShowBulkModal(false);
          if (onRefresh) onRefresh();
        }}
      />

      {/* Assign Class Modal */}
      <AssignClassModal
        isOpen={!!selectedTeacherForAssignment}
        onClose={() => setSelectedTeacherForAssignment(null)}
        teacher={selectedTeacherForAssignment}
        onAssign={() => {
          if (onRefresh) onRefresh();
        }}
      />
    </div>
  );
};

export default TeachersList;
