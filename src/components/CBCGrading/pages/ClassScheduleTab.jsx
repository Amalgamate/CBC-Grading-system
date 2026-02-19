/**
 * ClassScheduleTab
 * Manages class schedules and timetables
 */

import React, { useState } from 'react';
import { Plus, Edit, Trash2, AlertCircle, Copy } from 'lucide-react';
import { Button, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui';
import './ClassScheduleTab.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = [
  '08:00', '08:45', '09:30', '10:15', '11:00', '11:45', '12:30', '13:15', '14:00', '14:45', '15:30'
];

const ClassScheduleTab = ({ classData, onRefresh }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [viewType, setViewType] = useState('table'); // 'table' or 'grid'
  const [formData, setFormData] = useState({
    subject: '',
    day: 'Monday',
    startTime: '08:00',
    endTime: '08:45',
    room: '',
    teacherId: '',
    semester: 'TERM_1',
    academicYear: new Date().getFullYear().toString()
  });

  const handleAddClick = () => {
    setEditingSchedule(null);
    setFormData({
      subject: '',
      day: 'Monday',
      startTime: '08:00',
      endTime: '08:45',
      room: '',
      teacherId: '',
      semester: 'TERM_1',
      academicYear: new Date().getFullYear().toString()
    });
    setShowAddForm(true);
  };

  const handleEditClick = (schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      subject: schedule.subject,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room || '',
      teacherId: schedule.teacherId || '',
      semester: schedule.semester,
      academicYear: schedule.academicYear
    });
    setShowAddForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingSchedule
        ? `/api/classes/${classData.id}/schedules/${editingSchedule.id}`
        : `/api/classes/${classData.id}/schedules`;

      const method = editingSchedule ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowAddForm(false);
        onRefresh?.();
      }
    } catch (error) {
      console.error('Failed to save schedule:', error);
    }
  };

  const handleDelete = async (scheduleId) => {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        await fetch(`/api/classes/${classData.id}/schedules/${scheduleId}`, {
          method: 'DELETE'
        });
        onRefresh?.();
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };

  const schedules = classData.schedules || [];

  // Generate weekly grid view
  const WeeklyGrid = () => {
    const grid = {};

    DAYS.forEach(day => {
      grid[day] = TIME_SLOTS.map(time => {
        const schedule = schedules.find(
          s => s.day === day && s.startTime === time
        );
        return schedule;
      });
    });

    return (
      <div className="overflow-x-auto">
        <div className="grid gap-2" style={{ gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)` }}>
          {/* Header */}
          <div className="font-bold p-2 bg-gray-100"></div>
          {DAYS.map(day => (
            <div key={day} className="font-bold p-2 bg-gray-100 text-center text-sm">
              {day.substr(0, 3)}
            </div>
          ))}

          {/* Time slots */}
          {TIME_SLOTS.map(time => (
            <React.Fragment key={time}>
              <div className="font-bold p-2 bg-gray-50 text-xs">{time}</div>
              {DAYS.map(day => {
                const schedule = schedules.find(
                  s => s.day === day && s.startTime === time
                );
                return (
                  <div
                    key={`${day}-${time}`}
                    className="p-2 border border-gray-200 min-h-12 hover:bg-blue-50 cursor-pointer"
                    onClick={() => schedule && handleEditClick(schedule)}
                  >
                    {schedule ? (
                      <div className="bg-blue-100 border border-blue-300 rounded p-1 text-xs">
                        <p className="font-bold text-blue-900">{schedule.subject}</p>
                        <p className="text-xs text-blue-700">{schedule.startTime}-{schedule.endTime}</p>
                        {schedule.room && <p className="text-xs text-blue-600">{schedule.room}</p>}
                      </div>
                    ) : (
                      <div className="text-gray-300 text-xs text-center p-2">-</div>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Table view
  const TableView = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 bg-gray-50">
            <th className="text-left p-3 font-bold text-gray-700">Subject</th>
            <th className="text-left p-3 font-bold text-gray-700">Day</th>
            <th className="text-left p-3 font-bold text-gray-700">Time</th>
            <th className="text-left p-3 font-bold text-gray-700">Room</th>
            <th className="text-left p-3 font-bold text-gray-700">Teacher</th>
            <th className="text-right p-3 font-bold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(schedule => (
            <tr key={schedule.id} className="border-b hover:bg-gray-50 transition">
              <td className="p-3 font-bold text-gray-900">{schedule.subject}</td>
              <td className="p-3">{schedule.day}</td>
              <td className="p-3 text-sm">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                  {schedule.startTime} - {schedule.endTime}
                </span>
              </td>
              <td className="p-3">{schedule.room || '-'}</td>
              <td className="p-3 text-sm text-gray-600">
                {schedule.teacher
                  ? `${schedule.teacher.firstName} ${schedule.teacher.lastName}`
                  : '-'}
              </td>
              <td className="p-3 text-right space-x-2">
                <button
                  onClick={() => handleEditClick(schedule)}
                  className="p-2 hover:bg-blue-100 rounded text-blue-600 transition"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className="p-2 hover:bg-red-100 rounded text-red-600 transition"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Class Schedule</h3>
          <p className="text-sm text-gray-500 mt-1">{schedules.length} lessons scheduled</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-gray-100 p-1 rounded">
            <button
              onClick={() => setViewType('table')}
              className={`px-3 py-1 rounded text-sm font-bold transition ${
                viewType === 'table'
                  ? 'bg-white shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setViewType('grid')}
              className={`px-3 py-1 rounded text-sm font-bold transition ${
                viewType === 'grid'
                  ? 'bg-white shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Grid
            </button>
          </div>
          <Button
            onClick={handleAddClick}
            className="bg-purple-600 hover:bg-purple-700"
            size="sm"
          >
            <Plus size={16} />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Schedule Content */}
      {schedules.length > 0 ? (
        <div className="border rounded-lg overflow-hidden bg-white">
          {viewType === 'table' ? <TableView /> : <WeeklyGrid />}
        </div>
      ) : (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 font-semibold">No schedules created yet</p>
            <p className="text-sm text-gray-500 mt-1">Create a schedule to organize class lessons</p>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      {showAddForm && (
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Subject */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  placeholder="e.g., English"
                />
              </div>

              {/* Day */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Day *</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Start Time *</label>
                <select
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* End Time */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">End Time *</label>
                <select
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              {/* Room */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Room</label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Room 101"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="text-xs font-bold text-gray-600 uppercase">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="TERM_1">Term 1</option>
                  <option value="TERM_2">Term 2</option>
                  <option value="TERM_3">Term 3</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {editingSchedule ? 'Update Schedule' : 'Add Schedule'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ClassScheduleTab;
