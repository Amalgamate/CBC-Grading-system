/**
 * Learning Areas by Grade Constants
 * Single source of truth for curriculum structure across all grades
 * Maps each grade to its specific subjects/learning areas
 */

/**
 * Early Childhood Development (ECD) - Nursery/Kindergarten
 */
export const ECD_LEARNING_AREAS = [
  'Mathematics Activities',
  'English Activities',
  'Kiswahili Activities',
  'Environmental Activities',
  'Religious Education',
  'Creative Arts & Sports',
  'Play-Based Learning'
];

/**
 * Primary Education - Grades 1-3 (Lower Primary)
 */
export const LOWER_PRIMARY_LEARNING_AREAS = [
  'Mathematics',
  'English Activities',
  'Kiswahili Activities',
  'Environmental Activities',
  'Integrated Science',
  'Social Studies',
  'Creative Arts & Sports',
  'Religious Education'
];

/**
 * Primary Education - Grades 4-6 (Upper Primary)
 */
export const UPPER_PRIMARY_LEARNING_AREAS = [
  'Mathematics',
  'English Language',
  'Kiswahili Lugha',
  'Science',
  'Social Studies',
  'Creative Arts',
  'Physical Education',
  'Integrated Science',
  'Religious Education'
];

/**
 * Lower Secondary - Grades 7-8 (Forms 1-2)
 */
export const LOWER_SECONDARY_LEARNING_AREAS = [
  'Mathematics',
  'English Language',
  'Kiswahili Lugha',
  'Science',
  'Social Studies',
  'Creative Arts and Sports',
  'Pre-Technical Studies',
  'Integrated Science',
  'IRE',
  'CRE'
];

/**
 * Upper Secondary - Grades 9-12 (Forms 3-4 / 5-6)
 */
export const UPPER_SECONDARY_LEARNING_AREAS = [
  'Mathematics',
  'English Language',
  'Kiswahili Lugha',
  'Physics',
  'Chemistry',
  'Biology',
  'Integrated Science',
  'Computer Studies',
  'Coding & Robotics',
  'Agriculture',
  'Social Studies',
  'History',
  'Geography',
  'Government',
  'French',
  'CRE',
  'IRE',
  'Pre-Technical Studies',
  'Creative Arts and Sports',
  'Business Studies',
  'Economics'
];

/**
 * Grade to Learning Areas Mapping
 * Central mapping for all grades in the system
 */
export const GRADE_LEARNING_AREAS_MAP = {
  // Early Childhood
  'NURSERY': ECD_LEARNING_AREAS,
  'KINDERGARTEN': ECD_LEARNING_AREAS,
  'PLAYGROUP': ECD_LEARNING_AREAS,
  'CRECHE': ECD_LEARNING_AREAS,
  
  // Lower Primary
  'PP1': LOWER_PRIMARY_LEARNING_AREAS,
  'PP2': LOWER_PRIMARY_LEARNING_AREAS,
  'GRADE_1': LOWER_PRIMARY_LEARNING_AREAS,
  'GRADE_2': LOWER_PRIMARY_LEARNING_AREAS,
  'GRADE_3': LOWER_PRIMARY_LEARNING_AREAS,
  
  // Upper Primary
  'GRADE_4': UPPER_PRIMARY_LEARNING_AREAS,
  'GRADE_5': UPPER_PRIMARY_LEARNING_AREAS,
  'GRADE_6': UPPER_PRIMARY_LEARNING_AREAS,
  
  // Lower Secondary
  'GRADE_7': LOWER_SECONDARY_LEARNING_AREAS,
  'GRADE_8': LOWER_SECONDARY_LEARNING_AREAS,
  
  // Upper Secondary
  'GRADE_9': UPPER_SECONDARY_LEARNING_AREAS,
  'GRADE_10': UPPER_SECONDARY_LEARNING_AREAS,
  'GRADE_11': UPPER_SECONDARY_LEARNING_AREAS,
  'GRADE_12': UPPER_SECONDARY_LEARNING_AREAS
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
  ECD_LEARNING_AREAS,
  LOWER_PRIMARY_LEARNING_AREAS,
  UPPER_PRIMARY_LEARNING_AREAS,
  LOWER_SECONDARY_LEARNING_AREAS,
  UPPER_SECONDARY_LEARNING_AREAS,
  getLearningAreasByGrade,
  getAllLearningAreas,
  isValidLearningAreaForGrade,
  getGroupedLearningAreas
};
