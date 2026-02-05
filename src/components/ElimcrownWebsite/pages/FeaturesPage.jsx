import React from 'react';
import { WebsiteLayout } from '../WebsiteLayout';
import { Check, Star } from 'lucide-react';

const FeaturesPage = (props) => {
    return (
        <WebsiteLayout {...props}>
            <section className="bg-white pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <span className="text-[#017E84] font-bold tracking-wider uppercase text-sm mb-4 block">Platform Capabilities</span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#1a1a1a]">The Complete <br /> School Operating System</h1>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto font-light">
                        Elimcrown unifies every aspect of school management into a single, cohesive workflow.
                    </p>
                </div>
            </section>

            <section className="py-16 bg-[#f9fafb]">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Feature Block 1: Grading */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                        <div>
                            <div className="p-2 bg-[#f4f0f2] rounded w-fit mb-6">
                                <Star className="text-[#875A7B]" />
                            </div>
                            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">CBC Assessment Engine</h2>
                            <p className="text-lg text-slate-500 mb-6 leading-relaxed">
                                Automatically generate compliant assessments based on the latest KICD curriculum designs. Support for all learning areas, strands, and sub-strands without the spreadsheet headache.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3">
                                    <Check size={18} className="text-[#017E84]" />
                                    <span className="text-[#1a1a1a] font-medium">8-Level Rubric System</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check size={18} className="text-[#017E84]" />
                                    <span className="text-[#1a1a1a] font-medium">Automated Skill Analysis</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check size={18} className="text-[#017E84]" />
                                    <span className="text-[#1a1a1a] font-medium">Parent-Friendly Reports</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-white rounded shadow-lg border border-slate-100 overflow-hidden">
                            <img src="/assessment-matrix.png" alt="Assessment Matrix" className="w-full h-auto" />
                        </div>
                    </div>

                    {/* Feature Block 2: Finance */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                        <div className="order-2 lg:order-1 bg-white rounded shadow-lg border border-slate-100 overflow-hidden">
                            <img src="/finance-preview.png" alt="Finance Dashboard" className="w-full h-auto" />
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="p-2 bg-[#f0f4f7] rounded w-fit mb-6">
                                <Star className="text-[#017E84]" />
                            </div>
                            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">Financial Intelligence</h2>
                            <p className="text-lg text-slate-500 mb-6 leading-relaxed">
                                Track fee collections, generate invoices, and manage expenses with enterprise-grade accounting tools built specifically for schools in Kenya.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3">
                                    <Check size={18} className="text-[#017E84]" />
                                    <span className="text-[#1a1a1a] font-medium">Automated Invoicing</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check size={18} className="text-[#017E84]" />
                                    <span className="text-[#1a1a1a] font-medium">M-Pesa Integration</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Check size={18} className="text-[#017E84]" />
                                    <span className="text-[#1a1a1a] font-medium">Real-time Balance Sheets</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Additional Modules Grid */}
                    <div className="bg-white rounded shadow-sm border border-slate-200 p-10">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">Beyond the Basics</h2>
                            <p className="text-slate-500">Discover the hidden power modules that drive efficiency.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { color: 'bg-blue-500', title: 'Admissions Portal', desc: 'Digital intake forms, transfer management, and automated admission number generation.' },
                                { color: 'bg-indigo-500', title: 'Transport Manager', desc: 'Manage bus routes, assign students to zones, and track transport fee payment status.' },
                                { color: 'bg-teal-500', title: 'Communication Hub', desc: 'Native SMS integration for bulk announcements, balance reminders, and discipline alerts.' },
                                { color: 'bg-orange-500', title: 'Co-Curricular', desc: 'Track student participation in sports, clubs, and societies for holistic assessment.' },
                                { color: 'bg-red-500', title: 'Discipline Tracker', desc: 'Log incidents, manage sanctions, and keep parents informed of behavioral issues.' },
                                { color: 'bg-purple-900', title: 'Learning Hub', desc: 'Repository for past papers, revision materials, and teacher resources.' }
                            ].map((mod, i) => (
                                <div key={i} className="p-4 rounded hover:bg-slate-50 transition-colors">
                                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-[#1a1a1a]">
                                        <div className={`w-2 h-2 rounded-full ${mod.color}`}></div> {mod.title}
                                    </h3>
                                    <p className="text-sm text-slate-500">{mod.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default FeaturesPage;
