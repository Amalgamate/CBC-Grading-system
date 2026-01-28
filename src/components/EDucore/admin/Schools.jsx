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
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = schools.filter((x) => (x.name || '').toLowerCase().includes(query.toLowerCase()));

  const reactivate = async (schoolId) => {
    setActionLoading(schoolId);
    try {
      await adminAPI.reactivateSchool(schoolId);
      await load();
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
        await adminAPI.approvePayment(schoolId, { planId: 'starter', durationDays: 365 });
        await load();
      } finally {
        setActionLoading(null);
      }
    }
  };

  const deactivate = async (schoolId) => {
    setActionLoading(`deact-${schoolId}`);
    try {
      await schoolAPI.deactivate(schoolId);
      await load();
    } finally {
      setActionLoading(null);
    }
  };

  const approveSelfSigned = async (schoolId) => {
    setActionLoading(`approve-${schoolId}`);
    try {
      await schoolAPI.update(schoolId, { status: 'ACTIVE', active: true, trialStart: null });
      await load();
    } finally {
      setActionLoading(null);
    }
  };

  const declineSelfSigned = async (schoolId) => {
    setActionLoading(`decline-${schoolId}`);
    try {
      await schoolAPI.update(schoolId, { status: 'DECLINED', active: false });
      await load();
    } finally {
      setActionLoading(null);
    }
  };

  const deleteSchool = async (schoolId) => {
    if (!window.confirm('Are you sure you want to delete this school?')) return;
    setActionLoading(`del-${schoolId}`);
    try {
      await schoolAPI.delete(schoolId);
      await load();
    } catch (e) {
      alert('Delete failed. Ensure the school has no learners.');
    } finally {
      setActionLoading(null);
    }
  };

  const [creating, setCreating] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    admissionFormatType: 'BRANCH_PREFIX_START',
    branchSeparator: '-',
  });
  const create = async () => {
    if (!newSchool.name) return alert('Name is required');
    setActionLoading('create');
    try {
      await schoolAPI.create(newSchool);
      setCreating(false);
      setNewSchool({ name: '', admissionFormatType: 'BRANCH_PREFIX_START', branchSeparator: '-' });
      await load();
    } catch {
      alert('Create failed');
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
          <button className="px-3 py-2 rounded bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs" onClick={() => setCreating(true)}>
            Create School
          </button>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="text-xs text-gray-600">Name</label>
              <input className="w-full border rounded-lg px-3 py-2" value={newSchool.name} onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs text-gray-600">Admission Format</label>
              <select className="w-full border rounded-lg px-3 py-2" value={newSchool.admissionFormatType} onChange={(e) => setNewSchool({ ...newSchool, admissionFormatType: e.target.value })}>
                <option value="NO_BRANCH">No Branch</option>
                <option value="BRANCH_PREFIX_START">Branch Prefix Start</option>
                <option value="BRANCH_PREFIX_MIDDLE">Branch Prefix Middle</option>
                <option value="BRANCH_PREFIX_END">Branch Prefix End</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Separator</label>
              <select className="w-full border rounded-lg px-3 py-2" value={newSchool.branchSeparator} onChange={(e) => setNewSchool({ ...newSchool, branchSeparator: e.target.value })}>
                <option value="-">-</option>
                <option value="_">_</option>
                <option value="">(none)</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 rounded bg-gray-900 text-white text-xs" onClick={() => setCreating(false)}>Cancel</button>
              <button className="px-3 py-2 rounded bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-xs" disabled={actionLoading === 'create'} onClick={create}>
                {actionLoading === 'create' ? 'Creating...' : 'Save'}
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
