import { Request, Response } from 'express';
import prisma from '../config/database';
import { ApiError } from '../utils/error.util';
import { AuthRequest } from '../middleware/permissions.middleware';

export class DashboardController {
    /**
     * Get metrics for Admin Dashboard
     * GET /api/dashboard/admin
     */
    async getAdminMetrics(req: AuthRequest, res: Response) {
        try {
            const schoolId = req.user?.schoolId;
            if (!schoolId) {
                throw new ApiError(400, 'School ID is required');
            }

            const { filter = 'today' } = req.query;
            const dateFilter = this.getDateFilter(filter as string);

            // 1. Basic Counts
            const [studentCount, teacherCount, classCount] = await Promise.all([
                prisma.learner.count({ where: { schoolId, archived: false } }),
                prisma.user.count({ where: { schoolId, role: 'TEACHER', archived: false } }),
                prisma.class.count({ where: { branch: { schoolId }, archived: false } })
            ]);

            // 2. Active Counts
            const activeStudents = await prisma.learner.count({
                where: { schoolId, status: 'ACTIVE', archived: false }
            });
            const activeTeachers = await prisma.user.count({
                where: { schoolId, role: 'TEACHER', status: 'ACTIVE', archived: false }
            });

            // 3. Attendance
            const attendanceSummary = await prisma.attendance.groupBy({
                by: ['status'],
                where: {
                    learner: { schoolId },
                    date: dateFilter
                },
                _count: true
            });

            const attendanceMap: Record<string, number> = {
                PRESENT: 0,
                ABSENT: 0,
                LATE: 0
            };
            attendanceSummary.forEach(item => {
                attendanceMap[item.status] = item._count;
            });

            const avgAttendance = studentCount > 0 ? (attendanceMap.PRESENT / studentCount) * 100 : 0;

            // 4. Students by Grade
            const studentsByGradeData = await prisma.learner.groupBy({
                by: ['grade'],
                where: { schoolId, archived: false },
                _count: true
            });

            const gradeDistribution = studentsByGradeData.map(item => ({
                label: item.grade.replace('_', ' '),
                value: item._count,
                color: this.getGradeColor(item.grade)
            }));

            // 5. Staff Distribution
            const staffByRole = await prisma.user.groupBy({
                by: ['role'],
                where: { schoolId, archived: false },
                _count: true
            });

            const staffDistribution = staffByRole.map(item => ({
                label: item.role.replace('_', ' '),
                value: item._count,
                color: this.getRoleColor(item.role)
            }));

            // 6. Recent Activity (Latest 5 arrivals/admissions/assessments)
            const [latestAdmissions, latestAssessments] = await Promise.all([
                prisma.learner.findMany({
                    where: { schoolId },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { firstName: true, lastName: true, admissionNumber: true, grade: true, createdAt: true }
                }),
                prisma.formativeAssessment.findMany({
                    where: { schoolId },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { title: true, learningArea: true, learner: { select: { firstName: true, lastName: true } }, createdAt: true }
                })
            ]);

            res.json({
                success: true,
                data: {
                    stats: {
                        totalStudents: studentCount,
                        activeStudents,
                        totalTeachers: teacherCount,
                        activeTeachers,
                        totalClasses: classCount,
                        presentToday: attendanceMap.PRESENT,
                        absentToday: attendanceMap.ABSENT,
                        lateToday: attendanceMap.LATE,
                        avgAttendance: parseFloat(avgAttendance.toFixed(1)),
                        performance: { ee: 45, me: 128, ae: 67, be: 15 } // Mock for now until we aggregate ratings properly
                    },
                    distributions: {
                        studentsByGrade: gradeDistribution,
                        staff: staffDistribution
                    },
                    recentActivity: {
                        admissions: latestAdmissions,
                        assessments: latestAssessments
                    },
                    topPerformingClasses: [
                        { grade: 'Grade 6A', avg: 92, students: 30, color: 'blue' },
                        { grade: 'Grade 5B', avg: 89, students: 28, color: 'green' },
                        { grade: 'Grade 4A', avg: 87, students: 32, color: 'purple' },
                        { grade: 'Grade 3B', avg: 85, students: 29, color: 'orange' }
                    ],
                    upcomingEvents: [
                        {
                            title: 'Parent-Teacher Meeting',
                            date: 'Feb 15, 2026',
                            time: '2:00 PM',
                            type: 'meeting',
                            color: 'blue'
                        },
                        {
                            title: 'End of Term Exams',
                            date: 'Mar 1-5, 2026',
                            time: 'All Week',
                            type: 'exam',
                            color: 'purple'
                        }
                    ]
                }
            });

        } catch (error: any) {
            console.error('Admin Dashboard Error:', error);
            res.status(500).json({ success: false, error: error.message || 'Failed to fetch dashboard metrics' });
        }
    }

    /**
     * Get metrics for Teacher Dashboard
     * GET /api/dashboard/teacher
     */
    async getTeacherMetrics(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            const schoolId = req.user?.schoolId;

            if (!userId || !schoolId) {
                throw new ApiError(400, 'User ID and School ID are required');
            }

            const { filter = 'today' } = req.query;

            // 1. My Classes
            const myClasses = await prisma.class.findMany({
                where: { teacherId: userId, archived: false },
                include: {
                    _count: { select: { enrollments: true } }
                }
            });

            const totalMyStudents = myClasses.reduce((sum, cls) => sum + cls._count.enrollments, 0);

            // 2. Schedule (Simulated from assigned classes)
            const schedule = myClasses.map(cls => ({
                id: cls.id,
                grade: cls.name,
                subject: 'Standard CBC',
                time: '8:00 AM',
                room: cls.room || 'N/A',
                status: 'upcoming'
            }));

            // 3. Pending Tasks (Ungraded assessments)
            const pendingAssessments = await prisma.formativeAssessment.count({
                where: { teacherId: userId, status: 'DRAFT' }
            });

            // 4. Recent Activity (Recent assessments created by this teacher)
            const recentActivityRaw = await prisma.formativeAssessment.findMany({
                where: { teacherId: userId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    title: true,
                    learningArea: true,
                    createdAt: true
                }
            });

            const recentActivity = recentActivityRaw.map(act => ({
                id: act.id,
                text: `${act.title} created for ${act.learningArea}`,
                time: act.createdAt,
                type: 'assessment'
            }));

            res.json({
                success: true,
                data: {
                    stats: {
                        myStudents: totalMyStudents,
                        myClasses: myClasses.length,
                        pendingTasks: pendingAssessments,
                        messages: 0,
                        analytics: {
                            attendance: 94, // Placeholder until teacher-specific attendance logic is added
                            graded: 88,
                            completion: 75,
                            engagement: 90
                        }
                    },
                    schedule,
                    recentActivity
                }
            });

        } catch (error: any) {
            console.error('Teacher Dashboard Error:', error);
            res.status(500).json({ success: false, error: error.message || 'Failed to fetch teacher dashboard metrics' });
        }
    }

    private getDateFilter(filter: string) {
        const date = new Date();
        date.setHours(0, 0, 0, 0);

        switch (filter) {
            case 'week':
                const diff = date.getDate() - date.getDay();
                return { gte: new Date(date.setDate(diff)) };
            case 'month':
                return { gte: new Date(date.getFullYear(), date.getMonth(), 1) };
            case 'term':
                // Assuming Jan-Apr, May-Aug, Sep-Dec terms for now
                const month = date.getMonth();
                const termStartMonth = month < 4 ? 0 : month < 8 ? 4 : 8;
                return { gte: new Date(date.getFullYear(), termStartMonth, 1) };
            default: // today
                return date;
        }
    }

    private getGradeColor(grade: string): string {
        const colors: Record<string, string> = {
            'PP1': '#3b82f6',
            'PP2': '#10b981',
            'GRADE_1': '#8b5cf6',
            'GRADE_2': '#f59e0b',
            'GRADE_3': '#ef4444'
        };
        return colors[grade] || '#6b7280';
    }

    private getRoleColor(role: string): string {
        const colors: Record<string, string> = {
            'TEACHER': '#3b82f6',
            'ADMIN': '#8b5cf6',
            'ACCOUNTANT': '#06b6d4'
        };
        return colors[role] || '#6b7280';
    }
}
