/**
 * Parents List Page
 * Display and manage parent/guardian information
 */

import React, { useState } from 'react';
import { Plus, Eye, Edit, Trash2, Users, Mail, Phone, User, MapPin } from 'lucide-react';
import PageHeader from '../shared/PageHeader';
import SearchFilter from '../shared/SearchFilter';
import EmptyState from '../shared/EmptyState';

const ParentsList = ({ parents = [], onAddParent, onEditParent, onViewParent, onDeleteParent }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter parents
  const filteredParents = parents.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Parents & Guardians"
        subtitle="Manage parent and guardian information"
        icon={Users}
        actions={
          <button 
            onClick={onAddParent}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Plus size={20} />
            Add Parent
          </button>
        }
      />

      {/* Search */}
      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[]}
        onReset={() => setSearchTerm('')}
        placeholder="Search parents by name, phone, or email..."
      />

      {/* Parents Grid */}
      {filteredParents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Parents Found"
          message={searchTerm ? "No parents match your search criteria." : "No parents have been added yet."}
          actionText={!searchTerm ? "Add Your First Parent" : null}
          onAction={onAddParent}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParents.map((parent) => (
            <div key={parent.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {parent.name?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{parent.name}</h3>
                    <p className="text-xs text-gray-500">{parent.relationship}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-purple-600" />
                  <span className="truncate">{parent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} className="text-purple-600" />
                  <span>{parent.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={16} className="text-purple-600" />
                  <span>{parent.occupation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-purple-600" />
                  <span className="truncate">{parent.county}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Users size={14} />
                <span>{parent.learnerIds?.length || 0} learner(s)</span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => onViewParent(parent)}
                  className="flex-1 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm font-medium"
                >
                  View Details
                </button>
                <button 
                  onClick={() => onEditParent(parent)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => onDeleteParent(parent.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentsList;
