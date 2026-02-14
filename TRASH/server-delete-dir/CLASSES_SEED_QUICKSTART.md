# 🎓 Classes Seeding - Quick Start Guide

## What This Does

Creates all classes for every grade (Creche through Grade 12) with multiple streams (A, B, C, D) in your database.

**Example:** Creates classes like "Grade 1 A", "Grade 1 B", "Grade 1 C", "Grade 1 D" for each grade level.

---

## 🚀 How to Use

### Step 1: Ensure Prerequisites
Make sure you have:
- ✅ At least one active school in the database
- ✅ At least one active branch per school
- ✅ Streams created (run `npm run seed:streams` first)

### Step 2: Run the Seed

```bash
cd server
npm run seed:classes
```

**That's it!** The script will:
1. Find all active schools
2. Find all active branches in each school
3. Create classes for all 18 grades
4. Create each grade in all 4 streams (A, B, C, D)
5. Show a detailed report

---

## 📊 What Gets Created

### Per Branch:
- **18 Grades** (Creche, Reception, PP1, PP2, Grade 1-12, Transition, Playgroup)
- **4 Streams** per grade (A, B, C, D)
- **Total: 72 classes per branch**

### Example Classes Created:
```
Creche A, Creche B, Creche C, Creche D
Reception A, Reception B, Reception C, Reception D
...
Grade 1 A, Grade 1 B, Grade 1 C, Grade 1 D
Grade 2 A, Grade 2 B, Grade 2 C, Grade 2 D
...
Grade 12 A, Grade 12 B, Grade 12 C, Grade 12 D
```

---

## ⚙️ Customization

Edit `server/prisma/seed-classes.ts` to change:

```typescript
// Line 18-21
const STREAMS = ['A', 'B'];           // Only create A and B streams
const ACADEMIC_YEAR = 2026;           // Different year
const CURRENT_TERM = 'TERM_2';        // Different term
const CLASS_CAPACITY = 35;            // Smaller class sizes
```

---

## 📋 Example Output

```
🌱 Starting classes seed...

📋 Configuration:
   Streams: A, B, C, D
   Academic Year: 2025
   Total Grades: 18
   Classes to Create: 72 per branch

🏫 School: Zawadi JRN Academy
   📍 Found 2 branch(es)
   
   📌 Branch: Main Campus (KB)
      ✅ Created: Creche A
      ✅ Created: Creche B
      ✅ Created: Creche C
      ✅ Created: Creche D
      [... 68 more classes ...]
      
      📊 Branch Summary:
         Created: 72
         Skipped: 0

📊 FINAL SUMMARY:
   Schools processed: 1
   Total classes created: 144
   Total classes skipped: 0

✨ Classes seeding completed successfully!
```

---

## 🔄 Full Setup Pipeline

To set up a complete school from scratch:

```bash
# 1. Create streams
npm run seed:streams

# 2. Create all classes for those streams
npm run seed:classes

# 3. (Optional) Seed other data
npm run seed:performance-scales
```

---

## ✅ Verification

After running the seed, verify in database:

```sql
-- Count total classes
SELECT COUNT(*) FROM classes;

-- See classes by grade
SELECT grade, COUNT(*) FROM classes GROUP BY grade;

-- See classes by stream
SELECT stream, COUNT(*) FROM classes GROUP BY stream;

-- See all Grade 1 classes
SELECT * FROM classes WHERE grade = 'GRADE_1';
```

---

## ❓ FAQ

**Q: Script says "already exists"?**
A: Classes were already created. The script skips duplicates to avoid errors.

**Q: How do I recreate classes?**
A: Delete them from database first, then run the script again.

**Q: Can I create only Stream A?**
A: Yes, change `const STREAMS = ['A'];` in the script.

**Q: How long does it take?**
A: Usually 2-5 seconds per branch.

**Q: What if I have errors?**
A: Check that school and branches are active. Run `npm run seed:streams` first.

---

## 📁 Related Files

- Script: `server/prisma/seed-classes.ts`
- Documentation: `CLASSES_SEED_DOCUMENTATION.md`
- Package script: `server/package.json` → `seed:classes`

---

**Ready to create classes? Run:** `npm run seed:classes`
