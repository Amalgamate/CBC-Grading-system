import React, { useState } from 'react';
import { WebsiteLayout } from '../WebsiteLayout.enterprise';
import { Check, X, ArrowRight, HelpCircle } from 'lucide-react';

const PricingPageEnterprise = (props) => {
    const [billingCycle, setBillingCycle] = useState('annual');

    const plans = [
        {
            name: 'Starter',
            subtitle: 'For small schools',
            price: billingCycle === 'annual' ? 4200 : 500,
            period: billingCycle === 'annual' ? '/year' : '/month',
            description: 'Essential tools for schools just beginning their digital transformation',
            cta: 'Start Free Trial',
            highlighted: false,
            features: [
                { name: 'Up to 150 learners', included: true },
                { name: 'CBC assessment module', included: true },
                { name: 'Basic reporting', included: true },
                { name: 'Email support', included: true },
                { name: 'Standard SLA', included: true },
                { name: 'Advanced analytics', included: false },
                { name: 'Biometric integration', included: false },
                { name: 'Priority support', included: false },
            ]
        },
        {
            name: 'Professional',
            subtitle: 'For established schools',
            price: billingCycle === 'annual' ? 12600 : 1500,
            period: billingCycle === 'annual' ? '/year' : '/month',
            description: 'Complete solution for mid-sized institutions with full feature access',
            cta: 'Get Started',
            highlighted: true,
            savingsLabel: 'Most Popular',
            features: [
                { name: 'Up to 500 learners', included: true },
                { name: 'Full assessment suite', included: true },
                { name: 'Advanced analytics dashboard', included: true },
                { name: 'Finance & HR modules', included: true },
                { name: 'Biometric system integration', included: true },
                { name: 'Priority email & phone support', included: true },
                { name: 'Custom SLA', included: true },
                { name: 'API access', included: true },
            ]
        },
        {
            name: 'Enterprise',
            subtitle: 'For large organizations',
            price: 'Custom',
            description: 'White-label solution with dedicated support and custom features',
            cta: 'Schedule Call',
            highlighted: false,
            features: [
                { name: 'Unlimited learners', included: true },
                { name: 'All Professional features', included: true },
                { name: 'White-label platform', included: true },
                { name: 'Multi-school management', included: true },
                { name: 'Single sign-on (SSO)', included: true },
                { name: 'Dedicated account manager', included: true },
                { name: 'Custom integrations', included: true },
                { name: '24/7 phone support', included: true },
            ]
        }
    ];

    return (
        <WebsiteLayout {...props}>
            {/* Hero */}
            <section className="pt-20 pb-16 bg-gradient-to-br from-gray-50 to-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-600">
                        Choose the plan that fits your institution. All plans include a 14-day free trial.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex justify-center pt-4">
                        <div className="inline-flex items-center bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-md font-medium transition-all ${
                                    billingCycle === 'monthly'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`px-6 py-2 rounded-md font-medium transition-all relative ${
                                    billingCycle === 'annual'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Annual
                                {billingCycle === 'annual' && (
                                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                        Save 30%
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {plans.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative rounded-2xl border-2 transition-all ${
                                    plan.highlighted
                                        ? 'border-[#520050] bg-gradient-to-br from-[#520050]/5 to-white shadow-2xl ring-2 ring-[#520050]/20 md:-translate-y-4'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                {/* Badge */}
                                {plan.savingsLabel && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#520050] text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        {plan.savingsLabel}
                                    </div>
                                )}

                                <div className="p-8 space-y-6">
                                    {/* Plan Header */}
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {plan.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {plan.subtitle}
                                        </p>
                                    </div>

                                    {/* Price */}
                                    <div className="space-y-2">
                                        {typeof plan.price === 'number' ? (
                                            <>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-4xl font-bold text-gray-900">
                                                        KES {plan.price.toLocaleString()}
                                                    </span>
                                                    <span className="text-gray-600 font-medium">
                                                        {plan.period}
                                                    </span>
                                                </div>
                                                {billingCycle === 'annual' && (
                                                    <p className="text-sm text-gray-600">
                                                        {(plan.price / 12).toLocaleString()} per month
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <div className="text-3xl font-bold text-gray-900">
                                                {plan.price}
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600">
                                        {plan.description}
                                    </p>

                                    {/* CTA Button */}
                                    <button
                                        onClick={plan.highlighted ? props.onGetStartedClick : props.onLoginClick}
                                        className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                                            plan.highlighted
                                                ? 'bg-[#520050] hover:bg-[#3D0038] text-white'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                                        }`}
                                    >
                                        {plan.cta}
                                        <ArrowRight size={18} />
                                    </button>

                                    {/* Divider */}
                                    <div className="border-t border-gray-200"></div>

                                    {/* Features List */}
                                    <div className="space-y-4">
                                        {plan.features.map((feature, j) => (
                                            <div key={j} className="flex gap-3 items-start">
                                                {feature.included ? (
                                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                                                )}
                                                <span
                                                    className={`text-sm ${
                                                        feature.included
                                                            ? 'text-gray-900'
                                                            : 'text-gray-400'
                                                    }`}
                                                >
                                                    {feature.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Add-ons */}
            <section className="py-24 bg-gray-50 border-y border-gray-200">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center space-y-6 mb-16">
                        <h2 className="text-4xl font-bold text-gray-900">
                            Optional Add-ons
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Enhance your plan with specialized modules
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { name: 'Biometric Integration', price: 'KES 5,000', period: '/month' },
                            { name: 'White-Label Customization', price: 'KES 25,000', period: '/one-time' },
                            { name: 'API Access', price: 'KES 3,000', period: '/month' },
                            { name: 'Single Sign-On (SSO)', price: 'KES 8,000', period: '/month' },
                            { name: 'Custom Reporting', price: 'KES 10,000', period: '/month' },
                            { name: 'Dedicated Support', price: 'KES 15,000', period: '/month' },
                        ].map((addon, i) => (
                            <div key={i} className="p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all">
                                <h3 className="font-semibold text-gray-900 mb-2">
                                    {addon.name}
                                </h3>
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-2xl font-bold text-[#520050]">
                                        {addon.price}
                                    </span>
                                    <span className="text-gray-600 text-sm">
                                        {addon.period}
                                    </span>
                                </div>
                                <button className="text-sm font-medium text-[#520050] hover:text-[#3D0038] flex items-center gap-2">
                                    Add to Plan <ArrowRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center space-y-6 mb-16">
                        <h2 className="text-4xl font-bold text-gray-900">
                            Frequently Asked Questions
                        </h2>
                    </div>

                    <div className="space-y-6">
                        {[
                            {
                                q: 'Can I change my plan after signing up?',
                                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.'
                            },
                            {
                                q: 'What payment methods do you accept?',
                                a: 'We accept all major credit cards, bank transfers, and MPESA for Kenyan institutions.'
                            },
                            {
                                q: 'Is there a discount for annual billing?',
                                a: 'Yes, annual plans include 30% savings compared to monthly billing.'
                            },
                            {
                                q: 'What happens to my data after trial ends?',
                                a: 'After your free trial, your data remains secure. You can continue access by purchasing a plan.'
                            },
                            {
                                q: 'Do you offer custom enterprise pricing?',
                                a: 'Yes, we offer custom Enterprise plans for large organizations with specific requirements. Contact us for a quote.'
                            }
                        ].map((faq, i) => (
                            <details
                                key={i}
                                className="group border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors cursor-pointer"
                            >
                                <summary className="flex items-center justify-between font-semibold text-gray-900 group-open:text-[#520050]">
                                    {faq.q}
                                    <ChevronDown className="w-5 h-5 group-open:rotate-180 transition-transform" />
                                </summary>
                                <p className="mt-4 text-gray-600 leading-relaxed">
                                    {faq.a}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-gradient-to-r from-[#520050] to-[#3D0038] text-white">
                <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Ready to get started?
                    </h2>
                    <p className="text-lg text-white/80">
                        Choose your plan and transform your school's assessment and operations management today.
                    </p>
                    <button
                        onClick={props.onGetStartedClick}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-100 text-[#520050] font-semibold rounded-lg transition-colors"
                    >
                        Start Your Free Trial <ArrowRight size={20} />
                    </button>
                </div>
            </section>
        </WebsiteLayout>
    );
};

// Import ChevronDown for the FAQ section
import { ChevronDown } from 'lucide-react';

export default PricingPageEnterprise;
