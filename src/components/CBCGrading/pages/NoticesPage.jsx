import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Eye, Cake, Bell, Megaphone, RefreshCw } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import api from '../../../services/api';

const NoticesPage = () => {
  const { showSuccess } = useNotifications();
  
  // Get initial tab from localStorage or URL, default to 'notices'
  const getInitialTab = () => {
    // First check URL params
    const params = new URLSearchParams(window.location.search);
    const urlTab = params.get('tab');
    if (urlTab && ['notices', 'birthdays'].includes(urlTab)) {
      return urlTab;
    }
    // Then check localStorage
    const savedTab = localStorage.getItem('noticesPage_activeTab');
    if (savedTab && ['notices', 'birthdays'].includes(savedTab)) {
      return savedTab;
    }
    return 'notices';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [showModal, setShowModal] = useState(false);
  const [loadingBirthdays, setLoadingBirthdays] = useState(false);
  const [birthdays, setBirthdays] = useState([]);
  const [notices, setNotices] = useState([
    { id: 1, title: 'Term 1 Examination Schedule', content: 'Exams will begin on March 10, 2026...', author: 'Sarah Muthoni', date: '2026-01-10', category: 'Academic', priority: 'High', status: 'Published' },
    { id: 2, title: 'Parent-Teacher Meeting', content: 'All parents are invited...', author: 'John Kamau', date: '2026-01-15', category: 'Event', priority: 'Medium', status: 'Published' }
  ]);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'Academic', priority: 'Medium' });

  // Update localStorage and URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('noticesPage_activeTab', tab);
    // Update URL without page reload
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url);
  };

  // Refresh function that maintains current tab
  const handleRefresh = () => {
    if (activeTab === 'birthdays') {
      fetchBirthdays();
    }
    showSuccess('Page refreshed!');
  };

  useEffect(() => {
    if (activeTab === 'birthdays') {
      fetchBirthdays();
    }
  }, [activeTab]);

  const fetchBirthdays = async () => {
    setLoadingBirthdays(true);
    try {
      const resp = await api.learners.getBirthdays();
      if (resp.success) {
        setBirthdays(resp.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch birthdays:', error);
    } finally {
      setLoadingBirthdays(false);
    }
  };

  const handleSave = () => {
    setNotices(prev => [...prev, { ...formData, id: prev.length + 1, author: 'Current User', date: new Date().toISOString().split('T')[0], status: 'Published' }]);
    showSuccess('Notice published successfully!');
    setShowModal(false);
    setFormData({ title: '', content: '', category: 'Academic', priority: 'Medium' });
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector with Refresh Button */}
      <div className="flex border-b border-gray-200 bg-white rounded-t-xl px-4 justify-between items-center">
        <div className="flex">
          <button
            onClick={() => handleTabChange('notices')}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'notices' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Megaphone size={16} />
            <span>School Notices</span>
          </button>
          <button
            onClick={() => handleTabChange('birthdays')}
            className={`px-6 py-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'birthdays' ? 'border-pink-600 text-pink-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Cake size={16} />
            <span>This Week's Birthdays</span>
            {birthdays.length > 0 && <span className="bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full text-[10px]">{birthdays.length}</span>}
          </button>
        </div>
        
        {/* Refresh Button */}
        <button 
          onClick={handleRefresh}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} className="text-gray-600" />
        </button>
      </div>

      {activeTab === 'notices' ? (
        <div className="space-y-6">
          <div className="flex justify-end mb-4 pt-2">
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">
              <Plus size={20} />
              <span>Create Notice</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {notices.map(notice => (
              <div key={notice.id} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{notice.title}</h3>
                      <span className={`px-2 py-1 text-[10px] font-black uppercase rounded ${notice.priority === 'High' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{notice.priority}</span>
                      <span className="px-2 py-1 text-[10px] font-black uppercase bg-gray-100 text-gray-800 rounded">{notice.category}</span>
                    </div>
                    <p className="text-gray-600 mb-3">{notice.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="font-medium">By {notice.author}</span>
                      <span>•</span>
                      <span>{notice.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={18} /></button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Edit size={18} /></button>
                    <button onClick={() => { setNotices(prev => prev.filter(n => n.id !== notice.id)); showSuccess('Notice deleted'); }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-b-xl shadow-md p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-pink-100 rounded-2xl">
              <Cake size={32} className="text-pink-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800">Birthday Celebrations</h2>
              <p className="text-gray-500">Upcoming birthdays for current week (within next 7 days)</p>
            </div>
          </div>

          {loadingBirthdays ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-4 text-gray-500 font-medium">Loading upcoming celebrations...</p>
            </div>
          ) : birthdays.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Student Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Admission No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Grade</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stream</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Birthday Date</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Turning Age</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {birthdays.map((b, index) => (
                      <tr 
                        key={b.id} 
                        className={`hover:bg-gray-50 transition ${
                          b.isToday ? 'bg-pink-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800 text-sm">{b.name}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{b.admissionNumber}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                            {b.grade.replace('GRADE_', 'Grade ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{b.stream}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(b.dateOfBirth).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-center text-sm font-semibold text-gray-800">{b.turningAge}</td>
                        <td className="px-4 py-3 text-center">
                          {b.isToday ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-600 text-white">
                              Today! 🎉
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                              {b.daysUntil} day{b.daysUntil !== 1 ? 's' : ''}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Stats */}
              <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Cake size={16} className="text-pink-600" />
                    <span className="font-semibold text-gray-700">
                      Total: {birthdays.length} birthday{birthdays.length !== 1 ? 's' : ''} this week
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>Today: {birthdays.filter(b => b.isToday).length}</span>
                    <span>•</span>
                    <span>Upcoming: {birthdays.filter(b => !b.isToday).length}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Bell size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-600">No Birthdays This Week</h3>
              <p className="text-gray-400 max-w-sm mx-auto mt-2">There are no student birthdays scheduled for the next 7 days. Check back next week!</p>
            </div>
          )}
        </div>
      )}

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
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Content</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows="6" className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    {['Academic', 'Event', 'Administrative', 'Sports', 'General'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-2 border rounded-lg">
                    {['Low', 'Medium', 'High'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={handleSave} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold shadow-md">Publish Notice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticesPage;
