/**
 * Role-Specific Dashboard Component
 * Renders different dashboard views based on user role
 */

import React from 'react';
import { usePermissions } from '../../../../hooks/usePermissions';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminDashboard from './AdminDashboard';
import HeadTeacherDashboard from './HeadTeacherDashboard';
import TeacherDashboard from './TeacherDashboard';
import ParentDashboard from './ParentDashboard';
import AccountantDashboard from './AccountantDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';

const RoleDashboard = ({ learners, pagination, teachers, user }) => {
  const { role } = usePermissions();

  // Render dashboard based on user role
  switch (role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard learners={learners} pagination={pagination} teachers={teachers} user={user} />;
    
    case 'ADMIN':
      return <AdminDashboard learners={learners} pagination={pagination} teachers={teachers} user={user} />;
    
    case 'HEAD_TEACHER':
      return <HeadTeacherDashboard learners={learners} pagination={pagination} teachers={teachers} user={user} />;
    
    case 'TEACHER':
      return <TeacherDashboard learners={learners} pagination={pagination} teachers={teachers} user={user} />;
    
    case 'PARENT':
      return <ParentDashboard user={user} />;
    
    case 'ACCOUNTANT':
      return <AccountantDashboard learners={learners} pagination={pagination} user={user} />;
    
    case 'RECEPTIONIST':
      return <ReceptionistDashboard learners={learners} pagination={pagination} user={user} />;
    
    default:
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">Invalid user role</p>
        </div>
      );
  }
};

export default RoleDashboard;
