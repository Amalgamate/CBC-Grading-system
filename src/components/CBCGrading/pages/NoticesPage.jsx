/**
 * Notices Page
 */

import React, { useState } from 'react';
import { Plus, Edit, Trash2, X, Eye } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const NoticesPage = () => {
  const { showSuccess } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const [notices, setNotices] = useState([
    { id: 1, title: 'Term 1 Examination Schedule', content: 'Exams will begin on March 10, 2026...', author: 'Sarah Muthoni', date: '2026-01-10', category: 'Academic', priority: 'High', status: 'Published' },
    { id: 2, title: 'Parent-Teacher Meeting', content: 'All parents are invited...', author: 'John Kamau', date: '2026-01-15', category: 'Event', priority: 'Medium', status: 'Published' }
  ]);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'Academic', priority: 'Medium' });

  const handleSave = () => {
    setNotices(prev => [...prev, { ...formData, id: prev.length + 1, author: 'Current User', date: new Date().toISOString().split('T')[0], status: 'Published' }]);
    showSuccess('Notice published successfully!');
    setShowModal(false);
    setFormData({ title: '', content: '', category: 'Academic', priority: 'Medium' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Plus size={20} /> Create Notice</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {notices.map(notice => (
          <div key={notice.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{notice.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${notice.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{notice.priority}</span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">{notice.category}</span>
                </div>
                <p className="text-gray-600 mb-3">{notice.content}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>By {notice.author}</span>
                  <span>•</span>
                  <span>{notice.date}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Edit size={18} /></button>
                <button onClick={() => {setNotices(prev => prev.filter(n => n.id !== notice.id)); showSuccess('Notice deleted');}} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Create New Notice</h3>
              <button onClick={() => setShowModal(false)} className="text-white"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Title</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Content</label>
                <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows="6" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    {['Academic', 'Event', 'Administrative', 'Sports', 'General'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleSave} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">Publish Notice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesPage;
