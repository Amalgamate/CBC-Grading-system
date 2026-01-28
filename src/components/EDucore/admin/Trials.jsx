import React, { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { adminAPI } from '../../../services/api';

export default function Trials() {
  const [metrics, setMetrics] = useState({ active: 0, inactive: 0, trial: 0, conversionRate: 0 });
  const [inactive, setInactive] = useState([]);
  useEffect(() => {
    adminAPI.trialMetrics().then((m) => setMetrics(m.data || metrics)).catch(() => {});
    adminAPI.listSchools().then((s) => setInactive((s.data || []).filter((x) => !x.active))).catch(() => {});
  }, []);
  return (
    <div className="space-y-4">
      <div className="bg-white border border-indigo-100 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <Activity className="w-6 h-6 text-indigo-600" />
        <div>
          <div className="text-xs text-gray-500">Active</div>
          <div className="text-lg font-semibold text-gray-900">{metrics.active}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Inactive</div>
          <div className="text-lg font-semibold text-gray-900">{metrics.inactive}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Conversion</div>
          <div className="text-lg font-semibold text-gray-900">{Math.round((metrics.conversionRate || 0) * 100)}%</div>
        </div>
      </div>
      <div className="bg-white border border-indigo-100 rounded-xl">
        <div className="p-4 border-b text-sm font-semibold text-gray-900">Inactive Schools</div>
        <div className="divide-y">
          {inactive.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm">No inactive schools</div>
          ) : (
            inactive.map((s) => (
              <div key={s.id} className="p-4 text-sm flex items-center justify-between">
                <div>{s.name}</div>
                <div className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs">Inactive</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
