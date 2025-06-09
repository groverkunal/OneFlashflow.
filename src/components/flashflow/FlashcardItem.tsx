"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards"; // Assuming this is the correct path
import { Separator } from "@/components/ui/separator";

type FlashcardData = GenerateFlashcardsOutput["flashcards"][0];

interface FlashcardItemProps {
  flashcard: FlashcardData;
  isActive: boolean;
}

export function FlashcardItem({ flashcard, isActive }: FlashcardItemProps) {
  const animationClass = isActive ? 'animate-flashcard-slide-in' : 'animate-flashcard-slide-out';

  return (
    <div className={`w-full ${animationClass} ${isActive ? 'opacity-100' : 'opacity-0'}`}>
      <Card className="w-full min-h-[300px] shadow-xl flex flex-col justify-between transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">{flashcard.term}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-lg flex-grow">
          <p className="font-body">{flashcard.definition}</p>
          {flashcard.example && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-md text-accent font-headline">Example:</h4>
                <p className="font-body text-sm italic">{flashcard.example}</p>
              </div>
            </>
          )}
          {flashcard.relatedConcepts && flashcard.relatedConcepts.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-md text-accent font-headline">Related Concepts:</h4>
                <ul className="list-disc list-inside font-body text-sm">
                  {flashcard.relatedConcepts.map((concept, index) => (
                    <li key={index}>{concept}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
