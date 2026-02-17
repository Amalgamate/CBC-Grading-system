import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react';

export const WebsiteLayout = ({ children, onLoginClick, onGetStartedClick, isAuthenticated, onOpenAppClick }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showSolutionsDropdown, setShowSolutionsDropdown] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    // Enterprise navigation structure
    const solutions = [
        {
            title: "Assessment",
            items: [
                { name: "CBC Assessment Engine", path: "/features", desc: "Competency-based grading" },
                { name: "Evidence Capture", path: "/features", desc: "Automated observation" },
                { name: "Reporting Tools", path: "/features", desc: "Professional reports" }
            ]
        },
        {
            title: "Operations",
            items: [
                { name: "Academic Management", path: "/solutions", desc: "Holistic excellence" },
                { name: "Financial Control", path: "/solutions", desc: "Fee management" },
                { name: "Human Resources", path: "/solutions", desc: "Staff management" }
            ]
        },
        {
            title: "Innovation",
            items: [
                { name: "The Playroom", path: "/playroom", desc: "Future learning hub" },
                { name: "Skill Development", path: "/playroom", desc: "21st century skills" }
            ]
        }
    ];

    const navLinks = [
        { label: 'Solutions', dropdown: true },
        { label: 'Pricing', path: '/pricing' },
        { label: 'Company', path: '/about' },
        { label: 'Contact', path: '/contact' }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Professional Navigation */}
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
                    scrolled
                        ? 'bg-white border-b border-gray-200 shadow-sm'
                        : 'bg-white/80 backdrop-blur-md border-b border-gray-100'
                }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#520050] to-[#3D0038] rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">EC</span>
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-semibold tracking-tight">
                                <span className="text-[#520050]">Elim</span>
                                <span className="text-gray-900">crown</span>
                            </h1>
                            <p className="text-xs text-gray-500">Educational Platform</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <div
                                key={link.label}
                                className="relative"
                                onMouseEnter={() => link.dropdown && setShowSolutionsDropdown(true)}
                                onMouseLeave={() => link.dropdown && setShowSolutionsDropdown(false)}
                            >
                                {link.dropdown ? (
                                    <button
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#520050] flex items-center gap-1 transition-colors"
                                    >
                                        {link.label}
                                        <ChevronDown size={16} className={`transition-transform ${showSolutionsDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                ) : (
                                    <Link
                                        to={link.path}
                                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                                            location.pathname === link.path
                                                ? 'text-[#520050] font-semibold'
                                                : 'text-gray-700 hover:text-[#520050]'
                                        }`}
                                    >
                                        {link.label}
                                    </Link>
                                )}

                                {/* Solutions Dropdown */}
                                {link.dropdown && showSolutionsDropdown && (
                                    <div className="absolute top-full left-0 mt-1 w-[600px] bg-white rounded-xl shadow-xl border border-gray-100 p-6 animated-dropdown">
                                        <div className="grid grid-cols-3 gap-6">
                                            {solutions.map((category) => (
                                                <div key={category.title} className="space-y-4">
                                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                                                        {category.title}
                                                    </h3>
                                                    {category.items.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            to={item.path}
                                                            className="block group"
                                                        >
                                                            <div className="text-sm font-medium text-gray-900 group-hover:text-[#520050] transition-colors">
                                                                {item.name}
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {item.desc}
                                                            </p>
                                                        </Link>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Call-to-Action Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {!isAuthenticated ? (
                            <>
                                <button
                                    onClick={onLoginClick}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 hover:text-[#520050] transition-colors"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={onGetStartedClick}
                                    className="px-5 py-2 text-sm font-semibold text-white bg-[#520050] hover:bg-[#3D0038] rounded-lg transition-colors"
                                >
                                    Get Started
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={onOpenAppClick}
                                className="px-5 py-2 text-sm font-semibold text-white bg-[#017E84] hover:bg-[#006b70] rounded-lg transition-colors"
                            >
                                Dashboard
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-100 bg-gray-50">
                        <div className="px-6 py-6 space-y-4 max-h-96 overflow-y-auto">
                            {navLinks.map((link) => (
                                <div key={link.label}>
                                    {link.dropdown ? (
                                        <div className="space-y-3">
                                            <div className="text-sm font-semibold text-gray-900">{link.label}</div>
                                            <div className="pl-4 space-y-3">
                                                {solutions.map((cat) =>
                                                    cat.items.map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            to={item.path}
                                                            className="block text-sm text-gray-600 hover:text-[#520050]"
                                                        >
                                                            {item.name}
                                                        </Link>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            to={link.path}
                                            className="block text-sm font-medium text-gray-900 hover:text-[#520050]"
                                        >
                                            {link.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                {!isAuthenticated ? (
                                    <>
                                        <button
                                            onClick={onLoginClick}
                                            className="w-full px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Sign In
                                        </button>
                                        <button
                                            onClick={onGetStartedClick}
                                            className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#520050] hover:bg-[#3D0038] rounded-lg transition-colors"
                                        >
                                            Get Started
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={onOpenAppClick}
                                        className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-[#017E84] hover:bg-[#006b70] rounded-lg transition-colors"
                                    >
                                        Dashboard
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="pt-20">{children}</main>

            {/* Enterprise Footer */}
            <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Footer Content */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-12 py-16">
                        {/* Brand Column */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#520050] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">EC</span>
                                </div>
                                <h3 className="text-lg font-semibold text-white">ElimCrown</h3>
                            </div>
                            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                                Enterprise platform for delivering evidence-based competency education with integrated technology solutions.
                            </p>
                            {/* Social Links */}
                            <div className="flex gap-4 pt-4">
                                {['Twitter', 'LinkedIn', 'Facebook'].map((social) => (
                                    <a
                                        key={social}
                                        href="#"
                                        className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                                        title={social}
                                    >
                                        <span className="text-xs font-semibold">{social[0]}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Product Column */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-white">Product</h4>
                            <ul className="space-y-2 text-sm">
                                {['Features', 'Pricing', 'The Playroom', 'Integrations', 'API'].map((item) => (
                                    <li key={item}>
                                        <Link
                                            to="#"
                                            className="hover:text-white transition-colors"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Resources Column */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-white">Resources</h4>
                            <ul className="space-y-2 text-sm">
                                {['Documentation', 'Blog', 'Case Studies', 'Support', 'Status'].map((item) => (
                                    <li key={item}>
                                        <Link to="#" className="hover:text-white transition-colors">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Company Column */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-white">Company</h4>
                            <ul className="space-y-2 text-sm">
                                {['About', 'Contact', 'Careers', 'Partners', 'Press'].map((item) => (
                                    <li key={item}>
                                        <Link to="#" className="hover:text-white transition-colors">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="border-t border-gray-800 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-gray-500">
                            © {new Date().getFullYear()} ElimCrown. All rights reserved.
                        </div>
                        <div className="flex gap-6 text-sm">
                            <Link to="#" className="text-gray-500 hover:text-white transition-colors">
                                Privacy
                            </Link>
                            <Link to="#" className="text-gray-500 hover:text-white transition-colors">
                                Terms
                            </Link>
                            <Link to="#" className="text-gray-500 hover:text-white transition-colors">
                                Cookies
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};
