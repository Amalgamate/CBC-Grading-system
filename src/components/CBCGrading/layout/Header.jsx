import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Zap, ChevronDown, ClipboardList, BarChart3, MessageSquare, Calendar, Building2, Cake } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import api, { schoolAPI } from '../../../services/api';

const Header = ({ user, onLogout, brandingSettings, title }) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showSchoolPicker, setShowSchoolPicker] = useState(false);
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [, setLoadingBirthdays] = useState(false);

  const notificationRef = useRef(null);

  const dropdownRef = useRef(null);
  const schoolPickerRef = useRef(null);
  const { role } = usePermissions();

  const isSuperAdmin = role === 'SUPER_ADMIN';

  // Fetch schools for Super Admin
  useEffect(() => {
    if (isSuperAdmin) {
      const fetchSchools = async () => {
        setLoadingSchools(true);
        try {
          const resp = await schoolAPI.getAll();
          const schoolsData = resp.data || [];
          setSchools(schoolsData);

          // Initialize selected school from localStorage
          const currentSid = localStorage.getItem('currentSchoolId');
          if (currentSid) {
            const found = schoolsData.find(s => s.id === currentSid);
            if (found) setSelectedSchool(found);
          } else if (schoolsData.length > 0) {
            // Default to first school if none selected
            const first = schoolsData[0];
            setSelectedSchool(first);
            localStorage.setItem('currentSchoolId', first.id);
          }
        } catch (error) {
          console.error('Failed to fetch schools:', error);
        } finally {
          setLoadingSchools(false);
        }
      };
      fetchSchools();
    }
  }, [isSuperAdmin]);

  // Update selected branch when school changes or on init
  useEffect(() => {
    if (selectedSchool) {
      const currentBid = localStorage.getItem('currentBranchId');
      const branches = selectedSchool.branches || [];
      if (currentBid) {
        const found = branches.find(b => b.id === currentBid);
        if (found) {
          setSelectedBranch(found);
        } else if (branches.length > 0) {
          // Sync localStorage if it has an invalid branch ID for this school
          setSelectedBranch(branches[0]);
          localStorage.setItem('currentBranchId', branches[0].id);
        } else {
          setSelectedBranch(null);
          localStorage.removeItem('currentBranchId');
        }
      } else if (branches.length > 0) {
        setSelectedBranch(branches[0]);
        localStorage.setItem('currentBranchId', branches[0].id);
      } else {
        setSelectedBranch(null);
      }
    }
  }, [selectedSchool]);

  // Handle school switch
  const handleSchoolSwitch = (school) => {
    setSelectedSchool(school);
    localStorage.setItem('currentSchoolId', school.id);

    // Clear branch to force re-selection of first branch of new school
    localStorage.removeItem('currentBranchId');

    setShowSchoolPicker(false);

    // Refresh the page to update all contexts and hooks
    window.location.reload();
  };

  // Handle branch switch
  const handleBranchSwitch = (branch) => {
    setSelectedBranch(branch);
    localStorage.setItem('currentBranchId', branch.id);
    setShowSchoolPicker(false);
    window.location.reload();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowQuickActions(false);
      }
      if (schoolPickerRef.current && !schoolPickerRef.current.contains(event.target)) {
        setShowSchoolPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch birthdays
  useEffect(() => {
    const fetchBirthdays = async () => {
      setLoadingBirthdays(true);
      try {
        const resp = await api.learners.getBirthdays();
        if (resp.success) {
          setBirthdays(resp.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch birthdays:', error);
      } finally {
        setLoadingBirthdays(false);
      }
    };

    fetchBirthdays();
    // Refresh every hour
    const interval = setInterval(fetchBirthdays, 3600000);
    return () => clearInterval(interval);
  }, [selectedSchool]); // Re-fetch if school context changes

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getQuickActions = () => {
    const teacherActions = [
      { icon: ClipboardList, label: 'Create Assessment', action: () => console.log('Create Assessment') },
      { icon: Calendar, label: 'Mark Attendance', action: () => console.log('Mark Attendance') },
      { icon: BarChart3, label: 'View Reports', action: () => console.log('View Reports') },
      { icon: MessageSquare, label: 'Send Message', action: () => console.log('Send Message') },
    ];

    const adminActions = [
      { icon: ClipboardList, label: 'Add Student', action: () => console.log('Add Student') },
      { icon: Calendar, label: 'View Attendance', action: () => console.log('View Attendance') },
      { icon: BarChart3, label: 'Generate Reports', action: () => console.log('Generate Reports') },
      { icon: MessageSquare, label: 'Send Notice', action: () => console.log('Send Notice') },
    ];

    if (role === 'TEACHER') return teacherActions;
    if (role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'HEAD_TEACHER') return adminActions;

    return teacherActions;
  };

  const quickActions = getQuickActions();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text">
            {isSuperAdmin && selectedSchool ? selectedSchool.name : (title || brandingSettings?.schoolName || 'Zawadi JRN Academy')}
          </h1>
          <p className="text-xs text-gray-600">
            {isSuperAdmin && selectedBranch ? `${selectedBranch.name} | CBC System` : (title ? (brandingSettings?.schoolName || 'Zawadi JRN Academy') : 'CBC Assessment & Grading System')}
          </p>
        </div>

        {/* Super Admin School Switcher */}
        {isSuperAdmin && (
          <div className="relative" ref={schoolPickerRef}>
            <button
              onClick={() => setShowSchoolPicker(!showSchoolPicker)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-sm font-semibold transition"
            >
              <Building2 size={16} />
              <span>Switch School</span>
              <ChevronDown size={14} className={`transition-transform ${showSchoolPicker ? 'rotate-180' : ''}`} />
            </button>

            {showSchoolPicker && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-3 border-b bg-gray-50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Management Context</p>
                </div>

                <div className="overflow-y-auto flex-1">
                  {loadingSchools ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading schools...</p>
                    </div>
                  ) : schools.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No schools found.</div>
                  ) : (
                    schools.map(school => (
                      <div key={school.id} className="border-b last:border-0">
                        <button
                          onClick={() => handleSchoolSwitch(school)}
                          className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition flex items-center justify-between ${selectedSchool?.id === school.id ? 'bg-blue-50/50 border-l-4 border-blue-600' : ''}`}
                        >
                          <div>
                            <p className="font-bold text-gray-800">{school.name}</p>
                            <p className="text-xs text-gray-500">{school.county || 'No County'} School</p>
                          </div>
                          {selectedSchool?.id === school.id && (
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          )}
                        </button>

                        {/* Branches if this is the active school */}
                        {selectedSchool?.id === school.id && school.branches?.length > 1 && (
                          <div className="bg-gray-50 py-1 px-4 border-t border-gray-100 italic">
                            <p className="text-[10px] text-gray-400 mb-1">Select Branch:</p>
                            <div className="flex flex-wrap gap-1 pb-2">
                              {school.branches.map(branch => (
                                <button
                                  key={branch.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBranchSwitch(branch);
                                  }}
                                  className={`px-2 py-1 rounded text-[10px] font-bold border transition ${selectedBranch?.id === branch.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                                >
                                  {branch.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Actions Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Zap size={18} className="text-blue-600" />
            <span>Quick Actions</span>
            <ChevronDown size={16} className={`transition-transform ${showQuickActions ? 'rotate-180' : ''}`} />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <action.icon size={16} className="text-gray-500" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition relative"
          >
            <Bell size={20} />
            {birthdays.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-[110] overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Updates
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {birthdays.length > 0 ? (
                  <div className="p-2">
                    <div className="px-3 py-2 bg-pink-50 rounded-lg mb-2 flex items-center gap-2">
                      <Cake size={14} className="text-pink-600" />
                      <span className="text-[10px] font-black uppercase text-pink-700">Birthday Reminders</span>
                    </div>
                    {birthdays.map((b) => (
                      <div key={b.id} className="p-3 hover:bg-gray-50 rounded-lg transition flex items-start gap-4 border-b border-gray-50 last:border-0 group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm transition-transform group-hover:scale-110 ${b.isToday ? 'bg-pink-100 text-pink-700 border-2 border-pink-400 animate-bounce' : 'bg-blue-50 text-blue-700'}`}>
                          {b.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-800">
                            {b.isToday ? '🎂 Today: ' : ''}{b.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Turns {b.turningAge} • {b.grade.replace('_', ' ')}
                          </p>
                          <p className={`text-[10px] font-bold mt-1 uppercase ${b.isToday ? 'text-pink-600' : 'text-slate-400'}`}>
                            {b.isToday ? 'HAPPENING TODAY' : `In ${b.daysUntil} days`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-medium">No new notifications</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 border-t text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition"
                >
                  Clear All View
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-600">
              {isSuperAdmin ? 'Global Super Admin' : (user?.role || 'System Admin')}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {(user?.name || 'AU').substring(0, 2).toUpperCase()}
          </div>
          <button
            onClick={onLogout}
            className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
