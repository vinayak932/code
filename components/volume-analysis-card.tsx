"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react"

interface VolumeAnalysisCardProps {
  symbol: string
}

export function VolumeAnalysisCard({ symbol }: VolumeAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/volume-analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol }),
        })
        const data = await response.json()
        setAnalysis(data.analysis)
      } catch (error) {
        console.error("Error fetching volume analysis:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
    const interval = setInterval(fetchAnalysis, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [symbol])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Volume Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) return null

  const getVolumeSignal = (ratio: number) => {
    if (ratio > 2) return { label: "VERY HIGH", color: "text-red-600 bg-red-50" }
    if (ratio > 1.5) return { label: "HIGH", color: "text-orange-600 bg-orange-50" }
    if (ratio > 0.8) return { label: "NORMAL", color: "text-green-600 bg-green-50" }
    return { label: "LOW", color: "text-gray-600 bg-gray-50" }
  }

  const volumeSignal = getVolumeSignal(analysis.volumeRatio)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Volume Analysis
          </div>
          <Badge className={volumeSignal.color}>{volumeSignal.label}</Badge>
        </CardTitle>
        <CardDescription>Trading volume and liquidity analysis</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Volume Ratio */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Volume vs Average</span>
            <span className="text-sm font-bold">{analysis.volumeRatio.toFixed(2)}x</span>
          </div>
          <Progress value={Math.min(analysis.volumeRatio * 50, 100)} className="h-2" />
        </div>

        {/* Current vs Average Volume */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Current Volume</span>
            <p className="font-semibold">{(analysis.currentVolume / 1000000).toFixed(2)}M</p>
          </div>
          <div>
            <span className="text-gray-600">Average Volume</span>
            <p className="font-semibold">{(analysis.avgVolume / 1000000).toFixed(2)}M</p>
          </div>
        </div>

        {/* Volume Trend */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {analysis.volumeTrend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm">Volume Trend</span>
          </div>
          <Badge variant={analysis.volumeTrend > 0 ? "default" : "destructive"}>
            {analysis.volumeTrend > 0 ? "+" : ""}
            {analysis.volumeTrend.toFixed(1)}%
          </Badge>
        </div>

        {/* Price-Volume Correlation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Price-Volume Correlation</span>
          </div>
          <Badge variant={Math.abs(analysis.correlation) > 0.5 ? "default" : "secondary"}>
            {analysis.correlation.toFixed(2)}
          </Badge>
        </div>

        {/* Institutional Activity */}
        <div className="flex items-center justify-between">
          <span className="text-sm">Institutional Activity</span>
          <Badge variant={analysis.institutionalActivity === "HIGH" ? "default" : "secondary"}>
            {analysis.institutionalActivity}
          </Badge>
        </div>

        {/* Liquidity Index */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Liquidity Index</span>
            <span className="text-sm font-bold">{analysis.liquidityIndex.toFixed(0)}/100</span>
          </div>
          <Progress value={analysis.liquidityIndex} className="h-2" />
        </div>

        {/* Volume Breakout Alert */}
        {analysis.volumeBreakout && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">Volume Breakout Detected!</span>
          </div>
        )}

        {/* Volume Signals */}
        {analysis.signals.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Volume Signals</span>
            <div className="flex flex-wrap gap-1">
              {analysis.signals.map((signal: string) => (
                <Badge
                  key={signal}
                  variant={
                    signal.includes("BULLISH") ? "default" : signal.includes("BEARISH") ? "destructive" : "secondary"
                  }
                  className="text-xs"
                >
                  {signal.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {analysis.fallback && (
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">Using demo data - API unavailable</div>
        )}
      </CardContent>
    </Card>
  )
}
