/**
 * Learning Areas by Grade Constants
 * Single source of truth for curriculum structure across all grades
 * Maps each grade to its specific subjects/learning areas
 */

/**
 * Early Years Education (Crèche, Playgroup, Reception, Transition)
 */
export const EARLY_YEARS_LEARNING_AREAS = [
  'Literacy Activities',
  'Mathematical Activities',
  'English Language Activities',
  'Environmental Activities',
  'Creative Arts Activities',
  'Christian Religious Education',
  'Islamic Religious Education',
  'Computer Studies Activities'
];

/**
 * Pre-Primary Education (PP1, PP2)
 */
export const PRE_PRIMARY_LEARNING_AREAS = [
  'Literacy',
  'English Language Activities',
  'Mathematical Activities',
  'Environmental Activities',
  'Creative Activities',
  'Christian Religious Education',
  'Islamic Religious Education',
  'Computer Studies (Interactive)',
  'Kiswahili Lugha'
];

/**
 * Primary Education - Grades 1-3 (Lower Primary)
 */
export const LOWER_PRIMARY_LEARNING_AREAS = [
  'English Language Activities',
  'Kiswahili Language Activities',
  'Indigenous Language Activities',
  'Mathematics',
  'Environmental Activities',
  'Creative Arts Activities',
  'Christian Religious Education',
  'Islamic Religious Education',
  'Computer Studies',
  'French (Optional)'
];

/**
 * Primary Education - Grades 4-6 (Upper Primary)
 */
export const UPPER_PRIMARY_LEARNING_AREAS = [
  'English Language',
  'Kiswahili Lugha',
  'Mathematics',
  'Science and Technology',
  'Social Studies',
  'Agriculture',
  'Creative Arts',
  'Christian Religious Education',
  'Islamic Religious Education',
  'Computer Studies',
  'Coding and Robotics',
  'French'
];

/**
 * Junior School - Grades 7-9
 */
export const JUNIOR_SCHOOL_LEARNING_AREAS = [
  'English Language',
  'Kiswahili Lugha',
  'Mathematics',
  'Integrated Science',
  'Social Studies',
  'Pre-Technical Studies',
  'Agriculture',
  'Creative Arts and Sports',
  'Christian Religious Education',
  'Islamic Religious Education',
  'Computer Studies',
  'Coding and Robotics',
  'French'
];

/**
 * Senior School - Grades 10-12
 * Combines Core subjects and all Pathways (STEM, Social Sciences, Arts & Sports)
 */
export const SENIOR_SCHOOL_LEARNING_AREAS = [
  // Core
  'Community Service Learning',
  'Physical Education and Sports',
  'ICT / Digital Literacy',
  'Life Skills Education',
  // STEM Pathway
  'Biology',
  'Chemistry',
  'Physics',
  'Computer Science',
  'Engineering Studies',
  'Environmental Science',
  // Social Sciences Pathway
  'History',
  'Geography',
  'Economics',
  'Business Studies',
  'Religious Studies',
  'Sociology',
  'Political Science',
  // Arts & Sports Pathway
  'Visual Arts',
  'Performing Arts',
  'Music',
  'Film and Media Studies',
  'Sports Science',
  'Theatre and Dance'
];

/**
 * Grade to Learning Areas Mapping
 * Central mapping for all grades in the system
 */
export const GRADE_LEARNING_AREAS_MAP = {
  // Early Years
  'CRECHE': EARLY_YEARS_LEARNING_AREAS,
  'PLAYGROUP': EARLY_YEARS_LEARNING_AREAS,
  'RECEPTION': EARLY_YEARS_LEARNING_AREAS,
  'TRANSITION': EARLY_YEARS_LEARNING_AREAS,

  // Pre-Primary
  'PP1': PRE_PRIMARY_LEARNING_AREAS,
  'PP2': PRE_PRIMARY_LEARNING_AREAS,

  // Lower Primary
  'GRADE_1': LOWER_PRIMARY_LEARNING_AREAS,
  'GRADE_2': LOWER_PRIMARY_LEARNING_AREAS,
  'GRADE_3': LOWER_PRIMARY_LEARNING_AREAS,

  // Upper Primary
  'GRADE_4': UPPER_PRIMARY_LEARNING_AREAS,
  'GRADE_5': UPPER_PRIMARY_LEARNING_AREAS,
  'GRADE_6': UPPER_PRIMARY_LEARNING_AREAS,

  // Junior School
  'GRADE_7': JUNIOR_SCHOOL_LEARNING_AREAS,
  'GRADE_8': JUNIOR_SCHOOL_LEARNING_AREAS,
  'GRADE_9': JUNIOR_SCHOOL_LEARNING_AREAS,

  // Senior School
  'GRADE_10': SENIOR_SCHOOL_LEARNING_AREAS,
  'GRADE_11': SENIOR_SCHOOL_LEARNING_AREAS,
  'GRADE_12': SENIOR_SCHOOL_LEARNING_AREAS
};

/**
 * Get learning areas for a specific grade
 * Returns the learning areas available for the given grade
 * 
 * @param {string} grade - Grade value (e.g., 'GRADE_9', 'PP1')
 * @returns {string[]} Array of learning areas for the grade
 * 
 * @example
 * getLearningAreasByGrade('GRADE_9')
 * // Returns: ['Mathematics', 'English Language', 'Kiswahili Lugha', ...]
 */
export const getLearningAreasByGrade = (grade) => {
  if (!grade) return [];

  const gradeUpper = String(grade).toUpperCase().trim();
  return GRADE_LEARNING_AREAS_MAP[gradeUpper] || [];
};

/**
 * Get all unique learning areas across all grades
 * Useful for dropdowns that should accept any learning area
 * 
 * @returns {string[]} Array of all unique learning areas
 */
export const getAllLearningAreas = () => {
  const allAreas = new Set();
  Object.values(GRADE_LEARNING_AREAS_MAP).forEach(areas => {
    areas.forEach(area => allAreas.add(area));
  });
  return Array.from(allAreas).sort();
};

/**
 * Check if a learning area is valid for a given grade
 * 
 * @param {string} grade - Grade value
 * @param {string} learningArea - Learning area to check
 * @returns {boolean} True if the learning area is valid for the grade
 * 
 * @example
 * isValidLearningAreaForGrade('GRADE_9', 'Mathematics')
 * // Returns: true
 */
export const isValidLearningAreaForGrade = (grade, learningArea) => {
  if (!grade || !learningArea) return false;

  const areas = getLearningAreasByGrade(grade);
  return areas.some(area =>
    area.toLowerCase() === learningArea.toLowerCase()
  );
};

/**
 * Get learning areas grouped by category
 * Useful for organized dropdown displays
 * 
 * @param {string} grade - Grade value
 * @returns {Object} Grouped learning areas by category
 * 
 * @example
 * getGroupedLearningAreas('GRADE_9')
 * // Returns: {
 * //   'Languages': ['English Language', 'Kiswahili Lugha', 'French'],
 * //   'Sciences': ['Physics', 'Chemistry', 'Biology', ...],
 * //   'Technical': ['Computer Studies', 'Coding & Robotics', ...],
 * //   ...
 * // }
 */
export const getGroupedLearningAreas = (grade) => {
  const areas = getLearningAreasByGrade(grade);

  const grouped = {
    'Core Academics': [],
    'Languages': [],
    'Sciences': [],
    'Social': [],
    'Technical & IT': [],
    'Creative & Physical': [],
    'Religious Education': [],
    'Other': []
  };

  const languageKeywords = ['language', 'lugha', 'french', 'english', 'kiswahili'];
  const scienceKeywords = ['science', 'physics', 'chemistry', 'biology', 'integrated'];
  const socialKeywords = ['social', 'studies', 'history', 'geography', 'government', 'economics'];
  const technicalKeywords = ['computer', 'coding', 'robotics', 'technical', 'pre-technical'];
  const creativeKeywords = ['creative', 'arts', 'sports', 'physical', 'education'];
  const religionKeywords = ['cre', 'ire', 'hre', 'religious', 'education'];

  areas.forEach(area => {
    const areaLower = area.toLowerCase();

    if (religionKeywords.some(k => areaLower.includes(k))) {
      grouped['Religious Education'].push(area);
    } else if (languageKeywords.some(k => areaLower.includes(k))) {
      grouped['Languages'].push(area);
    } else if (scienceKeywords.some(k => areaLower.includes(k))) {
      grouped['Sciences'].push(area);
    } else if (socialKeywords.some(k => areaLower.includes(k))) {
      grouped['Social'].push(area);
    } else if (technicalKeywords.some(k => areaLower.includes(k))) {
      grouped['Technical & IT'].push(area);
    } else if (creativeKeywords.some(k => areaLower.includes(k))) {
      grouped['Creative & Physical'].push(area);
    } else if (areaLower.includes('math')) {
      grouped['Core Academics'].push(area);
    } else {
      grouped['Other'].push(area);
    }
  });

  // Remove empty categories
  return Object.fromEntries(
    Object.entries(grouped).filter(([, items]) => items.length > 0)
  );
};

export default {
  GRADE_LEARNING_AREAS_MAP,
  EARLY_YEARS_LEARNING_AREAS,
  PRE_PRIMARY_LEARNING_AREAS,
  LOWER_PRIMARY_LEARNING_AREAS,
  UPPER_PRIMARY_LEARNING_AREAS,
  JUNIOR_SCHOOL_LEARNING_AREAS,
  SENIOR_SCHOOL_LEARNING_AREAS,
  getLearningAreasByGrade,
  getAllLearningAreas,
  isValidLearningAreaForGrade,
  getGroupedLearningAreas
};
