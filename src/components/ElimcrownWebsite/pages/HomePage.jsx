import React, { useEffect, useState } from 'react';
import { WebsiteLayout } from '../WebsiteLayout';
import { ArrowRight, Check, Zap, Shield, BarChart2, Users, Layout, Globe, Lock, Cpu, Star, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = (props) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <WebsiteLayout {...props}>
            {/* Hero Section - Odoo Style (Clean, White, Purple Buttons) */}
            <section className="relative pt-24 pb-20 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

                    {/* Main Headline */}
                    <h1 className={`text-5xl md:text-7xl font-bold tracking-tight text-[#1a1a1a] mb-6 leading-[1.1] transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        Amazing software. <br />
                        <span className="text-[#017E84]">For amazing schools.</span>
                    </h1>

                    {/* Subheadline - Compact */}
                    <p className={`text-xl text-slate-500 max-w-2xl mx-auto mb-10 font-light transition-all duration-700 delay-100 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        Scale your institution with the only platform you'll ever need.
                    </p>

                    {/* CTA Buttons - Odoo specific colors */}
                    <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <button onClick={props.onGetStartedClick} className="px-8 py-3 bg-[#714B67] hover:bg-[#5d3d54] text-white font-bold rounded shadow hover:shadow-lg transition-all text-lg flex items-center gap-2">
                            Start now — It's free
                        </button>
                        <button onClick={props.onLoginClick} className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded shadow-sm hover:shadow transition-all text-lg">
                            Schedule a demo
                        </button>
                    </div>

                    {/* Hero Image - Minimalist */}
                    <div className={`relative mx-auto max-w-5xl transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <div className="rounded shadow-2xl overflow-hidden border border-slate-200">
                            <img
                                src="/dashboard-preview.png"
                                alt="Elimcrown Dashboard"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* The "App Store" Grid - The Core Odoo Look */}
            <section className="py-20 bg-[#f9fafb] border-t border-gray-200">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">Unleash your growth potential</h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                            All the apps you need in one platform. Integrated, simple, and loved by thousands.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Layout, title: "Website", color: "text-[#714B67]", bg: "bg-white" },
                            { icon: BarChart2, title: "Grading", color: "text-[#017E84]", bg: "bg-white" },
                            { icon: Shield, title: "Finance", color: "text-[#714B67]", bg: "bg-white" },
                            { icon: Users, title: "HR", color: "text-[#017E84]", bg: "bg-white" },
                            { icon: Globe, title: "Admissions", color: "text-[#714B67]", bg: "bg-white" },
                            { icon: Cloud, title: "eLearning", color: "text-[#017E84]", bg: "bg-white" },
                            { icon: Lock, title: "Security", color: "text-[#714B67]", bg: "bg-white" },
                            { icon: Zap, title: "Transport", color: "text-[#017E84]", bg: "bg-white" }
                        ].map((app, i) => (
                            <div key={i} className="bg-white p-6 rounded shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group flex flex-col items-center text-center">
                                <div className={`w-16 h-16 ${app.color} mb-4 flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                                    <app.icon size={40} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-lg font-bold text-[#1a1a1a]">{app.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Spotlight - Compact Bento */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-20">
                        <div className="order-2 md:order-1">
                            <span className="text-[#017E84] font-bold text-sm tracking-widest uppercase mb-2 block">New</span>
                            <h3 className="text-4xl font-bold text-[#1a1a1a] mb-4">Level up with AI</h3>
                            <p className="text-lg text-slate-600 mb-6">
                                Our new artificial intelligence engine analyses student performance trends to give you actionable insights.
                            </p>
                            <button className="text-[#714B67] font-bold hover:text-[#5d3d54] flex items-center gap-2">
                                Learn more <ArrowRight size={18} />
                            </button>
                        </div>
                        <div className="order-1 md:order-2 bg-[#f0f4f7] rounded-lg p-8">
                            <img src="/assessment-matrix.png" className="rounded shadow-lg w-full transform rotate-2 hover:rotate-0 transition-all duration-500" alt="AI Analytics" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-8 border border-gray-100 rounded bg-[#fcfcfc]">
                            <Shield size={32} className="text-[#714B67] mb-4" />
                            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Secure Finance</h3>
                            <p className="text-slate-500 text-sm">Bank-grade custom encryption for all your financial data.</p>
                        </div>

                        <div className="p-8 border border-gray-100 rounded bg-[#fcfcfc]">
                            <Users size={32} className="text-[#017E84] mb-4" />
                            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">HR & Payroll</h3>
                            <p className="text-slate-500 text-sm">Automate payslips, leave requests, and staff appraisals.</p>
                        </div>

                        <div className="p-8 border border-gray-100 rounded bg-[#fcfcfc]">
                            <Globe size={32} className="text-[#714B67] mb-4" />
                            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Admissions</h3>
                            <p className="text-slate-500 text-sm">Paperless intake forms directly from your website.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof - Clean & Simple */}
            <section className="py-20 bg-[#714B67] text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <Star className="w-10 h-10 text-yellow-400 mx-auto mb-6 fill-current" />
                    <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-8">
                        "Elimcrown has completely transformed how we run Alliance High. It's not just software; it's a competitive advantage."
                    </blockquote>
                    <div className="font-bold">Dr. William Mwangi</div>
                    <div className="text-white/70 text-sm">Principal, Alliance High School</div>
                </div>
            </section>

            {/* Call to Action - Compact */}
            <section className="py-20 bg-[#f9fafb]">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-[#1a1a1a] mb-6">7 million users grow with Elimcrown</h2>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button onClick={props.onGetStartedClick} className="px-8 py-3 bg-[#017E84] hover:bg-[#006b70] text-white font-bold rounded shadow hover:shadow-lg transition-all text-lg">
                            Start now — It's free
                        </button>
                        <button onClick={props.onLoginClick} className="px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded shadow-sm hover:shadow transition-all text-lg">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

        </WebsiteLayout>
    );
};

export default HomePage;
