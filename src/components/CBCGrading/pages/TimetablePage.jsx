/**
 * Timetable Page - Placeholder
 * View class schedules and teaching timetable
 * Coming Soon - Full timetable management system
 */

import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, MapPin, Users, Download, Plus, Edit } from 'lucide-react';
import EmptyState from '../shared/EmptyState';

const TimetablePage = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');

  // Placeholder data - will be replaced with real API data
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const placeholderSchedule = {
    'Monday': [
      { time: '8:00 AM - 9:30 AM', subject: 'Mathematics', grade: 'Grade 3A', room: 'Room 101' },
      { time: '10:00 AM - 11:30 AM', subject: 'Science', grade: 'Grade 3B', room: 'Room 205' },
      { time: '1:00 PM - 2:30 PM', subject: 'English', grade: 'Grade 4A', room: 'Room 102' },
    ],
    'Tuesday': [
      { time: '8:00 AM - 9:30 AM', subject: 'English', grade: 'Grade 3A', room: 'Room 101' },
      { time: '10:00 AM - 11:30 AM', subject: 'Mathematics', grade: 'Grade 4A', room: 'Room 102' },
      { time: '1:00 PM - 2:30 PM', subject: 'Science', grade: 'Grade 3B', room: 'Room 205' },
    ],
    'Wednesday': [
      { time: '8:00 AM - 9:30 AM', subject: 'Science', grade: 'Grade 3A', room: 'Room 101' },
      { time: '10:00 AM - 11:30 AM', subject: 'English', grade: 'Grade 3B', room: 'Room 205' },
      { time: '1:00 PM - 2:30 PM', subject: 'Mathematics', grade: 'Grade 4A', room: 'Room 102' },
    ],
    'Thursday': [
      { time: '8:00 AM - 9:30 AM', subject: 'Mathematics', grade: 'Grade 3B', room: 'Room 205' },
      { time: '10:00 AM - 11:30 AM', subject: 'Science', grade: 'Grade 4A', room: 'Room 102' },
      { time: '1:00 PM - 2:30 PM', subject: 'English', grade: 'Grade 3A', room: 'Room 101' },
    ],
    'Friday': [
      { time: '8:00 AM - 9:30 AM', subject: 'English', grade: 'Grade 4A', room: 'Room 102' },
      { time: '10:00 AM - 11:30 AM', subject: 'Mathematics', grade: 'Grade 3A', room: 'Room 101' },
      { time: '1:00 PM - 2:30 PM', subject: 'Science', grade: 'Grade 3B', room: 'Room 205' },
    ],
  };

  const schedule = placeholderSchedule[selectedDay] || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            disabled
          >
            <Download size={18} />
            Export
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition opacity-50 cursor-not-allowed font-bold"
            disabled
          >
            <Plus size={18} />
            Add Lesson
          </button>
        </div>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-r from-brand-purple to-brand-teal rounded-xl p-6 text-white shadow-lg overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-teal/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Full Timetable Management Coming Soon!</h3>
            <p className="text-white/80 mb-4 font-medium">
              We're working on a comprehensive timetable management system with features like:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-white/90 font-medium">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                Automatic timetable generation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                Conflict detection & resolution
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                Teacher availability management
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                Room allocation & optimization
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                Mobile app for teachers & students
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                Real-time updates & notifications
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Week View */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Weekly Schedule</h3>
          <p className="text-sm text-gray-600">Sample timetable for demonstration</p>
        </div>

        {/* Day Selector */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 px-6 py-4 text-sm font-black uppercase tracking-widest transition-all ${selectedDay === day
                ? 'bg-brand-purple/5 text-brand-purple border-b-2 border-brand-purple'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule for Selected Day */}
        <div className="p-6">
          {schedule.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No Classes Scheduled"
              message={`No classes scheduled for ${selectedDay}`}
            />
          ) : (
            <div className="space-y-3">
              {schedule.map((lesson, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-brand-purple/30 hover:bg-brand-purple/5 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Time */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <div className="p-2 bg-brand-teal/10 rounded-lg">
                        <Clock className="w-5 h-5 text-brand-teal" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{lesson.time}</p>
                        <p className="text-xs text-gray-500">90 minutes</p>
                      </div>
                    </div>

                    {/* Subject & Grade */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <div className="p-2 bg-brand-purple/10 rounded-lg">
                        <BookOpen className="w-5 h-5 text-brand-purple" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{lesson.subject}</p>
                        <p className="text-xs text-gray-500">{lesson.grade}</p>
                      </div>
                    </div>

                    {/* Room */}
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-brand-teal/10 rounded-lg">
                        <MapPin className="w-5 h-5 text-brand-teal" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{lesson.room}</p>
                        <p className="text-xs text-gray-500">Location</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 text-brand-purple hover:bg-brand-purple/10 rounded-lg transition opacity-50 cursor-not-allowed"
                      disabled
                      title="Coming soon"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="px-3 py-2 text-sm bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition opacity-50 cursor-not-allowed font-bold"
                      disabled
                      title="Coming soon"
                    >
                      View Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weekly Overview Grid */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Week at a Glance</h3>
          <p className="text-sm text-gray-600">Your full week schedule overview</p>
        </div>

        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-700">Time</th>
                {days.map((day) => (
                  <th key={day} className="border border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-700">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                  8:00 - 9:30 AM
                </td>
                {days.map((day) => {
                  const lesson = placeholderSchedule[day]?.[0];
                  return (
                    <td key={day} className="border border-gray-200 px-4 py-3">
                      {lesson ? (
                        <div className="bg-brand-purple/5 border border-brand-purple/10 rounded p-2">
                          <p className="text-sm font-semibold text-brand-purple">{lesson.subject}</p>
                          <p className="text-xs text-brand-purple/70">{lesson.grade}</p>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-sm">Free</div>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                  10:00 - 11:30 AM
                </td>
                {days.map((day) => {
                  const lesson = placeholderSchedule[day]?.[1];
                  return (
                    <td key={day} className="border border-gray-200 px-4 py-3">
                      {lesson ? (
                        <div className="bg-brand-teal/5 border border-brand-teal/10 rounded p-2">
                          <p className="text-sm font-semibold text-brand-teal">{lesson.subject}</p>
                          <p className="text-xs text-brand-teal/70">{lesson.grade}</p>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-sm">Free</div>
                      )}
                    </td>
                  );
                })}
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50">
                  1:00 - 2:30 PM
                </td>
                {days.map((day) => {
                  const lesson = placeholderSchedule[day]?.[2];
                  return (
                    <td key={day} className="border border-gray-200 px-4 py-3">
                      {lesson ? (
                        <div className="bg-brand-purple/5 border border-brand-purple/10 rounded p-2">
                          <p className="text-sm font-semibold text-brand-purple">{lesson.subject}</p>
                          <p className="text-xs text-brand-purple/70">{lesson.grade}</p>
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 text-sm">Free</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 text-brand-purple" />
            <span className="text-xs text-gray-500">This Week</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">15</p>
          <p className="text-sm text-gray-600">Total Lessons</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-brand-teal" />
            <span className="text-xs text-gray-500">Unique</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">3</p>
          <p className="text-sm text-gray-600">Classes</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-brand-purple" />
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">22.5</p>
          <p className="text-sm text-gray-600">Hours/Week</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <MapPin className="w-5 h-5 text-brand-teal" />
            <span className="text-xs text-gray-500">Primary</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">101</p>
          <p className="text-sm text-gray-600">Main Room</p>
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;
