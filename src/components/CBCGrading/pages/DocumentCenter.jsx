import React, { useState } from 'react';
import {
    Folder, FileText, Upload, Search, MoreVertical,
    File, Image, FileSpreadsheet, Trash2,
    Clock, Filter
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

const DocumentCenter = () => {
    const { showInfo } = useNotifications();
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Mock Categories
    const categories = [
        { id: 'all', label: 'All Documents', icon: Folder },
        { id: 'inbox', label: 'Inbox', icon: Clock },
        { id: 'finance', label: 'Finance', icon: FileSpreadsheet },
        { id: 'hr', label: 'Human Resources', icon: UsersIcon },
        { id: 'academic', label: 'Academic', icon: GraduationCapIcon },
        { id: 'marketing', label: 'Marketing', icon: Image },
        { id: 'trash', label: 'Trash', icon: Trash2, className: 'text-red-600' }
    ];

    // Mock Files
    const [files] = useState([
        { id: 1, name: 'School_Policy_2026.pdf', category: 'hr', type: 'pdf', size: '2.4 MB', date: '2026-02-01', owner: 'John Doe' },
        { id: 2, name: 'Term_1_Budget.xlsx', category: 'finance', type: 'excel', size: '1.1 MB', date: '2026-01-15', owner: 'Finance Dept' },
        { id: 3, name: 'Logo_HighRes.png', category: 'marketing', type: 'image', size: '4.5 MB', date: '2025-12-10', owner: 'Admin' },
        { id: 4, name: 'Staff_Meeting_Minutes.docx', category: 'academic', type: 'doc', size: '500 KB', date: '2026-02-05', owner: 'Sarah Smith' },
        { id: 5, name: 'Student_List_Grade4.csv', category: 'academic', type: 'csv', size: '120 KB', date: '2026-02-07', owner: 'Registrar' },
        { id: 6, name: 'Invoice_#1023.pdf', category: 'finance', type: 'pdf', size: '800 KB', date: '2026-02-02', owner: 'Finance Dept' },
    ]);

    const filteredFiles = files.filter(file => {
        const matchesCategory = activeCategory === 'all' || file.category === activeCategory;
        const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleUpload = () => {
        showInfo('File upload simulation: Drag and drop files here.');
    };

    const getFileIcon = (type) => {
        switch (type) {
            case 'pdf': return <FileText className="text-red-500" />;
            case 'excel': return <FileSpreadsheet className="text-green-600" />;
            case 'csv': return <FileSpreadsheet className="text-green-500" />;
            case 'image': return <Image className="text-purple-500" />;
            case 'doc': return <FileText className="text-blue-500" />;
            default: return <File className="text-gray-500" />;
        }
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 bg-gray-50 p-6">

            {/* Sidebar Categories */}
            <div className="w-64 flex-shrink-0 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
                <button
                    onClick={handleUpload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-6 transition shadow-md"
                >
                    <Upload size={20} />
                    Upload File
                </button>

                <div className="space-y-1 overflow-y-auto flex-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeCategory === cat.id
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <cat.icon size={18} className={cat.className || ''} />
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs font-semibold text-blue-800 mb-1">Storage Status</div>
                        <div className="w-full bg-blue-200 rounded-full h-1.5 mb-1">
                            <div className="bg-blue-600 h-1.5 rounded-full w-[45%]"></div>
                        </div>
                        <div className="text-xs text-blue-600">4.5 GB of 10 GB used</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Header / Toolbar */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xl font-bold text-gray-800">
                        {categories.find(c => c.id === activeCategory)?.label}
                        <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            {filteredFiles.length}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 flex-1 justify-end">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                        <div className="h-8 w-px bg-gray-200 mx-1"></div>
                        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Filter">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* File Grid/List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredFiles.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Folder size={64} className="mb-4 text-gray-200" />
                            <p className="text-lg font-medium">No documents found</p>
                            <p className="text-sm">Try adjusting your search or category</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredFiles.map(file => (
                                <div key={file.id} className="group relative bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md rounded-xl p-4 transition cursor-pointer flex flex-col items-center text-center">
                                    <div className="w-12 h-12 mb-3 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-white transition">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-700 truncate w-full mb-1" title={file.name}>
                                        {file.name}
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-2">{file.size} • {file.date}</p>

                                    {/* Quick Actions (Hover) */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                        <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Drag Drop Placeholder */}
                            <div
                                onClick={handleUpload}
                                className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition cursor-pointer"
                            >
                                <Upload size={24} className="mb-2" />
                                <span className="text-xs font-semibold">Upload New</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Simple icon placeholders for missing ones imports 
const UsersIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const GraduationCapIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
);


export default DocumentCenter;
