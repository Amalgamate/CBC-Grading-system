/**
 * Academic Settings Page
 */

import React, { useState } from 'react';
import { Calendar, Save } from 'lucide-react';
import PageHeader from '../../shared/PageHeader';
import { useNotifications } from '../../hooks/useNotifications';

const AcademicSettings = () => {
  const { showSuccess } = useNotifications();
  const [settings, setSettings] = useState({
    academicYear: '2026',
    term1Start: '2026-01-06',
    term1End: '2026-03-31',
    term2Start: '2026-05-05',
    term2End: '2026-08-07',
    term3Start: '2026-09-07',
    term3End: '2026-11-20'
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Academic Settings" subtitle="Configure academic year and terms" icon={Calendar} />

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Academic Year</h3>
            <div className="max-w-md">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Academic Year</label>
              <select value={settings.academicYear} onChange={(e) => setSettings({...settings, academicYear: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>2025</option>
                <option>2026</option>
                <option>2027</option>
              </select>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Term Dates</h3>
            <div className="space-y-6">
              {[1, 2, 3].map(term => (
                <div key={term} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-3">Term {term}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                      <input type="date" value={settings[`term${term}Start`]} onChange={(e) => setSettings({...settings, [`term${term}Start`]: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                      <input type="date" value={settings[`term${term}End`]} onChange={(e) => setSettings({...settings, [`term${term}End`]: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t">
            <button onClick={() => showSuccess('Academic settings saved!')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
              <Save size={20} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicSettings;
