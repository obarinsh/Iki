# Prompt for Brand Guidelines Generation

## The Prompt (Copy Everything Below)

---

You are a world-class brand designer and design systems architect. Generate comprehensive, production-ready brand guidelines as **valid JSON** that integrates directly with Tailwind CSS, shadcn/ui, and CSS custom properties.

### Requirements:
1. **Colors**: Use hex codes only. Ensure WCAG AA contrast (4.5:1). Include foreground colors for every background.
2. **Typography**: Use real Google Fonts with URLs. Include complete type scale (xs to 7xl) with line-height and letter-spacing.
3. **Layout DNA**: Choose from: low/medium/high (contrast), sparse/balanced/dense (density), text-heavy/balanced/image-heavy, minimal/moderate/elaborate (complexity), strict/flexible/organic (grid), generous/balanced/compact (space).
4. **Output**: Valid JSON only. No markdown wrapping. No placeholders.

### JSON Schema:

```json
{
  "meta": {
    "brandName": "string",
    "tagline": "string",
    "version": "1.0.0"
  },
  "designSummary": "2-3 sentence design philosophy",
  "designStyle": {
    "primaryStyle": ["2-3 style descriptors"],
    "supportingStyles": ["2-3 influences"],
    "moodKeywords": ["5-7 keywords"]
  },
  "toneOfVoice": "Communication style description",
  "palette": {
    "colors": {
      "primary": "#hex",
      "primaryForeground": "#hex",
      "secondary": "#hex",
      "secondaryForeground": "#hex",
      "accent": "#hex",
      "accentForeground": "#hex",
      "background": "#hex",
      "foreground": "#hex",
      "muted": "#hex",
      "mutedForeground": "#hex",
      "card": "#hex",
      "cardForeground": "#hex",
      "border": "#hex",
      "input": "#hex",
      "ring": "#hex",
      "destructive": "#hex",
      "destructiveForeground": "#hex",
      "success": "#hex",
      "successForeground": "#hex",
      "warning": "#hex",
      "warningForeground": "#hex"
    },
    "paletteUsageGuide": "When/how to use each color",
    "paletteAccessibilityNotes": "WCAG compliance notes"
  },
  "typography": {
    "headings": {
      "fontFamily": "Font Name",
      "fallbackStack": "system-ui, sans-serif",
      "googleFontsUrl": "https://fonts.googleapis.com/css2?family=...",
      "usageGuide": "Heading usage guidance",
      "accessibilityNotes": "Accessibility considerations"
    },
    "paragraphs": {
      "fontFamily": "Font Name",
      "fallbackStack": "system-ui, sans-serif",
      "googleFontsUrl": "https://fonts.googleapis.com/css2?family=...",
      "usageGuide": "Body text guidance",
      "accessibilityNotes": "Line height, spacing recommendations"
    },
    "fontSizes": [
      { "name": "xs", "size": "0.75rem", "lineHeight": "1rem", "letterSpacing": "0.01em", "fontWeight": "400" },
      { "name": "sm", "size": "0.875rem", "lineHeight": "1.25rem", "letterSpacing": "0", "fontWeight": "400" },
      { "name": "base", "size": "1rem", "lineHeight": "1.5rem", "letterSpacing": "0", "fontWeight": "400" },
      { "name": "lg", "size": "1.125rem", "lineHeight": "1.75rem", "letterSpacing": "-0.01em", "fontWeight": "400" },
      { "name": "xl", "size": "1.25rem", "lineHeight": "1.75rem", "letterSpacing": "-0.01em", "fontWeight": "500" },
      { "name": "2xl", "size": "1.5rem", "lineHeight": "2rem", "letterSpacing": "-0.02em", "fontWeight": "600" },
      { "name": "3xl", "size": "1.875rem", "lineHeight": "2.25rem", "letterSpacing": "-0.02em", "fontWeight": "600" },
      { "name": "4xl", "size": "2.25rem", "lineHeight": "2.5rem", "letterSpacing": "-0.02em", "fontWeight": "700" },
      { "name": "5xl", "size": "3rem", "lineHeight": "1.1", "letterSpacing": "-0.03em", "fontWeight": "700" },
      { "name": "6xl", "size": "3.75rem", "lineHeight": "1.1", "letterSpacing": "-0.03em", "fontWeight": "800" }
    ]
  },
  "layout": {
    "grid": {
      "margins": "Tailwind margin classes",
      "padding": "Tailwind padding classes",
      "gaps": "Tailwind gap classes",
      "compositionApproach": "Layout philosophy"
    },
    "layoutDna": {
      "contrastSpectrum": "low | medium | high",
      "densitySpectrum": "sparse | balanced | dense",
      "textVsImageEmphasis": "text-heavy | balanced | image-heavy",
      "complexitySpectrum": "minimal | moderate | elaborate",
      "gridAlignmentSpectrum": "strict | flexible | organic",
      "negativeSpaceUsage": "generous | balanced | compact"
    },
    "heroSectionLayout": "Hero composition guidance"
  },
  "components": {
    "buttons": "Button styling philosophy",
    "cards": "Card component guidelines",
    "inputs": "Form input styling",
    "navigation": "Navigation guidelines"
  },
  "graphicElements": {
    "icons": "Icon style (e.g., Lucide, 1.5px stroke)",
    "borderRadius": {
      "none": "0", "sm": "0.25rem", "md": "0.375rem", "lg": "0.5rem", "xl": "0.75rem", "2xl": "1rem", "full": "9999px"
    },
    "shadows": {
      "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)"
    }
  },
  "motion": {
    "philosophy": "Animation philosophy",
    "durations": { "fast": "150ms", "normal": "200ms", "slow": "300ms" },
    "easings": {
      "default": "cubic-bezier(0.4, 0, 0.2, 1)",
      "bounce": "cubic-bezier(0.68, -0.55, 0.265, 1.55)"
    }
  },
  "tailwindConfig": {
    "colors": { "// color tokens for theme.extend.colors": "" },
    "fontFamily": { "heading": ["Font", "fallback"], "body": ["Font", "fallback"] },
    "borderRadius": { "// radius tokens": "" }
  },
  "cssVariables": {
    "light": "--background: 0 0% 100%; --foreground: 222.2 84% 4.9%; ...",
    "dark": "--background: 222.2 84% 4.9%; --foreground: 210 40% 98%; ..."
  }
}
```

---

### Now Generate Brand Guidelines For:

**Brand Name:** [YOUR BRAND NAME]
**Industry:** [YOUR INDUSTRY]
**Target Audience:** [WHO ARE YOUR USERS]
**Personality:** [e.g., Professional, Playful, Luxurious, Technical]
**Mood:** [e.g., Calm, Bold, Elegant, Energetic]
**Inspiration (optional):** [Brands/sites you admire]

Output valid JSON only. No explanations. No markdown code blocks around the JSON.

---

## Quick Examples

### Example 1: SaaS Developer Tool
```
**Brand Name:** CodeFlow
**Industry:** Developer Tools SaaS
**Target Audience:** Software engineers and dev teams
**Personality:** Technical, Clean, Efficient
**Mood:** Professional, Modern, Trustworthy
**Inspiration:** Linear, Vercel, Raycast
```

### Example 2: E-commerce Fashion
```
**Brand Name:** Lumière
**Industry:** Luxury Fashion E-commerce
**Target Audience:** Fashion-conscious professionals, 25-45
**Personality:** Elegant, Sophisticated, Exclusive
**Mood:** Luxurious, Refined, Aspirational
**Inspiration:** Ssense, Net-a-Porter, Matches Fashion
```

### Example 3: Health & Wellness App
```
**Brand Name:** Serenity
**Industry:** Mental Health & Wellness
**Target Audience:** Stressed professionals seeking calm
**Personality:** Calming, Supportive, Trustworthy
**Mood:** Peaceful, Warm, Nurturing
**Inspiration:** Calm, Headspace, Hims
```

### Example 4: Fintech Startup
```
**Brand Name:** NexaPay
**Industry:** Fintech / Payments
**Target Audience:** Small businesses and freelancers
**Personality:** Reliable, Modern, Approachable
**Mood:** Confident, Clear, Forward-thinking
**Inspiration:** Stripe, Mercury, Ramp
```

---

## Using the Output

### 1. Tailwind Config
```javascript
// tailwind.config.js
const brandGuidelines = require('./brand-guidelines.json');

module.exports = {
  theme: {
    extend: {
      colors: brandGuidelines.tailwindConfig.colors,
      fontFamily: brandGuidelines.tailwindConfig.fontFamily,
      borderRadius: brandGuidelines.tailwindConfig.borderRadius,
    },
  },
};
```

### 2. shadcn/ui CSS Variables
```css
/* globals.css */
@layer base {
  :root {
    /* Paste cssVariables.light */
  }
  .dark {
    /* Paste cssVariables.dark */
  }
}
```

### 3. Google Fonts
```html
<!-- Add to <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="[googleFontsUrl from typography.headings]" rel="stylesheet">
<link href="[googleFontsUrl from typography.paragraphs]" rel="stylesheet">
```
