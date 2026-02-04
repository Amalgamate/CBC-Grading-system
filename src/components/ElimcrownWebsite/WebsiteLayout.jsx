
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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            {/* Navigation */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled || mobileMenuOpen ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-sm' : 'bg-transparent border-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg text-white group-hover:shadow-lg transition-all duration-300">
                            {/* Simplified Logo Icon */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900">Elimcrown</h1>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${location.pathname === link.path
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                                <button onClick={onLoginClick} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                                    Log in
                                </button>
                                <button
                                    onClick={onGetStartedClick}
                                    className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                                >
                                    Get Started <ChevronRight size={16} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onOpenAppClick}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg"
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
                    <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className="text-lg font-medium text-slate-700 py-2 border-b border-slate-50"
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-3 mt-4">
                            {!isAuthenticated ? (
                                <>
                                    <button onClick={onLoginClick} className="w-full py-3 rounded-xl border border-slate-200 font-semibold text-slate-700">
                                        Log in
                                    </button>
                                    <button onClick={onGetStartedClick} className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md">
                                        Get Started
                                    </button>
                                </>
                            ) : (
                                <button onClick={onOpenAppClick} className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold">
                                    Dashboard
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="pt-20">
                {children}
            </main>

            {/* Footer - Odoo Style (Light & Clean) */}
            <footer className="bg-[#f9fafb] border-t border-gray-200 pt-16 pb-8 text-sm">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">

                    {/* Column 1 */}
                    <div>
                        <h4 className="font-bold text-[#1a1a1a] mb-4">Community</h4>
                        <ul className="space-y-3 text-slate-500">
                            <li><a href="#" className="hover:text-[#714B67]">Tutorials</a></li>
                            <li><a href="#" className="hover:text-[#714B67]">Documentation</a></li>
                            <li><a href="#" className="hover:text-[#714B67]">Forum</a></li>
                            <li><a href="#" className="hover:text-[#714B67]">Open Source</a></li>
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h4 className="font-bold text-[#1a1a1a] mb-4">Services</h4>
                        <ul className="space-y-3 text-slate-500">
                            <li><a href="#" className="hover:text-[#714B67]">Hosting</a></li>
                            <li><a href="#" className="hover:text-[#714B67]">Support</a></li>
                            <li><a href="#" className="hover:text-[#714B67]">Upgrade</a></li>
                            <li><a href="#" className="hover:text-[#714B67]">Education</a></li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div>
                        <h4 className="font-bold text-[#1a1a1a] mb-4">About us</h4>
                        <ul className="space-y-3 text-slate-500">
                            <li><Link to="/about" className="hover:text-[#714B67]">Our company</Link></li>
                            <li><a href="#" className="hover:text-[#714B67]">Contact us</a></li>
                            <li><a href="#" className="hover:text-[#714B67]">Jobs</a></li>
                            <li><a href="#" className="hover:text-[#714B67]">Events</a></li>
                            <li><a href="#" className="hover:text-[#714B67]">Podcast</a></li>
                        </ul>
                    </div>

                    {/* Column 4 & 5 (Combined branding) */}
                    <div className="col-span-2 md:pl-10">
                        <h4 className="font-bold text-[#1a1a1a] mb-4">Elimcrown</h4>
                        <p className="text-slate-500 mb-6">
                            Elimcrown is a suite of open source business apps that cover all your company needs: CRM, eCommerce, accounting, inventory, point of sale, project management, etc.
                        </p>
                        <p className="text-slate-500">
                            Elimcrown's unique value proposition is to be at the same time very easy to use and fully integrated.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="max-w-6xl mx-auto px-6 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
                    <div>
                        Copyright © 2024 Elimcrown Inc. • <a href="#" className="hover:underline">Privacy</a> • <a href="#" className="hover:underline">Terms</a>
                    </div>
                    <div className="flex gap-4">
                        {/* Social Icons could go here */}
                        <span>English</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
