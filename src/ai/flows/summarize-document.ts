// Summarize the contents of a document into flashcards.
'use server';
/**
 * @fileOverview Summarizes a document into flashcards.
 *
 * - summarizeDocument - A function that summarizes the text in the document into flashcards.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeDocumentInputSchema = z.object({
  text: z.string().describe('The text content of the document to summarize.'),
});
export type SummarizeDocumentInput = z.infer<typeof SummarizeDocumentInputSchema>;

const FlashcardSchema = z.object({
  title: z.string().describe('The title of the flashcard.'),
  content: z.string().describe('The content of the flashcard.'),
});

const SummarizeDocumentOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of flashcards summarizing the document.'),
});
export type SummarizeDocumentOutput = z.infer<typeof SummarizeDocumentOutputSchema>;

export async function summarizeDocument(input: SummarizeDocumentInput): Promise<SummarizeDocumentOutput> {
  return summarizeDocumentFlow(input);
}

const summarizeDocumentPrompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: {schema: SummarizeDocumentInputSchema},
  output: {schema: SummarizeDocumentOutputSchema},
  prompt: `You are an expert at summarizing documents into flashcards.

  Given the following document text, create a series of flashcards that summarize the key points.

  Document Text:
  {{text}}

  Each flashcard should have a title and content that accurately reflects the main ideas from the document.
  Return a JSON object with an array of flashcards.
  `,
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async input => {
    const {output} = await summarizeDocumentPrompt(input);
    return output!;
  }
);
