"use client"

import * as React from "react"
import { Check, Laptop, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative glass-card hover:bg-hover transition-all">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 glass-dropdown p-2 rounded-xl border border-border/80 shadow-xl">
        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
          Light Themes
        </DropdownMenuLabel>
        
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all",
            mounted && theme === "light" && "bg-accent font-medium text-accent-foreground"
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-[#F8FAFC] border border-slate-300 shadow-xs flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            </span>
            <span className="text-sm">Classic White</span>
          </div>
          {mounted && theme === "light" && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("light-warm")}
          className={cn(
            "flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all",
            mounted && theme === "light-warm" && "bg-accent font-medium text-accent-foreground"
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-[#F5EFAE] border border-[#DDD17E] shadow-xs flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
            </span>
            <span className="text-sm">Warm Cream</span>
          </div>
          {mounted && theme === "light-warm" && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5 bg-border/60" />

        <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5">
          Dark Themes
        </DropdownMenuLabel>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all",
            mounted && theme === "dark" && "bg-accent font-medium text-accent-foreground"
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-[#0B1120] border border-slate-700 shadow-xs flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            </span>
            <span className="text-sm">Blue Dark</span>
          </div>
          {mounted && theme === "dark" && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark-midnight")}
          className={cn(
            "flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all",
            mounted && theme === "dark-midnight" && "bg-accent font-medium text-accent-foreground"
          )}
        >
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-[#0A1426] border border-[#1D3354] shadow-xs flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
            </span>
            <span className="text-sm">Midnight Navy</span>
          </div>
          {mounted && theme === "dark-midnight" && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1.5 bg-border/60" />

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all",
            mounted && theme === "system" && "bg-accent font-medium text-accent-foreground"
          )}
        >
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Laptop className="w-4 h-4" />
            <span className="text-sm text-foreground">System Preference</span>
          </div>
          {mounted && theme === "system" && <Check className="w-4 h-4 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
