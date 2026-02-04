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
            <section className="relative pt-32 pb-24 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

                    {/* Main Headline */}
                    <h1 className={`text-6xl md:text-8xl font-extrabold tracking-tight text-brand-dark mb-8 leading-[1.05] transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        Amazing software. <br />
                        <span className="text-brand-teal">For amazing schools.</span>
                    </h1>

                    {/* Subheadline - Compact */}
                    <p className={`text-2xl text-slate-500 max-w-3xl mx-auto mb-12 font-light transition-all duration-700 delay-100 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        Scale your institution with the only platform you'll ever need.
                    </p>

                    {/* CTA Buttons - Odoo specific colors */}
                    <div className={`flex flex-col sm:flex-row items-center justify-center gap-5 mb-20 transition-all duration-700 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        <button onClick={props.onGetStartedClick} className="px-10 py-4 bg-brand-purple hover:bg-[#5d3d54] text-white font-bold rounded shadow-md hover:shadow-xl transition-all text-xl flex items-center gap-2">
                            Start now — It's free
                        </button>
                        <button onClick={props.onLoginClick} className="px-10 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded shadow-sm hover:shadow transition-all text-xl">
                            Schedule a demo
                        </button>
                    </div>

                    {/* Hero Image - Minimalist */}
                    <div className={`relative mx-auto max-w-6xl transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                        <div className="rounded-xl shadow-2xl overflow-hidden border border-slate-200 bg-white p-2">
                            <img
                                src="/dashboard-preview.png"
                                alt="Elimcrown Dashboard"
                                className="w-full h-auto object-cover rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* The "App Store" Grid - The Core Odoo Look */}
            <section className="py-24 bg-brand-light border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-extrabold text-brand-dark mb-6">Unleash your growth potential</h2>
                        <p className="text-xl text-slate-500 max-w-3xl mx-auto">
                            All the apps you need in one platform. Integrated, simple, and loved by thousands.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Layout, title: "Website", color: "text-brand-purple", bg: "bg-purple-50" },
                            { icon: BarChart2, title: "Grading", color: "text-brand-teal", bg: "bg-teal-50" },
                            { icon: Shield, title: "Finance", color: "text-brand-purple", bg: "bg-purple-50" },
                            { icon: Users, title: "HR", color: "text-brand-teal", bg: "bg-teal-50" },
                            { icon: Globe, title: "Admissions", color: "text-brand-purple", bg: "bg-purple-50" },
                            { icon: Cloud, title: "eLearning", color: "text-brand-teal", bg: "bg-teal-50" },
                            { icon: Lock, title: "Security", color: "text-brand-purple", bg: "bg-purple-50" },
                            { icon: Zap, title: "Transport", color: "text-brand-teal", bg: "bg-teal-50" }
                        ].map((app, i) => (
                            <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center">
                                <div className={`w-20 h-20 ${app.bg} ${app.color} rounded-full mb-6 flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                                    <app.icon size={44} strokeWidth={1.5} />
                                </div>
                                <h3 className="text-xl font-bold text-brand-dark">{app.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Spotlight - Compact Bento */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
                        <div className="order-2 md:order-1">
                            <span className="text-brand-teal font-bold text-sm tracking-widest uppercase mb-3 block">New</span>
                            <h3 className="text-5xl font-extrabold text-brand-dark mb-6">Level up with AI</h3>
                            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                                Our new artificial intelligence engine analyses student performance trends to give you actionable insights.
                            </p>
                            <button className="text-brand-purple font-bold hover:text-[#5d3d54] text-lg flex items-center gap-2 group">
                                Learn more <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="order-1 md:order-2 bg-[#f0f4f7] rounded-2xl p-10">
                            <img src="/assessment-matrix.png" className="rounded-lg shadow-xl w-full transform rotate-2 hover:rotate-0 transition-all duration-500" alt="AI Analytics" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="p-10 border border-gray-100 rounded-xl bg-[#fcfcfc] hover:bg-white hover:shadow-lg transition-all">
                            <Shield size={40} className="text-brand-purple mb-6" />
                            <h3 className="text-2xl font-bold text-brand-dark mb-3">Secure Finance</h3>
                            <p className="text-slate-500">Bank-grade custom encryption for all your financial data.</p>
                        </div>

                        <div className="p-10 border border-gray-100 rounded-xl bg-[#fcfcfc] hover:bg-white hover:shadow-lg transition-all">
                            <Users size={40} className="text-brand-teal mb-6" />
                            <h3 className="text-2xl font-bold text-brand-dark mb-3">HR & Payroll</h3>
                            <p className="text-slate-500">Automate payslips, leave requests, and staff appraisals.</p>
                        </div>

                        <div className="p-10 border border-gray-100 rounded-xl bg-[#fcfcfc] hover:bg-white hover:shadow-lg transition-all">
                            <Globe size={40} className="text-brand-purple mb-6" />
                            <h3 className="text-2xl font-bold text-brand-dark mb-3">Admissions</h3>
                            <p className="text-slate-500">Paperless intake forms directly from your website.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof - Clean & Simple */}
            <section className="py-24 bg-brand-purple text-white">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <Star className="w-12 h-12 text-yellow-400 mx-auto mb-8 fill-current" />
                    <blockquote className="text-3xl md:text-5xl font-medium leading-tight mb-10">
                        "Elimcrown has completely transformed how we run Alliance High. It's not just software; it's a competitive advantage."
                    </blockquote>
                    <div className="font-bold text-xl">Dr. William Mwangi</div>
                    <div className="text-white/70">Principal, Alliance High School</div>
                </div>
            </section>

            {/* Call to Action - Compact */}
            <section className="py-24 bg-brand-light">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-brand-dark mb-8">7 million users grow with Elimcrown</h2>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <button onClick={props.onGetStartedClick} className="px-10 py-4 bg-brand-teal hover:bg-[#006b70] text-white font-bold rounded shadow-md hover:shadow-xl transition-all text-xl">
                            Start now — It's free
                        </button>
                        <button onClick={props.onLoginClick} className="px-10 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold rounded shadow-sm hover:shadow transition-all text-xl">
                            Contact Sales
                        </button>
                    </div>
                </div>
            </section>

        </WebsiteLayout>
    );
};

export default HomePage;
