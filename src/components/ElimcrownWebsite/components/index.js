/**
 * Component Library Index
 * Export all reusable enterprise components
 */

export { EnterpriseHero } from './EnterpriseHero';
export { EnterpriseCTASection } from './EnterpriseCTASection';
export { PricingCard } from './PricingCard';
export { FeatureCard, StatMetricCard, BenefitCard } from './FeatureCard';
export { FAQAccordion, CollapsibleCard } from './FAQAccordion';
export { MobileAuthPage } from './MobileAuthPage';

// Design system / theme constants
export const THEME = {
  colors: {
    primary: '#520050',
    primaryDark: '#3D0038',
    secondary: '#017E84',
    success: '#059669',
    error: '#DC2626',
    warning: '#F59E0B',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '1rem',
  }
};

// Component prop defaults
export const COMPONENT_DEFAULTS = {
  button: {
    size: 'md',
    variant: 'primary'
  },
  card: {
    padding: 'md',
    shadow: 'md'
  },
  input: {
    size: 'md',
    variant: 'default'
  }
};
