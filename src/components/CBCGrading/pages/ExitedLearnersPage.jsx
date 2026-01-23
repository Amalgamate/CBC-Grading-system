/**
 * Exited Learners Page - Connected to Backend
 * View and manage learners who have left the school
 * Fetches real data from the database
 */

import React, { useState, useEffect } from 'react';
import { UserX, Search, Filter, Eye, RefreshCw, Download, AlertCircle } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useNotifications } from '../hooks/useNotifications';
import { useLearners } from '../hooks/useLearners';

const ExitedLearnersPage = () => {
  const { showSuccess, showError } = useNotifications();
  const { learners, loading, error, updateLearner } = useLearners();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLearner, setSelectedLearner] = useState(null);

  // Filter only exited learners (status not ACTIVE)
  const exitedLearners = learners?.filter(l => 
    l.status && l.status !== 'ACTIVE'
  ) || [];

  // Apply search and filter
  const filteredLearners = exitedLearners.filter(learner => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      learner.firstName?.toLowerCase().includes(searchLower) ||
      learner.lastName?.toLowerCase().includes(searchLower) ||
      learner.admissionNumber?.toLowerCase().includes(searchLower) ||
      learner.admNo?.toLowerCase().includes(searchLower);
    
    // Map database status to exit reasons
    const exitReason = getExitReason(learner.status);
    const matchesReason = reasonFilter === 'all' || exitReason === reasonFilter;
    
    return matchesSearch && matchesReason;
  });

  // Helper function to map status to exit reason
  const getExitReason = (status) => {
    const statusMap = {
      'TRANSFERRED_OUT': 'Transferred',
      'GRADUATED': 'Graduated',
      'DROPPED_OUT': 'Dropped Out',
      'SUSPENDED': 'Suspended'
    };
    return statusMap[status] || status;
  };

  // Calculate statistics
  const stats = {
    total: exitedLearners.length,
    transferred: exitedLearners.filter(l => l.status === 'TRANSFERRED_OUT').length,
    graduated: exitedLearners.filter(l => l.status === 'GRADUATED').length,
    droppedOut: exitedLearners.filter(l => l.status === 'DROPPED_OUT').length,
    suspended: exitedLearners.filter(l => l.status === 'SUSPENDED').length
  };

  const handleReAdmit = async (learner) => {
    try {
      // Update learner status back to ACTIVE
      await updateLearner(learner.id, {
        status: 'ACTIVE',
        exitDate: null,
        exitReason: null
      });
      
      showSuccess(`${learner.firstName} ${learner.lastName} has been re-admitted successfully!`);
      setShowDetailsModal(false);
    } catch (err) {
      console.error('Re-admission error:', err);
      showError('Failed to re-admit learner. Please try again.');
    }
  };

  const exportToCSV = () => {
    const headers = ['Admission No', 'First Name', 'Last Name', 'Grade', 'Stream', 'Exit Date', 'Exit Reason', 'Status'];
    const rows = filteredLearners.map(l => [
      l.admissionNumber || l.admNo,
      l.firstName,
      l.lastName,
      l.grade,
      l.stream || '',
      l.exitDate ? new Date(l.exitDate).toLocaleDateString() : '',
      l.exitReason || getExitReason(l.status),
      l.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exited-learners-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <LoadingSpinner message="Loading exited learners..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button
           onClick={exportToCSV}
           disabled={filteredLearners.length === 0}
           className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
         >
           <Download size={18} />
           Export CSV
         </button>
      </div>

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
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm font-semibold">Graduated</p>
          <p className="text-3xl font-bold text-green-800">{stats.graduated}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-700 text-sm font-semibold">Dropped Out</p>
          <p className="text-3xl font-bold text-orange-800">{stats.droppedOut}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-purple-700 text-sm font-semibold">Suspended</p>
          <p className="text-3xl font-bold text-purple-800">{stats.suspended}</p>
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
              <option value="Graduated">Graduated</option>
              <option value="Dropped Out">Dropped Out</option>
              <option value="Suspended">Suspended</option>
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
              message={exitedLearners.length === 0 
                ? "No learners have exited the school yet" 
                : "No learners match your search criteria"}
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLearners.map((learner) => {
                  const exitReason = getExitReason(learner.status);
                  const statusColor = {
                    'Transferred': 'bg-blue-100 text-blue-800',
                    'Graduated': 'bg-green-100 text-green-800',
                    'Dropped Out': 'bg-orange-100 text-orange-800',
                    'Suspended': 'bg-purple-100 text-purple-800'
                  }[exitReason] || 'bg-gray-100 text-gray-800';

                  return (
                    <tr key={learner.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {learner.photoUrl ? (
                            <img 
                              src={learner.photoUrl} 
                              alt={`${learner.firstName} ${learner.lastName}`}
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                              {learner.firstName?.charAt(0)}{learner.lastName?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">
                              {learner.firstName} {learner.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{learner.guardianName || 'No guardian'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-700">
                        {learner.admissionNumber || learner.admNo}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {learner.grade}{learner.stream ? ` - ${learner.stream}` : ''}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {learner.exitDate 
                          ? new Date(learner.exitDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                          {learner.exitReason || exitReason}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-gray-600">{learner.status}</span>
                      </td>
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
                  );
                })}
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
                  {selectedLearner.photoUrl ? (
                    <img 
                      src={selectedLearner.photoUrl} 
                      alt={`${selectedLearner.firstName} ${selectedLearner.lastName}`}
                      className="w-16 h-16 rounded-full object-cover border-4 border-white"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl">
                      {selectedLearner.firstName?.charAt(0)}{selectedLearner.lastName?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedLearner.firstName} {selectedLearner.lastName}
                    </h3>
                    <p className="text-red-100">{selectedLearner.admissionNumber || selectedLearner.admNo}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)} 
                  className="text-white hover:text-red-100"
                  type="button"
                >
                  <UserX size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-600">Grade & Stream</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedLearner.grade}{selectedLearner.stream ? ` - ${selectedLearner.stream}` : ''}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Exit Date</p>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedLearner.exitDate 
                      ? new Date(selectedLearner.exitDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Exit Reason</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    selectedLearner.status === 'TRANSFERRED_OUT' ? 'bg-blue-100 text-blue-800' :
                    selectedLearner.status === 'GRADUATED' ? 'bg-green-100 text-green-800' :
                    selectedLearner.status === 'DROPPED_OUT' ? 'bg-orange-100 text-orange-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedLearner.exitReason || getExitReason(selectedLearner.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Status</p>
                  <p className="text-gray-900">{selectedLearner.status}</p>
                </div>
              </div>

              {selectedLearner.exitReason && (
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Additional Details</p>
                  <p className="text-gray-700">{selectedLearner.exitReason}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">Guardian Information</p>
                <p className="text-gray-900">{selectedLearner.guardianName || 'N/A'}</p>
                <p className="text-gray-600">{selectedLearner.guardianPhone || 'N/A'}</p>
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
