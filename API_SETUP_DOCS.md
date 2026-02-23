# School Setup API Documentation

## Overview

These endpoints provide bulk operations for school administrators to initialize grading scales and tests for entire schools. They reduce manual setup time from hours to minutes.

---

## Authentication

All endpoints require:
- **Header:** `Authorization: Bearer {jwt_token}`
- **Role:** ADMIN or PRINCIPAL
- **School ID:** Derived from authenticated user's schoolId

---

## Endpoints

### 1. Create Grading Scales

Creates all grading scales for the entire school.

**Endpoint:**
```
POST /api/assessments/setup/create-scales
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "overwrite": false
}
```

**Query Parameters:**
- None

**Request Body Parameters:**
- `overwrite` (boolean, optional, default: false)
  - If false: skips scales that already exist
  - If true: deletes and recreates existing scales

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Successfully created 45 grading scales for the school",
  "data": {
    "created": 45,
    "skipped": 0,
    "logs": [
      "✅ Created: PLAYGROUP - Child Development Activity",
      "✅ Created: PLAYGROUP - Language Activity",
      "..."
    ]
  }
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "School ID required"
}
```

**Response (500 Server Error):**
```json
{
  "success": false,
  "message": "Failed to create grading scales",
  "error": "error details"
}
```

**What it creates:**
- 1 scale per grade/learning area combination
- Total: 45 scales (9 grades × 5 learning areas)
- Each scale has 5 rating levels:
  - Excellent: 80-100%
  - Good: 60-79%
  - Average: 50-59%
  - Pass: 40-49%
  - Below Average: 0-39%

**Grading Range Fields:**
```
- minPercentage: 0-100
- maxPercentage: 0-100
- minMarks: 0-200 (flexible for different total marks)
- maxMarks: 0-200
- points: 0-5
- grade: A, B, C, D, E
- label: Excellent, Good, Average, Pass, Below Average
- color: Hex color code (#10b981, #3b82f6, etc.)
```

---

### 2. Create Summative Tests

Creates summative tests for all grades and learning areas where grading scales exist.

**Endpoint:**
```
POST /api/assessments/setup/create-tests
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "term": "TERM_1",
  "academicYear": 2026,
  "testType": "SUMMATIVE",
  "overwrite": false
}
```

**Request Body Parameters:**
- `term` (string, required)
  - Valid values: TERM_1, TERM_2, TERM_3
  
- `academicYear` (number, required)
  - Example: 2026
  
- `testType` (string, optional, default: "SUMMATIVE")
  - Valid values: SUMMATIVE, CAT, MIDTERM (from schema)
  
- `overwrite` (boolean, optional, default: false)
  - If false: skips tests that already exist
  - If true: deletes and recreates existing tests

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully created 45 summative tests for the school",
  "data": {
    "created": 45,
    "skipped": 0,
    "logs": [
      "✅ Created: Child Development Activity Test - TERM_1 (linked to PLAYGROUP - Child Development Activity)",
      "✅ Created: Mathematical Activities Test - TERM_1 (linked to PP1 - Mathematical Activities)",
      "..."
    ]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "No grading scales found. Please create scales first using /setup/create-scales endpoint."
}
```

**What it creates:**
- 1 test per existing grading scale
- Automatically links each test to its corresponding grading scale via `scaleId`
- Tests are published and active
- Total Marks: 100
- Pass Marks: 40

**Test Fields Set:**
```json
{
  "title": "{LearningArea} Test - {TERM}",
  "learningArea": "English",
  "grade": "GRADE_1",
  "term": "TERM_1",
  "academicYear": 2026,
  "testDate": "2025-02-15",
  "totalMarks": 100,
  "passMarks": 40,
  "scaleId": "existing-scale-id",
  "status": "PUBLISHED",
  "published": true,
  "active": true,
  "testType": "SUMMATIVE"
}
```

---

### 3. Complete School Setup (Recommended)

Creates BOTH grading scales and summative tests in a single atomic operation.

**Endpoint:**
```
POST /api/assessments/setup/complete
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "term": "TERM_1",
  "academicYear": 2026,
  "overwrite": false
}
```

**Request Body Parameters:**
- `term` (string, required)
  - Valid values: TERM_1, TERM_2, TERM_3
  
- `academicYear` (number, required)
  - Example: 2026
  
- `overwrite` (boolean, optional, default: false)
  - If false: skips existing scales and tests
  - If true: deletes and recreates everything

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Complete school setup successful",
  "data": {
    "scalesCreated": 45,
    "testsCreated": 45,
    "logs": [
      "\n================================================================",
      "STEP 1: Creating Grading Scales",
      "================================================================",
      "✅ PLAYGROUP - Child Development Activity",
      "✅ PLAYGROUP - Language Activity",
      "...",
      "\n================================================================",
      "STEP 2: Creating Summative Tests (with linked scales)",
      "================================================================",
      "✅ Child Development Activity Test - TERM_1",
      "...",
      "\n================================================================",
      "🎉 COMPLETE SCHOOL SETUP SUCCESSFUL",
      "================================================================",
      "✅ Grading Scales: 45",
      "✅ Summative Tests: 45 (all pre-linked to scales)",
      "✅ Teachers can now create assessments and record results",
      "✅ Performance descriptors will display in all reports",
      "================================================================"
    ]
  }
}
```

**Execution Order:**
1. Creates all 45 grading scales (9 grades × 5 learning areas)
2. Waits for scales to complete
3. Retrieves all created scales
4. Creates tests for each scale
5. Auto-links each test to its scale
6. Returns summary logs

**When to use:**
- Initial school setup
- One-time operation per term/year
- When you want everything configured at once

---

## Test Creation Validation

When teachers create individual tests, the system now validates and warns if no grading scale is attached.

**Endpoint:**
```
POST /api/assessments/tests
```

**Request:**
```json
{
  "title": "English Test - TERM_1",
  "learningArea": "English",
  "grade": "GRADE_1",
  "term": "TERM_1",
  "academicYear": 2026,
  "testDate": "2025-02-15",
  "totalMarks": 100,
  "passMarks": 40
}
```

**Response with Scale Attached:**
```json
{
  "success": true,
  "message": "Test created successfully",
  "data": { /* SummativeTest object */ },
  "warning": null,
  "scaleLinked": true,
  "linkedScale": {
    "id": "scale-uuid",
    "name": "GRADE_1 - English"
  }
}
```

**Response WITHOUT Scale (Warning):**
```json
{
  "success": true,
  "message": "Test created successfully",
  "data": { /* SummativeTest object */ },
  "warning": "⚠️ No grading scale found for GRADE_1 - English. Test created but has NO performance descriptors. Students will see 'Not assessed' in reports.",
  "scaleLinked": false,
  "linkedScale": null
}
```

**New Response Fields:**
- `warning` (string|null): Warning message if scale not found
- `scaleLinked` (boolean): Whether test was linked to a scale
- `linkedScale` (object|null): Details of the linked scale

---

## Data Models

### Grading Scale

```typescript
interface GradingSystem {
  id: string;
  name: string;
  type: 'SUMMATIVE'; // From setup endpoints
  scaleGroupId?: string;
  grade: Grade; // E.g., 'GRADE_1', 'PP1'
  learningArea?: string; // E.g., 'English'
  schoolId: string;
  active: boolean;
  archived: boolean;
  archivedAt?: DateTime;
  archivedBy?: string;
  isDefault: boolean;
  createdAt: DateTime;
  updatedAt: DateTime;
  ranges: GradingRange[]; // 5 ranges (A, B, C, D, E)
}
```

### Grading Range (Within a Scale)

```typescript
interface GradingRange {
  id: string;
  systemId: string; // Links to GradingSystem
  label: string; // "Excellent", "Good", etc.
  minPercentage: number; // 80
  maxPercentage: number; // 100
  summativeGrade?: 'A' | 'B' | 'C' | 'D' | 'E';
  rubricRating?: string; // EE1, ME1, AE1, BE1
  points?: number; // 4, 3, 2, 1, 0
  color?: string; // "#10b981"
  description?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Summative Test (Created by Setup)

```typescript
interface SummativeTest {
  id: string;
  title: string; // "{LearningArea} Test - TERM_1"
  learningArea: string;
  term: Term; // "TERM_1", "TERM_2", etc.
  academicYear: number;
  grade: Grade;
  testDate: Date;
  totalMarks: number;
  passMarks: number;
  duration?: number;
  description?: string;
  instructions?: string;
  createdBy: string; // User ID
  published: boolean;
  active: boolean;
  status: AssessmentStatus; // "PUBLISHED"
  curriculum: CurriculumType;
  weight: number;
  scaleId: string; // LINKED to GradingSystem!
  schoolId: string;
  branchId?: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

---

## Error Codes

| Code | Status | Message | Solution |
|------|--------|---------|----------|
| 401 | Unauthorized | "School ID required" | Ensure user is authenticated and has schoolId |
| 400 | Bad Request | "No grading scales found" | Run `/setup/create-scales` first |
| 500 | Server Error | Error message varies | Check server logs, database connection |

---

## Workflow Examples

### Example 1: First-time School Setup
```
POST /api/assessments/setup/complete
{
  "term": "TERM_1",
  "academicYear": 2026
}
↓
Response: ✅ 45 scales + 45 tests created
↓
School ready for use!
```

### Example 2: Add Tests for Next Term
```
POST /api/assessments/setup/create-tests
{
  "term": "TERM_2",
  "academicYear": 2026
}
↓
Response: ✅ 45 tests created for TERM_2
(Uses existing scales from TERM_1)
```

### Example 3: Reset Existing Setup
```
POST /api/assessments/setup/complete
{
  "term": "TERM_1",
  "academicYear": 2026,
  "overwrite": true
}
↓
Response: ✅ All scales and tests deleted and recreated
```

---

## Performance Considerations

- **Duration:** ~30-60 seconds for complete school setup (45 scales + 45 tests)
- **Database Operations:**
  - Create scales: 45 operations + 225 range operations (5 per scale)
  - Create tests: 45 operations
  - Total: ~315 database writes
- **Recommendation:** Run during low-traffic periods
- **Idempotent:** Can be run multiple times safely (with overwrite=false)

---

## Security Notes

⚠️ These endpoints should be restricted to ADMIN and PRINCIPAL roles only.

**Recommended Middleware:**
```typescript
router.post('/setup/complete', 
  authenticate,
  requireTenant,
  requireRole(['ADMIN', 'PRINCIPAL']),
  setupController.completeSchoolSetup
);
```

---

## Logging

All operations log to console and response logs. Example:
```
🚀 Starting Complete School Setup...

================================================================
STEP 1: Creating Grading Scales
================================================================
✅ PLAYGROUP - Child Development Activity
✅ PLAYGROUP - Language Activity
...

================================================================
STEP 2: Creating Summative Tests
================================================================
✅ Child Development Activity Test - TERM_1
...

📊 EXECUTION SUMMARY
- Scales Created: 45
- Tests Created: 45
- Duration: 42 seconds
```

---

## FAQ

**Q: Can I run setup multiple times?**
A: Yes! With `overwrite: false`, it skips existing items. With `overwrite: true`, it recreates everything.

**Q: What if I want different learning areas?**
A: The learning areas are hardcoded in the system based on Kenyan CBC curriculum. For custom areas, manually create scales via the grading/system endpoint.

**Q: Can I use existing scales with new tests?**
A: Yes! `/setup/create-tests` automatically links to existing scales. No need to recreate them.

**Q: Will this affect existing student data?**
A: No. Creating scales/tests doesn't affect existing students or results. It only adds new assessment structures.

**Q: What's the difference between the three endpoints?**
- `/create-scales`: Only creates scales, nothing else
- `/create-tests`: Only creates tests, requires scales to exist
- `/complete`: Does both in proper order (scales first, then tests)

Use `/complete` unless you have a specific reason to do them separately.
