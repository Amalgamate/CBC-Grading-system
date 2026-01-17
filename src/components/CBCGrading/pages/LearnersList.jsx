/**
 * Learners List Page
 * Display and manage all learners
 */

import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import SearchFilter from '../shared/SearchFilter';
import StatusBadge from '../shared/StatusBadge';
import EmptyState from '../shared/EmptyState';
import { Users } from 'lucide-react';

const LearnersList = ({ learners, onAddLearner, onEditLearner, onViewLearner, onDeleteLearner }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Filter learners
  const filteredLearners = learners.filter(l => {
    const matchesSearch = (l.firstName + ' ' + l.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.admNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || l.grade === filterGrade;
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const filters = [
    {
      label: 'Grade',
      value: filterGrade,
      onChange: setFilterGrade,
      span: 2,
      options: [
        { value: 'all', label: 'All Grades' },
        { value: 'Grade 1', label: 'Grade 1' },
        { value: 'Grade 2', label: 'Grade 2' },
        { value: 'Grade 3', label: 'Grade 3' },
        { value: 'Grade 4', label: 'Grade 4' },
        { value: 'Grade 5', label: 'Grade 5' },
        { value: 'Grade 6', label: 'Grade 6' }
      ]
    },
    {
      label: 'Status',
      value: filterStatus,
      onChange: setFilterStatus,
      span: 2,
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'Active', label: 'Active' },
        { value: 'Deactivated', label: 'Deactivated' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="All Learners"
        subtitle="Manage learner records and information"
        icon={Users}
        actions={
          <button 
            onClick={onAddLearner}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add Learner
          </button>
        }
      />

      {/* Search & Filters */}
      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onReset={() => {
          setSearchTerm('');
          setFilterGrade('all');
          setFilterStatus('all');
        }}
        placeholder="Search by name or admission number..."
      />

      {/* Learners Table */}
      {filteredLearners.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Learners Found"
          message={searchTerm || filterGrade !== 'all' || filterStatus !== 'all' 
            ? "No learners match your search criteria." 
            : "No learners have been added yet."}
          actionText={!searchTerm && filterGrade === 'all' && filterStatus === 'all' ? "Add Your First Learner" : null}
          onAction={onAddLearner}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Learner</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admission No</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Guardian</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLearners.map((learner) => (
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
                      <button 
                        onClick={() => onEditLearner(learner)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" 
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => onDeleteLearner(learner.id)}
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

export default LearnersList;
