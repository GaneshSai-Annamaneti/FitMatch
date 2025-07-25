"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ScoreDisplayProps {
  score: number;
  className?: string;
}

export function ScoreDisplay({ score, className }: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Basic debounce/throttle to prevent re-renders on fast score changes
    const animation = requestAnimationFrame(() => setDisplayScore(score));
    return () => cancelAnimationFrame(animation);
  }, [score]);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayScore / 100) * circumference;

  let scoreColorClass = "text-destructive";
  if (score >= 75) {
    scoreColorClass = "text-primary";
  } else if (score >= 50) {
    scoreColorClass = "text-accent";
  }

  let strokeColorClass = "stroke-destructive";
  if (score >= 75) {
    strokeColorClass = "stroke-primary";
  } else if (score >= 50) {
    strokeColorClass = "stroke-accent";
  }


  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg className="h-48 w-48 -rotate-90" viewBox="0 0 100 100">
        <circle
          className="stroke-border/50"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          className={cn("transition-all duration-1000 ease-out", strokeColorClass)}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn("text-5xl font-bold font-headline", scoreColorClass)}>
          {Math.round(displayScore)}%
        </span>
        <span className="text-sm font-medium text-muted-foreground">Match Score</span>
      </div>
    </div>
  );
}
