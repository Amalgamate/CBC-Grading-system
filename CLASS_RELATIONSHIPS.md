# Class Entity - Complete Relationship Map

## Executive Overview

The `Class` entity is the central hub in the EDucore system. It serves as the organizational unit that connects:
- **Students** (via ClassEnrollment → Learner)
- **Teachers** (via teacherId → User)
- **Resources** (Inventory, Facilities, Schedules)
- **Academic Activities** (Assessments, Attendance, Performance)
- **School Structure** (via branchId → Branch)

---

## 1. DATABASE SCHEMA RELATIONSHIPS

### Core Class Model
```prisma
model Class {
  id            String            @id @default(uuid())
  branchId      String            // Links to Branch (School → Branch → Class)
  name          String            // e.g., "Grade 3A"
  grade         Grade             // CRECHE, PP1, PP2, ..., GRADE_12
  stream        String?           // "A", "B", "C" (Stream A only after cleanup)
  teacherId     String?           // Links to User (teacher)
  academicYear  Int               // 2024, 2025, 2026
  term          Term              // TERM_1, TERM_2, TERM_3
  capacity      Int               // 40 students max
  room          String?           // Room number/location
  active        Boolean
  archived      Boolean
  
  // Relations (1 → Many)
  attendances   Attendance[]      // All attendance records
  enrollments   ClassEnrollment[] // All student enrollments
  inventory     ClassInventory[]  // Books, stationery, equipment
  schedules     ClassSchedule[]   // Lesson timetables
  facilities    ClassFacility[]   // Projectors, whiteboards, etc.
  
  // Relations (Many → 1)
  branch        Branch @relation(fields: [branchId])
  teacher       User? @relation("ClassTeacher", fields: [teacherId])
}
```

### Navigation Through Relationships

```
Class
├── [1:Many] Attendance
│   ├── learnerId → Learner
│   ├── classId → Class (back-reference)
│   └── markedBy → User (Teacher)
│
├── [1:Many] ClassEnrollment
│   ├── classId → Class (back-reference)
│   └── learnerId → Learner
│       ├── parentId → User (Parent)
│       ├── branchId → Branch
│       ├── schoolId → School
│       └── → FormativeAssessment
│       └── → SummativeResult
│       └── → CoCurricularActivity
│
├── [1:Many] ClassInventory
│   ├── classId → Class (back-reference)
│   └── Tracks: name, category, quantity, condition, cost, location
│
├── [1:Many] ClassSchedule
│   ├── classId → Class (back-reference)
│   ├── subject → String
│   ├── day → MONDAY|TUESDAY|...
│   ├── startTime/endTime → HH:mm
│   └── teacherId → User? (optional teacher assignment)
│
├── [1:Many] ClassFacility
│   ├── classId → Class (back-reference)
│   ├── facilityName → String
│   ├── facilityType → String
│   ├── condition → FUNCTIONAL|NEEDS_REPAIR|NON_FUNCTIONAL
│   └── maintenanceRequired → boolean
│
└── [Many:1] Branch
    ├── branchId → Branch (back-reference)
    └── Branch holds multiple Classes
```

---

## 2. CLASS ENROLLMENT FLOW

### How Students Connect to Classes

```
School
  └── Branch
       └── Class (e.g., Grade 3A, Stream A)
            └── ClassEnrollment (1 per student)
                 └── Learner
                      ├── firstName, lastName
                      ├── admissionNumber
                      ├── gender, dateOfBirth
                      ├── grade, branch, school
                      ├── parentId → User (Parent)
                      ├── → Attendance[] (records tied to ClassEnrollment)
                      ├── → FormativeAssessment[]
                      ├── → SummativeResult[]
                      ├── → CoreCompetency[]
                      ├── → CoCurricularActivity[]
                      └── → FeeInvoice[]
```

### Key Points:
- **One Learner can be in ONE class at a time** (per academicYear/term)
- **ClassEnrollment is the join table** between Learner and Class
- **Unique constraint**: `@@unique([classId, learnerId])` - prevents duplicate enrollment
- **Active status**: `active` flag tracks current enrollment status
- **Archived tracking**: Soft delete with `archived` and `archivedAt` timestamps

---

## 3. TEACHER RELATIONSHIP

### How Teachers Connect to Classes

```
User (Role: TEACHER)
  ├── classesAsTeacher: Class[] relationship
  │   └── Each Class has teacherId pointing to this User
  │
  ├── formativeAssessments: FormativeAssessment[]
  │   └── Teacher records assessment for Learners
  │
  ├── recordedResults: SummativeResult[]
  │   └── Teacher records summative test results
  │
  ├── createdTests: SummativeTest[]
  │   └── Teacher creates tests (later approved)
  │
  └── attendancesMarked: Attendance[]
       └── Teacher marks attendance for Class
```

### Multiple Classes per Teacher:
- One teacher can teach **multiple classes**
- Each class has **one classTeacher** (head teacher)
- Teachers can also be **subject teachers** via ClassSchedule (optional)

---

## 4. ACADEMIC DATA FLOW

```
Class
  └── ClassEnrollment
       └── Learner
            ├── [1:Many] Attendance
            │   ├── classId (links back to Class)
            │   └── attendance status (PRESENT, ABSENT, LATE)
            │
            ├── [1:Many] FormativeAssessment
            │   ├── term, academicYear
            │   ├── learningArea, strand
            │   ├── overallRating (EXCEEDING, MEETING, etc.)
            │   ├── teacherId
            │   └── createdAt
            │
            ├── [1:Many] SummativeResult
            │   ├── term, academicYear
            │   ├── learningArea, subject
            │   ├── marks, grade, percentage
            │   ├── isPass, isRetake
            │   └── recordedBy (teacher)
            │
            ├── [1:Many] CoreCompetency
            │   ├── competency name
            │   ├── rating, evidence
            │   └── assessedBy (teacher)
            │
            └── [1:Many] CoCurricularActivity
                ├── activity name
                ├── rating, evidence
                ├── awardedBy (teacher)
                └── recordedAt
```

---

## 5. RESOURCE MANAGEMENT

### ClassInventory (NEW)
```
Class
  └── ClassInventory[]
       ├── name: "English Textbook", "Math Whiteboard Markers"
       ├── category: "Books", "Stationery", "Equipment", "Furniture"
       ├── quantity: number of items
       ├── condition: GOOD, FAIR, POOR, DAMAGED
       ├── cost: acquisition price
       ├── location: "Shelf A1", "Storage Room"
       ├── acquisitionDate
       └── active, archived (soft delete)
```

### ClassSchedule (NEW)
```
Class
  └── ClassSchedule[]
       ├── subject: "English", "Mathematics", "Science"
       ├── day: MONDAY to SATURDAY
       ├── startTime/endTime: HH:mm format (8:00 - 15:30)
       ├── room: optional room location
       ├── teacherId: optional teacher assignment
       ├── semester: TERM_1, TERM_2, TERM_3
       └── academicYear
```

### ClassFacility (NEW)
```
Class
  └── ClassFacility[]
       ├── facilityName: "Projector 1", "Whiteboard"
       ├── facilityType: "Projector", "Whiteboard", "Computer"
       ├── quantity: number of units
       ├── condition: FUNCTIONAL, NEEDS_REPAIR, NON_FUNCTIONAL
       ├── maintenanceRequired: boolean
       ├── lastMaintenance: timestamp
       └── notes: optional maintenance notes
```

---

## 6. BACKEND CONTROLLER METHODS

### class-detail.controller.ts - 450+ lines

#### Class Detail Operations:
```typescript
export const getClassDetails = async (classId)
  → Returns: Class with all relations included
    {
      id, name, grade, stream, capacity, academicYear,
      teacher: { firstName, lastName, phone },
      studentCount, inventory[], schedules[], facilities[],
      enrollments[]
    }

export const getClassStatistics = async (classId)
  → Returns: { capacity, enrollmentCount, utilization%, 
               availableSeats, inventoryCount, scheduleCount, facilityCount }
```

#### Inventory Management:
```typescript
POST   /classes/:classId/inventory         → addInventoryItem()
GET    /classes/:classId/inventory         → getInventoryItems() [with filters]
PUT    /classes/:classId/inventory/:itemId → updateInventoryItem()
DELETE /classes/:classId/inventory/:itemId → deleteInventoryItem() [soft delete]
```

#### Schedule Management:
```typescript
POST   /classes/:classId/schedules         → addSchedule()
GET    /classes/:classId/schedules         → getSchedules() [with filters by day/semester]
PUT    /classes/:classId/schedules/:scheduleId → updateSchedule()
DELETE /classes/:classId/schedules/:scheduleId → deleteSchedule()
```

#### Facility Management:
```typescript
POST   /classes/:classId/facilities        → addFacility()
GET    /classes/:classId/facilities        → getFacilities() [with filters]
PUT    /classes/:classId/facilities/:facilityId → updateFacility()
DELETE /classes/:classId/facilities/:facilityId → deleteFacility() [soft delete]
```

---

## 7. FRONTEND COMPONENT HIERARCHY

```
App.jsx
  └── Router
       └── /classes → ClassList.jsx
            ├── Fetches all classes
            ├── Search by name/grade
            ├── Filter by grade level
            ├── Displays class cards
            │   ├── Class name, grade, stream
            │   ├── Teacher info (name, phone)
            │   ├── Student count + gender split
            │   └── Click → navigate to detail
            │
            └── /class/:classId → ClassDetailPage.jsx
                 ├── useParams() to get classId
                 ├── useEffect() → classAPI.getAllClassData(classId)
                 ├── 6 Tabs:
                 │   ├── Overview: Basic info, key statistics
                 │   ├── Inventory: ClassInventoryTab
                 │   ├── Schedule: ClassScheduleTab
                 │   ├── Facilities: ClassFacilityTab
                 │   ├── Enrollments: List students
                 │   └── Performance: Analytics
                 │
                 ├── ClassInventoryTab.jsx
                 │   ├── classAPI.getInventoryItems()
                 │   ├── classAPI.addInventoryItem()
                 │   ├── classAPI.updateInventoryItem()
                 │   └── classAPI.deleteInventoryItem()
                 │
                 ├── ClassScheduleTab.jsx
                 │   ├── classAPI.getSchedules()
                 │   ├── classAPI.addSchedule()
                 │   ├── classAPI.updateSchedule()
                 │   └── classAPI.deleteSchedule()
                 │   ├── Dual view: Table + Weekly Grid
                 │   └── Time slot selector (8am-3:30pm)
                 │
                 └── ClassFacilityTab.jsx
                     ├── classAPI.getFacilities()
                     ├── classAPI.addFacility()
                     ├── classAPI.updateFacility()
                     ├── classAPI.deleteFacility()
                     └── Status indicators (Functional/Repair/Non-Functional)
```

---

## 8. API SERVICE LAYER (classAPI.js)

```javascript
// Frontend API Client - 250+ lines

// Class Details
classAPI.getClassDetails(classId)
classAPI.getClassStatistics(classId)

// Inventory CRUD
classAPI.getInventoryItems(classId, filters)
classAPI.addInventoryItem(classId, itemData)
classAPI.updateInventoryItem(classId, itemId, itemData)
classAPI.deleteInventoryItem(classId, itemId)

// Schedule CRUD
classAPI.getSchedules(classId, filters)
classAPI.addSchedule(classId, scheduleData)
classAPI.updateSchedule(classId, scheduleId, scheduleData)
classAPI.deleteSchedule(classId, scheduleId)

// Facilities CRUD
classAPI.getFacilities(classId, filters)
classAPI.addFacility(classId, facilityData)
classAPI.updateFacility(classId, facilityId, facilityData)
classAPI.deleteFacility(classId, facilityId)

// Batch Operations
classAPI.getAllClassData(classId)        // Parallel fetch all
classAPI.exportClassData(classData, format)  // Export JSON/CSV
```

---

## 9. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         EDucore System                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│     School       │
└────────┬─────────┘
         │branchId
         ▼
┌──────────────────┐
│     Branch       │
└────────┬─────────┘
         │branchId
         ▼
    ┌────────────────────────────────────────────┐
    │            Class                           │
    │  (Grade 3A, Stream A, Academic Year 2025) │
    └────┬─────────┬─────────┬────────┬──────────┘
         │         │         │        │
    ┌────▼─┐  ┌────▼─────┐  │   ┌────▼──────┐
    │ User │  │ClassEnrl │  │   │ Attendance
    │(Tchr)│  │(Students)│  │   │ (Marked)
    └──────┘  │  Learner │  │   └───────────┘
             │    ↓      │  │
             │ Formative │  │
             │ Summative │  │
             │Assessment │  │
             └───────────┘  │
                            ├─ ClassInventory
                            ├─ ClassSchedule
                            └─ ClassFacility

┌──────────────────────────────────────────────────────┐
│         Frontend (React)                             │
├──────────────────────────────────────────────────────┤
│  ClassList → ClassDetailPage → Tab Components        │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │ classAPI.js (API Client Layer)               │   │
│  │ - Manages all HTTP requests                  │   │
│  │ - Error handling                             │   │
│  │ - JWT authentication                         │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
         │ HTTP Calls
         ▼
┌──────────────────────────────────────────────────────┐
│         Backend (Express + TypeScript)               │
├──────────────────────────────────────────────────────┤
│  class-detail.routes.ts (14 endpoints)               │
│  ↓                                                   │
│  class-detail.controller.ts (7 operation groups)    │
│  ↓                                                   │
│  Prisma ORM                                          │
└──────────────────────────────────────────────────────┘
         │ SQL Queries
         ▼
┌──────────────────────────────────────────────────────┐
│         PostgreSQL Database                          │
├──────────────────────────────────────────────────────┤
│  Tables: classes, class_enrollments, class_inventory │
│           class_schedules, class_facilities           │
│           learners, users, attendance, etc.          │
└──────────────────────────────────────────────────────┘
```

---

## 10. REFERENCE TABLES

### Where Class is Used (Controllers)

| File | Operations | Purpose |
|------|------------|---------|
| class-detail.controller.ts | CRUD | Manage class inventory, schedules, facilities |
| attendance.controller.ts | Create/Update | Mark attendance for class |
| formativeAssessment.controller.ts | Create/Update | Record assessments for learners in class |
| summativeTest.controller.ts | Create/Update | Create/manage tests for class |
| enrollment.controller.ts | CRUD | Manage student enrollments to classes |
| notification.controller.ts | Query | Send notifications to class (all students) |

### Where Class is Used (Frontend)

| Component | Operations | Purpose |
|-----------|-----------|---------|
| ClassList.jsx | Query | Display all classes with filters |
| ClassDetailPage.jsx | Query | Fetch class details + related data |
| ClassInventoryTab.jsx | CRUD | Manage inventory items |
| ClassScheduleTab.jsx | CRUD | Manage lesson schedules |
| ClassFacilityTab.jsx | CRUD | Manage facilities |
| FacilityManager.jsx | Query | Display classes with real-time info |

### Database Indexes Created

```prisma
Class table:
  @@index([branchId])
  @@index([teacherId])
  @@index([grade, stream])

ClassEnrollment table:
  @@index([classId])
  @@index([learnerId])
  @@unique([classId, learnerId])  // Prevent duplicates

Attendance table:
  @@index([classId])
  @@index([learnerId])

ClassInventory table:
  @@index([classId])
  @@index([category])
  @@index([condition])

ClassSchedule table:
  @@index([classId])
  @@index([day])

ClassFacility table:
  @@index([classId])
  @@index([facilityType])
```

---

## 11. COMPLETE REQUEST/RESPONSE EXAMPLE

### Getting Full Class Data

**Frontend Code:**
```javascript
import * as classAPI from './services/classAPI';

const [classData, setClassData] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    const data = await classAPI.getAllClassData('class-123');
    setClassData(data);
  };
  fetchData();
}, []);
```

**API Call Chain:**
1. Frontend: `classAPI.getAllClassData('class-123')`
2. Service: Parallel Promise.all([getDetails, getInventory, getSchedules, getFacilities])
3. HTTP: `GET /api/classes/class-123` (with Authorization header)
4. Backend: `class-detail.controller.ts → getClassDetails()`
5. Database: Prisma.class.findUnique() with all includes
6. Response: 
```json
{
  "id": "class-123",
  "name": "Grade 3A",
  "grade": "3",
  "stream": "A",
  "capacity": 40,
  "academicYear": 2025,
  "term": "TERM_1",
  "studentCount": 35,
  "utilization": 87.5,
  "teacher": {
    "id": "user-456",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+254712345678"
  },
  "inventory": [
    {
      "id": "inv-1",
      "name": "English Textbook",
      "category": "Books",
      "quantity": 35,
      "condition": "GOOD",
      "cost": 450.00
    }
  ],
  "schedules": [
    {
      "id": "sch-1",
      "subject": "English",
      "day": "Monday",
      "startTime": "08:00",
      "endTime": "08:45",
      "room": "Room 301"
    }
  ],
  "facilities": [
    {
      "id": "fac-1",
      "facilityName": "Projector 1",
      "facilityType": "Projector",
      "quantity": 1,
      "condition": "FUNCTIONAL"
    }
  ],
  "enrollments": [
    {
      "id": "enr-1",
      "learnerId": "learner-1",
      "learner": {
        "firstName": "Alice",
        "admissionNumber": "2024001",
        "gender": "FEMALE"
      }
    }
  ]
}
```

---

## 12. SYSTEM STATISTICS

### Code Metrics

| Component | Lines | Status |
|-----------|-------|--------|
| Backend Controller | 450+ | ✅ Created |
| Backend Routes | 130+ | ✅ Created |
| Frontend Components | 1,250+ | ✅ Created |
| API Service | 250+ | ✅ Created |
| Database Models | 5 new | ✅ Created |
| Documentation | 1,500+ | ✅ Complete |
| **Total** | **3,580+** | ✅ Ready |

### Database Relationships

```
User (1) ──── (Many) Class (as teacher)
User (1) ──── (Many) Attendance (as marker)

Branch (1) ──── (Many) Class

Class (1) ──── (Many) ClassEnrollment
Class (1) ──── (Many) ClassInventory
Class (1) ──── (Many) ClassSchedule
Class (1) ──── (Many) ClassFacility
Class (1) ──── (Many) Attendance

Learner (1) ──── (Many) ClassEnrollment
Learner (1) ──── (Many) Attendance
Learner (1) ──── (Many) FormativeAssessment
Learner (1) ──── (Many) SummativeResult
```

---

## Summary

**The Class entity is the organizational backbone of EDucore:**

1. **Structural**: Links School → Branch → Class → Students/Teachers
2. **Academic**: Tracks attendance, assessments, performance for students in class
3. **Operational**: Manages inventory, schedules, facilities per class
4. **Historical**: Maintains soft delete audit trail for compliance

**Cascade Operations**: Deleting a class cascades to:
- ❌ ClassEnrollment (students unenrolled)
- ❌ ClassInventory (items archived)
- ❌ ClassSchedule (schedule deleted)
- ❌ ClassFacility (facilities archived)
- ⚠️ Attendance (optional reference, not deleted)

**Key Principle**: Everything in EDucore revolves around the Class, making it the most critical entity in the system.
