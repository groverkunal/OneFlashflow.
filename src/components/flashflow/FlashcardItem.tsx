
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards"; 
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AGENT_PROFILES } from "@/config/agent-profiles"; // Removed type AgentProfile as it's not directly used here
import { cn } from "@/lib/utils";

type FlashcardData = GenerateFlashcardsOutput["flashcards"][0];

interface FlashcardItemProps {
  flashcard: FlashcardData;
}

export function FlashcardItem({ flashcard }: FlashcardItemProps) {
  const agentIdFromTag = flashcard.agentTag?.startsWith('#') ? flashcard.agentTag.substring(1) : flashcard.agentTag;
  const agentProfile = AGENT_PROFILES.find(agent => agent.id === agentIdFromTag);

  // Apply agent's background and text color. Removed 'border-opacity-50'.
  const cardClasses = agentProfile 
    ? cn(agentProfile.bgColorClass, agentProfile.textColorClass, 'shadow-md') 
    : 'bg-card text-card-foreground shadow-md'; // Fallback to default card styles

  // Heuristic for text color to adjust internal elements
  const isDarkTextOnLightCard = agentProfile ? agentProfile.textColorClass.includes("-900") : false; // Default to false if no profile (standard card)

  const textClasses = agentProfile ? agentProfile.textColorClass : 'text-card-foreground';
  
  // Muted text for headers like "Example:", make it slightly less prominent
  const mutedHeaderClasses = cn(textClasses, "opacity-80"); // Adjusted opacity

  const separatorClasses = agentProfile
    ? (isDarkTextOnLightCard ? "bg-black/15" : "bg-white/15") // Slightly less prominent separators
    : "bg-border";

  // Badge styling
  const badgeWrapperFooterClasses = agentProfile 
    ? (isDarkTextOnLightCard ? "border-black/10 bg-black/5" : "border-white/10 bg-black/10") 
    : "bg-muted/50 border-border";
  
  let badgeFinalClasses = "text-xs font-mono";
  if (agentProfile) {
    if (isDarkTextOnLightCard) { // Dark text on Light Card (e.g., amber)
      badgeFinalClasses = cn(badgeFinalClasses, agentProfile.textColorClass, "border", "border-current", "bg-transparent"); // Outline style
    } else { // Light text on Dark Card (e.g., sky)
      // Badge blends with card background, text uses agent's text color
      badgeFinalClasses = cn(badgeFinalClasses, agentProfile.textColorClass, "bg-transparent"); 
    }
  } else { // Default badge for cards without agent profile
    badgeFinalClasses = cn(badgeFinalClasses, "bg-secondary text-secondary-foreground border-transparent");
  }


  return (
    <Card className={cn("w-full min-h-[200px] border flex flex-col justify-between", cardClasses)}>
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className={cn("font-semibold text-lg", textClasses)}>{flashcard.term}</CardTitle>
      </CardHeader>
      <CardContent className={cn("space-y-2 text-sm flex-grow px-4 pb-3", textClasses)}>
        <p className="font-sans leading-relaxed">{flashcard.definition}</p>
        {flashcard.example && (
          <>
            <Separator className={cn("my-2", separatorClasses)} />
            <div>
              <h4 className={cn("font-semibold text-xs uppercase tracking-wider", mutedHeaderClasses)}>Example:</h4>
              <p className={cn("font-sans text-xs italic mt-1", textClasses)}>{flashcard.example}</p>
            </div>
          </>
        )}
        {flashcard.relatedConcepts && flashcard.relatedConcepts.length > 0 && (
          <>
            <Separator className={cn("my-2", separatorClasses)} />
            <div>
              <h4 className={cn("font-semibold text-xs uppercase tracking-wider", mutedHeaderClasses)}>Related Concepts:</h4>
              <ul className={cn("list-disc list-inside font-sans text-xs mt-1 space-y-0.5", textClasses)}>
                {flashcard.relatedConcepts.map((concept, index) => (
                  <li key={index}>{concept}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
      {flashcard.agentTag && (
        <CardFooter className={cn("p-3 border-t", badgeWrapperFooterClasses)}>
          <Badge variant="outline" /* Variant prop might be overridden by cn() */ className={badgeFinalClasses}>
            {flashcard.agentTag}
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
}
