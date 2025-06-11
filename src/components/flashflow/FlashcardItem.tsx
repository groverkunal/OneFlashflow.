
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import type { GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards"; 
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AGENT_PROFILES, type AgentProfile } from "@/config/agent-profiles";
import { cn } from "@/lib/utils";

type FlashcardData = GenerateFlashcardsOutput["flashcards"][0];

interface FlashcardItemProps {
  flashcard: FlashcardData;
}

export function FlashcardItem({ flashcard }: FlashcardItemProps) {
  const agentIdFromTag = flashcard.agentTag?.startsWith('#') ? flashcard.agentTag.substring(1) : flashcard.agentTag;
  const agentProfile = AGENT_PROFILES.find(agent => agent.id === agentIdFromTag);

  const cardClasses = agentProfile 
    ? cn(agentProfile.bgColorClass, agentProfile.textColorClass, 'shadow-md border-opacity-50') 
    : 'bg-card text-card-foreground shadow-md'; // Fallback to default card styles

  const textClasses = agentProfile ? agentProfile.textColorClass : 'text-card-foreground';
  const mutedTextClasses = agentProfile 
    ? (agentProfile.textColorClass.includes("-50") || agentProfile.textColorClass.includes("-100") ? "text-opacity-70" : "text-opacity-70")
    : "text-muted-foreground";
  
  const separatorClasses = agentProfile
    ? (agentProfile.textColorClass.includes("-900") ? "bg-black/20" : "bg-white/20")
    : "bg-border";

  const badgeVariant = agentProfile 
    ? (agentProfile.textColorClass.includes("-900") ? "outline" : "secondary") 
    : "secondary";
  
  const badgeTextClass = agentProfile
    ? (badgeVariant === "secondary" ? agentProfile.textColorClass : (agentProfile.textColorClass.includes("-900") ? "text-neutral-700" : "text-neutral-200" ))
    : "text-secondary-foreground";


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
              <h4 className={cn("font-semibold text-xs uppercase tracking-wider", mutedTextClasses, textClasses)}>Example:</h4>
              <p className={cn("font-sans text-xs italic mt-1", textClasses)}>{flashcard.example}</p>
            </div>
          </>
        )}
        {flashcard.relatedConcepts && flashcard.relatedConcepts.length > 0 && (
          <>
            <Separator className={cn("my-2", separatorClasses)} />
            <div>
              <h4 className={cn("font-semibold text-xs uppercase tracking-wider", mutedTextClasses, textClasses)}>Related Concepts:</h4>
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
        <CardFooter className={cn("p-3 border-t", 
          agentProfile ? (agentProfile.textColorClass.includes("-900") ? "border-black/20 bg-black/5" : "border-white/20 bg-black/10") : "bg-muted/50 border-border"
        )}>
          <Badge variant={badgeVariant} className={cn("text-xs font-mono", badgeTextClass, 
            badgeVariant === "secondary" && agentProfile ? `${agentProfile.bgColorClass} border-transparent hover:${agentProfile.bgColorClass}` : '',
            badgeVariant === "outline" && agentProfile ? `border-current` : ''
          )}>
            {flashcard.agentTag}
          </Badge>
        </CardFooter>
      )}
    </Card>
  );
}
