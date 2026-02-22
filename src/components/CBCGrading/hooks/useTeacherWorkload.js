import { useState, useEffect, useCallback, useMemo } from 'react';
import { classAPI } from '../../../services/api';
import { useAuth } from '../../../hooks/useAuth';

/**
 * useTeacherWorkload Hook
 * Fetches and manages the assigned classes and subject schedules for a teacher.
 * Useful for restricting UI selections to only what the teacher is assigned to.
 */
export const useTeacherWorkload = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [workload, setWorkload] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [error, setError] = useState(null);

    const teacherId = user?.userId;
    const isTeacher = user?.role === 'TEACHER';

    const fetchWorkload = useCallback(async () => {
        if (!teacherId || !isTeacher) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [workloadResp, schedulesResp] = await Promise.all([
                classAPI.getTeacherWorkload(teacherId),
                classAPI.getTeacherSchedules(teacherId)
            ]);

            setWorkload(workloadResp.data || workloadResp);
            setSchedules(schedulesResp.data || schedulesResp || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching teacher workload:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [teacherId, isTeacher]);

    useEffect(() => {
        fetchWorkload();
    }, [fetchWorkload]);

    // Assigned grades list (unique)
    const assignedGrades = useMemo(() => {
        if (!workload?.classes) return [];
        return [...new Set(workload.classes.map(c => c.grade))];
    }, [workload]);

    // Check if assigned to a specific grade
    const isAssignedToGrade = useCallback((grade) => {
        if (!isTeacher) return true; // Admin/HoC always "assigned"
        return assignedGrades.includes(grade);
    }, [isTeacher, assignedGrades]);

    // Get subjects for a specific grade
    const getAssignedSubjectsForGrade = useCallback((grade) => {
        if (!isTeacher) return null; // Admin/HoC sees all (null means don't filter)

        const gradeSchedules = schedules.filter(s =>
            s.class?.grade === grade || s.grade === grade
        );
        return [...new Set(gradeSchedules.map(s => s.subject))];
    }, [isTeacher, schedules]);

    // Check if the teacher has any assignments at all
    const hasAnyAssignments = useMemo(() => {
        if (!isTeacher) return true;
        return (workload?.classCount > 0) || (schedules.length > 0);
    }, [isTeacher, workload, schedules]);

    return {
        workload,
        schedules,
        assignedGrades,
        loading,
        error,
        isTeacher,
        isAssignedToGrade,
        getAssignedSubjectsForGrade,
        hasAnyAssignments,
        refresh: fetchWorkload
    };
};

export default useTeacherWorkload;
