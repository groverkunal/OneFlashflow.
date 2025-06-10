
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlashcardItem } from "./FlashcardItem";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { Play, Pause } from 'lucide-react';

type FlashcardData = GenerateFlashcardsOutput["flashcards"][0];

interface FlashcardViewerProps {
  flashcards: FlashcardData[];
}

const AUTOSCROLL_TICK_MS = 50; // Interval for each scroll step
const SCROLL_PIXELS_PER_TICK = 2; // Pixels to scroll per tick

export function FlashcardViewer({ flashcards }: FlashcardViewerProps) {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userHasScrolledRef = useRef(false);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    setIsAutoScrolling(false);
  }, []);

  const startAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) clearInterval(autoScrollIntervalRef.current);
    userHasScrolledRef.current = false; // Reset user scroll flag

    const container = scrollViewportRef.current;
    if (!container) return;

    // If at the bottom, scroll to top before starting
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) { // -5 for buffer
      container.scrollTop = 0;
    }
    
    setIsAutoScrolling(true);

    autoScrollIntervalRef.current = setInterval(() => {
      if (userHasScrolledRef.current) {
        stopAutoScroll();
        return;
      }
      if (container) {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
          // Reached bottom, scroll to top to loop
          container.scrollTop = 0;
        } else {
          container.scrollTop += SCROLL_PIXELS_PER_TICK;
        }
      }
    }, AUTOSCROLL_TICK_MS);
  }, [stopAutoScroll]);

  const toggleAutoScroll = () => {
    if (isAutoScrolling) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  };

  // Cleanup interval on component unmount or when flashcards change
  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, [stopAutoScroll, flashcards]);

  // Detect manual scroll to pause auto-scroll
  useEffect(() => {
    const container = scrollViewportRef.current;
    const handleManualScroll = () => {
      if (isAutoScrolling) {
        userHasScrolledRef.current = true; // Mark that user scrolled
        stopAutoScroll(); // Stop auto-scroll immediately
      }
    };

    if (container) {
      container.addEventListener('scroll', handleManualScroll, { passive: true });
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleManualScroll);
      }
    };
  }, [isAutoScrolling, stopAutoScroll]);


  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 border rounded-lg bg-card">
        <p className="text-muted-foreground">No flashcards to display.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-card border rounded-lg shadow-sm">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Generated Flashcards ({flashcards.length})</h3>
        <Button
          onClick={toggleAutoScroll}
          disabled={flashcards.length <= 1}
          variant="outline"
          size="sm"
          aria-label={isAutoScrolling ? "Pause auto-scroll" : "Start auto-scroll"}
        >
          {isAutoScrolling ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="ml-2 hidden sm:inline">{isAutoScrolling ? "Pause" : "Play"}</span>
        </Button>
      </div>
      <ScrollArea className="flex-grow" viewportRef={scrollViewportRef}>
        <div className="p-4 space-y-4">
          {flashcards.map((card, index) => (
            <FlashcardItem key={index} flashcard={card} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
