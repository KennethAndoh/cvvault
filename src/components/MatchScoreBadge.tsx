"use client";

import React, { useState, useEffect } from "react";
import { Zap, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { calculateCandidateJobMatch, JobMatchResult } from "@/app/actions/match-score";
import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  candidateId: string;
  jobId: string;
  initialScore?: number;
  compact?: boolean;
  className?: string;
}

export function MatchScoreBadge({
  candidateId,
  jobId,
  initialScore,
  compact = false,
  className,
}: MatchScoreBadgeProps) {
  const [match, setMatch] = useState<JobMatchResult | null>(
    initialScore
      ? {
          score: initialScore,
          tier: initialScore >= 85 ? "Exceptional" : initialScore >= 70 ? "Strong" : "Moderate",
          matchingSkills: [],
          missingSkills: [],
          verifiedDocsCount: 1,
          bonusPoints: 10,
        }
      : null
  );
  const [loading, setLoading] = useState(!initialScore);

  useEffect(() => {
    if (!initialScore && candidateId && jobId) {
      setLoading(true);
      calculateCandidateJobMatch(candidateId, jobId).then((res) => {
        if (res.success && res.match) {
          setMatch(res.match);
        }
        setLoading(false);
      });
    }
  }, [candidateId, jobId, initialScore]);

  if (loading) {
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground animate-pulse", className)}>
        <Sparkles className="h-3 w-3 animate-spin text-primary" />
        <span>Calculating match...</span>
      </div>
    );
  }

  if (!match) return null;

  const isExceptional = match.score >= 85;
  const isStrong = match.score >= 70;

  return (
    <div
      className={cn(
        "group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-2xs border cursor-pointer transition-all duration-300 hover:scale-105",
        isExceptional
          ? "bg-linear-to-r from-emerald-500/15 via-teal-500/15 to-sky-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
          : isStrong
          ? "bg-linear-to-r from-sky-500/15 to-blue-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        className
      )}
      title={`AI Candidate Match Score: ${match.score}%`}
    >
      <Zap className="h-3.5 w-3.5 fill-current shrink-0" />
      <span>{match.score}% Match</span>

      {/* Expanded Hover Tooltip */}
      {!compact && (
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 text-white rounded-xl shadow-xl text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 space-y-1.5 border border-slate-700">
          <div className="font-bold flex items-center justify-between border-b border-slate-800 pb-1">
            <span className="text-sky-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Fit Rating
            </span>
            <span className="text-emerald-400 font-extrabold">{match.tier}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Verified Credentials:</span>
            <span className="font-bold text-white flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-400" /> {match.verifiedDocsCount} Docs
            </span>
          </div>

          {match.matchingSkills && match.matchingSkills.length > 0 && (
            <div>
              <span className="text-slate-400 block mb-0.5">Matching Requirements:</span>
              <div className="flex gap-1 flex-wrap">
                {match.matchingSkills.slice(0, 4).map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-semibold">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
