import React, { useEffect, useState } from 'react';
import { WebsiteLayout } from '../WebsiteLayout';
import { Check, ArrowRight, BookOpen, Calculator, Bus, Calendar, Activity, MessageCircle, Database, Lock, PieChart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const SolutionsPage = (props) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <WebsiteLayout {...props}>
            <section className="bg-white pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded bg-[#f0f4f7] text-[#714B67] text-xs font-bold uppercase tracking-wider mb-6 transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        Solutions for Everyone
                    </div>
                    <h1 className={`text-4xl md:text-6xl font-bold mb-6 text-[#1a1a1a] tracking-tight transition-all duration-700 delay-100 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        Unified Operations for <br />
                        <span className="text-[#017E84]">Complex Institutions</span>
                    </h1>
                    <p className={`text-xl text-slate-500 max-w-3xl mx-auto mb-10 font-light transition-all duration-700 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        Elimcrown isn't just grading software. It's a comprehensive ERP that solves the distinct challenges faced by Principals, Bursars, and Teachers.
                    </p>
                </div>
            </section>

            {/* Role-Based Solutions */}
            <section className="py-16 bg-[#f9fafb] border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-6">

                    {/* For Principals */}
                    <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">For Principals: <br /> Total Visibility</h2>
                            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                Stop guessing about your school's performance. Get a bird's-eye view of admissions, daily attendance, disciplinary cases, and financial health from a single dashboard.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Check size={18} className="text-[#017E84]" /> Real-time Enrollment Statistics
                                </li>
                                <li className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Check size={18} className="text-[#017E84]" /> Staff Performance Monitoring
                                </li>
                                <li className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Check size={18} className="text-[#017E84]" /> Automated Compliance Reports
                                </li>
                            </ul>
                            <Link to="/get-started" className="inline-flex items-center gap-2 text-[#714B67] font-bold hover:gap-3 transition-all">
                                Start your trial <ArrowRight size={18} />
                            </Link>
                        </div>
                        <div className="lg:w-1/2">
                            <div className="bg-white p-2 rounded shadow-lg border border-gray-100">
                                <img src="/dashboard-preview.png" alt="Principal Dashboard" className="rounded w-full" />
                            </div>
                        </div>
                    </div>

                    {/* For Bursars */}
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16 mb-24">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">For Bursars: <br /> Airtight Financial Control</h2>
                            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                Eliminate leakages and streamline collections. Our integrated finance module handles complex fee structures, waivers, and multi-channel payments seamlessly.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Check size={18} className="text-[#017E84]" /> Auto-reconciled M-Pesa Payments
                                </li>
                                <li className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Check size={18} className="text-[#017E84]" /> Generated Fee Statements
                                </li>
                                <li className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Check size={18} className="text-[#017E84]" /> Expense Tracking & Budgeting
                                </li>
                            </ul>
                            <Link to="/get-started" className="inline-flex items-center gap-2 text-[#714B67] font-bold hover:gap-3 transition-all">
                                Explore Finance <ArrowRight size={18} />
                            </Link>
                        </div>
                        <div className="lg:w-1/2">
                            <div className="bg-white p-2 rounded shadow-lg border border-gray-100">
                                <img src="/finance-preview.png" alt="Finance Dashboard" className="rounded w-full" />
                            </div>
                        </div>
                    </div>

                    {/* For Teachers */}
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2">
                            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">For Teachers: <br /> Automated Grading</h2>
                            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                Reduce burnout by automating termly report generation. Input scores once, and let Elimcrown analyze performance, assign grades, and generate comments.
                            </p>
                            <ul className="space-y-3 mb-6">
                                <li className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Check size={18} className="text-[#017E84]" /> CBC & 8-4-4 Support
                                </li>
                                <li className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Check size={18} className="text-[#017E84]" /> Bulk Mark Entry & Import
                                </li>
                                <li className="flex items-center gap-3 text-slate-700 font-medium">
                                    <Check size={18} className="text-[#017E84]" /> Instant Class Performance Analysis
                                </li>
                            </ul>
                            <Link to="/get-started" className="inline-flex items-center gap-2 text-[#714B67] font-bold hover:gap-3 transition-all">
                                See Grading <ArrowRight size={18} />
                            </Link>
                        </div>
                        <div className="lg:w-1/2">
                            <div className="bg-white p-2 rounded shadow-lg border border-gray-100">
                                <img src="/assessment-matrix.png" alt="Grading Matrix" className="rounded w-full" />
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* All Modules Grid (The "Hidden" Stuff) */}
            <section className="py-16 bg-white border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">A Module for Every Need</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">Elimcrown comes batteries-included with everything you need to run a modern institution.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Bus, title: "Transport", desc: "Manage fleets, routes, and transport fees." },
                            { icon: Calendar, title: "Timetable", desc: "Conflict-free scheduling for classes and exams." },
                            { icon: MessageCircle, title: "Communication", desc: "Native SMS & Email blasts to parents." },
                            { icon: Database, title: "Admissions", desc: "Digital intake forms and student profiles." },
                            { icon: Activity, title: "Co-Curricular", desc: "Track sports, clubs, and societies." },
                            { icon: Lock, title: "Gate Pass", desc: "Secure visitor management and student exit logs." },
                            { icon: PieChart, title: "Inventory", desc: "Track school assets, textbooks, and stores." },
                            { icon: Users, title: "HR & Payroll", desc: "Manage staff contracts, leave, and salaries." },
                        ].map((mod, i) => (
                            <div key={i} className="bg-[#f9fafb] p-6 rounded hover:bg-white hover:shadow-md transition-all cursor-default border border-transparent hover:border-gray-200">
                                <div className="text-[#714B67] mb-3">
                                    <mod.icon size={28} />
                                </div>
                                <h3 className="font-bold text-[#1a1a1a] mb-2 text-md">{mod.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{mod.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default SolutionsPage;
