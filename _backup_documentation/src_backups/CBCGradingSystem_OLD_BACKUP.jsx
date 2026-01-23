import React, { useState } from 'react';
import { Menu, X, Home, Users, Settings, BookOpen, Clock, Award, MessageSquare, BarChart3, ChevronDown, Search, Edit, Trash2, CheckCircle, XCircle, ArrowRight, Plus, Save, AlertCircle, Upload, Eye, Mail, Phone, User, Calendar, MapPin, FileText, Activity, Bell, RefreshCw, LogOut, GraduationCap, ClipboardList, Megaphone } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function CBCGradingSystem({ user, onLogout, brandingSettings, setBrandingSettings }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [modalType, setModalType] = useState('learner');
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [selectedForPromotion, setSelectedForPromotion] = useState([]);
  const [promotionSourceGrade, setPromotionSourceGrade] = useState('Grade 3');
  const [promotionSourceStream, setPromotionSourceStream] = useState('all');
  const [transferFormData, setTransferFormData] = useState({
    learnerId: '',
    transferDate: '',
    destinationSchool: '',
    destinationAddress: '',
    reason: '',
    certificateNumber: ''
  });
  
  const [expandedSections, setExpandedSections] = useState({ 
    dashboard: true,
    learners: false,
    teachers: false,
    attendance: false,
    communications: false,
    assessment: false,
    settings: false
  });

  // Enhanced learners data
  const [learners, setLearners] = useState([
    { 
      id: 1, firstName: 'Amina', middleName: 'Wanjiku', lastName: 'Hassan', 
      admNo: 'ADM001', grade: 'Grade 3', stream: 'A', status: 'Active', 
      phone: '+254712345678', avatar: '👧', dob: '2015-05-12', gender: 'Female',
      dateOfAdmission: '2021-01-15', previousSchool: 'Little Angels School',
      guardian1Name: 'Hassan Mohamed', guardian1Relationship: 'Father',
      guardian1Phone: '+254701234567', guardian1Email: 'hassan.m@email.com',
      guardian1IdNumber: '12345678', guardian1Occupation: 'Engineer',
      bloodGroup: 'O+', allergies: 'None', medicalConditions: 'None',
      transport: 'Private', parentIds: [1]
    },
    { 
      id: 2, firstName: 'Jamal', middleName: 'Kariuki', lastName: 'Kipchoge',
      admNo: 'ADM002', grade: 'Grade 3', stream: 'A', status: 'Active',
      phone: '+254712345679', avatar: '👦', dob: '2015-03-22', gender: 'Male',
      dateOfAdmission: '2021-01-15', previousSchool: 'N/A',
      guardian1Name: 'Samuel Kipchoge', guardian1Relationship: 'Father',
      guardian1Phone: '+254702234567', guardian1Email: 'samuel.k@email.com',
      guardian1IdNumber: '23456789', guardian1Occupation: 'Teacher',
      bloodGroup: 'A+', allergies: 'Peanuts', medicalConditions: 'Asthma',
      transport: 'School Bus', parentIds: [2]
    },
    { 
      id: 3, firstName: 'Zara', middleName: 'Akinyi', lastName: 'Mwangi',
      admNo: 'ADM003', grade: 'Grade 3', stream: 'B', status: 'Active',
      phone: '+254712345680', avatar: '👧', dob: '2015-07-08', gender: 'Female',
      dateOfAdmission: '2021-01-15', previousSchool: 'Sunshine Kindergarten',
      guardian1Name: 'John Mwangi', guardian1Relationship: 'Father',
      guardian1Phone: '+254703234567', guardian1Email: 'john.mwangi@email.com',
      guardian1IdNumber: '34567890', guardian1Occupation: 'Doctor',
      bloodGroup: 'B+', allergies: 'None', medicalConditions: 'None',
      transport: 'Private', parentIds: [3]
    },
    { 
      id: 4, firstName: 'Ahmed', middleName: '', lastName: 'Mohamed',
      admNo: 'ADM004', grade: 'Grade 3', stream: 'B', status: 'Deactivated',
      phone: '+254712345681', avatar: '👦', dob: '2015-09-14', gender: 'Male',
      dateOfAdmission: '2021-01-15', previousSchool: 'N/A',
      guardian1Name: 'Mohamed Ali', guardian1Relationship: 'Father',
      guardian1Phone: '+254704234567', guardian1Email: 'mohamed.a@email.com',
      guardian1IdNumber: '45678901', guardian1Occupation: 'Businessman',
      bloodGroup: 'AB+', allergies: 'None', medicalConditions: 'None',
      transport: 'Walking', parentIds: [4]
    }
  ]);

  // Parents data
  const [parents, setParents] = useState([
    { 
      id: 1, name: 'Hassan Mohamed', email: 'hassan.m@email.com', 
      phone: '+254701234567', altPhone: '+254722123456', idNumber: '12345678',
      occupation: 'Engineer', employer: 'Kenya Power', address: 'Nairobi, Westlands',
      county: 'Nairobi', subCounty: 'Westlands', learnerIds: [1], relationship: 'Father'
    },
    { 
      id: 2, name: 'Samuel Kipchoge', email: 'samuel.k@email.com',
      phone: '+254702234567', altPhone: '', idNumber: '23456789',
      occupation: 'Teacher', employer: 'Nairobi Primary School', address: 'Nairobi, Kilimani',
      county: 'Nairobi', subCounty: 'Kilimani', learnerIds: [2], relationship: 'Father'
    },
    { 
      id: 3, name: 'John Mwangi', email: 'john.mwangi@email.com',
      phone: '+254703234567', altPhone: '+254733234567', idNumber: '34567890',
      occupation: 'Doctor', employer: 'Nairobi Hospital', address: 'Nairobi, Karen',
      county: 'Nairobi', subCounty: 'Karen', learnerIds: [3], relationship: 'Father'
    },
    { 
      id: 4, name: 'Mohamed Ali', email: 'mohamed.a@email.com',
      phone: '+254704234567', altPhone: '', idNumber: '45678901',
      occupation: 'Businessman', employer: 'Self Employed', address: 'Nairobi, Eastleigh',
      county: 'Nairobi', subCounty: 'Eastleigh', learnerIds: [4], relationship: 'Father'
    }
  ]);

  // Exited learners data
  const [exitedLearners, setExitedLearners] = useState([
    {
      id: 100, firstName: 'David', lastName: 'Otieno', admNo: 'ADM010',
      grade: 'Grade 3', stream: 'A', exitDate: '2024-12-15',
      exitReason: 'Transferred to Another School', destination: 'Nairobi Academy', avatar: '👦'
    },
    {
      id: 101, firstName: 'Faith', lastName: 'Wambui', admNo: 'ADM015',
      grade: 'Grade 4', stream: 'B', exitDate: '2024-11-20',
      exitReason: 'Relocated', destination: 'Mombasa', avatar: '👧'
    }
  ]);

  // Incoming transfers data
  const [incomingTransfers, setIncomingTransfers] = useState([
    {
      id: 200, firstName: 'Brian', lastName: 'Mutua', admNo: 'TRF001',
      previousSchool: 'Starehe Boys School', grade: 'Grade 5', status: 'Pending',
      transferDate: '2025-01-20', guardian: 'Peter Mutua', phone: '+254705123456', avatar: '👦'
    },
    {
      id: 201, firstName: 'Sharon', lastName: 'Njeri', admNo: 'TRF002',
      previousSchool: 'Kianda School', grade: 'Grade 4', status: 'Pending',
      transferDate: '2025-01-22', guardian: 'Mary Njeri', phone: '+254706234567', avatar: '👧'
    }
  ]);

  // Teachers data
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      firstName: 'Grace',
      lastName: 'Wanjiru',
      employeeNo: 'TCH001',
      email: 'grace.wanjiru@zawadijrn.ac.ke',
      phone: '+254710234567',
      gender: 'Female',
      dateOfBirth: '1985-03-15',
      nationalId: '28456789',
      tscNumber: 'TSC/234567',
      dateOfJoining: '2018-01-15',
      status: 'Active',
      role: 'Class Teacher',
      subject: 'English',
      classes: ['Grade 3A', 'Grade 4A'],
      qualifications: 'B.Ed (Arts)',
      experience: '12 years',
      avatar: '👩‍🏫',
      address: 'Nairobi, Kilimani',
      emergencyContact: '+254722345678',
      emergencyContactName: 'John Wanjiru',
      bankName: 'KCB Bank',
      accountNumber: '1234567890'
    },
    {
      id: 2,
      firstName: 'David',
      lastName: 'Omondi',
      employeeNo: 'TCH002',
      email: 'david.omondi@zawadijrn.ac.ke',
      phone: '+254711234567',
      gender: 'Male',
      dateOfBirth: '1982-07-22',
      nationalId: '25678901',
      tscNumber: 'TSC/345678',
      dateOfJoining: '2016-09-01',
      status: 'Active',
      role: 'Head of Department',
      subject: 'Mathematics',
      classes: ['Grade 5A', 'Grade 6A'],
      qualifications: 'M.Ed (Mathematics)',
      experience: '15 years',
      avatar: '👨‍🏫',
      address: 'Nairobi, Westlands',
      emergencyContact: '+254733456789',
      emergencyContactName: 'Mary Omondi',
      bankName: 'Equity Bank',
      accountNumber: '2345678901'
    },
    {
      id: 3,
      firstName: 'Faith',
      lastName: 'Chebet',
      employeeNo: 'TCH003',
      email: 'faith.chebet@zawadijrn.ac.ke',
      phone: '+254712345678',
      gender: 'Female',
      dateOfBirth: '1988-11-10',
      nationalId: '30123456',
      tscNumber: 'TSC/456789',
      dateOfJoining: '2019-05-20',
      status: 'Active',
      role: 'Class Teacher',
      subject: 'Science',
      classes: ['Grade 4B', 'Grade 5B'],
      qualifications: 'B.Sc (Education)',
      experience: '8 years',
      avatar: '👩‍🏫',
      address: 'Nairobi, Parklands',
      emergencyContact: '+254744567890',
      emergencyContactName: 'Peter Chebet',
      bankName: 'Co-operative Bank',
      accountNumber: '3456789012'
    },
    {
      id: 4,
      firstName: 'James',
      lastName: 'Kimani',
      employeeNo: 'TCH004',
      email: 'james.kimani@zawadijrn.ac.ke',
      phone: '+254713456789',
      gender: 'Male',
      dateOfBirth: '1990-05-18',
      nationalId: '32234567',
      tscNumber: 'TSC/567890',
      dateOfJoining: '2020-01-10',
      status: 'Active',
      role: 'Class Teacher',
      subject: 'Kiswahili',
      classes: ['Grade 2A', 'Grade 3B'],
      qualifications: 'B.Ed (Languages)',
      experience: '6 years',
      avatar: '👨‍🏫',
      address: 'Nairobi, Kasarani',
      emergencyContact: '+254755678901',
      emergencyContactName: 'Alice Kimani',
      bankName: 'NCBA Bank',
      accountNumber: '4567890123'
    },
    {
      id: 5,
      firstName: 'Sarah',
      lastName: 'Muthoni',
      employeeNo: 'TCH005',
      email: 'sarah.muthoni@zawadijrn.ac.ke',
      phone: '+254714567890',
      gender: 'Female',
      dateOfBirth: '1986-09-25',
      nationalId: '29345678',
      tscNumber: 'TSC/678901',
      dateOfJoining: '2017-08-15',
      status: 'Active',
      role: 'Deputy Head Teacher',
      subject: 'Social Studies',
      classes: ['Grade 6B'],
      qualifications: 'M.Ed (Administration)',
      experience: '14 years',
      avatar: '👩‍🏫',
      address: 'Nairobi, Lavington',
      emergencyContact: '+254766789012',
      emergencyContactName: 'Daniel Muthoni',
      bankName: 'Stanbic Bank',
      accountNumber: '5678901234'
    },
    {
      id: 6,
      firstName: 'Michael',
      lastName: 'Otieno',
      employeeNo: 'TCH006',
      email: 'michael.otieno@zawadijrn.ac.ke',
      phone: '+254715678901',
      gender: 'Male',
      dateOfBirth: '1984-12-05',
      nationalId: '27456789',
      tscNumber: 'TSC/789012',
      dateOfJoining: '2015-03-01',
      status: 'On Leave',
      role: 'Class Teacher',
      subject: 'Physical Education',
      classes: ['All Grades'],
      qualifications: 'B.Ed (PE)',
      experience: '16 years',
      avatar: '👨‍🏫',
      address: 'Nairobi, South B',
      emergencyContact: '+254777890123',
      emergencyContactName: 'Jane Otieno',
      bankName: 'DTB Bank',
      accountNumber: '6789012345'
    }
  ]);

  // Attendance data
  const [attendanceRecords, setAttendanceRecords] = useState([
    {
      id: 1,
      date: '2026-01-15',
      learnerId: 1,
      status: 'Present',
      markedBy: 'Grace Wanjiru',
      markedAt: '08:30 AM'
    },
    {
      id: 2,
      date: '2026-01-15',
      learnerId: 2,
      status: 'Present',
      markedBy: 'Grace Wanjiru',
      markedAt: '08:30 AM'
    },
    {
      id: 3,
      date: '2026-01-15',
      learnerId: 3,
      status: 'Absent',
      markedBy: 'Grace Wanjiru',
      markedAt: '08:30 AM',
      reason: 'Sick'
    },
    {
      id: 4,
      date: '2026-01-14',
      learnerId: 1,
      status: 'Present',
      markedBy: 'Grace Wanjiru',
      markedAt: '08:25 AM'
    },
    {
      id: 5,
      date: '2026-01-14',
      learnerId: 2,
      status: 'Late',
      markedBy: 'Grace Wanjiru',
      markedAt: '09:15 AM'
    },
    {
      id: 6,
      date: '2026-01-14',
      learnerId: 3,
      status: 'Present',
      markedBy: 'Grace Wanjiru',
      markedAt: '08:25 AM'
    }
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('Grade 3');
  const [selectedStream, setSelectedStream] = useState('A');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');

  // Formative Assessment state
  const [formativeGrade, setFormativeGrade] = useState('Grade 3');
  const [formativeStream, setFormativeStream] = useState('A');
  const [formativeLearningArea, setFormativeLearningArea] = useState('Mathematics Activities');
  const [formativeAssessmentType, setFormativeAssessmentType] = useState('Classwork');
  const [formativeDate, setFormativeDate] = useState(new Date().toISOString().split('T')[0]);
  const [formativeStrand, setFormativeStrand] = useState('');
  const [formativeSubStrand, setFormativeSubStrand] = useState('');
  const [formativeLearningOutcome, setFormativeLearningOutcome] = useState('');
  const [formativeIndicator, setFormativeIndicator] = useState(''); // NEW: Specific indicator
  const [formativeAssessmentMethod, setFormativeAssessmentMethod] = useState('Observation'); // NEW
  const [formativeTotalMarks, setFormativeTotalMarks] = useState(10);
  const [formativeMarks, setFormativeMarks] = useState([]);

  // Formative Report state
  const [reportLearnerId, setReportLearnerId] = useState('');
  const [reportTerm, setReportTerm] = useState('Term 1');
  const [reportLearningArea, setReportLearningArea] = useState('all');
  const [selectedLearnerForReport, setSelectedLearnerForReport] = useState(null);

  // Summative Test Creation state
  const [showTestModal, setShowTestModal] = useState(false);
  const [testFormData, setTestFormData] = useState({
    name: '',
    grade: 'Grade 3',
    learningArea: 'Mathematics Activities',
    term: 'Term 1',
    year: '2026',
    testType: 'End of Term', // NEW: Tuner-Up, Mid-term, End of Term
    date: '',
    duration: 90,
    totalMarks: 100,
    passMarks: 50,
    performanceScale: 'CBC Standard 5-Level', // NEW: Can be custom
    sections: [
      { name: 'Section A', marks: 40, description: 'Multiple Choice' },
      { name: 'Section B', marks: 30, description: 'Short Answer' },
      { name: 'Section C', marks: 30, description: 'Long Answer' }
    ],
    status: 'Draft'
  });

  // Summative Assessment (Marking) state
  const [selectedTestForMarking, setSelectedTestForMarking] = useState(null);
  const [markingData, setMarkingData] = useState([]);

  // Communications data
  const [notices, setNotices] = useState([
    {
      id: 1,
      title: 'Term 1 Examination Schedule',
      content: 'The end of term examinations will commence on January 25th, 2026. Please ensure all learners are well prepared.',
      author: 'Sarah Muthoni',
      authorRole: 'Deputy Head Teacher',
      date: '2026-01-10',
      category: 'Academic',
      priority: 'High',
      recipients: 'All Parents & Teachers',
      status: 'Published',
      views: 156
    },
    {
      id: 2,
      title: 'Sports Day Announcement',
      content: 'Our annual sports day will be held on February 15th, 2026 at the school grounds. All parents are invited to attend.',
      author: 'Michael Otieno',
      authorRole: 'PE Teacher',
      date: '2026-01-12',
      category: 'Events',
      priority: 'Medium',
      recipients: 'All Parents',
      status: 'Published',
      views: 89
    },
    {
      id: 3,
      title: 'School Fees Reminder',
      content: 'This is a reminder that Term 1 fees are due by January 20th, 2026. Please contact the accounts office for any queries.',
      author: 'Administration',
      authorRole: 'Accounts Department',
      date: '2026-01-08',
      category: 'Finance',
      priority: 'High',
      recipients: 'All Parents',
      status: 'Published',
      views: 203
    },
    {
      id: 4,
      title: 'Parent-Teacher Meeting',
      content: 'A parent-teacher meeting is scheduled for January 30th, 2026 at 2:00 PM. Attendance is mandatory.',
      author: 'Grace Wanjiru',
      authorRole: 'Class Teacher',
      date: '2026-01-14',
      category: 'Meetings',
      priority: 'High',
      recipients: 'Grade 3 Parents',
      status: 'Draft',
      views: 0
    }
  ]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      subject: 'Learner Progress Discussion',
      sender: 'Hassan Mohamed',
      senderRole: 'Parent',
      recipient: 'Grace Wanjiru',
      recipientRole: 'Teacher',
      message: 'Hello Teacher Grace, I would like to discuss Amina\'s progress in Mathematics. When would be a good time?',
      date: '2026-01-15',
      time: '10:30 AM',
      status: 'Unread',
      priority: 'Normal',
      hasAttachment: false
    },
    {
      id: 2,
      subject: 'Absence Notification',
      sender: 'Samuel Kipchoge',
      senderRole: 'Parent',
      recipient: 'Grace Wanjiru',
      recipientRole: 'Teacher',
      message: 'Dear Teacher, Jamal will be absent tomorrow due to a medical appointment. Please excuse his absence.',
      date: '2026-01-14',
      time: '08:15 PM',
      status: 'Read',
      priority: 'Normal',
      hasAttachment: true,
      attachmentName: 'medical_note.pdf'
    },
    {
      id: 3,
      subject: 'Homework Clarification',
      sender: 'John Mwangi',
      senderRole: 'Parent',
      recipient: 'Grace Wanjiru',
      recipientRole: 'Teacher',
      message: 'Good evening, could you please clarify the Science homework for this week? Zara is a bit confused.',
      date: '2026-01-13',
      time: '06:45 PM',
      status: 'Read',
      priority: 'Normal',
      hasAttachment: false
    }
  ]);

  const [channels, setChannels] = useState([
    {
      id: 1,
      name: 'Grade 3A Parents',
      description: 'Communication channel for Grade 3A parents and teachers',
      type: 'Class',
      members: 25,
      admin: 'Grace Wanjiru',
      lastMessage: 'Homework for tomorrow: Math worksheet pages 12-15',
      lastMessageTime: '2 hours ago',
      unreadCount: 3,
      active: true
    },
    {
      id: 2,
      name: 'Teachers Group',
      description: 'Internal communication for all teaching staff',
      type: 'Staff',
      members: 12,
      admin: 'Sarah Muthoni',
      lastMessage: 'Meeting rescheduled to 3 PM today',
      lastMessageTime: '30 minutes ago',
      unreadCount: 1,
      active: true
    },
    {
      id: 3,
      name: 'Sports Committee',
      description: 'Planning and coordination for school sports events',
      type: 'Committee',
      members: 8,
      admin: 'Michael Otieno',
      lastMessage: 'Sports day venue confirmed',
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      active: true
    },
    {
      id: 4,
      name: 'All Parents',
      description: 'General announcements to all parents',
      type: 'General',
      members: 150,
      admin: 'Administration',
      lastMessage: 'School fees payment deadline reminder',
      lastMessageTime: '3 days ago',
      unreadCount: 0,
      active: true
    }
  ]);

  // Grades/Learning Areas data - EXPANDED to match actual system
  const [grades, setGrades] = useState([
    // EARLY YEARS
    { id: 1, name: 'Crèche', code: 'CRE', learningArea: 'Early Years', ageRange: '0-2 years', capacity: 15, active: true, curriculum: 'Play-based', subjects: [], streams: ['A'] },
    { id: 2, name: 'Reception', code: 'REC', learningArea: 'Early Years', ageRange: '2-3 years', capacity: 20, active: true, curriculum: 'Play-based', subjects: [], streams: ['A'] },
    { id: 3, name: 'Transition', code: 'TRA', learningArea: 'Early Years', ageRange: '3-4 years', capacity: 25, active: true, curriculum: 'Play-based', subjects: [], streams: ['A', 'B'] },
    { id: 4, name: 'Playgroup', code: 'PLG', learningArea: 'Early Years', ageRange: '4-5 years', capacity: 25, active: true, curriculum: 'Play-based', subjects: [], streams: ['A', 'B'] },
    { id: 5, name: 'Pre-Primary 1', code: 'PP1', learningArea: 'Early Years', ageRange: '5-6 years', capacity: 30, active: true, curriculum: 'CBC', subjects: ['Literacy', 'Numeracy', 'Environmental', 'Creative Arts'], streams: ['A', 'B'] },
    { id: 6, name: 'Pre-Primary 2', code: 'PP2', learningArea: 'Early Years', ageRange: '6-7 years', capacity: 30, active: true, curriculum: 'CBC', subjects: ['Literacy', 'Numeracy', 'Environmental', 'Creative Arts'], streams: ['A', 'B'] },
    
    // LOWER PRIMARY
    { id: 7, name: 'Grade 1', code: 'G1', learningArea: 'Lower Primary', ageRange: '6-7 years', capacity: 35, active: true, curriculum: 'CBC', subjects: ['English', 'Kiswahili', 'Mathematics', 'Environmental', 'Religious Education', 'Creative Arts', 'Physical Education'], streams: ['A', 'B', 'C'] },
    { id: 8, name: 'Grade 2', code: 'G2', learningArea: 'Lower Primary', ageRange: '7-8 years', capacity: 35, active: true, curriculum: 'CBC', subjects: ['English', 'Kiswahili', 'Mathematics', 'Environmental', 'Religious Education', 'Creative Arts', 'Physical Education'], streams: ['A', 'B', 'C'] },
    { id: 9, name: 'Grade 3', code: 'G3', learningArea: 'Lower Primary', ageRange: '8-9 years', capacity: 40, active: true, curriculum: 'CBC', subjects: ['English', 'Kiswahili', 'Mathematics', 'Environmental', 'Religious Education', 'Creative Arts', 'Physical Education'], streams: ['A', 'B', 'C'] },
    
    // UPPER PRIMARY
    { id: 10, name: 'Grade 4', code: 'G4', learningArea: 'Upper Primary', ageRange: '9-10 years', capacity: 40, active: true, curriculum: 'CBC', subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Creative Arts', 'Physical Education'], streams: ['A', 'B', 'C'] },
    { id: 11, name: 'Grade 5', code: 'G5', learningArea: 'Upper Primary', ageRange: '10-11 years', capacity: 40, active: true, curriculum: 'CBC', subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Creative Arts', 'Physical Education'], streams: ['A', 'B', 'C'] },
    { id: 12, name: 'Grade 6', code: 'G6', learningArea: 'Upper Primary', ageRange: '11-12 years', capacity: 40, active: true, curriculum: 'CBC', subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Creative Arts', 'Physical Education'], streams: ['A', 'B', 'C'] },
    
    // JUNIOR SCHOOL
    { id: 13, name: 'Grade 7', code: 'G7', learningArea: 'Junior School', ageRange: '12-13 years', capacity: 45, active: true, curriculum: 'CBC/IGCSE', subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Life Skills'], streams: ['A', 'B'] },
    { id: 14, name: 'Grade 8', code: 'G8', learningArea: 'Junior School', ageRange: '13-14 years', capacity: 45, active: true, curriculum: 'CBC/IGCSE', subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Life Skills'], streams: ['A', 'B'] },
    { id: 15, name: 'Grade 9', code: 'G9', learningArea: 'Junior School', ageRange: '14-15 years', capacity: 45, active: true, curriculum: 'CBC/IGCSE', subjects: ['English', 'Kiswahili', 'Mathematics', 'Science', 'Social Studies', 'Religious Education', 'Life Skills'], streams: ['A'] },
    
    // SENIOR SCHOOL
    { id: 16, name: 'Grade 10', code: 'G10', learningArea: 'Senior School', ageRange: '15-16 years', capacity: 40, active: true, curriculum: 'IGCSE', subjects: ['English', 'Mathematics', 'Sciences', 'Humanities', 'Languages'], streams: ['A'] },
    { id: 17, name: 'Grade 11', code: 'G11', learningArea: 'Senior School', ageRange: '16-17 years', capacity: 40, active: true, curriculum: 'IGCSE', subjects: ['English', 'Mathematics', 'Sciences', 'Humanities', 'Languages'], streams: ['A'] },
    { id: 18, name: 'Grade 12', code: 'G12', learningArea: 'Senior School', ageRange: '17-18 years', capacity: 40, active: true, curriculum: 'IGCSE', subjects: ['English', 'Mathematics', 'Sciences', 'Humanities', 'Languages'], streams: ['A'] }
  ]);

  // School settings data
  const [schoolSettings, setSchoolSettings] = useState({
    name: 'Zawadi JRN Academy',
    motto: 'Excellence Through Learning',
    email: 'info@zawadijrn.ac.ke',
    phone: '+254 700 123 456',
    address: 'Westlands, Nairobi',
    website: 'www.zawadijrn.ac.ke',
    established: '2015',
    registrationNo: 'SCH/NBI/2015/001',
    currency: 'KES',
    academicYear: '2026',
    currentTerm: 'Term 1',
    termStartDate: '2026-01-06',
    termEndDate: '2026-04-04'
  });

  // System users and roles data
  const [systemUsers, setSystemUsers] = useState([
    { id: 1, name: 'Admin User', email: 'admin@zawadijrn.ac.ke', role: 'Administrator', status: 'Active', lastLogin: '2026-01-15 09:00 AM' },
    { id: 2, name: 'Grace Wanjiru', email: 'grace.wanjiru@zawadijrn.ac.ke', role: 'Teacher', status: 'Active', lastLogin: '2026-01-15 08:30 AM' },
    { id: 3, name: 'David Omondi', email: 'david.omondi@zawadijrn.ac.ke', role: 'Teacher', status: 'Active', lastLogin: '2026-01-14 04:20 PM' }
  ]);

  const [roles, setRoles] = useState([
    { id: 1, name: 'Administrator', users: 1, permissions: ['All Access'] },
    { id: 2, name: 'Teacher', users: 6, permissions: ['View Learners', 'Mark Attendance', 'Enter Grades'] },
    { id: 3, name: 'Parent', users: 150, permissions: ['View Child Info', 'View Reports'] }
  ]);

  // ========== ASSESSMENT MODULE DATA ==========
  
  // Learning Areas with full CBC structure
  const [learningAreas] = useState([
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
            { name: 'Whole Numbers', outcomes: ['Count numbers up to 1000', 'Read and write numbers in words', 'Compare and order numbers'] },
            { name: 'Fractions', outcomes: ['Identify fractions', 'Compare simple fractions', 'Add simple fractions'] }
          ]
        },
        {
          id: 2,
          name: 'Measurement',
          subStrands: [
            { name: 'Length', outcomes: ['Measure using standard units', 'Estimate lengths', 'Compare measurements'] },
            { name: 'Time', outcomes: ['Tell time to the hour', 'Tell time to half hour', 'Read calendars'] }
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
            { name: 'Oral Communication', outcomes: ['Listen and respond', 'Express ideas clearly', 'Participate in discussions'] }
          ]
        },
        {
          id: 2,
          name: 'Reading',
          subStrands: [
            { name: 'Reading Skills', outcomes: ['Read simple texts', 'Identify main ideas', 'Answer comprehension questions'] }
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
            { name: 'Kusoma kwa Ufahamu', outcomes: ['Soma kwa uelewa', 'Eleza mawazo', 'Jibu maswali'] }
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
            { name: 'Plants and Animals', outcomes: ['Identify living things', 'Classify plants', 'Observe animal behavior'] }
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
            { name: 'Creation Stories', outcomes: ['Retell creation story', 'Appreciate Gods creation', 'Care for environment'] }
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
            { name: 'Drawing and Painting', outcomes: ['Draw simple objects', 'Use colors creatively', 'Express ideas through art'] }
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
            { name: 'Basic Movements', outcomes: ['Run effectively', 'Jump with coordination', 'Throw accurately'] }
          ]
        }
      ]
    }
  ]);

  // Assessment Types
  const assessmentTypes = [
    { value: 'Classwork', label: 'Classwork', icon: '📝' },
    { value: 'Homework', label: 'Homework', icon: '📚' },
    { value: 'Quiz', label: 'Quiz', icon: '❓' },
    { value: 'Project', label: 'Project', icon: '📊' },
    { value: 'Oral Assessment', label: 'Oral Assessment', icon: '🗣️' },
    { value: 'Practical Work', label: 'Practical Work', icon: '🔬' },
    { value: 'Group Work', label: 'Group Work', icon: '👥' },
    { value: 'Presentation', label: 'Presentation', icon: '🎤' }
  ];

  // CBC Performance Level Scale (Rubric)
  const [performanceScale] = useState([
    {
      level: 'EE',
      name: 'Exceeding Expectations',
      scoreRange: { min: 90, max: 100 },
      color: '#22c55e',
      bgColor: '#dcfce7',
      description: 'Consistently demonstrates mastery beyond grade level',
      indicators: [
        'Solves problems independently with advanced strategies',
        'Makes connections across different strands',
        'Explains reasoning clearly and accurately',
        'Applies concepts to new situations',
        'Shows creativity and critical thinking'
      ]
    },
    {
      level: 'ME',
      name: 'Meeting Expectations',
      scoreRange: { min: 75, max: 89 },
      color: '#3b82f6',
      bgColor: '#dbeafe',
      description: 'Demonstrates grade-level competencies with minimal support',
      indicators: [
        'Understands key concepts',
        'Applies learned skills correctly',
        'Works with some independence',
        'Shows consistent performance',
        'Completes tasks as expected'
      ]
    },
    {
      level: 'AE',
      name: 'Approaching Expectations',
      scoreRange: { min: 50, max: 74 },
      color: '#eab308',
      bgColor: '#fef9c3',
      description: 'Developing competencies, needs support',
      indicators: [
        'Grasps basic concepts with help',
        'Requires scaffolding for tasks',
        'Shows inconsistent performance',
        'Needs more practice',
        'Benefits from additional support'
      ]
    },
    {
      level: 'BE',
      name: 'Below Expectations',
      scoreRange: { min: 25, max: 49 },
      color: '#f97316',
      bgColor: '#ffedd5',
      description: 'Struggles with competencies, requires intervention',
      indicators: [
        'Difficulty understanding concepts',
        'Requires significant support',
        'Shows limited progress',
        'Needs intensive intervention',
        'Struggles with basic tasks'
      ]
    },
    {
      level: 'NY',
      name: 'Not Yet',
      scoreRange: { min: 0, max: 24 },
      color: '#ef4444',
      bgColor: '#fee2e2',
      description: 'Has not demonstrated understanding',
      indicators: [
        'Unable to complete tasks',
        'Lacks foundational knowledge',
        'Requires urgent intervention',
        'Needs alternative approaches',
        'Significant learning gaps'
      ]
    }
  ]);

  // Formative Assessments (Continuous Assessment)
  const [formativeAssessments, setFormativeAssessments] = useState([
    {
      id: 1,
      type: 'Classwork',
      grade: 'Grade 3',
      stream: 'A',
      learningArea: 'Mathematics Activities',
      strand: 'Numbers',
      subStrand: 'Whole Numbers',
      learningOutcome: 'Count numbers up to 1000',
      date: '2026-01-15',
      term: 'Term 1',
      academicYear: '2026',
      totalMarks: 10,
      marks: [
        { learnerId: 1, admNo: 'ADM001', name: 'Amina Hassan', score: 9, rubric: 'EE', remarks: 'Excellent understanding' },
        { learnerId: 2, admNo: 'ADM002', name: 'Jamal Kipchoge', score: 8, rubric: 'ME', remarks: 'Good work' },
        { learnerId: 3, admNo: 'ADM003', name: 'Zara Mwangi', score: 7, rubric: 'ME', remarks: 'Well done' }
      ],
      teacherId: 2,
      teacherName: 'Grace Wanjiru',
      enteredAt: '2026-01-15 10:30 AM'
    },
    {
      id: 2,
      type: 'Homework',
      grade: 'Grade 3',
      stream: 'A',
      learningArea: 'English Activities',
      strand: 'Reading',
      subStrand: 'Reading Skills',
      learningOutcome: 'Read simple texts',
      date: '2026-01-14',
      term: 'Term 1',
      academicYear: '2026',
      totalMarks: 10,
      marks: [
        { learnerId: 1, admNo: 'ADM001', name: 'Amina Hassan', score: 8, rubric: 'ME', remarks: 'Good reading' },
        { learnerId: 2, admNo: 'ADM002', name: 'Jamal Kipchoge', score: 9, rubric: 'EE', remarks: 'Excellent fluency' },
        { learnerId: 3, admNo: 'ADM003', name: 'Zara Mwangi', score: 8, rubric: 'ME', remarks: 'Well read' }
      ],
      teacherId: 2,
      teacherName: 'Grace Wanjiru',
      enteredAt: '2026-01-14 03:45 PM'
    }
  ]);

  // Summative Tests (End-of-Term Exams)
  const [summativeTests, setSummativeTests] = useState([
    {
      id: 1,
      name: 'Term 1 Mathematics Exam',
      grade: 'Grade 3',
      learningArea: 'Mathematics Activities',
      term: 'Term 1',
      year: '2026',
      date: '2026-03-28',
      duration: 90,
      totalMarks: 100,
      passMarks: 50,
      sections: [
        { name: 'Section A', marks: 40, description: 'Multiple Choice' },
        { name: 'Section B', marks: 30, description: 'Short Answer' },
        { name: 'Section C', marks: 30, description: 'Problem Solving' }
      ],
      examPaperUrl: null,
      markingSchemeUrl: null,
      status: 'Published',
      createdBy: 'Grace Wanjiru',
      createdAt: '2026-01-10'
    },
    {
      id: 2,
      name: 'Term 1 English Exam',
      grade: 'Grade 3',
      learningArea: 'English Activities',
      term: 'Term 1',
      year: '2026',
      date: '2026-03-29',
      duration: 90,
      totalMarks: 100,
      passMarks: 50,
      sections: [
        { name: 'Section A', marks: 30, description: 'Listening and Speaking' },
        { name: 'Section B', marks: 40, description: 'Reading Comprehension' },
        { name: 'Section C', marks: 30, description: 'Writing' }
      ],
      examPaperUrl: null,
      markingSchemeUrl: null,
      status: 'Published',
      createdBy: 'Grace Wanjiru',
      createdAt: '2026-01-10'
    },
    {
      id: 3,
      name: 'Term 1 Kiswahili Exam',
      grade: 'Grade 3',
      learningArea: 'Kiswahili Activities',
      term: 'Term 1',
      year: '2026',
      date: '2026-03-30',
      duration: 90,
      totalMarks: 100,
      passMarks: 50,
      sections: [
        { name: 'Sehemu A', marks: 50, description: 'Kusoma' },
        { name: 'Sehemu B', marks: 50, description: 'Kuandika' }
      ],
      examPaperUrl: null,
      markingSchemeUrl: null,
      status: 'Draft',
      createdBy: 'James Kimani',
      createdAt: '2026-01-12'
    }
  ]);

  // Summative Marks (Exam Results)
  const [summativeMarks, setSummativeMarks] = useState([
    {
      testId: 1,
      learnerId: 1,
      admNo: 'ADM001',
      name: 'Amina Hassan',
      sectionA: 35,
      sectionB: 26,
      sectionC: 27,
      totalMarks: 88,
      rubric: 'ME',
      grade: 'B+',
      remarks: 'Good performance',
      status: 'Present',
      markedBy: 'Grace Wanjiru',
      markedAt: '2026-03-29'
    },
    {
      testId: 1,
      learnerId: 2,
      admNo: 'ADM002',
      name: 'Jamal Kipchoge',
      sectionA: 38,
      sectionB: 28,
      sectionC: 29,
      totalMarks: 95,
      rubric: 'EE',
      grade: 'A',
      remarks: 'Excellent work',
      status: 'Present',
      markedBy: 'Grace Wanjiru',
      markedAt: '2026-03-29'
    },
    {
      testId: 1,
      learnerId: 3,
      admNo: 'ADM003',
      name: 'Zara Mwangi',
      sectionA: 32,
      sectionB: 24,
      sectionC: 25,
      totalMarks: 81,
      rubric: 'ME',
      grade: 'B',
      remarks: 'Well done',
      status: 'Present',
      markedBy: 'Grace Wanjiru',
      markedAt: '2026-03-29'
    }
  ]);

  // Report Cards Data
  const [reportCards, setReportCards] = useState([
    {
      learnerId: 1,
      admNo: 'ADM001',
      term: 'Term 1',
      year: '2026',
      learnerDetails: {
        name: 'Amina Wanjiku Hassan',
        grade: 'Grade 3',
        stream: 'A',
        avatar: '👧'
      },
      academicPerformance: [
        {
          learningArea: 'Mathematics Activities',
          formativeAverage: 85,
          summativeScore: 88,
          finalGrade: 86,
          rubric: 'ME',
          position: 2,
          teacherRemarks: 'Excellent problem-solving skills',
          teacher: 'Grace Wanjiru'
        },
        {
          learningArea: 'English Activities',
          formativeAverage: 80,
          summativeScore: 82,
          finalGrade: 81,
          rubric: 'ME',
          position: 3,
          teacherRemarks: 'Good reading comprehension',
          teacher: 'Grace Wanjiru'
        },
        {
          learningArea: 'Kiswahili Activities',
          formativeAverage: 78,
          summativeScore: 80,
          finalGrade: 79,
          rubric: 'ME',
          position: 4,
          teacherRemarks: 'Ameonyesha maendeleo mazuri',
          teacher: 'James Kimani'
        }
      ],
      overallGrade: 'ME',
      overallAverage: 82,
      position: 3,
      totalLearners: 35,
      classTeacherComment: 'Amina is a bright and hardworking learner who shows great potential. Keep up the excellent work!',
      headTeacherComment: 'Well done. Continue working hard.',
      attendance: {
        daysPresent: 58,
        daysAbsent: 2,
        daysLate: 1,
        totalDays: 60,
        percentage: 97
      },
      coCurricular: [
        { activity: 'Drama Club', performance: 'ME', remarks: 'Active participant' },
        { activity: 'Athletics', performance: 'EE', remarks: 'Excellent sprinter' }
      ],
      valuesAndLifeSkills: {
        respect: 'ME',
        responsibility: 'EE',
        unity: 'ME',
        love: 'ME',
        peace: 'ME',
        patriotism: 'ME',
        integrity: 'ME'
      },
      nextTermDate: '2026-05-05',
      generatedAt: '2026-04-05',
      generatedBy: 'Admin User'
    }
  ]);

  // Toast notification helper
  const showToastMessage = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Helper function to get rubric from score
  const getRubricFromScore = (score) => {
    if (score >= 90) return { level: 'EE', color: '#22c55e' };
    if (score >= 75) return { level: 'ME', color: '#3b82f6' };
    if (score >= 50) return { level: 'AE', color: '#eab308' };
    if (score >= 25) return { level: 'BE', color: '#f97316' };
    return { level: 'NY', color: '#ef4444' };
  };

  // Helper function to calculate weighted grade (60% formative, 40% summative)
  const calculateWeightedGrade = (formative, summative) => {
    return Math.round((formative * 0.6) + (summative * 0.4));
  };

  // Navigation sections with ALL modules
  const navSections = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      items: []
    },
    { 
      id: 'learners', 
      label: 'Learners', 
      icon: Users, 
      items: [
        { id: 'learners-parents', label: 'Parents', path: 'learners-parents' },
        { id: 'learners-list', label: 'Learners', path: 'learners-list' },
        { id: 'learners-promotion', label: 'Promotion', path: 'learners-promotion' },
        { id: 'learners-transfers', label: 'Transfers', path: 'learners-transfers' },
        { id: 'learners-incoming', label: 'Incoming Transfers', path: 'learners-incoming' }
      ]
    },
    { 
      id: 'teachers', 
      label: 'Teachers', 
      icon: GraduationCap, 
      items: [
        { id: 'teachers-list', label: 'Teachers', path: 'teachers-list' }
      ]
    },
    { 
      id: 'attendance', 
      label: 'Attendance', 
      icon: ClipboardList, 
      items: [
        { id: 'attendance-learners', label: 'Learners Attendance', path: 'attendance-learners' },
        { id: 'attendance-report', label: 'Attendance Report', path: 'attendance-report' },
        { id: 'attendance-termly', label: 'Attendance Termly', path: 'attendance-termly' }
      ]
    },
    { 
      id: 'communications', 
      label: 'Communications', 
      icon: Megaphone, 
      items: [
        { id: 'comms-notices', label: 'Notices', path: 'comms-notices' },
        { id: 'comms-inbox', label: 'Inbox', path: 'comms-inbox' },
        { id: 'comms-channels', label: 'Channels', path: 'comms-channels' }
      ]
    },
    { 
      id: 'assessment', 
      label: 'Assessment', 
      icon: BarChart3, 
      items: [
        { id: 'assess-formative', label: 'Formative Assessment', path: 'assess-formative' },
        { id: 'assess-formative-report', label: 'Formative Report', path: 'assess-formative-report' },
        { id: 'assess-summative', label: 'Summative', path: 'assess-summative' },
        { id: 'assess-performance-scale', label: 'Performance Level Scale', path: 'assess-performance-scale' },
        { id: 'assess-summative-tests', label: 'Summative Tests', path: 'assess-summative-tests' },
        { id: 'assess-summative-assessment', label: 'Summative Assessment', path: 'assess-summative-assessment' },
        { id: 'assess-summative-report', label: 'Summative Report', path: 'assess-summative-report' },
        { id: 'assess-termly-report', label: 'Termly Report', path: 'assess-termly-report' }
      ]
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      items: [
        { id: 'settings-school', label: 'School Settings', path: 'settings-school' },
        { id: 'settings-streams', label: 'Streams', path: 'settings-streams' },
        { id: 'settings-timetable', label: 'Timetable Management', path: 'settings-timetable' },
        { id: 'settings-system', label: 'System Settings', path: 'settings-system' },
        { id: 'settings-roles', label: 'Roles', path: 'settings-roles' },
        { id: 'settings-users', label: 'System Users', path: 'settings-users' },
        { id: 'settings-profile', label: 'My Profile', path: 'settings-profile' }
      ]
    }
  ];

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getStatusColor = (status) => ({
    'Active': 'bg-green-100 text-green-800',
    'Deactivated': 'bg-red-100 text-red-800',
    'Exited': 'bg-yellow-100 text-yellow-800',
    'Pending': 'bg-blue-100 text-blue-800',
  }[status] || 'bg-gray-100 text-gray-800');

  // Toast notification helper
  const showToastNotification = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Get page title
  const getPageTitle = () => {
    const pageTitles = {
      'dashboard': 'Dashboard',
      'learners-list': 'All Learners',
      'learners-parents': 'Parents & Guardians',
      'learners-promotion': 'Learner Promotion',
      'learners-transfers': 'Transfer Out',
      'learners-incoming': 'Incoming Transfers',
      'teachers-list': 'Teachers',
      'attendance-learners': 'Mark Attendance',
      'attendance-report': 'Attendance Report',
      'attendance-termly': 'Termly Attendance Summary',
      'comms-notices': 'Notices',
      'comms-inbox': 'Inbox',
      'comms-channels': 'Communication Channels',
      'assess-formative': 'Formative Assessment',
      'assess-formative-report': 'Formative Report',
      'assess-summative': 'Summative',
      'assess-performance-scale': 'Performance Level Scale',
      'assess-summative-tests': 'Summative Tests',
      'assess-summative-assessment': 'Summative Assessment',
      'assess-summative-report': 'Summative Report',
      'assess-termly-report': 'Termly Report',
      'settings-school': 'School Settings',
      'settings-streams': 'Streams',
      'settings-timetable': 'Timetable Management',
      'settings-system': 'System Settings',
      'settings-roles': 'Roles',
      'settings-users': 'System Users',
      'settings-profile': 'My Profile'
    };
    return pageTitles[currentPage] || 'Page';
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    setConfirmAction(() => () => onLogout());
    setShowConfirmDialog(true);
  };

  const filteredLearners = learners.filter(l => {
    const matchesSearch = (l.firstName + ' ' + l.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
                         l.admNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || l.grade === filterGrade;
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <img 
              src={brandingSettings?.logoUrl || '/logo-zawadi.png'} 
              alt="School Logo" 
              className="w-10 h-10 object-contain" 
            />
            {sidebarOpen && (
              <span className="font-bold text-lg">
                {brandingSettings?.schoolName || 'Zawadi JRN'}
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navSections.map((section) => (
            <div key={section.id}>
              {section.items.length > 0 ? (
                <>
                  <button 
                    onClick={() => toggleSection(section.id)} 
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
                      expandedSections[section.id] ? 'bg-blue-700' : 'text-blue-100 hover:bg-blue-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <section.icon size={20} />
                      {sidebarOpen && <span className="text-sm font-semibold">{section.label}</span>}
                    </div>
                    {sidebarOpen && <ChevronDown size={16} className={`transition ${expandedSections[section.id] ? 'rotate-180' : ''}`} />}
                  </button>
                  {expandedSections[section.id] && sidebarOpen && (
                    <div className="ml-4 space-y-1 mt-1">
                      {section.items.map((item) => (
                        <button 
                          key={item.id} 
                          onClick={() => setCurrentPage(item.path)} 
                          className={`w-full text-left px-3 py-2 rounded text-xs transition ${
                            currentPage === item.path ? 'bg-blue-500 text-white font-semibold' : 'text-blue-100 hover:bg-blue-700'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button 
                  onClick={() => setCurrentPage(section.id)} 
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    currentPage === section.id ? 'bg-blue-500' : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  <section.icon size={20} />
                  {sidebarOpen && <span className="text-sm font-semibold">{section.label}</span>}
                </button>
              )}
            </div>
          ))}
        </nav>

        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-4 border-t border-blue-700 hover:bg-blue-700 transition">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text">Zawadi JRN Academy</h1>
            <p className="text-xs text-gray-600">CBC Assessment & Grading System</p>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-gray-300">
              <div className="text-right">
                <p className="text-sm font-semibold">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-600">{user?.role || 'System Admin'}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {(user?.name || 'AU').substring(0, 2).toUpperCase()}
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-auto p-6">
          <h2 className="text-3xl font-bold mb-6">{getPageTitle()}</h2>

          {/* DASHBOARD */}
          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Users size={32} />
                    <span className="text-3xl font-bold">{learners.filter(l => l.status === 'Active').length}</span>
                  </div>
                  <p className="text-blue-100">Active Learners</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <GraduationCap size={32} />
                    <span className="text-3xl font-bold">{teachers.filter(t => t.status === 'Active').length}</span>
                  </div>
                  <p className="text-green-100">Active Teachers</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <BookOpen size={32} />
                    <span className="text-3xl font-bold">12</span>
                  </div>
                  <p className="text-purple-100">Classes</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <BarChart3 size={32} />
                    <span className="text-3xl font-bold">89%</span>
                  </div>
                  <p className="text-orange-100">Avg Attendance</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold mb-4">Welcome to Zawadi JRN Academy</h3>
                <p className="text-gray-600 mb-4">Quick actions and system overview coming soon...</p>
              </div>
            </div>
          )}

          {/* LEARNERS LIST */}
          {currentPage === 'learners-list' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name or admission number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Grades</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus size={20} />
                  Add Learner
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Learner</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admission No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Guardian</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLearners.map((learner) => (
                      <tr key={learner.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{learner.avatar}</span>
                            <div>
                              <p className="font-semibold">{learner.firstName} {learner.lastName}</p>
                              <p className="text-sm text-gray-500">{learner.gender}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{learner.admNo}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{learner.grade} {learner.stream}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold">{learner.guardian1Name}</p>
                          <p className="text-xs text-gray-500">{learner.guardian1Phone}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(learner.status)}`}>
                            {learner.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Details">
                              <Eye size={18} />
                            </button>
                            <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Edit">
                              <Edit size={18} />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PARENTS PAGE */}
          {currentPage === 'learners-parents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search parents by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                  <Plus size={20} />
                  Add Parent
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parents.filter(p => 
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.phone.includes(searchTerm)
                ).map((parent) => (
                  <div key={parent.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {parent.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{parent.name}</h3>
                          <p className="text-xs text-gray-500">{parent.relationship}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={16} className="text-purple-600" />
                        <span className="truncate">{parent.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={16} className="text-purple-600" />
                        <span>{parent.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={16} className="text-purple-600" />
                        <span>{parent.occupation}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={16} className="text-purple-600" />
                        <span className="truncate">{parent.county}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Users size={14} />
                      <span>{parent.learnerIds.length} learner(s)</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm font-medium">
                        View Details
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Edit size={18} />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {parents.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.phone.includes(searchTerm)
              ).length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Parents Found</h3>
                  <p className="text-gray-600">No parents match your search criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* PROMOTION PAGE */}
          {currentPage === 'learners-promotion' && (
            <div className="space-y-6">
              {/* Step 1: Select Source Class */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 text-green-700">Step 1: Select Source Class</h3>
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                    <select
                      value={promotionSourceGrade}
                      onChange={(e) => {
                        setPromotionSourceGrade(e.target.value);
                        setSelectedForPromotion([]);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stream</label>
                    <select
                      value={promotionSourceStream}
                      onChange={(e) => {
                        setPromotionSourceStream(e.target.value);
                        setSelectedForPromotion([]);
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All Streams</option>
                      <option value="A">Stream A</option>
                      <option value="B">Stream B</option>
                      <option value="C">Stream C</option>
                      <option value="D">Stream D</option>
                    </select>
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => {
                        const eligible = learners.filter(l => 
                          l.grade === promotionSourceGrade && 
                          l.status === 'Active' &&
                          (promotionSourceStream === 'all' || l.stream === promotionSourceStream)
                        ).map(l => l.id);
                        setSelectedForPromotion(eligible);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Select All
                    </button>
                    <button
                      onClick={() => setSelectedForPromotion([])}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Select Learners */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 text-green-700">Step 2: Select Learners to Promote</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {learners.filter(l => 
                    l.grade === promotionSourceGrade && 
                    l.status === 'Active' &&
                    (promotionSourceStream === 'all' || l.stream === promotionSourceStream)
                  ).map((learner) => {
                    const nextGrade = learner.grade === 'Grade 6' ? 'Graduated' : `Grade ${parseInt(learner.grade.split(' ')[1]) + 1}`;
                    const isSelected = selectedForPromotion.includes(learner.id);
                    
                    return (
                      <div
                        key={learner.id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedForPromotion(prev => prev.filter(id => id !== learner.id));
                          } else {
                            setSelectedForPromotion(prev => [...prev, learner.id]);
                          }
                        }}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                          isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                          />
                          <span className="text-2xl">{learner.avatar}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{learner.firstName} {learner.lastName}</p>
                            <p className="text-xs text-gray-500">{learner.admNo}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                          <span className="font-semibold">{learner.grade}</span>
                          <ArrowRight size={14} className="text-green-600" />
                          <span className="font-semibold text-green-700">{nextGrade}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {learners.filter(l => 
                  l.grade === promotionSourceGrade && 
                  l.status === 'Active' &&
                  (promotionSourceStream === 'all' || l.stream === promotionSourceStream)
                ).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users size={48} className="mx-auto mb-3 text-gray-400" />
                    <p>No eligible learners found for promotion</p>
                  </div>
                )}
              </div>

              {/* Promote Button */}
              {selectedForPromotion.length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (window.confirm(`Promote ${selectedForPromotion.length} learner(s)?`)) {
                        const updated = learners.map(learner => {
                          if (selectedForPromotion.includes(learner.id)) {
                            const gradeNum = parseInt(learner.grade.split(' ')[1]);
                            if (gradeNum === 6) {
                              // Graduate Grade 6 students
                              setExitedLearners(prev => [...prev, {
                                ...learner,
                                exitDate: new Date().toISOString().split('T')[0],
                                exitReason: 'Graduated',
                                destination: 'Junior Secondary'
                              }]);
                              return { ...learner, status: 'Exited' };
                            } else {
                              return { ...learner, grade: `Grade ${gradeNum + 1}` };
                            }
                          }
                          return learner;
                        });
                        setLearners(updated.filter(l => l.status !== 'Exited'));
                        showToastNotification(`Successfully promoted ${selectedForPromotion.length} learner(s)!`, 'success');
                        setSelectedForPromotion([]);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    <CheckCircle size={20} />
                    Promote Selected ({selectedForPromotion.length})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TRANSFER OUT PAGE */}
          {currentPage === 'learners-transfers' && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-orange-700 mb-2">Transfer Out Learner</h3>
                  <p className="text-gray-600">Process a learner transfer to another institution</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Learner *</label>
                    <select
                      value={transferFormData.learnerId}
                      onChange={(e) => setTransferFormData({ ...transferFormData, learnerId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">-- Select Learner --</option>
                      {learners.filter(l => l.status === 'Active').map(learner => (
                        <option key={learner.id} value={learner.id}>
                          {learner.firstName} {learner.lastName} ({learner.admNo}) - {learner.grade} {learner.stream}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Transfer Date *</label>
                      <input
                        type="date"
                        value={transferFormData.transferDate}
                        onChange={(e) => setTransferFormData({ ...transferFormData, transferDate: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Transfer Certificate Number</label>
                      <input
                        type="text"
                        value={transferFormData.certificateNumber}
                        onChange={(e) => setTransferFormData({ ...transferFormData, certificateNumber: e.target.value })}
                        placeholder="TC-2025-001"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Destination School Name *</label>
                    <input
                      type="text"
                      value={transferFormData.destinationSchool}
                      onChange={(e) => setTransferFormData({ ...transferFormData, destinationSchool: e.target.value })}
                      placeholder="e.g., Nairobi Academy"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Destination Address</label>
                    <textarea
                      value={transferFormData.destinationAddress}
                      onChange={(e) => setTransferFormData({ ...transferFormData, destinationAddress: e.target.value })}
                      placeholder="Enter full address of destination school"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Transfer *</label>
                    <select
                      value={transferFormData.reason}
                      onChange={(e) => setTransferFormData({ ...transferFormData, reason: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      required
                    >
                      <option value="">-- Select Reason --</option>
                      <option value="Parent Job Transfer">Parent Job Transfer</option>
                      <option value="Family Relocation">Family Relocation</option>
                      <option value="Academic Reasons">Academic Reasons</option>
                      <option value="Financial Constraints">Financial Constraints</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="border-t pt-6 flex items-center gap-4">
                    <button
                      onClick={() => {
                        if (!transferFormData.learnerId || !transferFormData.transferDate || 
                            !transferFormData.destinationSchool || !transferFormData.reason) {
                          alert('Please fill all required fields');
                          return;
                        }
                        
                        if (window.confirm('Process this transfer? The learner will be moved to exited learners.')) {
                          const learner = learners.find(l => l.id === parseInt(transferFormData.learnerId));
                          setExitedLearners(prev => [...prev, {
                            ...learner,
                            exitDate: transferFormData.transferDate,
                            exitReason: 'Transferred to Another School',
                            destination: transferFormData.destinationSchool
                          }]);
                          setLearners(prev => prev.filter(l => l.id !== parseInt(transferFormData.learnerId)));
                          showToastNotification('Transfer processed successfully!', 'success');
                          setTransferFormData({
                            learnerId: '',
                            transferDate: '',
                            destinationSchool: '',
                            destinationAddress: '',
                            reason: '',
                            certificateNumber: ''
                          });
                          setTimeout(() => setCurrentPage('learners-list'), 1500);
                        }
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold"
                    >
                      <CheckCircle size={20} />
                      Process Transfer
                    </button>
                    <button
                      onClick={() => {
                        setTransferFormData({
                          learnerId: '',
                          transferDate: '',
                          destinationSchool: '',
                          destinationAddress: '',
                          reason: '',
                          certificateNumber: ''
                        });
                        setCurrentPage('learners-list');
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold ml-auto"
                    >
                      <FileText size={20} />
                      Generate Transfer Documents
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INCOMING TRANSFERS PAGE */}
          {currentPage === 'learners-incoming' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-bold text-blue-700">Pending Transfer Applications</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {incomingTransfers.filter(t => t.status === 'Pending').length} Pending
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incomingTransfers.filter(t => t.status === 'Pending').map((transfer) => (
                  <div key={transfer.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-start gap-3 mb-4">
                      <span className="text-3xl">{transfer.avatar}</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{transfer.firstName} {transfer.lastName}</h4>
                        <p className="text-xs text-gray-500">Temp ID: {transfer.admNo}</p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {transfer.status}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen size={16} className="text-blue-600" />
                        <span className="font-semibold">From:</span>
                        <span className="text-gray-600">{transfer.previousSchool}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap size={16} className="text-blue-600" />
                        <span className="font-semibold">Grade:</span>
                        <span className="text-gray-600">{transfer.grade}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-blue-600" />
                        <span className="font-semibold">Transfer Date:</span>
                        <span className="text-gray-600">{transfer.transferDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User size={16} className="text-blue-600" />
                        <span className="font-semibold">Guardian:</span>
                        <span className="text-gray-600">{transfer.guardian}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} className="text-blue-600" />
                        <span className="text-gray-600">{transfer.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (window.confirm(`Accept and enroll ${transfer.firstName} ${transfer.lastName}?`)) {
                            const newAdmNo = `ADM${String(learners.length + 5).padStart(3, '0')}`;
                            const newLearner = {
                              id: Date.now(),
                              firstName: transfer.firstName,
                              lastName: transfer.lastName,
                              middleName: '',
                              admNo: newAdmNo,
                              grade: transfer.grade,
                              stream: 'A',
                              status: 'Active',
                              phone: transfer.phone,
                              avatar: transfer.avatar,
                              dob: '2015-01-01',
                              gender: 'Male',
                              dateOfAdmission: new Date().toISOString().split('T')[0],
                              previousSchool: transfer.previousSchool,
                              guardian1Name: transfer.guardian,
                              guardian1Phone: transfer.phone,
                              guardian1Email: '',
                              guardian1Relationship: 'Parent',
                              bloodGroup: '',
                              allergies: 'None',
                              medicalConditions: 'None',
                              transport: 'Private',
                              parentIds: []
                            };
                            setLearners(prev => [...prev, newLearner]);
                            setIncomingTransfers(prev => prev.filter(t => t.id !== transfer.id));
                            showToastNotification(`${transfer.firstName} ${transfer.lastName} enrolled successfully! Admission No: ${newAdmNo}`, 'success');
                          }
                        }}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                      >
                        Accept & Enroll
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Reject application from ${transfer.firstName} ${transfer.lastName}?`)) {
                            setIncomingTransfers(prev => prev.filter(t => t.id !== transfer.id));
                            showToastNotification('Application rejected', 'success');
                          }
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {incomingTransfers.filter(t => t.status === 'Pending').length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <Users size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Pending Applications</h3>
                  <p className="text-gray-600">There are no incoming transfer applications at this time.</p>
                </div>
              )}
            </div>
          )}

          {/* TEACHERS LIST PAGE */}
          {currentPage === 'teachers-list' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search by name, employee number, or subject..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <button 
                  onClick={() => {
                    setModalType('teacher');
                    setModalMode('add');
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Plus size={20} />
                  Add Teacher
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Teachers</p>
                      <p className="text-2xl font-bold text-gray-800">{teachers.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <GraduationCap size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-green-600">{teachers.filter(t => t.status === 'Active').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle size={24} className="text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">On Leave</p>
                      <p className="text-2xl font-bold text-orange-600">{teachers.filter(t => t.status === 'On Leave').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Clock size={24} className="text-orange-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Subjects</p>
                      <p className="text-2xl font-bold text-purple-600">{[...new Set(teachers.map(t => t.subject))].length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <BookOpen size={24} className="text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Teachers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.filter(t => {
                  const matchesSearch = 
                    t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.employeeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    t.email.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
                  return matchesSearch && matchesStatus;
                }).map((teacher) => (
                  <div key={teacher.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border border-gray-100">
                    {/* Header with Status */}
                    <div className={`h-2 ${
                      teacher.status === 'Active' ? 'bg-green-500' :
                      teacher.status === 'On Leave' ? 'bg-orange-500' : 'bg-gray-500'
                    }`}></div>
                    
                    <div className="p-6">
                      {/* Teacher Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-5xl">{teacher.avatar}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800">{teacher.firstName} {teacher.lastName}</h3>
                          <p className="text-sm text-gray-500">{teacher.employeeNo}</p>
                          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            teacher.status === 'Active' ? 'bg-green-100 text-green-800' :
                            teacher.status === 'On Leave' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {teacher.status}
                          </span>
                        </div>
                      </div>

                      {/* Role & Subject */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Award size={16} className="text-green-600" />
                          <span className="font-semibold text-gray-700">{teacher.role}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen size={16} className="text-blue-600" />
                          <span className="text-gray-600">{teacher.subject}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Users size={16} className="text-purple-600" />
                          <span className="text-gray-600">{teacher.classes.join(', ')}</span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4 pb-4 border-b">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          <span className="truncate">{teacher.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          <span>{teacher.phone}</span>
                        </div>
                      </div>

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">TSC No</p>
                          <p className="font-semibold text-gray-700">{teacher.tscNumber}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">Experience</p>
                          <p className="font-semibold text-gray-700">{teacher.experience}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">Qualification</p>
                          <p className="font-semibold text-gray-700">{teacher.qualifications}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-2">
                          <p className="text-gray-500">Joined</p>
                          <p className="font-semibold text-gray-700">{new Date(teacher.dateOfJoining).getFullYear()}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm font-medium">
                          View Profile
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition" title="More">
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {teachers.filter(t => {
                const matchesSearch = 
                  t.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  t.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  t.employeeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  t.email.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
                return matchesSearch && matchesStatus;
              }).length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Teachers Found</h3>
                  <p className="text-gray-600">No teachers match your search criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* ATTENDANCE MARKING PAGE */}
          {currentPage === 'attendance-learners' && (
            <div className="space-y-6">
              {/* Date and Class Selection */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 text-blue-700">Mark Daily Attendance</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stream</label>
                    <select
                      value={selectedStream}
                      onChange={(e) => setSelectedStream(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="A">Stream A</option>
                      <option value="B">Stream B</option>
                      <option value="C">Stream C</option>
                      <option value="D">Stream D</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        const classLearners = learners.filter(l => 
                          l.grade === selectedClass && 
                          l.stream === selectedStream && 
                          l.status === 'Active'
                        );
                        const newRecords = classLearners.map(learner => {
                          const existing = attendanceRecords.find(
                            r => r.date === selectedDate && r.learnerId === learner.id
                          );
                          if (existing) return existing;
                          return {
                            id: Date.now() + learner.id,
                            date: selectedDate,
                            learnerId: learner.id,
                            status: 'Present',
                            markedBy: user?.name || 'Admin',
                            markedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                          };
                        });
                        setAttendanceRecords(prev => {
                          const filtered = prev.filter(r => {
                            const isForOtherDate = r.date !== selectedDate;
                            const isForOtherLearner = !classLearners.find(l => l.id === r.learnerId);
                            return isForOtherDate || isForOtherLearner;
                          });
                          return [...filtered, ...newRecords];
                        });
                        showToastNotification(`Initialized attendance for ${selectedClass} ${selectedStream}`, 'success');
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Load Class
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendance Grid */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-800">{selectedClass} {selectedStream} - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Present</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Absent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span>Late</span>
                      </div>
                    </div>
                  </div>
                </div>

                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Learner</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admission No</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Marked At</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {learners.filter(l => 
                      l.grade === selectedClass && 
                      l.stream === selectedStream && 
                      l.status === 'Active'
                    ).map((learner) => {
                      const record = attendanceRecords.find(
                        r => r.date === selectedDate && r.learnerId === learner.id
                      );
                      
                      return (
                        <tr key={learner.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{learner.avatar}</span>
                              <div>
                                <p className="font-semibold">{learner.firstName} {learner.lastName}</p>
                                <p className="text-xs text-gray-500">{learner.gender}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{learner.admNo}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  if (record) {
                                    setAttendanceRecords(prev => prev.map(r => 
                                      r.id === record.id ? { ...r, status: 'Present', markedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) } : r
                                    ));
                                  } else {
                                    setAttendanceRecords(prev => [...prev, {
                                      id: Date.now() + learner.id,
                                      date: selectedDate,
                                      learnerId: learner.id,
                                      status: 'Present',
                                      markedBy: user?.name || 'Admin',
                                      markedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                    }]);
                                  }
                                }}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                                  record?.status === 'Present' 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                                }`}
                              >
                                P
                              </button>
                              <button
                                onClick={() => {
                                  if (record) {
                                    setAttendanceRecords(prev => prev.map(r => 
                                      r.id === record.id ? { ...r, status: 'Absent', markedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) } : r
                                    ));
                                  } else {
                                    setAttendanceRecords(prev => [...prev, {
                                      id: Date.now() + learner.id,
                                      date: selectedDate,
                                      learnerId: learner.id,
                                      status: 'Absent',
                                      markedBy: user?.name || 'Admin',
                                      markedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                    }]);
                                  }
                                }}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                                  record?.status === 'Absent' 
                                    ? 'bg-red-500 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-red-100'
                                }`}
                              >
                                A
                              </button>
                              <button
                                onClick={() => {
                                  if (record) {
                                    setAttendanceRecords(prev => prev.map(r => 
                                      r.id === record.id ? { ...r, status: 'Late', markedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) } : r
                                    ));
                                  } else {
                                    setAttendanceRecords(prev => [...prev, {
                                      id: Date.now() + learner.id,
                                      date: selectedDate,
                                      learnerId: learner.id,
                                      status: 'Late',
                                      markedBy: user?.name || 'Admin',
                                      markedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                    }]);
                                  }
                                }}
                                className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                                  record?.status === 'Late' 
                                    ? 'bg-orange-500 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                                }`}
                              >
                                L
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {record?.markedAt || '-'}
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={record?.reason || ''}
                              onChange={(e) => {
                                if (record) {
                                  setAttendanceRecords(prev => prev.map(r => 
                                    r.id === record.id ? { ...r, reason: e.target.value } : r
                                  ));
                                }
                              }}
                              placeholder="Add remarks..."
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {learners.filter(l => 
                  l.grade === selectedClass && 
                  l.stream === selectedStream && 
                  l.status === 'Active'
                ).length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    <Users size={48} className="mx-auto mb-3 text-gray-400" />
                    <p>No active learners in this class</p>
                  </div>
                )}
              </div>

              {/* Save Button */}
              {learners.filter(l => 
                l.grade === selectedClass && 
                l.stream === selectedStream && 
                l.status === 'Active'
              ).length > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      showToastNotification(`Attendance saved for ${selectedClass} ${selectedStream}`, 'success');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    <Save size={20} />
                    Save Attendance
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ATTENDANCE REPORT PAGE */}
          {currentPage === 'attendance-report' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 text-purple-700">Attendance Report Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                    <select
                      value={filterGrade}
                      onChange={(e) => setFilterGrade(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="all">All Grades</option>
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        showToastNotification('Report filters applied', 'success');
                      }}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
                    >
                      Generate Report
                    </button>
                  </div>
                  <div className="flex items-end">
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2">
                      <FileText size={18} />
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-600">Total Days</h4>
                    <Calendar size={24} className="text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">2</p>
                  <p className="text-xs text-gray-500 mt-1">Attendance marked</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-600">Present</h4>
                    <CheckCircle size={24} className="text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600">{attendanceRecords.filter(r => r.status === 'Present').length}</p>
                  <p className="text-xs text-gray-500 mt-1">Total present records</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-600">Absent</h4>
                    <XCircle size={24} className="text-red-600" />
                  </div>
                  <p className="text-3xl font-bold text-red-600">{attendanceRecords.filter(r => r.status === 'Absent').length}</p>
                  <p className="text-xs text-gray-500 mt-1">Total absent records</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-600">Late</h4>
                    <Clock size={24} className="text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-orange-600">{attendanceRecords.filter(r => r.status === 'Late').length}</p>
                  <p className="text-xs text-gray-500 mt-1">Total late records</p>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h4 className="font-bold text-gray-800">Attendance Records</h4>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Learner</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Class</th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Marked By</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {attendanceRecords.filter(record => {
                      const learner = learners.find(l => l.id === record.learnerId);
                      if (!learner) return false;
                      if (filterGrade !== 'all' && learner.grade !== filterGrade) return false;
                      if (reportStartDate && record.date < reportStartDate) return false;
                      if (reportEndDate && record.date > reportEndDate) return false;
                      return true;
                    }).map((record) => {
                      const learner = learners.find(l => l.id === record.learnerId);
                      if (!learner) return null;
                      
                      return (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{learner.avatar}</span>
                              <span className="font-semibold text-sm">{learner.firstName} {learner.lastName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{learner.grade} {learner.stream}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              record.status === 'Present' ? 'bg-green-100 text-green-800' :
                              record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.markedBy}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{record.markedAt}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {attendanceRecords.filter(record => {
                  const learner = learners.find(l => l.id === record.learnerId);
                  if (!learner) return false;
                  if (filterGrade !== 'all' && learner.grade !== filterGrade) return false;
                  if (reportStartDate && record.date < reportStartDate) return false;
                  if (reportEndDate && record.date > reportEndDate) return false;
                  return true;
                }).length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    <ClipboardList size={48} className="mx-auto mb-3 text-gray-400" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No Records Found</h3>
                    <p>No attendance records match your filters</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ATTENDANCE TERMLY PAGE */}
          {currentPage === 'attendance-termly' && (
            <div className="space-y-6">
              {/* Term Selection */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold mb-4 text-indigo-700">Termly Attendance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Term</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="1">Term 1 - 2026</option>
                      <option value="2">Term 2 - 2025</option>
                      <option value="3">Term 3 - 2025</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="all">All Grades</option>
                      <option value="1">Grade 1</option>
                      <option value="2">Grade 2</option>
                      <option value="3">Grade 3</option>
                      <option value="4">Grade 4</option>
                      <option value="5">Grade 5</option>
                      <option value="6">Grade 6</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold">
                      Generate Summary
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendance Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <h4 className="text-sm font-semibold mb-2 opacity-90">Average Attendance</h4>
                  <p className="text-4xl font-bold mb-2">89%</p>
                  <p className="text-sm opacity-80">Across all classes</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <h4 className="text-sm font-semibold mb-2 opacity-90">Total School Days</h4>
                  <p className="text-4xl font-bold mb-2">45</p>
                  <p className="text-sm opacity-80">This term</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <h4 className="text-sm font-semibold mb-2 opacity-90">Perfect Attendance</h4>
                  <p className="text-4xl font-bold mb-2">12</p>
                  <p className="text-sm opacity-80">Learners with 100%</p>
                </div>
              </div>

              {/* Class-wise Breakdown */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <h4 className="font-bold text-gray-800">Class-wise Attendance Summary</h4>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Learners</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Avg Attendance</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Present Days</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Absent Days</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Late Days</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[{ grade: 'Grade 3', stream: 'A', learners: 3, avg: 92, present: 124, absent: 5, late: 2 },
                      { grade: 'Grade 3', stream: 'B', learners: 1, avg: 100, absent: 0, late: 0, present: 45 }].map((classData, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-gray-800">{classData.grade} {classData.stream}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{classData.learners}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${classData.avg}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-800">{classData.avg}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600 font-semibold">{classData.present}</td>
                        <td className="px-6 py-4 text-sm text-red-600 font-semibold">{classData.absent}</td>
                        <td className="px-6 py-4 text-sm text-orange-600 font-semibold">{classData.late}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Top Performers */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="font-bold text-gray-800 mb-4">Perfect Attendance - This Term</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {learners.filter(l => l.status === 'Active').slice(0, 3).map(learner => (
                    <div key={learner.id} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-3xl">{learner.avatar}</span>
                      <div>
                        <p className="font-semibold text-gray-800">{learner.firstName} {learner.lastName}</p>
                        <p className="text-xs text-gray-500">{learner.grade} {learner.stream}</p>
                        <p className="text-sm text-green-600 font-semibold mt-1">100% Attendance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NOTICES PAGE */}
          {currentPage === 'comms-notices' && (
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search notices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Categories</option>
                    <option value="Academic">Academic</option>
                    <option value="Events">Events</option>
                    <option value="Finance">Finance</option>
                    <option value="Meetings">Meetings</option>
                  </select>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus size={20} />
                  New Notice
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Notices</p>
                      <p className="text-2xl font-bold text-gray-800">{notices.length}</p>
                    </div>
                    <Megaphone size={32} className="text-blue-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Published</p>
                      <p className="text-2xl font-bold text-green-600">{notices.filter(n => n.status === 'Published').length}</p>
                    </div>
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Drafts</p>
                      <p className="text-2xl font-bold text-orange-600">{notices.filter(n => n.status === 'Draft').length}</p>
                    </div>
                    <FileText size={32} className="text-orange-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-purple-600">{notices.reduce((sum, n) => sum + n.views, 0)}</p>
                    </div>
                    <Eye size={32} className="text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Notices List */}
              <div className="space-y-4">
                {notices.filter(n => 
                  n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  n.content.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((notice) => (
                  <div key={notice.id} className={`bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${
                    notice.priority === 'High' ? 'border-red-500' :
                    notice.priority === 'Medium' ? 'border-yellow-500' : 'border-blue-500'
                  }`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{notice.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              notice.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {notice.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              notice.priority === 'High' ? 'bg-red-100 text-red-800' :
                              notice.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {notice.priority} Priority
                            </span>
                          </div>
                          <p className="text-gray-700 mb-4">{notice.content}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <User size={16} />
                              <span>{notice.author} ({notice.authorRole})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>{new Date(notice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users size={16} />
                              <span>{notice.recipients}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Eye size={16} />
                              <span>{notice.views} views</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                            <Edit size={18} />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 size={18} />
                          </button>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                            View Details
                          </button>
                        </div>
                      </div>
                      
                      {notice.status === 'Draft' && (
                        <div className="mt-4 pt-4 border-t">
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium">
                            Publish Notice
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {notices.filter(n => 
                n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.content.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <Megaphone size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Notices Found</h3>
                  <p className="text-gray-600">No notices match your search criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* INBOX PAGE */}
          {currentPage === 'comms-inbox' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-bold">Messages</h3>
                  <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                    {messages.filter(m => m.status === 'Unread').length} Unread
                  </span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus size={20} />
                  Compose Message
                </button>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Messages</p>
                      <p className="text-2xl font-bold text-gray-800">{messages.length}</p>
                    </div>
                    <Mail size={32} className="text-blue-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Unread</p>
                      <p className="text-2xl font-bold text-red-600">{messages.filter(m => m.status === 'Unread').length}</p>
                    </div>
                    <Bell size={32} className="text-red-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">With Attachments</p>
                      <p className="text-2xl font-bold text-green-600">{messages.filter(m => m.hasAttachment).length}</p>
                    </div>
                    <FileText size={32} className="text-green-600" />
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {messages.map((message) => (
                    <div key={message.id} className={`p-6 hover:bg-gray-50 cursor-pointer transition ${
                      message.status === 'Unread' ? 'bg-blue-50' : ''
                    }`}>
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {message.sender.substring(0, 2).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-lg ${
                                  message.status === 'Unread' ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'
                                }`}>
                                  {message.subject}
                                </h4>
                                {message.status === 'Unread' && (
                                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">
                                From: <span className="font-semibold">{message.sender}</span> ({message.senderRole})
                              </p>
                            </div>
                            <div className="text-right text-sm text-gray-500">
                              <p>{new Date(message.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                              <p>{message.time}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3">{message.message}</p>
                          <div className="flex items-center gap-4">
                            {message.hasAttachment && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                                <FileText size={16} />
                                <span>{message.attachmentName}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 ml-auto">
                              <button className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition">
                                Reply
                              </button>
                              <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium transition">
                                Archive
                              </button>
                              <button className="p-1 text-red-600 hover:bg-red-50 rounded transition">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {messages.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <Mail size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Messages</h3>
                  <p className="text-gray-600">Your inbox is empty.</p>
                </div>
              )}
            </div>
          )}

          {/* CHANNELS PAGE */}
          {currentPage === 'comms-channels' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Communication Channels</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus size={20} />
                  Create Channel
                </button>
              </div>

              {/* Channel Type Filters */}
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">All</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Class</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Staff</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">Committee</button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition">General</button>
              </div>

              {/* Channels Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map((channel) => (
                  <div key={channel.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                    <div className={`h-2 ${
                      channel.type === 'Class' ? 'bg-blue-500' :
                      channel.type === 'Staff' ? 'bg-green-500' :
                      channel.type === 'Committee' ? 'bg-purple-500' : 'bg-orange-500'
                    }`}></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-bold text-gray-800">{channel.name}</h4>
                            {channel.unreadCount > 0 && (
                              <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                                {channel.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{channel.description}</p>
                        </div>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            channel.type === 'Class' ? 'bg-blue-100 text-blue-800' :
                            channel.type === 'Staff' ? 'bg-green-100 text-green-800' :
                            channel.type === 'Committee' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {channel.type}
                          </span>
                          <span className="text-gray-500">•</span>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Users size={14} />
                            <span>{channel.members} members</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p className="font-semibold">Admin: {channel.admin}</p>
                        </div>
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs text-gray-500 mb-1">Latest message:</p>
                          <p className="text-sm text-gray-700 font-medium">{channel.lastMessage}</p>
                          <p className="text-xs text-gray-500 mt-1">{channel.lastMessageTime}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                          Open Channel
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                          <Settings size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {channels.length === 0 && (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Channels</h3>
                  <p className="text-gray-600">Create a channel to start communicating.</p>
                </div>
              )}
            </div>
          )}

          {/* LEARNING AREAS / GRADES PAGE */}
          {currentPage === 'settings-streams' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Learning Areas & Grades</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage grade levels, streams, and learning areas</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus size={20} />
                  Add Grade/Level
                </button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Levels</p>
                      <p className="text-2xl font-bold text-gray-800">{grades.length}</p>
                    </div>
                    <BookOpen size={32} className="text-blue-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-green-600">{grades.filter(g => g.active).length}</p>
                    </div>
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Learning Areas</p>
                      <p className="text-2xl font-bold text-purple-600">{[...new Set(grades.map(g => g.learningArea))].length}</p>
                    </div>
                    <Award size={32} className="text-purple-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Capacity</p>
                      <p className="text-2xl font-bold text-orange-600">{grades.reduce((sum, g) => sum + g.capacity, 0)}</p>
                    </div>
                    <Users size={32} className="text-orange-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Streams</p>
                      <p className="text-2xl font-bold text-indigo-600">{grades.reduce((sum, g) => sum + g.streams.length, 0)}</p>
                    </div>
                    <Activity size={32} className="text-indigo-600" />
                  </div>
                </div>
              </div>

              {/* Learning Areas */}
              {['Early Years', 'Lower Primary', 'Upper Primary', 'Junior School', 'Senior School'].map((area) => {
                const areaGrades = grades.filter(g => g.learningArea === area);
                if (areaGrades.length === 0) return null;
                
                return (
                  <div key={area} className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className={`p-4 border-b ${
                      area === 'Early Years' ? 'bg-pink-50 border-pink-200' :
                      area === 'Lower Primary' ? 'bg-blue-50 border-blue-200' :
                      area === 'Upper Primary' ? 'bg-green-50 border-green-200' :
                      area === 'Junior School' ? 'bg-purple-50 border-purple-200' :
                      'bg-orange-50 border-orange-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h4 className={`text-lg font-bold ${
                            area === 'Early Years' ? 'text-pink-800' :
                            area === 'Lower Primary' ? 'text-blue-800' :
                            area === 'Upper Primary' ? 'text-green-800' :
                            area === 'Junior School' ? 'text-purple-800' :
                            'text-orange-800'
                          }`}>{area}</h4>
                          <span className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-700">
                            {areaGrades.length} levels
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-600" />
                            <span className="text-gray-700">Total Capacity: <strong>{areaGrades.reduce((sum, g) => sum + g.capacity, 0)}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade/Level</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Age Range</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Curriculum</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Streams</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Capacity</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subjects</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {areaGrades.map((grade) => (
                            <tr key={grade.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="font-semibold text-gray-800">{grade.name}</div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono font-semibold text-gray-700">
                                  {grade.code}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">{grade.ageRange}</td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                  {grade.curriculum}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-1">
                                  {grade.streams.map((stream, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-semibold">
                                      {stream}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <Users size={14} className="text-gray-500" />
                                  <span className="text-sm font-semibold text-gray-700">{grade.capacity}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <BookOpen size={14} className="text-gray-500" />
                                  <span className="text-sm text-gray-600">{grade.subjects.length || 0}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => {
                                    setGrades(prev => prev.map(g => 
                                      g.id === grade.id ? { ...g, active: !g.active } : g
                                    ));
                                    showToastNotification(
                                      `${grade.name} ${grade.active ? 'deactivated' : 'activated'}`, 
                                      'success'
                                    );
                                  }}
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    grade.active 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  } transition cursor-pointer`}
                                >
                                  {grade.active ? 'Active' : 'Inactive'}
                                </button>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                                    <Edit size={16} />
                                  </button>
                                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="View Details">
                                    <Eye size={16} />
                                  </button>
                                  <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition" title="Settings">
                                    <Settings size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* SCHOOL SETTINGS PAGE */}
          {currentPage === 'settings-school' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-2xl font-bold mb-6">School Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">School Name</label>
                    <input type="text" value={schoolSettings.name} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Motto</label>
                    <input type="text" value={schoolSettings.motto} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" value={schoolSettings.email} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input type="text" value={schoolSettings.phone} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                    <input type="text" value={schoolSettings.website} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Registration No</label>
                    <input type="text" value={schoolSettings.registrationNo} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                    <input type="text" value={schoolSettings.address} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Save size={18} className="inline mr-2" />Save Changes
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-xl font-bold mb-6">Academic Year Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Academic Year</label>
                    <input type="text" value={schoolSettings.academicYear} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Term</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>Term 1</option>
                      <option>Term 2</option>
                      <option>Term 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                    <input type="text" value={schoolSettings.currency} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SYSTEM SETTINGS PAGE */}
          {currentPage === 'settings-system' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-2xl font-bold mb-6">System Configuration</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Send email notifications to users</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">SMS Notifications</h4>
                      <p className="text-sm text-gray-600">Send SMS to parents for important updates</p>
                    </div>
                    <input type="checkbox" className="toggle" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Auto Backup</h4>
                      <p className="text-sm text-gray-600">Automatically backup data daily</p>
                    </div>
                    <input type="checkbox" className="toggle" defaultChecked />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MY PROFILE PAGE */}
          {currentPage === 'settings-profile' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                    {(user?.name || 'AU').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{user?.name || 'Admin User'}</h3>
                    <p className="text-gray-600">{user?.role || 'System Administrator'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input type="text" defaultValue={user?.name || 'Admin User'} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input type="email" defaultValue="admin@zawadijrn.ac.ke" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <input type="text" defaultValue="+254 700 000 000" className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <input type="text" value={user?.role || 'System Administrator'} className="w-full px-4 py-2 border rounded-lg bg-gray-50" disabled />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Save size={18} className="inline mr-2" />Update Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ROLES PAGE */}
          {currentPage === 'settings-roles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">User Roles & Permissions</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus size={20} />Add Role
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {roles.map(role => (
                  <div key={role.id} className="bg-white rounded-xl shadow-md p-6">
                    <h4 className="text-lg font-bold mb-2">{role.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{role.users} users</p>
                    <div className="space-y-2">
                      {role.permissions.map((perm, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle size={16} className="text-green-600" />
                          <span>{perm}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm">Edit</button>
                      <button className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SYSTEM USERS PAGE */}
          {currentPage === 'settings-users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">System Users</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus size={20} />Add User
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {systemUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">{user.role}</span></td>
                        <td className="px-6 py-4"><span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">{user.status}</span></td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.lastLogin}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TIMETABLE PAGE */}
          {currentPage === 'settings-timetable' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">Timetable Management</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus size={20} />Create Timetable
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Grade</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>Grade 1</option>
                      <option>Grade 2</option>
                      <option>Grade 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Stream</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>Stream A</option>
                      <option>Stream B</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Term</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>Term 1 - 2026</option>
                      <option>Term 2 - 2026</option>
                    </select>
                  </div>
                </div>
                <div className="text-center py-12 text-gray-500">
                  <Clock size={48} className="mx-auto mb-3 text-gray-400" />
                  <p className="font-semibold">Timetable Builder</p>
                  <p className="text-sm">Select a grade and stream to create or edit timetable</p>
                </div>
              </div>
            </div>
          )}

          {/* FORMATIVE ASSESSMENT PAGE */}
          {currentPage === 'assessment-formative' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Formative Assessment</h3>
                  <p className="text-gray-600 mt-1">Continuous assessment - Record daily classwork, homework, and activities</p>
                </div>
                <button 
                  onClick={() => {
                    // Reset form
                    setFormativeMarks([]);
                    showToastMessage('Form reset', 'success');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <RefreshCw size={20} />Reset Form
                </button>
              </div>

              {/* Step 1: Assessment Details */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                  Assessment Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Grade *</label>
                    <select 
                      value={formativeGrade}
                      onChange={(e) => {
                        setFormativeGrade(e.target.value);
                        setFormativeMarks([]);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Grade 1</option>
                      <option>Grade 2</option>
                      <option>Grade 3</option>
                      <option>Grade 4</option>
                      <option>Grade 5</option>
                      <option>Grade 6</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stream *</label>
                    <select 
                      value={formativeStream}
                      onChange={(e) => {
                        setFormativeStream(e.target.value);
                        setFormativeMarks([]);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>A</option>
                      <option>B</option>
                      <option>C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Date *</label>
                    <input 
                      type="date"
                      value={formativeDate}
                      onChange={(e) => setFormativeDate(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Type *</label>
                    <select 
                      value={formativeAssessmentType}
                      onChange={(e) => setFormativeAssessmentType(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {assessmentTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Learning Area & Outcome */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                  Learning Area & Outcome
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Area *</label>
                    <select 
                      value={formativeLearningArea}
                      onChange={(e) => {
                        setFormativeLearningArea(e.target.value);
                        setFormativeStrand('');
                        setFormativeSubStrand('');
                        setFormativeLearningOutcome('');
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {learningAreas.map(area => (
                        <option key={area.id} value={area.name}>{area.icon} {area.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks *</label>
                    <input 
                      type="number"
                      value={formativeTotalMarks}
                      onChange={(e) => setFormativeTotalMarks(Number(e.target.value))}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Strand *</label>
                    <select 
                      value={formativeStrand}
                      onChange={(e) => {
                        setFormativeStrand(e.target.value);
                        setFormativeSubStrand('');
                        setFormativeLearningOutcome('');
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Strand</option>
                      {learningAreas.find(a => a.name === formativeLearningArea)?.strands.map(strand => (
                        <option key={strand.id} value={strand.name}>{strand.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sub-Strand *</label>
                    <select 
                      value={formativeSubStrand}
                      onChange={(e) => {
                        setFormativeSubStrand(e.target.value);
                        setFormativeLearningOutcome('');
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!formativeStrand}
                    >
                      <option value="">Select Sub-Strand</option>
                      {learningAreas.find(a => a.name === formativeLearningArea)
                        ?.strands.find(s => s.name === formativeStrand)
                        ?.subStrands.map((subStrand, idx) => (
                          <option key={idx} value={subStrand.name}>{subStrand.name}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Outcome *</label>
                    <select 
                      value={formativeLearningOutcome}
                      onChange={(e) => setFormativeLearningOutcome(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      disabled={!formativeSubStrand}
                    >
                      <option value="">Select Learning Outcome</option>
                      {learningAreas.find(a => a.name === formativeLearningArea)
                        ?.strands.find(s => s.name === formativeStrand)
                        ?.subStrands.find(ss => ss.name === formativeSubStrand)
                        ?.outcomes.map((outcome, idx) => (
                          <option key={idx} value={outcome}>{outcome}</option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Indicator *</label>
                    <input 
                      type="text"
                      value={formativeIndicator}
                      onChange={(e) => setFormativeIndicator(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Specific indicator being assessed (e.g., Can count forward from any number)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Method *</label>
                    <select 
                      value={formativeAssessmentMethod}
                      onChange={(e) => setFormativeAssessmentMethod(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Observation</option>
                      <option>Written Test</option>
                      <option>Oral Questioning</option>
                      <option>Practical Demonstration</option>
                      <option>Portfolio Review</option>
                      <option>Group Discussion</option>
                      <option>Peer Assessment</option>
                      <option>Self Assessment</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Load Learners */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                    Load Learners & Enter Marks
                  </h4>
                  <button 
                    onClick={() => {
                      const classLearners = learners.filter(l => 
                        l.grade === formativeGrade && 
                        l.stream === formativeStream && 
                        l.status === 'Active'
                      );
                      if (classLearners.length === 0) {
                        showToastMessage('No learners found in this class', 'error');
                        return;
                      }
                      if (!formativeLearningArea || !formativeStrand || !formativeSubStrand || !formativeLearningOutcome) {
                        showToastMessage('Please complete all fields in Step 2', 'error');
                        return;
                      }
                      const marks = classLearners.map(l => ({
                        learnerId: l.id,
                        admNo: l.admNo,
                        name: `${l.firstName} ${l.lastName}`,
                        score: '',
                        rubric: '',
                        remarks: ''
                      }));
                      setFormativeMarks(marks);
                      showToastMessage(`Loaded ${marks.length} learners`, 'success');
                    }}
                    disabled={!formativeLearningOutcome}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Users size={20} />Load Class Learners
                  </button>
                </div>

                {formativeMarks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-3 text-gray-400" />
                    <p className="font-semibold">No Learners Loaded</p>
                    <p className="text-sm">Complete the form above and click "Load Class Learners" to begin</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-600">Class: <span className="font-semibold">{formativeGrade} {formativeStream}</span></p>
                        <p className="text-sm text-gray-600">Total Learners: <span className="font-semibold">{formativeMarks.length}</span></p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Marks: <span className="font-semibold">{formativeTotalMarks}</span></p>
                        <p className="text-sm text-gray-600">Marking Mode: <span className="font-semibold">Score → Rubric (Auto)</span></p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Adm No</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Learner Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score (/{formativeTotalMarks})</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rubric</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {formativeMarks.map((mark, index) => {
                            const percentage = mark.score ? Math.round((mark.score / formativeTotalMarks) * 100) : 0;
                            const rubricData = mark.score ? getRubricFromScore(percentage) : null;
                            return (
                              <tr key={mark.learnerId} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-semibold">{mark.admNo}</td>
                                <td className="px-4 py-3 text-sm">{mark.name}</td>
                                <td className="px-4 py-3">
                                  <input 
                                    type="number"
                                    value={mark.score}
                                    onChange={(e) => {
                                      const newMarks = [...formativeMarks];
                                      const score = Number(e.target.value);
                                      if (score > formativeTotalMarks) {
                                        showToastMessage(`Score cannot exceed ${formativeTotalMarks}`, 'error');
                                        return;
                                      }
                                      newMarks[index].score = score;
                                      const pct = Math.round((score / formativeTotalMarks) * 100);
                                      newMarks[index].rubric = getRubricFromScore(pct).level;
                                      setFormativeMarks(newMarks);
                                    }}
                                    min="0"
                                    max={formativeTotalMarks}
                                    className="w-20 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  {rubricData && (
                                    <span 
                                      className="px-3 py-1 rounded-full text-xs font-semibold"
                                      style={{ 
                                        backgroundColor: performanceScale.find(p => p.level === rubricData.level)?.bgColor,
                                        color: rubricData.color 
                                      }}
                                    >
                                      {rubricData.level} ({percentage}%)
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <input 
                                    type="text"
                                    value={mark.remarks}
                                    onChange={(e) => {
                                      const newMarks = [...formativeMarks];
                                      newMarks[index].remarks = e.target.value;
                                      setFormativeMarks(newMarks);
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Optional remarks"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Save Button */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-gray-600">
                        <p>Entered marks for: <span className="font-semibold">{formativeMarks.filter(m => m.score !== '').length} / {formativeMarks.length}</span> learners</p>
                      </div>
                      <button 
                        onClick={() => {
                          const enteredMarks = formativeMarks.filter(m => m.score !== '');
                          if (enteredMarks.length === 0) {
                            showToastMessage('Please enter marks for at least one learner', 'error');
                            return;
                          }
                          
                          const newAssessment = {
                            id: formativeAssessments.length + 1,
                            type: formativeAssessmentType,
                            grade: formativeGrade,
                            stream: formativeStream,
                            learningArea: formativeLearningArea,
                            strand: formativeStrand,
                            subStrand: formativeSubStrand,
                            learningOutcome: formativeLearningOutcome,
                            date: formativeDate,
                            term: schoolSettings.currentTerm,
                            academicYear: schoolSettings.academicYear,
                            totalMarks: formativeTotalMarks,
                            marks: enteredMarks,
                            teacherId: user?.empNo || 'Unknown',
                            teacherName: user?.name || 'Unknown Teacher',
                            enteredAt: new Date().toLocaleString('en-US', { 
                              year: 'numeric', 
                              month: '2-digit', 
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })
                          };
                          
                          setFormativeAssessments([...formativeAssessments, newAssessment]);
                          showToastMessage(`Assessment saved! Marks recorded for ${enteredMarks.length} learners`, 'success');
                          
                          // Reset form
                          setFormativeMarks([]);
                          setFormativeStrand('');
                          setFormativeSubStrand('');
                          setFormativeLearningOutcome('');
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                      >
                        <Save size={20} />Save Assessment
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Assessments */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-bold mb-4">Recent Assessments</h4>
                {formativeAssessments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                    <p className="font-semibold">No assessments recorded yet</p>
                    <p className="text-sm">Your saved assessments will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formativeAssessments.slice(-5).reverse().map(assessment => (
                      <div key={assessment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                {assessment.type}
                              </span>
                              <span className="text-sm font-semibold">{assessment.grade} {assessment.stream}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{assessment.date}</span>
                            </div>
                            <p className="font-semibold text-gray-800">{assessment.learningArea}</p>
                            <p className="text-sm text-gray-600">{assessment.strand} → {assessment.subStrand}</p>
                            <p className="text-sm text-gray-500 italic">"{assessment.learningOutcome}"</p>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <span className="text-gray-600">Learners: <span className="font-semibold">{assessment.marks.length}</span></span>
                              <span className="text-gray-600">Total Marks: <span className="font-semibold">{assessment.totalMarks}</span></span>
                              <span className="text-gray-600">By: <span className="font-semibold">{assessment.teacherName}</span></span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Eye size={16} /></button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FORMATIVE REPORT PAGE */}
          {currentPage === 'assessment-formative-report' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Formative Report</h3>
                  <p className="text-gray-600 mt-1">Track individual learner progress and identify trends</p>
                </div>
              </div>

              {/* Learner Selection Panel */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-bold mb-4">Select Learner & Filters</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Learner *</label>
                    <select 
                      value={reportLearnerId}
                      onChange={(e) => {
                        setReportLearnerId(e.target.value);
                        const learner = learners.find(l => l.id === Number(e.target.value));
                        setSelectedLearnerForReport(learner);
                      }}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a learner...</option>
                      {learners.filter(l => l.status === 'Active').map(learner => (
                        <option key={learner.id} value={learner.id}>
                          {learner.admNo} - {learner.firstName} {learner.lastName} ({learner.grade} {learner.stream})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Term</label>
                    <select 
                      value={reportTerm}
                      onChange={(e) => setReportTerm(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Term 1</option>
                      <option>Term 2</option>
                      <option>Term 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Area</label>
                    <select 
                      value={reportLearningArea}
                      onChange={(e) => setReportLearningArea(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Learning Areas</option>
                      {learningAreas.map(area => (
                        <option key={area.id} value={area.name}>{area.icon} {area.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {!selectedLearnerForReport ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <User size={64} className="mx-auto mb-4 text-gray-400" />
                  <h4 className="text-xl font-bold text-gray-800 mb-2">No Learner Selected</h4>
                  <p className="text-gray-600">Please select a learner to view their progress report</p>
                </div>
              ) : (
                (() => {
                  // Get all assessments for this learner
                  const learnerAssessments = formativeAssessments.filter(assessment => 
                    assessment.marks.some(mark => mark.learnerId === selectedLearnerForReport.id) &&
                    (reportLearningArea === 'all' || assessment.learningArea === reportLearningArea)
                  ).map(assessment => {
                    const learnerMark = assessment.marks.find(mark => mark.learnerId === selectedLearnerForReport.id);
                    return {
                      ...assessment,
                      learnerScore: learnerMark.score,
                      learnerRubric: learnerMark.rubric,
                      learnerRemarks: learnerMark.remarks,
                      percentage: Math.round((learnerMark.score / assessment.totalMarks) * 100)
                    };
                  });

                  // Calculate statistics
                  const totalAssessments = learnerAssessments.length;
                  const averagePercentage = totalAssessments > 0 
                    ? Math.round(learnerAssessments.reduce((sum, a) => sum + a.percentage, 0) / totalAssessments)
                    : 0;
                  const averageRubric = getRubricFromScore(averagePercentage);

                  // Count rubric distribution
                  const rubricCounts = {
                    EE: learnerAssessments.filter(a => a.learnerRubric === 'EE').length,
                    ME: learnerAssessments.filter(a => a.learnerRubric === 'ME').length,
                    AE: learnerAssessments.filter(a => a.learnerRubric === 'AE').length,
                    BE: learnerAssessments.filter(a => a.learnerRubric === 'BE').length,
                    NY: learnerAssessments.filter(a => a.learnerRubric === 'NY').length
                  };

                  // Find strongest and weakest strands
                  const strandPerformance = {};
                  learnerAssessments.forEach(assessment => {
                    if (!strandPerformance[assessment.strand]) {
                      strandPerformance[assessment.strand] = [];
                    }
                    strandPerformance[assessment.strand].push(assessment.percentage);
                  });

                  const strandAverages = Object.entries(strandPerformance).map(([strand, scores]) => ({
                    strand,
                    average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
                    count: scores.length
                  })).sort((a, b) => b.average - a.average);

                  const strongestStrand = strandAverages[0];
                  const weakestStrand = strandAverages[strandAverages.length - 1];

                  // Determine trend (last 3 vs first 3 assessments)
                  let trend = 'Stable';
                  if (learnerAssessments.length >= 6) {
                    const first3Avg = learnerAssessments.slice(0, 3).reduce((sum, a) => sum + a.percentage, 0) / 3;
                    const last3Avg = learnerAssessments.slice(-3).reduce((sum, a) => sum + a.percentage, 0) / 3;
                    if (last3Avg > first3Avg + 5) trend = 'Improving';
                    else if (last3Avg < first3Avg - 5) trend = 'Declining';
                  }

                  return (
                    <>
                      {/* Learner Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-md p-6 text-white">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl">
                            {selectedLearnerForReport.avatar}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold">
                              {selectedLearnerForReport.firstName} {selectedLearnerForReport.middleName} {selectedLearnerForReport.lastName}
                            </h3>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-blue-100">Adm No: {selectedLearnerForReport.admNo}</span>
                              <span className="text-blue-100">•</span>
                              <span className="text-blue-100">{selectedLearnerForReport.grade} {selectedLearnerForReport.stream}</span>
                              <span className="text-blue-100">•</span>
                              <span className="text-blue-100">{reportTerm} 2026</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-xl shadow-md p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm font-semibold">Total Assessments</span>
                            <ClipboardList className="text-blue-600" size={24} />
                          </div>
                          <p className="text-3xl font-bold text-gray-800">{totalAssessments}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {reportLearningArea === 'all' ? 'All subjects' : reportLearningArea}
                          </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm font-semibold">Average Performance</span>
                            <BarChart3 className="text-blue-600" size={24} />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-gray-800">{averagePercentage}%</p>
                            <span 
                              className="px-2 py-1 rounded-full text-xs font-semibold"
                              style={{ 
                                backgroundColor: performanceScale.find(p => p.level === averageRubric.level)?.bgColor,
                                color: averageRubric.color 
                              }}
                            >
                              {averageRubric.level}
                            </span>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm font-semibold">Strongest Strand</span>
                            <Award className="text-green-600" size={24} />
                          </div>
                          <p className="text-lg font-bold text-gray-800">{strongestStrand?.strand || 'N/A'}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {strongestStrand?.average}% avg ({strongestStrand?.count} tests)
                          </p>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm font-semibold">Progress Trend</span>
                            <ArrowRight className={`${
                              trend === 'Improving' ? 'text-green-600' : 
                              trend === 'Declining' ? 'text-red-600' : 'text-gray-600'
                            }`} size={24} />
                          </div>
                          <p className={`text-lg font-bold ${
                            trend === 'Improving' ? 'text-green-600' : 
                            trend === 'Declining' ? 'text-red-600' : 'text-gray-600'
                          }`}>{trend}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {learnerAssessments.length >= 6 ? 'Based on recent tests' : 'Need more data'}
                          </p>
                        </div>
                      </div>

                      {/* Performance Distribution */}
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <h4 className="text-lg font-bold mb-4">Performance Distribution</h4>
                        <div className="grid grid-cols-5 gap-3">
                          {performanceScale.map(scale => (
                            <div 
                              key={scale.level}
                              className="text-center p-4 rounded-lg"
                              style={{ backgroundColor: scale.bgColor }}
                            >
                              <p className="text-2xl font-bold" style={{ color: scale.color }}>
                                {rubricCounts[scale.level]}
                              </p>
                              <p className="text-xs font-semibold mt-1" style={{ color: scale.color }}>
                                {scale.level}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">{scale.name}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strand Performance Breakdown */}
                      {strandAverages.length > 0 && (
                        <div className="bg-white rounded-xl shadow-md p-6">
                          <h4 className="text-lg font-bold mb-4">Performance by Strand</h4>
                          <div className="space-y-3">
                            {strandAverages.map(strand => {
                              const rubric = getRubricFromScore(strand.average);
                              return (
                                <div key={strand.strand} className="flex items-center gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-semibold text-gray-700">{strand.strand}</span>
                                      <span className="text-sm text-gray-600">{strand.average}% ({strand.count} assessments)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                      <div 
                                        className="h-3 rounded-full transition-all"
                                        style={{ 
                                          width: `${strand.average}%`,
                                          backgroundColor: rubric.color
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <span 
                                    className="px-3 py-1 rounded-full text-xs font-semibold min-w-[60px] text-center"
                                    style={{ 
                                      backgroundColor: performanceScale.find(p => p.level === rubric.level)?.bgColor,
                                      color: rubric.color 
                                    }}
                                  >
                                    {rubric.level}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Assessment Timeline */}
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <h4 className="text-lg font-bold mb-4">Assessment Timeline</h4>
                        {learnerAssessments.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <ClipboardList size={48} className="mx-auto mb-3 text-gray-400" />
                            <p className="font-semibold">No assessments found</p>
                            <p className="text-sm">This learner has no recorded assessments for the selected filters</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {learnerAssessments.reverse().map((assessment, index) => (
                              <div key={`${assessment.id}-${index}`} className="border rounded-lg p-4 hover:bg-gray-50">
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center"
                                    style={{ 
                                      backgroundColor: performanceScale.find(p => p.level === assessment.learnerRubric)?.bgColor,
                                      color: getRubricFromScore(assessment.percentage).color
                                    }}
                                  >
                                    <p className="text-2xl font-bold">{assessment.learnerScore}</p>
                                    <p className="text-xs font-semibold">/{assessment.totalMarks}</p>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                                        {assessment.type}
                                      </span>
                                      <span className="text-sm text-gray-500">{assessment.date}</span>
                                      <span 
                                        className="px-2 py-1 rounded-full text-xs font-semibold"
                                        style={{ 
                                          backgroundColor: performanceScale.find(p => p.level === assessment.learnerRubric)?.bgColor,
                                          color: getRubricFromScore(assessment.percentage).color
                                        }}
                                      >
                                        {assessment.learnerRubric} ({assessment.percentage}%)
                                      </span>
                                    </div>
                                    <p className="font-semibold text-gray-800">{assessment.learningArea}</p>
                                    <p className="text-sm text-gray-600">{assessment.strand} → {assessment.subStrand}</p>
                                    <p className="text-sm text-gray-500 italic mt-1">"{assessment.learningOutcome}"</p>
                                    {assessment.learnerRemarks && (
                                      <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                        <p className="text-sm text-gray-700">
                                          <span className="font-semibold">Teacher's remarks:</span> {assessment.learnerRemarks}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recommendations */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-md p-6 border-2 border-purple-200">
                        <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                          <AlertCircle className="text-purple-600" size={24} />
                          Recommendations
                        </h4>
                        <div className="space-y-2">
                          {averagePercentage >= 90 && (
                            <p className="text-sm text-gray-700">✅ <span className="font-semibold">Excellent performance!</span> Consider enrichment activities and leadership opportunities.</p>
                          )}
                          {averagePercentage >= 75 && averagePercentage < 90 && (
                            <p className="text-sm text-gray-700">✅ <span className="font-semibold">Good progress!</span> Encourage continued effort and provide challenging tasks.</p>
                          )}
                          {averagePercentage >= 50 && averagePercentage < 75 && (
                            <p className="text-sm text-gray-700">⚠️ <span className="font-semibold">Needs support.</span> Provide additional practice and one-on-one attention.</p>
                          )}
                          {averagePercentage < 50 && (
                            <p className="text-sm text-gray-700">🔴 <span className="font-semibold">Requires intervention.</span> Immediate remedial support needed. Consider parent conference.</p>
                          )}
                          {weakestStrand && weakestStrand.average < 50 && (
                            <p className="text-sm text-gray-700">📚 Focus on <span className="font-semibold">{weakestStrand.strand}</span> - this strand needs targeted intervention.</p>
                          )}
                          {trend === 'Declining' && (
                            <p className="text-sm text-gray-700">📉 <span className="font-semibold">Declining trend detected.</span> Schedule parent meeting to discuss support strategies.</p>
                          )}
                          {trend === 'Improving' && (
                            <p className="text-sm text-gray-700">📈 <span className="font-semibold">Improving trend!</span> Acknowledge progress and maintain momentum.</p>
                          )}
                        </div>
                      </div>

                      {/* Export Options */}
                      <div className="flex items-center justify-end gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <FileText size={20} />Export PDF
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                          <Mail size={20} />Email to Parent
                        </button>
                      </div>
                    </>
                  );
                })()
              )}
            </div>
          )}

          {/* SUMMATIVE (TEST SETUP) PAGE */}
          {currentPage === 'assessment-summative' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Summative Assessment Setup</h3>
                  <p className="text-gray-600 mt-1">Create and manage end-of-term examinations</p>
                </div>
                <button 
                  onClick={() => {
                    setShowTestModal(true);
                    setTestFormData({
                      name: '',
                      grade: 'Grade 3',
                      learningArea: 'Mathematics Activities',
                      term: 'Term 1',
                      year: '2026',
                      date: '',
                      duration: 90,
                      totalMarks: 100,
                      passMarks: 50,
                      sections: [
                        { name: 'Section A', marks: 40, description: 'Multiple Choice' },
                        { name: 'Section B', marks: 30, description: 'Short Answer' },
                        { name: 'Section C', marks: 30, description: 'Long Answer' }
                      ],
                      status: 'Draft'
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus size={20} />Create New Test
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Total Tests</span>
                    <FileText className="text-blue-600" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{summativeTests.length}</p>
                  <p className="text-xs text-gray-500 mt-1">All exams</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Published</span>
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {summativeTests.filter(t => t.status === 'Published').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Active tests</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Drafts</span>
                    <Edit className="text-orange-600" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {summativeTests.filter(t => t.status === 'Draft').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Pending</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">This Term</span>
                    <Calendar className="text-purple-600" size={24} />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">
                    {summativeTests.filter(t => t.term === schoolSettings.currentTerm).length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{schoolSettings.currentTerm}</p>
                </div>
              </div>

              {/* Tests List */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h4 className="text-lg font-bold">All Summative Tests</h4>
                </div>
                {summativeTests.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                    <p className="font-semibold">No tests created yet</p>
                    <p className="text-sm">Click "Create New Test" to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Test Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Grade</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Learning Area</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Marks</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {summativeTests.map(test => (
                          <tr key={test.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-800">{test.name}</p>
                              <p className="text-xs text-gray-500">{test.term} {test.year}</p>
                            </td>
                            <td className="px-6 py-4 text-sm">{test.grade}</td>
                            <td className="px-6 py-4 text-sm">{test.learningArea}</td>
                            <td className="px-6 py-4 text-sm">{test.date}</td>
                            <td className="px-6 py-4 text-sm">{test.duration} mins</td>
                            <td className="px-6 py-4 text-sm">
                              <span className="font-semibold">{test.totalMarks}</span>
                              <span className="text-gray-500"> (Pass: {test.passMarks})</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                test.status === 'Published' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {test.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setTestFormData({
                                      ...test,
                                      id: test.id
                                    });
                                    setShowTestModal(true);
                                  }}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Edit size={16} />
                                </button>
                                <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                                  <Eye size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    if (window.confirm(`Delete "${test.name}"?`)) {
                                      setSummativeTests(summativeTests.filter(t => t.id !== test.id));
                                      showToastMessage('Test deleted', 'success');
                                    }
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TEST CREATION/EDIT MODAL */}
          {showTestModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold">
                      {testFormData.id ? 'Edit Test' : 'Create New Test'}
                    </h3>
                    <button 
                      onClick={() => setShowTestModal(false)}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
                      Basic Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Test Name *</label>
                        <input 
                          type="text"
                          value={testFormData.name}
                          onChange={(e) => setTestFormData({...testFormData, name: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Term 1 Mathematics Exam"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Grade *</label>
                        <select 
                          value={testFormData.grade}
                          onChange={(e) => setTestFormData({...testFormData, grade: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Grade 1</option>
                          <option>Grade 2</option>
                          <option>Grade 3</option>
                          <option>Grade 4</option>
                          <option>Grade 5</option>
                          <option>Grade 6</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Area *</label>
                        <select 
                          value={testFormData.learningArea}
                          onChange={(e) => setTestFormData({...testFormData, learningArea: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {learningAreas.map(area => (
                            <option key={area.id} value={area.name}>{area.icon} {area.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Term *</label>
                        <select 
                          value={testFormData.term}
                          onChange={(e) => setTestFormData({...testFormData, term: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option>Term 1</option>
                          <option>Term 2</option>
                          <option>Term 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
                        <input 
                          type="text"
                          value={testFormData.year}
                          onChange={(e) => setTestFormData({...testFormData, year: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Test Date *</label>
                        <input 
                          type="date"
                          value={testFormData.date}
                          onChange={(e) => setTestFormData({...testFormData, date: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes) *</label>
                        <input 
                          type="number"
                          value={testFormData.duration}
                          onChange={(e) => setTestFormData({...testFormData, duration: Number(e.target.value)})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="30"
                          max="240"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Marks Configuration */}
                  <div>
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
                      Marks Configuration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks *</label>
                        <input 
                          type="number"
                          value={testFormData.totalMarks}
                          onChange={(e) => setTestFormData({...testFormData, totalMarks: Number(e.target.value)})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="10"
                          max="200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Pass Marks *</label>
                        <input 
                          type="number"
                          value={testFormData.passMarks}
                          onChange={(e) => setTestFormData({...testFormData, passMarks: Number(e.target.value)})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          min="1"
                          max={testFormData.totalMarks}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Exam Sections */}
                  <div>
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
                      Exam Sections
                    </h4>
                    <div className="space-y-3">
                      {testFormData.sections.map((section, index) => {
                        const sectionTotal = testFormData.sections.reduce((sum, s) => sum + s.marks, 0);
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Section Name</label>
                                <input 
                                  type="text"
                                  value={section.name}
                                  onChange={(e) => {
                                    const newSections = [...testFormData.sections];
                                    newSections[index].name = e.target.value;
                                    setTestFormData({...testFormData, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Marks</label>
                                <input 
                                  type="number"
                                  value={section.marks}
                                  onChange={(e) => {
                                    const newSections = [...testFormData.sections];
                                    newSections[index].marks = Number(e.target.value);
                                    setTestFormData({...testFormData, sections: newSections});
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                  min="1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="text"
                                    value={section.description}
                                    onChange={(e) => {
                                      const newSections = [...testFormData.sections];
                                      newSections[index].description = e.target.value;
                                      setTestFormData({...testFormData, sections: newSections});
                                    }}
                                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                  {testFormData.sections.length > 1 && (
                                    <button 
                                      onClick={() => {
                                        const newSections = testFormData.sections.filter((_, i) => i !== index);
                                        setTestFormData({...testFormData, sections: newSections});
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between pt-2">
                        <button 
                          onClick={() => {
                            setTestFormData({
                              ...testFormData,
                              sections: [
                                ...testFormData.sections,
                                { name: `Section ${String.fromCharCode(65 + testFormData.sections.length)}`, marks: 0, description: '' }
                              ]
                            });
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-semibold"
                        >
                          <Plus size={16} />Add Section
                        </button>
                        <div className="text-sm">
                          <span className="text-gray-600">Total Sections: </span>
                          <span className={`font-bold ${
                            testFormData.sections.reduce((sum, s) => sum + s.marks, 0) === testFormData.totalMarks
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {testFormData.sections.reduce((sum, s) => sum + s.marks, 0)}
                          </span>
                          <span className="text-gray-600"> / {testFormData.totalMarks} marks</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">4</div>
                      Publication Status
                    </h4>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio"
                          name="status"
                          value="Draft"
                          checked={testFormData.status === 'Draft'}
                          onChange={(e) => setTestFormData({...testFormData, status: e.target.value})}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-semibold">Draft (Not visible to teachers)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio"
                          name="status"
                          value="Published"
                          checked={testFormData.status === 'Published'}
                          onChange={(e) => setTestFormData({...testFormData, status: e.target.value})}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-semibold">Published (Visible for marking)</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <button 
                      onClick={() => setShowTestModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        if (!testFormData.name || !testFormData.date) {
                          showToastMessage('Please fill in all required fields', 'error');
                          return;
                        }
                        const sectionTotal = testFormData.sections.reduce((sum, s) => sum + s.marks, 0);
                        if (sectionTotal !== testFormData.totalMarks) {
                          showToastMessage(`Section marks (${sectionTotal}) must equal total marks (${testFormData.totalMarks})`, 'error');
                          return;
                        }

                        if (testFormData.id) {
                          // Update existing test
                          setSummativeTests(summativeTests.map(t => 
                            t.id === testFormData.id ? {...testFormData} : t
                          ));
                          showToastMessage('Test updated successfully', 'success');
                        } else {
                          // Create new test
                          const newTest = {
                            ...testFormData,
                            id: summativeTests.length + 1,
                            createdBy: user?.name || 'Admin User',
                            createdAt: new Date().toISOString().split('T')[0]
                          };
                          setSummativeTests([...summativeTests, newTest]);
                          showToastMessage('Test created successfully', 'success');
                        }
                        setShowTestModal(false);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      {testFormData.id ? 'Update Test' : 'Create Test'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PERFORMANCE LEVEL SCALE PAGE */}
          {currentPage === 'assessment-scale' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Performance Level Scale</h3>
                  <p className="text-gray-600 mt-1">CBC 5-Level Rubric System for Assessment</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                  <RefreshCw size={20} />Reset to Defaults
                </button>
              </div>

              {/* Overview Card */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-md p-6 text-white">
                <h4 className="text-xl font-bold mb-3">About CBC Performance Levels</h4>
                <p className="text-purple-100 mb-4">
                  The Competency-Based Curriculum (CBC) uses a 5-level rubric system to assess learner performance. 
                  Each level represents a stage of competency development, from "Not Yet" demonstrating understanding 
                  to "Exceeding Expectations" with mastery beyond grade level.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {performanceScale.map(scale => (
                    <div key={scale.level} className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold">{scale.level}</p>
                      <p className="text-xs mt-1">{scale.scoreRange.min}-{scale.scoreRange.max}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Scale Cards */}
              <div className="space-y-4">
                {performanceScale.map((scale, index) => (
                  <div 
                    key={scale.level}
                    className="bg-white rounded-xl shadow-md overflow-hidden border-l-8"
                    style={{ borderLeftColor: scale.color }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div 
                              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                              style={{ backgroundColor: scale.bgColor, color: scale.color }}
                            >
                              {scale.level}
                            </div>
                            <div>
                              <h4 className="text-2xl font-bold" style={{ color: scale.color }}>
                                {scale.name}
                              </h4>
                              <p className="text-sm text-gray-600 font-semibold">
                                Score Range: {scale.scoreRange.min}% - {scale.scoreRange.max}%
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-4">{scale.description}</p>
                          
                          <div>
                            <p className="text-sm font-bold text-gray-700 mb-2">Performance Indicators:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {scale.indicators.map((indicator, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: scale.color }} />
                                  <span className="text-sm text-gray-600">{indicator}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                          <Edit size={20} />
                        </button>
                      </div>

                      {/* Usage Examples */}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-bold text-gray-700 mb-2">Example Scenarios:</p>
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                          {scale.level === 'EE' && (
                            <>
                              <p className="text-sm text-gray-700">🎯 In Math: Solves problems using multiple strategies and explains why each method works</p>
                              <p className="text-sm text-gray-700">🎯 In Reading: Reads above grade level, analyzes themes, and makes connections to other texts</p>
                            </>
                          )}
                          {scale.level === 'ME' && (
                            <>
                              <p className="text-sm text-gray-700">🎯 In Math: Correctly solves grade-level problems using taught methods</p>
                              <p className="text-sm text-gray-700">🎯 In Reading: Reads grade-level texts fluently and answers comprehension questions</p>
                            </>
                          )}
                          {scale.level === 'AE' && (
                            <>
                              <p className="text-sm text-gray-700">⚠️ In Math: Understands concepts but makes occasional errors; needs guided practice</p>
                              <p className="text-sm text-gray-700">⚠️ In Reading: Reads with some hesitation; needs support with comprehension</p>
                            </>
                          )}
                          {scale.level === 'BE' && (
                            <>
                              <p className="text-sm text-gray-700">🚨 In Math: Struggles with basic concepts; requires significant teacher support</p>
                              <p className="text-sm text-gray-700">🚨 In Reading: Difficulty decoding words; needs intensive intervention</p>
                            </>
                          )}
                          {scale.level === 'NY' && (
                            <>
                              <p className="text-sm text-gray-700">🔴 In Math: Unable to complete basic tasks even with support; foundational gaps evident</p>
                              <p className="text-sm text-gray-700">🔴 In Reading: Cannot decode simple words; needs alternative instructional approaches</p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Teaching Strategies */}
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-bold text-gray-700 mb-2">Recommended Teaching Strategies:</p>
                        <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                          {scale.level === 'EE' && (
                            <>
                              <p className="text-sm text-gray-700">✅ Provide enrichment activities and advanced materials</p>
                              <p className="text-sm text-gray-700">✅ Encourage peer tutoring and leadership opportunities</p>
                              <p className="text-sm text-gray-700">✅ Offer independent research projects</p>
                            </>
                          )}
                          {scale.level === 'ME' && (
                            <>
                              <p className="text-sm text-gray-700">✅ Continue current instructional approach</p>
                              <p className="text-sm text-gray-700">✅ Provide challenging extension tasks</p>
                              <p className="text-sm text-gray-700">✅ Encourage self-directed learning</p>
                            </>
                          )}
                          {scale.level === 'AE' && (
                            <>
                              <p className="text-sm text-gray-700">📖 Provide additional guided practice</p>
                              <p className="text-sm text-gray-700">📖 Use scaffolding techniques</p>
                              <p className="text-sm text-gray-700">📖 Offer one-on-one support sessions</p>
                            </>
                          )}
                          {scale.level === 'BE' && (
                            <>
                              <p className="text-sm text-gray-700">👥 Small group intervention required</p>
                              <p className="text-sm text-gray-700">👥 Daily targeted practice</p>
                              <p className="text-sm text-gray-700">👥 Parent communication and home support</p>
                            </>
                          )}
                          {scale.level === 'NY' && (
                            <>
                              <p className="text-sm text-gray-700">🎯 Intensive one-on-one intervention</p>
                              <p className="text-sm text-gray-700">🎯 Alternative teaching methods</p>
                              <p className="text-sm text-gray-700">🎯 Consider special education evaluation</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Application Guidelines */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BookOpen className="text-blue-600" size={24} />
                  How to Apply the Performance Scale
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-bold text-gray-800 mb-2">For Formative Assessment:</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">1.</span>
                        <span>Assess learner against specific learning outcome</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">2.</span>
                        <span>Enter raw score (e.g., 8 out of 10)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">3.</span>
                        <span>System calculates percentage (80%)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">4.</span>
                        <span>System assigns rubric level (ME)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">5.</span>
                        <span>Add teacher remarks for context</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-800 mb-2">For Summative Assessment:</h5>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">1.</span>
                        <span>Mark exam according to marking scheme</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">2.</span>
                        <span>Total marks from all sections</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">3.</span>
                        <span>Calculate percentage (e.g., 85/100 = 85%)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">4.</span>
                        <span>System maps to performance level (ME)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">5.</span>
                        <span>Include in term report calculation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Reference Table */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b">
                  <h4 className="text-lg font-bold">Quick Reference Table</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Level</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Score Range</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action Required</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {performanceScale.map(scale => (
                        <tr key={scale.level} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span 
                              className="px-3 py-1 rounded-full text-xs font-bold"
                              style={{ backgroundColor: scale.bgColor, color: scale.color }}
                            >
                              {scale.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-semibold" style={{ color: scale.color }}>
                            {scale.name}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">
                            {scale.scoreRange.min}% - {scale.scoreRange.max}%
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {scale.description}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {scale.level === 'EE' && <span className="text-green-600 font-semibold">Enrichment</span>}
                            {scale.level === 'ME' && <span className="text-blue-600 font-semibold">Continue</span>}
                            {scale.level === 'AE' && <span className="text-yellow-600 font-semibold">Support</span>}
                            {scale.level === 'BE' && <span className="text-orange-600 font-semibold">Intervention</span>}
                            {scale.level === 'NY' && <span className="text-red-600 font-semibold">Urgent</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Print Option */}
              <div className="flex items-center justify-end gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <FileText size={20} />Print Rubric Guide
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <Upload size={20} />Export PDF
                </button>
              </div>
            </div>
          )}

          {/* SUMMATIVE TESTS (LIST) PAGE - Simplified */}
          {currentPage === 'assessment-tests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Summative Tests</h3>
                  <p className="text-gray-600 mt-1">View and manage all end-of-term assessments</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Filter by Grade</h4>
                  <select className="w-full px-4 py-2 border rounded-lg">
                    <option>All Grades</option>
                    <option>Grade 3</option>
                    <option>Grade 4</option>
                  </select>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Filter by Status</h4>
                  <select className="w-full px-4 py-2 border rounded-lg">
                    <option>All Status</option>
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h4 className="text-sm font-semibold text-gray-600 mb-2">Filter by Term</h4>
                  <select className="w-full px-4 py-2 border rounded-lg">
                    <option>Term 1</option>
                    <option>Term 2</option>
                    <option>Term 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summativeTests.map(test => (
                  <div key={test.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${test.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                        {test.status}
                      </span>
                      <span className="text-sm text-gray-500">{test.date}</span>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-2">{test.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{test.grade} • {test.learningArea}</p>
                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-600">Duration: {test.duration} mins</span>
                      <span className="font-semibold">{test.totalMarks} marks</span>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedTestForMarking(test);
                        setCurrentPage('assessment-marking');
                      }}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Enter Marks
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SUMMATIVE ASSESSMENT (MARKING) PAGE */}
          {currentPage === 'assessment-marking' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Summative Assessment - Mark Entry</h3>
                  <p className="text-gray-600 mt-1">Enter examination marks for learners</p>
                </div>
                <button onClick={() => setCurrentPage('assessment-tests')} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Back to Tests
                </button>
              </div>

              {!selectedTestForMarking ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <FileText size={64} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-xl font-bold">Select a test to begin marking</p>
                </div>
              ) : (
                <>
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-md p-6 text-white">
                    <h4 className="text-2xl font-bold mb-2">{selectedTestForMarking.name}</h4>
                    <div className="flex items-center gap-4 text-blue-100">
                      <span>{selectedTestForMarking.grade}</span>
                      <span>•</span>
                      <span>{selectedTestForMarking.learningArea}</span>
                      <span>•</span>
                      <span>{selectedTestForMarking.date}</span>
                      <span>•</span>
                      <span>{selectedTestForMarking.totalMarks} marks</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-bold">Load Learners</h4>
                      <button 
                        onClick={() => {
                          const classLearners = learners.filter(l => l.grade === selectedTestForMarking.grade && l.status === 'Active');
                          setMarkingData(classLearners.map(l => ({
                            learnerId: l.id,
                            admNo: l.admNo,
                            name: `${l.firstName} ${l.lastName}`,
                            ...selectedTestForMarking.sections.reduce((acc, s, i) => ({...acc, [`section${i}`]: ''}), {}),
                            total: '',
                            status: 'Present'
                          })));
                          showToastMessage(`Loaded ${classLearners.length} learners`, 'success');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Load Class
                      </button>
                    </div>

                    {markingData.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users size={48} className="mx-auto mb-3 text-gray-400" />
                        <p>Click "Load Class" to begin marking</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-semibold">Adm No</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold">Name</th>
                              {selectedTestForMarking.sections.map((s, i) => (
                                <th key={i} className="px-4 py-3 text-left text-xs font-semibold">{s.name}<br/>({s.marks})</th>
                              ))}
                              <th className="px-4 py-3 text-left text-xs font-semibold">Total</th>
                              <th className="px-4 py-3 text-left text-xs font-semibold">Rubric</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {markingData.map((mark, idx) => {
                              const total = selectedTestForMarking.sections.reduce((sum, _, i) => sum + (Number(mark[`section${i}`]) || 0), 0);
                              const percentage = Math.round((total / selectedTestForMarking.totalMarks) * 100);
                              const rubric = getRubricFromScore(percentage);
                              return (
                                <tr key={idx}>
                                  <td className="px-4 py-3 text-sm font-semibold">{mark.admNo}</td>
                                  <td className="px-4 py-3 text-sm">{mark.name}</td>
                                  {selectedTestForMarking.sections.map((s, i) => (
                                    <td key={i} className="px-4 py-3">
                                      <input 
                                        type="number"
                                        value={mark[`section${i}`]}
                                        onChange={(e) => {
                                          const newData = [...markingData];
                                          newData[idx][`section${i}`] = e.target.value;
                                          setMarkingData(newData);
                                        }}
                                        className="w-16 px-2 py-1 border rounded"
                                        max={s.marks}
                                      />
                                    </td>
                                  ))}
                                  <td className="px-4 py-3 font-bold">{total}</td>
                                  <td className="px-4 py-3">
                                    {total > 0 && (
                                      <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{backgroundColor: performanceScale.find(p => p.level === rubric.level)?.bgColor, color: rubric.color}}>
                                        {rubric.level}
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => {
                              const markedLearners = markingData.filter(m => selectedTestForMarking.sections.some((_, i) => m[`section${i}`]));
                              markedLearners.forEach(mark => {
                                const total = selectedTestForMarking.sections.reduce((sum, _, i) => sum + (Number(mark[`section${i}`]) || 0), 0);
                                const percentage = Math.round((total / selectedTestForMarking.totalMarks) * 100);
                                const rubric = getRubricFromScore(percentage);
                                const existingIdx = summativeMarks.findIndex(m => m.testId === selectedTestForMarking.id && m.learnerId === mark.learnerId);
                                const newMark = {
                                  testId: selectedTestForMarking.id,
                                  learnerId: mark.learnerId,
                                  admNo: mark.admNo,
                                  name: mark.name,
                                  ...selectedTestForMarking.sections.reduce((acc, s, i) => ({...acc, [`section${String.fromCharCode(65+i)}`]: Number(mark[`section${i}`]) || 0}), {}),
                                  totalMarks: total,
                                  rubric: rubric.level,
                                  status: 'Present',
                                  markedBy: user?.name || 'Admin',
                                  markedAt: new Date().toISOString().split('T')[0]
                                };
                                if (existingIdx >= 0) {
                                  const updated = [...summativeMarks];
                                  updated[existingIdx] = newMark;
                                  setSummativeMarks(updated);
                                } else {
                                  setSummativeMarks([...summativeMarks, newMark]);
                                }
                              });
                              showToastMessage(`Marks saved for ${markedLearners.length} learners`, 'success');
                              setMarkingData([]);
                            }}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                          >
                            Save All Marks
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* FORMATIVE ASSESSMENT PAGE - PLACEHOLDER */}
          {currentPage === 'assess-formative' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8 shadow-lg">
                <h2 className="text-3xl font-bold">Formative Assessment</h2>
                <p className="text-blue-100 mt-2">Create and manage formative assessments for learners</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <FileText size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Formative Assessment Module</h3>
                <p className="text-gray-600 mb-4">This page is under construction...</p>
                <button 
                  onClick={() => setCurrentPage('dashboard-overview')} 
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
                {/* STEP 2: Learning Area & Outcome - COMMENTED OUT DUE TO HOOKS ISSUE */}
                {/*
                {formStep === 2 && (
                  <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
                    <h3 className="text-2xl font-bold flex items-center gap-3"><span className="text-3xl">📚</span> Step 2: Learning Area & Learning Outcome</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Learning Area <span className="text-red-500">*</span></label>
                        <select
                          value={formData.learningArea}
                          onChange={(e) => setFormData({...formData, learningArea: e.target.value, strand: '', subStrand: '', outcome: ''})}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {learningAreas.map(la => (
                            <option key={la.id} value={la.name}>{la.icon} {la.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Total Marks <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          value={formData.totalMarks}
                          onChange={(e) => setFormData({...formData, totalMarks: Math.max(1, Number(e.target.value))})}
                          min="1"
                          max="100"
                          className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Strand <span className="text-red-500">*</span></label>
                        <select
                          value={formData.strand}
                          onChange={(e) => setFormData({...formData, strand: e.target.value, subStrand: '', outcome: ''})}
                          disabled={!currentLearningArea}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value="">Select Strand...</option>
                          {currentLearningArea?.strands.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Sub-Strand <span className="text-red-500">*</span></label>
                        <select
                          value={formData.subStrand}
                          onChange={(e) => setFormData({...formData, subStrand: e.target.value, outcome: ''})}
                          disabled={!formData.strand}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value="">Select Sub-Strand...</option>
                          {currentLearningArea?.strands
                            .find(s => s.name === formData.strand)?.subStrands
                            .map(ss => (
                              <option key={ss.name} value={ss.name}>{ss.name}</option>
                            ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold mb-2">Learning Outcome <span className="text-red-500">*</span></label>
                        <select
                          value={formData.outcome}
                          onChange={(e) => setFormData({...formData, outcome: e.target.value})}
                          disabled={!formData.subStrand}
                          className="w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        >
                          <option value="">Select Learning Outcome...</option>
                          {currentLearningArea?.strands
                            .find(s => s.name === formData.strand)?.subStrands
                            .find(ss => ss.name === formData.subStrand)?.outcomes
                            .map(outcome => (
                              <option key={outcome} value={outcome}>{outcome}</option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-between pt-6 border-t">
                      <button
                        onClick={() => setFormStep(1)}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                      >
                        ← Back to Step 1
                      </button>
                      <button
                        onClick={() => setFormStep(3)}
                        disabled={!formData.outcome}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Next → Step 3
                      </button>
                    </div>
                  </div>
                )}
                */}

                {/* STEP 3: Load Learners & Enter Marks */}
                {formStep === 3 && (
                  <div className="bg-white rounded-xl shadow-md p-8 space-y-6">
                    <h3 className="text-2xl font-bold flex items-center gap-3"><span className="text-3xl">📊</span> Step 3: Enter Marks</h3>
                    
                    {formData.loadedLearners.length === 0 && (
                      <div className="text-center py-8 bg-blue-50 rounded-lg">
                        <Users size={48} className="mx-auto mb-3 text-blue-400" />
                        <p className="text-gray-700 font-semibold mb-4">Click below to load learners from {formData.grade} {formData.stream}</p>
                        <button
                          onClick={handleLoadLearners}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                        >
                          Load Class Learners ({classLearners.length} students)
                        </button>
                      </div>
                    )}

                    {formData.loadedLearners.length > 0 && (
                      <>
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                          <span className="font-semibold text-green-900">✓ Loaded {formData.loadedLearners.length} learners</span>
                          <button
                            onClick={() => setFormData({...formData, loadedLearners: [], marks: {}})}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition"
                          >
                            Clear & Reload
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50 border-b-2">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Adm No</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Learner Name</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Score (/{formData.totalMarks})</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">% & Rubric</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Remarks</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {formData.loadedLearners.map(learner => {
                                const score = Number(formData.marks[learner.id]?.score) || 0;
                                const percentage = formData.totalMarks > 0 ? Math.round((score / formData.totalMarks) * 100) : 0;
                                const rubric = getRubricFromScore(percentage);
                                return (
                                  <tr key={learner.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{learner.admNo}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xl">{learner.avatar}</span>
                                        <span>{learner.firstName} {learner.lastName}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <input
                                        type="number"
                                        value={formData.marks[learner.id]?.score || ''}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          if (val === '' || (Number(val) >= 0 && Number(val) <= formData.totalMarks)) {
                                            setFormData(prev => ({
                                              ...prev,
                                              marks: {...prev.marks, [learner.id]: {...prev.marks[learner.id], score: val}}
                                            }));
                                          } else {
                                            showToastMessage(`Score cannot exceed ${formData.totalMarks}`, 'error');
                                          }
                                        }}
                                        min="0"
                                        max={formData.totalMarks}
                                        className="w-20 px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-center"
                                        placeholder="0"
                                      />
                                    </td>
                                    <td className="px-4 py-3">
                                      {score > 0 && (
                                        <span 
                                          className="px-3 py-1 rounded-full text-sm font-bold text-white"
                                          style={{backgroundColor: performanceScale.find(p => p.level === rubric.level)?.color}}
                                        >
                                          {rubric.level} ({percentage}%)
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      <input
                                        type="text"
                                        value={formData.marks[learner.id]?.remarks || ''}
                                        onChange={(e) => setFormData(prev => ({
                                          ...prev,
                                          marks: {...prev.marks, [learner.id]: {...prev.marks[learner.id], remarks: e.target.value}}
                                        }))}
                                        className="w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Optional remarks..."
                                      />
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900">
                            Entered marks for: {Object.values(formData.marks).filter(m => m.score !== '').length} / {formData.loadedLearners.length} learners
                          </p>
                        </div>
                      </>
                    )}

                    <div className="flex gap-3 justify-between pt-6 border-t">
                      <button
                        onClick={() => setFormStep(2)}
                        className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                      >
                        ← Back to Step 2
                      </button>
                      <button
                        onClick={handleSaveAssessment}
                        disabled={formData.loadedLearners.length === 0}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <Save size={20} />
                        Save Assessment
                      </button>
                    </div>
                  </div>
                )}

                {/* Recent Assessments */}
                <div className="bg-white rounded-xl shadow-md p-8">
                  <h3 className="text-2xl font-bold mb-6">📋 Recent Assessments</h3>
                  {formativeAssessments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity size={48} className="mx-auto mb-3 text-gray-400" />
                      <p>No assessments recorded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formativeAssessments.slice(0, 5).map(assessment => {
                        const markCount = assessment.marks.length;
                        const avgScore = Math.round(assessment.marks.reduce((sum, m) => sum + m.score, 0) / markCount);
                        return (
                          <div key={assessment.id} className="p-4 border-2 rounded-lg hover:bg-gray-50 transition">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{assessment.type}</span>
                                  <span className="font-bold text-gray-900">{assessment.grade} {assessment.stream} - {assessment.date}</span>
                                </div>
                                <p className="font-semibold text-gray-900 mb-1">{assessment.learningArea}</p>
                                <p className="text-sm text-gray-600">{assessment.strand} → {assessment.subStrand} → {assessment.learningOutcome}</p>
                                <p className="text-xs text-gray-500 mt-2">By {assessment.teacherName} at {assessment.enteredAt}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">{markCount} learners</p>
                                <p className="text-sm text-gray-600">Avg: {avgScore}/{assessment.totalMarks}</p>
                                <div className="flex gap-2 mt-3">
                                  <button className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition" title="View">
                                    <Eye size={18} />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setFormativeAssessments(formativeAssessments.filter(a => a.id !== assessment.id));
                                      showToastMessage('Assessment deleted', 'success');
                                    }}
                                    className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition" title="Delete"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );


          {/* SUMMATIVE REPORT PAGE */}
          {currentPage === 'assessment-summative-report' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Summative Assessment Report</h3>
                  <p className="text-gray-600 mt-1">Analyze end-of-term examination performance</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-bold mb-4">Select Test</h4>
                <select 
                  className="w-full px-4 py-2 border rounded-lg"
                  onChange={(e) => {
                    const test = summativeTests.find(t => t.id === Number(e.target.value));
                    setSelectedTestForMarking(test);
                  }}
                >
                  <option value="">Choose a test...</option>
                  {summativeTests.filter(t => t.status === 'Published').map(test => (
                    <option key={test.id} value={test.id}>{test.name} - {test.grade}</option>
                  ))}
                </select>
              </div>

              {/* Commented out due to IIFE hooks issue */}
              {/*
              {selectedTestForMarking && (() => {
                const testMarks = summativeMarks.filter(m => m.testId === selectedTestForMarking.id);
                const avgScore = testMarks.length > 0 ? Math.round(testMarks.reduce((sum, m) => sum + m.totalMarks, 0) / testMarks.length) : 0;
                const passRate = testMarks.length > 0 ? Math.round((testMarks.filter(m => m.totalMarks >= selectedTestForMarking.passMarks).length / testMarks.length) * 100) : 0;
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <p className="text-sm text-gray-600 mb-1">Learners Assessed</p>
                        <p className="text-3xl font-bold">{testMarks.length}</p>
                      </div>
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <p className="text-sm text-gray-600 mb-1">Average Score</p>
                        <p className="text-3xl font-bold">{avgScore}%</p>
                      </div>
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
                        <p className="text-3xl font-bold text-green-600">{passRate}%</p>
                      </div>
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <p className="text-sm text-gray-600 mb-1">Highest Score</p>
                        <p className="text-3xl font-bold text-blue-600">{Math.max(...testMarks.map(m => m.totalMarks), 0)}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h4 className="text-lg font-bold mb-4">Performance Distribution</h4>
                      <div className="grid grid-cols-5 gap-3">
                        {performanceScale.map(scale => (
                          <div key={scale.level} className="text-center p-4 rounded-lg" style={{backgroundColor: scale.bgColor}}>
                            <p className="text-2xl font-bold" style={{color: scale.color}}>
                              {testMarks.filter(m => m.rubric === scale.level).length}
                            </p>
                            <p className="text-xs font-semibold mt-1" style={{color: scale.color}}>{scale.level}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
              */}
            </div>
          )}
          {currentPage === 'assessment-termly-report' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Termly Report Cards</h3>
                  <p className="text-gray-600 mt-1">Generate official end-of-term reports</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h4 className="text-lg font-bold mb-4">Generate Reports</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Term</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>Term 1</option>
                      <option>Term 2</option>
                      <option>Term 3</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Grade</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>Grade 3</option>
                      <option>Grade 4</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Stream</label>
                    <select className="w-full px-4 py-2 border rounded-lg">
                      <option>A</option>
                      <option>B</option>
                    </select>
                  </div>
                </div>
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                  Generate Report Cards
                </button>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-md p-8 border-2 border-green-200">
                <div className="text-center">
                  <Award size={64} className="mx-auto mb-4 text-green-600" />
                  <h4 className="text-2xl font-bold text-gray-800 mb-2">Report Card Preview</h4>
                  <p className="text-gray-600 mb-4">Official termly reports will be generated here</p>
                  <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto text-left">
                    <div className="text-center mb-4 border-b pb-4">
                      <h5 className="text-xl font-bold">Zawadi JRN Academy</h5>
                      <p className="text-sm text-gray-600">Excellence Through Learning</p>
                      <p className="text-sm font-semibold mt-2">TERM 1 REPORT CARD - 2026</p>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-semibold">Name:</span>
                        <span>Amina Wanjiku Hassan</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Admission No:</span>
                        <span>ADM001</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold">Class:</span>
                        <span>Grade 3 A</span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500 italic text-center">
                        Includes: Academic performance (Formative 60% + Summative 40%), Attendance, Co-curricular, Values & Life Skills, Teacher comments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS - SCHOOL PAGE */}
          {currentPage === 'settings-school' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold mb-6">Branding Settings</h3>
                
                <div className="space-y-6">
                  {/* Logo Upload/URL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">School Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <img 
                          src={brandingSettings?.logoUrl || '/logo-zawadi.png'} 
                          alt="Current Logo" 
                          className="w-24 h-24 object-contain border-2 border-gray-300 rounded-lg bg-gray-50 p-2"
                          onError={(e) => { e.target.src = '/logo-zawadi.png'; }}
                        />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1">Logo URL</label>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={brandingSettings?.logoUrl || ''}
                              onChange={(e) => setBrandingSettings({...brandingSettings, logoUrl: e.target.value})}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="/logo-zawadi.png or https://..."
                            />
                            <input 
                              type="file"
                              id="logoUpload"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setBrandingSettings({...brandingSettings, logoUrl: reader.result});
                                    showToastMessage('Logo loaded! Remember to save settings.', 'success');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            <button 
                              type="button"
                              onClick={() => document.getElementById('logoUpload').click()}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-semibold flex items-center gap-2"
                            >
                              <Upload size={18} />
                              Browse
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          💡 <strong>Tip:</strong> You can either enter a URL to an image online, or click "Browse" to upload an image from your computer. 
                          For best results, use a square logo (e.g., 512x512px) in PNG format with a transparent background.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Brand Color */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color"
                        value={brandingSettings?.brandColor || '#1e3a8a'}
                        onChange={(e) => setBrandingSettings({...brandingSettings, brandColor: e.target.value})}
                        className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={brandingSettings?.brandColor || ''}
                        onChange={(e) => setBrandingSettings({...brandingSettings, brandColor: e.target.value})}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="#1e3a8a"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">This color will be used for the login page branding area</p>
                  </div>

                  {/* School Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">School Name</label>
                    <input 
                      type="text"
                      value={brandingSettings?.schoolName || ''}
                      onChange={(e) => setBrandingSettings({...brandingSettings, schoolName: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Zawadi JRN"
                    />
                    <p className="text-xs text-gray-500 mt-1">Displayed in the sidebar and login page</p>
                  </div>

                  {/* Welcome Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Title</label>
                    <input 
                      type="text"
                      value={brandingSettings?.welcomeTitle || ''}
                      onChange={(e) => setBrandingSettings({...brandingSettings, welcomeTitle: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Welcome to Zawadi JRN Academy"
                    />
                    <p className="text-xs text-gray-500 mt-1">Main heading on the login page</p>
                  </div>

                  {/* Welcome Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Welcome Message</label>
                    <textarea 
                      value={brandingSettings?.welcomeMessage || ''}
                      onChange={(e) => setBrandingSettings({...brandingSettings, welcomeMessage: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Empowering education through innovative learning management."
                    />
                    <p className="text-xs text-gray-500 mt-1">Subtext on the login page branding area</p>
                  </div>

                  {/* Preview */}
                  <div className="border-t pt-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
                    <div 
                      className="rounded-lg p-8 text-white text-center"
                      style={{ backgroundColor: brandingSettings?.brandColor || '#1e3a8a' }}
                    >
                      <img 
                        src={brandingSettings?.logoUrl || '/logo-zawadi.png'} 
                        alt="Logo Preview" 
                        className="w-24 h-24 object-contain mx-auto mb-4"
                        onError={(e) => { e.target.src = '/logo-zawadi.png'; }}
                      />
                      <h3 className="text-2xl font-bold mb-2">
                        {brandingSettings?.welcomeTitle || 'Welcome to Zawadi JRN Academy'}
                      </h3>
                      <p className="text-blue-200">
                        {brandingSettings?.welcomeMessage || 'Empowering education through innovative learning management.'}
                      </p>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <button 
                      onClick={() => {
                        showToastMessage('Branding settings saved successfully!', 'success');
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      <Save size={20} />
                      Save Branding Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTHER PAGES - Placeholder */}
          {currentPage !== 'dashboard' && currentPage !== 'learners-list' && currentPage !== 'learners-parents' && 
           currentPage !== 'learners-promotion' && currentPage !== 'learners-transfers' && currentPage !== 'learners-incoming' &&
           currentPage !== 'teachers-list' && currentPage !== 'attendance-learners' && 
           currentPage !== 'attendance-report' && currentPage !== 'attendance-termly' && 
           currentPage !== 'comms-notices' && currentPage !== 'comms-inbox' && currentPage !== 'comms-channels' &&
           currentPage !== 'settings-streams' && currentPage !== 'settings-school' && 
           currentPage !== 'settings-system' && currentPage !== 'settings-profile' &&
           currentPage !== 'settings-roles' && currentPage !== 'settings-users' && currentPage !== 'settings-timetable' &&
           currentPage !== 'assess-formative' && currentPage !== 'assess-formative-report' && 
           currentPage !== 'assess-summative' && currentPage !== 'assess-performance-scale' && 
           currentPage !== 'assess-summative-tests' && currentPage !== 'assess-summative-assessment' && 
           currentPage !== 'assessment-summative-report' && currentPage !== 'assess-termly-report' && (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity size={48} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{getPageTitle()}</h3>
                <p className="text-gray-600 mb-6">This page is under development and will be available soon.</p>
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONFIRMATION DIALOG */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Confirm Action</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  if (confirmAction) confirmAction();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg transition ${
          toastType === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}>
          <div className="flex items-center gap-3">
            {toastType === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
