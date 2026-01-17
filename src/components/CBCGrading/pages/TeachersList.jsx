/**
 * Teachers List Page
 * Display and manage all teachers in table format
 */

import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, GraduationCap, BookOpen, CheckCircle, Clock } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import SearchFilter from '../shared/SearchFilter';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import StatsCard from '../shared/StatsCard';

const TeachersList = ({ teachers, onAddTeacher, onEditTeacher, onViewTeacher }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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

  const filters = [
    {
      label: 'Status',
      value: filterStatus,
      onChange: setFilterStatus,
      span: 2,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'Active', label: 'Active' },
        { value: 'On Leave', label: 'On Leave' },
        { value: 'Inactive', label: 'Inactive' }
      ]
    }
  ];

  const activeTeachers = teachers.filter(t => t.status === 'Active').length;
  const onLeave = teachers.filter(t => t.status === 'On Leave').length;
  const uniqueSubjects = [...new Set(teachers.map(t => t.subject))].length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Tutors"
        subtitle="Manage teaching staff and their assignments"
        icon={GraduationCap}
        actions={
          <button 
            onClick={onAddTeacher}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Add Tutor
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tutors"
          value={teachers.length}
          icon={GraduationCap}
          color="blue"
          subtitle="All staff"
        />
        <StatsCard
          title="Active"
          value={activeTeachers}
          icon={CheckCircle}
          color="green"
          subtitle="Teaching staff"
        />
        <StatsCard
          title="On Leave"
          value={onLeave}
          icon={Clock}
          color="orange"
          subtitle="Currently away"
        />
        <StatsCard
          title="Subjects"
          value={uniqueSubjects}
          icon={BookOpen}
          color="purple"
          subtitle="Learning areas"
        />
      </div>

      {/* Search & Filters */}
      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onReset={() => {
          setSearchTerm('');
          setFilterStatus('all');
        }}
        placeholder="Search by name, employee number, or subject..."
      />

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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{teacher.avatar}</span>
                      <div>
                        <p className="font-semibold">{teacher.firstName} {teacher.lastName}</p>
                        <p className="text-sm text-gray-500">{teacher.gender}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{teacher.employeeNo}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{teacher.role}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-blue-600" />
                      <span className="text-sm">{teacher.subject}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold">{teacher.email}</p>
                    <p className="text-xs text-gray-500">{teacher.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={teacher.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => onViewTeacher(teacher)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => onEditTeacher(teacher)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" 
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" 
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TeachersList;
