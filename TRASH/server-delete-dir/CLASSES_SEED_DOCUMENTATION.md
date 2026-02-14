# Classes Seeding Documentation

## Overview

The `seed-classes.ts` script creates all classes for every grade across multiple streams in your database. This is essential for setting up the complete class structure for a school's academic year.

## Features

✅ **Automatic Class Creation** - Creates classes for all 18 grades (Creche through Grade 12)
✅ **Multi-Stream Support** - Creates classes for multiple streams (A, B, C, D)
✅ **Multi-Branch Support** - Works across all active branches of a school
✅ **Automatic Naming** - Classes are automatically named (e.g., "Grade 1 A", "Grade 1 B")
✅ **Conflict Prevention** - Skips classes that already exist
✅ **Detailed Logging** - Shows progress and summary statistics
✅ **Error Handling** - Gracefully handles errors and reports them

## Prerequisites

1. Database must have at least one active school
2. School must have at least one active branch
3. Streams must already be created (using `seed:streams` command)

## Quick Start

### Option 1: Using npm script (Recommended)

```bash
cd server
npm run seed:classes
```

### Option 2: Using ts-node directly

```bash
cd server
npx ts-node prisma/seed-classes.ts
```

## Configuration

You can modify the script behavior by editing these variables at the top of `seed-classes.ts`:

```typescript
// Create classes for these streams
const STREAMS = ['A', 'B', 'C', 'D'];

// Academic year for the classes
const ACADEMIC_YEAR = 2025;

// Current term (TERM_1, TERM_2, or TERM_3)
const CURRENT_TERM = 'TERM_1';

// Maximum capacity per class
const CLASS_CAPACITY = 40;
```

## Available Grades

The script creates classes for all 18 grades:

**Early Childhood Development:**
- Creche
- Reception
- Transition
- Playgroup
- PP1 (Preprimary 1)
- PP2 (Preprimary 2)

**Primary Level:**
- Grade 1 through Grade 6

**Secondary Level:**
- Grade 7 through Grade 12

## Example Output

```
🌱 Starting classes seed...

📋 Configuration:
   Streams: A, B, C, D
   Academic Year: 2025
   Term: TERM_1
   Class Capacity: 40
   Total Grades: 18
   Classes to Create: 72 per branch

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📚 Found 1 active school(s)

🏫 School: Zawadi JRN Academy
   School ID: xyz123...
   📍 Found 2 branch(es)

   📌 Branch: Main Campus (KB)
      ✅ Created: Creche A (ID: class001)
      ✅ Created: Creche B (ID: class002)
      ✅ Created: Creche C (ID: class003)
      ✅ Created: Creche D (ID: class004)
      ✅ Created: Reception A (ID: class005)
      ... (and more)

   📊 Branch Summary:
      Created: 72
      Skipped: 0
      Errors: 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 FINAL SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Schools processed: 1
   Total classes created: 144
   Total classes skipped (already exist): 0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ Classes seeding completed successfully!
```

## What Gets Created

For each school and branch combination, the script creates:

- **18 Grades** × **4 Streams** = **72 classes per branch**

For example, with 2 branches:
- Branch 1: 72 classes
- Branch 2: 72 classes
- **Total: 144 classes**

Each class includes:
- ✅ Unique name (e.g., "Grade 1 A")
- ✅ Grade level (GRADE_1, etc.)
- ✅ Stream designation (A, B, C, D)
- ✅ Academic year (2025)
- ✅ Term (TERM_1)
- ✅ Capacity (40 students)
- ✅ Active status
- ✅ Not archived

## Running the Full Seed Pipeline

To set up a complete school from scratch:

```bash
# 1. First, create streams
npm run seed:streams

# 2. Then, create all classes for those streams
npm run seed:classes

# 3. (Optional) Seed other data like performance scales
npm run seed:performance-scales
```

## Database Query Examples

### Count total classes by grade:
```sql
SELECT grade, COUNT(*) as count FROM classes GROUP BY grade ORDER BY grade;
```

### View all classes for a specific branch:
```sql
SELECT name, grade, stream FROM classes 
WHERE "branchId" = 'your-branch-id' 
ORDER BY grade, stream;
```

### See class distribution by stream:
```sql
SELECT stream, COUNT(*) as count FROM classes 
WHERE "branchId" = 'your-branch-id' 
GROUP BY stream;
```

## Troubleshooting

### "No active schools found in database"
**Solution:** Create a school first using the admin interface or by running the main seed script.

### "No active branches found"
**Solution:** Create at least one active branch for the school.

### "Stream not found"
**Solution:** Run `npm run seed:streams` first to create streams A, B, C, D.

### Duplicate class errors
**Solution:** Classes already exist. The script automatically skips them. To recreate:
- Delete existing classes from the database
- Run the script again

## Modifying the Script

### To create only Stream A:
```typescript
const STREAMS = ['A'];
```

### To create for a different academic year:
```typescript
const ACADEMIC_YEAR = 2026;
```

### To change class capacity:
```typescript
const CLASS_CAPACITY = 35; // Smaller classes
```

### To use a different term:
```typescript
const CURRENT_TERM = 'TERM_2';
```

## Performance Notes

- Creating 72 classes per branch typically takes **2-5 seconds**
- Database operations are sequential for data consistency
- Total time depends on number of schools and branches

## Support

For issues or questions about this script, contact your development team or refer to the backend documentation.

---

**Last Updated:** February 1, 2026
**Version:** 1.0
