import React from 'react';
import { WebsiteLayout } from '../WebsiteLayout';
import { Mail, MapPin, Phone } from 'lucide-react';

const ContactPage = (props) => {
    return (
        <WebsiteLayout {...props}>
            <section className="bg-white py-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div>
                            <span className="text-[#017E84] font-bold tracking-wider uppercase text-sm mb-4 block">Get in Touch</span>
                            <h1 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6">Let's talk about your school's future</h1>
                            <p className="text-xl text-slate-500 mb-12 font-light">
                                Whether you have a question about features, trials, pricing, or need a demo, our team is ready to answer all your questions.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-[#f0f4f7] rounded flex items-center justify-center text-[#714B67] shrink-0">
                                        <Mail />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1a1a1a]">Chat with us</h3>
                                        <p className="text-slate-500 mb-1">Our friendly team is here to help.</p>
                                        <a href="mailto:support@elimcrown.local" className="text-[#017E84] font-semibold hover:underline">support@elimcrown.local</a>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-[#f0f4f7] rounded flex items-center justify-center text-[#714B67] shrink-0">
                                        <MapPin />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1a1a1a]">Visit us</h3>
                                        <p className="text-slate-500 mb-1">Come say hello at our office HQ.</p>
                                        <p className="text-[#1a1a1a] font-medium">100 Moi Avenue, Nairobi, Kenya</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-[#f0f4f7] rounded flex items-center justify-center text-[#714B67] shrink-0">
                                        <Phone />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#1a1a1a]">Call us</h3>
                                        <p className="text-slate-500 mb-1">Mon-Fri from 8am to 5pm.</p>
                                        <p className="text-[#1a1a1a] font-medium">+254 700 000 000</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#f9fafb] p-8 rounded border border-gray-200 shadow-sm">
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">First name</label>
                                        <input className="w-full px-4 py-3 rounded border border-gray-300 focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] outline-none transition" placeholder="John" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Last name</label>
                                        <input className="w-full px-4 py-3 rounded border border-gray-300 focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] outline-none transition" placeholder="Doe" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Email</label>
                                    <input className="w-full px-4 py-3 rounded border border-gray-300 focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] outline-none transition" type="email" placeholder="john@school.org" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Message</label>
                                    <textarea className="w-full px-4 py-3 rounded border border-gray-300 focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] outline-none h-32 resize-none transition" placeholder="Tell us about your school needs..." />
                                </div>
                                <button className="w-full py-3 bg-[#714B67] text-white font-bold rounded hover:bg-[#5d3d54] transition shadow-sm">Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default ContactPage;
