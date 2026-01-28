import React, { useEffect, useState } from 'react';

export default function Settings() {
  const [theme, setTheme] = useState(localStorage.getItem('adminTheme') || 'light');
  useEffect(() => {
    localStorage.setItem('adminTheme', theme);
  }, [theme]);
  return (
    <div className="bg-white border border-indigo-100 rounded-xl p-4 space-y-4">
      <div className="text-sm font-semibold text-gray-900">Preferences</div>
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-700">Theme</label>
        <select className="border rounded-lg px-3 py-2" value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <div className="text-xs text-gray-600">Preference is saved locally.</div>
    </div>
  );
}
