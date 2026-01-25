import api from './index';

/**
 * Assessment Service
 * Handles all assessment-related API calls
 */
export const assessmentService = {
  // ============================================
  // FORMATIVE ASSESSMENTS
  // ============================================
  
  /**
   * Create or update formative assessment
   * @param {Object} data Assessment data
   * @returns {Promise} API response
   */
  createFormative: (data) => api.post('/assessments/formative', data),
  
  /**
   * Get formative assessments for a learner
   * @param {string} learnerId Student ID
   * @param {Object} params Query parameters (term, academicYear)
   * @returns {Promise} API response
   */
  getFormativeByLearner: (learnerId, params = {}) => 
    api.get(`/assessments/formative/learner/${learnerId}`, { params }),
  
  /**
   * Get all formative assessments with filters
   * @param {Object} params Query parameters
   * @returns {Promise} API response
   */
  getAllFormative: (params = {}) => 
    api.get('/assessments/formative', { params }),
  
  /**
   * Delete formative assessment
   * @param {string} id Assessment ID
   * @returns {Promise} API response
   */
  deleteFormative: (id) => api.delete(`/assessments/formative/${id}`),

  // ============================================
  // SUMMATIVE TESTS
  // ============================================
  
  /**
   * Create summative test
   * @param {Object} data Test data
   * @returns {Promise} API response
   */
  createTest: (data) => api.post('/assessments/tests', data),
  
  /**
   * Get all summative tests
   * @param {Object} params Query parameters
   * @returns {Promise} API response
   */
  getTests: (params = {}) => api.get('/assessments/tests', { params }),
  
  /**
   * Get single summative test by ID
   * @param {string} id Test ID
   * @returns {Promise} API response
   */
  getTestById: (id) => api.get(`/assessments/tests/${id}`),
  
  /**
   * Update summative test
   * @param {string} id Test ID
   * @param {Object} data Updated test data
   * @returns {Promise} API response
   */
  updateTest: (id, data) => api.put(`/assessments/tests/${id}`, data),
  
  /**
   * Delete summative test
   * @param {string} id Test ID
   * @returns {Promise} API response
   */
  deleteTest: (id) => api.delete(`/assessments/tests/${id}`),

  // ============================================
  // SUMMATIVE RESULTS
  // ============================================
  
  /**
   * Record or update summative result
   * @param {Object} data Result data
   * @returns {Promise} API response
   */
  recordResult: (data) => api.post('/assessments/summative/results', data),
  
  /**
   * Get summative results for a learner
   * @param {string} learnerId Student ID
   * @param {Object} params Query parameters
   * @returns {Promise} API response
   */
  getResultsByLearner: (learnerId, params = {}) => 
    api.get(`/assessments/summative/results/learner/${learnerId}`, { params }),
  
  /**
   * Get all results for a specific test
   * @param {string} testId Test ID
   * @returns {Promise} API response
   */
  getTestResults: (testId) => 
    api.get(`/assessments/summative/results/test/${testId}`)
};

export default assessmentService;
