# Implementation Guide for CBC Assessment Forms

## Quick Start

### 1. Import the Forms

Add to your routing configuration:

```jsx
// In your App.jsx or router configuration
import {
  CoreCompetenciesForm,
  ValuesAssessmentForm,
  CoCurricularActivitiesForm,
  TermlyReportCommentsForm
} from './pages/assessments';

// Example routes
const routes = [
  {
    path: '/assessments/competencies',
    component: CoreCompetenciesForm
  },
  {
    path: '/assessments/values',
    component: ValuesAssessmentForm
  },
  {
    path: '/assessments/activities',
    component: CoCurricularActivitiesForm
  },
  {
    path: '/assessments/report-comments',
    component: TermlyReportCommentsForm
  }
];
```

### 2. API Integration

Each form has a `handleSubmit` function ready for API integration:

```jsx
// Example API integration
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    setSaveStatus('error');
    return;
  }

  try {
    setSaveStatus('saving');
    
    // Replace with your actual API endpoint
    const response = await fetch('/api/assessments/competencies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Save failed');
    
    setSaveStatus('success');
    setTimeout(() => setSaveStatus(''), 3000);
  } catch (error) {
    console.error('Error saving form:', error);
    setSaveStatus('error');
  }
};
```

### 3. Navigation Menu

Add assessment forms to your navigation:

```jsx
// Example navigation component
const assessmentMenuItems = [
  {
    icon: <Award />,
    label: 'Core Competencies',
    path: '/assessments/competencies'
  },
  {
    icon: <Heart />,
    label: 'Values Assessment',
    path: '/assessments/values'
  },
  {
    icon: <Users />,
    label: 'Co-Curricular Activities',
    path: '/assessments/activities'
  },
  {
    icon: <FileText />,
    label: 'Report Comments',
    path: '/assessments/report-comments'
  }
];
```

## Data Flow

### Typical Workflow

```
1. Student Selection
   ↓
2. Form Selection (Competencies, Values, Activities, or Comments)
   ↓
3. Fill Assessment Data
   ↓
4. Validation
   ↓
5. Save to Backend
   ↓
6. Generate Reports
```

## Backend Requirements

### API Endpoints Needed

```
POST   /api/assessments/competencies      - Save core competencies
GET    /api/assessments/competencies/:id  - Retrieve assessment
PUT    /api/assessments/competencies/:id  - Update assessment

POST   /api/assessments/values            - Save values assessment
GET    /api/assessments/values/:id        - Retrieve assessment
PUT    /api/assessments/values/:id        - Update assessment

POST   /api/assessments/activities        - Save activities assessment
GET    /api/assessments/activities/:id    - Retrieve assessment
PUT    /api/assessments/activities/:id    - Update assessment

POST   /api/assessments/comments          - Save report comments
GET    /api/assessments/comments/:id      - Retrieve comments
PUT    /api/assessments/comments/:id      - Update comments
```

### Database Schema Suggestions

#### Competencies Table
```sql
CREATE TABLE competency_assessments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  grade VARCHAR(20),
  term VARCHAR(20),
  academic_year VARCHAR(20),
  assessment_date DATE,
  competencies JSONB,  -- Stores array of competency ratings
  overall_comment TEXT,
  next_steps TEXT,
  teacher_id INTEGER REFERENCES teachers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Values Table
```sql
CREATE TABLE values_assessments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  grade VARCHAR(20),
  term VARCHAR(20),
  academic_year VARCHAR(20),
  assessment_date DATE,
  values JSONB,  -- Stores array of value ratings
  overall_assessment TEXT,
  strengths_identified TEXT,
  areas_for_development TEXT,
  teacher_id INTEGER REFERENCES teachers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Activities Table
```sql
CREATE TABLE activity_assessments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  grade VARCHAR(20),
  term VARCHAR(20),
  academic_year VARCHAR(20),
  assessment_date DATE,
  activities JSONB,  -- Stores array of activities
  overall_performance TEXT,
  skills_developed TEXT,
  teacher_id INTEGER REFERENCES teachers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Report Comments Table
```sql
CREATE TABLE report_comments (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id),
  grade VARCHAR(20),
  term VARCHAR(20),
  academic_year VARCHAR(20),
  report_date DATE,
  subject_comments JSONB,  -- Stores comments for all subjects
  class_teacher_comment TEXT,
  head_teacher_comment TEXT,
  behavior_conduct TEXT,
  attendance VARCHAR(50),
  punctuality VARCHAR(50),
  class_teacher_id INTEGER REFERENCES teachers(id),
  head_teacher_id INTEGER REFERENCES teachers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Features to Add

### 1. Student Lookup
```jsx
// Add student search/selection before showing form
import { useState } from 'react';

function AssessmentWrapper() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  if (!selectedStudent) {
    return <StudentSelector onSelect={setSelectedStudent} />;
  }
  
  return <CoreCompetenciesForm student={selectedStudent} />;
}
```

### 2. Previous Assessment Loading
```jsx
// Load previous term's assessment for reference
useEffect(() => {
  if (studentId && term) {
    fetchPreviousAssessment(studentId, previousTerm)
      .then(data => setPreviousData(data));
  }
}, [studentId, term]);
```

### 3. PDF Export
```jsx
// Add PDF generation button
import { jsPDF } from 'jspdf';

const generatePDF = () => {
  const doc = new jsPDF();
  // Add form data to PDF
  doc.save('assessment-report.pdf');
};
```

### 4. Draft Saving
```jsx
// Auto-save drafts
useEffect(() => {
  const timer = setTimeout(() => {
    saveDraft(formData);
  }, 5000); // Save every 5 seconds
  
  return () => clearTimeout(timer);
}, [formData]);
```

## Customization Tips

### 1. Modify Rating Scales
```jsx
// In the form component
const ratingScale = [
  { value: 'A', label: 'Advanced', color: 'bg-purple-100 border-purple-400' },
  { value: 'P', label: 'Proficient', color: 'bg-green-100 border-green-400' },
  // ... add your custom scales
];
```

### 2. Add Custom Subjects
```jsx
// In TermlyReportCommentsForm
const subjects = [
  { key: 'english', name: 'English Language' },
  { key: 'customSubject', name: 'Your Custom Subject' },
  // ... add more subjects
];
```

### 3. Extend Activity Categories
```jsx
// In CoCurricularActivitiesForm
const activityCategories = [
  { value: 'sports', label: 'Sports & Athletics' },
  { value: 'robotics', label: 'Robotics Club' },  // New category
  // ... add more categories
];
```

## Testing Checklist

- [ ] Forms load without errors
- [ ] Validation works for required fields
- [ ] Data persists when saved
- [ ] Forms are mobile-responsive
- [ ] All buttons function correctly
- [ ] Error messages display properly
- [ ] Success messages show after save
- [ ] Previous data can be loaded
- [ ] PDF export works (if implemented)
- [ ] Forms work across different browsers

## Support & Documentation

For additional help:
- See README.md in the assessments folder
- Review individual form components
- Check the main project documentation

---

**Note:** These forms are designed to be production-ready but require backend integration for full functionality.
