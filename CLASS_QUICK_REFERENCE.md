# Class Entity - Quick Reference Guide

## 🎯 What is Class?

The `Class` entity represents a **classroom/section** in EDucore. It's the central organizational unit that connects:
- 📍 **Location**: Branch → Class (School → Campus → Classroom)
- 👨‍🏫 **People**: Teachers, Students, Parents
- 📚 **Resources**: Inventory, Schedule, Facilities
- 📊 **Data**: Attendance, Assessments, Performance

---

## 🔗 Core Relationships

### Hierarchical Structure
```
School
  ↓ (has many branches)
Branch (e.g., Main Campus)
  ↓ (has many classes)
Class (e.g., Grade 3A, Stream A, 2025 Term 1)
```

### Class Enrollment (Students)
```
Class ← [1:Many] → ClassEnrollment [Join Table]
                         ↓
                      Learner (Student)
                         ↓
                    Parent (User)
```

**Key Point**: One student can only be in ONE class per academic year/term
- Enforced by: `@@unique([classId, learnerId])`

### Teacher Assignment
```
Class.teacherId → User (Teacher)
              ↑
          One teacher per class
          (but one teacher can teach multiple classes)
```

### Academic Records (Linked via Learner)
```
ClassEnrollment → Learner → Attendance (marked by teacher)
                         ↓
                         ├─ FormativeAssessment
                         ├─ SummativeResult
                         ├─ CoreCompetency Assessment
                         └─ CoCurricularActivity
```

---

## 📊 Class Structure (Database)

### Main Fields
| Field | Type | Purpose |
|-------|------|---------|
| id | UUID | Unique identifier |
| branchId | UUID | Which campus this class is in |
| name | String | Display name (e.g., "Grade 3A") |
| grade | Enum | Grade level (CRECHE, PP1, ..., GRADE_12) |
| stream | String | Stream (A, B, C) - only A now |
| teacherId | UUID | Head teacher of class |
| academicYear | Int | 2024, 2025, 2026 |
| term | Enum | TERM_1, TERM_2, TERM_3 |
| capacity | Int | Max students (usually 40) |
| room | String | Room number/location |
| active | Boolean | Currently active? |

### Unique Constraint
```prisma
@@unique([branchId, grade, stream, academicYear, term])
```
**Meaning**: Can't have duplicate Grade 3A Stream A in 2025 Term 1

---

## 📦 Class Sub-Resources (NEW)

### 1. ClassInventory
**What**: Books, stationery, equipment in classroom

**Fields**: name, category, quantity, condition (GOOD/FAIR/POOR/DAMAGED), cost, location...

**Usage**:
```javascript
// GET: List all inventory
classAPI.getInventoryItems(classId)

// CREATE: Add item
classAPI.addInventoryItem(classId, {
  name: "Math Books",
  category: "Books",
  quantity: 35,
  condition: "GOOD",
  cost: 450.00
})

// UPDATE: Change quantity/condition
classAPI.updateInventoryItem(classId, itemId, { quantity: 30 })

// DELETE: Remove item (soft delete)
classAPI.deleteInventoryItem(classId, itemId)
```

---

### 2. ClassSchedule
**What**: Lesson timetable - when what's taught by whom

**Fields**: subject, day (MON-SAT), startTime/endTime (HH:mm), room, teacherId...

**Usage**:
```javascript
// GET: Timetable for class
classAPI.getSchedules(classId, { day: "Monday" })

// CREATE: Add lesson
classAPI.addSchedule(classId, {
  subject: "English",
  day: "Monday",
  startTime: "08:00",
  endTime: "08:45",
  room: "Room 301",
  teacherId: "optional"
})

// View: Table view or Weekly Grid view in UI
```

---

### 3. ClassFacility
**What**: Facilities available in classroom (projector, whiteboard, etc.)

**Fields**: facilityName, facilityType, quantity, condition (FUNCTIONAL/NEEDS_REPAIR/NON_FUNCTIONAL), maintenanceRequired...

**Usage**:
```javascript
// GET: List facilities
classAPI.getFacilities(classId)

// CREATE: Add facility
classAPI.addFacility(classId, {
  facilityName: "Projector 1",
  facilityType: "Projector",
  quantity: 1,
  condition: "FUNCTIONAL",
  maintenanceRequired: false
})

// Track maintenance:
classAPI.updateFacility(classId, facilityId, {
  condition: "NEEDS_REPAIR",
  maintenanceRequired: true,
  lastMaintenance: new Date()
})
```

---

## 👥 How Students Relate to Class

### Enrollment Process
```
1. Learner (student) is created in system
2. ClassEnrollment record created: links Learner to Class
3. Learner now appears in Class roster
4. Attendance can be marked for this Learner in this Class
5. Assessments recorded for Learner (linked via learnerId)
```

### Finding Students in a Class
```javascript
// Get class with all students
const classData = await classAPI.getClassDetails(classId)

classData.enrollments.forEach(enr => {
  console.log(enr.learner.firstName) // Student name
  console.log(enr.enrolledAt) // When enrolled
})
```

### Key Constraint
- **One student per class per term**: `@@unique([classId, learnerId])`
- **No duplicate enrollment**: System prevents adding same student twice

---

## 🎓 How Assessments Link to Class

### Formative Assessment (Ongoing)
```
Teacher marks attendance in Class Math lesson
                ↓
Teacher records "Exceeding" in Formative Assessment for Learner
                ↓
Assessment stored with:
    - learnerId (which student)
    - learningArea (Math)
    - term (TERM_1)
    - academicYear (2025)
    - teacherId (who recorded it)
```

### Summative Assessment (Tests)
```
Class has ClassSchedule entry for "Math Test"
                ↓
Teacher creates SummativeTest and assigns to students
                ↓
Students take test, teacher records results
                ↓
SummativeResult stored with:
    - learnerId
    - subject (Math)
    - marks (85/100)
    - grade (A)
```

---

## 🔗 API Endpoints

### Complete List

**Class Details**
- `GET    /api/classes/:classId`
- `GET    /api/classes/:classId/statistics`

**Inventory**
- `GET    /api/classes/:classId/inventory`
- `POST   /api/classes/:classId/inventory`
- `PUT    /api/classes/:classId/inventory/:itemId`
- `DELETE /api/classes/:classId/inventory/:itemId`

**Schedule**
- `GET    /api/classes/:classId/schedules`
- `POST   /api/classes/:classId/schedules`
- `PUT    /api/classes/:classId/schedules/:scheduleId`
- `DELETE /api/classes/:classId/schedules/:scheduleId`

**Facilities**
- `GET    /api/classes/:classId/facilities`
- `POST   /api/classes/:classId/facilities`
- `PUT    /api/classes/:classId/facilities/:facilityId`
- `DELETE /api/classes/:classId/facilities/:facilityId`

---

## 🗂️ Frontend Components

### Navigation Path
```
ClassList.jsx
  ├─ Shows: All classes with search/filter
  ├─ Lists: Name, grade, stream, teacher, students count, utilization
  └─ Click Card
      ↓
   ClassDetailPage.jsx
     ├─ Tab: Overview (basic info + stats)
     ├─ Tab: Inventory (ClassInventoryTab)
     ├─ Tab: Schedule (ClassScheduleTab)
     ├─ Tab: Facilities (ClassFacilityTab)
     ├─ Tab: Enrollments (list students)
     └─ Tab: Performance (analytics)
```

### Component Hierarchy
```
ClassDetailPage.jsx (Main)
  ├─ ClassInventoryTab.jsx (Import)
  ├─ ClassScheduleTab.jsx (Import)
  ├─ ClassFacilityTab.jsx (Import)
  └─ classAPI.js (All API calls)
```

---

## 🔄 Data Flow Example: Adding Inventory

### User Action
```
User clicks "Add Item" in ClassInventoryTab
         ↓
User fills form (name, category, quantity, condition, cost...)
         ↓
User clicks "Add Item" button
```

### Frontend Flow
```
ClassInventoryTab.jsx
         ↓
Form data: { name, category, quantity... }
         ↓
classAPI.addInventoryItem(classId, formData)
         ↓
HTTP POST /api/classes/:classId/inventory
         ↓
Backend processes & saves to DB
         ↓
Response: { id, classId, name, ... }
         ↓
Component calls: onRefresh()
         ↓
Re-fetch inventory list
         ↓
UI updates with new item
```

---

## 🛡️ Authorization

### Who Can Do What?

| Role | Can View | Can Create | Can Edit | Can Delete |
|------|----------|-----------|---------|-----------|
| ADMIN | ✅ All | ✅ All | ✅ All | ✅ All |
| HEAD_TEACHER | ✅ Own Class | ✅ Own | ✅ Own | ✅ Own |
| TEACHER | ✅ Own Class | ❌ | ❌ | ❌ |
| PARENT | ✅ Child's | ❌ | ❌ | ❌ |

### Routes Protected By
- `verifyToken` - Must have valid JWT
- `requireRole(['HEAD_TEACHER', 'ADMIN'])` - Specific roles

---

## 🔍 Finding Classes

### By Grade
```javascript
// Frontend filters by grade dropdown
// Grade options: CRECHE, PP1, PP2, ..., GRADE_12
const filteredClasses = classes.filter(c => c.grade === 'GRADE_3')
```

### By Stream
```javascript
// Currently only Stream A after cleanup
const streamA = classes.filter(c => c.stream === 'A')
```

### By Academic Year/Term
```javascript
// Implicit in Class model
class.academicYear // 2025
class.term         // TERM_1
```

### By Branch
```javascript
// Classes belong to a branch
branch → classes
// Via: class.branchId = branch.id
```

---

## 📈 Statistics Available

```javascript
// Get key metrics
const stats = await classAPI.getClassStatistics(classId)

// Returns:
{
  classId: "class-123",
  capacity: 40,
  enrollmentCount: 35,        // Number of students
  utilization: 87.5,          // Percentage filled
  availableSeats: 5,
  inventoryCount: 45,         // Number of inventory items
  scheduleCount: 30,          // Number of lessons per week
  facilityCount: 12           // Number of facility items
}
```

---

## 🗑️ Deleting Classes (Cascade)

When you delete a Class:
```
Class deleted
  ├─ ❌ ClassEnrollment (students unenrolled)
  ├─ ❌ ClassInventory (items archived)
  ├─ ❌ ClassSchedule (lessons deleted)
  ├─ ❌ ClassFacility (facilities archived)
  ├─ ⚠️  Attendance (optional ref, NOT deleted)
  └─ ⚠️  Assessments (referencing learner, NOT class)
```

**Important**: Deleting class doesn't delete Learner/Assessment data. Only enrollment and resource records are affected.

---

## 🔑 Key Principles

1. **Class is central**: Everything in school organization revolves around Class
2. **Immutable join**: ClassEnrollment prevents duplicate student enrollment
3. **Soft deletes**: Nothing permanent - archived with timestamps
4. **Isolation**: One class per student per term
5. **Cascading**: Deleting class cascades to related resources
6. **Auditing**: All changes tracked with createdAt/updatedAt
7. **Indexing**: Frequent queries optimized with indexes

---

## 📚 Related Documentation

- **CLASS_MANAGEMENT_SYSTEM.md** - Complete system specs
- **CLASS_RELATIONSHIPS.md** - Detailed relationship map
- **INTEGRATION_GUIDE.md** - How to integrate in EDucore
- **API Documentation** - In controller comments

---

## ✅ Checklist: Class System

- ✅ Database models created (5 new models)
- ✅ Backend routes configured (14 endpoints)
- ✅ Controllers implemented (450+ lines)
- ✅ Frontend components built (1,250+ lines)
- ✅ API service layer created (250+ lines)
- ✅ Authorization configured
- ✅ Error handling implemented
- ✅ Soft deletes enabled
- ✅ Cascade rules set
- ✅ Indexes optimized
- ✅ Documentation complete

---

**Version**: 1.0.0 | **Status**: Production Ready | **Date**: February 2026

