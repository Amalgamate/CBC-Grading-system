# Smart Test Creation & Bulk School Setup Guide

## Overview

This feature addresses the repetitive nature of creating grading scales and tests for entire schools by providing:

1. **Smart validation** when creating tests - warns if no grading scale is attached
2. **Bulk endpoints** to create scales and tests automatically for the entire school
3. **One-click setup** for new schools

---

## Problem Solved

### Before
- Teachers/admins manually create tests one by one
- Tests often created without grading scales attached
- Reports show "Not assessed" for students (no performance descriptors)
- Setting up a school took 2-3 hours of manual work
- Risk of forgetting certain grade/subject combinations

### After
- Single API call creates all scales for the school
- Another call creates all tests linked to scales
- Or one combined call does everything at once
- Takes minutes instead of hours
- All tests automatically generate performance descriptors in reports

---

## How It Works

### 1. Test Creation Validation

When a teacher creates a test via the UI or API:

```json
POST /api/assessments/tests
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

**Response with warning** (if no scale found):
```json
{
  "success": true,
  "message": "Test created successfully",
  "data": { /* test object */ },
  "warning": "⚠️ No grading scale found for GRADE_1 - English. Test created but has NO performance descriptors. Students will see 'Not assessed' in reports.",
  "scaleLinked": false,
  "linkedScale": null
}
```

**Response with success** (if scale found):
```json
{
  "success": true,
  "message": "Test created successfully",
  "data": { /* test object */ },
  "warning": null,
  "scaleLinked": true,
  "linkedScale": {
    "id": "scale-123",
    "name": "GRADE_1 - English"
  }
}
```

---

### 2. Bulk Create Grading Scales

Creates ALL grading scales for the entire school in one operation.

**Endpoint:**
```
POST /api/assessments/setup/create-scales
```

**Request:**
```json
{
  "overwrite": false
}
```

**Response:**
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
      "✅ Created: PP1 - Mathematical Activities",
      "⏭️  Skipped: GRADE_1 - English (already exists)",
      "..."
    ]
  }
}
```

**What it creates:**
- 5 scales for PLAYGROUP
- 5 scales for PP1
- 5 scales for PP2
- 5 scales for GRADE_1
- 5 scales for GRADE_2
- 5 scales for GRADE_3
- 5 scales for GRADE_4
- 5 scales for GRADE_5
- 5 scales for GRADE_6
- **Total: 45 scales** (9 grades × 5 learning areas)

**Each scale includes:**
- 5-level rating system:
  - Excellent (80-100%)
  - Good (60-79%)
  - Average (50-59%)
  - Pass (40-49%)
  - Below Average (0-39%)

---

### 3. Bulk Create Summative Tests

Creates tests for all grades and learning areas where scales exist, AUTO-LINKING to those scales.

**Endpoint:**
```
POST /api/assessments/setup/create-tests
```

**Request:**
```json
{
  "term": "TERM_1",
  "academicYear": 2026,
  "testType": "SUMMATIVE",
  "overwrite": false
}
```

**Response:**
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

**What it creates:**
- One test per grading scale
- **Total: 45 tests** (one for each of the 45 scales)
- All tests are **auto-linked to their corresponding grading scales**
- Tests are immediately ready to use

---

### 4. Complete School Setup (RECOMMENDED)

Creates BOTH scales and tests in a single operation. This is the recommended approach for initial school setup.

**Endpoint:**
```
POST /api/assessments/setup/complete
```

**Request:**
```json
{
  "term": "TERM_1",
  "academicYear": 2026,
  "overwrite": false
}
```

**Response:**
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

---

## Usage Guide

### Initial School Setup (First Time)

**One-time call to set up everything:**

```bash
curl -X POST http://localhost:5000/api/assessments/setup/complete \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "term": "TERM_1",
    "academicYear": 2026
  }'
```

This creates:
- ✅ 45 grading scales (all grades, all learning areas)
- ✅ 45 summative tests (auto-linked to scales)
- ✅ School is ready to use

### Add New Term Tests

```bash
curl -X POST http://localhost:5000/api/assessments/setup/create-tests \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "term": "TERM_2",
    "academicYear": 2026
  }'
```

This creates tests for TERM_2, automatically linking to existing scales.

### Reset (with Overwrite)

If you need to recreate everything:

```bash
curl -X POST http://localhost:5000/api/assessments/setup/complete \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "term": "TERM_1",
    "academicYear": 2026,
    "overwrite": true
  }'
```

---

## Learning Areas by Grade

The system automatically creates tests for these learning areas:

| Grade | Learning Areas |
|-------|---|
| **PLAYGROUP** | Child Development Activity, Language Activity, Mathematical Activity, Environmental Activity, Creative Activity |
| **PP1** | Mathematical Activities, Language Activities, Literacy & Reading, Environmental Activities, Creative Activities |
| **PP2** | Mathematical Activities, Language Activities, Literacy & Reading, Environmental Activities, Creative Activities |
| **GRADE_1** | English, Mathematics, Environmental Activities, Creative Activities, Physical Education |
| **GRADE_2** | English, Mathematics, Science & Technology, Social Studies, Creative Activities |
| **GRADE_3** | English, Mathematics, Science & Technology, Social Studies, Creative Activities |
| **GRADE_4** | English, Mathematics, Science & Technology, Social Studies, Kenya Sign Language |
| **GRADE_5** | English, Mathematics, Science & Technology, Social Studies, Kenya Sign Language |
| **GRADE_6** | English, Mathematics, Science & Technology, Social Studies, Kenya Sign Language |

---

## Important Notes

### Permissions
Only users with ADMIN or PRINCIPAL role should have access to these endpoints for security.

### Scales Must Exist Before Tests
- `/setup/create-tests` requires scales to exist first
- Use `/setup/complete` to create both automatically
- Or run `/setup/create-scales` then `/setup/create-tests`

### Auto-Linking Works
- Tests automatically search for matching grading scales
- Matching by Grade + Learning Area
- If found, test is automatically linked
- All tests in reports will show performance descriptors

### No More "Not Assessed"
- Before: Teachers created tests manually → no scales linked → "Not assessed" in reports
- After: Tests created via bulk setup → scales auto-linked → performance descriptors display

### Moving Forward
After initial setup:
- Teachers now create tests manually but get **warnings** if no scale is attached
- Admin can see immediately that a test won't work properly
- System enforces best practices

---

## API Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/setup/create-scales` | POST | Create all grading scales for school |
| `/setup/create-tests` | POST | Create tests for all grades/learning areas |
| `/setup/complete` | POST | Create scales AND tests in one call |
| `/tests` | POST | Create single test (with validation warning) |

---

## Example Implementation Flow

```
1. User navigates to Admin → School Setup
2. Click "Setup Entire School" button
3. System calls POST /api/assessments/setup/complete
4. 45 scales + 45 tests created in ~30 seconds
5. Success message: "School is ready! Teachers can now create assessments"
6. Teachers can immediately:
   - View all tests for their grade/subject
   - Record student results
   - Generate reports with performance descriptors
   - See automatic letter grades (A-E)
```

---

## Troubleshooting

### Tests show "Not assessed"
- Scales are missing for that grade/learning area
- Run `/setup/complete` to create both
- Or manually create the missing scale

### API returns "No grading scales found"
- Database has no scales yet
- Run `/setup/create-scales` first

### Some grades/subjects missing
- Check if that grade/learning area is in the LEARNING_AREAS_CONFIG
- Can customize the learning areas if needed

---

## Future Enhancements

- [ ] UI button in Admin panel to trigger setup endpoints
- [ ] Progress bar showing scale/test creation status
- [ ] Ability to customize learning areas per school
- [ ] Import scales from template libraries
- [ ] Email confirmation when setup completes
