"use client";

import React, { useState, useEffect } from 'react';
import { FlashcardItem } from "./FlashcardItem";
import { Button } from "@/components/ui/button";
import { AppProgressBar } from "./AppProgressBar";
import type { GenerateFlashcardsOutput } from "@/ai/flows/generate-flashcards";
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

type FlashcardData = GenerateFlashcardsOutput["flashcards"][0];

interface FlashcardViewerProps {
  flashcards: FlashcardData[];
  onReset: () => void;
}

export function FlashcardViewer({ flashcards, onReset }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 300); // Match animation duration
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setIsAnimating(false);
      }, 300); // Match animation duration
    }
  };
  
  // Effect to handle keydown for navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, flashcards.length]);


  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No flashcards to display.</p>
        <Button onClick={onReset} variant="outline" className="mt-4">
          <RotateCcw className="mr-2 h-4 w-4" /> Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <AppProgressBar currentIndex={currentIndex} totalCount={flashcards.length} />
      
      <div className="w-full max-w-2xl h-[450px] relative overflow-hidden"> {/* Fixed height container for cards */}
        {flashcards.map((card, index) => (
          <div
            key={index}
            className="absolute w-full h-full transition-opacity duration-300 ease-in-out"
            style={{
              opacity: index === currentIndex && !isAnimating ? 1 : 0,
              zIndex: index === currentIndex ? 10 : 1, // Ensure current card is on top
              // transform: `translateX(${(index - currentIndex) * 100}%)`, // Basic slide effect
            }}
          >
            {/* Render only if it's the current card or adjacent for smoother animation pre-render if needed */}
            {(index === currentIndex || (isAnimating && (index === currentIndex -1 || index === currentIndex + 1))) &&
              <FlashcardItem flashcard={card} isActive={index === currentIndex && !isAnimating} />
            }
          </div>
        ))}
      </div>

      <div className="flex justify-between w-full max-w-2xl">
        <Button onClick={handlePrevious} disabled={currentIndex === 0 || isAnimating} variant="outline" size="lg">
          <ChevronLeft className="mr-2 h-5 w-5" /> Previous
        </Button>
        <Button onClick={handleNext} disabled={currentIndex === flashcards.length - 1 || isAnimating} variant="outline" size="lg">
          Next <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
      <Button onClick={onReset} variant="ghost" className="mt-6 text-primary hover:text-primary/80">
        <RotateCcw className="mr-2 h-4 w-4" /> Generate New Flashcards
      </Button>
    </div>
  );
}
