"use client";

import { Progress } from "@/components/ui/progress";

interface AppProgressBarProps {
  currentIndex: number;
  totalCount: number;
}

export function AppProgressBar({ currentIndex, totalCount }: AppProgressBarProps) {
  if (totalCount === 0) return null;
  const progressValue = ((currentIndex + 1) / totalCount) * 100;

  return (
    <div className="w-full my-4">
      <Progress value={progressValue} className="w-full h-2" />
      <p className="text-sm text-muted-foreground mt-1 text-center">
        Card {currentIndex + 1} of {totalCount}
      </p>
    </div>
  );
}
