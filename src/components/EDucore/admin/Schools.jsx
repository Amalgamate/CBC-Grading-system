import React, { useEffect, useState } from 'react';
import { School, Search, CreditCard } from 'lucide-react';
import { adminAPI, schoolAPI } from '../../../services/api';

export default function Schools({ onOpenSchool, onApprovePayment }) {
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState([]);
  const [query, setQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const s = await adminAPI.listSchools();
      setSchools(s.data || []);
    } catch { }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = schools.filter((x) => (x.name || '').toLowerCase().includes(query.toLowerCase()));

  const reactivate = async (schoolId) => {
    setActionLoading(schoolId);
    try {
      // Set the school ID temporarily for the API call
      const previousSchoolId = localStorage.getItem('currentSchoolId');
      localStorage.setItem('currentSchoolId', schoolId);

      await adminAPI.reactivateSchool(schoolId);

      // Restore previous school ID
      if (previousSchoolId) {
        localStorage.setItem('currentSchoolId', previousSchoolId);
      } else {
        localStorage.removeItem('currentSchoolId');
      }

      await load();
    } catch (error) {
      console.error('Reactivate school error:', error);
      alert(error.message || 'Failed to reactivate school');
    } finally {
      setActionLoading(null);
    }
  };

  const approvePayment = async (schoolId) => {
    if (onApprovePayment) {
      onApprovePayment(schoolId);
    } else {
      // Fallback for backward compatibility
      setActionLoading(`pay-${schoolId}`);
      try {
        // Set the school ID temporarily for the API call
        const previousSchoolId = localStorage.getItem('currentSchoolId');
        localStorage.setItem('currentSchoolId', schoolId);

        await adminAPI.approvePayment(schoolId, { planId: 'starter', durationDays: 365 });

        // Restore previous school ID
        if (previousSchoolId) {
          localStorage.setItem('currentSchoolId', previousSchoolId);
        } else {
          localStorage.removeItem('currentSchoolId');
        }

        await load();
      } catch (error) {
        console.error('Approve payment error:', error);
        alert(error.message || 'Failed to approve payment');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const deactivate = async (schoolId) => {
    setActionLoading(`deact-${schoolId}`);
    try {
      // Set the school ID temporarily for the API call
      const previousSchoolId = localStorage.getItem('currentSchoolId');
      localStorage.setItem('currentSchoolId', schoolId);

      await schoolAPI.deactivate(schoolId);

      // Restore previous school ID
      if (previousSchoolId) {
        localStorage.setItem('currentSchoolId', previousSchoolId);
      } else {
        localStorage.removeItem('currentSchoolId');
      }

      await load();
    } catch (error) {
      console.error('Deactivate school error:', error);
      alert(error.message || 'Failed to deactivate school');
    } finally {
      setActionLoading(null);
    }
  };

  const approveSelfSigned = async (schoolId) => {
    setActionLoading(`approve-${schoolId}`);
    try {
      // Set the school ID in localStorage temporarily for Super Admin operations
      const previousSchoolId = localStorage.getItem('currentSchoolId');
      localStorage.setItem('currentSchoolId', schoolId);

      await schoolAPI.update(schoolId, { status: 'ACTIVE', active: true, trialStart: null });

      // Restore previous school ID
      if (previousSchoolId) {
        localStorage.setItem('currentSchoolId', previousSchoolId);
      } else {
        localStorage.removeItem('currentSchoolId');
      }

      await load();
    } catch (error) {
      console.error('Approve school error:', error);
      alert(error.message || 'Failed to approve school');
    } finally {
      setActionLoading(null);
    }
  };

  const declineSelfSigned = async (schoolId) => {
    setActionLoading(`decline-${schoolId}`);
    try {
      // Set the school ID in localStorage temporarily for Super Admin operations
      const previousSchoolId = localStorage.getItem('currentSchoolId');
      localStorage.setItem('currentSchoolId', schoolId);

      await schoolAPI.update(schoolId, { status: 'DECLINED', active: false });

      // Restore previous school ID
      if (previousSchoolId) {
        localStorage.setItem('currentSchoolId', previousSchoolId);
      } else {
        localStorage.removeItem('currentSchoolId');
      }

      await load();
    } catch (error) {
      console.error('Decline school error:', error);
      alert(error.message || 'Failed to decline school');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteSchool = async (schoolId) => {
    if (!window.confirm('Are you sure you want to delete this school? This action cannot be undone.')) return;
    setActionLoading(`del-${schoolId}`);
    try {
      // Set the school ID temporarily for the API call
      const previousSchoolId = localStorage.getItem('currentSchoolId');
      localStorage.setItem('currentSchoolId', schoolId);

      await schoolAPI.delete(schoolId);

      // Restore previous school ID
      if (previousSchoolId) {
        localStorage.setItem('currentSchoolId', previousSchoolId);
      } else {
        localStorage.removeItem('currentSchoolId');
      }

      await load();
      alert('✅ School deleted successfully!');
    } catch (error) {
      console.error('Delete school error:', error);
      alert('Delete failed: ' + (error.message || 'Ensure the school has no learners or is inactive.'));
    } finally {
      setActionLoading(null);
    }
  };

  const [creating, setCreating] = useState(false);
  const [newSchool, setNewSchool] = useState({
    schoolName: '',
    admissionFormatType: 'BRANCH_PREFIX_START',
    branchSeparator: '-',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPhone: '',
  });

  const create = async () => {
    // Validate required fields
    if (!newSchool.schoolName) return alert('School name is required');
    if (!newSchool.adminEmail) return alert('Admin email is required');
    if (!newSchool.adminFirstName) return alert('Admin first name is required');
    if (!newSchool.adminLastName) return alert('Admin last name is required');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSchool.adminEmail)) {
      return alert('Please enter a valid email address');
    }

    setActionLoading('create');
    try {
      const response = await adminAPI.provision(newSchool);

      // Show success message with admin credentials
      const tempPassword = response.data?.temporaryPassword || 'Check response';
      alert(`✅ School created successfully!\n\n` +
        `School: ${newSchool.schoolName}\n` +
        `Admin: ${newSchool.adminEmail}\n` +
        `Temporary Password: ${tempPassword}\n\n` +
        `Please save this password and share it securely with the admin.`);

      setCreating(false);
      setNewSchool({
        schoolName: '',
        admissionFormatType: 'BRANCH_PREFIX_START',
        branchSeparator: '-',
        adminEmail: '',
        adminFirstName: '',
        adminLastName: '',
        adminPhone: '',
      });
      await load();
    } catch (error) {
      console.error('Create school error:', error);
      alert('Failed to create school: ' + (error.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-xl">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <School className="w-5 h-5 text-gray-700" />
          <span className="font-semibold text-gray-900 text-sm">Schools</span>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
            placeholder="Search schools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="p-4 border-b">
        {!creating ? (
          <button className="px-3 py-2 rounded bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-medium" onClick={() => setCreating(true)}>
            Create School
          </button>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600 font-semibold">School Name *</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={newSchool.schoolName}
                  onChange={(e) => setNewSchool({ ...newSchool, schoolName: e.target.value })}
                  placeholder="e.g. Elimcrown Academy"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 font-semibold">Admission Format</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={newSchool.admissionFormatType}
                  onChange={(e) => setNewSchool({ ...newSchool, admissionFormatType: e.target.value })}
                >
                  <option value="NO_BRANCH">No Branch</option>
                  <option value="BRANCH_PREFIX_START">Branch Prefix Start</option>
                  <option value="BRANCH_PREFIX_MIDDLE">Branch Prefix Middle</option>
                  <option value="BRANCH_PREFIX_END">Branch Prefix End</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 font-semibold">Separator</label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={newSchool.branchSeparator}
                  onChange={(e) => setNewSchool({ ...newSchool, branchSeparator: e.target.value })}
                >
                  <option value="-">- (hyphen)</option>
                  <option value="_">_ (underscore)</option>
                  <option value="">(none)</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-3">
              <h4 className="text-xs font-bold text-gray-700 mb-3">Admin User Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs text-gray-600 font-semibold">First Name *</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={newSchool.adminFirstName}
                    onChange={(e) => setNewSchool({ ...newSchool, adminFirstName: e.target.value })}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-semibold">Last Name *</label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={newSchool.adminLastName}
                    onChange={(e) => setNewSchool({ ...newSchool, adminLastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-semibold">Email *</label>
                  <input
                    type="email"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={newSchool.adminEmail}
                    onChange={(e) => setNewSchool({ ...newSchool, adminEmail: e.target.value })}
                    placeholder="admin@school.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 font-semibold">Phone (Optional)</label>
                  <input
                    type="tel"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={newSchool.adminPhone}
                    onChange={(e) => setNewSchool({ ...newSchool, adminPhone: e.target.value })}
                    placeholder="+254..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-300"
                onClick={() => setCreating(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs font-medium hover:brightness-110"
                disabled={actionLoading === 'create'}
                onClick={create}
              >
                {actionLoading === 'create' ? 'Creating School & Admin...' : 'Create School with Admin'}
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Branches</th>
              <th className="text-left px-4 py-2">Learners</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td className="px-4 py-6 text-center" colSpan={5}>Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={5}>No schools found</td></tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-2">
                    <button className="text-indigo-700 hover:underline" onClick={() => onOpenSchool && onOpenSchool(s.id)}>
                      {s.name}
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${s.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2">{s._count?.branches || s.branches?.length || 0}</td>
                  <td className="px-4 py-2">{s._count?.learners || 0}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      {s.active && (
                        <button
                          className="px-3 py-1.5 rounded bg-yellow-500 text-white text-xs hover:brightness-110"
                          disabled={!!actionLoading}
                          onClick={() => deactivate(s.id)}
                        >
                          {actionLoading === `deact-${s.id}` ? '...' : 'Deactivate'}
                        </button>
                      )}
                      <button
                        className="px-3 py-1.5 rounded bg-gray-900 text-white text-xs hover:opacity-90"
                        disabled={!!actionLoading}
                        onClick={() => reactivate(s.id)}
                      >
                        {actionLoading === s.id ? '...' : 'Reactivate'}
                      </button>
                      <button
                        className="px-3 py-1.5 rounded bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs flex items-center gap-1 hover:brightness-110"
                        disabled={!!actionLoading}
                        onClick={() => approvePayment(s.id)}
                      >
                        <CreditCard className="w-3 h-3" /> {actionLoading === `pay-${s.id}` ? '...' : 'Approve'}
                      </button>
                      {s.status === 'TRIAL' && (
                        <>
                          <button
                            className="px-3 py-1.5 rounded bg-green-600 text-white text-xs hover:brightness-110"
                            disabled={!!actionLoading}
                            onClick={() => approveSelfSigned(s.id)}
                          >
                            {actionLoading === `approve-${s.id}` ? '...' : 'Approve Trial'}
                          </button>
                          <button
                            className="px-3 py-1.5 rounded bg-red-600 text-white text-xs hover:brightness-110"
                            disabled={!!actionLoading}
                            onClick={() => declineSelfSigned(s.id)}
                          >
                            {actionLoading === `decline-${s.id}` ? '...' : 'Decline'}
                          </button>
                        </>
                      )}
                      <button
                        className={`px-3 py-1.5 rounded ${s.active ? 'bg-red-300' : 'bg-red-700'} text-white text-xs hover:brightness-110`}
                        disabled={!!actionLoading}
                        onClick={() => deleteSchool(s.id)}
                      >
                        {actionLoading === `del-${s.id}` ? '...' : s.active ? 'Delete (inactive only)' : 'Force Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
