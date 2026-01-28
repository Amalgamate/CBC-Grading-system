import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { notificationAPI, adminAPI } from '../../../services/api';

export default function Notifications() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [schools, setSchools] = useState([]);
  React.useEffect(() => {
    adminAPI.listSchools().then((s) => setSchools(s.data || [])).catch(() => {});
  }, []);
  const send = async () => {
    setStatus('processing');
    try {
      localStorage.setItem('currentSchoolId', schoolId || '');
      await notificationAPI.sendAnnouncement({ title, content });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };
  return (
    <div className="bg-white border border-indigo-100 rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="w-5 h-5 text-indigo-700" />
        <div className="text-sm font-semibold text-gray-900">Send Announcement</div>
      </div>
      <select className="border rounded-lg px-3 py-2" value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
        <option value="">Select school</option>
        {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <input className="border rounded-lg px-3 py-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="border rounded-lg px-3 py-2 h-32" placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
      <button
        className="px-4 py-2 rounded bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-sm"
        disabled={!title || !content || !schoolId || status === 'processing'}
        onClick={send}
      >
        {status === 'processing' ? 'Sending...' : 'Send'}
      </button>
      {status === 'sent' && <div className="text-sm text-green-700">Announcement sent</div>}
      {status === 'error' && <div className="text-sm text-red-700">Send failed</div>}
    </div>
  );
}
