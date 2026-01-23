/**
 * useLearners Hook
 * Manages learner data from backend API
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../../../services/api';

export const useLearners = () => {
  const [learners, setLearners] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  });
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch all learners from backend
   */
  const fetchLearners = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.learners.getAll(params);
      
      if (response.success) {
        // Update pagination state if provided
        if (response.pagination) {
          setPagination(response.pagination);
        }

        // Transform backend data to match frontend format
        const transformedLearners = response.data.map(learner => ({
          id: learner.id,
          admissionNumber: learner.admissionNumber,
          admNo: learner.admissionNumber, // Alias for compatibility
          name: `${learner.firstName} ${learner.lastName}`,
          firstName: learner.firstName,
          lastName: learner.lastName,
          middleName: learner.middleName,
          dateOfBirth: learner.dateOfBirth,
          age: calculateAge(learner.dateOfBirth),
          gender: learner.gender,
          grade: learner.grade,
          stream: learner.stream,
          status: learner.status,
          parentId: learner.parentId,
          parent: learner.parent,
          guardianName: learner.guardianName || learner.parent?.firstName + ' ' + learner.parent?.lastName,
          guardianPhone: learner.guardianPhone || learner.parent?.phone,
          guardianEmail: learner.guardianEmail || learner.parent?.email,
          medicalConditions: learner.medicalConditions,
          allergies: learner.allergies,
          emergencyContact: learner.emergencyContact,
          emergencyPhone: learner.emergencyPhone,
          address: learner.address,
          county: learner.county,
          admissionDate: new Date(learner.admissionDate).toLocaleDateString(),
          createdAt: learner.createdAt,
        }));
        
        setLearners(transformedLearners);
      }
    } catch (err) {
      console.error('Error fetching learners:', err);
      setError(err.message);
      setLearners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculate age from date of birth
   */
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Create new learner
   */
  const createLearner = useCallback(async (learnerData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.learners.create(learnerData);
      
      if (response.success) {
        await fetchLearners(); // Refresh the list (reset to page 1 to ensure visibility)
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Error creating learner:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchLearners]);

  /**
   * Update learner
   */
  const updateLearner = useCallback(async (id, learnerData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.learners.update(id, learnerData);
      
      if (response.success) {
        // Refresh current page
        await fetchLearners({ 
          page: pagination.page, 
          limit: pagination.limit 
        });
        return { success: true, data: response.data };
      }
    } catch (err) {
      console.error('Error updating learner:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchLearners, pagination]);

  /**
   * Delete learner
   */
  const deleteLearner = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.learners.delete(id);
      
      if (response.success) {
        // Refresh current page
        await fetchLearners({ 
          page: pagination.page, 
          limit: pagination.limit 
        });
        return { success: true };
      } else {
        // Handle case where API returns but success is false
        const errorMsg = response.message || 'Failed to delete learner';
        console.error('Delete failed:', errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error('Error deleting learner:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchLearners, pagination]);

  // Fetch learners on mount
  useEffect(() => {
    fetchLearners();
  }, [fetchLearners]);

  return {
    learners,
    pagination,
    selectedLearner,
    setSelectedLearner,
    loading,
    error,
    fetchLearners,
    createLearner,
    updateLearner,
    deleteLearner,
  };
};
