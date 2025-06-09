"use client";

import type { AgentProfile } from "@/config/agent-profiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AgentSelectorProps {
  agents: AgentProfile[];
  selectedAgents: string[];
  onToggleAgent: (agentId: string) => void;
  isLoading: boolean;
}

export function AgentSelector({ agents, selectedAgents, onToggleAgent, isLoading }: AgentSelectorProps) {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Choose AI Agents</CardTitle>
        <CardDescription>Select the types of information you want to extract for your flashcards.</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Tooltip key={agent.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor={`agent-${agent.id}`}
                    className={`flex items-center space-x-3 p-4 border rounded-lg hover:border-primary transition-colors cursor-pointer ${selectedAgents.includes(agent.id) ? 'border-primary bg-primary/10' : ''} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Checkbox
                      id={`agent-${agent.id}`}
                      checked={selectedAgents.includes(agent.id)}
                      onCheckedChange={() => onToggleAgent(agent.id)}
                      disabled={isLoading}
                    />
                    <div className="flex items-center space-x-2">
                      <agent.icon className="w-5 h-5 text-primary" />
                      <span className="font-medium">{agent.name}</span>
                    </div>
                  </Label>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p>{agent.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
