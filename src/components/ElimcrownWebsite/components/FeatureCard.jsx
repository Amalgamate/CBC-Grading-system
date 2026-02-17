import React from 'react';

/**
 * FeatureCard Component
 * Reusable feature showcase card with icon
 * Eliminates ~60 lines across FeaturesPage, SolutionsPage, PlayroomPage
 */
export const FeatureCard = ({
  icon: Icon,
  title,
  description,
  features,
  highlighted = false,
  iconBg = 'bg-blue-100',
  iconColor = 'text-blue-600'
}) => {
  return (
    <div className={`p-6 md:p-8 rounded-2xl border-2 transition-all ${
      highlighted 
        ? 'border-[#520050] bg-white shadow-lg' 
        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
    }`}>
      
      {/* Icon */}
      {Icon && (
        <div className={`${iconBg} ${iconColor} w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center mb-4`}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
      )}

      {/* Title & Description */}
      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 text-sm md:text-base mb-6">
        {description}
      </p>

      {/* Features List */}
      {features && features.length > 0 && (
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm md:text-base text-gray-700">
              <span className="w-2 h-2 rounded-full bg-[#520050] mt-1.5 flex-shrink-0"></span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * StatMetricCard Component
 * Reusable card for displaying statistics
 * Eliminates ~50 lines from AboutPage and PlayroomPage
 */
export const StatMetricCard = ({
  value,
  label,
  suffix = '',
  description,
  icon: Icon,
  trend,
  trendValue,
  layout = 'vertical' // 'vertical' | 'horizontal'
}) => {
  return (
    <div className="p-6 md:p-8 rounded-2xl bg-white border-2 border-gray-200 hover:border-[#520050] transition-all">
      {layout === 'vertical' ? (
        <div className="space-y-3">
          {Icon && (
            <Icon className="w-8 h-8 md:w-10 md:h-10 text-[#520050]" strokeWidth={1.5} />
          )}
          <div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">
              {value}{suffix}
            </div>
            <p className="text-sm md:text-base text-gray-600 mt-2">{label}</p>
            {description && (
              <p className="text-xs md:text-sm text-gray-500 mt-2">{description}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          {Icon && (
            <Icon className="w-10 h-10 md:w-12 md:h-12 text-[#520050] flex-shrink-0" strokeWidth={1.5} />
          )}
          <div className="flex-1">
            <div className="text-2xl md:text-3xl font-bold text-gray-900">
              {value}{suffix}
            </div>
            <p className="text-sm md:text-base text-gray-600">{label}</p>
          </div>
          {trend && (
            <div className={`text-xs md:text-sm font-semibold ${
              trend === 'up' ? 'text-green-600' : 'text-gray-600'
            }`}>
              {trendValue}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * BenefitCard Component
 * Reusable card for showing benefits
 * Eliminates ~50 lines from SolutionsPage and FeaturesPage
 */
export const BenefitCard = ({
  icon: Icon,
  title,
  description,
  iconBg = 'bg-blue-100',
  iconColor = 'text-blue-600'
}) => {
  return (
    <div className="p-6 md:p-8 rounded-2xl bg-white border-2 border-gray-200 hover:shadow-lg transition-all space-y-4">
      {Icon && (
        <div className={`${iconBg} ${iconColor} w-12 h-12 rounded-lg flex items-center justify-center`}>
          <Icon size={20} strokeWidth={2} />
        </div>
      )}
      <div>
        <h4 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
          {title}
        </h4>
        <p className="text-sm md:text-base text-gray-600">
          {description}
        </p>
      </div>
    </div>
  );
};

export default FeatureCard;
