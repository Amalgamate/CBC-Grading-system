import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserPlus, Edit, Trash2, X, Save, Shield, Users, Search, 
  RotateCcw, Eye, EyeOff, Mail, Phone, Archive, ArchiveRestore,
  Settings, Lock, Check, AlertCircle, Clock, Activity
} from 'lucide-react';

// Mock API - Replace with actual API calls
const mockAPI = {
  users: {
    getAll: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        users: [
          { id: '1', firstName: 'Sarah', lastName: 'Muthoni', email: 'sarah@school.com', phone: '+254712345678', role: 'ADMIN', status: 'ACTIVE', staffId: 'ADM001', archived: false, lastLogin: '2024-01-20T10:30:00' },
          { id: '2', firstName: 'John', lastName: 'Kamau', email: 'john@school.com', phone: '+254723456789', role: 'TEACHER', status: 'ACTIVE', staffId: 'TCH001', archived: false, lastLogin: '2024-01-22T14:15:00' },
          { id: '3', firstName: 'Hassan', lastName: 'Mohamed', email: 'hassan@email.com', phone: '+254734567890', role: 'PARENT', status: 'ACTIVE', staffId: null, archived: false, lastLogin: '2024-01-23T08:00:00' },
          { id: '4', firstName: 'Grace', lastName: 'Wanjiru', email: 'grace@school.com', phone: '+254745678901', role: 'ACCOUNTANT', status: 'ACTIVE', staffId: 'ACC001', archived: false, lastLogin: '2024-01-21T16:45:00' },
          { id: '5', firstName: 'Peter', lastName: 'Omondi', email: 'peter@school.com', phone: '+254756789012', role: 'HEAD_TEACHER', status: 'ACTIVE', staffId: 'HT001', archived: false, lastLogin: '2024-01-23T07:30:00' },
          { id: '6', firstName: 'Mary', lastName: 'Nyambura', email: 'mary@school.com', phone: '+254767890123', role: 'LIBRARIAN', status: 'INACTIVE', staffId: 'LIB001', archived: false, lastLogin: '2024-01-10T12:00:00' },
          { id: '7', firstName: 'David', lastName: 'Kibet', email: 'david@school.com', phone: '+254778901234', role: 'TEACHER', status: 'ACTIVE', staffId: 'TCH002', archived: true, lastLogin: '2024-01-15T09:00:00' }
        ]
      };
    },
    create: async (data) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { user: { ...data, id: Date.now().toString(), status: 'ACTIVE', archived: false } };
    },
    update: async (id, data) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { user: { ...data, id } };
    },
    archive: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    },
    unarchive: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    },
    delete: async (id) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    }
  }
};

// Role definitions with permissions
const ROLES_CONFIG = [
  { 
    value: 'SUPER_ADMIN', 
    label: 'Super Admin', 
    color: 'red',
    permissions: {
      users: { view: true, create: true, edit: true, delete: true },
      roles: { view: true, create: true, edit: true, delete: true },
      learners: { view: true, create: true, edit: true, delete: true },
      assessments: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: true, delete: true },
      fees: { view: true, create: true, edit: true, delete: true },
      settings: { view: true, create: true, edit: true, delete: true }
    }
  },
  { 
    value: 'ADMIN', 
    label: 'Admin',
    color: 'purple',
    permissions: {
      users: { view: true, create: true, edit: true, delete: false },
      roles: { view: true, create: false, edit: true, delete: false },
      learners: { view: true, create: true, edit: true, delete: true },
      assessments: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: true, delete: false },
      fees: { view: true, create: true, edit: true, delete: false },
      settings: { view: true, create: false, edit: true, delete: false }
    }
  },
  { 
    value: 'HEAD_TEACHER', 
    label: 'Head Teacher',
    color: 'indigo',
    permissions: {
      users: { view: true, create: false, edit: false, delete: false },
      roles: { view: true, create: false, edit: false, delete: false },
      learners: { view: true, create: true, edit: true, delete: false },
      assessments: { view: true, create: true, edit: true, delete: true },
      reports: { view: true, create: true, edit: true, delete: false },
      fees: { view: true, create: false, edit: false, delete: false },
      settings: { view: true, create: false, edit: false, delete: false }
    }
  },
  { 
    value: 'TEACHER', 
    label: 'Teacher',
    color: 'blue',
    permissions: {
      users: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
      learners: { view: true, create: false, edit: false, delete: false },
      assessments: { view: true, create: true, edit: true, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      fees: { view: false, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  },
  { 
    value: 'PARENT', 
    label: 'Parent',
    color: 'green',
    permissions: {
      users: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
      learners: { view: true, create: false, edit: false, delete: false },
      assessments: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      fees: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  },
  { 
    value: 'ACCOUNTANT', 
    label: 'Accountant',
    color: 'yellow',
    permissions: {
      users: { view: false, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
      learners: { view: true, create: false, edit: false, delete: false },
      assessments: { view: false, create: false, edit: false, delete: false },
      reports: { view: true, create: true, edit: false, delete: false },
      fees: { view: true, create: true, edit: true, delete: true },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  },
  { 
    value: 'RECEPTIONIST', 
    label: 'Receptionist',
    color: 'pink',
    permissions: {
      users: { view: true, create: false, edit: false, delete: false },
      roles: { view: false, create: false, edit: false, delete: false },
      learners: { view: true, create: true, edit: true, delete: false },
      assessments: { view: false, create: false, edit: false, delete: false },
      reports: { view: false, create: false, edit: false, delete: false },
      fees: { view: true, create: false, edit: false, delete: false },
      settings: { view: false, create: false, edit: false, delete: false }
    }
  },
  { value: 'LIBRARIAN', label: 'Librarian', color: 'teal', permissions: {} },
  { value: 'NURSE', label: 'Nurse', color: 'cyan', permissions: {} },
  { value: 'SECURITY', label: 'Security', color: 'gray', permissions: {} },
  { value: 'DRIVER', label: 'Driver', color: 'orange', permissions: {} },
  { value: 'COOK', label: 'Cook', color: 'amber', permissions: {} },
  { value: 'CLEANER', label: 'Cleaner', color: 'lime', permissions: {} },
  { value: 'GROUNDSKEEPER', label: 'Groundskeeper', color: 'emerald', permissions: {} },
  { value: 'IT_SUPPORT', label: 'IT Support', color: 'violet', permissions: {} }
];

const PERMISSION_MODULES = [
  { key: 'users', label: 'User Management' },
  { key: 'roles', label: 'Role Management' },
  { key: 'learners', label: 'Learner Management' },
  { key: 'assessments', label: 'Assessments' },
  { key: 'reports', label: 'Reports' },
  { key: 'fees', label: 'Fee Management' },
  { key: 'settings', label: 'System Settings' }
];

const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'];

const getRoleColor = (role) => {
  const config = ROLES_CONFIG.find(r => r.value === role);
  return config?.color || 'gray';
};

const getRoleLabel = (role) => {
  const config = ROLES_CONFIG.find(r => r.value === role);
  return config?.label || role;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  
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

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await mockAPI.users.getAll();
      console.log('API Response:', response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        setUsers(response);
      } else if (response.users && Array.isArray(response.users)) {
        setUsers(response.users);
      } else if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error('Unexpected response format:', response);
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      showNotification('Failed to load users: ' + error.message, 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSave = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }

      if (!editingUser && !formData.password) {
        showNotification('Password is required for new users', 'error');
        return;
      }

      if (editingUser) {
        await mockAPI.users.update(editingUser.id, formData);
        showNotification('User updated successfully!');
      } else {
        await mockAPI.users.create(formData);
        showNotification('User created successfully!');
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      showNotification('Failed to save user: ' + error.message, 'error');
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
    if (!window.confirm('Archive this user?')) return;
    try {
      await mockAPI.users.archive(userId);
      showNotification('User archived');
      loadUsers();
    } catch (error) {
      showNotification('Failed to archive user', 'error');
    }
  };

  const handleUnarchive = async (userId) => {
    try {
      await mockAPI.users.unarchive(userId);
      showNotification('User restored');
      loadUsers();
    } catch (error) {
      showNotification('Failed to restore user', 'error');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Permanently delete this user? This cannot be undone.')) return;
    try {
      await mockAPI.users.delete(userId);
      showNotification('User deleted');
      loadUsers();
    } catch (error) {
      showNotification('Failed to delete user', 'error');
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

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    try {
      for (const userId of selectedUsers) {
        const user = users.find(u => u.id === userId);
        if (user) {
          await mockAPI.users.update(userId, { ...user, role: newRole });
        }
      }
      showNotification(`Updated ${selectedUsers.length} users to ${getRoleLabel(newRole)}`);
      setSelectedUsers([]);
      setShowBulkActions(false);
      loadUsers();
    } catch (error) {
      showNotification('Bulk update failed', 'error');
    }
  };

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

  const roleStats = ROLES_CONFIG.map(role => ({
    ...role,
    count: users.filter(u => u.role === role.value && !u.archived).length
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-fade-in`}>
          {notification.type === 'success' ? <Check size={20} /> : <AlertCircle size={20} />}
          <span className="font-semibold">{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-4">

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition text-sm ${
                activeTab === 'users'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users size={18} />
              <span>Users</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                {users.filter(u => !u.archived).length}
              </span>
            </button>
            
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition text-sm ${
                activeTab === 'roles'
                  ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shield size={18} />
              <span>Roles & Permissions</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-2 px-6 py-3 font-semibold transition text-sm ${
                activeTab === 'activity'
                  ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Activity size={18} />
              <span>Activity Log</span>
            </button>
          </div>
        </div>

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <>
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
              <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">
                <div className="flex-1 min-w-[200px] max-w-md w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 items-center flex-wrap justify-end w-full xl:w-auto">
                  {/* Metrics */}
                  <div className="hidden lg:flex items-center gap-4 mr-2 border-r pr-4 border-gray-200 h-10">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Users</p>
                      <p className="text-xl font-bold text-gray-800 leading-none">{users.filter(u => !u.archived).length}</p>
                    </div>
                    <div className="text-right border-l pl-4 border-gray-100">
                      <p className="text-[10px] text-green-600 uppercase font-bold tracking-wider">Active</p>
                      <p className="text-xl font-bold text-green-700 leading-none">{users.filter(u => u.status === 'ACTIVE' && !u.archived).length}</p>
                    </div>
                    <div className="text-right border-l pl-4 border-gray-100">
                      <p className="text-[10px] text-orange-600 uppercase font-bold tracking-wider">Archived</p>
                      <p className="text-xl font-bold text-orange-700 leading-none">{users.filter(u => u.archived).length}</p>
                    </div>
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="ALL">All Roles</option>
                    {ROLES_CONFIG.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    title="Reset filters"
                  >
                    <RotateCcw size={20} />
                  </button>

                  {selectedUsers.length > 0 && (
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
                    >
                      <Settings size={18} />
                      Bulk Actions ({selectedUsers.length})
                    </button>
                  )}

                  <button 
                    onClick={() => {
                      setEditingUser(null);
                      resetForm();
                      setShowModal(true);
                    }} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-semibold"
                  >
                    <UserPlus size={18} /> 
                    <span className="hidden sm:inline">Add User</span>
                  </button>
                </div>
              </div>

              {/* Bulk Actions Menu */}
              {showBulkActions && selectedUsers.length > 0 && (
                <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm font-semibold text-purple-900 mb-3">Change role for {selectedUsers.length} selected users:</p>
                  <div className="flex flex-wrap gap-2">
                    {ROLES_CONFIG.slice(0, 7).map(role => (
                      <button
                        key={role.value}
                        onClick={() => handleBulkRoleChange(role.value)}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold bg-${role.color}-100 text-${role.color}-800 hover:bg-${role.color}-200`}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 font-semibold">No users found</p>
                  <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b text-xs">
                      <tr>
                        <th className="px-3 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={selectedUsers.length === filteredUsers.length}
                            onChange={toggleSelectAll}
                            className="w-4 h-4"
                          />
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">User</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Contact</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Role</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Last Login</th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className={`hover:bg-gray-50 ${user.archived ? 'opacity-60' : ''}`}>
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleUserSelection(user.id)}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                                {user.firstName[0]}{user.lastName[0]}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.staffId || user.username || user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1 text-gray-700">
                              <Mail size={14} className="text-gray-400" />
                              <span className="text-xs">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-1 text-gray-600 mt-1">
                                <Phone size={14} className="text-gray-400" />
                                <span className="text-xs">{user.phone}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              user.status === 'ACTIVE' && !user.archived
                                ? 'bg-green-100 text-green-800'
                                : user.archived
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.archived ? 'Archived' : user.status}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Clock size={14} className="text-gray-400" />
                              <span className="text-xs">{formatDate(user.lastLogin)}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleEdit(user)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              {user.archived ? (
                                <button 
                                  onClick={() => handleUnarchive(user.id)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                  title="Restore"
                                >
                                  <ArchiveRestore size={16} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleArchive(user.id)}
                                  className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                                  title="Archive"
                                >
                                  <Archive size={16} />
                                </button>
                              )}
                              <button 
                                onClick={() => handleDelete(user.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 size={16} />
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

        {/* ROLES & PERMISSIONS TAB */}
        {activeTab === 'roles' && (
          <div className="space-y-6">
            {/* Role Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {roleStats.map(role => (
                <div key={role.value} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                  <div className={`w-12 h-12 rounded-lg bg-${role.color}-100 flex items-center justify-center mb-3`}>
                    <Shield className={`text-${role.color}-600`} size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{role.label}</h3>
                  <p className={`text-2xl font-bold text-${role.color}-600`}>{role.count}</p>
                  <p className="text-xs text-gray-500 mt-1">users</p>
                </div>
              ))}
            </div>

            {/* Permission Matrix */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Lock size={24} />
                  Permission Matrix
                </h2>
                <p className="text-purple-100 text-sm mt-1">Control what each role can access</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50">Role</th>
                      {PERMISSION_MODULES.map(module => (
                        <th key={module.key} className="px-2 py-2 text-center" colSpan={4}>
                          <div className="font-semibold text-gray-700">{module.label}</div>
                          <div className="flex gap-1 justify-center mt-1 text-xs text-gray-500">
                            <span>V</span>
                            <span>C</span>
                            <span>E</span>
                            <span>D</span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {ROLES_CONFIG.slice(0, 7).map(role => (
                      <tr key={role.value} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-semibold text-gray-900 sticky left-0 bg-white">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full bg-${role.color}-500`}></div>
                            {role.label}
                          </div>
                        </td>
                        {PERMISSION_MODULES.map(module => (
                          <React.Fragment key={module.key}>
                            {PERMISSION_ACTIONS.map(action => {
                              const hasPermission = role.permissions?.[module.key]?.[action];
                              return (
                                <td key={action} className="px-1 py-2 text-center">
                                  <div className="flex justify-center">
                                    {hasPermission ? (
                                      <Check size={14} className="text-green-600" />
                                    ) : (
                                      <X size={14} className="text-gray-300" />
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </React.Fragment>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Role Details with Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ROLES_CONFIG.slice(0, 6).map(role => {
                const roleUsers = users.filter(u => u.role === role.value && !u.archived);
                return (
                  <div key={role.value} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className={`bg-${role.color}-50 px-4 py-3 border-b border-${role.color}-100`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`font-bold text-${role.color}-900`}>{role.label}</h3>
                        <span className={`px-3 py-1 bg-${role.color}-100 text-${role.color}-800 rounded-full text-sm font-bold`}>
                          {roleUsers.length}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      {roleUsers.length > 0 ? (
                        <div className="space-y-2">
                          {roleUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {user.firstName[0]}{user.lastName[0]}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-semibold text-gray-900 text-sm truncate">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleEdit(user)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded flex-shrink-0"
                              >
                                <Edit size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <Shield size={32} className="mx-auto mb-2 opacity-30" />
                          <p className="text-sm">No users in this role</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ACTIVITY LOG TAB */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <Activity size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">Activity Log</h3>
              <p className="text-gray-500 mt-2">Track user login history, role changes, and system actions</p>
              <p className="text-sm text-gray-400 mt-4">Coming soon...</p>
            </div>
          </div>
        )}

        {/* Add/Edit User Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl flex justify-between items-center sticky top-0">
                <h3 className="text-xl font-bold text-white">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-white hover:bg-blue-800 rounded-lg p-1">
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
                      placeholder="Optional"
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
                      {ROLES_CONFIG.map(role => (
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
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
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
    </div>
  );
};

export default UserManagement;
