
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';

export const WebsiteLayout = ({ children, onLoginClick, onGetStartedClick, isAuthenticated, onOpenAppClick }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const navLinks = [
        { name: 'Product', path: '/features' },
        { name: 'Solutions', path: '/solutions' },
        { name: 'Pricing', path: '/pricing' },
        { name: 'Company', path: '/about' },
    ];

    return (
        <div className="min-h-screen bg-brand-light font-sans text-brand-dark selection:bg-teal-100 selection:text-teal-900">
            {/* Navigation */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-sm' : 'bg-transparent border-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        {/* New Logo Image */}
                        <div className="w-12 h-12 flex items-center justify-center">
                            <img src="/logo-new.png" alt="Elimcrown Logo" className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-tight text-brand-dark group-hover:text-brand-purple transition-colors">Elimcrown</h1>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-5 py-2.5 rounded-full text-base font-medium transition-all ${location.pathname === link.path
                                    ? 'text-brand-purple bg-purple-50'
                                    : 'text-slate-600 hover:text-brand-dark hover:bg-slate-100'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {!isAuthenticated ? (
                            <>
                                <button onClick={onLoginClick} className="text-base font-bold text-slate-600 hover:text-brand-purple transition-colors">
                                    Log in
                                </button>
                                <button
                                    onClick={onGetStartedClick}
                                    className="bg-brand-purple hover:bg-[#5d3d54] text-white px-6 py-2.5 rounded shadow-md hover:shadow-lg text-sm font-bold transition-all hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    Get Started <ChevronRight size={16} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onOpenAppClick}
                                className="bg-brand-teal hover:bg-[#006b70] text-white px-6 py-2.5 rounded shadow-md hover:shadow-lg text-sm font-bold transition-all"
                            >
                                Go to Dashboard
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute top-24 left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-xl font-medium text-slate-700 py-3 border-b border-slate-50"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-4 mt-4">
                            {!isAuthenticated ? (
                                <>
                                    <button onClick={onLoginClick} className="w-full py-4 rounded bg-slate-100 font-bold text-slate-700">
                                        Log in
                                    </button>
                                    <button onClick={onGetStartedClick} className="w-full py-4 rounded bg-brand-purple text-white font-bold shadow-md">
                                        Get Started
                                    </button>
                                </>
                            ) : (
                                <button onClick={onOpenAppClick} className="w-full py-4 rounded bg-brand-teal text-white font-bold">
                                    Dashboard
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="pt-24">
                {children}
            </main>

            {/* Footer - Odoo Style (Light & Clean) */}
            <footer className="bg-brand-light border-t border-gray-200 pt-20 pb-10 text-sm">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">

                    {/* Column 1 */}
                    <div>
                        <h4 className="font-extrabold text-brand-dark mb-5 text-base">Community</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Tutorials</a></li>
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Forum</a></li>
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Open Source</a></li>
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h4 className="font-extrabold text-brand-dark mb-5 text-base">Services</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Hosting</a></li>
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Support</a></li>
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Upgrade</a></li>
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Education</a></li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h4 className="font-extrabold text-brand-dark mb-5 text-base">About us</h4>
                        <ul className="space-y-4 text-slate-500">
                            <li><Link to="/about" className="hover:text-brand-teal transition-colors">Our company</Link></li>
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Contact us</a></li>
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Jobs</a></li>
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Events</a></li>
                            <li><a href="#" className="hover:text-brand-teal transition-colors">Podcast</a></li>
                        </ul>
                    </div>

                    {/* Column 4 & 5 (Combined branding) */}
                    <div className="col-span-2 md:pl-12">
                        <div className="flex items-center gap-2 mb-5">
                            <img src="/logo-new.png" alt="Logo" className="w-8 h-8 object-contain" />
                            <h4 className="font-extrabold text-brand-dark text-lg">Elimcrown</h4>
                        </div>
                        <p className="text-slate-500 mb-6 leading-relaxed">
                            Elimcrown is a suite of open source business apps that cover all your company needs: CRM, eCommerce, accounting, inventory, point of sale, project management, etc.
                        </p>
                        <p className="text-slate-500 leading-relaxed">
                            Elimcrown's unique value proposition is to be at the same time very easy to use and fully integrated.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <div>
                        Copyright © 2024 Elimcrown Inc. • <a href="#" className="hover:underline hover:text-brand-dark">Privacy</a> • <a href="#" className="hover:underline hover:text-brand-dark">Terms</a>
                    </div>
                    <div className="flex gap-4">
                        {/* Social Icons could go here */}
                        <span className="font-semibold">English</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
