
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FlashcardItem } from "./FlashcardItem";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { Play, Pause } from 'lucide-react';
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

type FlashcardData = GenerateFlashcardsOutput["flashcards"][0];

interface FlashcardViewerProps {
  flashcards: FlashcardData[];
}

const AUTOSCROLL_TICK_MS = 50; // Interval for each scroll step

export function FlashcardViewer({ flashcards }: FlashcardViewerProps) {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2); // Pixels per tick, initial speed
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userHasScrolledRef = useRef(false);
  const ignoreNextScrollEventRef = useRef(false);

  const stopAutoScroll = useCallback(() => {
    setIsAutoScrolling(false);
    // Interval clearing is handled by useEffect cleanup when isAutoScrolling becomes false
  }, []);

  const startAutoScroll = useCallback(() => {
    const container = scrollViewportRef.current;
    if (!container) return;

    userHasScrolledRef.current = false;

    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 5) {
      ignoreNextScrollEventRef.current = true;
      container.scrollTop = 0;
    }
    setIsAutoScrolling(true);
  }, []);

  const toggleAutoScroll = () => {
    if (isAutoScrolling) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  };

  // Effect to manage the setInterval for auto-scrolling
  useEffect(() => {
    if (!isAutoScrolling) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      return;
    }

    const container = scrollViewportRef.current;
    if (!container) return;

    // Clear any existing interval before setting a new one
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }

    autoScrollIntervalRef.current = setInterval(() => {
      if (userHasScrolledRef.current) {
        stopAutoScroll(); // This will set isAutoScrolling to false and trigger effect cleanup
        return;
      }
      if (container) {
        if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
          ignoreNextScrollEventRef.current = true; // Indicate programmatic scroll
          container.scrollTop = 0; // Loop to top
        } else {
          container.scrollTop += scrollSpeed; // Use current scrollSpeed
        }
      }
    }, AUTOSCROLL_TICK_MS);

    return () => { // Cleanup function for this effect
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [isAutoScrolling, scrollSpeed, stopAutoScroll]);


  // Effect to detect manual scroll and stop auto-scroll
  useEffect(() => {
    const container = scrollViewportRef.current;
    const handleManualScroll = () => {
      if (ignoreNextScrollEventRef.current) {
        ignoreNextScrollEventRef.current = false; // Consume the flag
        return; // Skip processing this scroll event as it was programmatic
      }

      if (isAutoScrolling) { // Only act if auto-scrolling was active
        userHasScrolledRef.current = true; // Mark that user scrolled
        stopAutoScroll(); // Stop auto-scroll immediately, button state will update
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
  }, [isAutoScrolling, stopAutoScroll]); // Dependencies


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
      <div className="px-4 pt-2 pb-3 border-b">
        <Label htmlFor="speed-slider" className="text-xs text-muted-foreground block mb-1">
          Scroll Speed
        </Label>
        <Slider
          id="speed-slider"
          min={1}
          max={10}
          step={1}
          value={[scrollSpeed]}
          onValueChange={(value) => setScrollSpeed(value[0])}
          disabled={flashcards.length <= 1}
          aria-label="Scroll speed control"
        />
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

