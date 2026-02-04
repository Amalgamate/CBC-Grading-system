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

  const fetchLearners = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.learners.getAll(params);

      if (response.success) {
        if (response.pagination) {
          setPagination(response.pagination);
        }

        const transformedLearners = response.data.map(learner => ({
          id: learner.id,
          admissionNumber: learner.admissionNumber,
          admNo: learner.admissionNumber,
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
          guardianName: learner.guardianName || (learner.parent ? `${learner.parent.firstName} ${learner.parent.lastName}` : undefined),
          guardianPhone: learner.guardianPhone || learner.parent?.phone,
          guardianEmail: learner.guardianEmail || learner.parent?.email,
          medicalConditions: learner.medicalConditions,
          allergies: learner.allergies,
          emergencyContact: learner.emergencyContact,
          emergencyPhone: learner.emergencyPhone,
          bloodGroup: learner.bloodGroup,
          specialNeeds: learner.specialNeeds,
          previousSchool: learner.previousSchool,
          religion: learner.religion,
          address: learner.address,
          county: learner.county,
          subCounty: learner.subCounty,
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

  const createLearner = useCallback(async (learnerData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.learners.create(learnerData);

      if (response.success) {
        await fetchLearners();
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

  const updateLearner = useCallback(async (id, learnerData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.learners.update(id, learnerData);

      if (response.success) {
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

  const deleteLearner = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.learners.delete(id);

      if (response.success) {
        await fetchLearners({
          page: pagination.page,
          limit: pagination.limit
        });
        return { success: true };
      } else {
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

  const bulkDeleteLearners = useCallback(async (ids) => {
    try {
      setLoading(true);
      setError(null);

      const deletePromises = ids.map(async (id) => {
        try {
          return await api.learners.delete(id);
        } catch (e) {
          return { success: false, message: e.message };
        }
      });

      const results = await Promise.all(deletePromises);
      const failures = results.filter(r => !r.success);

      await fetchLearners({
        page: pagination.page,
        limit: pagination.limit
      });

      if (failures.length > 0) {
        return {
          success: false,
          error: `Failed to delete ${failures.length} out of ${ids.length} learners`,
          results
        };
      }

      return { success: true };
    } catch (err) {
      console.error('Error in bulk delete:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchLearners, pagination]);

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
    bulkDeleteLearners,
  };
};
