# Stream Management & Class Teacher Assignment Guide

## Part 1: Streams Management - Move from Settings to Facility Management

### Current State
- **Location**: Settings module (`src/components/auth/Settings/`)
- **Database Model**: Stream (in schema.prisma)
- **Context**: Streams are created per Branch (A, B, C, D, etc.)
- **Model Definition**:
```prisma
model Stream {
  id        String   @id @default(uuid())
  branchId  String
  name      String   // A, B, C, D
  active    Boolean  @default(true)
  archived  Boolean  @default(false)
  branch    Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)
  @@unique([branchId, name])
}
```

### Recommended Architecture

#### Backend:
1. **Create Stream Controller** (`server/src/controllers/stream.controller.ts`)
2. **Create Stream Routes** (`server/src/routes/stream.routes.ts`)
3. **Namespace**: `/api/facility/streams` (part of facility management)

#### Frontend:
1. **Create Stream Management Component** (`src/components/CBCGrading/pages/StreamManagement/`)
2. **Features**:
   - List streams per branch
   - Create new stream
   - Edit existing stream
   - Delete/archive stream
   - Toggle active/inactive

### Implementation Steps

#### Backend: Stream Controller
```typescript
// server/src/controllers/stream.controller.ts

import prisma from '../config/database';
import { ApiError } from '../utils/error.util';
import { Response } from 'express';
import { AuthRequest } from '../middleware/permissions.middleware';

export class StreamController {
  /**
   * GET /api/facility/streams?branchId=xyz
   * Get all streams for a branch
   */
  async getStreamsByBranch(req: AuthRequest, res: Response) {
    const { branchId } = req.query;
    if (!branchId) throw new ApiError(400, 'branchId is required');

    const streams = await prisma.stream.findMany({
      where: { branchId: branchId as string, archived: false },
      orderBy: { name: 'asc' }
    });

    res.json(streams);
  }

  /**
   * POST /api/facility/streams
   * Create new stream
   */
  async createStream(req: AuthRequest, res: Response) {
    const { branchId, name } = req.body;
    
    if (!branchId || !name) 
      throw new ApiError(400, 'branchId and name are required');

    const existing = await prisma.stream.findFirst({
      where: { branchId, name }
    });

    if (existing) 
      throw new ApiError(409, 'Stream already exists for this branch');

    const stream = await prisma.stream.create({
      data: { branchId, name, active: true }
    });

    res.status(201).json(stream);
  }

  /**
   * PUT /api/facility/streams/:streamId
   * Update stream
   */
  async updateStream(req: AuthRequest, res: Response) {
    const { streamId } = req.params;
    const { name, active } = req.body;

    const stream = await prisma.stream.update({
      where: { id: streamId },
      data: { name, active }
    });

    res.json(stream);
  }

  /**
   * DELETE /api/facility/streams/:streamId
   * Archive stream (soft delete)
   */
  async deleteStream(req: AuthRequest, res: Response) {
    const { streamId } = req.params;

    await prisma.stream.update({
      where: { id: streamId },
      data: { archived: true, archivedAt: new Date() }
    });

    res.json({ message: 'Stream archived' });
  }
}
```

#### Backend: Stream Routes
```typescript
// server/src/routes/stream.routes.ts

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permissions.middleware';
import { asyncHandler } from '../utils/async.util';
import { StreamController } from '../controllers/stream.controller';

const router = Router();
const controller = new StreamController();

// GET all streams for a branch
router.get(
  '/',
  authenticate,
  asyncHandler((req, res) => controller.getStreamsByBranch(req, res))
);

// POST new stream
router.post(
  '/',
  authenticate,
  requireRole(['ADMIN', 'HEAD_TEACHER']),
  asyncHandler((req, res) => controller.createStream(req, res))
);

// PUT update stream
router.put(
  '/:streamId',
  authenticate,
  requireRole(['ADMIN', 'HEAD_TEACHER']),
  asyncHandler((req, res) => controller.updateStream(req, res))
);

// DELETE archive stream
router.delete(
  '/:streamId',
  authenticate,
  requireRole(['ADMIN']),
  asyncHandler((req, res) => controller.deleteStream(req, res))
);

export default router;
```

---

## Part 2: Class Teacher Assignment

### Current State
- **Database**: Class model has optional `teacherId` field
- **Relation**: `teacher: User? @relation("ClassTeacher")`
- **Support**: Already supports NULL (no teacher assigned)

### Best Approach: Use Existing `teacherId` Field
✅ **Simplest** - No schema changes needed  
✅ **Non-breaking** - Already optional  
✅ **Efficient** - Single field, clean queries  

### API Endpoints

#### 1. Assign Teacher to Class
```
PUT /api/classes/:classId/teacher
Body: { teacherId: "user-id-or-null" }
```

#### 2. Get Class with Teacher Info
```
GET /api/classes/:classId
Response includes teacher: { id, firstName, lastName, email, phone }
```

#### 3. Remove Teacher from Class
```
DELETE /api/classes/:classId/teacher
(Sets teacherId to null)
```

### Implementation

#### Backend Update: Extend Class Controller
```typescript
// Add to server/src/controllers/class.controller.ts

/**
 * PUT /api/classes/:classId/teacher
 * Assign or update teacher for a class
 */
async assignTeacher(req: AuthRequest, res: Response) {
  const { classId } = req.params;
  const { teacherId } = req.body;

  // Validate teacher exists if provided
  if (teacherId) {
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, role: true }
    });

    if (!teacher) 
      throw new ApiError(404, 'Teacher not found');

    // Optionally: verify user is actually a teacher
    if (!['TEACHER', 'HEAD_TEACHER'].includes(teacher.role)) 
      throw new ApiError(400, 'User is not a teacher');
  }

  const updated = await prisma.class.update({
    where: { id: classId },
    data: { teacherId: teacherId || null },
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      }
    }
  });

  res.json(updated);
}

/**
 * DELETE /api/classes/:classId/teacher
 * Unassign teacher from class
 */
async unassignTeacher(req: AuthRequest, res: Response) {
  const { classId } = req.params;

  const updated = await prisma.class.update({
    where: { id: classId },
    data: { teacherId: null },
    include: {
      teacher: true
    }
  });

  res.json({ message: 'Teacher unassigned', class: updated });
}

/**
 * GET /api/classes/:classId/teacher
 * Get teacher assigned to class
 */
async getClassTeacher(req: AuthRequest, res: Response) {
  const { classId } = req.params;

  const classData = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true
        }
      }
    }
  });

  if (!classData) 
    throw new ApiError(404, 'Class not found');

  res.json(classData);
}
```

#### Frontend: Teacher Assignment Component
```jsx
// src/components/CBCGrading/pages/ClassTeacherAssignment/TeacherAssignmentModal.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const TeacherAssignmentModal = ({ classId, onClose, onSuccess }) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available teachers
    axios.get('/api/users?role=TEACHER')
      .then(res => setTeachers(res.data.data))
      .catch(err => console.error('Error fetching teachers:', err));
  }, []);

  const handleAssign = async () => {
    setLoading(true);
    try {
      await axios.put(`/api/classes/${classId}/teacher`, {
        teacherId: selectedTeacherId
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error assigning teacher:', err);
      alert(err.response?.data?.message || 'Failed to assign teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <h2>Assign Teacher to Class</h2>
      
      <select 
        value={selectedTeacherId || ''}
        onChange={(e) => setSelectedTeacherId(e.target.value || null)}
      >
        <option value="">-- No Teacher --</option>
        {teachers.map(teacher => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.firstName} {teacher.lastName}
          </option>
        ))}
      </select>

      <button onClick={handleAssign} disabled={loading}>
        {loading ? 'Assigning...' : 'Assign Teacher'}
      </button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};
```

---

## Migration Steps

### 1. Run Database Migration (for classCode field)
```bash
cd c:\Amalgamate\Projects\EDucore\server
npx prisma migrate dev --name add_class_code
# Or if schema is already updated:
npx prisma db push
```

### 2. Implement Stream Management
- [ ] Create stream.controller.ts
- [ ] Create stream.routes.ts
- [ ] Register routes in main server file
- [ ] Create frontend Stream Management component
- [ ] Move stream UI from Settings to Facility Management

### 3. Implement Teacher Assignment
- [ ] Add endpoints to class.controller.ts
- [ ] Add routes to class.routes.ts
- [ ] Create TeacherAssignmentModal component
- [ ] Integrate into ClassDetailPage or ClassForm

### 4. Update seed-stream-a.ts
```typescript
// Current error: prisma doesn't have stream model in extended client
// Solution: Use regular prismaClient instead of extended one
// Or migrate this to facility-management services
```

---

## Query Examples

### Get class with assigned teacher
```typescript
const classData = await prisma.class.findUnique({
  where: { id: classId },
  include: {
    teacher: {
      select: { id: true, firstName: true, lastName: true, email: true }
    },
    branch: true,
    enrollments: true
  }
});
```

### Find all classes taught by a teacher
```typescript
const teacherClasses = await prisma.class.findMany({
  where: { teacherId: "teacher-id" },
  include: { branch: true }
});
```

### Filter classes without a teacher
```typescript
const unassignedClasses = await prisma.class.findMany({
  where: { teacherId: null },
  include: { branch: true }
});
```

---

## Best Practices

✅ **Teacher Assignment**
- Keep it optional (don't force assignment)
- Allow changing teacher without affecting student enrollment
- Log teacher assignment changes for audit trail
- Validate teacher role before assignment

✅ **Stream Management**
- Archive instead of delete (preserves historical data)
- Use unique constraint: (branchId, name)
- Prevent using a stream with existing classes unless explicitly handling migration
- Display active/inactive visually in UI

✅ **Frontend UX**
- Show "No Teacher Assigned" state clearly
- Allow bulk operations (e.g., unassign teacher from multiple classes)
- Show teacher workload (number of classes per teacher)
- Implement search/filter for teacher selection
