import React from 'react';
import { WebsiteLayout } from '../WebsiteLayout';
import { Heart, Shield, Globe, Zap } from 'lucide-react';

const AboutPage = (props) => {
    return (
        <WebsiteLayout {...props}>
            <section className="bg-white pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <span className="text-[#017E84] font-bold tracking-wider uppercase text-sm mb-4 block">Our Mission</span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#1a1a1a]">Simplify. Empower. Grow.</h1>
                    <p className="text-xl text-slate-500 max-w-3xl mx-auto font-light">
                        To simplify the complexity of education management, allowing educators to focus on what matters most: the learner.
                    </p>
                </div>
            </section>

            <section className="py-16 bg-[#f9fafb]">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white p-10 rounded shadow-sm border border-gray-100 mb-16">
                        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">The Elimcrown Story</h2>
                        <div className="prose prose-lg text-slate-600">
                            <p className="mb-4">
                                Elimcrown began with a simple observation: schools in Kenya were drowning in paperwork. The transition to the Competency Based Curriculum (CBC) introduced new layers of complexity that legacy systems simply couldn't handle.
                            </p>
                            <p className="mb-4">
                                We built Elimcrown from the ground up to be the first "CBC-Native" operating system. Unlike other platforms that tried to shoehorn new requirements into old paradigms, we designed our data models around the learner's journey.
                            </p>
                            <p>
                                Today, we serve hundreds of institutions, processing thousands of assessments daily. But our core belief remains unchanged: <strong>Technology should be an enabler, not a burden.</strong>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { icon: Heart, title: "Simplicity First", desc: "If it requires a manual to use, we redesign it.", color: "text-red-500" },
                            { icon: Shield, title: "Data Integrity", desc: "We treat school records with the same security as banking data.", color: "text-[#714B67]" },
                            { icon: Globe, title: "Local Context", desc: "Built for Kenya, complying with KICD and MOE guidelines.", color: "text-[#017E84]" },
                            { icon: Zap, title: "Constant Innovation", desc: "We ship updates weekly, not yearly.", color: "text-orange-500" }
                        ].map((value, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                                <div className={`${value.color} mt-1`}>
                                    <value.icon size={32} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#1a1a1a] mb-2">{value.title}</h4>
                                    <p className="text-sm text-slate-500">{value.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default AboutPage;
