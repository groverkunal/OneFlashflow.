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
    <Card className="w-full"> {/* Removed shadow-lg */}
      <CardHeader>
        <CardTitle className="font-semibold text-xl">Choose AI Agents</CardTitle> {/* Adjusted font-headline and text size */}
        <CardDescription>Select the types of information you want to extract for your flashcards.</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"> {/* Reduced gap */}
            {agents.map((agent) => (
              <Tooltip key={agent.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Label
                    htmlFor={`agent-${agent.id}`}
                    className={`flex items-center space-x-3 p-3 border rounded-md hover:border-accent transition-colors cursor-pointer ${selectedAgents.includes(agent.id) ? 'border-accent bg-accent/10' : 'border-border'} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} /* Adjusted padding, border, hover, selected states */
                  >
                    <Checkbox
                      id={`agent-${agent.id}`}
                      checked={selectedAgents.includes(agent.id)}
                      onCheckedChange={() => onToggleAgent(agent.id)}
                      disabled={isLoading}
                    />
                    <div className="flex items-center space-x-2">
                      <agent.icon className="w-4 h-4 text-primary" /> {/* Slightly smaller icon */}
                      <span className="font-medium text-sm">{agent.name}</span> {/* Slightly smaller text */}
                    </div>
                  </Label>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p className="text-xs">{agent.description}</p> {/* Smaller tooltip text */}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
