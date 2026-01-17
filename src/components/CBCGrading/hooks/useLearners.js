/**
 * useLearners Hook
 * Manage learner data and operations
 */

import { useState, useCallback, useMemo } from 'react';
import { validateLearnerData } from '../utils/validators';

export const useLearners = (initialLearners = []) => {
  const [learners, setLearners] = useState(initialLearners);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Add a new learner
   * @param {Object} learnerData - Learner data
   * @returns {Object} Result with success flag and data/errors
   */
  const addLearner = useCallback((learnerData) => {
    // Validate data
    const validation = validateLearnerData(learnerData);
    if (!validation.valid) {
      return { success: false, errors: validation.errors };
    }

    // Create new learner with ID and timestamp
    const newLearner = {
      ...learnerData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: learnerData.status || 'Active'
    };

    setLearners(prev => [...prev, newLearner]);
    return { success: true, data: newLearner };
  }, []);

  /**
   * Update an existing learner
   * @param {number} learnerId - ID of learner to update
   * @param {Object} updates - Fields to update
   * @returns {Object} Result with success flag
   */
  const updateLearner = useCallback((learnerId, updates) => {
    setLearners(prev => 
      prev.map(learner => 
        learner.id === learnerId 
          ? { ...learner, ...updates, updatedAt: new Date().toISOString() }
          : learner
      )
    );
    return { success: true };
  }, []);

  /**
   * Delete a learner
   * @param {number} learnerId - ID of learner to delete
   * @returns {Object} Result with success flag
   */
  const deleteLearner = useCallback((learnerId) => {
    setLearners(prev => prev.filter(learner => learner.id !== learnerId));
    if (selectedLearner?.id === learnerId) {
      setSelectedLearner(null);
    }
    return { success: true };
  }, [selectedLearner]);

  /**
   * Deactivate a learner (soft delete)
   * @param {number} learnerId - ID of learner to deactivate
   * @returns {Object} Result with success flag
   */
  const deactivateLearner = useCallback((learnerId) => {
    return updateLearner(learnerId, { status: 'Deactivated' });
  }, [updateLearner]);

  /**
   * Activate a learner
   * @param {number} learnerId - ID of learner to activate
   * @returns {Object} Result with success flag
   */
  const activateLearner = useCallback((learnerId) => {
    return updateLearner(learnerId, { status: 'Active' });
  }, [updateLearner]);

  /**
   * Get learner by ID
   * @param {number} learnerId - ID of learner
   * @returns {Object|null} Learner object or null
   */
  const getLearnerById = useCallback((learnerId) => {
    return learners.find(learner => learner.id === learnerId) || null;
  }, [learners]);

  /**
   * Get learner by admission number
   * @param {string} admNo - Admission number
   * @returns {Object|null} Learner object or null
   */
  const getLearnerByAdmNo = useCallback((admNo) => {
    return learners.find(learner => learner.admNo === admNo) || null;
  }, [learners]);

  /**
   * Get learners by grade and stream
   * @param {string} grade - Grade name
   * @param {string} stream - Stream letter
   * @returns {Array} Array of learners
   */
  const getLearnersByClass = useCallback((grade, stream = null) => {
    return learners.filter(learner => {
      const matchesGrade = learner.grade === grade;
      const matchesStream = !stream || learner.stream === stream;
      return matchesGrade && matchesStream && learner.status === 'Active';
    });
  }, [learners]);

  /**
   * Promote learners to next grade
   * @param {Array} learnerIds - Array of learner IDs to promote
   * @param {string} newGrade - New grade level
   * @param {string} newStream - New stream (optional)
   * @returns {Object} Result with success flag and count
   */
  const promoteLearners = useCallback((learnerIds, newGrade, newStream = null) => {
    let promotedCount = 0;
    
    setLearners(prev => 
      prev.map(learner => {
        if (learnerIds.includes(learner.id)) {
          promotedCount++;
          return {
            ...learner,
            grade: newGrade,
            stream: newStream || learner.stream,
            promotedAt: new Date().toISOString()
          };
        }
        return learner;
      })
    );

    return { success: true, count: promotedCount };
  }, []);

  /**
   * Transfer learner out
   * @param {number} learnerId - ID of learner
   * @param {Object} transferData - Transfer details
   * @returns {Object} Result with success flag
   */
  const transferLearnerOut = useCallback((learnerId, transferData) => {
    const learner = getLearnerById(learnerId);
    if (!learner) {
      return { success: false, error: 'Learner not found' };
    }

    // Update learner status
    updateLearner(learnerId, {
      status: 'Exited',
      exitDate: transferData.transferDate,
      exitReason: 'Transferred to Another School',
      destination: transferData.destinationSchool,
      transferDetails: transferData
    });

    return { success: true, data: learner };
  }, [getLearnerById, updateLearner]);

  /**
   * Search learners
   * @param {string} searchTerm - Search term
   * @returns {Array} Filtered learners
   */
  const searchLearners = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') {
      return learners;
    }

    const term = searchTerm.toLowerCase();
    return learners.filter(learner => 
      learner.firstName?.toLowerCase().includes(term) ||
      learner.lastName?.toLowerCase().includes(term) ||
      learner.middleName?.toLowerCase().includes(term) ||
      learner.admNo?.toLowerCase().includes(term)
    );
  }, [learners]);

  /**
   * Filter learners
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered learners
   */
  const filterLearners = useCallback((filters) => {
    return learners.filter(learner => {
      const matchesGrade = !filters.grade || filters.grade === 'all' || learner.grade === filters.grade;
      const matchesStream = !filters.stream || filters.stream === 'all' || learner.stream === filters.stream;
      const matchesStatus = !filters.status || filters.status === 'all' || learner.status === filters.status;
      const matchesGender = !filters.gender || filters.gender === 'all' || learner.gender === filters.gender;
      
      return matchesGrade && matchesStream && matchesStatus && matchesGender;
    });
  }, [learners]);

  // Computed values
  const activeLearners = useMemo(() => 
    learners.filter(l => l.status === 'Active'),
    [learners]
  );

  const totalLearners = useMemo(() => learners.length, [learners]);

  const learnersByGrade = useMemo(() => {
    const grouped = {};
    learners.forEach(learner => {
      if (!grouped[learner.grade]) {
        grouped[learner.grade] = [];
      }
      grouped[learner.grade].push(learner);
    });
    return grouped;
  }, [learners]);

  return {
    // State
    learners,
    selectedLearner,
    loading,
    error,
    activeLearners,
    totalLearners,
    learnersByGrade,

    // Actions
    setLearners,
    setSelectedLearner,
    addLearner,
    updateLearner,
    deleteLearner,
    deactivateLearner,
    activateLearner,
    getLearnerById,
    getLearnerByAdmNo,
    getLearnersByClass,
    promoteLearners,
    transferLearnerOut,
    searchLearners,
    filterLearners
  };
};
