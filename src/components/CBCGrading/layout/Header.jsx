import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Zap, ChevronDown, ClipboardList, BarChart3, MessageSquare, Calendar, Building2, Cake } from 'lucide-react';
import { usePermissions } from '../../../hooks/usePermissions';
import api, { schoolAPI } from '../../../services/api';

const Header = React.memo(({ user, onLogout, brandingSettings, title, onNavigate }) => {
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

  const handleNotificationClick = (type, params = {}) => {
    setShowNotifications(false);
    if (onNavigate) {
      if (type === 'birthday') {
        onNavigate('comm-notices', { activeTab: 'birthdays' });
      } else {
        onNavigate(type, params);
      }
    }
  };

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
    <div className="h-20 border-b border-brand-purple/20 shadow-xl px-8 py-5 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSuperAdmin && selectedSchool ? selectedSchool.name : (title || brandingSettings?.schoolName || 'Elimcrown')}
          </h1>
          <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
            {isSuperAdmin && selectedBranch ? `${selectedBranch.name} • CBC System` : (title ? (brandingSettings?.schoolName || 'Elimcrown') : 'CBC Assessment & Grading System')}
          </p>
        </div>

        {/* Super Admin School Switcher */}
        {isSuperAdmin && (
          <div className="relative" ref={schoolPickerRef}>
            <button
              onClick={() => setShowSchoolPicker(!showSchoolPicker)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 hover:bg-slate-300 border border-gray-300 hover:border-gray-400 text-gray-900 rounded-lg text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg group"
            >
              <Building2 size={16} className="opacity-75 group-hover:scale-110 transition-transform duration-300" />
              <span>Switch School</span>
              <ChevronDown size={16} className={`transition-transform duration-300 opacity-60 ${showSchoolPicker ? 'rotate-180' : ''}`} />
            </button>

            {showSchoolPicker && (
              <div className="absolute left-0 mt-3 w-96 bg-slate-100 rounded-xl shadow-2xl border border-gray-300 z-[100] max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-300 bg-slate-50">
                  <p className="text-xs font-bold text-brand-purple uppercase tracking-widest">Select Management Context</p>
                </div>

                <div className="overflow-y-auto flex-1">
                  {loadingSchools ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Loading schools...</p>
                    </div>
                  ) : schools.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">No schools found.</div>
                  ) : (
                    schools.map(school => (
                      <div key={school.id} className="border-b border-slate-700 last:border-0">
                        <button
                          onClick={() => handleSchoolSwitch(school)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-200/50 transition-all duration-300 flex items-center justify-between border-l-4 ${selectedSchool?.id === school.id ? 'bg-slate-200 border-brand-purple' : 'border-transparent'}`}
                        >
                          <div>
                            <p className="font-bold text-gray-900">{school.name}</p>
                            <p className="text-xs text-gray-600">{school.county || 'No County'} School</p>
                          </div>
                          {selectedSchool?.id === school.id && (
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-purple shadow-md"></div>
                          )}
                        </button>

                        {/* Branches if this is the active school */}
                        {selectedSchool?.id === school.id && school.branches?.length > 1 && (
                          <div className="bg-slate-50 py-2 px-4 border-t border-gray-300">
                            <p className="text-[10px] text-brand-purple/70 mb-2 font-bold uppercase tracking-wider">Select Branch:</p>
                            <div className="flex flex-wrap gap-2">
                              {school.branches.map(branch => (
                                <button
                                  key={branch.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBranchSwitch(branch);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border-2 transition-all duration-300 ${selectedBranch?.id === branch.id ? 'bg-brand-purple border-brand-purple text-white' : 'bg-slate-200 border-gray-300 text-gray-800 hover:border-gray-400'}`}
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
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-900 bg-slate-200 hover:bg-slate-300 border border-gray-300 hover:border-gray-400 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group"
          >
            <Zap size={18} className="text-yellow-400 group-hover:scale-110 transition-transform duration-300" />
            <span>Quick Actions</span>
            <ChevronDown size={16} className={`transition-transform duration-300 opacity-60 ${showQuickActions ? 'rotate-180' : ''}`} />
          </button>

          {showQuickActions && (
            <div className="absolute right-0 mt-3 w-64 bg-slate-100 rounded-lg shadow-2xl border border-gray-300 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-300">
                <p className="text-[10px] font-bold text-brand-purple uppercase tracking-widest">Available Actions</p>
              </div>
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => {
                    action.action();
                    setShowQuickActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-slate-200/50 hover:border-l-3 hover:border-brand-purple transition-all duration-300 border-l-3 border-transparent group"
                >
                  <action.icon size={18} className="text-brand-purple/70 group-hover:text-brand-purple group-hover:scale-110 transition-all duration-300" />
                  <span className="font-semibold group-hover:text-white transition-colors">{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-gray-900 hover:text-brand-purple bg-slate-200 hover:bg-slate-300 p-3 rounded-lg transition-all duration-300 border border-gray-300 hover:border-brand-purple/60 shadow-md hover:shadow-lg group relative"
          >
            <Bell size={20} className="opacity-75 group-hover:scale-110 transition-transform duration-300" />
            {birthdays.length > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-red-500 rounded-full animate-pulse border-2 border-slate-900 shadow-lg"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-96 bg-slate-100 rounded-lg shadow-2xl border border-gray-300 z-[110] overflow-hidden">
              <div className="p-4 border-b border-gray-300 bg-slate-50 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white bg-brand-purple px-3 py-1 rounded-lg shadow-md">
                  Updates
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {birthdays.length > 0 ? (
                  <div className="p-3">
                    <div
                      onClick={() => handleNotificationClick('birthday')}
                      className="px-4 py-2.5 bg-slate-200 border border-pink-300 rounded-lg mb-3 flex items-center gap-2.5 cursor-pointer hover:bg-slate-300 transition-colors"
                    >
                      <Cake size={16} className="text-pink-400 shrink-0" />
                      <span className="text-[10px] font-bold uppercase text-pink-700 tracking-wider">Birthday Reminders</span>
                    </div>
                    {birthdays.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleNotificationClick('birthday')}
                        className="p-3.5 hover:bg-slate-200 rounded-lg transition-all duration-300 flex items-start gap-4 border-b border-gray-300 last:border-0 group cursor-pointer"
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-md transition-all duration-300 group-hover:scale-110 border-2 ${b.isToday ? 'bg-gradient-to-r from-pink-600 to-red-600 text-white border-pink-400 animate-bounce' : 'bg-slate-200 text-gray-700 border-gray-300'}`}>
                          {b.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900 group-hover:text-brand-purple transition-colors">
                            {b.isToday ? '🎂 Today: ' : ''}{b.name}
                          </p>
                          <p className="text-xs text-gray-600 font-semibold">
                            Turns {b.turningAge} • {b.grade.replace('_', ' ')}
                          </p>
                          <p className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${b.isToday ? 'text-pink-700 bg-pink-200 px-2 py-1 rounded-lg inline-block' : 'text-slate-600'}`}>
                            {b.isToday ? 'HAPPENING TODAY 🎉' : `In ${b.daysUntil} days`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Bell size={24} className="text-gray-400 mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-gray-600 font-semibold">No new notifications</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-gray-300 text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] font-bold uppercase tracking-widest text-brand-purple hover:text-brand-purple/80 transition-colors"
                >
                  Close Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pl-6 border-l border-brand-purple/20">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
              {isSuperAdmin ? 'Global Super Admin' : (user?.role || 'System Admin')}
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-brand-purple to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg border-2 border-brand-purple/50 shadow-lg group hover:scale-110 transition-transform duration-300">
            {(user?.name || 'AU').substring(0, 2).toUpperCase()}
          </div>
          <button
            onClick={onLogout}
            className="text-gray-900 hover:text-red-600 bg-slate-200 hover:bg-red-100 border border-gray-300 hover:border-red-400 p-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg group"
            title="Logout"
          >
            <LogOut size={18} className="opacity-75 group-hover:scale-110 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
});

Header.displayName = 'Header';

export default Header;
