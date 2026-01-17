/**
 * Daily Attendance Page
 * Mark daily attendance for classes
 */

import React, { useState } from 'react';
import { Calendar, Users, Save, CheckCircle, Clock, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import EmptyState from '../shared/EmptyState';
import { useAttendance } from '../hooks/useAttendance';
import { useNotifications } from '../hooks/useNotifications';
import { getCurrentDate } from '../utils/dateHelpers';

const DailyAttendance = ({ learners }) => {
  // Local state
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [selectedClass, setSelectedClass] = useState('Grade 3');
  const [selectedStream, setSelectedStream] = useState('A');
  
  // Custom hooks
  const {
    attendanceRecords,
    markAttendance,
    markAllPresent,
    getAttendanceForDate
  } = useAttendance();

  const { showSuccess, showError } = useNotifications();

  // Filter learners for selected class
  const classLearners = learners.filter(l => 
    l.grade === selectedClass && 
    l.stream === selectedStream &&
    l.status === 'Active'
  );

  // Get attendance for current selection
  const todaysAttendance = getAttendanceForDate(selectedDate, selectedClass, selectedStream);

  // Handlers
  const handleAttendanceChange = (learnerId, status) => {
    markAttendance(learnerId, selectedDate, status);
    const learner = learners.find(l => l.id === learnerId);
    showSuccess(`${learner.firstName}'s attendance marked as ${status}`);
  };

  const handleMarkAllPresent = () => {
    const learnerIds = classLearners.map(l => l.id);
    markAllPresent(learnerIds, selectedDate);
    showSuccess(`All learners marked as present for ${selectedDate}`);
  };

  // Calculate statistics
  const stats = {
    present: todaysAttendance.filter(a => a.status === 'Present').length,
    absent: todaysAttendance.filter(a => a.status === 'Absent').length,
    late: todaysAttendance.filter(a => a.status === 'Late').length,
    excused: todaysAttendance.filter(a => a.status === 'Excused').length
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Daily Attendance"
        subtitle="Mark attendance for today's classes"
        icon={Calendar}
        actions={
          <button
            onClick={handleMarkAllPresent}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <CheckCircle size={20} />
            Mark All Present
          </button>
        }
      />

      {/* Date and Class Selection */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Select Class</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={getCurrentDate()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Stream</label>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="A">Stream A</option>
              <option value="B">Stream B</option>
              <option value="C">Stream C</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm">
              <p className="text-gray-600">Total Learners</p>
              <p className="text-2xl font-bold text-blue-600">{classLearners.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      {todaysAttendance.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-semibold">Present</p>
                <p className="text-3xl font-bold text-green-800">{stats.present}</p>
              </div>
              <CheckCircle className="text-green-600" size={40} />
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-700 text-sm font-semibold">Absent</p>
                <p className="text-3xl font-bold text-red-800">{stats.absent}</p>
              </div>
              <XCircle className="text-red-600" size={40} />
            </div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-700 text-sm font-semibold">Late</p>
                <p className="text-3xl font-bold text-orange-800">{stats.late}</p>
              </div>
              <Clock className="text-orange-600" size={40} />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-semibold">Excused</p>
                <p className="text-3xl font-bold text-blue-800">{stats.excused}</p>
              </div>
              <AlertCircle className="text-blue-600" size={40} />
            </div>
          </div>
        </div>
      )}

      {/* Attendance Grid */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-6">
          Mark Attendance - {selectedClass} {selectedStream}
        </h3>
        
        {classLearners.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Learners Found"
            message="No learners found in this class"
          />
        ) : (
          <div className="space-y-3">
            {classLearners.map((learner) => {
              const attendance = todaysAttendance.find(a => a.learnerId === learner.id);
              const status = attendance?.status || 'Not Marked';

              return (
                <div 
                  key={learner.id} 
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{learner.avatar}</span>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {learner.firstName} {learner.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{learner.admNo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAttendanceChange(learner.id, 'Present')}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                        status === 'Present'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      <CheckCircle size={18} />
                      Present
                    </button>

                    <button
                      onClick={() => handleAttendanceChange(learner.id, 'Absent')}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                        status === 'Absent'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      <XCircle size={18} />
                      Absent
                    </button>

                    <button
                      onClick={() => handleAttendanceChange(learner.id, 'Late')}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                        status === 'Late'
                          ? 'bg-orange-600 text-white'
                          : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                      }`}
                    >
                      <Clock size={18} />
                      Late
                    </button>

                    <button
                      onClick={() => handleAttendanceChange(learner.id, 'Excused')}
                      className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                        status === 'Excused'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      <AlertCircle size={18} />
                      Excused
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save Button */}
      {classLearners.length > 0 && (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => {
              setSelectedDate(getCurrentDate());
              setSelectedClass('Grade 3');
              setSelectedStream('A');
              showSuccess('Form reset');
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            <RefreshCw size={20} />
            Reset
          </button>
          <button
            onClick={() => showSuccess('Attendance saved successfully')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Save size={20} />
            Save Attendance
          </button>
        </div>
      )}
    </div>
  );
};

export default DailyAttendance;
