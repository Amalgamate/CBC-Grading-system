// ============================================
// PERFORMANCE SCALES - QUICK REFERENCE
// ============================================

/**
 * Quick reference for using Performance Scales in EDucore
 * Copy and paste these snippets as needed
 */

// ============================================
// 1. IMPORT THE COMPONENT
// ============================================

import PerformanceScales from './components/EDucore/admin/PerformanceScales';

// ============================================
// 2. ADD TO ROUTES
// ============================================

// React Router v6
<Route path="/admin/performance-scales" element={<PerformanceScales />} />

// Or with layout
<Route path="/admin" element={<AdminLayout />}>
  <Route path="performance-scales" element={<PerformanceScales />} />
</Route>

// ============================================
// 3. NAVIGATION LINK
// ============================================

// Simple Link
<Link to="/admin/performance-scales">Performance Scales</Link>

// NavLink with active state
<NavLink 
  to="/admin/performance-scales"
  className={({ isActive }) => isActive ? 'active' : ''}
>
  Performance Scales
</NavLink>

// With icon (lucide-react)
import { Scale } from 'lucide-react';

<NavLink to="/admin/performance-scales">
  <Scale className="w-5 h-5" />
  <span>Performance Scales</span>
</NavLink>

// ============================================
// 4. USE THE SERVICE DIRECTLY
// ============================================

import performanceScaleService from './services/api/performanceScaleService';

// Get all scales
const scales = await performanceScaleService.getPerformanceScales(schoolId);

// Create scale
const newScale = await performanceScaleService.createPerformanceScale({
  schoolId,
  name: 'Grade 1 - Mathematics',
  type: 'CBC',
  active: true,
  ranges: [/* ... */]
});

// Update scale
await performanceScaleService.updatePerformanceScale(scaleId, updateData);

// Delete scale
await performanceScaleService.deletePerformanceScale(scaleId);

// ============================================
// 5. EXAMPLE SCALE DATA
// ============================================

const cbcScale = {
  schoolId: 'school-uuid',
  name: 'Grade 1 - Mathematics',
  type: 'CBC',
  active: true,
  isDefault: false,
  ranges: [
    {
      label: 'Level 4',
      minPercentage: 80,
      maxPercentage: 100,
      points: 4,
      color: '#10b981',
      description: 'Exceeds expectations - demonstrates mastery',
      rubricRating: 'EE1'
    },
    {
      label: 'Level 3',
      minPercentage: 50,
      maxPercentage: 79,
      points: 3,
      color: '#3b82f6',
      description: 'Meets expectations - proficient performance',
      rubricRating: 'ME1'
    },
    {
      label: 'Level 2',
      minPercentage: 30,
      maxPercentage: 49,
      points: 2,
      color: '#f59e0b',
      description: 'Approaches expectations - developing skills',
      rubricRating: 'AE1'
    },
    {
      label: 'Level 1',
      minPercentage: 0,
      maxPercentage: 29,
      points: 1,
      color: '#ef4444',
      description: 'Below expectations - needs support',
      rubricRating: 'BE1'
    }
  ]
};

const summativeScale = {
  schoolId: 'school-uuid',
  name: 'Standard Summative Grading',
  type: 'SUMMATIVE',
  active: true,
  isDefault: true,
  ranges: [
    { label: 'A', minPercentage: 80, maxPercentage: 100, points: 12, color: '#10b981', summativeGrade: 'A' },
    { label: 'A-', minPercentage: 75, maxPercentage: 79, points: 11, color: '#059669', summativeGrade: 'A_MINUS' },
    { label: 'B+', minPercentage: 70, maxPercentage: 74, points: 10, color: '#3b82f6', summativeGrade: 'B_PLUS' },
    { label: 'B', minPercentage: 65, maxPercentage: 69, points: 9, color: '#2563eb', summativeGrade: 'B' },
    { label: 'B-', minPercentage: 60, maxPercentage: 64, points: 8, color: '#1d4ed8', summativeGrade: 'B_MINUS' },
    { label: 'C+', minPercentage: 55, maxPercentage: 59, points: 7, color: '#f59e0b', summativeGrade: 'C_PLUS' },
    { label: 'C', minPercentage: 50, maxPercentage: 54, points: 6, color: '#d97706', summativeGrade: 'C' },
    { label: 'C-', minPercentage: 45, maxPercentage: 49, points: 5, color: '#b45309', summativeGrade: 'C_MINUS' },
    { label: 'D+', minPercentage: 40, maxPercentage: 44, points: 4, color: '#ef4444', summativeGrade: 'D_PLUS' },
    { label: 'D', minPercentage: 35, maxPercentage: 39, points: 3, color: '#dc2626', summativeGrade: 'D' },
    { label: 'D-', minPercentage: 30, maxPercentage: 34, points: 2, color: '#b91c1c', summativeGrade: 'D_MINUS' },
    { label: 'E', minPercentage: 0, maxPercentage: 29, points: 1, color: '#991b1b', summativeGrade: 'E' }
  ]
};

// ============================================
// 6. CBC RUBRIC RATINGS
// ============================================

const cbcRubricRatings = [
  'EE1', 'EE2', 'EE3', 'EE4',  // Exceeds Expectations - Level 4
  'ME1', 'ME2', 'ME3', 'ME4',  // Meets Expectations - Level 3
  'AE1', 'AE2', 'AE3', 'AE4',  // Approaches Expectations - Level 2
  'BE1', 'BE2', 'BE3', 'BE4'   // Below Expectations - Level 1
];

// ============================================
// 7. SUMMATIVE GRADES
// ============================================

const summativeGrades = [
  'A', 'A_MINUS',           // 80-100, 75-79
  'B_PLUS', 'B', 'B_MINUS', // 70-74, 65-69, 60-64
  'C_PLUS', 'C', 'C_MINUS', // 55-59, 50-54, 45-49
  'D_PLUS', 'D', 'D_MINUS', // 40-44, 35-39, 30-34
  'E'                       // 0-29
];

// ============================================
// 8. PERMISSION CHECK EXAMPLE
// ============================================

import { useAuth } from './contexts/AuthContext';

const ProtectedPerformanceScales = () => {
  const { user } = useAuth();
  
  // Check if user has permission
  if (!['ADMIN', 'HEAD_TEACHER'].includes(user.role)) {
    return <div>Access Denied</div>;
  }
  
  return <PerformanceScales />;
};

// ============================================
// 9. CUSTOM HOOK FOR SCALES
// ============================================

import { useState, useEffect } from 'react';
import performanceScaleService from './services/api/performanceScaleService';

export const usePerformanceScales = (schoolId) => {
  const [scales, setScales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadScales();
  }, [schoolId]);

  const loadScales = async () => {
    try {
      setLoading(true);
      const data = await performanceScaleService.getPerformanceScales(schoolId);
      setScales(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { scales, loading, error, reload: loadScales };
};

// Usage:
const { scales, loading, error, reload } = usePerformanceScales(schoolId);

// ============================================
// 10. UTILITY FUNCTIONS
// ============================================

// Get grade for a percentage
export const getGradeForPercentage = (percentage, scale) => {
  if (!scale || !scale.ranges) return null;
  
  const range = scale.ranges.find(r => 
    percentage >= r.minPercentage && percentage <= r.maxPercentage
  );
  
  return range ? {
    label: range.label,
    points: range.points,
    color: range.color,
    rubricRating: range.rubricRating,
    summativeGrade: range.summativeGrade
  } : null;
};

// Get default scale for type
export const getDefaultScale = (scales, type = 'CBC') => {
  return scales.find(s => s.type === type && s.isDefault) || 
         scales.find(s => s.type === type && s.active);
};

// Validate scale data
export const validateScale = (scale) => {
  const errors = [];
  
  if (!scale.name?.trim()) {
    errors.push('Scale name is required');
  }
  
  if (!scale.ranges || scale.ranges.length === 0) {
    errors.push('At least one range is required');
  }
  
  scale.ranges?.forEach((range, index) => {
    if (range.minPercentage > range.maxPercentage) {
      errors.push(`Range ${index + 1}: min cannot be greater than max`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================
// 11. SIDEBAR MENU ITEM
// ============================================

import { Scale } from 'lucide-react';

const menuItems = [
  {
    id: 'performance-scales',
    label: 'Performance Scales',
    icon: Scale,
    path: '/admin/performance-scales',
    roles: ['ADMIN', 'HEAD_TEACHER']
  }
];

// Render:
{menuItems.map(item => {
  const Icon = item.icon;
  return (
    <NavLink
      key={item.id}
      to={item.path}
      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100"
    >
      <Icon className="w-5 h-5" />
      <span>{item.label}</span>
    </NavLink>
  );
})}

// ============================================
// 12. API ENDPOINTS
// ============================================

/**
 * Backend API Endpoints (already implemented):
 * 
 * GET    /api/grading/school/:schoolId      - Get all scales for school
 * POST   /api/grading/system                - Create new scale
 * PUT    /api/grading/system/:id            - Update scale
 * DELETE /api/grading/system/:id            - Delete scale
 * POST   /api/grading/range                 - Create range
 * PUT    /api/grading/range/:id             - Update range
 * DELETE /api/grading/range/:id             - Delete range
 */

// ============================================
// 13. ENVIRONMENT SETUP
// ============================================

/**
 * Add to .env file:
 * 
 * REACT_APP_API_URL=http://localhost:5000
 * 
 * Backend will need:
 * DATABASE_URL=postgresql://user:pass@localhost:5432/educore
 */

// ============================================
// 14. TESTING SNIPPET
// ============================================

// Manual test in browser console:
const testScaleAPI = async () => {
  const schoolId = 'your-school-id';
  
  try {
    // Get scales
    console.log('Fetching scales...');
    const scales = await performanceScaleService.getPerformanceScales(schoolId);
    console.log('Scales:', scales);
    
    // Create test scale
    console.log('Creating test scale...');
    const newScale = await performanceScaleService.createPerformanceScale({
      schoolId,
      name: 'Test Scale',
      type: 'CBC',
      active: true,
      ranges: [
        { label: 'Test', minPercentage: 0, maxPercentage: 100, points: 4, color: '#10b981', rubricRating: 'EE1' }
      ]
    });
    console.log('Created:', newScale);
    
    // Clean up
    await performanceScaleService.deletePerformanceScale(newScale.id);
    console.log('Test complete!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run in console: testScaleAPI()

// ============================================
// 15. COLOR PALETTE
// ============================================

const gradeColors = {
  excellent: '#10b981',  // Green
  good: '#3b82f6',       // Blue
  average: '#f59e0b',    // Amber
  poor: '#ef4444',       // Red
  
  // Alternative palette
  level4: '#10b981',     // Exceeds
  level3: '#3b82f6',     // Meets
  level2: '#f59e0b',     // Approaches
  level1: '#ef4444'      // Below
};

// ============================================
// END OF QUICK REFERENCE
// ============================================

/**
 * For more details, see:
 * - PERFORMANCE_SCALES_FEATURE.md
 * - INTEGRATION_GUIDE_PERFORMANCE_SCALES.js
 * - IMPLEMENTATION_SUMMARY_PERFORMANCE_SCALES.md
 */
