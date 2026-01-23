/**
 * Enhanced User Management Module
 * Features: Dynamic user loading, Role Management tab, Easy role control
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, Edit, Trash2, X, Save, Shield, Users, Search, 
  Filter, RotateCcw, Eye, EyeOff, Mail, Phone, Calendar, Archive, ArchiveRestore
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import api from '../../../../services/api';

// Available roles from schema
const USER_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', color: 'red', description: 'System owner - full access' },
  { value: 'ADMIN', label: 'Admin', color: 'purple', description: 'School administrator' },
  { value: 'HEAD_TEACHER', label: 'Head Teacher', color: 'indigo', description: 'Senior teacher with oversight' },
  { value: 'TEACHER', label: 'Teacher', color: 'blue', description: 'Regular classroom teacher' },
  { value: 'PARENT', label: 'Parent', color: 'green', description: 'Parent/guardian (view-only)' },
  { value: 'ACCOUNTANT', label: 'Accountant', color: 'yellow', description: 'Financial officer' },
  { value: 'RECEPTIONIST', label: 'Receptionist', color: 'pink', description: 'Front desk staff' },
  { value: 'LIBRARIAN', label: 'Librarian', color: 'teal', description: 'Library staff' },
  { value: 'NURSE', label: 'Nurse', color: 'cyan', description: 'School nurse' },
  { value: 'SECURITY', label: 'Security', color: 'gray', description: 'Security personnel' },
  { value: 'DRIVER', label: 'Driver', color: 'orange', description: 'Transport driver' },
  { value: 'COOK', label: 'Cook', color: 'amber', description: 'Kitchen staff' },
  { value: 'CLEANER', label: 'Cleaner', color: 'lime', description: 'Cleaning staff' },
  { value: 'GROUNDSKEEPER', label: 'Groundskeeper', color: 'emerald', description: 'Grounds maintenance' },
  { value: 'IT_SUPPORT', label: 'IT Support', color: 'violet', description: 'IT support staff' }
];

const getRoleColor = (role) => {
  const roleConfig = USER_ROLES.find(r => r.value === role);
  return roleConfig?.color || 'gray';
};

const getRoleLabel = (role) => {
  const roleConfig = USER_ROLES.find(r => r.value === role);
  return roleConfig?.label || role;
};

const UserManagement = () => {
  const { showSuccess, showError } = useNotifications();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'roles'
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    role: 'TEACHER',
    staffId: ''
  });

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.users.getAll();
      setUsers(response.users || []);
    } catch (error) {
      showError('Failed to load users: ' + error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  const handleSave = async () => {
    try {
      // Validate
      if (!formData.firstName || !formData.lastName || !formData.email) {
        showError('Please fill in all required fields');
        return;
      }

      if (!editingUser && !formData.password) {
        showError('Password is required for new users');
        return;
      }

      if (editingUser) {
        // Update existing user
        await api.users.update(editingUser.id, formData);
        showSuccess('User updated successfully!');
      } else {
        // Create new user
        await api.users.create(formData);
        showSuccess('User created successfully!');
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      showError('Failed to save user: ' + error.message);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || '',
      email: user.email,
      phone: user.phone || '',
      username: user.username || '',
      password: '',
      role: user.role,
      staffId: user.staffId || ''
    });
    setShowModal(true);
  };

  const handleArchive = async (userId) => {
    if (!window.confirm('Are you sure you want to archive this user?')) return;
    
    try {
      await api.users.archive(userId);
      showSuccess('User archived successfully');
      loadUsers();
    } catch (error) {
      showError('Failed to archive user: ' + error.message);
    }
  };

  const handleUnarchive = async (userId) => {
    try {
      await api.users.unarchive(userId);
      showSuccess('User restored successfully');
      loadUsers();
    } catch (error) {
      showError('Failed to restore user: ' + error.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    
    try {
      await api.users.delete(userId);
      showSuccess('User deleted permanently');
      loadUsers();
    } catch (error) {
      showError('Failed to delete user: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      email: '',
      phone: '',
      username: '',
      password: '',
      role: 'TEACHER',
      staffId: ''
    });
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === '' || 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.staffId && user.staffId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && user.status === 'ACTIVE' && !user.archived) ||
      (statusFilter === 'ARCHIVED' && user.archived) ||
      (statusFilter === 'INACTIVE' && user.status === 'INACTIVE');
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Group users by role for role management view
  const usersByRole = USER_ROLES.map(role => ({
    ...role,
    users: users.filter(u => u.role === role.value && !u.archived)
  }));

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
              activeTab === 'users'
                ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={20} />
            <span>User Management</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
              {users.filter(u => !u.archived).length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
              activeTab === 'roles'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Shield size={20} />
            <span>Role Manager</span>
            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
              {USER_ROLES.length}
            </span>
          </button>
        </div>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <>
          {/* Action Toolbar */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 min-w-[200px] max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, email, or staff ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3 items-center">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-500" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Roles</option>
                    {USER_ROLES.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ALL">All Status</option>
                </select>

                <button
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('ALL');
                    setStatusFilter('ACTIVE');
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  title="Reset filters"
                >
                  <RotateCcw size={20} />
                </button>
              </div>

              {/* Add User Button */}
              <button 
                onClick={() => {
                  setEditingUser(null);
                  resetForm();
                  setShowModal(true);
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                <UserPlus size={20} /> 
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 font-semibold">No users found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your filters or add a new user</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Staff ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className={`hover:bg-gray-50 ${user.archived ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-600">{user.staffId || '—'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-800">
                              {user.firstName} {user.middleName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.username || user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Mail size={14} />
                              <span>{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-gray-600 mt-1">
                                <Phone size={14} />
                                <span>{user.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-block w-fit ${
                              user.status === 'ACTIVE' && !user.archived
                                ? 'bg-green-100 text-green-800'
                                : user.archived
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.archived ? 'Archived' : user.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(user)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit user"
                            >
                              <Edit size={18} />
                            </button>
                            {user.archived ? (
                              <button 
                                onClick={() => handleUnarchive(user.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Restore user"
                              >
                                <ArchiveRestore size={18} />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleArchive(user.id)}
                                className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                                title="Archive user"
                              >
                                <Archive size={18} />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete permanently"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ROLES TAB */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          {usersByRole.map(role => (
            <div key={role.value} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className={`bg-${role.color}-50 border-b border-${role.color}-100 px-6 py-4`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-bold text-${role.color}-900`}>{role.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                  </div>
                  <div className={`px-4 py-2 bg-${role.color}-100 text-${role.color}-800 rounded-full font-bold`}>
                    {role.users.length} {role.users.length === 1 ? 'User' : 'Users'}
                  </div>
                </div>
              </div>
              
              {role.users.length > 0 ? (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {role.users.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 truncate">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500 truncate">{user.email}</div>
                          {user.staffId && (
                            <div className="text-xs text-gray-400 font-mono mt-1">{user.staffId}</div>
                          )}
                        </div>
                        <button
                          onClick={() => handleEdit(user)}
                          className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex-shrink-0"
                          title="Edit user"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Shield size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm">No users assigned to this role yet</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex justify-between items-center sticky top-0">
              <h3 className="text-xl font-bold text-white">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-blue-700 rounded-lg p-1">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({...formData, middleName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Staff ID</label>
                  <input
                    type="text"
                    value={formData.staffId}
                    onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="EMP001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="john.doe@school.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+254712345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional - defaults to email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {USER_ROLES.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Password {!editingUser && <span className="text-red-500">*</span>}
                    {editingUser && <span className="text-gray-500 text-xs ml-2">(leave blank to keep current)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={editingUser ? 'Enter new password to change' : 'Enter password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
