import React, { useState } from 'react';
import { WebsiteLayout } from '../WebsiteLayout.enterprise';
import {
    BarChart3,
    FileText,
    Users,
    Lock,
    Zap,
    TrendingUp,
    Clock,
    Database,
    Smartphone,
    Globe,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';

const FeaturesPageEnterprise = (props) => {
    const [selectedTab, setSelectedTab] = useState('assessment');

    const featureCategories = {
        assessment: {
            title: 'Assessment & Academics',
            description: 'Evidence-based CBC grading and academic management',
            features: [
                { icon: FileText, name: 'CBC Assessment Engine', desc: 'Automated competency-based grading aligned with KICD framework' },
                { icon: CheckCircle2, name: 'Evidence Capture', desc: 'Real-time observation and evidence documentation' },
                { icon: BarChart3, name: 'Analytics Dashboard', desc: 'Learner progression tracking and performance insights' },
                { icon: TrendingUp, name: 'Report Generation', desc: 'Professional termly and annual reports' },
            ]
        },
        operations: {
            title: 'Operations & Management',
            description: 'Streamlined school operations and administration',
            features: [
                { icon: Users, name: 'Staff Management', desc: 'HR module for staff profiles, leave, and contracts' },
                { icon: Database, name: 'Finance Module', desc: 'Fee collection, budgeting, and financial reporting' },
                { icon: Clock, name: 'Timetabling', desc: 'Automated conflict-free schedule generation' },
                { icon: Globe, name: 'Communication Hub', desc: 'SMS and email notifications to parents and staff' },
            ]
        },
        security: {
            title: 'Security & Integration',
            description: 'Enterprise-grade security and system integration',
            features: [
                { icon: Lock, name: 'Enterprise Security', desc: 'End-to-end encryption and SSO support' },
                { icon: Database, name: 'Data Protection', desc: 'GDPR-compliant data handling and backup' },
                { icon: Zap, name: 'API Integration', desc: 'RESTful APIs for third-party integrations' },
                { icon: Smartphone, name: 'Multi-Platform', desc: 'Responsive web and native mobile apps' },
            ]
        }
    };

    const comparisonData = [
        { category: 'Assessment Tools', elimcrown: true, traditional: false },
        { category: 'Automated Evidence Capture', elimcrown: true, traditional: false },
        { category: 'Real-time Analytics', elimcrown: true, traditional: false },
        { category: 'Biometric Integration', elimcrown: true, traditional: false },
        { category: 'Multi-user Access', elimcrown: true, traditional: true },
        { category: 'Report Generation', elimcrown: true, traditional: true },
        { category: 'Mobile Access', elimcrown: true, traditional: false },
        { category: 'Data Security', elimcrown: true, traditional: false },
        { category: 'Customer Support', elimcrown: true, traditional: false },
        { category: 'Free Trial', elimcrown: true, traditional: false },
    ];

    const currentFeatures = featureCategories[selectedTab];

    return (
        <WebsiteLayout {...props}>
            {/* Hero */}
            <section className="pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                        Comprehensive Feature Set
                    </h1>
                    <p className="text-xl text-gray-600">
                        Everything your institution needs to deliver CBC excellence
                    </p>
                </div>
            </section>

            {/* Feature Categories */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-16 border-b border-gray-200 overflow-x-auto">
                        {Object.entries(featureCategories).map(([key, category]) => (
                            <button
                                key={key}
                                onClick={() => setSelectedTab(key)}
                                className={`px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                                    selectedTab === key
                                        ? 'text-[#520050] border-[#520050]'
                                        : 'text-gray-600 border-transparent hover:text-gray-900'
                                }`}
                            >
                                {category.title}
                            </button>
                        ))}
                    </div>

                    {/* Features Grid */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-gray-900">
                                {currentFeatures.title}
                            </h2>
                            <p className="text-lg text-gray-600">
                                {currentFeatures.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {currentFeatures.features.map((feature, i) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={i}
                                        className="p-8 border border-gray-200 rounded-xl hover:border-[#520050] hover:shadow-lg transition-all group"
                                    >
                                        <Icon className="w-12 h-12 text-[#520050] mb-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {feature.name}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {feature.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Detailed Features */}
            <section className="py-24 bg-gray-50 border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        Deep Dive: Assessment Engine
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            {[
                                {
                                    title: 'Competency Mapping',
                                    desc: 'Automatic mapping of learner outcomes to CBC competencies and learning outcomes.'
                                },
                                {
                                    title: 'Evidence Collection',
                                    desc: 'Teachers capture evidence through observations, assessments, and project submissions.'
                                },
                                {
                                    title: 'Rubric-Based Grading',
                                    desc: '8-level rubric system enabling consistent and standardized competency assessment.'
                                },
                                {
                                    title: 'Automated Reporting',
                                    desc: 'One-click generation of comprehensive reports for parents and stakeholders.'
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-8 rounded-2xl border-2 border-gray-200">
                            <div className="aspect-square bg-gradient-to-br from-[#520050]/10 to-[#017E84]/10 rounded-xl flex items-center justify-center">
                                <BarChart3 className="w-24 h-24 text-[#520050]" strokeWidth={0.5} />
                            </div>
                            <p className="text-center text-gray-600 mt-6">
                                Advanced analytics and assessment capabilities
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        How We Compare
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                                    <th className="text-center py-4 px-6 font-semibold text-[#520050]">ElimCrown</th>
                                    <th className="text-center py-4 px-6 font-semibold text-gray-600">Traditional Systems</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonData.map((row, i) => (
                                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-4 px-6 text-gray-900 font-medium">
                                            {row.category}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {row.elimcrown ? (
                                                <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                                            ) : (
                                                <div className="w-6 h-6 mx-auto"></div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            {row.traditional ? (
                                                <CheckCircle2 className="w-6 h-6 text-gray-400 mx-auto" />
                                            ) : (
                                                <div className="w-6 h-6 mx-auto"></div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Integration & APIs */}
            <section className="py-24 bg-gray-50 border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-6 mb-16">
                        <h2 className="text-4xl font-bold text-gray-900">
                            Integrations & APIs
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Connect ElimCrown with your existing systems
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[
                            'Biometric Systems',
                            'Payment Gateways',
                            'Email Services',
                            'SMS Platforms',
                            'Cloud Storage',
                            'Authentication',
                            'Data Analytics',
                            'Custom APIs'
                        ].map((integration, i) => (
                            <div
                                key={i}
                                className="p-6 bg-white border border-gray-200 rounded-lg hover:border-[#520050] hover:shadow-lg transition-all text-center"
                            >
                                <svg className="w-8 h-8 text-[#520050] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <p className="text-sm font-medium text-gray-900">
                                    {integration}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-8 bg-blue-50 border border-blue-200 rounded-xl">
                        <h3 className="font-semibold text-blue-900 mb-3">
                            Live API Documentation
                        </h3>
                        <p className="text-blue-800 mb-4">
                            Our comprehensive API documentation and SDKs make integration seamless. Get started with REST APIs, webhooks, and OAuth 2.0 authentication.
                        </p>
                        <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2">
                            Explore API Docs <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-[#520050] text-white">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold">
                            Experience the Power
                        </h2>
                        <p className="text-xl text-white/80">
                            Get full access to all features with our 14-day free trial
                        </p>
                    </div>
                    <button
                        onClick={props.onGetStartedClick}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-[#520050] font-semibold rounded-lg transition-colors"
                    >
                        Start Free Trial <ArrowRight size={20} />
                    </button>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default FeaturesPageEnterprise;
