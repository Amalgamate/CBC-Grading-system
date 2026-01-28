import React, { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { adminAPI } from '../../../services/api';

export default function Payments() {
  const [schools, setSchools] = useState([]);
  const [schoolId, setSchoolId] = useState('');
  const [planId, setPlanId] = useState('starter');
  const [days, setDays] = useState(365);
  const [status, setStatus] = useState('');

  useEffect(() => {
    adminAPI.listSchools().then((s) => setSchools(s.data || [])).catch(() => {});
  }, []);

  const approve = async () => {
    setStatus('processing');
    try {
      await adminAPI.approvePayment(schoolId, { planId, durationDays: Number(days) });
      setStatus('approved');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="bg-white border border-indigo-100 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-indigo-700" />
        <div className="text-sm font-semibold text-gray-900">Approve Payment</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <select className="border rounded-lg px-3 py-2" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
          <option value="">Select school</option>
          {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className="border rounded-lg px-3 py-2" value={planId} onChange={(e) => setPlanId(e.target.value)}>
          <option value="starter">Starter</option>
          <option value="professional">Professional</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <input className="border rounded-lg px-3 py-2" type="number" value={days} onChange={(e) => setDays(e.target.value)} placeholder="Duration days" />
      </div>
      <button
        className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
        disabled={!schoolId || !planId || status === 'processing'}
        onClick={approve}
      >
        {status === 'processing' ? 'Processing...' : 'Approve'}
      </button>
      {status === 'approved' && <div className="text-sm text-green-700">Payment approved</div>}
      {status === 'error' && <div className="text-sm text-red-700">Approval failed</div>}
    </div>
  );
}
