import React, { useEffect, useState } from 'react';
import { WebsiteLayout } from '../WebsiteLayout';
import { ArrowRight, Code, Bot, Globe, CheckCircle2, BookOpen, Users, BarChart3, Sparkles, Target, Zap } from 'lucide-react';

const HomePage = (props) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <WebsiteLayout {...props}>

            {/* Hero Section */}
            <section className="relative pt-24 pb-32 overflow-hidden bg-white">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#f4f0f2]/50 -skew-x-12 translate-x-32 hidden lg:block"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-10 text-left">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 bg-[#f4f0f2] border border-[#d9ccd5] rounded-full transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <Sparkles className="w-4 h-4 text-[#875A7B]" strokeWidth={2} />
                                <span className="text-xs font-bold text-[#875A7B] uppercase tracking-wider">A Practical Way to Deliver CBC</span>
                            </div>

                            <h1 className={`text-5xl md:text-7xl font-bold text-brand-dark leading-[1.1] tracking-tight transition-all duration-700 delay-100 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                Where <span className="text-[#875A7B]">Play</span> Becomes <span className="text-teal-600 font-light">Learning</span>.
                            </h1>

                            <p className={`text-xl text-slate-600 leading-relaxed max-w-xl font-light transition-all duration-700 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                ElimCrown is a technology-driven sanctuary where children build, code, and solve real-world problems while automatically capturing clear CBC evidence.
                            </p>

                            <div className={`flex flex-wrap gap-4 pt-4 transition-all duration-700 delay-400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                                <button onClick={props.onGetStartedClick} className="bg-[#875A7B] hover:bg-[#714B67] text-white px-8 py-4 rounded-xl font-bold shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2">
                                    Explore the Playroom <ArrowRight size={20} />
                                </button>
                                <button onClick={props.onLoginClick} className="bg-white border-2 border-teal-600 hover:bg-teal-50 text-teal-600 px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2">
                                    Request a Demo
                                </button>
                            </div>
                        </div>

                        <div className={`relative transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                            <div className="aspect-[4/3] bg-white rounded-3xl shadow-2xl p-4 rotate-2 relative z-10 border border-slate-100 overflow-hidden transform hover:rotate-0 transition-transform duration-500">
                                <img src="/vibrant_tech_lab_kids_3_retry_1770263705249.png" alt="Children in Tech Lab" className="w-full h-full object-cover rounded-2xl" />
                                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                                    <p className="text-white font-semibold italic text-lg">"The future belongs to those who build it."</p>
                                </div>
                            </div>
                            <div className="absolute -top-10 -right-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Problem Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            The Problem <span className="font-normal">We Are Solving</span>
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                            Kenya's Competency-Based Curriculum expects schools to nurture creativity, critical thinking, and digital literacy. However, most schools lack practical tools to deliver these skills effectively.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { icon: Code, text: "Coding and robotics are often taught theoretically" },
                            { icon: Users, text: "Teachers struggle to capture CBC evidence" },
                            { icon: BookOpen, text: "Learners disengage from passive learning" },
                            { icon: BarChart3, text: "Assessment becomes paperwork-heavy" }
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-6 border-l-4 border-[#a07c95] shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-[#f4f0f2] flex items-center justify-center flex-shrink-0">
                                        <item.icon className="text-[#875A7B]" size={24} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-700 font-medium leading-relaxed">{item.text}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Parallax Section Break */}
            <section className="relative h-96 overflow-hidden bg-fixed bg-center bg-cover" style={{ backgroundImage: 'url(/playroom-bg.jpg)', backgroundAttachment: 'fixed' }}>
                <div className="absolute inset-0 bg-[#714B67] bg-opacity-80"></div>
                <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Bridging the <span className="font-normal">Assessment Gaps</span>
                        </h2>
                        <p className="text-xl text-white text-opacity-90">
                            Every interaction becomes evidence. Every challenge builds competence.
                        </p>
                    </div>
                </div>
            </section>

            {/* The Solution Section */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col lg:flex-row gap-20 items-center mb-16">
                        <div className="flex-1 space-y-8">
                            <h2 className="text-4xl md:text-5xl font-bold text-brand-dark tracking-tight">The <span className="text-[#875A7B]">Digital Playroom</span> Experience</h2>
                            <p className="text-xl text-slate-600 leading-relaxed font-light">
                                ElimCrown introduces a digital Playroom where learners code, experiment, and explore real-world challenges. Every interaction becomes observable CBC assessment evidence captured automatically and organized in the <span className="font-semibold text-teal-600">Learning Hub</span>.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-[#f4f0f2] rounded-3xl p-8 aspect-square flex flex-col justify-between hover:shadow-lg transition-all">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <Code className="text-[#875A7B]" />
                                    </div>
                                    <p className="font-semibold text-brand-dark">Practical Coding</p>
                                </div>
                                <div className="bg-teal-50 rounded-3xl p-8 aspect-square flex flex-col justify-between translate-y-8 hover:shadow-lg transition-all">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <Target className="text-teal-600" />
                                    </div>
                                    <p className="font-semibold text-brand-dark">Evidence-based</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="relative">
                                <img src="/coding_class_kids_1_1770263631919.png" alt="Coding Class" className="rounded-3xl shadow-2xl relative z-10" />
                                <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-[#875A7B]/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row-reverse gap-20 items-center pt-20">
                        <div className="flex-1 space-y-8">
                            <h3 className="text-4xl font-bold text-brand-dark tracking-tight">Robotics & <span className="text-teal-600 font-light">Innovation</span></h3>
                            <p className="text-xl text-slate-600 leading-relaxed font-light">
                                Our virtual labs allow students to program robots and see results in real-time. It's the perfect bridge from logical thinking to physical implementation.
                            </p>
                            <ul className="space-y-4">
                                {["Visual Logic Blocks", "Hardware Simulation", "Real-world Projects"].map((item, i) => (
                                    <li key={i} className="flex gap-3 items-center text-slate-700 font-medium">
                                        <CheckCircle2 size={24} className="text-teal-600" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex-1">
                            <div className="relative">
                                <img src="/robotics_playroom_kids_2_1770263661364.png" alt="Robotics Training" className="rounded-3xl shadow-2xl relative z-10" />
                                <div className="absolute -top-10 -left-10 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Playroom Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            The <span className="font-normal">Playroom</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-4 font-light italic">A Space to Explore, Build, and Think</p>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                            The ElimCrown Playroom is a guided digital environment where learners develop skills through experimentation and problem-solving. Students can now <strong>submit their projects directly to teachers</strong> for assessment.
                        </p>
                        <div className="inline-block bg-[#f4f0f2] border border-[#d9ccd5] px-5 py-2 rounded-xl">
                            <p className="text-[#714B67] font-semibold">
                                No pressure. No memorisation. Just meaningful learning.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: Code, title: "Coding Playground", desc: "Learners use block-based coding and introductory programming concepts to solve challenges, build logical thinking, and grow digital confidence.", color: "purple" },
                            { icon: Bot, title: "Virtual Robotics", desc: "Learners program virtual robots to move, react, and solve problems — without the need for expensive physical kits.", color: "teal" },
                            { icon: Globe, title: "Virtual Exploration", desc: "Interactive environments transform science, technology, and environmental learning into engaging, hands-on experiences.", color: "purple" }
                        ].map((module, i) => (
                            <div key={i} className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all rounded-3xl overflow-hidden group">
                                <div className={`h-48 ${module.color === 'purple' ? 'bg-[#f4f0f2]' : 'bg-teal-50'} flex items-center justify-center border-b border-gray-200`}>
                                    <module.icon className={module.color === 'purple' ? 'text-[#875A7B]' : 'text-teal-600'} size={80} strokeWidth={1.5} />
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{module.title}</h3>
                                    <p className="text-gray-600 leading-relaxed font-light">{module.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            How It <span className="font-normal">Works</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                        {[
                            { num: "1", title: "Learners Engage", desc: "Learners engage with challenges in the Playroom", icon: Target },
                            { num: "2", title: "Evidence Captured", desc: "Assessments are automatically submitted to the Learning Hub", icon: BarChart3 },
                            { num: "3", title: "Auto-Observation", desc: "Competencies are observed and mapped automatically", icon: Zap },
                            { num: "4", title: "Teacher Validation", desc: "Teachers validate learning and generate CBC reports", icon: CheckCircle2 }
                        ].map((step, i) => (
                            <div key={i} className="relative">
                                <div className="bg-white p-8 border-2 border-gray-100 hover:border-[#875A7B] hover:shadow-xl transition-all rounded-3xl">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-[#875A7B] text-white flex items-center justify-center font-bold text-xl rounded-xl">
                                            {step.num}
                                        </div>
                                        <step.icon className="text-teal-600" size={28} strokeWidth={2} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed font-light">{step.desc}</p>
                                </div>
                                {i < 3 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                                        <ArrowRight className="text-gray-300" size={24} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center bg-teal-50 border border-teal-100 p-8 rounded-[2rem]">
                        <p className="text-xl font-bold text-gray-900">
                            This approach reduces workload while improving learning quality.
                        </p>
                    </div>
                </div>
            </section>

            {/* Curriculum Alignment Section */}
            <section className="py-20 bg-gray-50 border-y border-gray-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            Curriculum <span className="font-normal">Alignment</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-4 font-light italic">Built Specifically for CBC</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div className="bg-white p-10 border-l-4 border-[#875A7B] shadow-sm rounded-r-3xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8">Learning Areas Supported</h3>
                            <ul className="space-y-4">
                                {["Digital Literacy", "Computer Science", "Science and Technology", "Mathematics (Applied Thinking)", "Environmental Studies", "Life Skills"].map((area, i) => (
                                    <li key={i} className="flex items-center gap-4">
                                        <CheckCircle2 className="text-[#875A7B] flex-shrink-0" size={24} strokeWidth={2} />
                                        <span className="text-gray-700 text-lg font-light">{area}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white p-10 border-l-4 border-teal-600 shadow-sm rounded-r-3xl">
                            <h3 className="text-2xl font-bold text-gray-900 mb-8">Core CBC Competencies</h3>
                            <ul className="space-y-4">
                                {["Critical thinking and problem solving", "Creativity and imagination", "Digital literacy", "Communication and collaboration", "Learning to learn"].map((comp, i) => (
                                    <li key={i} className="flex items-center gap-4">
                                        <CheckCircle2 className="text-teal-600 flex-shrink-0" size={24} strokeWidth={2} />
                                        <span className="text-gray-700 text-lg font-light">{comp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* For Schools Section */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            For <span className="font-normal">Schools</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8 font-light italic">Designed for Real Classrooms</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {[
                            { icon: CheckCircle2, text: "Works on laptops, tablets, and labs" },
                            { icon: CheckCircle2, text: "No specialised hardware required" },
                            { icon: CheckCircle2, text: "Teacher-first, low-training design" },
                            { icon: CheckCircle2, text: "Affordable and scalable for all" }
                        ].map((benefit, i) => (
                            <div key={i} className="bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all rounded-2xl">
                                <benefit.icon className="text-teal-600 mb-4" size={32} strokeWidth={2} />
                                <p className="text-gray-800 font-medium leading-relaxed">{benefit.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-center bg-gray-50 border-2 border-[#875A7B]/30 p-12 rounded-[3rem]">
                        <p className="text-2xl font-bold text-gray-900 mb-8">
                            ElimCrown helps schools deliver CBC confidently and consistently.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button className="px-10 py-4 bg-[#875A7B] hover:bg-[#714B67] text-white font-bold transition-all rounded-2xl shadow-lg">
                                View Pricing
                            </button>
                            <button onClick={props.onLoginClick} className="px-10 py-4 bg-white hover:bg-teal-50 text-teal-600 border-2 border-teal-600 font-bold transition-all rounded-2xl">
                                Request School Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="py-32 bg-[#875A7B] text-white">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-16 tracking-tight">
                        About <span className="font-light italic">ElimCrown</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-white/10 backdrop-blur-md p-10 border border-white/20 rounded-[2rem]">
                            <h3 className="text-2xl font-bold mb-6 italic">Our Vision</h3>
                            <p className="text-xl leading-relaxed text-white/90 font-light">
                                To empower every learner to grow through creativity, exploration, and problem solving.
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md p-10 border border-white/20 rounded-[2rem]">
                            <h3 className="text-2xl font-bold mb-6 italic">Our Mission</h3>
                            <p className="text-xl leading-relaxed text-white/90 font-light">
                                To make competency-based learning practical, engaging, and accessible for every school.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-32 bg-white">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
                        Ready to <span className="text-[#875A7B]">Get Started</span>?
                    </h2>
                    <p className="text-2xl text-gray-500 mb-16 font-light">Ready to bring ElimCrown to your school?</p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                        <button onClick={props.onGetStartedClick} className="px-12 py-5 bg-[#875A7B] hover:bg-[#714B67] text-white font-bold shadow-2xl transition-all rounded-2xl text-xl hover:-translate-y-1">
                            Request a Demo
                        </button>
                        <button onClick={props.onLoginClick} className="px-12 py-5 bg-white hover:bg-teal-50 text-teal-600 border-2 border-teal-600 font-bold shadow-lg transition-all rounded-2xl text-xl">
                            Partner with Us
                        </button>
                    </div>

                    <div className="text-gray-500 font-light">
                        <p className="mb-2">Contact us:</p>
                        <p className="text-lg font-bold text-brand-dark">hello@elimcrown.com | +254 700 000 000</p>
                    </div>
                </div>
            </section>

        </WebsiteLayout>
    );
};

export default HomePage;
