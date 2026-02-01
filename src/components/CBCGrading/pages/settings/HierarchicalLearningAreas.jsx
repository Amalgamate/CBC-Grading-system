/**
 * Hierarchical Learning Areas Component
 * Displays learning areas organized by grade with expandable strands
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Edit, Trash2, Plus } from 'lucide-react';
import { getStrandsForArea } from '../../../../constants/strandsConfig';

const HierarchicalLearningAreas = ({
  learningAreas = [],
  gradeStructure = [],
  onEdit = () => {},
  onDelete = () => {},
  onAddStrand = () => {}
}) => {
  const [expandedGrades, setExpandedGrades] = useState({});
  const [expandedAreas, setExpandedAreas] = useState({});

  // Group learning areas by grade level
  const groupedByGrade = learningAreas.reduce((acc, area) => {
    const grade = area.gradeLevel || 'Other';
    if (!acc[grade]) {
      acc[grade] = [];
    }
    acc[grade].push(area);
    return acc;
  }, {});

  // Sort grades in a logical order
  const gradeOrder = [
    'Early Years',
    'Pre-Primary',
    'Lower Primary',
    'Upper Primary',
    'Junior School',
    'Senior School',
    'Other'
  ];

  const sortedGrades = Object.keys(groupedByGrade).sort(
    (a, b) => gradeOrder.indexOf(a) - gradeOrder.indexOf(b)
  );

  const toggleGrade = (grade) => {
    setExpandedGrades(prev => ({
      ...prev,
      [grade]: !prev[grade]
    }));
  };

  const toggleArea = (areaId) => {
    setExpandedAreas(prev => ({
      ...prev,
      [areaId]: !prev[areaId]
    }));
  };

  return (
    <div className="space-y-2">
      {sortedGrades.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600">No learning areas added yet</p>
        </div>
      ) : (
        sortedGrades.map(grade => (
          <div key={grade} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Grade Header Row */}
            <div
              onClick={() => toggleGrade(grade)}
              className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-pointer transition border-b"
            >
              <button className="flex-shrink-0">
                {expandedGrades[grade] ? (
                  <ChevronDown size={20} className="text-blue-600" />
                ) : (
                  <ChevronRight size={20} className="text-gray-500" />
                )}
              </button>
              <div className="flex-grow">
                <h3 className="font-bold text-gray-800 text-lg">{grade}</h3>
                <p className="text-xs text-gray-500">
                  {groupedByGrade[grade].length} learning {groupedByGrade[grade].length === 1 ? 'area' : 'areas'}
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 text-sm font-semibold rounded-full">
                {groupedByGrade[grade].length}
              </span>
            </div>

            {/* Learning Areas - shown when grade is expanded */}
            {expandedGrades[grade] && (
              <div className="bg-white">
                {groupedByGrade[grade].map((area, index) => {
                  const strands = getStrandsForArea(area.name);
                  const isAreaExpanded = expandedAreas[area.id];

                  return (
                    <div
                      key={area.id}
                      className={`border-t ${index === groupedByGrade[grade].length - 1 ? '' : ''}`}
                    >
                      {/* Learning Area Row */}
                      <div
                        className="flex items-center gap-3 px-6 py-4 bg-gray-50 hover:bg-gray-100 transition"
                      >
                        <div className="flex-shrink-0 ml-4">
                          {strands.length > 0 ? (
                            <button
                              onClick={() => toggleArea(area.id)}
                              className="flex-shrink-0 focus:outline-none"
                            >
                              {isAreaExpanded ? (
                                <ChevronDown size={18} className="text-green-600" />
                              ) : (
                                <ChevronRight size={18} className="text-gray-500" />
                              )}
                            </button>
                          ) : (
                            <div className="w-5" /> // Placeholder for alignment
                          )}
                        </div>

                        {/* Area Icon and Name */}
                        <div className="flex-shrink-0 text-2xl">{area.icon}</div>
                        <div className="flex-grow">
                          <h4 className="font-semibold text-gray-700">{area.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: area.color }}
                              title={area.color}
                            ></div>
                            {strands.length > 0 && (
                              <span className="text-xs text-gray-500">
                                {strands.length} strand{strands.length !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => onEdit(area)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(area)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Strands - shown when area is expanded */}
                      {isAreaExpanded && strands.length > 0 && (
                        <div className="bg-blue-50 border-l-4 border-blue-400">
                          <div className="px-6 py-3 space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-sm font-semibold text-blue-800">Strands:</span>
                              <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                                {strands.length}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {strands.map((strand, strandIndex) => (
                                <div
                                  key={strandIndex}
                                  className="flex items-start gap-2 p-2 bg-white rounded border border-blue-200 hover:border-blue-400 transition"
                                >
                                  <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                                  <div className="flex-grow">
                                    <p className="text-sm text-gray-700">{strand}</p>
                                  </div>
                                  <button
                                    onClick={() => onAddStrand(area, strand)}
                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition flex-shrink-0"
                                    title="Add assessment for this strand"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Empty strands message */}
                      {isAreaExpanded && strands.length === 0 && (
                        <div className="px-6 py-4 bg-blue-50 text-center">
                          <p className="text-sm text-gray-500">No strands defined for this area</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default HierarchicalLearningAreas;
