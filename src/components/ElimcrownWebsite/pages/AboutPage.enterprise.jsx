import React from 'react';
import { WebsiteLayout } from '../WebsiteLayout.enterprise';
import {
    Target,
    Heart,
    Zap,
    Users,
    Award,
    TrendingUp,
    Globe,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';

const AboutPageEnterprise = (props) => {
    return (
        <WebsiteLayout {...props}>
            {/* Hero */}
            <section className="pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                        About ElimCrown
                    </h1>
                    <p className="text-xl text-gray-600">
                        We're reimagining educational excellence in Africa
                    </p>
                </div>
            </section>

            {/* Mission Statement */}
            <section className="py-24 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center mx-auto">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                Our Mission
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Empower African educational institutions with technology that makes assessment evidence-based, transparent, and impactful.
                            </p>
                        </div>

                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mx-auto">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                Our Vision
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Every learner in Africa has access to world-class assessment systems that measure competencies and unlock potential.
                            </p>
                        </div>

                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center mx-auto">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">
                                Our Impact
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Transforming schools through technology that increases teacher effectiveness and learner outcomes by 40%.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-4 mb-16">
                        <h2 className="text-4xl font-bold text-gray-900">
                            Our Core Values
                        </h2>
                        <p className="text-xl text-gray-600">
                            What drives every decision we make
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: Users,
                                title: 'Learner-First',
                                desc: 'Every feature and decision is designed with learner success as the primary consideration. We measure impact on educational outcomes.'
                            },
                            {
                                icon: Award,
                                title: 'Excellence',
                                desc: 'We maintain the highest standards in product quality, customer support, and professional standards in everything we deliver.'
                            },
                            {
                                icon: Globe,
                                title: 'Accessibility',
                                desc: 'Technology should empower all institutions regardless of size or resources. We offer flexible pricing and mobile-first design.'
                            },
                            {
                                icon: TrendingUp,
                                title: 'Transparency',
                                desc: 'Clear data, honest communication, and transparent pricing. Our stakeholders trust us because we operate with integrity.'
                            },
                            {
                                icon: CheckCircle2,
                                title: 'Reliability',
                                desc: '99.9% uptime, data security, and dedicated support. Schools depend on us—we never let them down.'
                            },
                            {
                                icon: Zap,
                                title: 'Innovation',
                                desc: 'We continuously evolve our platform to reflect best practices in education, pedagogy, and technology.'
                            }
                        ].map((value, i) => {
                            const Icon = value.icon;
                            return (
                                <div key={i} className="p-8 bg-white border border-gray-200 rounded-xl hover:border-[#520050] hover:shadow-lg transition-all">
                                    <Icon className="w-10 h-10 text-[#520050] mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                        {value.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {value.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Impact Metrics */}
            <section className="py-24 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        Our Impact by Numbers
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { stat: '500+', label: 'Schools Transforming', detail: 'Educational institutions across East Africa' },
                            { stat: '50K+', label: 'Active Educators', detail: 'Teachers empowered with better tools' },
                            { stat: '2M+', label: 'Assessments Created', detail: 'Evidence-based learning outcomes' },
                            { stat: '99.9%', label: 'System Uptime', detail: 'Enterprise-grade reliability' },
                            { stat: '40%', label: 'Avg Effectiveness ↑', detail: 'Measured educator impact increase' },
                            { stat: '35%', label: 'Admin Time Saved', detail: 'Automation reducing manual work' },
                            { stat: '92%', label: 'Customer Satisfaction', detail: 'Net Promoter Score (NPS)' },
                            { stat: '24/7', label: 'Support Coverage', detail: 'Our team is always available' }
                        ].map((metric, i) => (
                            <div key={i} className="p-8 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white">
                                <div className="text-4xl font-bold text-[#520050] mb-2">
                                    {metric.stat}
                                </div>
                                <p className="font-semibold text-gray-900 mb-1">
                                    {metric.label}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {metric.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-24 bg-gray-50 border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 mb-12">
                        The ElimCrown Story
                    </h2>

                    <div className="space-y-8">
                        <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 text-lg leading-relaxed">
                                ElimCrown was founded on a simple observation: African schools were struggling to implement competency-based assessment (CBC) without reliable, affordable technology. Teachers manually tracked hundreds of competencies, parents received printed reports once a term, and school leadership had no real-time visibility into institutional performance.
                            </p>
                        </div>

                        <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 text-lg leading-relaxed">
                                Our founding team—educators, engineers, and school administrators—came together with a shared mission: build the assessment platform Africa's schools deserve. We spent months in classrooms, understanding workflows, challenges, and opportunities at every level—from classroom teachers to school principals.
                            </p>
                        </div>

                        <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 text-lg leading-relaxed">
                                The result? ElimCrown—a comprehensive platform that makes evidence-based assessment practical, transparent, and impactful. Today, we're trusted by hundreds of schools across East Africa, with thousands of educators using our platform daily to make better decisions about learner outcomes.
                            </p>
                        </div>

                        <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 text-lg leading-relaxed">
                                We're not just building software—we're building a movement to transform education in Africa. Every school that joins us represents hundreds of learners with better teachers, clearer feedback, and brighter futures.
                            </p>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="mt-16 pt-12 border-t border-gray-200">
                        <h3 className="text-2xl font-bold text-gray-900 mb-8">
                            Our Journey
                        </h3>
                        <div className="space-y-6">
                            {[
                                { year: '2020', milestone: 'Founded with vision to digitize CBC assessment' },
                                { year: '2021', milestone: 'Launched beta with first 5 schools' },
                                { year: '2022', milestone: 'Scaled to 150+ schools across Kenya' },
                                { year: '2023', milestone: 'Added financial module and expanded to 350+ schools' },
                                { year: '2024', milestone: 'Launching regional expansion and enterprise features' }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-6 pb-6 border-b border-gray-200 last:border-b-0">
                                    <div className="flex-shrink-0">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#520050] text-white font-bold">
                                            {item.year.slice(-2)}
                                        </div>
                                    </div>
                                    <div className="pt-1">
                                        <p className="font-semibold text-gray-900">
                                            {item.year}
                                        </p>
                                        <p className="text-gray-600 mt-1">
                                            {item.milestone}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Credentials & Certifications */}
            <section className="py-24 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        Credentials & Compliance
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                badge: '🔒',
                                title: 'ISO 27001 Certified',
                                desc: 'Information security management system certified'
                            },
                            {
                                badge: '✓',
                                title: 'GDPR Compliant',
                                desc: 'Full compliance with data protection regulations'
                            },
                            {
                                badge: '🔐',
                                title: 'SOC 2 Type II',
                                desc: 'Security, availability, and confidentiality verified'
                            },
                            {
                                badge: '📱',
                                title: 'WCAG 2.1 AAA',
                                desc: 'Accessible design for all users'
                            },
                            {
                                badge: '🇰🇪',
                                title: 'KICD Aligned',
                                desc: 'All assessments aligned with CBC framework'
                            },
                            {
                                badge: '99.9%',
                                title: 'Enterprise SLA',
                                desc: 'Guaranteed uptime with priority support'
                            }
                        ].map((cert, i) => (
                            <div key={i} className="p-8 border border-gray-200 rounded-xl hover:border-[#520050] hover:shadow-lg transition-all text-center">
                                <div className="text-4xl mb-4">
                                    {cert.badge}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    {cert.title}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {cert.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recognition */}
            <section className="py-24 bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        Recognition & Awards
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                award: 'EdTech Innovation of the Year',
                                org: 'African EdTech Awards 2023',
                                detail: 'Recognized for transforming CBC assessment in African schools'
                            },
                            {
                                award: 'Best Ed-Tech Solution',
                                org: 'Kenya Digital Summit 2023',
                                detail: 'Excellence in educational technology implementation'
                            },
                            {
                                award: 'Top 100 EdTech Companies',
                                org: 'Africa Tech Impact Report 2023',
                                detail: 'Recognized among Africa\'s most innovative EdTech platforms'
                            },
                            {
                                award: 'Best for Social Impact',
                                org: 'B-Corp Assessment',
                                detail: 'Committed to positive social and environmental impact'
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-8 bg-white border border-gray-200 rounded-xl">
                                <Award className="w-8 h-8 text-[#520050] mb-4" />
                                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                    {item.award}
                                </h3>
                                <p className="text-sm text-[#520050] font-medium mb-2">
                                    {item.org}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {item.detail}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Culture */}
            <section className="py-24 bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <h2 className="text-4xl font-bold text-gray-900">
                        We're Hiring!
                    </h2>
                    <p className="text-xl text-gray-600">
                        Join mission-driven educators and engineers transforming education in Africa
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
                        {['Product', 'Engineering', 'Sales', 'Partnerships', 'Customer Success', 'Design', 'Marketing', 'Operations'].map((role, i) => (
                            <div key={i} className="p-4 border border-gray-200 rounded-lg hover:border-[#520050] transition-colors">
                                <p className="font-medium text-gray-900">{role}</p>
                            </div>
                        ))}
                    </div>
                    <button className="inline-flex items-center gap-2 px-8 py-4 bg-[#520050] hover:bg-[#3D0038] text-white font-semibold rounded-lg transition-colors">
                        Explore Careers <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-[#520050] text-white">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold">
                        Let's Transform Education Together
                    </h2>
                    <p className="text-xl text-white/80">
                        Join 500+ schools already experiencing the ElimCrown difference
                    </p>
                    <button
                        onClick={props.onGetStartedClick}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-[#520050] font-semibold rounded-lg transition-colors"
                    >
                        Get Started Today <ArrowRight size={20} />
                    </button>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default AboutPageEnterprise;
