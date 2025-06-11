
"use client";

import React, { useState, useEffect } from 'react';
import type { AgentProfile } from "@/config/agent-profiles";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RotateCcw } from 'lucide-react';

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

  return (
    <div className={`flip-card h-72 w-full ${isFlipped ? 'flipped' : ''}`}>
      <div className="flip-card-inner">
        {/* Front of the card */}
        <div className="flip-card-front">
          <CardHeader className="flex-grow items-center justify-center text-center">
            <agent.icon className="w-12 h-12 text-primary mb-2" />
            <CardTitle className="text-lg font-semibold">{agent.name}</CardTitle>
          </CardHeader>
          <CardFooter className="w-full flex justify-between items-center p-3 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={checkboxId}
                checked={isSelected}
                onCheckedChange={() => onToggleSelected(agent.id)}
                disabled={isLoading}
                aria-labelledby={`${cardId}-title`}
              />
              <Label htmlFor={checkboxId} className="text-sm">Select</Label>
            </div>
            <Button variant="ghost" size="sm" onClick={handleFlip} disabled={isLoading}>
              <RotateCcw className="mr-1 h-4 w-4" /> Flip
            </Button>
          </CardFooter>
        </div>

        {/* Back of the card */}
        <div className="flip-card-back">
          <CardHeader className="pb-2 pt-4 px-4 w-full">
            <CardTitle className="text-md font-semibold">{agent.name} - Role</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow p-4 w-full">
            <Textarea
              value={currentDescription}
              onChange={handleDescriptionTextChange}
              onBlur={handleDescriptionBlur}
              placeholder={`Define ${agent.name}'s role...`}
              className="w-full h-full resize-none text-sm bg-input"
              rows={5}
              disabled={isLoading}
              aria-label={`${agent.name} description`}
            />
          </CardContent>
          <CardFooter className="w-full flex justify-end p-3 border-t">
            <Button variant="ghost" size="sm" onClick={handleFlip} disabled={isLoading}>
              <RotateCcw className="mr-1 h-4 w-4" /> Flip Back
            </Button>
          </CardFooter>
        </div>
      </div>
    </div>
  );
}

