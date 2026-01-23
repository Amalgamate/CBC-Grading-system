/**
 * Rating Selector Component
 * Allows teachers to select from 8-level CBC rubric
 */

import React, { useState } from 'react';
import RatingBadge from './RatingBadge';

const RatingSelector = ({ 
  value, 
  onChange, 
  label = "Select Performance Level",
  showDescription = true,
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const ratings = [
    { 
      code: 'EE1', 
      points: 8, 
      percentage: '90-100%', 
      label: 'Outstanding',
      description: 'Exceptional mastery, creative application, helps others'
    },
    { 
      code: 'EE2', 
      points: 7, 
      percentage: '75-89%', 
      label: 'Very High',
      description: 'Strong mastery, mostly independent work'
    },
    { 
      code: 'ME1', 
      points: 6, 
      percentage: '58-74%', 
      label: 'High Average',
      description: 'Good competency, occasional assistance needed'
    },
    { 
      code: 'ME2', 
      points: 5, 
      percentage: '41-57%', 
      label: 'Average',
      description: 'Satisfactory competency, regular practice needed'
    },
    { 
      code: 'AE1', 
      points: 4, 
      percentage: '31-40%', 
      label: 'Low Average',
      description: 'Developing skills, needs guidance'
    },
    { 
      code: 'AE2', 
      points: 3, 
      percentage: '21-30%', 
      label: 'Below Average',
      description: 'Emerging skills, constant support needed'
    },
    { 
      code: 'BE1', 
      points: 2, 
      percentage: '11-20%', 
      label: 'Low',
      description: 'Minimal understanding, intervention needed'
    },
    { 
      code: 'BE2', 
      points: 1, 
      percentage: '1-10%', 
      label: 'Very Low',
      description: 'Urgent specialized support needed'
    }
  ];

  const selectedRating = ratings.find(r => r.code === value);

  const handleSelect = (rating) => {
    onChange(rating.code, rating.points, (parseInt(rating.percentage.split('-')[0]) + parseInt(rating.percentage.split('-')[1])) / 2);
    setIsOpen(false);
  };

  return (
    <div className="w-full relative">
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 
          bg-white border-2 rounded-lg 
          flex items-center justify-between
          transition-all
          ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300 hover:border-gray-400'}
          ${!value ? 'text-gray-400' : ''}
        `}
      >
        {selectedRating ? (
          <div className="flex items-center gap-3">
            <RatingBadge 
              detailedRating={selectedRating.code}
              points={selectedRating.points}
              size="md"
            />
            <div className="text-left">
              <div className="font-semibold text-gray-800">{selectedRating.label}</div>
              <div className="text-xs text-gray-500">{selectedRating.percentage}</div>
            </div>
          </div>
        ) : (
          <span>Select performance level...</span>
        )}
        
        {/* Dropdown arrow */}
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute z-50 mt-2 w-full bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
            <div className="p-2">
              {ratings.map((rating) => (
                <button
                  key={rating.code}
                  type="button"
                  onClick={() => handleSelect(rating)}
                  className={`
                    w-full p-3 rounded-lg
                    flex items-start gap-3
                    transition-all
                    ${value === rating.code 
                      ? 'bg-blue-50 border-2 border-blue-400' 
                      : 'hover:bg-gray-50 border-2 border-transparent'
                    }
                  `}
                >
                  <RatingBadge 
                    detailedRating={rating.code}
                    points={rating.points}
                    size="sm"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-800 text-sm">
                      {rating.label} ({rating.percentage})
                    </div>
                    {showDescription && (
                      <div className="text-xs text-gray-600 mt-1">
                        {rating.description}
                      </div>
                    )}
                  </div>
                  {value === rating.code && (
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RatingSelector;
