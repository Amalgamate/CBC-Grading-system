import React, { useState } from 'react';
import { WebsiteLayout } from '../WebsiteLayout.enterprise';
import {
    Mail,
    Phone,
    MapPin,
    Clock,
    MessageCircle,
    Zap,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';

const ContactPageEnterprise = (props) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        school: '',
        phone: '',
        subject: 'general',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate form submission
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setTimeout(() => {
            setFormData({ name: '', email: '', school: '', phone: '', subject: 'general', message: '' });
            setSubmitted(false);
        }, 3000);
    };

    return (
        <WebsiteLayout {...props}>
            {/* Hero */}
            <section className="pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                        Contact Us
                    </h1>
                    <p className="text-xl text-gray-600">
                        Have questions? We'd love to hear from you. Get in touch with our team.
                    </p>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-24 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                icon: Mail,
                                title: 'Email',
                                detail: 'hello@elimcrown.com',
                                desc: 'We respond within 24 hours'
                            },
                            {
                                icon: Phone,
                                title: 'Phone',
                                detail: '+254 (700) 123-456',
                                desc: 'Mon-Fri, 8am-6pm EAT'
                            },
                            {
                                icon: MapPin,
                                title: 'Headquarters',
                                detail: 'Nairobi, Kenya',
                                desc: 'serving all of East Africa'
                            },
                            {
                                icon: Clock,
                                title: 'Response Time',
                                detail: '< 2 hours',
                                desc: 'Average response time'
                            }
                        ].map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="p-6 border border-gray-200 rounded-xl hover:border-[#520050] hover:shadow-lg transition-all text-center">
                                    <Icon className="w-8 h-8 text-[#520050] mx-auto mb-4" />
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-lg font-bold text-gray-900 mb-1">
                                        {item.detail}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {item.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Main Contact Form */}
            <section className="py-24 bg-gray-50 border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {/* Form */}
                        <div className="md:col-span-2">
                            <div className="bg-white p-8 rounded-xl border border-gray-200">
                                {submitted ? (
                                    <div className="text-center space-y-4 py-12">
                                        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            Thank You!
                                        </h3>
                                        <p className="text-gray-600">
                                            We've received your message and will get back to you shortly.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                    Your Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#520050] focus:ring-1 focus:ring-[#520050]"
                                                    placeholder="John Mwangi"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#520050] focus:ring-1 focus:ring-[#520050]"
                                                    placeholder="john@school.ac.ke"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                    School Name
                                                </label>
                                                <input
                                                    type="text"
                                                    name="school"
                                                    value={formData.school}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#520050] focus:ring-1 focus:ring-[#520050]"
                                                    placeholder="Your Institution"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#520050] focus:ring-1 focus:ring-[#520050]"
                                                    placeholder="+254 700 000 000"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Subject
                                            </label>
                                            <select
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#520050] focus:ring-1 focus:ring-[#520050]"
                                            >
                                                <option value="general">General Inquiry</option>
                                                <option value="demo">Request a Demo</option>
                                                <option value="sales">Sales Question</option>
                                                <option value="support">Support Request</option>
                                                <option value="partnership">Partnership</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                required
                                                rows="5"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#520050] focus:ring-1 focus:ring-[#520050]"
                                                placeholder="Tell us how we can help..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full px-8 py-4 bg-[#520050] hover:bg-[#3D0038] text-white font-semibold rounded-lg transition-colors"
                                        >
                                            Send Message
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Support Options */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    Other Ways to Connect
                                </h3>
                                <div className="space-y-4">
                                    <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-[#520050] hover:bg-[#520050]/5 transition-all flex items-center gap-3">
                                        <MessageCircle className="w-5 h-5 text-[#520050]" />
                                        <div>
                                            <p className="font-medium text-gray-900">Live Chat</p>
                                            <p className="text-xs text-gray-600">Instant help</p>
                                        </div>
                                    </button>
                                    <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-[#520050] hover:bg-[#520050]/5 transition-all flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-[#520050]" />
                                        <div>
                                            <p className="font-medium text-gray-900">Email</p>
                                            <p className="text-xs text-gray-600">Within 24 hours</p>
                                        </div>
                                    </button>
                                    <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-[#520050] hover:bg-[#520050]/5 transition-all flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-[#520050]" />
                                        <div>
                                            <p className="font-medium text-gray-900">Call Us</p>
                                            <p className="text-xs text-gray-600">Mon-Fri 8am-6pm</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Quick Resources */}
                            <div className="bg-white p-6 rounded-xl border border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-4">
                                    Quick Resources
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        'Help Center',
                                        'Video Tutorials',
                                        'Documentation',
                                        'Status Page',
                                        'Privacy Policy',
                                        'Terms of Service'
                                    ].map((resource, i) => (
                                        <button
                                            key={i}
                                            className="w-full text-left px-3 py-2 text-gray-700 hover:text-[#520050] hover:bg-gray-50 rounded-lg transition-colors"
                                        >
                                            {resource}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Response Time Badge */}
                            <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-5 h-5 text-blue-600" />
                                    <p className="font-semibold text-blue-900">
                                        Priority Support
                                    </p>
                                </div>
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    Enterprise customers get priority support with guaranteed response times.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Office Locations */}
            <section className="py-24 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        Our Offices
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            {
                                city: 'Nairobi, Kenya',
                                address: 'Tech Hub Nairobi, Mombasa Road',
                                address2: 'Nairobi, Kenya 00100',
                                hours: 'Mon-Fri: 8:00 AM - 6:00 PM EAT',
                                phone: '+254 (700) 123-456'
                            },
                            {
                                city: 'Regional Support',
                                address: 'Kampala, Uganda & Dar es Salaam, Tanzania',
                                address2: 'Regional Support Centers',
                                hours: 'Mon-Fri: 8:00 AM - 6:00 PM Local',
                                phone: '+256 (700) 123-456'
                            }
                        ].map((office, i) => (
                            <div key={i} className="p-8 border border-gray-200 rounded-xl hover:border-[#520050] hover:shadow-lg transition-all">
                                <MapPin className="w-8 h-8 text-[#520050] mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {office.city}
                                </h3>
                                <div className="space-y-2 mb-4 text-gray-600">
                                    <p>{office.address}</p>
                                    <p>{office.address2}</p>
                                </div>
                                <div className="pt-4 border-t border-gray-200 space-y-2">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium text-gray-900">Hours:</span> {office.hours}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium text-gray-900">Phone:</span> {office.phone}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="py-24 bg-gray-50 border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-4">
                        {[
                            {
                                q: 'How quickly can we get started?',
                                a: 'Most schools go live within 2-3 weeks, including setup, data import, and staff training.'
                            },
                            {
                                q: 'What if we need custom configurations?',
                                a: 'Our team can customize workflows, reports, and integrations to match your institutional needs.'
                            },
                            {
                                q: 'How is learner data secured?',
                                a: 'We use enterprise-grade encryption, regular security audits, and maintain GDPR compliance.'
                            },
                            {
                                q: 'What support is included?',
                                a: 'All plans include email support. Professional and Enterprise plans include phone support and dedicated account managers.'
                            },
                            {
                                q: 'Can we integrate with existing systems?',
                                a: 'Yes. Our API supports integration with payment gateways, biometric systems, and other platforms.'
                            }
                        ].map((faq, i) => (
                            <details
                                key={i}
                                className="p-6 bg-white border border-gray-200 rounded-xl hover:border-[#520050] transition-colors"
                            >
                                <summary className="font-semibold text-gray-900 cursor-pointer flex items-center justify-between">
                                    {faq.q}
                                    <span className="text-[#520050]">+</span>
                                </summary>
                                <p className="mt-4 text-gray-600 leading-relaxed">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-24 bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <h2 className="text-4xl font-bold text-gray-900">
                        Stay Updated
                    </h2>
                    <p className="text-lg text-gray-600">
                        Get product updates and insights delivered to your inbox
                    </p>
                    <div className="flex gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="your@school.ac.ke"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#520050]"
                        />
                        <button className="px-6 py-3 bg-[#520050] hover:bg-[#3D0038] text-white font-semibold rounded-lg transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 bg-[#520050] text-white">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
                    <h2 className="text-4xl md:text-5xl font-bold">
                        Ready to Transform Your School?
                    </h2>
                    <p className="text-xl text-white/80">
                        Join hundreds of schools already using ElimCrown
                    </p>
                    <button
                        onClick={props.onGetStartedClick}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-[#520050] font-semibold rounded-lg transition-colors"
                    >
                        Schedule a Demo <ArrowRight size={20} />
                    </button>
                </div>
            </section>
        </WebsiteLayout>
    );
};

export default ContactPageEnterprise;
