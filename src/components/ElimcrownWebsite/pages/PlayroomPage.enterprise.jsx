import React, { useState } from 'react';
import { WebsiteLayout } from '../WebsiteLayout.enterprise';
import {
    Lightbulb,
    BookOpen,
    Code,
    Palette,
    Users,
    TrendingUp,
    Award,
    Zap,
    CheckCircle2,
    ArrowRight,
    Smartphone
} from 'lucide-react';

const PlayroomPageEnterprise = (props) => {
    const [selectedTab, setSelectedTab] = useState('learning');

    const categories = {
        learning: {
            title: 'Learning Hub',
            description: 'Resources and content for continuous educator development',
            icon: BookOpen,
            resources: [
                {
                    icon: BookOpen,
                    title: 'Lesson Planning Guides',
                    desc: 'CBC-aligned templates and best practices for lesson design',
                    count: '200+'
                },
                {
                    icon: Code,
                    title: 'Assessment Rubrics',
                    desc: 'Pre-built rubrics aligned with KICD competencies',
                    count: '500+'
                },
                {
                    icon: Palette,
                    title: 'Creative Activities',
                    desc: 'Innovative teaching methods and project-based learning ideas',
                    count: '300+'
                },
                {
                    icon: Users,
                    title: 'Peer Networks',
                    desc: 'Connect with educators nationwide and share experiences',
                    count: '50K+'
                }
            ]
        },
        innovation: {
            title: 'Innovation Lab',
            description: 'Cutting-edge research and experimental programs',
            icon: Lightbulb,
            resources: [
                {
                    icon: Lightbulb,
                    title: 'Research Insights',
                    desc: 'Latest findings in competency-based assessment and pedagogy',
                    count: '40+'
                },
                {
                    icon: Zap,
                    title: 'Pilot Programs',
                    desc: 'Early access to new features and experimental assessments',
                    count: '15+'
                },
                {
                    icon: TrendingUp,
                    title: 'Data Analytics',
                    desc: 'Advanced analytics tools for deeper learner insights',
                    count: '8+'
                },
                {
                    icon: Award,
                    title: 'Certification Programs',
                    desc: 'Professional development certifications for educators',
                    count: '5+'
                }
            ]
        },
        outcomes: {
            title: 'Success Stories & Outcomes',
            description: 'Real-world impact and institutional transformation',
            icon: TrendingUp,
            resources: [
                {
                    icon: Award,
                    title: 'Case Studies',
                    desc: 'Detailed analysis of school transformations and achievements',
                    count: '25+'
                },
                {
                    icon: Users,
                    title: 'Impact Reports',
                    desc: 'Aggregate data on learner outcomes and institutional growth',
                    count: '12+'
                },
                {
                    icon: TrendingUp,
                    title: 'Benchmarking Tools',
                    desc: 'Compare your school\'s performance with sector standards',
                    count: '1'
                },
                {
                    icon: CheckCircle2,
                    title: 'Success Metrics',
                    desc: 'KPIs to track and celebrate institutional progress',
                    count: '20+'
                }
            ]
        }
    };

    const currentTab = categories[selectedTab];
    const CurrentIcon = currentTab.icon;

    return (
        <WebsiteLayout {...props}>
            {/* Hero */}
            <section className="pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                        Future Skills Hub
                    </h1>
                    <p className="text-xl text-gray-600">
                        Empowering educators with knowledge, innovation, and proven outcomes
                    </p>
                </div>
            </section>

            {/* What is Playroom */}
            <section className="py-24 bg-white border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-bold text-gray-900">
                                Learning Never Stops
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                The Future Skills Hub is our comprehensive platform for continuous educator development, pedagogical innovation, and proven success strategies.
                            </p>
                            <div className="space-y-3">
                                {[
                                    'Access 1000+ educational resources',
                                    'Connect with 50,000+ educators',
                                    'Discover innovative teaching methods',
                                    'Learn from proven case studies'
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#520050]/10 to-[#017E84]/10 rounded-2xl p-8 flex items-center justify-center min-h-96">
                            <div className="text-center">
                                <BookOpen className="w-24 h-24 text-[#520050] mx-auto mb-4" strokeWidth={0.5} />
                                <p className="text-gray-600">
                                    Transforming education through continuous learning
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Resource Categories */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Tab Navigation */}
                    <div className="flex gap-4 mb-16 border-b border-gray-200 overflow-x-auto">
                        {Object.entries(categories).map(([key, category]) => {
                            const Icon = category.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTab(key)}
                                    className={`px-6 py-4 font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                                        selectedTab === key
                                            ? 'text-[#520050] border-[#520050]'
                                            : 'text-gray-600 border-transparent hover:text-gray-900'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {category.title}
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-8">
                        <div className="space-y-2">
                            <h2 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                                <CurrentIcon className="w-10 h-10 text-[#520050]" />
                                {currentTab.title}
                            </h2>
                            <p className="text-xl text-gray-600">
                                {currentTab.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                            {currentTab.resources.map((resource, i) => {
                                const Icon = resource.icon;
                                return (
                                    <div
                                        key={i}
                                        className="p-8 bg-white border border-gray-200 rounded-xl hover:border-[#520050] hover:shadow-lg transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <Icon className="w-12 h-12 text-[#520050] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                                            <span className="px-3 py-1 bg-[#520050] text-white text-sm font-semibold rounded-full">
                                                {resource.count}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {resource.title}
                                        </h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            {resource.desc}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Programs */}
            <section className="py-24 bg-white border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        Featured Programs
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'CBC Mastery Course',
                                desc: 'Comprehensive 8-week certification program on implementing CBC excellence',
                                level: 'All Levels',
                                duration: '8 weeks',
                                spots: '500+ educators trained'
                            },
                            {
                                title: 'Leadership Academy',
                                desc: 'Advanced program for principals and school administrators on data-driven leadership',
                                level: 'Intermediate',
                                duration: '6 weeks',
                                spots: '200+ leaders graduated'
                            },
                            {
                                title: 'Innovation Fellowship',
                                desc: 'Selective program for pioneering educators exploring new assessment methodologies',
                                level: 'Advanced',
                                duration: '12 weeks',
                                spots: '50 fellows per cohort'
                            }
                        ].map((program, i) => (
                            <div key={i} className="p-8 border border-gray-200 rounded-xl hover:border-[#520050] hover:shadow-lg transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <Award className="w-8 h-8 text-[#520050]" />
                                    <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                                        {program.level}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    {program.title}
                                </h3>
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {program.desc}
                                </p>
                                <div className="space-y-2 pt-6 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium text-gray-900">Duration:</span> {program.duration}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium text-gray-900">Impact:</span> {program.spots}
                                    </p>
                                </div>
                                <button className="w-full mt-6 px-4 py-2 border-2 border-[#520050] text-[#520050] hover:bg-[#520050] hover:text-white font-semibold rounded-lg transition-colors">
                                    Learn More
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Community & Networking */}
            <section className="py-24 bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        Connect with Global Educators
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    Educator Communities
                                </h3>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    Join subject-specific communities, discuss challenges, share best practices, and grow together with 50,000+ educators across Africa.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { name: 'Mathematics Innovators', members: '8,500+' },
                                    { name: 'Science & STEM', members: '7,200+' },
                                    { name: 'Language Arts', members: '6,800+' },
                                    { name: 'Leadership Circle', members: '3,500+' },
                                    { name: 'Assessment Specialists', members: '2,100+' }
                                ].map((community, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-[#520050] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-[#520050]" />
                                            <span className="font-medium text-gray-900">
                                                {community.name}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-600 font-medium">
                                            {community.members}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#520050]/10 to-blue-100/10 rounded-2xl p-8 flex items-center justify-center min-h-80">
                            <div className="text-center">
                                <Users className="w-20 h-20 text-[#520050] mx-auto mb-4" strokeWidth={0.5} />
                                <p className="text-gray-700 font-medium">
                                    50K+ Educators Connected
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Outcomes & Achievements */}
            <section className="py-24 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        Proven Results
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                stat: '92%',
                                label: 'Educator Satisfaction',
                                desc: 'Reported improved teaching effectiveness'
                            },
                            {
                                stat: '45%',
                                label: 'Learner Improvement',
                                desc: 'Average performance increase after year one'
                            },
                            {
                                stat: '3.2x',
                                label: 'Content Access',
                                desc: 'More learning resources available'
                            },
                            {
                                stat: '10K+',
                                label: 'Lessons Shared',
                                desc: 'Educator-created resources in library'
                            }
                        ].map((outcome, i) => (
                            <div key={i} className="p-8 border border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-white">
                                <div className="text-5xl font-bold text-[#520050] mb-2">
                                    {outcome.stat}
                                </div>
                                <p className="font-semibold text-gray-900 mb-1">
                                    {outcome.label}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {outcome.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mobile App */}
            <section className="py-24 bg-gray-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="bg-gradient-to-b from-[#520050]/20 to-purple-100/20 rounded-2xl p-8 flex items-center justify-center min-h-96">
                            <Smartphone className="w-32 h-32 text-[#520050]" strokeWidth={0.5} />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-4xl font-bold text-gray-900">
                                Learn on the Go
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Our mobile app brings all Future Skills Hub resources right to your pocket. Access lessons, participate in discussions, and track your professional development anytime, anywhere.
                            </p>
                            <div className="space-y-3">
                                {[
                                    'Offline access to learning materials',
                                    'Push notifications for new resources',
                                    'Progress tracking and certificates',
                                    'Peer messaging and collaboration'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                                        <span className="text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors">
                                    <span>App Store</span>
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 hover:border-[#520050] text-gray-900 font-semibold rounded-lg transition-colors">
                                    <span>Play Store</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-[#520050] text-white">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold">
                            Join the Learning Revolution
                        </h2>
                        <p className="text-xl text-white/80">
                            Start your journey as an educator innovator today
                        </p>
                    </div>
                    <button
                        onClick={props.onGetStartedClick}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-[#520050] font-semibold rounded-lg transition-colors"
                    >
                        Explore the Hub <ArrowRight size={20} />
                    </button>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default PlayroomPageEnterprise;
