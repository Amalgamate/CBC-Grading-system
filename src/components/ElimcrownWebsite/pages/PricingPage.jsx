import React from 'react';
import { WebsiteLayout } from '../WebsiteLayout';
import { Check } from 'lucide-react';

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
                        <div className="bg-white p-8 rounded shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Starter</h3>
                            <p className="text-sm text-slate-500 mb-6">For small schools just getting started.</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[#1a1a1a]">KES 4,999</span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <button className="w-full py-3 bg-[#f0f4f7] text-[#1a1a1a] font-bold rounded hover:bg-slate-200 transition mb-6 border border-transparent">Start Trial</button>
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-[#017E84]" /> Up to 100 Learners</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-[#017E84]" /> Basic CBC Grading</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-[#017E84]" /> Standard Reports</li>
                            </ul>
                        </div>

                        {/* Growth - Highlighted */}
                        <div className="bg-white p-8 rounded shadow-lg border border-[#714B67] relative transform md:-translate-y-4">
                            <div className="absolute top-0 inset-x-0 h-1 bg-[#714B67]"></div>
                            <div className="absolute top-4 right-4 text-[#714B67] text-xs font-bold px-3 py-1 bg-purple-50 rounded uppercase">Most Popular</div>
                            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Growth</h3>
                            <p className="text-sm text-slate-500 mb-6">For rapidly expanding institutions.</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[#714B67]">KES 9,999</span>
                                <span className="text-slate-500">/mo</span>
                            </div>
                            <button className="w-full py-3 bg-[#714B67] text-white font-bold rounded hover:bg-[#5d3d54] transition mb-6 shadow-sm">Get Started</button>
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-[#017E84]" /> Up to 500 Learners</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-[#017E84]" /> Advanced Analytics</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-[#017E84]" /> Finance Module</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-[#017E84]" /> SMS Integration</li>
                            </ul>
                        </div>

                        {/* Enterprise */}
                        <div className="bg-white p-8 rounded shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Enterprise</h3>
                            <p className="text-sm text-slate-500 mb-6">For large multi-campus schools.</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold text-[#1a1a1a]">Custom</span>
                            </div>
                            <button className="w-full py-3 bg-white border border-gray-300 text-[#1a1a1a] font-bold rounded hover:bg-slate-50 transition mb-6">Contact Sales</button>
                            <ul className="space-y-3 text-sm">
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-[#017E84]" /> Unlimited Learners</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-[#017E84]" /> Custom Report Cards</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-[#017E84]" /> Dedicated Account Manager</li>
                                <li className="flex gap-3 text-slate-600"><Check size={18} className="text-[#017E84]" /> SLA & Priority Support</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-16 bg-[#f9fafb] p-8 rounded border border-gray-200">
                        <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Need a custom plan?</h3>
                        <p className="text-slate-500">Contact us for tailored solutions for counties and large education networks.</p>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default PricingPage;
