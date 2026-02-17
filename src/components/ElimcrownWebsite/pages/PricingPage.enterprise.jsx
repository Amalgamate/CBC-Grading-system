import React, { useState } from 'react';
import { WebsiteLayout } from '../WebsiteLayout.enterprise';
import { PricingCard } from '../components/PricingCard';
import { FAQAccordion } from '../components/FAQAccordion';
import { EnterpriseCTASection } from '../components/EnterpriseCTASection';
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
                            <PricingCard
                                key={i}
                                name={plan.name}
                                description={plan.subtitle}
                                price={typeof plan.price === 'number' ? `KES ${plan.price.toLocaleString()}` : plan.price}
                                period={plan.period}
                                badge={plan.savingsLabel}
                                features={plan.features}
                                isPrimary={plan.highlighted}
                                highlighted={plan.highlighted}
                                onCTA={() => plan.highlighted ? props.onGetStartedClick() : props.onLoginClick()}
                                ctaText={plan.cta}
                            />
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
                    <FAQAccordion
                        title="Frequently Asked Questions"
                        faqs={[
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
                        ]}
                    />
                </div>
            </section>

            {/* CTA */}
            <EnterpriseCTASection
                title="Ready to get started?"
                description="Choose your plan and transform your school's assessment and operations management today."
                primaryText="Start Your Free Trial"
                secondaryText="Schedule Demo"
                onPrimary={props.onGetStartedClick}
                onSecondary={props.onLoginClick}
            />
        </WebsiteLayout>
    );
};

export default PricingPageEnterprise;
