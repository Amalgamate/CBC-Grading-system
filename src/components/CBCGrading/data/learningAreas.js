/**
 * CBC Learning Areas Structure
 * Complete learning areas with strands, sub-strands, and outcomes
 */

export const learningAreas = [
  {
    id: 1,
    name: 'Mathematics Activities',
    shortName: 'Math',
    code: 'MATH',
    gradeLevel: 'Lower Primary',
    grades: ['Grade 1', 'Grade 2', 'Grade 3'],
    color: '#3b82f6',
    icon: '🔢',
    weight: 1.0,
    strands: [
      {
        id: 1,
        name: 'Numbers',
        subStrands: [
          { 
            name: 'Whole Numbers', 
            outcomes: [
              'Count numbers up to 1000', 
              'Read and write numbers in words', 
              'Compare and order numbers'
            ] 
          },
          { 
            name: 'Fractions', 
            outcomes: [
              'Identify fractions', 
              'Compare simple fractions', 
              'Add simple fractions'
            ] 
          }
        ]
      },
      {
        id: 2,
        name: 'Measurement',
        subStrands: [
          { 
            name: 'Length', 
            outcomes: [
              'Measure using standard units', 
              'Estimate lengths', 
              'Compare measurements'
            ] 
          },
          { 
            name: 'Time', 
            outcomes: [
              'Tell time to the hour', 
              'Tell time to half hour', 
              'Read calendars'
            ] 
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: 'English Activities',
    shortName: 'English',
    code: 'ENG',
    gradeLevel: 'Lower Primary',
    grades: ['Grade 1', 'Grade 2', 'Grade 3'],
    color: '#10b981',
    icon: '📚',
    weight: 1.0,
    strands: [
      {
        id: 1,
        name: 'Listening and Speaking',
        subStrands: [
          { 
            name: 'Oral Communication', 
            outcomes: [
              'Listen and respond', 
              'Express ideas clearly', 
              'Participate in discussions'
            ] 
          }
        ]
      },
      {
        id: 2,
        name: 'Reading',
        subStrands: [
          { 
            name: 'Reading Skills', 
            outcomes: [
              'Read simple texts', 
              'Identify main ideas', 
              'Answer comprehension questions'
            ] 
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: 'Kiswahili Activities',
    shortName: 'Kiswahili',
    code: 'KIS',
    gradeLevel: 'Lower Primary',
    grades: ['Grade 1', 'Grade 2', 'Grade 3'],
    color: '#f59e0b',
    icon: '🗣️',
    weight: 1.0,
    strands: [
      {
        id: 1,
        name: 'Kusoma',
        subStrands: [
          { 
            name: 'Kusoma kwa Ufahamu', 
            outcomes: [
              'Soma kwa uelewa', 
              'Eleza mawazo', 
              'Jibu maswali'
            ] 
          }
        ]
      }
    ]
  },
  {
    id: 4,
    name: 'Environmental Activities',
    shortName: 'Environmental',
    code: 'ENV',
    gradeLevel: 'Lower Primary',
    grades: ['Grade 1', 'Grade 2', 'Grade 3'],
    color: '#22c55e',
    icon: '🌱',
    weight: 1.0,
    strands: [
      {
        id: 1,
        name: 'Living Things',
        subStrands: [
          { 
            name: 'Plants and Animals', 
            outcomes: [
              'Identify living things', 
              'Classify plants', 
              'Observe animal behavior'
            ] 
          }
        ]
      }
    ]
  },
  {
    id: 5,
    name: 'Religious Education',
    shortName: 'CRE',
    code: 'CRE',
    gradeLevel: 'Lower Primary',
    grades: ['Grade 1', 'Grade 2', 'Grade 3'],
    color: '#8b5cf6',
    icon: '✝️',
    weight: 1.0,
    strands: [
      {
        id: 1,
        name: 'God and Creation',
        subStrands: [
          { 
            name: 'Creation Stories', 
            outcomes: [
              'Retell creation story', 
              'Appreciate Gods creation', 
              'Care for environment'
            ] 
          }
        ]
      }
    ]
  },
  {
    id: 6,
    name: 'Creative Arts',
    shortName: 'Arts',
    code: 'ART',
    gradeLevel: 'Lower Primary',
    grades: ['Grade 1', 'Grade 2', 'Grade 3'],
    color: '#ec4899',
    icon: '🎨',
    weight: 0.5,
    strands: [
      {
        id: 1,
        name: 'Visual Arts',
        subStrands: [
          { 
            name: 'Drawing and Painting', 
            outcomes: [
              'Draw simple objects', 
              'Use colors creatively', 
              'Express ideas through art'
            ] 
          }
        ]
      }
    ]
  },
  {
    id: 7,
    name: 'Physical Education',
    shortName: 'PE',
    code: 'PE',
    gradeLevel: 'Lower Primary',
    grades: ['Grade 1', 'Grade 2', 'Grade 3'],
    color: '#f97316',
    icon: '⚽',
    weight: 0.5,
    strands: [
      {
        id: 1,
        name: 'Movement Skills',
        subStrands: [
          { 
            name: 'Basic Movements', 
            outcomes: [
              'Run effectively', 
              'Jump with coordination', 
              'Throw accurately'
            ] 
          }
        ]
      }
    ]
  }
];

/**
 * Get learning area by name
 * @param {string} name - Learning area name
 * @returns {Object|null} Learning area object or null
 */
export const getLearningAreaByName = (name) => {
  return learningAreas.find(area => area.name === name) || null;
};

/**
 * Get all strands for a learning area
 * @param {string} learningAreaName - Name of learning area
 * @returns {Array} Array of strands
 */
export const getStrandsForArea = (learningAreaName) => {
  const area = getLearningAreaByName(learningAreaName);
  return area ? area.strands : [];
};

/**
 * Get sub-strands for a specific strand
 * @param {string} learningAreaName - Name of learning area
 * @param {string} strandName - Name of strand
 * @returns {Array} Array of sub-strands
 */
export const getSubStrands = (learningAreaName, strandName) => {
  const strands = getStrandsForArea(learningAreaName);
  const strand = strands.find(s => s.name === strandName);
  return strand ? strand.subStrands : [];
};
