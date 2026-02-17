import React from 'react';
import { TrendingUp, Users, CheckCircle2, BookOpen } from 'lucide-react';

/**
 * Enterprise Metrics Banner with Text Left + Metrics Right
 * Alternative design with darker background and more professional styling
 */
const MetricsBannerAlt = ({ 
    title, 
    description, 
    ctaText, 
    onCTAClick,
    metrics = [
        { icon: Users, value: '330', change: '↑2.5%', label: 'Active Learners', sublabel: 'Enrolled Students' },
        { icon: CheckCircle2, value: '20', change: '↑1.0%', label: 'Teaching Staff', sublabel: 'Active Teachers' },
        { icon: BookOpen, value: '0', change: '', label: 'Present Today', sublabel: 'Student Attendance' },
        { icon: TrendingUp, value: '72', change: '', label: 'Classes', sublabel: 'Running Streams' }
    ]
}) => {
    return (
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
                    {/* Left Column: Text (takes 2 columns) */}
                    <div className="lg:col-span-2 space-y-6 text-white">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#520050]/20 border border-[#520050]/50 rounded-full">
                            <span className="text-xs font-semibold text-[#B388EB]">LIVE INSIGHTS</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                            {title || 'Your School Dashboard'}
                        </h2>

                        <p className="text-lg text-gray-300 leading-relaxed">
                            {description || 'Real-time performance metrics across all key institutional areas. Stay informed, make better decisions.'}
                        </p>

                        <button
                            onClick={onCTAClick}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#520050] hover:bg-[#3D0038] text-white font-semibold rounded-lg transition-colors"
                        >
                            {ctaText || 'Explore Dashboard'}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Right Column: Metrics (takes 3 columns) */}
                    <div className="lg:col-span-3">
                        <div className="grid grid-cols-2 gap-6">
                            {metrics.map((metric, i) => {
                                const Icon = metric.icon;
                                return (
                                    <div 
                                        key={i} 
                                        className="group p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl hover:border-[#520050] hover:shadow-2xl transition-all hover:shadow-[#520050]/20"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-2 bg-[#520050]/20 rounded-lg group-hover:bg-[#520050]/40 transition-colors">
                                                <Icon className="w-6 h-6 text-[#B388EB]" strokeWidth={1.5} />
                                            </div>
                                            {metric.change && (
                                                <span className="flex items-center gap-1 text-sm font-bold text-green-400">
                                                    <TrendingUp size={14} />
                                                    {metric.change}
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-3">
                                            <div className="text-4xl font-bold text-white">
                                                {metric.value}
                                            </div>
                                        </div>

                                        <div className="space-y-1 border-t border-gray-700 pt-4">
                                            <p className="text-sm font-semibold text-gray-100">
                                                {metric.label}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {metric.sublabel}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MetricsBannerAlt;
