# Assessment Forms Audit & Mobile-App Optimization Plan

**Date:** February 16, 2026  
**Status:** AUDIT REPORT - Implementation Ready  
**Focus:** Assessment Module - All Forms Optimization

---

## Executive Summary

The Assessment module currently has **5 major forms** that require optimization to feel like a native mobile app. The `SummativeTestForm` was recently restructured with Mobile/Desktop responsive patterns that should be replicated across all assessment forms.

**Key Finding:** Forms are currently traditional desktop-first layouts with poor mobile UX. The new SummativeTestForm pattern provides an excellent blueprint for app-like experience.

---

## Current Assessment Forms Inventory

### ✅ Already Optimized (Aug 2024)
| Form | Status | Approach | Lines | Notes |
|------|--------|----------|-------|-------|
| **SummativeTestForm** | ✅ Complete | Mobile-First + Desktop | 30-300 | Custom hook + Responsive Router |

### ❌ Requires Optimization (Priority Order)
| Form | Current LOC | Type | Key Issues |
|------|-------------|------|------------|
| **TermlyReportCommentsForm** | 627 | Report Comments | Tabbed design, scrolls unnaturally, no fixed header/footer |
| **CoCurricularActivitiesForm** | 587 | Dynamic List | Complex add/remove logic, poor mobile scrolling |
| **CoreCompetenciesForm** | 470 | Rating Form | Large data set, table-like layout, cramped fields |
| **ValuesAssessmentForm** | 562 | Values Assessment | 7 value sets, complex indicator lists, vertical overflow |

---

## Current Architecture Issues

### SummativeTestForm (✅ Good Example)
```
✅ Uses Custom Hook (useSummativeTestForm)
✅ Fixed sticky header with back button
✅ Sticky footer with Save/Cancel buttons  
✅ Mobile viewport detection
✅ Large touch targets (py-2.5, text-base)
✅ Minimal, focused layout
✅ Auto-scrolling within form, not page
✅ Loading states handled gracefully
✅ Error consolidation at top
✅ Responsive classes (hidden md:, block md:)
```

### Other Forms (❌ Issues)
```
❌ No custom hooks - all logic inline
❌ Traditional desktop form layout
❌ No fixed positioning for header/footer
❌ Viewport detection not implemented
❌ Inline validation scattered throughout
❌ Multiple save buttons or unclear save flow
❌ Table/grid layouts not mobile-friendly
❌ No progress indication
❌ Long scrolling pages without structure
❌ Color/styling inconsistencies
```

---

## Implementation Plan

### Phase 1: Create Custom Hooks (Week 1)
Create dedicated hooks for business logic:

| Hook Name | Purpose | Forms |
|-----------|---------|-------|
| `useValuesAssessment` | 7 national values state + validation | ValuesAssessmentForm |
| `useCoreMompetenties` | 6 core competencies state + validation | CoreCompetenciesForm |
| `useCoCurricularActivities` | Dynamic activities list management | CoCurricularActivitiesForm |
| `useTermlyReportComments` | Tabbed subject comments state | TermlyReportCommentsForm |

**Benefits:**
- Separates business logic from UI
- Reusable across mobile/desktop versions
- Easier testing
- Single source of truth

### Phase 2: Refactor Forms to Mobile-First (Week 2-3)

For each form, create 3 files (following SummativeTestForm pattern):

```
src/pages/assessments/

// 1. Mobile-optimized version (app-like)
ValuesAssessmentFormMobile.jsx  
CoreCompetenciesFormMobile.jsx  
CoCurricularActivitiesFormMobile.jsx  
TermlyReportCommentsFormMobile.jsx  

// 2. Desktop-optimized version (rich layout)
ValuesAssessmentFormDesktop.jsx  
CoreCompetenciesFormDesktop.jsx  
CoCurricularActivitiesFormDesktop.jsx  
TermlyReportCommentsFormDesktop.jsx  

// 3. Responsive router
ValuesAssessmentForm.jsx  
CoreCompetenciesForm.jsx  
CoCurricularActivitiesForm.jsx  
TermlyReportCommentsForm.jsx  
```

### Phase 3: Implement App-Like Features

#### Mobile Version Features (All Forms)
```jsx
// 1. Fixed Header
<div className="fixed top-0 left-0 right-0 bg-white border-b sticky z-20">
  <button onClick={onBack}><ArrowLeft /></button>
  <h1>Form Title</h1>
</div>

// 2. Scrollable Content (pb-24 for footer space)
<form className="flex-1 overflow-y-auto pb-24 pt-16">
  {/* form fields */}
</form>

// 3. Sticky Footer (Save/Cancel)
<div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-2">
  <button>Cancel</button>
  <button>Save</button>
</div>

// 4. Large Touch Targets
- py-2.5 for buttons (standard)
- py-3 for sticky footer buttons
- text-base for form inputs (not text-sm)
- rounded-lg for buttons/inputs

// 5. Loading States
<div className="flex items-center gap-2 text-blue-600">
  <Loader className="animate-spin" />
  <span>Saving...</span>
</div>
```

#### Desktop Version Features (All Forms)
```jsx
// Grid layout (3-column on desktop)
<div className="grid grid-cols-3 gap-4">
  {/* form fields */}
</div>

// No fixed positioning - normal scroll
// Rich sidebar with instructions
// Status indicators in header
// Better use of horizontal space
```

---

## Form-Specific Optimization Details

### 1. ValuesAssessmentForm (562 LOC)
**Current:** All 7 values on one long scrollable page  
**Optimized (Mobile):**
- Accordion-style collapsible values
- One value card at a time when expanded
- Larger rating buttons
- Evidence textareas with character count
- Save progress indication after each value

**Optimized (Desktop):**
- 2 values per row
- Side-by-side indicators
- Grid layout for ratings
- Instructions panel on right

### 2. CoreCompetenciesForm (470 LOC)
**Current:** Table-like layout with many columns  
**Optimized (Mobile):**
- One competency per card
- Vertical stacking of rating, evidence, comment
- Card-based design with expand/collapse
- Large rating radio buttons
- Swipeable cards (optional)

**Optimized (Desktop):**
- Full table view with sortable columns
- Color-coded performance levels
- Inline editing
- Print-friendly layout

### 3. CoCurricularActivitiesForm (587 LOC)
**Current:** Dynamic list with inline add/remove buttons  
**Optimized (Mobile):**
- Card-based activity list
- Floating action button (+) to add activities
- Swipe to delete (or trailing delete icon)
- Activity details in modal or slide panel
- Smooth animations

**Optimized (Desktop):**
- Table view with columns
- Batch operations (select multiple, delete)
- Inline editing with quick-save
- Export to PDF

### 4. TermlyReportCommentsForm (627 LOC)
**Current:** Tabbed interface with subject comments  
**Optimized (Mobile):**
- Scrollable subject cards (not tabs)
- Auto-save after each subject
- Stack-based navigation (back to list)
- Show completion progress (4/8 subjects done)
- Subject icons for quick identification

**Optimized (Desktop):**
- Tabs at top
- Split-view: subjects on left, editor on right
- Rich text editor with suggestions
- Comment templates sidebar
- Live preview of report

---

## Technical Architecture

### Custom Hook Pattern (Example: useValuesAssessment)

```typescript
export const useValuesAssessment = (initialData = null) => {
  const [formData, setFormData] = useState({
    studentId: '',
    assessmentDate: new Date(),
    values: [ /* 7 values */ ]
  });
  
  const [errors, setErrors] = useState({});
  const [saveStatus, setStatus] = useState('idle'); // idle | saving | success | error
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => { /* ... */ };
  const handleValueChange = (valueId, field, value) => { /* ... */ };
  const validateForm = () => { /* ... */ };
  const handleSubmit = async () => { /* API call */ };
  const resetForm = () => { /* ... */ };

  return {
    formData, setFormData,
    errors, setErrors,
    saveStatus, setSaveStatus,
    loading, setLoading,
    handleInputChange,
    handleValueChange,
    validateForm,
    handleSubmit,
    resetForm
  };
};
```

### Component Structure

```jsx
// Mobile Component
<ValuesAssessmentFormMobile>
  - Uses useValuesAssessment hook
  - Fixed header + sticky footer
  - Accordion cards for values
  - Mobile-optimized inputs
</ValuesAssessmentFormMobile>

// Desktop Component  
<ValuesAssessmentFormDesktop>
  - Same hook
  - Different UI (2-column grid)
  - More information visible
  - Rich formatting
</ValuesAssessmentFormDesktop>

// Router Component
<ValuesAssessmentForm>
  - Viewport detection
  - Renders Mobile or Desktop
  - Passes through props
</ValuesAssessmentForm>
```

---

## Implementation Timeline

| Week | Task | Status |
|------|------|--------|
| Week 1 | Create 4 custom hooks | 📝 Ready to Start |
| Week 2 | Create Mobile versions (all 4) | 📝 Ready to Start |
| Week 2 | Create Desktop versions (all 4) | 📝 Ready to Start |
| Week 3 | Create Router components | 📝 Ready to Start |
| Week 3 | Testing & refinement | 📝 Ready to Start |
| Week 4 | Auto-deploy & monitor | 📝 Ready to Start |

---

## Success Metrics

- ✅ All forms have app-like appearance on mobile
- ✅ Large touch targets (> 44px height)
- ✅ Fixed header + sticky footer on all forms
- ✅ No horizontal scrolling on mobile
- ✅ Forms save in < 2 seconds
- ✅ Loading states clearly visible
- ✅ Error messages highlighted at top
- ✅ Desktop users see optimized multi-column layouts
- ✅ Shared business logic via hooks

---

## Code Example: Side-by-Side Comparison

### BEFORE (Traditional)
```jsx
const CoreCompetenciesForm = () => {
  const [formData, setFormData] = useState({...});
  // 400+ lines inline
  return (
    <div>
      <table className="w-full">
        {/* Complex table with many columns */}
      </table>
      <button>Save</button>
    </div>
  );
};
```

### AFTER (Mobile-App Style)
```jsx
// 1. Custom Hook (separate file)
const { formData, errors, saveStatus, handleValueChange, handleSubmit } 
  = useCoreCompetencies();

// 2. Mobile Component
const CoreCompetenciesFormMobile = ({ onBack }) => (
  <div className="fixed inset-0 flex flex-col">
    {/* Fixed Header */}
    <CompetencyHeader onBack={onBack} />
    
    {/* Scrollable Cards */}
    <form className="flex-1 overflow-y-auto pb-24">
      {formData.competencies.map(comp => (
        <CompetencyCard 
          competency={comp}
          onChange={handleValueChange}
        />
      ))}
    </form>
    
    {/* Sticky Footer */}
    <FormFooter onSave={handleSubmit} saving={saveStatus === 'saving'} />
  </div>
);
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Forms too different from current | Keep same data structures, only UI changes |
| Breaking existing functionality | Keep separate files, migrate gradually |
| Accessibility issues | Test with keyboard navigation, screen readers |
| Performance degradation | Profile before/after, lazy-load large datasets |
| Teacher training needed | Make UI intuitive, add tooltips, help text |

---

## Next Steps

1. **Review this plan** → Confirm priorities
2. **Start Phase 1** → Create 4 custom hooks
3. **Create Mobile versions** → One form at a time
4. **Deploy to staging** → Test on real devices
5. **GA Deploy** → Rollout to teachers with features flag

---

**Questions?** This plan is modular - each form can be completed independently in 2-3 days once the hook is ready.

