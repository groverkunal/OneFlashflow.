
"use client";

import type { AgentProfile } from "@/config/agent-profiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AgentCard } from "./AgentCard"; // New import

interface AgentSelectorProps {
  agents: AgentProfile[];
  selectedAgents: string[]; // Array of agent IDs
  onToggleAgent: (agentId: string) => void;
  agentDescriptions: Record<string, string>; // Agent ID -> description
  onAgentDescriptionChange: (agentId: string, newDescription: string) => void;
  isLoading: boolean;
}

export function AgentSelector({ 
  agents, 
  selectedAgents, 
  onToggleAgent, 
  agentDescriptions, 
  onAgentDescriptionChange,
  isLoading 
}: AgentSelectorProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-semibold text-xl">Customize & Choose AI Agents</CardTitle>
        <CardDescription>Select agents and optionally edit their roles for tailored flashcard generation.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgents.includes(agent.id)}
              onToggleSelected={onToggleAgent}
              description={agentDescriptions[agent.id] || agent.description}
              onDescriptionChange={onAgentDescriptionChange}
              isLoading={isLoading}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
