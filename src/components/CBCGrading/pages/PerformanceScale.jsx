/**
 * Performance Scale Page
 */

import React, { useState } from 'react';
import { Award, Save } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { useNotifications } from '../hooks/useNotifications';

const PerformanceScale = () => {
  const { showSuccess } = useNotifications();
  const [scale, setScale] = useState([
    { grade: 'A', minPercent: 80, maxPercent: 100, description: 'Exceeds Expectations', color: 'green' },
    { grade: 'B', minPercent: 65, maxPercent: 79, description: 'Meets Expectations', color: 'blue' },
    { grade: 'C', minPercent: 50, maxPercent: 64, description: 'Approaches Expectations', color: 'yellow' },
    { grade: 'D', minPercent: 40, maxPercent: 49, description: 'Below Expectations', color: 'orange' },
    { grade: 'E', minPercent: 0, maxPercent: 39, description: 'Does Not Meet Expectations', color: 'red' }
  ]);

  const handleChange = (index, field, value) => {
    const newScale = [...scale];
    newScale[index] = { ...newScale[index], [field]: parseFloat(value) || 0 };
    setScale(newScale);
  };

  const handleSave = () => {
    showSuccess('Performance scale updated successfully!');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Performance Scale" subtitle="Configure CBC grading scale" icon={Award} />

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">CBC Grading System</h3>
        <p className="text-blue-800">Configure the grade boundaries for summative assessments according to CBC guidelines.</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-6">Grade Scale Configuration</h3>
        <div className="space-y-4">
          {scale.map((item, index) => (
            <div key={item.grade} className={`border-2 border-${item.color}-200 rounded-lg p-4 bg-${item.color}-50`}>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Grade</p>
                  <div className={`w-16 h-16 bg-${item.color}-600 text-white rounded-lg flex items-center justify-center`}>
                    <span className="text-2xl font-bold">{item.grade}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Min %</label>
                  <input type="number" value={item.minPercent} onChange={(e) => handleChange(index, 'minPercent', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Max %</label>
                  <input type="number" value={item.maxPercent} onChange={(e) => handleChange(index, 'maxPercent', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                  <input type="text" value={item.description} onChange={(e) => handleChange(index, 'description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setScale([
            { grade: 'A', minPercent: 80, maxPercent: 100, description: 'Exceeds Expectations', color: 'green' },
            { grade: 'B', minPercent: 65, maxPercent: 79, description: 'Meets Expectations', color: 'blue' },
            { grade: 'C', minPercent: 50, maxPercent: 64, description: 'Approaches Expectations', color: 'yellow' },
            { grade: 'D', minPercent: 40, maxPercent: 49, description: 'Below Expectations', color: 'orange' },
            { grade: 'E', minPercent: 0, maxPercent: 39, description: 'Does Not Meet Expectations', color: 'red' }
          ])} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">
            Reset to Default
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
            <Save size={20} /> Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4">Preview</h3>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Grade</th>
              <th className="px-4 py-2 text-center">Range</th>
              <th className="px-4 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {scale.map(item => (
              <tr key={item.grade} className="border-t">
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-${item.color}-100 text-${item.color}-800 font-bold`}>{item.grade}</span>
                </td>
                <td className="px-4 py-2 text-center font-semibold">{item.minPercent}% - {item.maxPercent}%</td>
                <td className="px-4 py-2">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PerformanceScale;
