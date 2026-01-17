/**
 * Exited Learners Page
 * View and manage learners who have left the school
 */

import React, { useState } from 'react';
import { UserX, Search, Filter, Eye, RefreshCw } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import EmptyState from '../shared/EmptyState';
import { useNotifications } from '../hooks/useNotifications';

const ExitedLearnersPage = () => {
  const { showSuccess } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState(null);

  const [exitedLearners] = useState([
    {
      id: 100, firstName: 'David', lastName: 'Otieno', admNo: 'ADM010', grade: 'Grade 3', stream: 'A',
      exitDate: '2024-12-15', exitReason: 'Transferred', destination: 'Nairobi Academy',
      guardian: 'Michael Otieno', guardianPhone: '+254701234567', avatar: '👦'
    },
    {
      id: 101, firstName: 'Grace', lastName: 'Mwende', admNo: 'ADM025', grade: 'Grade 5', stream: 'B',
      exitDate: '2024-11-30', exitReason: 'Relocated', destination: 'Moved to Mombasa',
      guardian: 'Peter Mwende', guardianPhone: '+254702345678', avatar: '👧'
    },
    {
      id: 102, firstName: 'Samuel', lastName: 'Koech', admNo: 'ADM045', grade: 'Grade 4', stream: 'A',
      exitDate: '2024-10-20', exitReason: 'Graduated', destination: 'Secondary School',
      guardian: 'Lucy Koech', guardianPhone: '+254703456789', avatar: '👦'
    },
    {
      id: 103, firstName: 'Faith', lastName: 'Wangari', admNo: 'ADM018', grade: 'Grade 2', stream: 'C',
      exitDate: '2024-09-15', exitReason: 'Personal Reasons', destination: 'Homeschooling',
      guardian: 'John Wangari', guardianPhone: '+254704567890', avatar: '👧'
    }
  ]);

  const filteredLearners = exitedLearners.filter(learner => {
    const matchesSearch = learner.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.admNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReason = reasonFilter === 'all' || learner.exitReason === reasonFilter;
    return matchesSearch && matchesReason;
  });

  const handleReAdmit = (learner) => {
    showSuccess(`${learner.firstName} ${learner.lastName} has been re-admitted!`);
    setShowDetailsModal(false);
  };

  const stats = {
    total: exitedLearners.length,
    transferred: exitedLearners.filter(l => l.exitReason === 'Transferred').length,
    relocated: exitedLearners.filter(l => l.exitReason === 'Relocated').length,
    graduated: exitedLearners.filter(l => l.exitReason === 'Graduated').length,
    other: exitedLearners.filter(l => l.exitReason === 'Personal Reasons').length
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Exited Learners"
        subtitle="View learners who have left the school"
        icon={UserX}
      />

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 text-sm font-semibold">Total Exited</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm font-semibold">Transferred</p>
          <p className="text-3xl font-bold text-blue-800">{stats.transferred}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-700 text-sm font-semibold">Relocated</p>
          <p className="text-3xl font-bold text-orange-800">{stats.relocated}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm font-semibold">Graduated</p>
          <p className="text-3xl font-bold text-green-800">{stats.graduated}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-700 text-sm font-semibold">Other</p>
          <p className="text-3xl font-bold text-purple-800">{stats.other}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Search by name or admission number..."
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Exit Reasons</option>
              <option value="Transferred">Transferred to Another School</option>
              <option value="Relocated">Relocated</option>
              <option value="Graduated">Graduated</option>
              <option value="Personal Reasons">Personal Reasons</option>
            </select>
          </div>
        </div>
      </div>

      {/* Learners List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          {filteredLearners.length === 0 ? (
            <EmptyState
              icon={UserX}
              title="No Exited Learners Found"
              message="No learners match your search criteria"
            />
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Admission No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Grade/Stream</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Exit Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Exit Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLearners.map((learner) => (
                  <tr key={learner.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{learner.avatar}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{learner.firstName} {learner.lastName}</p>
                          <p className="text-sm text-gray-500">{learner.guardian}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-700">{learner.admNo}</td>
                    <td className="px-6 py-4 text-gray-700">{learner.grade} - {learner.stream}</td>
                    <td className="px-6 py-4 text-gray-600">{learner.exitDate}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        learner.exitReason === 'Transferred' ? 'bg-blue-100 text-blue-800' :
                        learner.exitReason === 'Relocated' ? 'bg-orange-100 text-orange-800' :
                        learner.exitReason === 'Graduated' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {learner.exitReason}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{learner.destination}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedLearner(learner); setShowDetailsModal(true); }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedLearner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedLearner.avatar}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedLearner.firstName} {selectedLearner.lastName}</h3>
                    <p className="text-red-100">{selectedLearner.admNo}</p>
                  </div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-white hover:text-red-100">
                  <UserX size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Grade & Stream</p>
                  <p className="text-lg font-bold text-gray-900">{selectedLearner.grade} - {selectedLearner.stream}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Exit Date</p>
                  <p className="text-lg font-bold text-gray-900">{selectedLearner.exitDate}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Exit Reason</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedLearner.exitReason === 'Transferred' ? 'bg-blue-100 text-blue-800' :
                    selectedLearner.exitReason === 'Relocated' ? 'bg-orange-100 text-orange-800' :
                    selectedLearner.exitReason === 'Graduated' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedLearner.exitReason}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Destination</p>
                  <p className="text-gray-900">{selectedLearner.destination}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">Guardian Information</p>
                <p className="text-gray-900">{selectedLearner.guardian}</p>
                <p className="text-gray-600">{selectedLearner.guardianPhone}</p>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => handleReAdmit(selectedLearner)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  <RefreshCw size={20} /> Re-Admit Learner
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExitedLearnersPage;
