"use client";

import React, { useState, useCallback, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { InputArea } from "@/components/flashflow/InputArea";
import { AgentSelector } from "@/components/flashflow/AgentSelector";
import { FlashcardViewer } from "@/components/flashflow/FlashcardViewer";
import { AGENT_PROFILES, type AgentProfile } from "@/config/agent-profiles";
import { generateFlashcards, type GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from 'lucide-react';

type Flashcard = GenerateFlashcardsOutput["flashcards"][0];

export default function FlashFlowPage() {
  const [textToProcess, setTextToProcess] = useState<string>("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(AGENT_PROFILES.slice(0,3).map(ap => ap.id)); // Default to first 3 agents
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleTextReady = useCallback((text: string) => {
    setTextToProcess(text);
  }, []);

  const handleToggleAgent = useCallback((agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId) ? prev.filter(id => id !== agentId) : [...prev, agentId]
    );
  }, []);

  const handleGenerateFlashcards = async () => {
    if (!textToProcess.trim()) {
      toast({ title: "Input Required", description: "Please provide text to generate flashcards.", variant: "destructive" });
      return;
    }
    if (selectedAgents.length === 0) {
      toast({ title: "Agent Required", description: "Please select at least one AI agent.", variant: "destructive" });
      return;
    }

    startTransition(async () => {
      try {
        const result = await generateFlashcards({ text: textToProcess, agents: selectedAgents });
        if (result.flashcards && result.flashcards.length > 0) {
          setFlashcards(result.flashcards);
          toast({ title: "Success!", description: `Generated ${result.flashcards.length} flashcards.` });
        } else {
          setFlashcards([]);
          toast({ title: "No Flashcards Generated", description: "The AI couldn't generate flashcards from the provided text or selected agents. Try different agents or refine your text." });
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
    // Optionally reset text and agents:
    // setTextToProcess("");
    // setSelectedAgents(AGENT_PROFILES.slice(0,3).map(ap => ap.id));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-background to-purple-50 dark:from-background dark:to-purple-950 text-foreground font-body selection:bg-accent selection:text-accent-foreground">
      <header className="w-full py-8 px-4 md:px-8 ">
        <div className="container mx-auto flex flex-col items-center text-center">
          <Sparkles className="w-16 h-16 text-primary mb-2" />
          <h1 className="text-5xl md:text-6xl font-headline text-primary">
            FlashFlow
          </h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-xl">
            Transform any text into insightful flashcards. Choose your AI agents and start learning smarter.
          </p>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 flex-grow w-full max-w-4xl">
        {flashcards.length > 0 && !isPending ? (
          <FlashcardViewer flashcards={flashcards} onReset={resetProcess} />
        ) : (
          <div className="space-y-8">
            <InputArea onTextReady={handleTextReady} isLoading={isPending} />
            <AgentSelector 
              agents={AGENT_PROFILES} 
              selectedAgents={selectedAgents} 
              onToggleAgent={handleToggleAgent}
              isLoading={isPending}
            />
            <Button 
              onClick={handleGenerateFlashcards} 
              disabled={isPending || !textToProcess.trim() || selectedAgents.length === 0}
              className="w-full py-3 text-lg rounded-lg shadow-md hover:shadow-lg transition-shadow bg-primary hover:bg-primary/90"
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
      <footer className="w-full text-center py-6 px-4 text-sm text-muted-foreground border-t border-border/50">
        <p>&copy; {new Date().getFullYear()} FlashFlow. Unlock Your Learning Potential.</p>
      </footer>
    </div>
  );
}
