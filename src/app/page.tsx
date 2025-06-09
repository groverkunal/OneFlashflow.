
"use client";

import React, { useState, useCallback, useTransition, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { InputArea } from "@/components/flashflow/InputArea";
import { AgentSelector } from "@/components/flashflow/AgentSelector";
import { FlashcardViewer } from "@/components/flashflow/FlashcardViewer";
import { AGENT_PROFILES, type AgentProfile } from "@/config/agent-profiles";
import { generateFlashcards, type GenerateFlashcardsOutput, type GenerateFlashcardsInput } from "@/ai/flows/generate-flashcards";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from 'lucide-react';

type Flashcard = GenerateFlashcardsOutput["flashcards"][0];

// Helper to initialize descriptions from profiles
const getDefaultAgentDescriptions = (): Record<string, string> => {
  return AGENT_PROFILES.reduce((acc, agent) => {
    acc[agent.id] = agent.description;
    return acc;
  }, {} as Record<string, string>);
};


export default function FlashFlowPage() {
  const [textToProcess, setTextToProcess] = useState<string>("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(AGENT_PROFILES.slice(0,3).map(ap => ap.id));
  const [agentDescriptions, setAgentDescriptions] = useState<Record<string, string>>(getDefaultAgentDescriptions());
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [inputAreaKey, setInputAreaKey] = useState(0);

  const handleTextReady = useCallback((text: string) => {
    setTextToProcess(text);
  }, []);

  const handleToggleAgent = useCallback((agentId: string) => {
    setSelectedAgentIds(prev =>
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  }, []);

  const handleAgentDescriptionChange = useCallback((agentId: string, newDescription: string) => {
    setAgentDescriptions(prev => ({
      ...prev,
      [agentId]: newDescription,
    }));
  }, []);

  const handleGenerateFlashcards = async () => {
    if (!textToProcess.trim()) {
      toast({ title: "Input Required", description: "Please provide text to generate flashcards.", variant: "destructive" });
      return;
    }
    if (selectedAgentIds.length === 0) {
      toast({ title: "Agent Required", description: "Please select at least one AI agent.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      try {
        const agentsToPass: GenerateFlashcardsInput['agents'] = selectedAgentIds.map(id => {
          const profile = AGENT_PROFILES.find(p => p.id === id);
          if (!profile) throw new Error(`Agent profile not found for id: ${id}`); // Should not happen
          return {
            id: profile.id,
            name: profile.name,
            description: agentDescriptions[id] || profile.description, // Use edited or default
          };
        });

        const result = await generateFlashcards({ text: textToProcess, agents: agentsToPass });
        if (result.flashcards && result.flashcards.length > 0) {
          setFlashcards(result.flashcards);
          toast({ title: "Success!", description: `Generated ${result.flashcards.length} flashcards.` });
        } else {
          setFlashcards([]);
          toast({ title: "No Flashcards Generated", description: "The AI couldn't generate flashcards. Try different agents or refine your text." });
        }
      } catch (error) {
        console.error("Error generating flashcards:", error);
        toast({ title: "Error", description: "Failed to generate flashcards. Please try again.", variant: "destructive" });
        setFlashcards([]);
      }
    });
  };

  const resetProcess = () => {
    setFlashcards([]);
    setTextToProcess(""); 
    setSelectedAgentIds(AGENT_PROFILES.slice(0,3).map(ap => ap.id)); 
    setAgentDescriptions(getDefaultAgentDescriptions()); // Reset descriptions
    setInputAreaKey(prevKey => prevKey + 1); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background text-foreground font-sans selection:bg-accent selection:text-accent-foreground">
      <header className="w-full py-12 md:py-16 px-4 md:px-8 ">
        <div className="container mx-auto flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-semibold text-foreground">
            FlashFlow
          </h1>
          <p className="mt-3 text-md md:text-lg text-muted-foreground max-w-xl">
            Transform any text into insightful flashcards. Choose your AI agents and start learning smarter.
          </p>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 flex-grow w-full max-w-4xl"> {/* Increased max-width for larger cards */}
        {flashcards.length > 0 && !isPending ? (
          <FlashcardViewer flashcards={flashcards} onReset={resetProcess} />
        ) : (
          <div className="space-y-6">
            <InputArea key={inputAreaKey} onTextReady={handleTextReady} isLoading={isPending} />
            <AgentSelector 
              agents={AGENT_PROFILES} 
              selectedAgents={selectedAgentIds} 
              onToggleAgent={handleToggleAgent}
              agentDescriptions={agentDescriptions}
              onAgentDescriptionChange={handleAgentDescriptionChange}
              isLoading={isPending}
            />
            <Button 
              onClick={handleGenerateFlashcards} 
              disabled={isPending || !textToProcess.trim() || selectedAgentIds.length === 0}
              className="w-full py-3 text-lg rounded-md"
              size="lg"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" /> Create Flashcards
                </>
              )}
            </Button>
          </div>
        )}
      </main>
      <footer className="w-full text-center py-8 px-4 text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} FlashFlow. Unlock Your Learning Potential.</p>
      </footer>
    </div>
  );
}
