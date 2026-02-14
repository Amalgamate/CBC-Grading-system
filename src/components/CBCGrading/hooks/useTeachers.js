/**
 * useTeachers Hook
 * Manages teacher data from backend API
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';

export const useTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all teachers from backend
   */
  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.teachers.getAll();

      if (response.success) {
        // Transform backend data to match frontend format
        const transformedTeachers = response.data.map(teacher => ({
          id: teacher.id,
          name: `${teacher.firstName} ${teacher.lastName}`,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          phone: teacher.phone || 'N/A',
          subject: 'N/A', // TODO: Add subject field to backend
          classAssigned: 'N/A', // TODO: Add class assignment to backend
          staffId: teacher.staffId || '---',
          assignedClasses: teacher.classesAsTeacher?.map(c => c.name) || [],
          status: teacher.status,
          joinDate: new Date(teacher.createdAt).toLocaleDateString(),
          lastLogin: teacher.lastLogin
            ? new Date(teacher.lastLogin).toLocaleDateString()
            : 'Never'
        }));

        setTeachers(transformedTeachers);
      }
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError(err.message);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new teacher
   */
  const createTeacher = useCallback(async (teacherData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating teacher with data:', teacherData);
      const response = await api.teachers.create(teacherData);
      console.log('Teacher creation response:', response);

      if (response.success) {
        await fetchTeachers(); // Refresh the list
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Error creating teacher:', err);
      console.error('Error details:', err.message);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchTeachers]);

  /**
   * Update teacher
   */
  const updateTeacher = useCallback(async (id, teacherData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.teachers.update(id, teacherData);

      if (response.success) {
        await fetchTeachers(); // Refresh the list
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Error updating teacher:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchTeachers]);

  /**
   * Delete teacher
   */
  const deleteTeacher = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.teachers.delete(id);

      if (response.success) {
        await fetchTeachers(); // Refresh the list
        return { success: true };
      }
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchTeachers]);

  /**
   * Archive teacher (soft delete)
   */
  const archiveTeacher = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.users.archive(id);

      if (response.success) {
        await fetchTeachers(); // Refresh the list
        return { success: true };
      }
    } catch (err) {
      console.error('Error archiving teacher:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchTeachers]);

  // Fetch teachers on mount
  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    selectedTeacher,
    setSelectedTeacher,
    loading,
    error,
    fetchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    archiveTeacher,
  };
};
