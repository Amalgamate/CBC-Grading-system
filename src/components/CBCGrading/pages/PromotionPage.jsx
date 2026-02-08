/**
 * Promotion Page
 * Promote learners to next grade level
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, Users } from 'lucide-react';
import EmptyState from '../shared/EmptyState';
import { useAuth } from '../../../hooks/useAuth';
import { configAPI } from '../../../services/api';

const PromotionPage = ({ learners = [], onPromote, showNotification }) => {
  const { user } = useAuth();
  const [sourceGrade, setSourceGrade] = useState('Grade 3');
  const [sourceStream, setSourceStream] = useState('all');
  const [selectedLearners, setSelectedLearners] = useState([]);
  const [availableStreams, setAvailableStreams] = useState([]);

  // Fetch streams
  useEffect(() => {
    const fetchStreams = async () => {
      if (user?.schoolId) {
        try {
          const resp = await configAPI.getStreamConfigs(user.schoolId);
          const arr = resp?.data || [];
          setAvailableStreams(arr.filter(s => s.active));
        } catch (error) {
          console.error('Failed to fetch streams:', error);
        }
      }
    };
    fetchStreams();
  }, [user?.schoolId]);

  // Get learners for selected class
  const classLearners = learners.filter(l =>
    l.grade === sourceGrade &&
    l.status === 'Active' &&
    (sourceStream === 'all' || l.stream === sourceStream)
  );

  // Toggle learner selection
  const toggleLearner = (learnerId) => {
    setSelectedLearners(prev =>
      prev.includes(learnerId)
        ? prev.filter(id => id !== learnerId)
        : [...prev, learnerId]
    );
  };

  // Select all learners
  const selectAll = () => {
    setSelectedLearners(classLearners.map(l => l.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedLearners([]);
  };

  // Get next grade
  const getNextGrade = (currentGrade) => {
    const gradeNum = parseInt(currentGrade.split(' ')[1]);
    return gradeNum === 6 ? 'Graduated' : `Grade ${gradeNum + 1}`;
  };

  // Handle promotion
  const handlePromote = () => {
    if (selectedLearners.length === 0) {
      showNotification('Please select learners to promote', 'warning');
      return;
    }

    const nextGrade = getNextGrade(sourceGrade);
    onPromote(selectedLearners, nextGrade);
    setSelectedLearners([]);
    showNotification(`Successfully promoted ${selectedLearners.length} learner(s) to ${nextGrade}`, 'success');
  };

  return (
    <div className="space-y-6">

      {/* Step 1: Select Source Class */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-black mb-4 text-brand-purple uppercase tracking-widest">Step 1: Select Source Class</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grade Level</label>
            <div className="relative">
              <select
                value={sourceGrade}
                onChange={(e) => {
                  setSourceGrade(e.target.value);
                  setSelectedLearners([]);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition bg-white appearance-none"
              >
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 6">Grade 6</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Stream / Class</label>
            <div className="relative">
              <select
                value={sourceStream}
                onChange={(e) => {
                  setSourceStream(e.target.value);
                  setSelectedLearners([]);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-transparent transition bg-white appearance-none"
              >
                <option value="all">All Streams</option>
                {availableStreams.map(stream => (
                  <option key={stream.id} value={stream.name}>
                    {stream.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex gap-3">
            <button
              onClick={selectAll}
              className="flex-1 px-4 py-3 bg-brand-teal text-white rounded-lg hover:bg-brand-teal/90 transition shadow-md font-bold text-sm uppercase tracking-wide"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium shadow-sm"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Select Learners */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-black mb-4 text-brand-purple uppercase tracking-widest">
          Step 2: Select Learners to Promote ({selectedLearners.length} selected)
        </h3>

        {classLearners.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Learners Found"
            message="No eligible learners found for promotion in this class"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classLearners.map((learner) => {
              const nextGrade = getNextGrade(learner.grade);
              const isSelected = selectedLearners.includes(learner.id);

              return (
                <div
                  key={learner.id}
                  onClick={() => toggleLearner(learner.id)}
                  className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 group ${isSelected
                    ? 'bg-brand-teal/5 ring-2 ring-brand-teal shadow-md'
                    : 'bg-white border border-gray-100 hover:border-brand-teal/50 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-colors ${isSelected ? 'bg-brand-teal text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-brand-teal/10 group-hover:text-brand-teal'
                      }`}>
                      {learner.avatar || learner.firstName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{learner.firstName} {learner.lastName}</p>
                      <p className="text-xs text-gray-500 font-medium tracking-wide">{learner.admNo}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-brand-teal">
                        <CheckCircle size={20} fill="currentColor" className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2 mt-2">
                    <span className="font-semibold text-gray-500">{learner.grade}</span>
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className="font-bold text-brand-teal">{nextGrade}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Promote Button */}
      {selectedLearners.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10 md:static md:bg-transparent md:border-t-0 md:shadow-none md:p-0 flex justify-end">
          <button
            onClick={handlePromote}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-brand-teal text-white rounded-xl hover:bg-brand-teal/90 transition shadow-lg hover:shadow-xl font-bold text-lg transform active:scale-95 duration-150"
          >
            <CheckCircle size={24} />
            <span>Promote {selectedLearners.length} Learner{selectedLearners.length !== 1 ? 's' : ''}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionPage;
