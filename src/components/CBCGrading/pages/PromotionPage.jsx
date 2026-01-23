/**
 * Promotion Page
 * Promote learners to next grade level
 */

import React, { useState } from 'react';
import { CheckCircle, ArrowRight, Users } from 'lucide-react';
import EmptyState from '../shared/EmptyState';

const PromotionPage = ({ learners = [], onPromote, showNotification }) => {
  const [sourceGrade, setSourceGrade] = useState('Grade 3');
  const [sourceStream, setSourceStream] = useState('all');
  const [selectedLearners, setSelectedLearners] = useState([]);

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
        <h3 className="text-lg font-bold mb-4 text-green-700">Step 1: Select Source Class</h3>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grade</label>
            <select
              value={sourceGrade}
              onChange={(e) => {
                setSourceGrade(e.target.value);
                setSelectedLearners([]);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
              <option value="Grade 5">Grade 5</option>
              <option value="Grade 6">Grade 6</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Stream</label>
            <select
              value={sourceStream}
              onChange={(e) => {
                setSourceStream(e.target.value);
                setSelectedLearners([]);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Streams</option>
              <option value="A">Stream A</option>
              <option value="B">Stream B</option>
              <option value="C">Stream C</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={selectAll}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Select Learners */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold mb-4 text-green-700">
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
                  className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                    isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-2xl">{learner.avatar}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{learner.firstName} {learner.lastName}</p>
                      <p className="text-xs text-gray-500">{learner.admNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                    <span className="font-semibold">{learner.grade}</span>
                    <ArrowRight size={14} className="text-green-600" />
                    <span className="font-semibold text-green-700">{nextGrade}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Promote Button */}
      {selectedLearners.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handlePromote}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
          >
            <CheckCircle size={20} />
            Promote Selected ({selectedLearners.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default PromotionPage;
