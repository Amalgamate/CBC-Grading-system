import React from 'react';

/**
 * EnterpriseHero Component
 * Reusable hero section for all pages
 * Eliminates ~80 lines of repeated code
 */
export const EnterpriseHero = ({
  badge,
  badgeIcon: BadgeIcon,
  heading,
  subheading,
  description,
  primaryCTA,
  primaryCTAText = 'Get Started',
  secondaryCTA,
  secondaryCTAText = 'Learn More',
  stats,
  visualContent,
  visualHide = false,
  onPrimaryCTA,
  onSecondaryCTA
}) => {
  return (
    <section className="relative pt-20 pb-32 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-6 md:space-y-8">
            {/* Badge */}
            {badge && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full w-fit">
                {BadgeIcon && <BadgeIcon className="w-4 h-4 text-blue-600" strokeWidth={2} />}
                <span className="text-xs font-semibold text-blue-900">{badge}</span>
              </div>
            )}

            {/* Headings */}
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {heading}
              </h1>
              {subheading && (
                <p className="text-sm md:text-base font-semibold text-[#520050]">
                  {subheading}
                </p>
              )}
            </div>

            {/* Description */}
            {description && (
              <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-xl">
                {description}
              </p>
            )}

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              {primaryCTA && (
                <button
                  onClick={onPrimaryCTA}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#520050] hover:bg-[#3D0038] text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
                >
                  {primaryCTAText}
                  {primaryCTA}
                </button>
              )}
              {secondaryCTA && (
                <button
                  onClick={onSecondaryCTA}
                  className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-900 font-semibold rounded-lg transition-colors text-sm sm:text-base"
                >
                  {secondaryCTAText}
                  {secondaryCTA}
                </button>
              )}
            </div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-200">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl sm:text-3xl font-bold text-[#520050]">{stat.label}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1">{stat.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual */}
          {!visualHide && (
            <div className="hidden lg:flex items-center justify-center">
              {visualContent || (
                <div className="aspect-square w-full bg-gradient-to-br from-[#520050]/10 to-[#017E84]/10 rounded-2xl border border-gray-200 flex items-center justify-center min-h-[300px]">
                  <p className="text-gray-600 font-medium">Visual content placeholder</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default EnterpriseHero;
