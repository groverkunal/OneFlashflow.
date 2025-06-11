
// src/ai/flows/generate-flashcards.ts
'use server';

/**
 * @fileOverview Generates flashcards from input text using different AI agent roles.
 *
 * - generateFlashcards - A function that orchestrates flashcard generation.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AgentProfileInputSchema = z.object({
  id: z.string().describe('The unique identifier for the agent (e.g., fact-finder).'),
  name: z.string().describe('The display name of the agent (e.g., FactFinder).'),
  description: z.string().describe('The specific role, instructions, and expertise for this AI agent.'),
});

const GenerateFlashcardsInputSchema = z.object({
  text: z.string().describe('The text to generate flashcards from.'),
  agents: z
    .array(AgentProfileInputSchema)
    .describe('A list of AI agent profiles to use for flashcard generation. Each profile includes its ID, name, and role description.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
  term: z.string().describe('The term or concept for the flashcard.'),
  definition: z.string().describe('The definition of the term.'),
  example: z.string().optional().describe('An example of the term in use.'),
  relatedConcepts: z.array(z.string()).optional().describe('Related concepts.'),
  agentTag: z.string().optional().describe("Hashtag of the agent that primarily generated this flashcard (e.g., '#fact-finder').")
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('The generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const flashcardAgentPrompt = ai.definePrompt({
  name: 'flashcardAgentPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are a team of expert AI assistants. Your goal is to create flashcards from the provided text.
Each of you has a specific role and expertise defined below. Please collaborate and leverage your unique perspectives.

Available AI Agents and their roles:
{{#each agents}}
- {{this.name}} (ID: {{this.id}}): {{this.description}}
{{/each}}

When generating a flashcard, identify the primary AI agent whose expertise (as defined above) was most relevant in creating that specific flashcard.
Include this agent's ID as a hashtag in the 'agentTag' field of the flashcard object (e.g., if an agent with id 'fact-finder' was primary, the agentTag should be '#fact-finder').

The flashcards should be clear, concise, and easy to understand. Each flashcard should have a term, a definition, and optionally an example, related concepts, and the agentTag.
Focus on extracting meaningful information based on the roles of the agents you are embodying.

Use the following text to generate the flashcards:
{{{text}}}
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    // Ensure at least one agent is provided, otherwise the prompt might be confusing.
    if (!input.agents || input.agents.length === 0) {
      // Or handle this more gracefully, maybe return empty flashcards or a specific error.
      // For now, let it pass, but the prompt expects agents.
      console.warn("Generating flashcards with no agents specified. This might lead to generic results.");
    }
    const {output} = await flashcardAgentPrompt(input);
    return output!;
  }
);
