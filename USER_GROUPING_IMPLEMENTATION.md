# User Management - User Grouping Implementation

## Overview
Added user grouping functionality to the UserManagement component to organize system users into categorized tabs: **Parents**, **Tutors/Teachers**, and **Admins**.

## Changes Made

### File Modified
- `src/components/CBCGrading/pages/settings/UserManagement.jsx`

### Features Added

#### 1. **User Group State Management**
```jsx
const [userGroupTab, setUserGroupTab] = useState('all'); // 'all', 'parents', 'tutors', 'admins'
```
- Tracks which user group is currently being viewed
- Defaults to 'all' showing all users

#### 2. **User Grouping Functions**
```jsx
const getAdminUsers = () => users.filter(u => ['SUPER_ADMIN', 'ADMIN'].includes(u.role) && !u.archived);
const getTutorUsers = () => users.filter(u => ['TEACHER', 'HEAD_TEACHER'].includes(u.role) && !u.archived);
const getParentUsers = () => users.filter(u => u.role === 'PARENT' && !u.archived);
```
- Categorizes users based on their roles
- Only includes non-archived users for display

#### 3. **Enhanced Filter Logic**
Updated the `filteredUsers` logic to respect the user group selection:
```jsx
let groupFilter = true;
if (userGroupTab === 'parents') {
  groupFilter = user.role === 'PARENT';
} else if (userGroupTab === 'tutors') {
  groupFilter = ['TEACHER', 'HEAD_TEACHER'].includes(user.role);
} else if (userGroupTab === 'admins') {
  groupFilter = ['SUPER_ADMIN', 'ADMIN'].includes(user.role);
}
```

#### 4. **Sub-Tabs UI Component**
Added four sub-tabs within the Users tab:
- **All Users** - Shows all active users
- **Admins** - Shows Super Admins and Admins (red theme)
- **Tutors/Teachers** - Shows Teachers and Head Teachers (blue theme)
- **Parents** - Shows Parent users (green theme)

Each tab displays:
- Icon representing the user type
- Tab label
- Count badge showing number of users in that group

### Visual Design
- **All Users**: Gray theme
- **Admins**: Red theme (Shield icon)
- **Tutors/Teachers**: Blue theme (BookOpen icon)
- **Parents**: Green theme (Users icon)

### User Experience
1. Users can easily switch between viewing different user groups
2. Each tab shows the count of users in that category
3. All existing filters (search, role filter, status) work with the group tabs
4. The table below continues to display users filtered by the selected group

## Usage

### For Admins/Super Admins:
1. Navigate to Settings > User Management
2. Click on the Users tab (if not already selected)
3. Use the sub-tabs to view:
   - **All Users**: Complete user list
   - **Admins**: Administrative personnel only
   - **Tutors/Teachers**: Teaching staff
   - **Parents**: Parent/guardian accounts

### Filters Work With Grouping:
- Search term applies to all users in the selected group
- Role filter, status filter, and user group tabs work together
- Selected users for bulk actions respect the current group view

## Implementation Details

### Imports Added
- `BookOpen` icon from lucide-react

### State Variables Added
- `userGroupTab`: Tracks the currently selected user group tab

### Functions Added
- `getAdminUsers()`: Returns filtered admin users
- `getTutorUsers()`: Returns filtered tutor/teacher users  
- `getParentUsers()`: Returns filtered parent users

### Modified Logic
- Updated `filteredUsers` filter chain to include group filtering
- Sub-tab display counts are dynamically calculated

## Future Enhancements
1. Add ability to bulk assign groups to users
2. Add group-specific bulk actions (e.g., send notification to all parents)
3. Add statistics cards showing active/inactive per group
4. Add quick filters for commonly used combinations
5. Add export functionality per group

## Testing Checklist
- [ ] All Users tab shows all non-archived users
- [ ] Admins tab shows only SUPER_ADMIN and ADMIN roles
- [ ] Tutors/Teachers tab shows only TEACHER and HEAD_TEACHER roles
- [ ] Parents tab shows only PARENT role
- [ ] Search works across all groups
- [ ] Role filter works in conjunction with group tabs
- [ ] Status filter works with groups
- [ ] Bulk actions work with group filtering
- [ ] Badge counts update correctly
- [ ] Tab switching is smooth without loading delays
- [ ] Responsive design on mobile/tablet
