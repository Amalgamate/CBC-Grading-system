/**
 * School Details - Corporate Grade Redesign
 * Professional design with tabs and secure user management
 */

import React, { useEffect, useState } from 'react';
import {
  ArrowLeft, Building2, Users, Activity, FileText, Award,
  Eye, EyeOff, Mail, AlertCircle, CheckCircle, XCircle, Clock, Trash2,
  MessageSquare, CreditCard, Shield, Save
} from 'lucide-react';
import { adminAPI, schoolAPI, learnerAPI, assessmentAPI, userAPI } from '../../../services/api';
import { toast } from 'react-hot-toast';

export default function SchoolDetails({ schoolId, onBack }) {
  const [school, setSchool] = useState(null);
  const [learners, setLearners] = useState([]);
  const [tests, setTests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPasswords, setShowPasswords] = useState({});
  const [deleting, setDeleting] = useState(false);
  const [commConfig, setCommConfig] = useState({
    smsEnabled: true,
    smsProvider: 'mobilesasa',
    smsApiKey: '',
    smsSenderId: '',
    emailEnabled: false,
    emailProvider: 'resend',
    emailApiKey: '',
    emailFrom: '',
    emailFromName: '',
    mpesaEnabled: false,
    mpesaProvider: 'intasend',
    mpesaBusinessNo: '',
    mpesaPublicKey: '',
    mpesaSecretKey: ''
  });
  const [savingComm, setSavingComm] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Set context for this school
      const previousSchoolId = localStorage.getItem('currentSchoolId');
      localStorage.setItem('currentSchoolId', schoolId);

      const [schoolRes, learnersRes, testsRes, usersRes] = await Promise.all([
        schoolAPI.getById(schoolId).catch(() => ({})),
        learnerAPI.getAll().catch(() => ({ data: [] })),
        assessmentAPI.getTests().catch(() => ({ data: [] })),
        userAPI.getAll(schoolId).catch(() => ({ data: [] })) // Pass schoolId to fetch users for this school
      ]);

      setSchool(schoolRes?.data || schoolRes || {});

      // Get learners data properly
      let learnersData = [];
      if (learnersRes?.data && Array.isArray(learnersRes.data)) {
        learnersData = learnersRes.data;
      } else if (Array.isArray(learnersRes)) {
        learnersData = learnersRes;
      }
      setLearners(learnersData);

      // Get tests data properly
      let testsData = [];
      if (testsRes?.data && Array.isArray(testsRes.data)) {
        testsData = testsRes.data;
      } else if (Array.isArray(testsRes)) {
        testsData = testsRes;
      }
      setTests(testsData);

      // Get users data properly - no need to filter, backend handles it
      let usersData = [];
      if (usersRes?.data && Array.isArray(usersRes.data)) {
        usersData = usersRes.data;
      } else if (Array.isArray(usersRes)) {
        usersData = usersRes;
      }
      setUsers(usersData); // Backend already filtered by schoolId

      // Load communication config
      const commRes = await adminAPI.getSchoolCommunication(schoolId).catch(() => null);
      if (commRes?.success && commRes.data) {
        setCommConfig(prev => ({ ...prev, ...commRes.data, smsEnabled: commRes.data.smsEnabled ?? true }));
      }

      // Restore previous context
      if (previousSchoolId) {
        localStorage.setItem('currentSchoolId', previousSchoolId);
      } else {
        localStorage.removeItem('currentSchoolId');
      }
    } catch (e) {
      console.error('Failed to load school data:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [schoolId]);

  const togglePasswordVisibility = (userId) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSaveComm = async () => {
    setSavingComm(true);
    try {
      await adminAPI.updateSchoolCommunication(schoolId, commConfig);
      toast.success('Communication settings updated!');
    } catch (error) {
      toast.error('Failed to update settings: ' + error.message);
    } finally {
      setSavingComm(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      SUPER_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
      ADMIN: 'bg-blue-100 text-blue-800 border-blue-200',
      TEACHER: 'bg-green-100 text-green-800 border-green-200',
      PARENT: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleStatusBadge = (status) => {
    if (status === 'ACTIVE') return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', label: 'Active' };
    if (status === 'INACTIVE') return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Inactive' };
    return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' };
  };

  const handleDeleteTest = async (testId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      // Temporarily set school context for the delete operation
      const previousSchoolId = localStorage.getItem('currentSchoolId');
      localStorage.setItem('currentSchoolId', schoolId);

      await assessmentAPI.deleteTest(testId);
      toast.success('Test deleted successfully');

      // Refresh the list
      load();

      // Restore context
      if (previousSchoolId) {
        localStorage.setItem('currentSchoolId', previousSchoolId);
      } else {
        localStorage.removeItem('currentSchoolId');
      }
    } catch (error) {
      toast.error('Failed to delete test: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'communication', label: 'Communication', icon: MessageSquare }, // New tab
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'learners', label: 'Learners', icon: FileText, count: learners.length },
    { id: 'tests', label: 'Tests', icon: Award, count: tests.filter(t => t.testType || t.learningArea).length },
    { id: 'assessments', label: 'Assessments', icon: Award, count: tests.length }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <Activity className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm text-gray-500 font-medium">Loading school data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Back to Schools</span>
          </button>

          {/* School Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{school?.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm text-gray-500 font-mono">ID: {school?.id?.slice(0, 12)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${school?.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {school?.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase">Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase">Learners</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{learners.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase">Assessments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{tests.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase">Established</p>
              <p className="text-sm font-bold text-gray-900 mt-1">{new Date(school?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-t pt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">School Information</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">School Name</p>
                  <p className="text-sm font-medium text-gray-900">{school?.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Status</p>
                  <p className="text-sm font-medium text-gray-900">{school?.status || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Registration No.</p>
                  <p className="text-sm font-medium text-gray-900">{school?.registrationNo || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Phone</p>
                  <p className="text-sm font-medium text-gray-900">{school?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Email</p>
                  <p className="text-sm font-medium text-gray-900">{school?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">County</p>
                  <p className="text-sm font-medium text-gray-900">{school?.county || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Address</p>
                  <p className="text-sm font-medium text-gray-900">{school?.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Communication Tab */}
        {activeTab === 'communication' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Communication & Payments</h2>
                  <p className="text-sm text-gray-500">Configure SMS, Email and Payment triggers for this school</p>
                </div>
                <button
                  onClick={handleSaveComm}
                  disabled={savingComm}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {savingComm ? <Activity className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Settings
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* SMS Settings */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-gray-900">SMS (MobileSasa)</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={commConfig.smsEnabled}
                        onChange={(e) => setCommConfig({ ...commConfig, smsEnabled: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">API Key</label>
                      <input
                        type="password"
                        value={commConfig.smsApiKey}
                        onChange={(e) => setCommConfig({ ...commConfig, smsApiKey: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="••••••••••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Sender ID</label>
                      <input
                        type="text"
                        value={commConfig.smsSenderId}
                        onChange={(e) => setCommConfig({ ...commConfig, smsSenderId: e.target.value.toUpperCase() })}
                        maxLength={11}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. EDucore"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Settings */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-gray-900">Email (Resend)</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={commConfig.emailEnabled}
                        onChange={(e) => setCommConfig({ ...commConfig, emailEnabled: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Resend API Key</label>
                      <input
                        type="password"
                        value={commConfig.emailApiKey}
                        onChange={(e) => setCommConfig({ ...commConfig, emailApiKey: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="re_••••••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">From Email</label>
                      <input
                        type="email"
                        value={commConfig.emailFrom}
                        onChange={(e) => setCommConfig({ ...commConfig, emailFrom: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="noreply@school.com"
                      />
                    </div>
                  </div>
                </div>

                {/* M-Pesa Settings */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-gray-900">M-Pesa Payments</h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={commConfig.mpesaEnabled}
                        onChange={(e) => setCommConfig({ ...commConfig, mpesaEnabled: e.target.checked })}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Business No (Paybill)</label>
                      <input
                        type="text"
                        value={commConfig.mpesaBusinessNo}
                        onChange={(e) => setCommConfig({ ...commConfig, mpesaBusinessNo: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. 400200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Public Key</label>
                      <input
                        type="password"
                        value={commConfig.mpesaPublicKey}
                        onChange={(e) => setCommConfig({ ...commConfig, mpesaPublicKey: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="ISPK_••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-4">
                <Shield className="w-5 h-5 text-indigo-500" />
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  Settings here affect all automated communication for <strong>{school?.name}</strong>.
                  Keys are stored using AES-256 encryption. Changes are audit-logged for security.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">User Management</h2>
                <span className="text-sm text-gray-500 font-medium">Total: {users.length} users</span>
              </div>

              {/* Security Warning */}
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Security Notice</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Passwords are encrypted in the database. This view shows credential status only.
                    Users must reset their passwords through the proper authentication flow.
                  </p>
                </div>
              </div>

              {/* Users Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Username</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Credentials</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-4 py-12 text-center">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 font-medium">No users found for this school</p>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const statusInfo = handleStatusBadge(user.status);
                        const StatusIcon = statusInfo.icon;

                        return (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-300">
                                  <span className="text-xs font-bold text-gray-600">
                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">{user.id?.slice(-8)}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold border ${getRoleBadge(user.role)}`}>
                                {user.role?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                  <Mail className="w-3.5 h-3.5" />
                                  <span className="truncate max-w-[180px]">{user.email}</span>
                                </div>
                                {user.phone && (
                                  <p className="text-xs text-gray-500">{user.phone}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <code className="text-xs font-mono bg-gray-100 px-2.5 py-1 rounded border border-gray-200 text-gray-700">
                                {user.username || user.email?.split('@')[0]}
                              </code>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono bg-gray-100 px-2.5 py-1 rounded border border-gray-200 text-gray-700">
                                  {showPasswords[user.id] ? '•••••••• (encrypted)' : '••••••••'}
                                </code>
                                <button
                                  onClick={() => togglePasswordVisibility(user.id)}
                                  className="p-1.5 hover:bg-gray-100 rounded transition-colors border border-transparent hover:border-gray-200"
                                  title={showPasswords[user.id] ? 'Hide' : 'Show info'}
                                >
                                  {showPasswords[user.id] ? (
                                    <EyeOff className="w-4 h-4 text-gray-500" />
                                  ) : (
                                    <Eye className="w-4 h-4 text-gray-500" />
                                  )}
                                </button>
                              </div>
                              {showPasswords[user.id] && (
                                <p className="text-xs text-gray-500 mt-1.5 italic">
                                  Hashed • Contact user to reset
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center justify-center">
                                <div className={`p-1.5 rounded-lg ${statusInfo.bg}`}>
                                  <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-xs text-gray-600">
                                <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                                <div className="text-gray-400">{new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Learners Tab */}
        {activeTab === 'learners' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Student Registry</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Admission No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Grade</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stream</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {learners.slice(0, 50).map((learner) => (
                      <tr key={learner.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <code className="text-sm font-mono font-semibold text-gray-900">{learner.admissionNumber}</code>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{learner.firstName} {learner.lastName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-medium">{learner.grade}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{learner.stream || '-'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${learner.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                            {learner.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {learners.length > 50 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing 50 of {learners.length} learners
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Summative Tests</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Grade</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Term</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {tests.filter(t => t.testType || t.learningArea).slice(0, 50).length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-12 text-center">
                          <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 font-medium">No tests found</p>
                        </td>
                      </tr>
                    ) : (
                      tests.filter(t => t.testType || t.learningArea).slice(0, 50).map((test) => (
                        <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{test.title || test.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{test.grade}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{test.learningArea}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{test.term}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${test.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                              {test.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteTest(test.id, test.title || test.name)}
                              disabled={deleting}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete test"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {tests.filter(t => t.testType || t.learningArea).length > 50 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing 50 of {tests.filter(t => t.testType || t.learningArea).length} tests
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assessments Tab */}
        {activeTab === 'assessments' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Assessment Overview</h2>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Grade</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Term</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {tests.slice(0, 50).map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">{test.title || test.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{test.grade}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{test.learningArea}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{test.term}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded text-xs font-semibold ${test.published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {test.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteTest(test.id, test.title || test.name)}
                            disabled={deleting}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete assessment"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {tests.length > 50 && (
                <div className="mt-4 text-center text-sm text-gray-500">
                  Showing 50 of {tests.length} assessments
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
