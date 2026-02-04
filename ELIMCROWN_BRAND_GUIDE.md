# ElimCrown Brand Identity Guide
## Visual Identity & Design System

---

## 🎨 BRAND COLORS

### Primary Palette

**Royal Purple (Primary Brand Color)**
- Hex: `#6B46C1`
- RGB: `107, 70, 193`
- Usage: Primary buttons, headers, key CTAs, logo
- Meaning: Trust, education, premium quality, wisdom

**Emerald Teal (Secondary Brand Color)**
- Hex: `#14B8A6`
- RGB: `20, 184, 166`
- Usage: Success states, growth indicators, secondary buttons
- Meaning: Growth, innovation, technology, progress

**Amber Gold (Accent Color)**
- Hex: `#F59E0B`
- RGB: `245, 158, 11`
- Usage: Achievements, highlights, important notifications
- Meaning: Excellence, achievement, energy, mastery

### Supporting Colors

**Neutral Grays**
- Gray 50: `#F9FAFB` - Backgrounds
- Gray 100: `#F3F4F6` - Subtle backgrounds
- Gray 200: `#E5E7EB` - Borders
- Gray 400: `#9CA3AF` - Disabled text
- Gray 600: `#4B5563` - Secondary text
- Gray 900: `#111827` - Primary text

**Semantic Colors**
- Success Green: `#10B981`
- Warning Orange: `#F97316`
- Error Red: `#EF4444`
- Info Blue: `#3B82F6`

### CBC Rubric Colors
- **EE (Exceeds Expectations):** `#10B981` (Green)
- **ME (Meets Expectations):** `#3B82F6` (Blue)
- **AE (Approaching Expectations):** `#F59E0B` (Amber)
- **BE (Below Expectations):** `#EF4444` (Red)

---

## 🔤 TYPOGRAPHY

### Font Families

**Primary Font: Inter**
- Usage: UI, body text, most content
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 900 (Black)
- Why: Clean, modern, highly readable, professional

**Display Font: Poppins**
- Usage: Headlines, hero sections, marketing materials
- Weights: 600 (Semibold), 700 (Bold), 800 (Extrabold)
- Why: Friendly yet professional, great for impact

**Monospace Font: JetBrains Mono**
- Usage: Code snippets, technical content
- Weights: 400 (Regular), 700 (Bold)
- Why: Designed for code, excellent readability

### Type Scale

```css
/* Headlines */
h1: 48px / 56px line-height, Poppins Bold
h2: 36px / 44px line-height, Poppins Semibold
h3: 30px / 38px line-height, Poppins Semibold
h4: 24px / 32px line-height, Inter Semibold
h5: 20px / 28px line-height, Inter Semibold
h6: 18px / 26px line-height, Inter Medium

/* Body Text */
Large: 18px / 28px line-height, Inter Regular
Base: 16px / 24px line-height, Inter Regular
Small: 14px / 20px line-height, Inter Regular
Tiny: 12px / 16px line-height, Inter Regular

/* Code */
Code: 14px / 20px line-height, JetBrains Mono Regular
```

---

## 🎭 LOGO DESIGN CONCEPT

### Logo Elements

**Symbol: Crown + Growth**
```
    👑
   /│\
  / │ \
 🌱 │ 🌱
    │
  ═════
```

**Concept:**
- Crown at top: Excellence, mastery, achievement
- Upward lines: Growth, elevation, progress
- Seedlings: Nurturing, foundation, potential
- Base: Stability, trust, education

**Logo Variations:**

1. **Full Logo** - Symbol + "ElimCrown" text
2. **Icon Only** - Just the crown symbol (for favicons, app icons)
3. **Text Only** - "ElimCrown" wordmark (for tight spaces)
4. **Stacked** - Symbol above text (for square formats)

**Color Variations:**
- Primary: Royal Purple (#6B46C1)
- White: For dark backgrounds
- Black: For print/monochrome
- Gradient: Purple to Teal (for digital/premium contexts)

---

## 🎯 BRAND VOICE & TONE

### Voice Characteristics

**Professional but Approachable**
- We're experts, but we speak human
- Confident without being arrogant
- Educational without being condescending

**Empowering**
- Focus on what users CAN do
- Celebrate progress, not just perfection
- Encourage experimentation

**Clear and Direct**
- No jargon unless necessary
- Short sentences, active voice
- Specific examples over abstract concepts

### Tone by Context

**Marketing Website:**
- Confident, inspiring, solution-focused
- "ElimCrown bridges the assessment gaps"
- "Transform how CBC assessment is done"

**Product Interface:**
- Helpful, encouraging, clear
- "Great job! You've completed 5 activities this week"
- "Let's validate these observations"

**Support/Documentation:**
- Patient, thorough, reassuring
- "Here's how to set up your first activity"
- "Need help? We're here for you"

**Parent Communications:**
- Warm, transparent, educational
- "Here's what your child learned this week"
- "Understanding CBC competency levels"

---

## 🖼️ VISUAL STYLE

### Photography Style

**Do:**
- Real students in real classrooms
- Diverse representation (age, gender, ethnicity)
- Natural lighting, authentic moments
- Focus on engagement and learning
- Show technology in use

**Don't:**
- Stock photos that look staged
- Overly polished/unrealistic scenes
- Empty classrooms or posed shots
- Low-quality or blurry images

### Illustration Style

**Characteristics:**
- Flat design with subtle gradients
- Rounded corners, friendly shapes
- Purple/Teal color scheme
- Simple, clear, not overly detailed
- Consistent line weights

**Use Cases:**
- Empty states
- Onboarding flows
- Feature explanations
- Error messages
- Loading states

### Iconography

**Style:**
- Lucide React icon set (consistent with current codebase)
- 24px default size
- 2px stroke width
- Rounded line caps
- Consistent visual weight

**Custom Icons Needed:**
- ElimCrown logo icon
- Playroom modules (coding, robotics, exploration)
- Competency indicators
- Evidence types

---

## 🎨 UI COMPONENTS STYLE

### Buttons

**Primary Button (CTA)**
```css
background: linear-gradient(135deg, #6B46C1 0%, #14B8A6 100%);
color: white;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
box-shadow: 0 4px 12px rgba(107, 70, 193, 0.3);
transition: transform 0.2s, box-shadow 0.2s;

hover:
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(107, 70, 193, 0.4);
```

**Secondary Button**
```css
background: white;
color: #6B46C1;
border: 2px solid #6B46C1;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;

hover:
  background: #F9FAFB;
```

**Ghost Button**
```css
background: transparent;
color: #6B46C1;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;

hover:
  background: rgba(107, 70, 193, 0.1);
```

### Cards

**Standard Card**
```css
background: white;
border: 1px solid #E5E7EB;
border-radius: 12px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

hover:
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #6B46C1;
```

**Elevated Card (Premium)**
```css
background: white;
border: 2px solid transparent;
background-image: linear-gradient(white, white),
                  linear-gradient(135deg, #6B46C1, #14B8A6);
background-origin: border-box;
background-clip: padding-box, border-box;
border-radius: 12px;
padding: 24px;
box-shadow: 0 8px 24px rgba(107, 70, 193, 0.2);
```

### Inputs

**Text Input**
```css
background: white;
border: 2px solid #E5E7EB;
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;

focus:
  border-color: #6B46C1;
  outline: none;
  box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1);
```

### Badges

**Status Badge**
```css
padding: 4px 12px;
border-radius: 12px;
font-size: 12px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.5px;

/* Variants */
.success { background: #D1FAE5; color: #065F46; }
.warning { background: #FEF3C7; color: #92400E; }
.error { background: #FEE2E2; color: #991B1B; }
.info { background: #DBEAFE; color: #1E40AF; }
```

---

## 📐 SPACING SYSTEM

**Base Unit: 4px**

```
xs:  4px   (0.25rem)
sm:  8px   (0.5rem)
md:  16px  (1rem)
lg:  24px  (1.5rem)
xl:  32px  (2rem)
2xl: 48px  (3rem)
3xl: 64px  (4rem)
4xl: 96px  (6rem)
```

**Usage:**
- Component padding: md (16px)
- Section spacing: 2xl (48px)
- Page margins: lg (24px)
- Element gaps: sm (8px)

---

## 🎬 ANIMATION PRINCIPLES

### Timing

**Fast Interactions:** 150-200ms
- Button hovers
- Input focus
- Tooltip shows

**Standard Transitions:** 250-300ms
- Card hovers
- Modal opens
- Dropdown expands

**Slow Animations:** 400-500ms
- Page transitions
- Loading states
- Success celebrations

### Easing

**Default:** `cubic-bezier(0.4, 0.0, 0.2, 1)` - Smooth, natural
**Bounce:** `cubic-bezier(0.68, -0.55, 0.265, 1.55)` - Playful, celebratory
**Ease-out:** `cubic-bezier(0.0, 0.0, 0.2, 1)` - Decelerating, settling

### Motion Patterns

**Slide In (from right):**
```css
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

**Fade Up:**
```css
@keyframes fadeUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**Scale In:**
```css
@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile First Approach */
sm:  640px   /* Small tablets */
md:  768px   /* Tablets */
lg:  1024px  /* Laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large screens */
```

---

## 🎯 BRAND APPLICATIONS

### Website Header
```
┌─────────────────────────────────────────────────────────┐
│  [👑 ElimCrown]    Home  Playroom  Schools  Pricing    │
│                                    [Login] [Free Trial] │
└─────────────────────────────────────────────────────────┘
```

### Email Signature
```
──────────────────────────────
👑 ElimCrown
Bridging the Assessment Gaps

[Your Name]
[Your Title]
hello@elimcrown.com
+254 XXX XXX XXX
──────────────────────────────
```

### Social Media Profile
```
Profile Picture: ElimCrown icon (crown symbol)
Cover Photo: Students using Playroom with tagline overlay
Bio: "Bridging the assessment gaps in CBC education. 
      Where learning meets assessment, seamlessly. 🇰🇪"
```

---

## ✅ BRAND CHECKLIST

**Visual Identity:**
- [ ] Logo designed (all variations)
- [ ] Color palette finalized
- [ ] Typography system implemented
- [ ] Icon set created
- [ ] Illustration style guide

**Digital Assets:**
- [ ] Website redesigned
- [ ] App interface updated
- [ ] Email templates rebranded
- [ ] Social media graphics
- [ ] Presentation templates

**Marketing Materials:**
- [ ] Brochure/flyer design
- [ ] Business cards
- [ ] Demo video intro/outro
- [ ] Pitch deck template
- [ ] Case study template

**Documentation:**
- [ ] Brand guidelines PDF
- [ ] Component library (Storybook)
- [ ] Design system documentation
- [ ] Usage examples

---

## 🎨 DESIGN TOOLS & RESOURCES

**Design:**
- Figma (UI/UX design)
- Adobe Illustrator (logo, icons)
- Canva (marketing materials)

**Development:**
- Tailwind CSS (styling framework)
- Framer Motion (animations)
- Lucide React (icons)

**Fonts:**
- Google Fonts (Inter, Poppins)
- JetBrains Mono (code font)

**Stock Resources:**
- Unsplash (photography)
- unDraw (illustrations)
- Heroicons (additional icons)

---

**The ElimCrown Visual Identity:**

> Clean. Professional. Empowering.
> 
> Our brand reflects what we do:
> - Purple = Trust & Education
> - Teal = Growth & Innovation
> - Crown = Excellence & Mastery
> 
> Together, we bridge the gaps.

**Ready to bring the brand to life?** 🎨
