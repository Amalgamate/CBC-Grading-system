import React from 'react';
import { CheckCircle, Users, BarChart3, Calendar, ArrowRight } from 'lucide-react';

export default function WelcomeScreen({ user, onGetStarted, brandingSettings }) {
  const features = [
    {
      icon: Users,
      title: 'Learner Management',
      description: 'Manage student profiles, admissions, and transfers seamlessly'
    },
    {
      icon: Calendar,
      title: 'Attendance Tracking',
      description: 'Mark and monitor student attendance with real-time reports'
    },
    {
      icon: BarChart3,
      title: 'CBC Assessments',
      description: 'Grade formative and summative assessments according to CBC standards'
    }
  ];

  return (
    <div 
      className="w-full h-screen overflow-hidden relative flex items-center justify-center"
      style={{ backgroundColor: brandingSettings?.brandColor || '#1e3a8a' }}
    >
      {/* Decorative Circle Elements - Full Background */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        {/* Large circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white rounded-full -translate-y-1/2"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white rounded-full"></div>
        
        {/* Medium circles */}
        <div className="absolute top-1/4 right-1/3 w-48 h-48 bg-white rounded-full"></div>
        <div className="absolute bottom-1/3 left-1/3 w-56 h-56 bg-white rounded-full"></div>
        
        {/* Small circles */}
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute top-1/3 left-1/2 w-40 h-40 bg-white rounded-full"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src={brandingSettings?.logoUrl || '/logo-zawadi.png'} 
              alt="School Logo" 
              className="w-32 h-32 object-contain mx-auto drop-shadow-2xl"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo-zawadi.png';
              }}
            />
          </div>

          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-2xl animate-bounce">
            <CheckCircle className="text-green-500" size={48} />
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Welcome Aboard! 🎉
          </h1>
          <p className="text-2xl text-blue-100">
            Hi <span className="font-bold text-white">{user?.name || 'there'}</span>, your account has been successfully created
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">You're All Set!</h2>
            <p className="text-lg text-gray-600">
              Here's what you can do with our CBC Grading System
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-xl mb-4 group-hover:bg-blue-600 transition">
                  <feature.icon className="text-blue-600 group-hover:text-white transition" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Quick Start Guide */}
          <div 
            className="rounded-2xl p-8 mb-10"
            style={{ backgroundColor: `${brandingSettings?.brandColor || '#1e3a8a'}15` }}
          >
            <div className="flex items-start gap-6">
              <div 
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: brandingSettings?.brandColor || '#1e3a8a' }}
              >
                <span className="text-white text-2xl">💡</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Start Guide</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: brandingSettings?.brandColor || '#1e3a8a' }}
                    ></div>
                    <span>Add learners to your system and manage their profiles</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: brandingSettings?.brandColor || '#1e3a8a' }}
                    ></div>
                    <span>Set up classes, streams, and subjects for your school</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: brandingSettings?.brandColor || '#1e3a8a' }}
                    ></div>
                    <span>Begin tracking attendance and recording assessments</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={onGetStarted}
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-cyan-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              Get Started
              <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-gray-500">
              Ready to explore? Click the button above to enter your dashboard
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-100">
            Need help? Contact support at{' '}
            <a href="mailto:support@zawadijrn.ac.ke" className="text-white hover:text-blue-200 font-semibold transition">
              support@zawadijrn.ac.ke
            </a>
          </p>
          <p className="text-blue-100 text-sm mt-2">
            © 2025 {brandingSettings?.schoolName || 'Zawadi JRN Academy'}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
