import React from 'react';
import { CheckCircle, Users, BarChart3, Calendar, ArrowRight } from 'lucide-react';

export default function WelcomeScreen({ user, onGetStarted }) {
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
    <div className="w-full max-w-4xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-6 shadow-2xl">
          <CheckCircle className="text-white" size={40} />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Welcome to Zawadi JRN Academy! 🎉
        </h1>
        <p className="text-xl text-gray-600">
          Hi <span className="font-semibold text-blue-600">{user?.name || 'there'}</span>, your account has been successfully created
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're All Set!</h2>
          <p className="text-gray-600">
            Here's what you can do with our CBC Grading System
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-600 transition">
                <feature.icon className="text-blue-600 group-hover:text-white transition" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">💡</span>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Start Guide</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Add learners to your system and manage their profiles
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Set up classes, streams, and subjects for your school
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                  Begin tracking attendance and recording assessments
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-cyan-700 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg"
          >
            Get Started
            <ArrowRight size={24} />
          </button>
          <p className="text-sm text-gray-500">
            Ready to explore? Click the button above to enter your dashboard
          </p>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Need help? Contact support at{' '}
          <a href="mailto:support@zawadijrn.ac.ke" className="text-blue-600 hover:text-blue-700 font-semibold">
            support@zawadijrn.ac.ke
          </a>
        </p>
      </div>
    </div>
  );
}
