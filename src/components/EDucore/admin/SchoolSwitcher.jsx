import React, { useState, useEffect } from 'react';
import { School, ChevronDown, Check, Building2 } from 'lucide-react';
import { adminAPI } from '../../../services/api';

const SchoolSwitcher = ({ currentSchool, onSchoolChange }) => {
  const [schools, setSchools] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.listSchools();
      setSchools(response.data || []);
    } catch (error) {
      console.error('Error loading schools:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchSchool = async (school) => {
    try {
      // Update localStorage
      localStorage.setItem('currentSchoolId', school.id);
      
      // Call API to switch context
      const response = await adminAPI.switchSchool(school.id);

      if (response) {
        // Update user object with new school context
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.schoolId = school.id;
        user.school = school;
        localStorage.setItem('user', JSON.stringify(user));

        onSchoolChange(school);
        setIsOpen(false);
        
        // Reload page to refresh all components with new context
        window.location.reload();
      }
    } catch (error) {
      console.error('Error switching school:', error);
      alert('Failed to switch school: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white border-2 border-indigo-200 rounded-lg hover:border-indigo-400 transition-all shadow-sm hover:shadow-md"
      >
        <School className="w-5 h-5 text-indigo-600" />
        <div className="text-left">
          <div className="text-xs text-gray-500 font-medium">Current School</div>
          <div className="text-sm font-bold text-gray-900">{currentSchool?.name || 'Select School'}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-96 overflow-auto">
            <div className="p-3 border-b bg-gradient-to-r from-indigo-50 to-cyan-50">
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Switch School Context
              </h3>
              <p className="text-xs text-gray-600 mt-1">Select a school to manage</p>
            </div>

            {loading ? (
              <div className="p-6 text-center text-gray-500 text-sm">Loading schools...</div>
            ) : schools.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No schools available</div>
            ) : (
              <div className="py-2">
                {schools.map((school) => {
                  const isActive = school.active && school.status === 'ACTIVE';
                  const isInactive = !school.active;
                  const isTrial = school.status === 'TRIAL';
                  
                  return (
                    <button
                      key={school.id}
                      onClick={() => handleSwitchSchool(school)}
                      disabled={isInactive && school.status === 'DECLINED'}
                      className={`w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex items-center justify-between group ${
                        currentSchool?.id === school.id ? 'bg-indigo-50' : ''
                      } ${isInactive && school.status === 'DECLINED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm text-gray-900 group-hover:text-indigo-700">
                          {school.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {school.branches?.length || school._count?.branches || 0} branches • {school._count?.learners || 0} learners
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {isActive && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              ACTIVE
                            </span>
                          )}
                          {isTrial && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              TRIAL
                            </span>
                          )}
                          {isInactive && school.status !== 'TRIAL' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              INACTIVE
                            </span>
                          )}
                          {school.status === 'DECLINED' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              DECLINED
                            </span>
                          )}
                        </div>
                      </div>
                      {currentSchool?.id === school.id && (
                        <Check className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SchoolSwitcher;
