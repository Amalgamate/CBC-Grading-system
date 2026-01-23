/**
 * User Management Page
 */

import React, { useState } from 'react';
import { 
  UserPlus, Edit, Trash2, X
} from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';

const UserManagement = () => {
  const { showSuccess } = useNotifications();
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([
    { id: 1, name: 'Sarah Muthoni', email: 'sarah@school.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'John Kamau', email: 'john@school.com', role: 'Teacher', status: 'Active' },
    { id: 3, name: 'Hassan Mohamed', email: 'hassan@email.com', role: 'Parent', status: 'Active' }
  ]);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Teacher', phone: '' });

  const handleSave = () => {
    setUsers(prev => [...prev, { ...formData, id: prev.length + 1, status: 'Active' }]);
    showSuccess('User added successfully!');
    setShowModal(false);
    setFormData({ name: '', email: '', role: 'Teacher', phone: '' });
  };

  return (
    <div className="space-y-6">
      {/* Compact Action Toolbar */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex justify-end">
        <button 
          onClick={() => setShowModal(true)} 
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          <UserPlus size={20} /> 
          <span>Add User</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-gray-800">{user.name}</td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'Teacher' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>{user.role}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">{user.status}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                    <button onClick={() => {setUsers(prev => prev.filter(u => u.id !== user.id)); showSuccess('User deleted');}} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-blue-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Add New User</h3>
              <button onClick={() => setShowModal(false)} className="text-white"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Full Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                  {['Admin', 'Teacher', 'Parent'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <button onClick={handleSave} className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">Add User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
