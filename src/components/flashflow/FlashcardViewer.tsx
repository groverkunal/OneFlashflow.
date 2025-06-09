
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FlashcardItem } from "./FlashcardItem";
import { Button } from "@/components/ui/button";
import { AppProgressBar } from "./AppProgressBar";
import type { GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { ChevronLeft, ChevronRight, RotateCcw, Play, Pause } from 'lucide-react';

type FlashcardData = GenerateFlashcardsOutput["flashcards"][0];

interface FlashcardViewerProps {
  flashcards: FlashcardData[];
  onReset: () => void;
}

const AUTOSCROLL_INTERVAL_MS = 5000; // 5 seconds

export function FlashcardViewer({ flashcards, onReset }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Function to advance to the next card, used by auto-scroll
  const autoAdvance = useCallback(() => {
    if (isAnimating) return; // Don't advance if already animating
    if (currentIndex < flashcards.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 300); // Match animation duration
    } else {
      // Reached the end during auto-scroll
      setIsAutoScrolling(false);
    }
  }, [currentIndex, flashcards.length, isAnimating]);

  // Manual navigation: Next
  const handleNextManual = useCallback(() => {
    if (isAnimating) return;
    setIsAutoScrolling(false); // Stop auto-scroll on manual interaction
    if (currentIndex < flashcards.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  }, [currentIndex, flashcards.length, isAnimating]);

  // Manual navigation: Previous
  const handlePreviousManual = useCallback(() => {
    if (isAnimating) return;
    setIsAutoScrolling(false); // Stop auto-scroll on manual interaction
    if (currentIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  }, [currentIndex, isAnimating]);
  
  // Effect to handle keydown for navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        handleNextManual();
      } else if (event.key === 'ArrowLeft') {
        handlePreviousManual();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleNextManual, handlePreviousManual]);

  // Auto-scroll effect
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isAutoScrolling && flashcards.length > 0 && !isAnimating) {
      if (currentIndex < flashcards.length - 1) {
        timerId = setTimeout(autoAdvance, AUTOSCROLL_INTERVAL_MS);
      } else {
        // Reached the end, stop auto-scrolling
        setIsAutoScrolling(false);
      }
    }
    return () => clearTimeout(timerId);
  }, [isAutoScrolling, currentIndex, flashcards.length, autoAdvance, isAnimating]);


  const toggleAutoScroll = () => {
    if (isAnimating) return;
    setIsAutoScrolling(prevIsAutoScrolling => {
      const newIsAutoScrolling = !prevIsAutoScrolling;
      if (newIsAutoScrolling && currentIndex === flashcards.length - 1 && flashcards.length > 0) {
        // If at the end and turning ON auto-scroll, restart from the beginning
        setCurrentIndex(0); 
        // The auto-scroll useEffect will pick this up and start.
      }
      return newIsAutoScrolling;
    });
  };

  const handleResetViewer = () => {
    setIsAutoScrolling(false);
    setCurrentIndex(0);
    onReset(); // Call the original reset passed via props
  };

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No flashcards to display.</p>
        <Button onClick={handleResetViewer} variant="outline" className="mt-4">
          <RotateCcw className="mr-2 h-4 w-4" /> Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <AppProgressBar currentIndex={currentIndex} totalCount={flashcards.length} />
      
      <div className="w-full max-w-2xl h-[450px] relative overflow-hidden">
        {flashcards.map((card, index) => (
          <div
            key={index}
            className="absolute w-full h-full transition-opacity duration-300 ease-in-out"
            style={{
              opacity: index === currentIndex && !isAnimating ? 1 : 0,
              zIndex: index === currentIndex ? 10 : 1,
            }}
          >
            {/* Render current card, and adjacent cards during animation for smoother transitions */}
            {(index === currentIndex || (isAnimating && (index === currentIndex -1 || index === currentIndex + 1))) &&
              <FlashcardItem flashcard={card} isActive={index === currentIndex && !isAnimating} />
            }
          </div>
        ))}
      </div>

      <div className="flex justify-around items-center w-full max-w-2xl">
        <Button onClick={handlePreviousManual} disabled={currentIndex === 0 || isAnimating} variant="outline" size="lg">
          <ChevronLeft className="mr-2 h-5 w-5" /> Previous
        </Button>
        
        <Button 
          onClick={toggleAutoScroll} 
          disabled={isAnimating || flashcards.length <= 1} 
          variant="outline" 
          size="lg" 
          aria-label={isAutoScrolling ? "Pause auto-scroll" : "Start auto-scroll"}
          className="min-w-[120px] sm:min-w-[140px]" // Adjusted min-width
        >
          {isAutoScrolling ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          <span className="ml-2 hidden sm:inline">{isAutoScrolling ? "Pause" : "Play"}</span>
        </Button>

        <Button onClick={handleNextManual} disabled={currentIndex === flashcards.length - 1 || isAnimating} variant="outline" size="lg">
          Next <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
      <Button onClick={handleResetViewer} variant="ghost" className="mt-6 text-primary hover:text-primary/80">
        <RotateCcw className="mr-2 h-4 w-4" /> Generate New Flashcards
      </Button>
    </div>
  );
}
