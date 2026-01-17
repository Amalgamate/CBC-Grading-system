/**
 * Summative Tests Page
 * Create and manage summative tests
 */

import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, X } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import { useNotifications } from '../hooks/useNotifications';

const SummativeTests = () => {
  const { showSuccess, showError } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedTest, setSelectedTest] = useState(null);
  const [testData, setTestData] = useState({
    name: '', grade: 'Grade 3', learningArea: 'Mathematics Activities', term: 'Term 1',
    year: '2026', testType: 'End of Term', date: '', duration: 90, totalMarks: 100,
    passMarks: 50, instructions: ''
  });

  const [tests, setTests] = useState([
    { id: 1, name: 'Mathematics End of Term 1', grade: 'Grade 3', learningArea: 'Mathematics Activities', term: 'Term 1', year: '2026', testType: 'End of Term', date: '2026-03-15', duration: 90, totalMarks: 100, passMarks: 50, status: 'Published' },
    { id: 2, name: 'Literacy Mid-Term Assessment', grade: 'Grade 4', learningArea: 'Literacy Activities', term: 'Term 1', year: '2026', testType: 'Mid-term', date: '2026-02-10', duration: 60, totalMarks: 50, passMarks: 25, status: 'Draft' },
    { id: 3, name: 'Environmental Activities Quiz', grade: 'Grade 3', learningArea: 'Environmental Activities', term: 'Term 1', year: '2026', testType: 'Tuner-Up', date: '2026-01-25', duration: 30, totalMarks: 30, passMarks: 15, status: 'Completed' }
  ]);

  const handleAdd = () => {
    setModalMode('add');
    setTestData({ name: '', grade: 'Grade 3', learningArea: 'Mathematics Activities', term: 'Term 1', year: '2026', testType: 'End of Term', date: '', duration: 90, totalMarks: 100, passMarks: 50, instructions: '' });
    setShowModal(true);
  };

  const handleEdit = (test) => {
    setModalMode('edit');
    setSelectedTest(test);
    setTestData(test);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setTests(prev => prev.filter(t => t.id !== id));
    showSuccess('Test deleted successfully!');
  };

  const handleSave = () => {
    if (modalMode === 'add') {
      setTests(prev => [...prev, { ...testData, id: prev.length + 1, status: 'Draft' }]);
      showSuccess('Test created successfully!');
    } else {
      setTests(prev => prev.map(t => t.id === selectedTest.id ? { ...testData, id: selectedTest.id } : t));
      showSuccess('Test updated successfully!');
    }
    setShowModal(false);
  };

  const handlePublish = (test) => {
    setTests(prev => prev.map(t => t.id === test.id ? { ...t, status: 'Published' } : t));
    showSuccess(`${test.name} published successfully!`);
  };

  const stats = {
    total: tests.length,
    draft: tests.filter(t => t.status === 'Draft').length,
    published: tests.filter(t => t.status === 'Published').length,
    completed: tests.filter(t => t.status === 'Completed').length
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Summative Tests"
        subtitle="Create and manage summative tests and examinations"
        icon={FileText}
        actions={
          <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus size={20} /> Create New Test
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm font-semibold">Total Tests</p>
          <p className="text-3xl font-bold text-blue-800">{stats.total}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-orange-700 text-sm font-semibold">Draft</p>
          <p className="text-3xl font-bold text-orange-800">{stats.draft}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm font-semibold">Published</p>
          <p className="text-3xl font-bold text-green-800">{stats.published}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 text-sm font-semibold">Completed</p>
          <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Test Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Learning Area</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tests.map(test => (
                <tr key={test.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{test.name}</p>
                    <p className="text-sm text-gray-500">{test.term} {test.year}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{test.grade}</td>
                  <td className="px-6 py-4 text-gray-700">{test.learningArea}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                      test.testType === 'End of Term' ? 'bg-purple-100 text-purple-800' :
                      test.testType === 'Mid-term' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>{test.testType}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{test.date}</td>
                  <td className="px-6 py-4 text-gray-700">{test.totalMarks}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                      test.status === 'Published' ? 'bg-green-100 text-green-800' :
                      test.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>{test.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(test)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <Edit size={18} />
                      </button>
                      {test.status === 'Draft' && (
                        <button onClick={() => handlePublish(test)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Publish">
                          <Eye size={18} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(test.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{modalMode === 'add' ? 'Create New Test' : 'Edit Test'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Test Name</label>
                <input type="text" value={testData.name} onChange={(e) => setTestData({...testData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter test name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
                  <select value={testData.grade} onChange={(e) => setTestData({...testData, grade: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    {['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Learning Area</label>
                  <select value={testData.learningArea} onChange={(e) => setTestData({...testData, learningArea: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    {['Mathematics Activities', 'Literacy Activities', 'Kiswahili Activities', 'Environmental Activities'].map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Term</label>
                  <select value={testData.term} onChange={(e) => setTestData({...testData, term: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    {['Term 1', 'Term 2', 'Term 3'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                  <input type="text" value={testData.year} onChange={(e) => setTestData({...testData, year: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Test Type</label>
                  <select value={testData.testType} onChange={(e) => setTestData({...testData, testType: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    {['Tuner-Up', 'Mid-term', 'End of Term'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                  <input type="date" value={testData.date} onChange={(e) => setTestData({...testData, date: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (min)</label>
                  <input type="number" value={testData.duration} onChange={(e) => setTestData({...testData, duration: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks</label>
                  <input type="number" value={testData.totalMarks} onChange={(e) => setTestData({...testData, totalMarks: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pass Marks</label>
                <input type="number" value={testData.passMarks} onChange={(e) => setTestData({...testData, passMarks: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instructions</label>
                <textarea value={testData.instructions} onChange={(e) => setTestData({...testData, instructions: e.target.value})} rows="3" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter test instructions" />
              </div>
              <div className="flex gap-3 pt-4 border-t">
                <button onClick={handleSave} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold">
                  {modalMode === 'add' ? 'Create Test' : 'Update Test'}
                </button>
                <button onClick={() => setShowModal(false)} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummativeTests;
