import type { LucideIcon } from 'lucide-react';
import { Calculator, Landmark, Newspaper, BookOpenText, Lightbulb, Brain, Wrench, TrendingUp, FlaskConical, ScrollText, Palette } from 'lucide-react';

export interface AgentProfile {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const AGENT_PROFILES: AgentProfile[] = [
  { id: 'fact-finder', name: 'FactFinder', description: 'Extracts key facts and figures from the text.', icon: Calculator },
  { id: 'historian', name: 'Historian', description: 'Identifies historical contexts and significant events mentioned.', icon: Landmark },
  { id: 'news-hound', name: 'NewsHound', description: 'Connects content to recent news or current developments.', icon: Newspaper },
  { id: 'lexicographer', name: 'Lexicographer', description: 'Defines key terms, vocabulary, and important jargon.', icon: BookOpenText },
  { id: 'illustrator', name: 'Illustrator', description: 'Provides concrete examples to clarify concepts.', icon: Lightbulb },
  { id: 'analogist', name: 'Analogist', description: 'Creates analogies to explain complex topics simply.', icon: Brain },
  { id: 'pragmatist', name: 'Pragmatist', description: 'Highlights practical applications and real-world uses.', icon: Wrench },
  { id: 'futurist', name: 'Futurist', description: 'Discusses potential implications or future trends related to the content.', icon: TrendingUp },
  { id: 'theorist', name: 'Theorist', description: 'Explains underlying theories, principles, or frameworks.', icon: FlaskConical },
  { id: 'summarizer', name: 'Summarizer', description: 'Provides concise summaries of main sections or ideas.', icon: ScrollText },
];
