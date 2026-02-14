import React, { useState } from 'react';
import { Zap, CheckCircle2, GraduationCap, BookOpen, Users, Award, BarChart3, Shield, Menu, X, TrendingUp, Clock, Target } from 'lucide-react';

const EDucoreLanding2 = ({ onLoginClick, onGetStartedClick, isAuthenticated = false, onOpenAppClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <header className="sticky top-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-elimcrown.png" alt="Elimcrown" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">ElimCrown</h1>
              <p className="text-xs text-gray-500">Bridging the Assessment Gaps</p>
            </div>
          </div>
          <div className="hidden md:flex flex-1 items-center justify-center gap-1">
            <button className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => scrollTo('features')}>Features</button>
            <button className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => scrollTo('pricing')}>Pricing</button>
            <button className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => scrollTo('about')}>About</button>
            <button className="px-3 py-2 rounded hover:bg-gray-100" onClick={() => scrollTo('contact')}>Contact</button>
          </div>
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <button onClick={onLoginClick} className="px-4 py-2 rounded-lg border border-blue-600 text-blue-700 font-semibold hover:bg-blue-50 transition">Login</button>
                <button onClick={onGetStartedClick} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Get Started</button>
              </>
            ) : (
              <button onClick={onOpenAppClick} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Open Dashboard</button>
            )}
            <button className="md:hidden p-2 rounded hover:bg-gray-100" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-2">
              <button className="px-3 py-2 rounded hover:bg-gray-100 text-left" onClick={() => scrollTo('features')}>Features</button>
              <button className="px-3 py-2 rounded hover:bg-gray-100 text-left" onClick={() => scrollTo('pricing')}>Pricing</button>
              <button className="px-3 py-2 rounded hover:bg-gray-100 text-left" onClick={() => scrollTo('about')}>About</button>
              <button className="px-3 py-2 rounded hover:bg-gray-100 text-left" onClick={() => scrollTo('contact')}>Contact</button>
            </div>
          </div>
        )}
      </header>

      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-32 relative">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-2xl" />
          <div className="absolute top-20 right-0 w-72 h-72 bg-purple-200 rounded-full opacity-20 blur-2xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-8 px-5 py-2.5 bg-purple-100 rounded-full">
              <Zap className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-bold text-purple-700">A Practical Way to Deliver CBC</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-6">
              Where Play Becomes Learning,<br />
              <span className="text-purple-600">and Learning Becomes Competence</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed font-medium">
              ElimCrown is a competency-based learning and assessment platform that helps schools teach coding, robotics, and digital skills through play, while automatically capturing clear CBC evidence.
            </p>

            {/* Key Message */}
            <div className="bg-teal-50 border-l-4 border-teal-500 p-4 mb-8">
              <p className="text-gray-700 font-medium">
                Learning happens through exploration.<br />
                Assessment happens in the background.
              </p>
            </div>

            {/* Problem Points */}
            <div className="space-y-4 mb-10">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-gray-900">Coding Through Play</p>
                  <p className="text-sm text-gray-600">Block-based and text-based programming</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-gray-900">Virtual Robotics Labs</p>
                  <p className="text-sm text-gray-600">Program robots without physical kits</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-bold text-gray-900">Automated CBC Assessment</p>
                  <p className="text-sm text-gray-600">Evidence captured automatically</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <button onClick={onGetStartedClick} className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 text-white font-bold text-lg hover:brightness-110 transition shadow-lg hover:shadow-xl">
                Explore the Playroom
              </button>
              <button onClick={onLoginClick} className="px-8 py-4 rounded-xl border-2 border-purple-600 text-purple-700 font-bold text-lg hover:bg-purple-50 transition">
                Sign In
              </button>
            </div>
            <p className="text-sm text-gray-500 font-medium">No credit card required • 30-day trial • Cancel anytime</p>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            {/* Header Image with Gradient */}
            <div className="relative h-48 bg-gradient-to-br from-blue-100 via-white to-purple-100">
              <img
                src="/header.jpg"
                alt="School Management"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent"></div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-bold text-blue-900">CBC Compliant</p>
                  </div>
                  <p className="text-xs text-blue-700">Full competency-based curriculum support</p>
                </div>
                <div className="p-5 rounded-xl bg-green-50 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <p className="text-sm font-bold text-green-900">Save Time</p>
                  </div>
                  <p className="text-xs text-green-700">Cut admin work by 70%</p>
                </div>
                <div className="p-5 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-bold text-purple-900">Better Insights</p>
                  </div>
                  <p className="text-xs text-purple-700">Track learner progress in real-time</p>
                </div>
                <div className="p-5 rounded-xl bg-orange-50 border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-5 h-5 text-orange-600" />
                    <p className="text-sm font-bold text-orange-900">Secure & Simple</p>
                  </div>
                  <p className="text-xs text-orange-700">Bank-level security, easy to use</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Everything You Need</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Simple tools that solve real problems teachers face every day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border-2 border-blue-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <BookOpen className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900">CBC Assessments</h3>
              </div>
              <p className="text-gray-600 font-medium leading-relaxed">Complete competency-based grading with rubrics, strands, and learning outcomes. No more manual calculations.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border-2 border-green-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <BarChart3 className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Smart Reports</h3>
              </div>
              <p className="text-gray-600 font-medium leading-relaxed">Generate comprehensive report cards instantly. Share with parents via email or print-ready PDFs.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border-2 border-purple-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Learner Management</h3>
              </div>
              <p className="text-gray-600 font-medium leading-relaxed">Track attendance, admissions, and performance all in one place. Access any learner's data in seconds.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border-2 border-orange-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Award className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Core Competencies</h3>
              </div>
              <p className="text-gray-600 font-medium leading-relaxed">Assess all six core competencies and seven national values with guided templates.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border-2 border-red-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <Shield className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Secure & Reliable</h3>
              </div>
              <p className="text-gray-600 font-medium leading-relaxed">Your data is encrypted and backed up. Role-based access keeps information safe.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition border-2 border-indigo-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <GraduationCap className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Mobile Ready</h3>
              </div>
              <p className="text-gray-600 font-medium leading-relaxed">Works perfectly on phones, tablets, and computers. Manage your school from anywhere.</p>
            </div>
          </div>
        </div>
      </section>



      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Pricing (KSh)</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Simple, transparent pricing for schools of all sizes.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Starter</h3>
              <p className="text-gray-600 mb-6">Perfect for small schools</p>
              <div className="mb-6"><span className="text-4xl font-black text-gray-900">KSh 4,999</span><span className="text-gray-600 text-lg">/month</span></div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Up to 100 students</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>CBC assessments</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Report generation</span></li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8 rounded-2xl shadow-2xl border-2 border-blue-600 transform md:scale-105">
              <h3 className="text-2xl font-black mb-2">Professional</h3>
              <p className="text-blue-100 mb-6">For growing schools</p>
              <div className="mb-6"><span className="text-4xl font-black">KSh 9,999</span><span className="text-blue-100 text-lg">/month</span></div>
              <ul className="space-y-3">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" /><span>Up to 500 students</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" /><span>Advanced analytics</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-white flex-shrink-0 mt-0.5" /><span>Priority support</span></li>
              </ul>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-200">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Enterprise</h3>
              <p className="text-gray-600 mb-6">For large institutions</p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Unlimited students</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Custom integrations</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" /><span>Dedicated support</span></li>
              </ul>
              <div className="mt-6 text-gray-900 font-bold">Contact sales</div>
            </div>
          </div>
        </div>
      </section>





      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">About Elimcrown</h2>
            <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Elimcrown helps Kenyan schools implement CBC assessments efficiently with powerful analytics, secure data management, and intuitive tools that save time and improve learning outcomes.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-xl border bg-blue-50">
              <div className="flex items-center gap-2 text-blue-900 font-black text-base mb-2">
                <GraduationCap className="w-6 h-6" /> Mission
              </div>
              <p className="text-blue-700 text-sm">Empower education through technology that works for teachers and learners.</p>
            </div>
            <div className="p-6 rounded-xl border bg-purple-50">
              <div className="flex items-center gap-2 text-purple-900 font-black text-base mb-2">
                <BookOpen className="w-6 h-6" /> Focus
              </div>
              <p className="text-purple-700 text-sm">CBC compliance, real-time analytics, and seamless reporting.</p>
            </div>
            <div className="p-6 rounded-xl border bg-green-50">
              <div className="flex items-center gap-2 text-green-900 font-black text-base mb-2">
                <Users className="w-6 h-6" /> Built For
              </div>
              <p className="text-green-700 text-sm">Schools seeking modern, efficient education management solutions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6 text-center">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <form className="bg-white p-8 rounded-xl border shadow-sm space-y-4">
              <input className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Your Name" />
              <input className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Email" type="email" />
              <textarea className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none" placeholder="Message" />
              <button className="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition w-full">Send Message</button>
            </form>
            <div className="bg-white p-8 rounded-xl border shadow-sm">
              <h3 className="text-lg font-black text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3 text-gray-700">
                <p className="flex items-start gap-2">
                  <span className="font-bold">Email:</span> support@elimcrown.ac.ke
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold">Phone:</span> +254 700 000 000
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold">Address:</span> Nairobi, Kenya
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 bg-gray-100 border-t">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo-elimcrown.png" alt="Elimcrown" className="w-8 h-8" />
              <div>
                <p className="font-bold text-gray-900">Elimcrown V1</p>
                <p className="text-xs text-gray-500">School Management Platform</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">© 2026 Elimcrown. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EDucoreLanding2;
