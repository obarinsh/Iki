import { IkigaiSection } from './store'

export interface WisdomQuote {
  text: string
  author: string
}

export const wisdomByPillar: Record<IkigaiSection, WisdomQuote[]> = {
  'love': [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Follow your bliss and the universe will open doors where there were only walls.", author: "Joseph Campbell" },
    { text: "Passion is energy. Feel the power that comes from focusing on what excites you.", author: "Oprah Winfrey" },
    { text: "The heart has its reasons which reason knows nothing of.", author: "Blaise Pascal" },
    { text: "Your time is limited. Don't waste it living someone else's life.", author: "Steve Jobs" },
    { text: "Nothing great in the world was accomplished without passion.", author: "Georg Wilhelm Friedrich Hegel" },
  ],
  'good-at': [
    { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
    { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
    { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "Your talent is God's gift to you. What you do with it is your gift back.", author: "Leo Buscaglia" },
    { text: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
  ],
  'world-needs': [
    { text: "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate.", author: "Ralph Waldo Emerson" },
    { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
    { text: "No one has ever become poor by giving.", author: "Anne Frank" },
    { text: "We make a living by what we get, but we make a life by what we give.", author: "Winston Churchill" },
    { text: "The meaning of life is to find your gift. The purpose of life is to give it away.", author: "Pablo Picasso" },
    { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  ],
  'paid-for': [
    { text: "Choose a job you love, and you will never have to work a day in your life.", author: "Confucius" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Success is not the key to happiness. Happiness is the key to success.", author: "Albert Schweitzer" },
    { text: "Your work is going to fill a large part of your life. The only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
    { text: "Don't aim for success if you want it; just do what you love and believe in, and it will come naturally.", author: "David Frost" },
    { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  ],
}

export const getRandomQuote = (pillar: IkigaiSection): WisdomQuote => {
  const quotes = wisdomByPillar[pillar]
  return quotes[Math.floor(Math.random() * quotes.length)]
}

export const getQuoteForQuestion = (pillar: IkigaiSection, questionIndex: number): WisdomQuote => {
  const quotes = wisdomByPillar[pillar]
  return quotes[questionIndex % quotes.length]
}
