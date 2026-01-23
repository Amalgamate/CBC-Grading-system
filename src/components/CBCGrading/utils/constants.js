/**
 * System Constants
 * All static configuration and reference data
 */

// Assessment Types
export const ASSESSMENT_TYPES = [
  { value: 'Classwork', label: 'Classwork', icon: '📝' },
  { value: 'Homework', label: 'Homework', icon: '📚' },
  { value: 'Quiz', label: 'Quiz', icon: '❓' },
  { value: 'Project', label: 'Project', icon: '📊' },
  { value: 'Oral Assessment', label: 'Oral Assessment', icon: '🗣️' },
  { value: 'Practical Work', label: 'Practical Work', icon: '🔬' },
  { value: 'Group Work', label: 'Group Work', icon: '👥' },
  { value: 'Presentation', label: 'Presentation', icon: '🎤' }
];

// Status Colors
export const STATUS_COLORS = {
  'Active': 'bg-green-100 text-green-800',
  'Deactivated': 'bg-red-100 text-red-800',
  'Exited': 'bg-yellow-100 text-yellow-800',
  'Pending': 'bg-blue-100 text-blue-800',
  'Published': 'bg-green-100 text-green-800',
  'Draft': 'bg-orange-100 text-orange-800',
  'On Leave': 'bg-orange-100 text-orange-800',
  'Inactive': 'bg-gray-100 text-gray-800',
  'Present': 'bg-green-100 text-green-800',
  'Absent': 'bg-red-100 text-red-800',
  'Late': 'bg-orange-100 text-orange-800',
  'Unread': 'bg-blue-100 text-blue-800',
  'Read': 'bg-gray-100 text-gray-800'
};

// Attendance Statuses
export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late'
};

// Transfer Reasons
export const TRANSFER_REASONS = [
  'Parent Job Transfer',
  'Family Relocation',
  'Academic Reasons',
  'Financial Constraints',
  'Other'
];

// Exit Reasons
export const EXIT_REASONS = [
  'Transferred to Another School',
  'Relocated',
  'Graduated',
  'Withdrawn',
  'Other'
];

// Communication Categories
export const NOTICE_CATEGORIES = [
  'Academic',
  'Events',
  'Finance',
  'Meetings',
  'General'
];

export const PRIORITY_LEVELS = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low'
};

// Channel Types
export const CHANNEL_TYPES = {
  CLASS: 'Class',
  STAFF: 'Staff',
  COMMITTEE: 'Committee',
  GENERAL: 'General'
};

// Terms
export const TERMS = ['Term 1', 'Term 2', 'Term 3'];

// Grade Levels for Filtering
export const GRADE_LEVELS = [
  'Grade 1', 'Grade 2', 'Grade 3', 
  'Grade 4', 'Grade 5', 'Grade 6'
];

// Streams
export const STREAMS = ['A', 'B', 'C', 'D'];

// Assessment Methods
export const ASSESSMENT_METHODS = [
  'Observation',
  'Written Test',
  'Oral Questioning',
  'Practical Demonstration',
  'Portfolio Review',
  'Group Discussion',
  'Peer Assessment',
  'Self Assessment'
];

// Test Types
export const TEST_TYPES = [
  'Tuner-Up',
  'Mid-term',
  'End of Term'
];

// Gender Options
export const GENDER_OPTIONS = ['Male', 'Female'];

// Blood Groups
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Transport Options
export const TRANSPORT_OPTIONS = ['Private', 'School Bus', 'Walking'];

// Relationships
export const RELATIONSHIPS = ['Father', 'Mother', 'Guardian', 'Other'];

// Kenya Counties (Sample)
export const KENYA_COUNTIES = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Malindi',
  'Kitale',
  'Garissa',
  'Kakamega'
];

// User Roles
export const USER_ROLES = [
  'Administrator',
  'Teacher',
  'Parent',
  'Secretary',
  'Accountant'
];

// Page Titles Mapping
export const PAGE_TITLES = {
  'dashboard': 'Dashboard',
  
  // Learners
  'learners-list': 'All Students',
  'learners-admissions': 'Admissions',
  'learners-transfers-in': 'Incoming Transfers',
  'learners-exited': 'Exited Students',
  'learners-promotion': 'Promotion',
  'learners-transfer-out': 'Transfer Out',
  
  // Teachers/Parents
  'teachers-list': 'Tutors List',
  'parents-list': 'Parents List',
  
  // Attendance
  'attendance-daily': 'Daily Attendance',
  'attendance-reports': 'Attendance Reports',
  
  // Communications
  'comm-notices': 'Notices & Announcements',
  'comm-messages': 'Messages',
  
  // Assessment
  'assess-formative': 'Formative Assessment',
  'assess-formative-report': 'Formative Report',
  'assess-summative-tests': 'Summative Tests',
  'assess-summative-assessment': 'Summative Assessment',
  'assess-summative-report': 'Summative Report',
  'assess-termly-report': 'Termly Report',
  'assess-performance-scale': 'Performance Scale',
  
  // Learning Hub
  'learning-hub-materials': 'Class Materials',
  'learning-hub-assignments': 'Assignments',
  'learning-hub-lesson-plans': 'Lesson Plans',
  'learning-hub-library': 'Resource Library',
  
  // Fees
  'fees-structure': 'Fee Structure',
  'fees-collection': 'Fee Collection',
  'fees-reports': 'Fee Reports',
  'fees-statements': 'Student Statements',
  
  // Help
  'help': 'Help & Support',
  
  // Settings
  'settings-school': 'School Settings',
  'settings-academic': 'Academic Settings',
  'settings-users': 'System Users',
  'settings-branding': 'Branding & Customization',
  'settings-backup': 'Backup & Restore',
  'settings-communication': 'Communication Settings',
  'settings-profile': 'My Profile'
};

/**
 * Helper function to get status color class
 * @param {string} status - Status value
 * @returns {string} Tailwind CSS classes
 */
export const getStatusColor = (status) => {
  return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
};
