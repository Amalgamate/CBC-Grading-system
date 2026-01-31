import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, CheckCircle, Loader, Calendar, BookOpen,
    Layers, Clock, ClipboardList, ListChecks, Database
} from 'lucide-react';
import { assessmentAPI, gradingAPI } from '../../../services/api';
import { useNotifications } from '../hooks/useNotifications';

const GRADES = [
    'PLAYGROUP', 'PP1', 'PP2',
    'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6',
    'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12'
];

const LEARNING_AREAS_COUNT = 14;

const TEST_TYPES = [
    'OPENER', 'MIDTERM', 'END_TERM', 'MONTHLY', 'WEEKLY', 'RANDOM'
];

const TERMS = ['TERM 1', 'TERM 2', 'TERM 3'];

const BulkCreateTest = ({ onBack, onSuccess }) => {
    const { showSuccess, showError } = useNotifications();
    const [saving, setSaving] = useState(false);
    const [loadingScales, setLoadingScales] = useState(false);
    const [scaleGroups, setScaleGroups] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        testType: 'MONTHLY',
        term: 'TERM 1',
        academicYear: new Date().getFullYear().toString(),
        testDate: new Date().toISOString().split('T')[0],
        totalMarks: '100',
        passMarks: '50',
        duration: '120',
        description: '',
        instructions: '',
        scaleGroupId: ''
    });

    const [selectedGrades, setSelectedGrades] = useState(['GRADE_6']);

    useEffect(() => {
        loadScales();
    }, []);

    const loadScales = async () => {
        setLoadingScales(true);
        try {
            const response = await gradingAPI.getScaleGroups();
            setScaleGroups(response.data || []);
        } catch (err) {
            console.error('Error loading scales:', err);
        } finally {
            setLoadingScales(false);
        }
    };

    const handleGradeToggle = (grade) => {
        setSelectedGrades(prev => {
            if (prev.includes(grade)) {
                return prev.filter(g => g !== grade);
            } else {
                return [...prev, grade];
            }
        });
    };

    const handleSelectAllGrades = () => {
        if (selectedGrades.length === GRADES.length) {
            setSelectedGrades([]);
        } else {
            setSelectedGrades([...GRADES]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            showError('Please enter a test series name');
            return;
        }

        if (selectedGrades.length === 0) {
            showError('Please select at least one grade level');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                ...formData,
                term: formData.term.replace(' ', '_'), // Backend might expect TERM_1
                grades: selectedGrades
            };

            const response = await assessmentAPI.bulkCreateTests(payload);

            if (response.success) {
                showSuccess(`Successfully created ${response.data.createdCount} tests across ${selectedGrades.length} grades!`);
                onSuccess && onSuccess();
            } else {
                showError(response.message || 'Failed to create tests');
            }
        } catch (err) {
            console.error('Error bulk creating tests:', err);
            showError('Failed to create tests: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const formatGradeDisplay = (grade) => {
        return grade.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const allSelected = selectedGrades.length === GRADES.length;
    const someSelected = selectedGrades.length > 0 && selectedGrades.length < GRADES.length;

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition border border-gray-200"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Bulk Create Summative Tests</h1>
                        <p className="text-sm text-gray-500">Generate tests for multiple grades and all learning areas at once</p>
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={saving || !formData.title.trim() || selectedGrades.length === 0}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                    {saving ? 'Creating...' : 'Create & Auto-Generate'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Test Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <ClipboardList className="text-blue-600" size={18} />
                            Test Series Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Test Series Name *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Term 1 Opening Exams"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="mt-1 text-xs text-gray-500">This will be the prefix for each generated test</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Test Type</label>
                                <select
                                    value={formData.testType}
                                    onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {TEST_TYPES.map(type => (
                                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Performance Scale Profile</label>
                                <div className="relative">
                                    <select
                                        value={formData.scaleGroupId}
                                        onChange={(e) => setFormData({ ...formData, scaleGroupId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                        disabled={loadingScales}
                                    >
                                        <option value="">-- No specific scale (will auto-link) --</option>
                                        {scaleGroups.map(group => (
                                            <option key={group.id} value={group.id}>{group.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400">
                                        {loadingScales ? <Loader className="animate-spin" size={16} /> : <Database size={16} />}
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Link tests to a specific grade-wide scale group</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Term</label>
                                <select
                                    value={formData.term}
                                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    {TERMS.map(term => (
                                        <option key={term} value={term}>{term}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Academic Year</label>
                                <input
                                    type="number"
                                    value={formData.academicYear}
                                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Test Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={formData.testDate}
                                        onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Total Marks</label>
                                <input
                                    type="number"
                                    value={formData.totalMarks}
                                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Pass Marks</label>
                                <input
                                    type="number"
                                    value={formData.passMarks}
                                    onChange={(e) => setFormData({ ...formData, passMarks: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Duration (Mins)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                    <Clock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                            <Layers className="text-blue-600" size={18} />
                            Target Grade Levels
                        </h2>

                        <button
                            type="button"
                            onClick={handleSelectAllGrades}
                            className={`flex items-center gap-2 px-4 py-2 mb-4 rounded-lg border-2 transition font-semibold ${allSelected
                                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                                    : someSelected
                                        ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${allSelected ? 'bg-white border-white' : someSelected ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-400'
                                }`}>
                                {allSelected && <CheckCircle size={16} className="text-blue-600" />}
                                {someSelected && !allSelected && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                            </div>
                            {allSelected ? 'Deselect All Grades' : 'Select All Grades'}
                        </button>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {GRADES.map(grade => {
                                const isSelected = selectedGrades.includes(grade);
                                return (
                                    <label
                                        key={grade}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 cursor-pointer transition ${isSelected
                                                ? 'bg-blue-50 border-blue-500 hover:bg-blue-100'
                                                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleGradeToggle(grade)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                        />
                                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                            {formatGradeDisplay(grade)}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Preview & Summary */}
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm sticky top-6">
                        <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4 text-lg">
                            <ListChecks className="text-blue-600" size={20} />
                            Auto-Generation Preview
                        </h3>

                        <div className="space-y-4">
                            <div className="bg-white/50 rounded-lg p-3 border border-blue-100">
                                <p className="text-xs text-blue-600 uppercase font-bold tracking-wider mb-1">Calculated Tests</p>
                                <div className="flex items-end gap-2 text-blue-900">
                                    <span className="text-3xl font-black">{selectedGrades.length * LEARNING_AREAS_COUNT}</span>
                                    <span className="text-sm font-bold mb-1">Total Tests</span>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-blue-800">
                                <div className="flex justify-between items-center">
                                    <span>Learning Areas per Grade:</span>
                                    <span className="font-bold text-blue-900">{LEARNING_AREAS_COUNT}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Target Grade Levels:</span>
                                    <span className="font-bold text-blue-900">{selectedGrades.length}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                                    <span className="font-bold">Total Generation:</span>
                                    <span className="font-bold text-blue-900">{selectedGrades.length * LEARNING_AREAS_COUNT} records</span>
                                </div>
                            </div>

                            {selectedGrades.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                    <p className="text-xs font-bold text-blue-600 uppercase mb-3">Target Grades:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedGrades.map(grade => (
                                            <span key={grade} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold border border-blue-200">
                                                {formatGradeDisplay(grade)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
                                <div className="flex gap-2">
                                    <BookOpen className="text-amber-600 flex-shrink-0" size={16} />
                                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                        Tests will be created for standard learning areas (Math, English, Science, etc.) for each selected grade level.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkCreateTest;
