"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards"; 
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
      <Card className="w-full min-h-[300px] border flex flex-col justify-between transition-all duration-300 ease-in-out"> {/* Removed shadow-xl, hover:scale, added border */}
        <CardHeader>
          <CardTitle className="font-semibold text-xl text-foreground">{flashcard.term}</CardTitle> {/* Adjusted font, size, and color */}
        </CardHeader>
        <CardContent className="space-y-3 text-md flex-grow"> {/* Adjusted text size */}
          <p className="font-sans">{flashcard.definition}</p> {/* Ensured font-sans */}
          {flashcard.example && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Example:</h4> {/* Adjusted font, size, and color */}
                <p className="font-sans text-sm italic">{flashcard.example}</p> {/* Ensured font-sans */}
              </div>
            </>
          )}
          {flashcard.relatedConcepts && flashcard.relatedConcepts.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground">Related Concepts:</h4> {/* Adjusted font, size, and color */}
                <ul className="list-disc list-inside font-sans text-sm"> {/* Ensured font-sans */}
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
