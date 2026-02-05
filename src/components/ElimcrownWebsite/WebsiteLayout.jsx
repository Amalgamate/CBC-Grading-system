
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, ChevronDown, Fingerprint, Brain, LayoutDashboard, CreditCard, Users, Play, BookOpen, ShieldCheck } from 'lucide-react';

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

    const [activeDropdown, setActiveDropdown] = useState(null);

    // Solutions dropdown content
    const solutions = [
        {
            title: "Assessment & Academics",
            description: "Evidence-based CBC assessment and academic management.",
            icon: <Brain className="text-[#875A7B]" size={20} />,
            items: [
                { name: "CBC Assessment", path: "/solutions/cbc-assessment", icon: <BookOpen size={16} /> },
                { name: "Academic Management", path: "/solutions/academics", icon: <LayoutDashboard size={16} /> },
                { name: "Timetabling", path: "/solutions/timetabling", icon: <Users size={16} /> }
            ]
        },
        {
            title: "Operations & Security",
            description: "Streamline school operations and enhance safety.",
            icon: <ShieldCheck className="text-teal-600" size={20} />,
            items: [
                { name: "Biometrics & Attendance", path: "/solutions/biometrics", icon: <Fingerprint size={16} /> },
                { name: "School Finance", path: "/solutions/finance", icon: <CreditCard size={16} /> },
                { name: "Communication Hub", path: "/solutions/communication", icon: <Users size={16} /> }
            ]
        },
        {
            title: "Future Skills",
            description: "Ignite creativity with our specialized learning hubs.",
            icon: <Play className="text-orange-500" size={20} />,
            items: [
                { name: "The Playroom", path: "/playroom", icon: <Play size={16} /> },
                { name: "Robotics Hub", path: "/solutions/robotics", icon: <Brain size={16} /> },
                { name: "Coding for Kids", path: "/solutions/coding", icon: <LayoutDashboard size={16} /> }
            ]
        }
    ];

    const navLinks = [
        { name: 'Solutions', dropdown: true },
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
                            <h1 className="text-2xl font-extrabold tracking-tight text-brand-dark group-hover:text-[#875A7B] transition-colors">Elimcrown</h1>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <div
                                key={link.name}
                                className="relative group/nav"
                                onMouseEnter={() => link.dropdown && setActiveDropdown(link.name)}
                                onMouseLeave={() => link.dropdown && setActiveDropdown(null)}
                            >
                                {link.dropdown ? (
                                    <button
                                        className={`px-5 py-2.5 rounded-full text-base font-medium flex items-center gap-1 transition-all text-slate-600 hover:text-brand-dark hover:bg-slate-100 ${activeDropdown === link.name ? 'text-[#875A7B] bg-slate-100' : ''
                                            }`}
                                    >
                                        {link.name} <ChevronDown size={16} className={`transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />
                                    </button>
                                ) : (
                                    <Link
                                        to={link.path}
                                        className={`px-5 py-2.5 rounded-full text-base font-medium transition-all ${location.pathname === link.path
                                            ? 'text-[#875A7B] bg-[#f4f0f2]'
                                            : 'text-slate-600 hover:text-brand-dark hover:bg-slate-100'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                )}

                                {/* Mega Dropdown */}
                                {link.dropdown && activeDropdown === link.name && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[750px] animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 grid grid-cols-3 gap-8">
                                            {solutions.map((category, idx) => (
                                                <div key={idx} className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                                            {category.icon}
                                                        </div>
                                                        <h3 className="font-bold text-brand-dark">{category.title}</h3>
                                                    </div>
                                                    <p className="text-sm text-slate-500 leading-relaxed">
                                                        {category.description}
                                                    </p>
                                                    <div className="pt-2 flex flex-col gap-2">
                                                        {category.items.map((item, i) => (
                                                            <Link
                                                                key={i}
                                                                to={item.path}
                                                                className="flex items-center gap-3 group/item p-2 rounded-lg hover:bg-slate-50 transition-colors"
                                                            >
                                                                <div className="text-slate-400 group-hover/item:text-[#875A7B] transition-colors">
                                                                    {item.icon}
                                                                </div>
                                                                <span className="text-sm font-semibold text-slate-600 group-hover/item:text-brand-dark">
                                                                    {item.name}
                                                                </span>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        {!isAuthenticated ? (
                            <>
                                <button onClick={onLoginClick} className="text-base font-bold text-slate-600 hover:text-[#875A7B] transition-colors">
                                    Log in
                                </button>
                                <button
                                    onClick={onGetStartedClick}
                                    className="bg-[#875A7B] hover:bg-[#714B67] text-white px-6 py-2.5 rounded shadow-md hover:shadow-lg text-sm font-bold transition-all hover:-translate-y-0.5 flex items-center gap-2"
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
                            <React.Fragment key={link.name}>
                                {link.dropdown ? (
                                    <div className="space-y-4">
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest pt-4">{link.name}</div>
                                        {solutions.map((category) => (
                                            <div key={category.title} className="space-y-2">
                                                <div className="text-sm font-bold text-brand-dark flex items-center gap-2">
                                                    {category.icon} {category.title}
                                                </div>
                                                <div className="pl-8 flex flex-col gap-3">
                                                    {category.items.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            to={item.path}
                                                            className="text-base font-medium text-slate-600 hover:text-[#875A7B]"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Link
                                        to={link.path}
                                        className="text-xl font-medium text-slate-700 py-3 border-b border-slate-50"
                                    >
                                        {link.name}
                                    </Link>
                                )}
                            </React.Fragment>
                        ))}
                        <div className="flex flex-col gap-4 mt-4">
                            {!isAuthenticated ? (
                                <>
                                    <button onClick={onLoginClick} className="w-full py-4 rounded bg-slate-100 font-bold text-slate-700">
                                        Log in
                                    </button>
                                    <button onClick={onGetStartedClick} className="w-full py-4 rounded bg-[#875A7B] text-white font-bold shadow-md">
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

            {/* Footer - Mature Professional Design */}
            <footer className="bg-[#875A7B] text-white pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Main Footer Content */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                        {/* Column 1 - Brand */}
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/logo-new.png" alt="ElimCrown Logo" className="w-10 h-10 object-contain brightness-0 invert" />
                                <h4 className="font-bold text-xl">ElimCrown</h4>
                            </div>
                            <p className="text-white text-opacity-80 leading-relaxed mb-6">
                                Bridging the assessment gaps in CBC education through play-based learning and automated evidence capture.
                            </p>
                            {/* Social Media */}
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center rounded transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center rounded transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-white bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center rounded transition-all">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" /></svg>
                                </a>
                            </div>
                        </div>

                        {/* Column 2 - Product */}
                        <div>
                            <h4 className="font-bold text-base mb-5">Product</h4>
                            <ul className="space-y-3 text-white text-opacity-80">
                                <li><Link to="/features" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Features</Link></li>
                                <li><Link to="/playroom" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">The Playroom</Link></li>
                                <li><a href="#" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Assessment Tools</a></li>
                                <li><Link to="/pricing" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Pricing</Link></li>
                                <li><a href="#" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Integrations</a></li>
                            </ul>
                        </div>

                        {/* Column 3 - Resources */}
                        <div>
                            <h4 className="font-bold text-base mb-5">Resources</h4>
                            <ul className="space-y-3 text-white text-opacity-80">
                                <li><a href="#" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Documentation</a></li>
                                <li><a href="#" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Tutorials</a></li>
                                <li><a href="#" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Blog</a></li>
                                <li><a href="#" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Case Studies</a></li>
                                <li><a href="#" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Support</a></li>
                            </ul>
                        </div>

                        {/* Column 4 - Company */}
                        <div>
                            <h4 className="font-bold text-base mb-5">Company</h4>
                            <ul className="space-y-3 text-white text-opacity-80">
                                <li><Link to="/about" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">About Us</Link></li>
                                <li><Link to="/contact" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Contact</Link></li>
                                <li><a href="#" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Careers</a></li>
                                <li><a href="#" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Partners</a></li>
                                <li><a href="#" className="hover:text-opacity-100 transition-all hover:translate-x-1 inline-block">Press Kit</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-white border-opacity-20 my-8"></div>

                    {/* Bottom Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white text-opacity-70">
                        <div className="flex flex-wrap items-center gap-6">
                            <span>© 2026 ElimCrown. All rights reserved.</span>
                            <a href="#" className="hover:text-opacity-100 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-opacity-100 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-opacity-100 transition-colors">Cookie Policy</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <span>Maintained by Amalgamate+</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
