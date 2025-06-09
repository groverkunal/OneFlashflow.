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

const GenerateFlashcardsInputSchema = z.object({
  text: z.string().describe('The text to generate flashcards from.'),
  agents: z
    .array(z.string())
    .optional()
    .describe('A list of agent types to use for flashcard generation.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
  term: z.string().describe('The term or concept for the flashcard.'),
  definition: z.string().describe('The definition of the term.'),
  example: z.string().optional().describe('An example of the term in use.'),
  relatedConcepts: z.array(z.string()).optional().describe('Related concepts.'),
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
  prompt: `You are a helpful AI assistant who generates flashcards from text.

        Your goal is to create flashcards with key definitions, examples, and related concepts to help the user study and understand the material better.

        The flashcards should be clear, concise, and easy to understand. Each flashcard should have a term, a definition, and optionally an example and related concepts.

        Use the following text to generate the flashcards:
        {{text}}`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await flashcardAgentPrompt(input);
    return output!;
  }
);
