"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Home, TrendingUp, BarChart3, Bell } from "lucide-react"
import { useMobile } from "@/hooks/useMobile"

interface MobileNavigationProps {
  currentTab: string
  onTabChange: (tab: string) => void
}

export function MobileNavigation({ currentTab, onTabChange }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isNative } = useMobile()

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "predictions", label: "AI Predictions", icon: TrendingUp },
    { id: "analysis", label: "Analysis", icon: BarChart3 },
  ]

  if (!isNative) {
    return null // Only show on mobile
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-blue-600">AI Stock Predictor</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="py-4">
                <h2 className="text-lg font-semibold mb-4">Navigation</h2>
                <div className="space-y-2">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Button
                        key={item.id}
                        variant={currentTab === item.id ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => {
                          onTabChange(item.id)
                          setIsOpen(false)
                        }}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2 flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={currentTab === item.id ? "default" : "ghost"}
              size="sm"
              className="flex-col h-auto py-2"
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-4 w-4 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Button>
          )
        })}
      </div>
    </>
  )
}
