# iKi - Discover Your Ikigai

An AI-powered self-discovery app that helps people find their Ikigai (reason for being) through guided questions and intelligent analysis.

## Overview

iKi guides users through the four pillars of Ikigai:
1. **What You Love** - Activities that energize and excite you
2. **What You're Good At** - Skills and talents you've developed
3. **What The World Needs** - Problems you want to solve
4. **What You Can Be Paid For** - How to create value

The app uses Google Gemini AI to analyze responses and generate personalized insights, career suggestions, and actionable next steps.

---

## User Flow

```
Landing Page
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  PILLAR QUESTIONS (repeat for each of 4 pillars)        │
│                                                          │
│  1. User selects a pillar to start                      │
│  2. Answers 3-4 questions per pillar:                   │
│     - Multi-select with "Add your own" option           │
│     - Spectrum sliders (1-10 scale)                     │
│     - Ranking (drag-and-drop ordering)                  │
│     - Short text responses                              │
│  3. After completing pillar → AI Micro-Insight page     │
│  4. Continue to next pillar or view results             │
└─────────────────────────────────────────────────────────┘
     │
     ▼ (after all 4 pillars complete)
     │
┌─────────────────────────────────────────────────────────┐
│  RESULTS PAGE                                            │
│                                                          │
│  - Animated reveal sequence                             │
│  - Ikigai Statement (screenshot moment)                 │
│  - Interactive Radar Chart with AI-scored pillars       │
│  - Pillar details on hover                              │
│  - 4 Intersections (Passion, Mission, Profession,       │
│    Vocation)                                            │
│  - 3 Career Path suggestions                            │
│  - 3 Weekly Actions                                     │
│  - Blind Spot insight                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Question Types

| Type | Component | Description |
|------|-----------|-------------|
| `multi-select` | `MultiSelectPills` | Grid of options, tap to select (max limit). Includes "Add your own" text input for custom answers. |
| `spectrum` | `SpectrumSliderRefined` | Slider from 1-10 with labeled endpoints |
| `ranking` | `RankingList` | Drag-and-drop ordering. Tap to add items, drag to reorder. |
| `short-text` | `ShortTextRefined` | Free-form text input |

---

## AI Analysis Logic

### Pillar Clarity Scores (Radar Chart)

Each pillar receives two AI-generated scores (1-10):

| Score | Meaning | High Score Indicates | Low Score Indicates |
|-------|---------|---------------------|---------------------|
| `clarityScore` | How well-defined this area is | Clear self-awareness, specific answers, custom inputs | Vague responses, contradictions, uncertainty |
| `potentialScore` | Room for growth | Untapped opportunities, emerging interests | Already maximized, fully developed |

**Scoring factors:**
- Answer depth and specificity
- Custom answers (user-typed = high clarity signal)
- Contradictions between answers (low clarity signal)
- Enthusiasm in word choice

### Prompt Engineering Principles

The AI is instructed to:
- Act as a "world-class career psychologist"
- Find **patterns** across all four pillars
- Prioritize **custom answers** (marked as "their own words")
- Avoid generic phrases ("making a difference", "helping others")
- Write in **plain language** like a smart friend, not a consultant
- Never quote user answers back directly

**Anti-patterns explicitly forbidden:**
- Academic jargon ("systemic avenues", "integrating paradigms")
- Starting with "You mentioned..." or "Based on your answers..."
- Generic blindspots that could apply to anyone

---

## API Endpoints

### `POST /api/analyze`
Full Ikigai analysis after all pillars complete.

**Request:**
```json
{
  "answers": {
    "love": [{ "questionId": "q1", "value": ["option1", "custom:my answer"] }],
    "good-at": [...],
    "world-needs": [...],
    "paid-for": [...]
  }
}
```

**Response:**
```json
{
  "ikigaiStatement": "Your unique purpose statement...",
  "pillars": [
    {
      "id": "love",
      "summary": "Pattern analysis...",
      "keywords": ["creativity", "connection", "flow"],
      "clarityScore": 8.5,
      "potentialScore": 9.0
    }
  ],
  "intersections": [
    { "id": "passion", "description": "Where love meets skill..." }
  ],
  "weeklyActions": [
    { "title": "Action title", "description": "Specific task..." }
  ],
  "careerPaths": [
    { "title": "Career option", "matchReason": "Why it fits...", "firstStep": "Do this first..." }
  ],
  "blindSpot": "Something you might be overlooking..."
}
```

### `POST /api/insight`
Quick micro-insight after completing a single pillar.

**Request:**
```json
{
  "pillarId": "love",
  "answers": [{ "questionId": "q1", "value": ["selected", "custom:typed"] }]
}
```

**Response:**
```json
{
  "insight": "A brief observation about this pillar...",
  "keywords": ["theme1", "theme2"]
}
```

### `GET /api/models`
Debug endpoint to list available Gemini models.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + Inline styles |
| State | Zustand (persisted to localStorage) |
| AI | Google Gemini 2.5 Flash |
| i18n | next-intl (EN, RU, HE with RTL) |
| Fonts | DM Sans, Instrument Serif |

---

## Data Persistence

All user data is stored **locally in the browser** via Zustand persist middleware:
- Storage key: `ikigai-storage-v2`
- No server-side storage
- No user accounts required
- Data persists across sessions until cleared

---

## Key Files

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx          # Landing page
│   │   ├── questions/page.tsx # Question flow
│   │   ├── insight/[pillar]/  # Pillar micro-insight
│   │   └── results/page.tsx   # Full analysis results
│   ├── api/
│   │   ├── analyze/route.ts   # Full AI analysis
│   │   ├── insight/route.ts   # Single pillar insight
│   │   └── models/route.ts    # Debug: list Gemini models
│   ├── globals.css            # Design system CSS
│   └── layout.tsx             # Root layout + fonts
├── lib/
│   ├── store.ts               # Zustand state + types
│   └── questions.ts           # Question definitions
└── components/                 # Reusable UI components
```

---

## Environment Variables

```env
GEMINI_API_KEY=your_google_gemini_api_key
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Add your GEMINI_API_KEY

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## Design System

See `brand-guidelines-prompt-compact.md` for full design specifications including:
- Color palette (warm gradients, coral accents)
- Typography (DM Sans body, Instrument Serif headlines)
- Spacing and layout patterns
- Animation timing

---

## Deployment

Deployed on Vercel. The `maxDuration` config in API routes is set to handle AI response times:
- `/api/analyze`: 60 seconds
- `/api/insight`: 30 seconds
