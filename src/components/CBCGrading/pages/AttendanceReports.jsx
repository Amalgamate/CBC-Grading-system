/**
 * Attendance Reports Page
 * Generate and view attendance reports with filtering
 */

import React, { useState } from 'react';
import { Calendar, Download, FileText, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import StatsCard from '../shared/StatsCard';
import EmptyState from '../shared/EmptyState';
import { useAttendance } from '../hooks/useAttendance';
import { getCurrentDate } from '../utils/dateHelpers';

const AttendanceReports = ({ learners }) => {
  const [filterGrade, setFilterGrade] = useState('all');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');

  const { attendanceRecords } = useAttendance();

  // Filter attendance records
  const filteredRecords = attendanceRecords.filter(record => {
    const learner = learners.find(l => l.id === record.learnerId);
    if (!learner) return false;
    
    const matchesGrade = filterGrade === 'all' || learner.grade === filterGrade;
    const matchesStartDate = !reportStartDate || record.date >= reportStartDate;
    const matchesEndDate = !reportEndDate || record.date <= reportEndDate;
    
    return matchesGrade && matchesStartDate && matchesEndDate;
  });

  // Calculate statistics
  const stats = {
    totalDays: [...new Set(filteredRecords.map(r => r.date))].length,
    present: filteredRecords.filter(r => r.status === 'Present').length,
    absent: filteredRecords.filter(r => r.status === 'Absent').length,
    late: filteredRecords.filter(r => r.status === 'Late').length,
    excused: filteredRecords.filter(r => r.status === 'Excused').length
  };

  return (
    <div className="space-y-6">
      {/* Actions Toolbar */}
      <div className="flex justify-end mb-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            <Download size={20} />
            Export Report
          </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4 text-purple-700">Report Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Grades</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={reportStartDate}
              onChange={(e) => setReportStartDate(e.target.value)}
              max={getCurrentDate()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={reportEndDate}
              onChange={(e) => setReportEndDate(e.target.value)}
              max={getCurrentDate()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterGrade('all');
                setReportStartDate('');
                setReportEndDate('');
              }}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatsCard
          title="Total Days"
          value={stats.totalDays}
          icon={Calendar}
          color="purple"
          subtitle="Attendance marked"
        />
        <StatsCard
          title="Present"
          value={stats.present}
          icon={CheckCircle}
          color="green"
          subtitle="Total present records"
        />
        <StatsCard
          title="Absent"
          value={stats.absent}
          icon={XCircle}
          color="red"
          subtitle="Total absent records"
        />
        <StatsCard
          title="Late"
          value={stats.late}
          icon={Clock}
          color="orange"
          subtitle="Total late records"
        />
        <StatsCard
          title="Excused"
          value={stats.excused}
          icon={Users}
          color="blue"
          subtitle="Total excused records"
        />
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h4 className="font-bold text-gray-800">Attendance Records</h4>
        </div>
        
        {filteredRecords.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Records Found"
            message={filterGrade !== 'all' || reportStartDate || reportEndDate
              ? "No attendance records match your filter criteria"
              : "No attendance records available"}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Learner</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Class</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Marked By</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRecords.map((record) => {
                  const learner = learners.find(l => l.id === record.learnerId);
                  if (!learner) return null;
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{learner.avatar}</span>
                          <div>
                            <p className="font-semibold text-sm">{learner.firstName} {learner.lastName}</p>
                            <p className="text-xs text-gray-500">{learner.admNo}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {learner.grade} {learner.stream}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'Present' ? 'bg-green-100 text-green-800' :
                          record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                          record.status === 'Late' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.markedBy}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{record.markedAt}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 italic">
                        {record.reason || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Learner-wise Summary */}
      {filteredRecords.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h4 className="text-lg font-bold mb-4">Learner-wise Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...new Set(filteredRecords.map(r => r.learnerId))].map(learnerId => {
              const learner = learners.find(l => l.id === learnerId);
              if (!learner) return null;
              
              const learnerRecords = filteredRecords.filter(r => r.learnerId === learnerId);
              const presentCount = learnerRecords.filter(r => r.status === 'Present').length;
              const totalDays = learnerRecords.length;
              const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100) : 0;
              
              return (
                <div key={learnerId} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{learner.avatar}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{learner.firstName} {learner.lastName}</p>
                      <p className="text-xs text-gray-500">{learner.admNo} • {learner.grade} {learner.stream}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Days:</span>
                      <span className="font-semibold">{totalDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Present:</span>
                      <span className="font-semibold text-green-600">{presentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Absent:</span>
                      <span className="font-semibold text-red-600">
                        {learnerRecords.filter(r => r.status === 'Absent').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Attendance:</span>
                      <span className={`font-bold ${percentage >= 90 ? 'text-green-600' : percentage >= 75 ? 'text-orange-600' : 'text-red-600'}`}>
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${percentage >= 90 ? 'bg-green-500' : percentage >= 75 ? 'bg-orange-500' : 'bg-red-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReports;
