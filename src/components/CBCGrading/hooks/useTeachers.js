/**
 * useTeachers Hook
 * Manage teacher data and operations
 */

import { useState, useCallback, useMemo } from 'react';
import { validateTeacherData } from '../utils/validators';

export const useTeachers = (initialTeachers = []) => {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading] = useState(false);
  const [error] = useState(null);

  /**
   * Add a new teacher
   * @param {Object} teacherData - Teacher data
   * @returns {Object} Result with success flag and data/errors
   */
  const addTeacher = useCallback((teacherData) => {
    // Validate data
    const validation = validateTeacherData(teacherData);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    // Create new teacher with ID and timestamp
    const newTeacher = {
      ...teacherData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: teacherData.status || 'Active'
    };

    setTeachers(prev => [...prev, newTeacher]);
    return { success: true, data: newTeacher };
  }, []);

  /**
   * Update an existing teacher
   * @param {number} teacherId - ID of teacher to update
   * @param {Object} updates - Fields to update
   * @returns {Object} Result with success flag
   */
  const updateTeacher = useCallback((teacherId, updates) => {
    setTeachers(prev => 
      prev.map(teacher => 
        teacher.id === teacherId 
          ? { ...teacher, ...updates, updatedAt: new Date().toISOString() }
          : teacher
      )
    );
    return { success: true };
  }, []);

  /**
   * Delete a teacher
   * @param {number} teacherId - ID of teacher to delete
   * @returns {Object} Result with success flag
   */
  const deleteTeacher = useCallback((teacherId) => {
    setTeachers(prev => prev.filter(teacher => teacher.id !== teacherId));
    if (selectedTeacher?.id === teacherId) {
      setSelectedTeacher(null);
    }
    return { success: true };
  }, [selectedTeacher]);

  /**
   * Get teacher by ID
   * @param {number} teacherId - ID of teacher
   * @returns {Object|null} Teacher object or null
   */
  const getTeacherById = useCallback((teacherId) => {
    return teachers.find(teacher => teacher.id === teacherId) || null;
  }, [teachers]);

  /**
   * Get teacher by employee number
   * @param {string} employeeNo - Employee number
   * @returns {Object|null} Teacher object or null
   */
  const getTeacherByEmployeeNo = useCallback((employeeNo) => {
    return teachers.find(teacher => teacher.employeeNo === employeeNo) || null;
  }, [teachers]);

  /**
   * Get teachers by subject
   * @param {string} subject - Subject name
   * @returns {Array} Array of teachers
   */
  const getTeachersBySubject = useCallback((subject) => {
    return teachers.filter(teacher => 
      teacher.subject === subject && teacher.status === 'Active'
    );
  }, [teachers]);

  /**
   * Get teachers by role
   * @param {string} role - Role name
   * @returns {Array} Array of teachers
   */
  const getTeachersByRole = useCallback((role) => {
    return teachers.filter(teacher => 
      teacher.role === role && teacher.status === 'Active'
    );
  }, [teachers]);

  /**
   * Assign classes to teacher
   * @param {number} teacherId - ID of teacher
   * @param {Array} classes - Array of class names
   * @returns {Object} Result with success flag
   */
  const assignClasses = useCallback((teacherId, classes) => {
    return updateTeacher(teacherId, { classes });
  }, [updateTeacher]);

  /**
   * Set teacher on leave
   * @param {number} teacherId - ID of teacher
   * @param {Object} leaveData - Leave details
   * @returns {Object} Result with success flag
   */
  const setTeacherOnLeave = useCallback((teacherId, leaveData) => {
    return updateTeacher(teacherId, {
      status: 'On Leave',
      leaveStartDate: leaveData.startDate,
      leaveEndDate: leaveData.endDate,
      leaveReason: leaveData.reason
    });
  }, [updateTeacher]);

  /**
   * Return teacher from leave
   * @param {number} teacherId - ID of teacher
   * @returns {Object} Result with success flag
   */
  const returnFromLeave = useCallback((teacherId) => {
    return updateTeacher(teacherId, {
      status: 'Active',
      leaveStartDate: null,
      leaveEndDate: null,
      leaveReason: null,
      returnedFromLeave: new Date().toISOString()
    });
  }, [updateTeacher]);

  /**
   * Search teachers
   * @param {string} searchTerm - Search term
   * @returns {Array} Filtered teachers
   */
  const searchTeachers = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return teachers;
    }

    const term = searchTerm.toLowerCase();
    return teachers.filter(teacher => 
      teacher.firstName?.toLowerCase().includes(term) ||
      teacher.lastName?.toLowerCase().includes(term) ||
      teacher.employeeNo?.toLowerCase().includes(term) ||
      teacher.email?.toLowerCase().includes(term) ||
      teacher.subject?.toLowerCase().includes(term)
    );
  }, [teachers]);

  /**
   * Filter teachers
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered teachers
   */
  const filterTeachers = useCallback((filters) => {
    return teachers.filter(teacher => {
      const matchesStatus = !filters.status || filters.status === 'all' || teacher.status === filters.status;
      const matchesSubject = !filters.subject || filters.subject === 'all' || teacher.subject === filters.subject;
      const matchesRole = !filters.role || filters.role === 'all' || teacher.role === filters.role;
      const matchesGender = !filters.gender || filters.gender === 'all' || teacher.gender === filters.gender;
      
      return matchesStatus && matchesSubject && matchesRole && matchesGender;
    });
  }, [teachers]);

  // Computed values
  const activeTeachers = useMemo(() => 
    teachers.filter(t => t.status === 'Active'),
    [teachers]
  );

  const totalTeachers = useMemo(() => teachers.length, [teachers]);

  const teachersBySubject = useMemo(() => {
    const grouped = {};
    teachers.forEach(teacher => {
      if (!grouped[teacher.subject]) {
        grouped[teacher.subject] = [];
      }
      grouped[teacher.subject].push(teacher);
    });
    return grouped;
  }, [teachers]);

  const teachersByRole = useMemo(() => {
    const grouped = {};
    teachers.forEach(teacher => {
      if (!grouped[teacher.role]) {
        grouped[teacher.role] = [];
      }
      grouped[teacher.role].push(teacher);
    });
    return grouped;
  }, [teachers]);

  return {
    // State
    teachers,
    selectedTeacher,
    loading,
    error,
    activeTeachers,
    totalTeachers,
    teachersBySubject,
    teachersByRole,

    // Actions
    setTeachers,
    setSelectedTeacher,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherById,
    getTeacherByEmployeeNo,
    getTeachersBySubject,
    getTeachersByRole,
    assignClasses,
    setTeacherOnLeave,
    returnFromLeave,
    searchTeachers,
    filterTeachers
  };
};
