import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * FAQAccordion Component
 * Reusable FAQ section with accordion
 * Eliminates ~40 lines when used in multiple pages
 * Priority: HIGH - appears 3+ times
 */
export const FAQAccordion = ({
  faqs,
  title = "Frequently Asked Questions",
  description,
  defaultOpen = false
}) => {
  const [openItems, setOpenItems] = useState(
    defaultOpen ? new Set(faqs?.map((_, i) => i)) : new Set()
  );

  const toggleItem = (index) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(index)) {
      newOpen.delete(index);
    } else {
      newOpen.add(index);
    }
    setOpenItems(newOpen);
  };

  return (
    <div className="m-auto space-y-6 md:space-y-8">
      {/* Header */}
      {title && (
        <div className="text-center space-y-3 md:space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
            {title}
          </h2>
          {description && (
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}

      {/* FAQ Items */}
      <div className="space-y-3 md:space-y-4">
        {faqs?.map((faq, index) => (
          <div
            key={index}
            className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-[#520050] transition-colors"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full p-4 md:p-6 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-base md:text-lg font-semibold text-gray-900 flex-1">
                {faq.question}
              </span>
              <div className={`transform transition-transform flex-shrink-0 ${
                openItems.has(index) ? 'rotate-180' : ''
              }`}>
                <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-[#520050]" strokeWidth={2} />
              </div>
            </button>

            {/* Answer - Expandable */}
            {openItems.has(index) && (
              <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50 space-y-4">
                {typeof faq.answer === 'string' ? (
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                ) : (
                  faq.answer
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * CollapsibleCard Component
 * Reusable card with collapsible content
 */
export const CollapsibleCard = ({
  title,
  description,
  content,
  icon: Icon,
  defaultOpen = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`border-2 border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 md:p-6 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {Icon && (
            <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#520050] flex-shrink-0" strokeWidth={2} />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">
              {title}
            </h3>
            {description && (
              <p className="text-xs md:text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
        </div>
        <div className={`transform transition-transform flex-shrink-0 ${
          isOpen ? 'rotate-180' : ''
        }`}>
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-[#520050]" strokeWidth={2} />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50">
          {content}
        </div>
      )}
    </div>
  );
};

export default FAQAccordion;
