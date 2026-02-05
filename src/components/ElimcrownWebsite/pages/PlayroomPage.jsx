import React from 'react';
import { WebsiteLayout } from '../WebsiteLayout';
import { Play, Cpu, Code, Lightbulb, Users, ArrowRight, CheckCircle, Quote, Sparkles, Rocket, Zap, Bot } from 'lucide-react';

const PlayroomPage = (props) => {
    return (
        <WebsiteLayout {...props}>
            <div className="bg-white">
                {/* Hero Section */}
                <section className="relative pt-24 pb-32 overflow-hidden bg-white">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f4f0f2]/50 -skew-x-12 translate-x-32 hidden lg:block"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div className="space-y-10">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f4f0f2] border border-[#d9ccd5] rounded-full">
                                    <Sparkles className="w-4 h-4 text-[#875A7B]" />
                                    <span className="text-xs font-bold text-[#875A7B] uppercase tracking-wider">The Innovation Hub</span>
                                </div>
                                <h1 className="text-5xl md:text-7xl font-bold text-brand-dark leading-[1.1] tracking-tight">
                                    Where <span className="text-[#875A7B]">Curiosity</span> Leads to <span className="text-teal-600 font-light italic">Creation</span>.
                                </h1>
                                <p className="text-xl text-slate-600 leading-relaxed max-w-xl font-light">
                                    The ElimCrown Playroom is a technology-driven sanctuary where children build, code, and solve real-world problems using the latest in Robotics, AI, and Design Thinking.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <button onClick={props.onGetStartedClick} className="bg-[#875A7B] hover:bg-[#714B67] text-white px-8 py-4 rounded-2xl font-bold shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2">
                                        Explore the Experience <ArrowRight size={20} />
                                    </button>
                                    <button className="bg-white border-2 border-slate-200 hover:border-[#875A7B] text-slate-700 px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2">
                                        Watch the Method <Play size={20} className="text-[#875A7B]" />
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-square bg-white rounded-[3rem] shadow-2xl p-4 rotate-3 relative z-10 border border-slate-100 overflow-hidden group hover:rotate-0 transition-all duration-700">
                                    <img src="/child_robotics_sensor_playroom_1770264083370.png" alt="Children in Robotics Lab" className="w-full h-full object-cover rounded-[2.5rem]" />
                                    <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                                        <p className="text-white font-semibold italic text-xl leading-relaxed">"Every block I move brings me closer to building my own world."</p>
                                        <span className="text-white/70 text-sm mt-2 block">— Grade 3 Explorer</span>
                                    </div>
                                </div>
                                <div className="absolute -top-12 -right-12 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-12 -left-12 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The "Oasis" Statement */}
                <section className="py-32 bg-brand-dark relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                        <div className="absolute inset-0 bg-[radial-gradient(#875A7B_1px,transparent_1px)] [background-size:40px_40px]"></div>
                    </div>
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <div className="w-20 h-20 bg-[#875A7B]/20 border border-[#875A7B]/30 rounded-3xl flex items-center justify-center mx-auto mb-10">
                            <Lightbulb className="text-[#875A7B]" size={40} />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight italic">"The Playroom is an oasis for the mind — a place where theoretical concepts become tangible realities."</h2>
                        <div className="h-1 w-24 bg-[#875A7B] mx-auto rounded-full"></div>
                    </div>
                </section>

                {/* The Block Method */}
                <section className="py-32">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col lg:flex-row gap-20 items-center">
                            <div className="flex-1 space-y-10">
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-bold text-brand-dark tracking-tight">The <span className="text-[#875A7B]">Block Logic</span> Framework</h3>
                                    <p className="text-xl text-slate-600 leading-relaxed font-light">
                                        ElimCrown uses visual block-based programming as the foundational bridge. We eliminate the frustration of syntax and focus entirely on logic, sequencing, and problem recognition.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[
                                        { title: "Visual Logic", icon: Zap, color: "teal" },
                                        { title: "Fast Feedback", icon: Rocket, color: "purple" },
                                        { title: "Immediate Output", icon: Cpu, color: "teal" },
                                        { title: "Creative Freedom", icon: Lightbulb, color: "purple" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className={`w-10 h-10 ${item.color === 'purple' ? 'bg-[#f4f0f2] text-[#875A7B]' : 'bg-teal-50 text-teal-600'} rounded-xl flex items-center justify-center`}>
                                                <item.icon size={20} />
                                            </div>
                                            <span className="font-semibold text-brand-dark">{item.title}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-6">
                                <div className="bg-[#f4f0f2] rounded-3xl p-10 aspect-[4/5] flex flex-col justify-between hover:shadow-xl transition-all">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <Code className="text-[#875A7B]" size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-brand-dark mb-2">Block Coding</h4>
                                        <p className="text-slate-600 font-light">Transforming complex logic into playable puzzles.</p>
                                    </div>
                                </div>
                                <div className="bg-teal-50 rounded-3xl p-10 aspect-[4/5] flex flex-col justify-between translate-y-12 hover:shadow-xl transition-all">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                                        <Bot className="text-teal-600" size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-brand-dark mb-2">Robotics</h4>
                                        <p className="text-slate-600 font-light">Bringing code to life in the physical world.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Digital Playroom Overview */}
                <section className="py-32 bg-slate-50 border-y border-slate-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div className="order-2 lg:order-1 relative">
                                <div className="rounded-[4rem] overflow-hidden shadow-2xl border-8 border-white">
                                    <img src="/digital_playroom_overview_experience_1770264120516.png" alt="Digital Playroom" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-8 -right-8 bg-white p-8 rounded-3xl shadow-xl max-w-xs border border-slate-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Users className="text-teal-600" />
                                        <span className="font-bold">Collab Space</span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-light">Designed for peering learning and team-based problem solving.</p>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2 space-y-8">
                                <h3 className="text-4xl font-bold text-brand-dark tracking-tight">The Environment of the <span className="text-teal-600">Future</span></h3>
                                <p className="text-xl text-slate-600 font-light italic italic leading-relaxed">
                                    "We've created a space where there is no fear of failure, only the thrill of discovery."
                                </p>
                                <div className="space-y-6">
                                    {[
                                        "Modular learning stations for individual and group work",
                                        "Interactive touch surfaces for real-time collaboration",
                                        "Augmented reality zones for immersive exploration",
                                        "Relaxed, pressure-free atmosphere designed for flow"
                                    ].map((feature, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center mt-1">
                                                <CheckCircle size={14} className="text-teal-600" />
                                            </div>
                                            <p className="text-slate-700">{feature}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Curriculum Tiers */}
                <section className="py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6 tracking-tight">Tiered Progression Models</h2>
                            <p className="text-xl text-slate-500 font-light">We grow with the learner, from their first logic block to advanced text-based coding.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { title: "Tier 1: Discovery", icon: Lightbulb, color: "blue", desc: "For Grades 1-3. Focuses on spatial awareness, basic sequencing, and visual logic." },
                                { title: "Tier 2: Builder", icon: Users, color: "purple", desc: "For Grades 4-6. Moving into complex variables, loops, and hardware interaction." },
                                { title: "Tier 3: Innovator", icon: Cpu, color: "teal", desc: "For Junior Sec. Advanced algorithms, Python basics, and real-world system design." }
                            ].map((tier, i) => (
                                <div key={i} className="bg-white rounded-3xl p-10 border border-slate-100 hover:shadow-2xl hover:border-[#875A7B]/30 transition-all group flex flex-col items-center text-center">
                                    <div className={`w-20 h-20 bg-${tier.color}-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                                        <tier.icon className={tier.color === 'purple' ? 'text-[#875A7B]' : tier.color === 'teal' ? 'text-teal-600' : 'text-blue-500'} size={40} />
                                    </div>
                                    <h4 className="text-2xl font-bold mb-4">{tier.title}</h4>
                                    <p className="text-slate-500 font-light leading-relaxed">{tier.desc}</p>
                                    <div className="mt-8 pt-6 border-t border-slate-50 w-full">
                                        <button className="text-[#875A7B] font-bold text-sm flex items-center justify-center gap-2 mx-auto">
                                            View Curriulum <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonial Section */}
                <section className="py-32 bg-gray-50 border-t border-slate-100">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col lg:flex-row gap-20 items-center">
                            <div className="flex-1">
                                <div className="relative">
                                    <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10">
                                        <img src="/student_coding_presentation_pride_1770264155580.png" alt="Student Presentation" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -top-10 -left-10 w-48 h-48 bg-[#875A7B]/10 rounded-full blur-3xl"></div>
                                </div>
                            </div>
                            <div className="flex-1 space-y-10">
                                <Quote size={60} className="text-[#875A7B]/20" />
                                <h3 className="text-4xl font-bold text-brand-dark leading-tight tracking-tight italic">
                                    "When I see my students in the playroom, I don't see them 'studying'—I see them solving. They've stopped asking 'is this for the exam?' and started asking 'what else can this do?'"
                                </h3>
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-[#875A7B] flex items-center justify-center text-white text-2xl font-bold">JT</div>
                                    <div>
                                        <p className="text-xl font-bold text-brand-dark">Jacob T.</p>
                                        <p className="text-slate-500 font-light italic">Lead Tech Mentor, Nairobi Academy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-32 bg-white">
                    <div className="max-w-5xl mx-auto px-6 text-center">
                        <h2 className="text-4xl md:text-6xl font-bold text-brand-dark mb-8 tracking-tight">
                            Experience the <span className="text-[#875A7B]">Playroom</span>.
                        </h2>
                        <p className="text-2xl text-slate-500 font-light mb-12">Visit us and see the future of education in action.</p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button onClick={props.onGetStartedClick} className="px-12 py-5 bg-[#875A7B] text-white font-bold rounded-2xl shadow-2xl hover:bg-[#714B67] transition-all hover:-translate-y-1">
                                Book a Sanctuary Tour
                            </button>
                            <button className="px-12 py-5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-teal-600 transition-all">
                                Partner with ElimCrown
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </WebsiteLayout>
    );
};

export default PlayroomPage;
