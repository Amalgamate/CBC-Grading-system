import React from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

/**
 * PricingCard Component
 * Reusable pricing tier card
 * Eliminates ~80 lines when extracted from PricingPage
 */
export const PricingCard = ({
  name,
  description,
  price,
  period = '/month',
  badge,
  features,
  featureLimit,
  isPrimary = false,
  onCTA,
  ctaText = 'Get Started',
  highlighted = false
}) => {
  return (
    <div className={`relative rounded-2xl border-2 transition-all ${
      highlighted 
        ? 'border-[#520050] shadow-2xl scale-105 md:scale-100 lg:scale-105' 
        : 'border-gray-200 hover:border-gray-300'
    } ${highlighted ? 'bg-white' : 'bg-gray-50 hover:bg-white'} p-6 md:p-8 space-y-6`}>
      
      {/* Badge */}
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-900 rounded-full text-xs font-semibold mb-2">
          {badge}
        </div>
      )}

      {/* Title & Description */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
        {description && (
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        )}
      </div>

      {/* Price */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl md:text-5xl font-bold text-gray-900">
            {typeof price === 'number' ? `KES ${price.toLocaleString()}` : price}
          </span>
          {typeof price === 'number' && (
            <span className="text-gray-600">{period}</span>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        {features?.map((feature, i) => {
          const isIncluded = featureLimit ? i < featureLimit : feature.included !== false;
          return (
            <div key={i} className="flex items-center gap-3">
              {isIncluded ? (
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" strokeWidth={3} />
              ) : (
                <X className="w-5 h-5 text-gray-300 flex-shrink-0" strokeWidth={3} />
              )}
              <span className={isIncluded ? 'text-gray-700' : 'text-gray-400'}>
                {typeof feature === 'string' ? feature : (feature.name || feature.text)}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTA Button */}
      <button
        onClick={onCTA}
        className={`w-full py-3 md:py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-sm md:text-base ${
          isPrimary || highlighted
            ? 'bg-[#520050] hover:bg-[#3D0038] text-white'
            : 'border-2 border-[#520050] text-[#520050] hover:bg-[#520050]/5'
        }`}
      >
        {ctaText}
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default PricingCard;
