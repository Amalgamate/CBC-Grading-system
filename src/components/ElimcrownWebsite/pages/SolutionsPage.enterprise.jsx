import React, { useState } from 'react';
import { WebsiteLayout } from '../WebsiteLayout.enterprise';
import {
    Users,
    BarChart3,
    DollarSign,
    Settings,
    TrendingUp,
    CheckCircle2,
    ArrowRight,
    BookOpen,
    PieChart,
    Clock
} from 'lucide-react';

const SolutionsPageEnterprise = (props) => {
    const [selectedRole, setSelectedRole] = useState('principal');

    const solutions = {
        principal: {
            title: 'For School Principals',
            icon: Users,
            description: 'Strategic oversight and institutional excellence',
            color: 'from-purple-600 to-purple-800',
            benefits: [
                {
                    icon: BarChart3,
                    title: 'Performance Dashboard',
                    desc: 'Real-time view of school performance, faculty engagement, and learner progress across all grades'
                },
                {
                    icon: TrendingUp,
                    title: 'Strategic Analytics',
                    desc: 'Identify trends, track KPIs, and make data-driven decisions for institutional improvement'
                },
                {
                    icon: Users,
                    title: 'Staff Management',
                    desc: 'Manage professional development, performance reviews, and compliance documentation'
                },
                {
                    icon: Clock,
                    title: 'Operational Efficiency',
                    desc: 'Streamline timetabling, resource allocation, and administrative processes'
                }
            ],
            highlights: [
                'Instant reports on learner placement and academics',
                'Monitor CBC competency achievement across school',
                'Track staff performance and development',
                'Historical data analysis and trend forecasting',
                'Compliance and audit trail oversight'
            ]
        },
        teacher: {
            title: 'For Teachers',
            icon: BookOpen,
            description: 'Empower teaching excellence and learner success',
            color: 'from-blue-600 to-blue-800',
            benefits: [
                {
                    icon: CheckCircle2,
                    title: 'Assessment Tools',
                    desc: 'Intuitive interface for daily evidence capture aligned with CBC framework'
                },
                {
                    icon: BarChart3,
                    title: 'Learner Insights',
                    desc: 'Detailed analytics on individual learner progress and competency mastery'
                },
                {
                    icon: BookOpen,
                    title: 'Resource Library',
                    desc: 'Access to teaching resources, lesson plans, and best practices'
                },
                {
                    icon: TrendingUp,
                    title: 'Parent Communication',
                    desc: 'Seamless parent portals and automated performance notifications'
                }
            ],
            highlights: [
                'Mobile app for assessment on-the-go',
                'Automatic evidence aggregation and analysis',
                'Real-time learner performance tracking',
                'Parent portal access to learner analytics',
                'Collaborative class assessment tools'
            ]
        },
        bursar: {
            title: 'For Bursars & Finance',
            icon: DollarSign,
            description: 'Financial control and institutional sustainability',
            color: 'from-green-600 to-green-800',
            benefits: [
                {
                    icon: DollarSign,
                    title: 'Fee Management',
                    desc: 'Automated fee collection, balance tracking, and payment reconciliation'
                },
                {
                    icon: PieChart,
                    title: 'Budget Control',
                    desc: 'Create, track, and enforce departmental budgets with real-time alerts'
                },
                {
                    icon: BarChart3,
                    title: 'Financial Reports',
                    desc: 'Comprehensive financial statements for governance and audit compliance'
                },
                {
                    icon: CheckCircle2,
                    title: 'Payment Integration',
                    desc: 'Multiple payment gateway support for flexible collection methods'
                }
            ],
            highlights: [
                'Automated fee invoicing and reminders',
                'Multi-level approval workflows',
                'Real-time financial dashboards',
                'Integration with mobile money and banks',
                'Audit-ready reporting and compliance'
            ]
        }
    };

    const currentSolution = solutions[selectedRole];
    const CurrentIcon = currentSolution.icon;

    return (
        <WebsiteLayout {...props}>
            {/* Hero */}
            <section className="pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                        Solutions for Every Role
                    </h1>
                    <p className="text-xl text-gray-600">
                        Tailored experiences designed for principals, teachers, and finance teams
                    </p>
                </div>
            </section>

            {/* Role Selection */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Role Tabs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                        {Object.entries(solutions).map(([key, solution]) => {
                            const Icon = solution.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedRole(key)}
                                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                                        selectedRole === key
                                            ? 'border-[#520050] bg-[#520050]/5'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className={`w-8 h-8 mb-3 ${selectedRole === key ? 'text-[#520050]' : 'text-gray-600'}`} />
                                    <h3 className="font-semibold text-gray-900 text-lg">
                                        {solution.title.split(' For ')[1]}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {solution.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Solution Details */}
                    <div className="space-y-16">
                        {/* Header */}
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 bg-gradient-to-br ${currentSolution.color} rounded-xl flex items-center justify-center`}>
                                <CurrentIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    {currentSolution.title}
                                </h2>
                                <p className="text-lg text-gray-600 mt-1">
                                    {currentSolution.description}
                                </p>
                            </div>
                        </div>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {currentSolution.benefits.map((benefit, i) => {
                                const Icon = benefit.icon;
                                return (
                                    <div
                                        key={i}
                                        className="p-8 border border-gray-200 rounded-xl hover:border-[#520050] hover:shadow-lg transition-all"
                                    >
                                        <Icon className="w-10 h-10 text-[#520050] mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {benefit.title}
                                        </h3>
                                        <p className="text-gray-600">
                                            {benefit.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Highlights */}
                        <div className="bg-gray-50 p-8 rounded-xl border border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                Key Highlights
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentSolution.highlights.map((highlight, i) => (
                                    <div key={i} className="flex gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-gray-700">
                                            {highlight}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Flow */}
            <section className="py-24 bg-gradient-to-br from-gray-50 to-white border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        How It Works
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { num: '01', title: 'Setup', desc: 'Quick school configuration' },
                            { num: '02', title: 'Import', desc: 'Load learner & staff data' },
                            { num: '03', title: 'Train', desc: 'Role-based onboarding' },
                            { num: '04', title: 'Deploy', desc: 'Live across your institution' }
                        ].map((step, i) => (
                            <div key={i} className="relative">
                                <div className="p-6 bg-white border-2 border-gray-200 rounded-xl text-center">
                                    <div className="text-4xl font-bold text-[#520050] mb-3">
                                        {step.num}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        {step.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {step.desc}
                                    </p>
                                </div>
                                {i < 3 && (
                                    <ArrowRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-gray-300 -translate-y-1/2" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Modules Overview */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        Complete Module Suite
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                title: 'Assessment Module',
                                features: [
                                    'CBC-aligned rubrics',
                                    'Evidence capture tools',
                                    'Real-time analytics',
                                    'Automated reports'
                                ]
                            },
                            {
                                title: 'Financial Module',
                                features: [
                                    'Fee collection',
                                    'Budget tracking',
                                    'Payment reconciliation',
                                    'Financial reporting'
                                ]
                            },
                            {
                                title: 'Operations Module',
                                features: [
                                    'Timetabling',
                                    'Staff management',
                                    'Resource allocation',
                                    'Compliance tracking'
                                ]
                            },
                            {
                                title: 'Communication Module',
                                features: [
                                    'Parent portals',
                                    'SMS & email alerts',
                                    'Performance updates',
                                    'Stakeholder reports'
                                ]
                            }
                        ].map((module, i) => (
                            <div key={i} className="p-8 border border-gray-200 rounded-xl hover:border-[#520050] hover:shadow-lg transition-all">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">
                                    {module.title}
                                </h3>
                                <ul className="space-y-3">
                                    {module.features.map((feature, j) => (
                                        <li key={j} className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-[#520050] rounded-full"></div>
                                            <span className="text-gray-700">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section className="py-24 bg-gray-50 border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        Trusted by Leading Schools
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'Serena Academy',
                                stat: '98% on-time fee collection',
                                quote: 'Simplified our entire assessment process'
                            },
                            {
                                name: 'Nairobi Girls High School',
                                stat: '45% faster report generation',
                                quote: 'Transformed how we track learner progress'
                            },
                            {
                                name: 'Alliance High School',
                                stat: '88% parent engagement increase',
                                quote: 'Parents now understand CBC achievements'
                            }
                        ].map((story, i) => (
                            <div key={i} className="p-8 bg-white border border-gray-200 rounded-xl">
                                <div className="flex gap-1 mb-4">
                                    {[...' '].map((_, j) => <span key={j} className="text-yellow-400 text-lg">★</span>)}
                                </div>
                                <p className="text-gray-700 italic mb-4">
                                    "{story.quote}"
                                </p>
                                <div className="border-t border-gray-200 pt-4">
                                    <p className="font-semibold text-gray-900">
                                        {story.name}
                                    </p>
                                    <p className="text-sm text-[#520050] font-medium">
                                        {story.stat}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-[#520050] text-white">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold">
                            Find Your Solution
                        </h2>
                        <p className="text-xl text-white/80">
                            Let's discuss how ElimCrown can transform your institution
                        </p>
                    </div>
                    <button
                        onClick={props.onContactClick}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-[#520050] font-semibold rounded-lg transition-colors"
                    >
                        Schedule Demo <ArrowRight size={20} />
                    </button>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default SolutionsPageEnterprise;
