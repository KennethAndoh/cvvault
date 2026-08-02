"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Layout, BookOpen, ExternalLink, Star, Code2, Link2 } from "lucide-react";
import { PortfolioItem } from "./PortfolioEditor";

interface PortfolioShowcaseProps {
  items: PortfolioItem[];
}

export function PortfolioShowcase({ items = [] }: PortfolioShowcaseProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <Code2 className="h-5 w-5 text-primary" />
        Portfolios & Artifact Showcase
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => {
          const isGithub = item.type === "github";
          const isFigma = item.type === "figma";
          const isPub = item.type === "publication";

          return (
            <Card
              key={item.id}
              className="hover:border-primary/50 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md"
            >
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        {isGithub && <Github className="h-5 w-5 text-slate-800 dark:text-slate-100" />}
                        {isFigma && <Layout className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                        {isPub && <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                        {!isGithub && !isFigma && !isPub && <Link2 className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-bold text-sm truncate" title={item.title}>
                          {item.title}
                        </h3>
                        <Badge variant="outline" className="text-[10px] uppercase py-0 px-1.5 border-primary/20">
                          {item.type}
                        </Badge>
                      </div>
                    </div>

                    <Button asChild size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" title="Open Link">
                        <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                      </a>
                    </Button>
                  </div>

                  {item.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-3">
                      {item.description}
                    </p>
                  )}

                  {isPub && (item.authors || item.publisher) && (
                    <div className="mt-3 text-[11px] text-muted-foreground bg-muted/30 p-2 rounded border border-border/50">
                      {item.authors && <p><strong className="text-foreground">Authors:</strong> {item.authors}</p>}
                      {item.publisher && <p><strong className="text-foreground">Publisher:</strong> {item.publisher}</p>}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60 text-xs">
                  {item.language && (
                    <span className="font-semibold text-xs flex items-center gap-1.5 text-foreground">
                      <span className="h-2 w-2 rounded-full bg-primary inline-block" />
                      {item.language}
                    </span>
                  )}

                  {item.stars !== undefined && item.stars > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      {item.stars} stars
                    </span>
                  )}

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-medium hover:underline flex items-center gap-1 ml-auto"
                  >
                    View Showcase <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
