import React, { useEffect, useState } from 'react';
import { Award, FileText, Building2, Users, Calendar, CreditCard, BookOpen, Shield, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminAPI, authAPI } from '../../../services/api';

const items = [
  { key: 'CBC', label: 'CBC', icon: Award, desc: 'Grading, Rubrics, Outcomes' },
  { key: 'ASSESSMENT', label: 'Assessments', icon: FileText, desc: 'Formative & Summative' },
  { key: 'CLASSES', label: 'Classes', icon: Building2, desc: 'Streams, Enrollment' },
  { key: 'LEARNERS', label: 'Learners', icon: Users, desc: 'Profiles & Analytics' },
  { key: 'TUTORS', label: 'Teachers', icon: Users, desc: 'Assignments & Workload' },
  { key: 'PARENTS', label: 'Parents', icon: Users, desc: 'Portal & Messaging' },
  { key: 'ATTENDANCE', label: 'Attendance', icon: Calendar, desc: 'Daily & Summary' },
  { key: 'FEES', label: 'Fees', icon: CreditCard, desc: 'Invoices & Payments' },
  { key: 'REPORTS', label: 'Reports', icon: BookOpen, desc: 'Termly & Performance' },
  { key: 'SECURITY', label: 'Security', icon: Shield, desc: 'RBAC & Policies' },
  { key: 'SETTINGS', label: 'Settings', icon: Settings, desc: 'Branding & Config' },
];

export default function Modules() {
  const [modules, setModules] = useState({});
  const [schoolId, setSchoolId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const me = await authAPI.me();
        const sid = me.data?.schoolId || me.data?.school?.id || '';
        setSchoolId(sid);
        if (sid) {
          const resp = await adminAPI.getSchoolModules(sid);
          setModules(resp.data || {});
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const toggle = async (key) => {
    if (!schoolId) return;
    const active = !modules[key];
    setModules({ ...modules, [key]: active });
    try {
      await adminAPI.setSchoolModule(schoolId, key, active);
    } catch {
      // revert on error
      setModules({ ...modules, [key]: !active });
    }
  };

  const activeItems = items.filter((i) => modules[i.key]);
  const inactiveItems = items.filter((i) => !modules[i.key]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-900">Modules Management</div>
        <div className="text-xs text-gray-600">School: {schoolId || '—'}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(loading ? items : activeItems).map(({ key, label, icon: I, desc }, i) => (
          <div key={`a-${i}`} className="bg-white border border-green-100 rounded-xl p-4 flex items-start justify-between gap-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-50">
                <I className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{label}</div>
                <div className="text-xs text-gray-600">{desc}</div>
              </div>
            </div>
            <button className="p-2 rounded hover:bg-gray-100" onClick={() => toggle(key)} title="Deactivate">
              <ToggleRight className="w-5 h-5 text-green-700" />
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {inactiveItems.map(({ key, label, icon: I, desc }, i) => (
          <div key={`i-${i}`} className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between gap-3 shadow-sm opacity-80">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-gray-50">
                <I className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-700">{label}</div>
                <div className="text-xs text-gray-600">{desc}</div>
              </div>
            </div>
            <button className="p-2 rounded hover:bg-gray-100" onClick={() => toggle(key)} title="Activate">
              <ToggleLeft className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
