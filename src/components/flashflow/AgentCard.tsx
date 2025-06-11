
"use client";

import React, { useState, useEffect } from 'react';
import type { AgentProfile } from "@/config/agent-profiles";
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"; // Card is not used directly
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: AgentProfile;
  isSelected: boolean;
  onToggleSelected: (agentId: string) => void;
  description: string;
  onDescriptionChange: (agentId: string, newDescription: string) => void;
  isLoading: boolean;
}

export function AgentCard({ 
  agent, 
  isSelected, 
  onToggleSelected, 
  description, 
  onDescriptionChange,
  isLoading 
}: AgentCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentDescription, setCurrentDescription] = useState(description);

  useEffect(() => {
    setCurrentDescription(description);
  }, [description]);

  const handleFlip = () => {
    if (isLoading) return;
    setIsFlipped(!isFlipped);
  };

  const handleDescriptionTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentDescription(event.target.value);
  };

  const handleDescriptionBlur = () => {
    onDescriptionChange(agent.id, currentDescription);
  };
  
  const cardId = `agent-card-${agent.id}`;
  const checkboxId = `agent-checkbox-${agent.id}`;

  const cardClasses = cn(
    agent.bgColorClass, 
    agent.textColorClass,
    'border-opacity-50' // Make border slightly less prominent on colored cards
  );

  const buttonTextClass = agent.textColorClass.includes("50") || agent.textColorClass.includes("100") ? "text-neutral-800 hover:text-neutral-900" : "text-white hover:text-neutral-200";
  const buttonBgClass = agent.textColorClass.includes("50") || agent.textColorClass.includes("100") ? "hover:bg-black/10" : "hover:bg-white/10";

  const inputBgClass = agent.textColorClass.includes("50") || agent.textColorClass.includes("100") ? "bg-white/70 text-neutral-900 placeholder:text-neutral-500" : "bg-black/20 text-white placeholder:text-neutral-300";


  return (
    <div className={`flip-card h-72 w-full ${isFlipped ? 'flipped' : ''}`}>
      <div className="flip-card-inner">
        {/* Front of the card */}
        <div className={cn("flip-card-front", cardClasses)}>
          <CardHeader className="flex-grow items-center justify-center text-center">
            <agent.icon className={cn("w-12 h-12 mb-2", agent.textColorClass)} />
            <CardTitle className={cn("text-lg font-semibold", agent.textColorClass)}>{agent.name}</CardTitle>
          </CardHeader>
          <CardFooter className={cn("w-full flex justify-between items-center p-3 border-t", agent.textColorClass.includes("900") ? "border-black/20" : "border-white/20")}>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={checkboxId}
                checked={isSelected}
                onCheckedChange={() => onToggleSelected(agent.id)}
                disabled={isLoading}
                aria-labelledby={`${cardId}-title`}
                className={cn(
                  agent.textColorClass.includes("900") ? "border-neutral-700 data-[state=checked]:bg-neutral-700 data-[state=checked]:text-white" : "border-neutral-200 data-[state=checked]:bg-neutral-200 data-[state=checked]:text-neutral-800"
                )}
              />
              <Label htmlFor={checkboxId} className={cn("text-sm", agent.textColorClass)}>Select</Label>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleFlip} 
              disabled={isLoading}
              className={cn(buttonTextClass, buttonBgClass)}
            >
              <RotateCcw className="mr-1 h-4 w-4" /> Flip
            </Button>
          </CardFooter>
        </div>

        {/* Back of the card */}
        <div className={cn("flip-card-back", cardClasses)}>
          <CardHeader className="pb-2 pt-4 px-4 w-full">
            <CardTitle className={cn("text-md font-semibold", agent.textColorClass)}>{agent.name} - Role</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-4 w-full">
            <Textarea
              value={currentDescription}
              onChange={handleDescriptionTextChange}
              onBlur={handleDescriptionBlur}
              placeholder={`Define ${agent.name}'s role...`}
              className={cn("w-full h-full resize-none text-sm border-none ring-0 focus:ring-0 focus-visible:ring-0", inputBgClass)}
              rows={5}
              disabled={isLoading}
              aria-label={`${agent.name} description`}
            />
          </CardContent>
          <CardFooter className={cn("w-full flex justify-end p-3 border-t", agent.textColorClass.includes("900") ? "border-black/20" : "border-white/20")}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleFlip} 
              disabled={isLoading}
              className={cn(buttonTextClass, buttonBgClass)}
            >
              <RotateCcw className="mr-1 h-4 w-4" /> Flip Back
            </Button>
          </CardFooter>
        </div>
      </div>
    </div>
  );
}
