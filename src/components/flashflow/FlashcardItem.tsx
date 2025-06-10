
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards"; 
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type FlashcardData = GenerateFlashcardsOutput["flashcards"][0];

interface FlashcardItemProps {
  flashcard: FlashcardData;
}

export function FlashcardItem({ flashcard }: FlashcardItemProps) {
  return (
    <Card className="w-full min-h-[200px] border flex flex-col justify-between shadow-md"> {/* Added shadow-md */}
      <CardHeader className="pb-3 pt-4 px-4"> {/* Adjusted padding */}
        <CardTitle className="font-semibold text-lg text-foreground">{flashcard.term}</CardTitle> {/* Adjusted size */}
      </CardHeader>
      <CardContent className="space-y-2 text-sm flex-grow px-4 pb-3"> {/* Adjusted padding and text size */}
        <p className="font-sans leading-relaxed">{flashcard.definition}</p>
        {flashcard.example && (
          <>
            <Separator className="my-2" /> {/* Adjusted margin */}
            <div>
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Example:</h4> {/* Adjusted style */}
              <p className="font-sans text-xs italic mt-1">{flashcard.example}</p> {/* Adjusted size */}
            </div>
          </>
        )}
        {flashcard.relatedConcepts && flashcard.relatedConcepts.length > 0 && (
          <>
            <Separator className="my-2" /> {/* Adjusted margin */}
            <div>
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Related Concepts:</h4> {/* Adjusted style */}
              <ul className="list-disc list-inside font-sans text-xs mt-1 space-y-0.5"> {/* Adjusted size and spacing */}
                {flashcard.relatedConcepts.map((concept, index) => (
                  <li key={index}>{concept}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
      {flashcard.agentTag && (
        <CardFooter className="p-3 border-t bg-muted/50"> {/* Adjusted padding and background */}
          <Badge variant="secondary" className="text-xs font-mono">{flashcard.agentTag}</Badge> {/* Used font-mono for tag */}
        </CardFooter>
      )}
    </Card>
  );
}
