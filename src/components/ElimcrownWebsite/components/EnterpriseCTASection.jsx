import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * EnterpriseCTASection Component
 * Reusable call-to-action footer for all pages
 * Eliminates ~70 lines of repeated code
 * Priority: CRITICAL - appears at bottom of every page
 */
export const EnterpriseCTASection = ({
  title = "Ready to Transform Your Institution?",
  description = "Join 500+ schools managing CBC assessment and operations with confidence.",
  primaryText = "Start Your Free Trial",
  secondaryText = "Schedule Demo",
  onPrimary,
  onSecondary,
  darkBg = false
}) => {
  return (
    <section className={`py-16 md:py-24 px-4 sm:px-6 md:px-8 ${
      darkBg 
        ? 'bg-gradient-to-r from-gray-900 to-gray-800' 
        : 'bg-gradient-to-r from-[#520050] to-[#3D0038]'
    }`}>
      <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
          {title}
        </h2>
        
        <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 md:pt-6">
          <button
            onClick={onPrimary}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-gray-100 text-[#520050] font-semibold rounded-lg transition-colors text-sm sm:text-base"
          >
            {primaryText}
            <ArrowRight size={18} />
          </button>
          <button
            onClick={onSecondary}
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-white hover:border-gray-200 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
          >
            {secondaryText}
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default EnterpriseCTASection;
