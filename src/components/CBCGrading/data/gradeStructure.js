/**
 * Grade/Stream Structure Data
 * Complete school structure with all grade levels
 */

export const gradeStructure = [
  // EARLY YEARS
  { 
    id: 1, 
    name: 'Crèche', 
    code: 'CRE', 
    learningArea: 'Early Years', 
    ageRange: '0-2 years', 
    capacity: 15, 
    active: true, 
    curriculum: 'Play-based', 
    subjects: []
  },
  { 
    id: 2, 
    name: 'Reception', 
    code: 'REC', 
    learningArea: 'Early Years', 
    ageRange: '2-3 years', 
    capacity: 20, 
    active: true, 
    curriculum: 'Play-based', 
    subjects: []
  },
  { 
    id: 3, 
    name: 'Transition', 
    code: 'TRA', 
    learningArea: 'Early Years', 
    ageRange: '3-4 years', 
    capacity: 25, 
    active: true, 
    curriculum: 'Play-based', 
    subjects: []
  },
  { 
    id: 4, 
    name: 'Playgroup', 
    code: 'PLG', 
    learningArea: 'Early Years', 
    ageRange: '4-5 years', 
    capacity: 25, 
    active: true, 
    curriculum: 'Play-based', 
    subjects: []
  },
  { 
    id: 5, 
    name: 'Pre-Primary 1', 
    code: 'PP1', 
    learningArea: 'Early Years', 
    ageRange: '5-6 years', 
    capacity: 30, 
    active: true, 
    curriculum: 'CBC', 
    subjects: ['Literacy', 'Numeracy', 'Environmental', 'Creative Arts']
  },
  { 
    id: 6, 
    name: 'Pre-Primary 2', 
    code: 'PP2', 
    learningArea: 'Early Years', 
    ageRange: '6-7 years', 
    capacity: 30, 
    active: true, 
    curriculum: 'CBC', 
    subjects: ['Literacy', 'Numeracy', 'Environmental', 'Creative Arts']
  },
  
  // LOWER PRIMARY
  { 
    id: 7, 
    name: 'Grade 1', 
    code: 'G1', 
    learningArea: 'Lower Primary', 
    ageRange: '6-7 years', 
    capacity: 35, 
    active: true, 
    curriculum: 'CBC', 
    subjects: ['English', 'Kiswahili', 'Mathematics', 'Environmental', 'Religious Education', 'Creative Arts', 'Physical Education']
  },
  { 
    id: 8, 
    name: 'Grade 2', 
    code: 'G2', 
    learningArea: 'Lower Primary', 
    ageRange: '7-8 years', 
    capacity: 35, 
    active: true, 
    curriculum: 'CBC', 
    subjects: ['English', 'Kiswahili', 'Mathematics', 'Environmental', 'Religious Education', 'Creative Arts', 'Physical Education']
  },
  { 
    id: 9, 
    name: 'Grade 3', 
    code: 'G3', 
    learningArea: 'Lower Primary', 
    ageRange: '8-9 years', 
    capacity: 40, 
    active: true, 
    curriculum: 'CBC', 
    subjects: ['English', 'Kiswahili', 'Mathematics', 'Environmental', 'Religious Education', 'Creative Arts', 'Physical Education']
  },
  
  // UPPER PRIMARY
  { 
    id: 10, 
    name: 'Grade 4', 
    code: 'G4', 
    learningArea: 'Upper Primary', 
    ageRange: '9-10 years', 
    capacity: 40, 
    active: true, 
    curriculum: 'CBC', 
    subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Creative Arts', 'Physical Education']
  },
  { 
    id: 11, 
    name: 'Grade 5', 
    code: 'G5', 
    learningArea: 'Upper Primary', 
    ageRange: '10-11 years', 
    capacity: 40, 
    active: true, 
    curriculum: 'CBC', 
    subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Creative Arts', 'Physical Education']
  },
  { 
    id: 12, 
    name: 'Grade 6', 
    code: 'G6', 
    learningArea: 'Upper Primary', 
    ageRange: '11-12 years', 
    capacity: 40, 
    active: true, 
    curriculum: 'CBC', 
    subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Creative Arts', 'Physical Education']
  },
  
  // JUNIOR SCHOOL
  { 
    id: 13, 
    name: 'Grade 7', 
    code: 'G7', 
    learningArea: 'Junior School', 
    ageRange: '12-13 years', 
    capacity: 45, 
    active: true, 
    curriculum: 'CBC/IGCSE', 
    subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Life Skills']
  },
  { 
    id: 14, 
    name: 'Grade 8', 
    code: 'G8', 
    learningArea: 'Junior School', 
    ageRange: '13-14 years', 
    capacity: 45, 
    active: true, 
    curriculum: 'CBC/IGCSE', 
    subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Life Skills']
  },
  { 
    id: 15, 
    name: 'Grade 9', 
    code: 'G9', 
    learningArea: 'Junior School', 
    ageRange: '14-15 years', 
    capacity: 45, 
    active: true, 
    curriculum: 'CBC/IGCSE', 
    subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Life Skills']
  },
  
  // SENIOR SCHOOL
  { 
    id: 16, 
    name: 'Grade 10', 
    code: 'G10', 
    learningArea: 'Senior School', 
    ageRange: '15-16 years', 
    capacity: 40, 
    active: true, 
    curriculum: 'IGCSE', 
    subjects: ['English', 'Mathematics', 'Sciences', 'Humanities', 'Languages']
  },
  { 
    id: 17, 
    name: 'Grade 11', 
    code: 'G11', 
    learningArea: 'Senior School', 
    ageRange: '16-17 years', 
    capacity: 40, 
    active: true, 
    curriculum: 'IGCSE', 
    subjects: ['English', 'Mathematics', 'Sciences', 'Humanities', 'Languages']
  },
  { 
    id: 18, 
    name: 'Grade 12', 
    code: 'G12', 
    learningArea: 'Senior School', 
    ageRange: '17-18 years', 
    capacity: 40, 
    active: true, 
    curriculum: 'IGCSE', 
    subjects: ['English', 'Mathematics', 'Sciences', 'Humanities', 'Languages']
  }
];

/**
 * Get grade by name
 * @param {string} gradeName - Name of grade
 * @returns {Object|null} Grade object or null
 */
export const getGradeByName = (gradeName) => {
  return gradeStructure.find(grade => grade.name === gradeName) || null;
};

/**
 * Get all grades in a learning area
 * @param {string} learningArea - Learning area name
 * @returns {Array} Array of grades
 */
export const getGradesByLearningArea = (learningArea) => {
  return gradeStructure.filter(grade => grade.learningArea === learningArea);
};

/**
 * Get next grade level
 * @param {string} currentGrade - Current grade name
 * @returns {string|null} Next grade name or null if graduating
 */
export const getNextGrade = (currentGrade) => {
  const current = gradeStructure.find(g => g.name === currentGrade);
  if (!current) return null;
  
  const next = gradeStructure.find(g => g.id === current.id + 1);
  return next ? next.name : null;
};

/**
 * Get learning area categories
 * @returns {Array} Unique learning area names
 */
export const getLearningAreaCategories = () => {
  return [...new Set(gradeStructure.map(grade => grade.learningArea))];
};

/**
 * Check if grade exists
 * @param {string} gradeName - Grade name to check
 * @returns {boolean} True if grade exists
 */
export const gradeExists = (gradeName) => {
  return gradeStructure.some(grade => grade.name === gradeName);
};
