/**
 * Daily Attendance Page (Backend Connected)
 * Mark daily attendance for classes with real API integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Save, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import LoadingSpinner from '../shared/LoadingSpinner';
import { useAttendance } from '../hooks/useAttendanceAPI';
import { useNotifications } from '../hooks/useNotifications';

const DailyAttendance = () => {
  // State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [dailyReport, setDailyReport] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  
  // Hooks
  const {
    classes,
    loading,
    error,
    getDailyClassReport,
    markBulkAttendance,
  } = useAttendance();

  const { showSuccess, showError } = useNotifications();

  // Load daily report when class or date changes
  const loadDailyReport = useCallback(async () => {
    const report = await getDailyClassReport(selectedClassId, selectedDate);
    if (report) {
      setDailyReport(report);
      // Initialize pending changes with existing attendance
      const initialChanges = {};
      report.learners.forEach(learner => {
        if (learner.attendance) {
          initialChanges[learner.id] = {
            status: learner.attendance.status,
            remarks: learner.attendance.remarks || '',
          };
        }
      });
      setPendingChanges(initialChanges);
    }
  }, [selectedClassId, selectedDate, getDailyClassReport]);

  useEffect(() => {
    if (selectedClassId && selectedDate) {
      loadDailyReport();
    }
  }, [selectedClassId, selectedDate, loadDailyReport]);

  // Get selected class details
  const selectedClass = classes.find(c => c.id === selectedClassId);

  // Handle status change
  const handleStatusChange = (learnerId, status) => {
    setPendingChanges(prev => ({
      ...prev,
      [learnerId]: {
        status,
        remarks: prev[learnerId]?.remarks || '',
      },
    }));
  };

  // Handle remarks change
  // eslint-disable-next-line no-unused-vars
  const handleRemarksChange = (learnerId, remarks) => {
    setPendingChanges(prev => ({
      ...prev,
      [learnerId]: {
        ...prev[learnerId],
        status: prev[learnerId]?.status || 'PRESENT',
        remarks,
      },
    }));
  };

  // Mark all as present
  const handleMarkAllPresent = () => {
    if (!dailyReport) return;
    
    const allPresent = {};
    dailyReport.learners.forEach(learner => {
      allPresent[learner.id] = {
        status: 'PRESENT',
        remarks: '',
      };
    });
    setPendingChanges(allPresent);
    showSuccess('All learners marked as present');
  };

  // Save attendance
  const handleSaveAttendance = async () => {
    if (!selectedClassId || !selectedDate) {
      showError('Please select a class and date');
      return;
    }

    // Convert pending changes to API format
    const attendanceRecords = Object.entries(pendingChanges).map(([learnerId, data]) => ({
      learnerId,
      status: data.status,
      remarks: data.remarks || undefined,
    }));

    if (attendanceRecords.length === 0) {
      showError('No attendance marked');
      return;
    }

    const result = await markBulkAttendance(selectedDate, selectedClassId, attendanceRecords);
    
    if (result.success) {
      showSuccess(result.message || 'Attendance saved successfully');
      // Reload the report to show updated data
      await loadDailyReport();
    } else {
      showError(result.error || 'Failed to save attendance');
    }
  };

  // Calculate statistics from pending changes
  const stats = {
    present: Object.values(pendingChanges).filter(p => p.status === 'PRESENT').length,
    absent: Object.values(pendingChanges).filter(p => p.status === 'ABSENT').length,
    late: Object.values(pendingChanges).filter(p => p.status === 'LATE').length,
    excused: Object.values(pendingChanges).filter(p => p.status === 'EXCUSED').length,
    sick: Object.values(pendingChanges).filter(p => p.status === 'SICK').length,
  };

  const totalMarked = Object.keys(pendingChanges).length;
  const totalLearners = dailyReport?.totalLearners || 0;

  return (
    <div className="space-y-6">
      {/* Actions Toolbar */}
      <div className="flex justify-end mb-4">
          <button
            onClick={handleMarkAllPresent}
            disabled={!dailyReport || loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle size={20} />
            Mark All Present
          </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Date and Class Selection */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Select Class & Date</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a class...</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} - {cls.grade.replace('_', ' ')} {cls.stream}
                </option>
              ))}
            </select>
          </div>

          {selectedClass && (
            <div className="flex items-end">
              <div className="text-sm">
                <p className="text-gray-600">Total Learners</p>
                <p className="text-2xl font-bold text-blue-600">{totalLearners}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Summary */}
      {totalMarked > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-semibold">Present</p>
                <p className="text-3xl font-bold text-green-800">{stats.present}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-semibold">Absent</p>
                <p className="text-3xl font-bold text-red-800">{stats.absent}</p>
              </div>
              <XCircle className="text-red-600" size={32} />
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-semibold">Late</p>
                <p className="text-3xl font-bold text-orange-800">{stats.late}</p>
              </div>
              <Clock className="text-orange-600" size={32} />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-semibold">Excused</p>
                <p className="text-3xl font-bold text-blue-800">{stats.excused}</p>
              </div>
              <AlertCircle className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-semibold">Sick</p>
                <p className="text-3xl font-bold text-purple-800">{stats.sick}</p>
              </div>
              <AlertCircle className="text-purple-600" size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md p-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Empty State - No class selected */}
      {!loading && !selectedClassId && (
        <EmptyState
          icon={Users}
          title="No Class Selected"
          message="Please select a class and date to mark attendance"
        />
      )}

      {/* Attendance Grid */}
      {!loading && dailyReport && dailyReport.learners.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">
              Mark Attendance - {selectedClass?.name}
            </h3>
            <p className="text-sm text-gray-600">
              Marked: {totalMarked} / {totalLearners}
            </p>
          </div>
          
          <div className="space-y-3">
            {dailyReport.learners.map((learner) => {
              const currentStatus = pendingChanges[learner.id]?.status;

              return (
                <div 
                  key={learner.id} 
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {learner.firstName} {learner.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{learner.admissionNumber}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(learner.id, 'PRESENT')}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentStatus === 'PRESENT'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <CheckCircle size={16} className="inline mr-1" />
                      Present
                    </button>

                    <button
                      onClick={() => handleStatusChange(learner.id, 'ABSENT')}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentStatus === 'ABSENT'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <XCircle size={16} className="inline mr-1" />
                      Absent
                    </button>

                    <button
                      onClick={() => handleStatusChange(learner.id, 'LATE')}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentStatus === 'LATE'
                          ? 'bg-orange-600 text-white'
                          : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      }`}
                    >
                      <Clock size={16} className="inline mr-1" />
                      Late
                    </button>

                    <button
                      onClick={() => handleStatusChange(learner.id, 'EXCUSED')}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentStatus === 'EXCUSED'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <AlertCircle size={16} className="inline mr-1" />
                      Excused
                    </button>

                    <button
                      onClick={() => handleStatusChange(learner.id, 'SICK')}
                      className={`px-4 py-2 rounded-lg transition ${
                        currentStatus === 'SICK'
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
                      }`}
                    >
                      <AlertCircle size={16} className="inline mr-1" />
                      Sick
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button */}
      {dailyReport && dailyReport.learners.length > 0 && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setPendingChanges({});
              showSuccess('Changes cleared');
            }}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
          >
            <RefreshCw size={20} />
            Clear Changes
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={loading || totalMarked === 0}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            Save Attendance ({totalMarked})
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyAttendance;
