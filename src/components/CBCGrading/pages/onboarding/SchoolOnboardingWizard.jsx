import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    Settings,
    Users,
    BookOpen,
    ArrowRight,
    ArrowLeft,
    School,
    Sparkles,
    Calendar,
    ShieldCheck
} from 'lucide-react';

const SchoolOnboardingWizard = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const totalSteps = 4;

    const steps = [
        {
            id: 1,
            title: "Welcome to Elimcrown",
            subtitle: "Let's get your school system ready in minutes.",
            icon: <Sparkles className="w-8 h-8 text-indigo-500" />
        },
        {
            id: 2,
            title: "Academic Setup",
            subtitle: "Configure terms and grading systems.",
            icon: <Calendar className="w-8 h-8 text-indigo-500" />
        },
        {
            id: 3,
            title: "Staff & Management",
            subtitle: "Invite your first teachers and staff.",
            icon: <Users className="w-8 h-8 text-indigo-500" />
        },
        {
            id: 4,
            title: "Final Review",
            subtitle: "Double check your details before launching.",
            icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />
        }
    ];

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
        else onComplete && onComplete();
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-indigo-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <School className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold mb-2">School Onboarding</h1>
                        <p className="text-indigo-100 flex items-center">
                            Step {step} of {totalSteps}: {steps[step - 1].title}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-indigo-900/30">
                        <div
                            className="h-full bg-white transition-all duration-500 ease-out"
                            style={{ width: `${(step / totalSteps) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 min-h-[400px] flex flex-col">
                    <div className="flex-grow">
                        {step === 1 && (
                            <div className="flex flex-col items-center text-center space-y-6 pt-4">
                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center">
                                    {steps[0].icon}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{steps[0].title}</h2>
                                    <p className="text-gray-600 max-w-md mx-auto">{steps[0].subtitle}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
                                    <FeatureCard icon={<ShieldCheck />} title="Safe & Secure" desc="Tenant isolation for every school." />
                                    <FeatureCard icon={<BookOpen />} title="CBC Ready" desc="Built-in Kenya CBC competency tracking." />
                                    <FeatureCard icon={<Settings />} title="Fully Configurable" desc="Your rules, your grades, your way." />
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-indigo-50 rounded-lg">{steps[1].icon}</div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800">{steps[1].title}</h2>
                                        <p className="text-gray-600 text-sm">{steps[1].subtitle}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <p className="text-gray-700 mb-4">You can set up your academic calendar now or later in settings.</p>
                                    <div className="space-y-4">
                                        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-indigo-100">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                            <span className="text-gray-800">Standard 3-Term Configuration</span>
                                        </div>
                                        <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-indigo-100">
                                            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                                            <span className="text-gray-800">8-Level CBC Grading Scale</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6 text-center pt-8">
                                <Users className="w-16 h-16 text-indigo-500 mx-auto" />
                                <h2 className="text-2xl font-bold text-gray-800">Invite Your Staff</h2>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Add your teachers to start assigning them to classes and tracking assessments.
                                </p>
                                <button className="px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full font-medium hover:bg-indigo-100 transition-colors">
                                    Add Staff Member +
                                </button>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="flex flex-col items-center text-center space-y-6 pt-4">
                                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                                    <CheckCircle className="w-12 h-12" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">You're All Set!</h2>
                                    <p className="text-gray-600 max-w-md mx-auto">
                                        Congratulations, <strong>Elimcrown</strong> is now ready for your school. Click finish to go to your dashboard.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex items-center justify-between border-t pt-6">
                        <button
                            onClick={prevStep}
                            className={`flex items-center text-gray-500 hover:text-gray-800 font-medium transition-colors ${step === 1 ? 'invisible' : ''}`}
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </button>
                        <button
                            onClick={nextStep}
                            disabled={loading}
                            className="flex items-center px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
                        >
                            {step === totalSteps ? 'Finish' : 'Next'} <ArrowRight className="w-4 h-4 ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-left">
        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500 mb-3">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <h3 className="font-bold text-gray-800 text-sm mb-1">{title}</h3>
        <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
    </div>
);

export default SchoolOnboardingWizard;
