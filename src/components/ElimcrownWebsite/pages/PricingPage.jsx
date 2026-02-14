import React from 'react';
import { WebsiteLayout } from '../WebsiteLayout';
import { Check, Box, Folder } from 'lucide-react';

const PricingPage = (props) => {
    return (
        <WebsiteLayout {...props}>
            <section className="bg-white pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <span className="text-[#017E84] font-bold tracking-wider uppercase text-sm mb-4 block">Best Value</span>
                    <h1 className="text-4xl md:text-6xl font-bold text-[#1a1a1a] mb-6">Unbeatable Pricing</h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-16 font-light">
                        One price, all apps. No hidden fees.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        {/* Starter */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Starter</h3>
                            <p className="text-sm text-slate-500 mb-6">Essential tools for small schools.</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[#1a1a1a]">KES 5,000</span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <button className="w-full py-4 bg-[#f8fafc] text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition mb-6 border border-slate-200">Start Free Trial</button>
                            <ul className="space-y-4 text-sm">
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-teal-600" /> Up to 150 Learners</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-teal-600" /> Direct CBC Grading</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-teal-600" /> Standard Parent App</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-teal-600" /> Basic Email Reports</li>
                            </ul>
                        </div>

                        {/* Growth - Highlighted */}
                        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-[#875A7B] relative transform md:-translate-y-4">
                            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#875A7B] rounded-t-2xl"></div>
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-black px-4 py-1.5 bg-[#875A7B] rounded-full uppercase tracking-tighter ring-4 ring-white">Most Popular</div>
                            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Growth</h3>
                            <p className="text-sm text-slate-500 mb-6">Complete management for growing institutions.</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[#875A7B]">KES 12,500</span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <button className="w-full py-4 bg-[#875A7B] text-white font-bold rounded-xl hover:bg-[#714B67] transition mb-6 shadow-lg shadow-[#875A7B]/20">Get Growth Plus</button>
                            <ul className="space-y-4 text-sm">
                                <li className="flex gap-3 text-slate-600 font-medium"><Check size={18} className="text-teal-600" /> Up to 500 Learners</li>
                                <li className="flex gap-3 text-slate-600 font-medium"><Check size={18} className="text-teal-600" /> Biometric Integration Ready</li>
                                <li className="flex gap-3 text-slate-600 font-medium"><Check size={18} className="text-teal-600" /> Full Finance & Fee Manager</li>
                                <li className="flex gap-3 text-slate-600 font-medium"><Check size={18} className="text-teal-600" /> Automated Evidence Capture</li>
                                <li className="flex gap-3 text-slate-600 font-medium"><Check size={18} className="text-teal-600" /> SMS & WhatsApp Alerts</li>
                            </ul>
                        </div>

                        {/* Enterprise */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Excellence</h3>
                            <p className="text-sm text-slate-500 mb-6">Advanced tech for premier academies.</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[#1a1a1a]">Custom</span>
                            </div>
                            <button className="w-full py-4 bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] font-bold rounded-xl hover:bg-slate-50 transition mb-6">Talk to Experts</button>
                            <ul className="space-y-4 text-sm">
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-teal-600" /> Unlimited Learners</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-teal-600" /> Full Biometric Hardware Suite</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-teal-600" /> The Playroom (Robotics & AI)</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-teal-600" /> Multi-Campus Central Control</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-teal-600" /> White-label Parent Portal</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-[#f9fafb] p-8 rounded-2xl border border-gray-200 text-left">
                            <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                                <span className="p-2 bg-brand-teal/10 rounded-lg text-brand-teal">
                                    <Box size={24} />
                                </span>
                                Mobile App Add-ons
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-slate-600 font-medium text-sm">Android App Deployment</span>
                                    <span className="text-[#1a1a1a] font-bold">KES 50,000</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-slate-600 font-medium text-sm">iOS App Deployment</span>
                                    <span className="text-[#1a1a1a] font-bold">KES 50,000</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 italic">* One-time setup fee for white-label app publishing.</p>
                            </div>
                        </div>

                        <div className="bg-[#f9fafb] p-8 rounded-2xl border border-gray-200 text-left">
                            <h3 className="text-xl font-bold text-[#1a1a1a] mb-4 flex items-center gap-2">
                                <span className="p-2 bg-[#875A7B]/10 rounded-lg text-[#875A7B]">
                                    <Folder size={24} />
                                </span>
                                Storage & Media
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-slate-600 font-medium text-sm">Standard (10GB)</span>
                                    <span className="text-[#1a1a1a] font-bold">Included</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-slate-600 font-medium text-sm">Enhanced (100GB + Video)</span>
                                    <span className="text-[#1a1a1a] font-bold">KES 2,500/mo</span>
                                </div>
                                <p className="text-xs text-slate-400 mt-2 italic">* Ideal for schools hosting extensive tutorial videos and learning materials.</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 bg-white p-8 rounded shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Need a custom plan?</h3>
                        <p className="text-slate-500">Contact us for tailored solutions for counties and large education networks.</p>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default PricingPage;
