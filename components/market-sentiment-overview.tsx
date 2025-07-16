"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Activity, Globe, BarChart3, Zap } from "lucide-react"

export function MarketSentimentOverview() {
  const [sentiment, setSentiment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/market-sentiment")
        const data = await response.json()
        setSentiment(data.sentiment)
      } catch (error) {
        console.error("Error fetching market sentiment:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSentiment()
    const interval = setInterval(fetchSentiment, 120000) // Update every 2 minutes
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Market Sentiment</CardTitle>
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

  if (!sentiment) return null

  const getSentimentColor = (label: string) => {
    switch (label) {
      case "BULLISH":
        return "text-green-600 bg-green-50 border-green-200"
      case "BEARISH":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getFearGreedColor = (index: number) => {
    if (index > 75) return "text-red-600 bg-red-50"
    if (index > 55) return "text-orange-600 bg-orange-50"
    if (index > 45) return "text-yellow-600 bg-yellow-50"
    if (index > 25) return "text-blue-600 bg-blue-50"
    return "text-green-600 bg-green-50"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Overall Market Sentiment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Market Sentiment
            </div>
            <Badge className={getSentimentColor(sentiment.sentimentLabel)}>{sentiment.sentimentLabel}</Badge>
          </CardTitle>
          <CardDescription>Overall market mood and direction</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Market Score */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Market Score</span>
              <span className="text-sm font-bold">{sentiment.marketScore.toFixed(0)}/100</span>
            </div>
            <Progress value={sentiment.marketScore} className="h-2" />
          </div>

          {/* Fear & Greed Index */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fear & Greed Index</span>
              <Badge className={getFearGreedColor(sentiment.fearGreedIndex)}>
                {sentiment.fearGreedIndex.toFixed(0)}
              </Badge>
            </div>
            <Progress value={sentiment.fearGreedIndex} className="h-2" />
          </div>

          {/* Volatility Index */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Volatility Index</span>
            </div>
            <Badge variant={sentiment.volatilityIndex > 30 ? "destructive" : "secondary"}>
              {sentiment.volatilityIndex.toFixed(1)}
            </Badge>
          </div>

          {/* Market Regime */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Market Regime</span>
            <Badge variant="outline">{sentiment.marketRegime.replace(/_/g, " ")}</Badge>
          </div>

          {sentiment.fallback && (
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">Using demo data - API unavailable</div>
          )}
        </CardContent>
      </Card>

      {/* Market Breadth & Sectors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Market Breadth & Sectors
          </CardTitle>
          <CardDescription>Market participation and sector performance</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Market Breadth */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Market Breadth</span>
              <span className="text-sm font-bold">{sentiment.marketBreadth.breadthPercentage.toFixed(0)}%</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-green-600 font-semibold">{sentiment.marketBreadth.advancers}</div>
                <div className="text-gray-500">Advancing</div>
              </div>
              <div className="text-center">
                <div className="text-red-600 font-semibold">{sentiment.marketBreadth.decliners}</div>
                <div className="text-gray-500">Declining</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 font-semibold">{sentiment.marketBreadth.unchanged}</div>
                <div className="text-gray-500">Unchanged</div>
              </div>
            </div>
          </div>

          {/* A/D Ratio */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Advance/Decline Ratio</span>
            <Badge variant={sentiment.marketBreadth.advanceDeclineRatio > 1 ? "default" : "destructive"}>
              {sentiment.marketBreadth.advanceDeclineRatio.toFixed(2)}
            </Badge>
          </div>

          {/* Top Sectors */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Sector Performance</span>
            {sentiment.sectorSentiment.slice(0, 5).map((sector: any) => (
              <div key={sector.name} className="flex items-center justify-between text-xs">
                <span>{sector.name}</span>
                <div className="flex items-center gap-2">
                  {sector.sentiment > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <Badge
                    variant={sector.sentiment > 0.2 ? "default" : sector.sentiment < -0.2 ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {sector.sentiment > 0 ? "+" : ""}
                    {sector.sentiment.toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Global Influence */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Global Influence</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span>US Markets</span>
                <Badge
                  variant={sentiment.globalInfluence.us_markets > 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {sentiment.globalInfluence.us_markets > 0 ? "+" : ""}
                  {sentiment.globalInfluence.us_markets.toFixed(2)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Asian Markets</span>
                <Badge
                  variant={sentiment.globalInfluence.asian_markets > 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {sentiment.globalInfluence.asian_markets > 0 ? "+" : ""}
                  {sentiment.globalInfluence.asian_markets.toFixed(2)}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
