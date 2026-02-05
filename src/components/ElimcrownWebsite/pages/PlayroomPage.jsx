
import React from 'react';
import { WebsiteLayout } from '../WebsiteLayout';
import { Play, Cpu, Code, Lightbulb, Users, ArrowRight, CheckCircle, Quote } from 'lucide-react';

const PlayroomPage = (props) => {
    return (
        <WebsiteLayout {...props}>
            <div className="bg-white">
                {/* Hero Section */}
                <section className="relative pt-20 pb-32 overflow-hidden">
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f4f0f2] -skew-x-12 translate-x-32 hidden lg:block"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8">
                                <span className="inline-block px-4 py-1.5 bg-[#875A7B] text-white text-xs font-bold rounded-full tracking-widest uppercase">The Future of CBC Learning</span>
                                <h1 className="text-5xl md:text-7xl font-black text-brand-dark leading-[1.1] tracking-tighter">
                                    Where <span className="text-[#875A7B]">Play</span> Meets <span className="text-teal-600">Innovation</span>.
                                </h1>
                                <p className="text-xl text-slate-600 leading-relaxed max-w-xl font-light">
                                    The ElimCrown Playroom isn't just a space—it's a technology-driven sanctuary where children build, code, and solve real-world problems using the latest in Robotics and AI.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <button className="bg-[#875A7B] hover:bg-[#714B67] text-white px-8 py-4 rounded-xl font-bold shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2">
                                        Plan a Visit <ArrowRight size={20} />
                                    </button>
                                    <button className="bg-white border-2 border-slate-200 hover:border-[#875A7B] text-slate-700 px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2">
                                        Watch Explainer <Play size={20} className="text-[#875A7B]" />
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-square bg-white rounded-3xl shadow-2xl p-4 rotate-3 relative z-10 border border-slate-100 overflow-hidden">
                                    <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800" alt="Children in Robotics Lab" className="w-full h-full object-cover rounded-2xl" />
                                    <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/60 to-transparent">
                                        <p className="text-white font-bold italic text-lg">"Learning coding at age 6 felt like magic."</p>
                                        <span className="text-white/80 text-sm">— Grade 2 Learner</span>
                                    </div>
                                </div>
                                <div className="absolute -top-10 -right-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
                                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Video / Explainer Placeholder */}
                <section className="py-24 bg-brand-dark">
                    <div className="max-w-5xl mx-auto px-6 text-center">
                        <h2 className="text-3xl font-bold text-white mb-12 italic tracking-tight">"We are using blocks as the bridge to logical thinking."</h2>
                        <div className="aspect-video bg-slate-800 rounded-3xl overflow-hidden relative group cursor-pointer shadow-2xl border border-white/10">
                            <img src="https://images.unsplash.com/photo-1596495573448-1855a9ec4621?auto=format&fit=crop&q=80&w=1200" alt="Video Placeholder" className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 bg-[#875A7B] rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                                    <Play size={40} fill="currentColor" />
                                </div>
                            </div>
                            <div className="absolute bottom-8 right-8 left-8 text-left bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-sm font-medium">Inside look: Grade 4 students building their first sensor-equipped robot.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* The Block Method */}
                <section className="py-32">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row gap-16 items-center">
                            <div className="flex-1 space-y-6">
                                <h3 className="text-4xl font-bold text-brand-dark tracking-tight">The <span className="text-[#875A7B]">Block</span> Logic Framework</h3>
                                <p className="text-lg text-slate-600 leading-relaxed font-light">
                                    We use visual block-based programming (like Scratch and Blockly) as the foundational step. It eliminates the frustration of syntax and focuses entirely on <strong>Problem Recognition, Sequencing, and Logic.</strong>
                                </p>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        "Visual Syntax",
                                        "Constraint-based Logic",
                                        "Immediate Feedback",
                                        "Hardware Integration",
                                        "Collaborative Coding",
                                        "Creative Freedom"
                                    ].map((item, i) => (
                                        <li key={i} className="flex gap-2 items-center text-slate-700 font-semibold">
                                            <CheckCircle size={18} className="text-teal-600 flex-shrink-0" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div className="bg-[#f4f0f2] rounded-3xl p-8 aspect-[4/5] flex flex-col justify-between">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <Code className="text-[#875A7B]" />
                                    </div>
                                    <p className="font-bold text-brand-dark">Scratch-based Animation</p>
                                </div>
                                <div className="bg-teal-50 rounded-3xl p-8 aspect-[4/5] flex flex-col justify-between translate-y-8">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                        <Cpu className="text-teal-600" />
                                    </div>
                                    <p className="font-bold text-brand-dark">Arduino Hardware Links</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Curriculum Tiers */}
                <section className="py-32 bg-slate-50 border-y border-slate-200">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6 tracking-tight">Structured Path to Digital Mastery</h2>
                            <p className="text-xl text-slate-500 font-light italic">"From moving a block to building a brain."</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Tier 1 */}
                            <div className="bg-white rounded-3xl p-10 border border-slate-200 hover:border-[#875A7B] transition-all group">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Lightbulb className="text-blue-500" size={32} />
                                </div>
                                <h4 className="text-2xl font-bold mb-4">Discovery (Grades 1-3)</h4>
                                <ul className="space-y-4 mb-8">
                                    <li className="text-slate-600 text-sm">✓ Visual programming basics</li>
                                    <li className="text-slate-600 text-sm">✓ Digital citizenship & safety</li>
                                    <li className="text-slate-600 text-sm">✓ Intro to simple circuits</li>
                                    <li className="text-slate-600 text-sm">✓ Critical thinking patterns</li>
                                </ul>
                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-400 uppercase">Stage 01</span>
                                    <span className="text-xs font-bold text-blue-600">Foundation</span>
                                </div>
                            </div>

                            {/* Tier 2 */}
                            <div className="bg-white rounded-3xl p-10 border border-[#875A7B] relative group">
                                <div className="absolute top-0 right-10 -translate-y-1/2 bg-[#875A7B] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase">Most Active</div>
                                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Users className="text-[#875A7B]" size={32} />
                                </div>
                                <h4 className="text-2xl font-bold mb-4">Makers (Grades 4-6)</h4>
                                <ul className="space-y-4 mb-8">
                                    <li className="text-slate-600 text-sm">✓ Game development with Scratch</li>
                                    <li className="text-slate-600 text-sm">✓ Robotics & Automated systems</li>
                                    <li className="text-slate-600 text-sm">✓ Environmental coding projects</li>
                                    <li className="text-slate-600 text-sm">✓ Design thinking workshops</li>
                                </ul>
                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-400 uppercase">Stage 02</span>
                                    <span className="text-xs font-bold text-[#875A7B]">Applied Skills</span>
                                </div>
                            </div>

                            {/* Tier 3 */}
                            <div className="bg-white rounded-3xl p-10 border border-slate-200 hover:border-teal-600 transition-all group">
                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    <Cpu className="text-teal-600" size={32} />
                                </div>
                                <h4 className="text-2xl font-bold mb-4">Innovators (Junior Sec)</h4>
                                <ul className="space-y-4 mb-8">
                                    <li className="text-slate-600 text-sm">✓ Python & Text-based coding</li>
                                    <li className="text-slate-600 text-sm">✓ AI & Machine Learning basics</li>
                                    <li className="text-slate-600 text-sm">✓ Advanced IoT development</li>
                                    <li className="text-slate-600 text-sm">✓ Entrepreneurship in Tech</li>
                                </ul>
                                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-400 uppercase">Stage 03</span>
                                    <span className="text-xs font-bold text-teal-600">Advanced Tech</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonial Section */}
                <section className="py-32">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <Quote size={48} className="text-[#875A7B] mx-auto mb-8 opacity-20" />
                        <p className="text-3xl md:text-4xl font-bold text-brand-dark italic leading-tight mb-12">
                            "The playroom has transformed how our students perceive challenges. They don't see errors anymore; they see bugs they can fix. This shift in mindset is the true power of ElimCrown."
                        </p>
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-slate-200 mb-4 overflow-hidden shadow-lg">
                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200" alt="Headteacher" />
                            </div>
                            <h5 className="text-xl font-bold text-brand-dark">Jane Doe</h5>
                            <p className="text-slate-500">Head of Technology, ElimCrown International School</p>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-24 bg-teal-600 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center text-white">
                        <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight italic">Ready to set up your school's Playroom?</h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            <button className="bg-white text-teal-700 px-10 py-4 rounded-xl font-bold shadow-2xl hover:bg-slate-50 transition-all hover:-translate-y-1">
                                Download Catalog
                            </button>
                            <button className="bg-brand-dark text-white px-10 py-4 rounded-xl font-bold shadow-2xl hover:bg-slate-900 transition-all hover:-translate-y-1">
                                Book a Demo Room
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </WebsiteLayout>
    );
};

export default PlayroomPage;
