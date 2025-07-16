"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MessageCircle, TrendingUp, Hash, Users, Zap } from "lucide-react"

interface SocialSentimentCardProps {
  symbol: string
}

export function SocialSentimentCard({ symbol }: SocialSentimentCardProps) {
  const [sentiment, setSentiment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/social-sentiment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbol }),
        })
        const data = await response.json()
        setSentiment(data.sentiment)
      } catch (error) {
        console.error("Error fetching social sentiment:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSentiment()
    const interval = setInterval(fetchSentiment, 300000) // Update every 5 minutes
    return () => clearInterval(interval)
  }, [symbol])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Social Sentiment
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Social Sentiment
          </div>
          <Badge className={getSentimentColor(sentiment.sentimentLabel)}>{sentiment.sentimentLabel}</Badge>
        </CardTitle>
        <CardDescription>Real-time social media analysis</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Social Score</span>
            <span className="text-sm font-bold">{sentiment.socialScore.toFixed(0)}/100</span>
          </div>
          <Progress value={sentiment.socialScore} className="h-2" />
        </div>

        {/* Virality Index */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">Virality Index</span>
          </div>
          <Badge variant={sentiment.viralityIndex > 0.5 ? "default" : "secondary"}>
            {(sentiment.viralityIndex * 100).toFixed(0)}%
          </Badge>
        </div>

        {/* Total Mentions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-500" />
            <span className="text-sm">Total Mentions</span>
          </div>
          <span className="font-semibold">{sentiment.totalMentions.toLocaleString()}</span>
        </div>

        {/* Platform Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Platform Breakdown</h4>
          {sentiment.platforms.map((platform: any) => (
            <div key={platform.platform} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span>{platform.platform}</span>
                {platform.trending && <TrendingUp className="h-3 w-3 text-green-500" />}
              </div>
              <div className="flex items-center gap-2">
                <span>{platform.mentions.toLocaleString()}</span>
                <Badge
                  variant={
                    platform.sentiment > 0.2 ? "default" : platform.sentiment < -0.2 ? "destructive" : "secondary"
                  }
                  className="text-xs"
                >
                  {platform.sentiment > 0 ? "+" : ""}
                  {platform.sentiment.toFixed(2)}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Trending Keywords */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Trending Keywords</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {sentiment.trendingKeywords.map((keyword: string) => (
              <Badge key={keyword} variant="outline" className="text-xs">
                #{keyword}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
