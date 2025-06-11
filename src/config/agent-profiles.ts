
import type { LucideIcon } from 'lucide-react';
import { Calculator, Landmark, Newspaper, BookOpenText, Lightbulb, Brain, Wrench, TrendingUp, FlaskConical, ScrollText } from 'lucide-react';

export interface AgentProfile {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  bgColorClass: string;
  textColorClass: string;
}

export const AGENT_PROFILES: AgentProfile[] = [
  { 
    id: 'fact-finder', 
    name: 'FactFinder', 
    description: 'Extracts key facts and figures from the text.', 
    icon: Calculator,
    bgColorClass: 'bg-sky-500',
    textColorClass: 'text-sky-50'
  },
  { 
    id: 'historian', 
    name: 'Historian', 
    description: 'Identifies historical contexts and significant events mentioned.', 
    icon: Landmark,
    bgColorClass: 'bg-emerald-500',
    textColorClass: 'text-emerald-50'
  },
  { 
    id: 'news-hound', 
    name: 'NewsHound', 
    description: 'Connects content to recent news or current developments.', 
    icon: Newspaper,
    bgColorClass: 'bg-violet-500',
    textColorClass: 'text-violet-50'
  },
  { 
    id: 'lexicographer', 
    name: 'Lexicographer', 
    description: 'Defines key terms, vocabulary, and important jargon.', 
    icon: BookOpenText,
    bgColorClass: 'bg-amber-400',
    textColorClass: 'text-amber-900' // Darker text for light yellow
  },
  { 
    id: 'illustrator', 
    name: 'Illustrator', 
    description: 'Provides concrete examples to clarify concepts.', 
    icon: Lightbulb,
    bgColorClass: 'bg-pink-500',
    textColorClass: 'text-pink-50'
  },
  { 
    id: 'analogist', 
    name: 'Analogist', 
    description: 'Creates analogies to explain complex topics simply.', 
    icon: Brain,
    bgColorClass: 'bg-teal-500',
    textColorClass: 'text-teal-50'
  },
  { 
    id: 'pragmatist', 
    name: 'Pragmatist', 
    description: 'Highlights practical applications and real-world uses.', 
    icon: Wrench,
    bgColorClass: 'bg-orange-500',
    textColorClass: 'text-orange-50'
  },
  { 
    id: 'futurist', 
    name: 'Futurist', 
    description: 'Discusses potential implications or future trends related to the content.', 
    icon: TrendingUp,
    bgColorClass: 'bg-indigo-500',
    textColorClass: 'text-indigo-50'
  },
  { 
    id: 'theorist', 
    name: 'Theorist', 
    description: 'Explains underlying theories, principles, or frameworks.', 
    icon: FlaskConical,
    bgColorClass: 'bg-lime-500',
    textColorClass: 'text-lime-900' // Darker text for light lime
  },
  { 
    id: 'summarizer', 
    name: 'Summarizer', 
    description: 'Provides concise summaries of main sections or ideas.', 
    icon: ScrollText,
    bgColorClass: 'bg-rose-500',
    textColorClass: 'text-rose-50'
  },
];
