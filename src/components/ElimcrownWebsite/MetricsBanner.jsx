import React from 'react';
import { TrendingUp, Users, CheckCircle2, BookOpen } from 'lucide-react';

const MetricsBanner = ({ 
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
        <section className="py-16 bg-gradient-to-r from-[#520050] via-purple-600 to-pink-500 rounded-2xl overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Text Content */}
                    <div className="space-y-6 text-white">
                        <div className="space-y-3">
                            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                                {title || 'Your School Performance at a Glance'}
                            </h2>
                            <p className="text-lg text-white/90 leading-relaxed">
                                {description || 'Real-time insights into learner engagement, staff management, and institutional health. Monitor what matters most.'}
                            </p>
                        </div>

                        <button
                            onClick={onCTAClick}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-[#520050] font-semibold rounded-lg transition-colors"
                        >
                            {ctaText || 'View Full Dashboard'}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Right: Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {metrics.map((metric, i) => {
                            const Icon = metric.icon;
                            return (
                                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all">
                                    <div className="flex items-start justify-between mb-3">
                                        <Icon className="w-6 h-6 text-white/80" strokeWidth={1.5} />
                                        {metric.change && (
                                            <span className="text-sm font-semibold text-green-300">
                                                {metric.change}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <div className="text-3xl font-bold text-white">
                                            {metric.value}
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-semibold text-white/90">
                                            {metric.label}
                                        </p>
                                        <p className="text-xs text-white/70">
                                            {metric.sublabel}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MetricsBanner;
