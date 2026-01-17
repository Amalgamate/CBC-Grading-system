/**
 * Branding Settings Page
 */

import React, { useState } from 'react';
import { Palette, Save, RefreshCw } from 'lucide-react';
import PageHeader from '../../shared/PageHeader';
import { useNotifications } from '../../hooks/useNotifications';

const BrandingSettings = () => {
  const { showSuccess } = useNotifications();
  const [colors, setColors] = useState({
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B'
  });

  const handleSave = () => {
    showSuccess('Branding settings saved successfully!');
  };

  const handleReset = () => {
    setColors({ primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B' });
    showSuccess('Reset to default colors');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Branding Settings" subtitle="Customize school branding colors" icon={Palette} />

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold mb-4">Color Scheme</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { key: 'primary', label: 'Primary Color', desc: 'Main brand color' },
                { key: 'secondary', label: 'Secondary Color', desc: 'Secondary actions' },
                { key: 'accent', label: 'Accent Color', desc: 'Highlights & accents' }
              ].map(item => (
                <div key={item.key} className="border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{item.label}</label>
                  <p className="text-xs text-gray-500 mb-3">{item.desc}</p>
                  <div className="flex items-center gap-3">
                    <input type="color" value={colors[item.key]} onChange={(e) => setColors({...colors, [item.key]: e.target.value})} className="w-16 h-16 border border-gray-300 rounded cursor-pointer" />
                    <div className="flex-1">
                      <div className="w-full h-16 rounded" style={{ backgroundColor: colors[item.key] }}></div>
                      <p className="text-xs text-gray-600 mt-2 font-mono">{colors[item.key]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Preview</h3>
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex gap-3 mb-4">
                <button className="px-4 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: colors.primary }}>Primary Button</button>
                <button className="px-4 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: colors.secondary }}>Secondary Button</button>
                <button className="px-4 py-2 rounded-lg text-white font-semibold" style={{ backgroundColor: colors.accent }}>Accent Button</button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded-lg text-white" style={{ backgroundColor: colors.primary }}>
                  <p className="font-bold">Primary Card</p>
                  <p className="text-sm opacity-90">Sample content</p>
                </div>
                <div className="p-4 rounded-lg text-white" style={{ backgroundColor: colors.secondary }}>
                  <p className="font-bold">Secondary Card</p>
                  <p className="text-sm opacity-90">Sample content</p>
                </div>
                <div className="p-4 rounded-lg text-white" style={{ backgroundColor: colors.accent }}>
                  <p className="font-bold">Accent Card</p>
                  <p className="text-sm opacity-90">Sample content</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6 border-t">
            <button onClick={handleReset} className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
              <RefreshCw size={20} /> Reset to Default
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
              <Save size={20} /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingSettings;
