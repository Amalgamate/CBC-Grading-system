import React, { useState } from 'react';
import { WebsiteLayout } from '../WebsiteLayout.enterprise';
import MetricsBannerAlt from '../MetricsBannerAlt';
import {
    BarChart3,
    CheckCircle2,
    Users,
    Zap,
    Shield,
    TrendingUp,
    ArrowRight,
    Building2,
    BookOpen,
    Target,
} from 'lucide-react';

const HomePageEnterprise = (props) => {
    const [activeMetric, setActiveMetric] = useState(0);

    return (
        <WebsiteLayout {...props}>
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                    <span className="text-xs font-semibold text-blue-900">Trusted by 500+ institutions in Kenya</span>
                                </div>

                                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                                    Enterprise-Grade Education Management
                                </h1>

                                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                                    Unified platform delivering CBC excellence through evidence-based assessment, operational efficiency, and future-ready learning.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={props.onGetStartedClick}
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-[#520050] hover:bg-[#3D0038] text-white font-semibold rounded-lg transition-colors"
                                >
                                    Start Free Trial <ArrowRight size={18} />
                                </button>
                                <button
                                    onClick={props.onLoginClick}
                                    className="px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-900 font-semibold rounded-lg transition-colors"
                                >
                                    Schedule Demo
                                </button>
                            </div>

                            {/* Trust Indicators */}
                            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-200">
                                {[
                                    { label: '500+', desc: 'Schools worldwide' },
                                    { label: '50K+', desc: 'Active educators' },
                                    { label: '2M+', desc: 'Learner assessments' },
                                    { label: '99.9%', desc: 'Uptime guarantee' }
                                ].map((stat, i) => (
                                    <div key={i}>
                                        <div className="text-2xl font-bold text-[#520050]">{stat.label}</div>
                                        <div className="text-sm text-gray-600">{stat.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual */}
                        <div className="relative hidden lg:block">
                            <div className="aspect-square bg-gradient-to-br from-[#520050]/10 to-[#017E84]/10 rounded-2xl border border-gray-200 flex items-center justify-center">
                                <div className="text-center space-y-4">
                                    <BarChart3 className="w-24 h-24 text-[#520050] mx-auto" strokeWidth={0.5} />
                                    <p className="text-gray-600 font-medium">Comprehensive Assessment Platform</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Metrics Banner */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <MetricsBannerAlt
                        title="Institution Dashboard"
                        description="Real-time performance metrics across all key institutional areas. Monitor learner engagement, staff performance, and operational health."
                        ctaText="Explore Dashboard"
                        onCTAClick={props.onGetStartedClick}
                    />
                </div>
            </section>

            {/* Key Features Grid */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-4xl font-bold text-gray-900">
                            Complete Education Platform
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Integrated solutions for modern educational institutions
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: CheckCircle2,
                                title: 'Evidence-Based Assessment',
                                desc: 'Automated CBC assessment with real-time evidence capture and competency tracking.'
                            },
                            {
                                icon: BarChart3,
                                title: 'Performance Analytics',
                                desc: 'Advanced analytics dashboards providing actionable insights into learner progression.'
                            },
                            {
                                icon: Users,
                                title: 'Staff Management',
                                desc: 'Complete HR solution including payroll, leave management, and performance evaluation.'
                            },
                            {
                                icon: Shield,
                                title: 'Security & Compliance',
                                desc: 'Enterprise-grade security with SSO, encryption, and GDPR-compliant data handling.'
                            },
                            {
                                icon: Zap,
                                title: 'System Integration',
                                desc: 'Seamless integration with biometric systems, finance platforms, and third-party tools.'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Scalable Infrastructure',
                                desc: 'Cloud-native architecture supporting unlimited schools and unlimited learners.'
                            }
                        ].map((feature, i) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={i}
                                    className="p-8 border border-gray-200 rounded-xl hover:border-[#520050] hover:shadow-lg transition-all group"
                                >
                                    <Icon className="w-12 h-12 text-[#520050] mb-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-24 bg-gray-50 border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-4xl font-bold text-gray-900">
                            Why Choose ElimCrown?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Purpose-built for Kenyan institutions implementing CBC
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">Traditional Approach</h3>
                            {[
                                'Fragmented spreadsheet-based systems',
                                'Manual evidence collection',
                                'Time-consuming report generation',
                                'Limited data insights',
                                'Inconsistent grading standards',
                                'Compliance challenges'
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="text-red-500 text-xl flex-shrink-0">✕</div>
                                    <p className="text-gray-600">{item}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-900">ElimCrown Solution</h3>
                            {[
                                'Unified, integrated platform',
                                'Automatic evidence capture',
                                'One-click comprehensive reports',
                                'Advanced analytics dashboards',
                                'Standardized grading engine',
                                'Full compliance built-in'
                            ].map((item, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="text-green-600 text-xl flex-shrink-0">✓</div>
                                    <p className="text-gray-900 font-medium">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-16 p-8 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-4">
                            <Target className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-2">
                                    Average time savings: 15 hours/week per educator
                                </h4>
                                <p className="text-blue-800">
                                    Schools report significant improvements in data accuracy, compliance, and learner engagement after implementing ElimCrown.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Modules Overview */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-4xl font-bold text-gray-900">
                            Integrated Module Suite
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything needed to run a modern educational institution
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: BookOpen, title: 'Assessment', color: 'text-[#520050]' },
                            { icon: BarChart3, title: 'Analytics', color: 'text-[#017E84]' },
                            { icon: Users, title: 'Operations', color: 'text-[#f97316]' },
                            { icon: Building2, title: 'Finance', color: 'text-[#8b5cf6]' }
                        ].map((module, i) => {
                            const Icon = module.icon;
                            return (
                                <div
                                    key={i}
                                    className="p-8 bg-gray-50 border border-gray-200 rounded-xl hover:bg-white hover:shadow-lg transition-all group text-center"
                                >
                                    <Icon className={`w-12 h-12 ${module.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {module.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Comprehensive management
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-[#520050] text-white">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold">
                            Ready to Transform Education?
                        </h2>
                        <p className="text-xl text-white/80">
                            Join hundreds of institutions delivering evidence-based CBC education with ElimCrown.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={props.onGetStartedClick}
                            className="px-8 py-4 bg-white hover:bg-gray-100 text-[#520050] font-semibold rounded-lg transition-colors"
                        >
                            Start Your Journey
                        </button>
                        <button
                            onClick={props.onLoginClick}
                            className="px-8 py-4 border-2 border-white hover:bg-white/10 text-white font-semibold rounded-lg transition-colors"
                        >
                            Request Demo Call
                        </button>
                    </div>

                    <p className="text-sm text-white/70">
                        No credit card required. 14-day free trial. Full access to all features.
                    </p>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default HomePageEnterprise;
