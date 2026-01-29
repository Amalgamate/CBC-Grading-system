/**
 * useAssessmentSetup Hook
 * Consolidates common assessment context selection logic
 * Used by: FormativeAssessment, CoreCompetenciesAssessment, ValuesAssessment, etc.
 */

import { useState, useCallback } from 'react';
import { TERMS } from '../../../constants/terms';
import { getCurrentAcademicYear } from '../utils/academicYear';

/**
 * Custom hook for assessment setup state
 * Handles: grade, stream, term, academic year selection
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.defaultGrade - Initial grade value
 * @param {string} options.defaultStream - Initial stream value
 * @param {string} options.defaultTerm - Initial term value (default: 'TERM_1')
 * @returns {Object} Assessment setup state and handlers
 */
export const useAssessmentSetup = (options = {}) => {
  const {
    defaultGrade = '',
    defaultStream = '',
    defaultTerm = 'TERM_1'
  } = options;

  // Context state
  const [selectedGrade, setSelectedGrade] = useState(defaultGrade);
  const [selectedStream, setSelectedStream] = useState(defaultStream);
  const [selectedTerm, setSelectedTerm] = useState(defaultTerm);
  const [academicYear] = useState(getCurrentAcademicYear());

  // Reset all selections
  const resetSetup = useCallback(() => {
    setSelectedGrade(defaultGrade);
    setSelectedStream(defaultStream);
    setSelectedTerm(defaultTerm);
  }, [defaultGrade, defaultStream, defaultTerm]);

  // Update grade
  const updateGrade = useCallback((grade) => {
    setSelectedGrade(grade);
  }, []);

  // Update stream
  const updateStream = useCallback((stream) => {
    setSelectedStream(stream);
  }, []);

  // Update term
  const updateTerm = useCallback((term) => {
    setSelectedTerm(term);
  }, []);

  // Check if setup is complete
  const isSetupComplete = useCallback(() => {
    return selectedGrade && selectedStream && selectedTerm;
  }, [selectedGrade, selectedStream, selectedTerm]);

  // Get current setup as object
  const getSetup = useCallback(() => ({
    grade: selectedGrade,
    stream: selectedStream,
    term: selectedTerm,
    academicYear
  }), [selectedGrade, selectedStream, selectedTerm, academicYear]);

  return {
    // State
    selectedGrade,
    selectedStream,
    selectedTerm,
    academicYear,
    terms: TERMS,

    // Setters
    setSelectedGrade: updateGrade,
    setSelectedStream: updateStream,
    setSelectedTerm: updateTerm,

    // Utilities
    resetSetup,
    isSetupComplete,
    getSetup
  };
};

export default useAssessmentSetup;
