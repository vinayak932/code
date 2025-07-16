"use client"

import type React from "react"

import { useState } from "react"
import { useMobile } from "@/hooks/useMobile"
import { MobileNavigation } from "./mobile-navigation"
import { cn } from "@/lib/utils"

interface MobileOptimizedLayoutProps {
  children: React.ReactNode
}

export function MobileOptimizedLayout({ children }: MobileOptimizedLayoutProps) {
  const [currentTab, setCurrentTab] = useState("dashboard")
  const { isNative } = useMobile()

  return (
    <div
      className={cn(
        "min-h-screen",
        isNative ? "pb-20" : "", // Add bottom padding for mobile navigation
        isNative ? "pt-0" : "p-4", // Remove top padding on mobile
      )}
    >
      {isNative && <MobileNavigation currentTab={currentTab} onTabChange={setCurrentTab} />}

      <div className={cn(isNative ? "px-4 py-2" : "", "space-y-4")}>{children}</div>
    </div>
  )
}
