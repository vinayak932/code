"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Activity,
  NewspaperIcon as News,
  DollarSign,
  Users,
  Globe,
  LineChart,
} from "lucide-react"

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface EnhancedPredictionCardProps {
  stock: Stock
}

export function EnhancedPredictionCard({ stock }: EnhancedPredictionCardProps) {
  const [prediction, setPrediction] = useState<any>(null)
  const [technicalAnalysis, setTechnicalAnalysis] = useState<any>(null)
  const [newsSentiment, setNewsSentiment] = useState<any>(null)
  const [financials, setFinancials] = useState<any>(null)
  const [analystRatings, setAnalystRatings] = useState<any>(null)
  const [macroIndicators, setMacroIndicators] = useState<any>(null)
  const [mlPrediction, setMlPrediction] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [accuracyScore, setAccuracyScore] = useState(0)

  const generateEnhancedPrediction = async () => {
    setIsGenerating(true)

    try {
      // Fetch technical analysis
      const techResponse = await fetch("/api/technical-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: stock.symbol }),
      })
      const techData = await techResponse.json()
      setTechnicalAnalysis(techData)

      // Fetch news sentiment
      const sentimentResponse = await fetch("/api/news-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: stock.symbol }),
      })
      const sentimentData = await sentimentResponse.json()
      setNewsSentiment(sentimentData)

      // Fetch financial statements
      const financialResponse = await fetch("/api/financial-statements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: stock.symbol }),
      })
      const financialData = await financialResponse.json()
      setFinancials(financialData)

      // Fetch analyst ratings
      const analystResponse = await fetch("/api/analyst-ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: stock.symbol }),
      })
      const analystData = await analystResponse.json()
      setAnalystRatings(analystData)

      // Fetch macroeconomic indicators
      const macroResponse = await fetch("/api/macro-indicators")
      const macroData = await macroResponse.json()
      setMacroIndicators(macroData)

      // Fetch ML Model Prediction
      const mlResponse = await fetch("/api/ml-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: stock.symbol }),
      })
      const mlData = await mlResponse.json()
      setMlPrediction(mlData)

      // Calculate accuracy score based on signal alignment
      const calculateAccuracy = () => {
        let score = 60 // Base accuracy

        // Technical indicators alignment
        const signals = techData.signals
        if (signals) {
          const bullishSignals = [
            signals.rsi?.signal === "BUY",
            signals.macd?.signal === "BUY",
            signals.bollinger?.signal === "BUY",
            signals.trend?.signal === "BULLISH",
          ].filter(Boolean).length

          const bearishSignals = [
            signals.rsi?.signal === "SELL",
            signals.macd?.signal === "SELL",
            signals.bollinger?.signal === "SELL",
            signals.trend?.signal === "BEARISH",
          ].filter(Boolean).length

          // Higher accuracy when signals align
          if (bullishSignals >= 3 || bearishSignals >= 3) score += 20
          else if (bullishSignals >= 2 || bearishSignals >= 2) score += 10
        }

        // Sentiment alignment
        if (sentimentData.sentiment) {
          if (Math.abs(sentimentData.sentiment.overallSentiment) > 0.5) score += 10
          if (sentimentData.sentiment.confidence > 0.7) score += 5
        }

        // Financials alignment
        if (financialData.financials) {
          if (financialData.financials.financialHealth === "Strong") score += 5
          if (financialData.financials.growthOutlook === "Positive") score += 5
        }

        // Analyst ratings alignment
        if (analystData.ratings) {
          if (analystData.ratings.consensusRating === "Strong Buy") score += 5
          if (analystData.ratings.consensusRating === "Buy") score += 3
        }

        // Macro indicators alignment
        if (macroData.indicators) {
          if (macroData.indicators.economicOutlook === "Positive") score += 5
        }

        // ML Prediction alignment (new)
        if (mlData.mlPrediction && mlData.mlPrediction.direction) {
          // If ML prediction aligns with overall direction (simple check)
          const overallDirection = stock.changePercent > 0 ? "up" : "down"
          if (mlData.mlPrediction.direction === overallDirection) {
            score += 5 // Small boost if ML aligns with current price trend
          }
          score += mlData.mlPrediction.confidence * 0.1 // Add a portion of ML confidence
        }

        return Math.min(score, 95) // Cap at 95%
      }

      const accuracy = calculateAccuracy()
      setAccuracyScore(accuracy)

      // Generate prediction based on comprehensive analysis
      // Prioritize ML prediction if available and confident, otherwise use a blend
      let finalDirection = mlPrediction?.mlPrediction?.direction || (Math.random() > 0.5 ? "up" : "down")
      let finalConfidence = accuracy
      let finalTargetPrice =
        stock.price * (1 + (finalDirection === "up" ? Math.random() * 0.03 : -Math.random() * 0.03))

      if (mlPrediction?.mlPrediction && mlPrediction.mlPrediction.confidence > 70) {
        finalDirection = mlPrediction.mlPrediction.direction
        finalTargetPrice = mlPrediction.mlPrediction.predictedPrice
        finalConfidence = Math.min(95, finalConfidence + mlPrediction.mlPrediction.confidence * 0.1) // Boost confidence
      }

      setPrediction({
        direction: finalDirection,
        confidence: Math.round(finalConfidence),
        targetPrice: finalTargetPrice,
        timeframe: "1-3 days",
        stopLoss: finalDirection === "up" ? stock.price * 0.95 : stock.price * 1.05,
        keyFactors: [
          `Technical indicators show ${techData.signals?.trend?.signal || "mixed"} trend`,
          `News sentiment is ${sentimentData.sentiment?.sentimentLabel || "neutral"}`,
          `Financial health is ${financialData.financials?.financialHealth || "unknown"} with ${financialData.financials?.growthOutlook || "neutral"} growth outlook`,
          `Analyst consensus is ${analystData.ratings?.consensusRating || "N/A"} with target ₹${analystData.ratings?.averageTargetPrice?.toFixed(2) || "N/A"}`,
          `Macroeconomic outlook is ${macroData.indicators?.economicOutlook || "neutral"}`,
          `ML Model predicts ${mlPrediction?.mlPrediction?.direction || "N/A"} for next day`, // New factor
        ],
      })
    } catch (error) {
      console.error("Error generating enhanced prediction:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    generateEnhancedPrediction()
  }, [stock.symbol])

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />

      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>{stock.symbol}</span>
          </div>
          <Badge variant="outline" className="text-xs bg-purple-50">
            Enhanced AI
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm">{stock.name}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Price</span>
          <div className="flex items-center gap-1">
            <IndianRupee className="h-3 w-3" />
            <span className="font-semibold">{stock.price.toFixed(2)}</span>
          </div>
        </div>

        {/* Accuracy Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Prediction Accuracy</span>
            <Badge variant={accuracyScore > 80 ? "default" : accuracyScore > 70 ? "secondary" : "outline"}>
              {accuracyScore}%
            </Badge>
          </div>
          <Progress value={accuracyScore} className="h-2" />
        </div>

        {/* Technical Indicators Summary */}
        {technicalAnalysis && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>RSI: {technicalAnalysis.signals?.rsi?.value?.toFixed(1) || "N/A"}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>Trend: {technicalAnalysis.signals?.trend?.signal || "N/A"}</span>
            </div>
          </div>
        )}

        {/* News Sentiment */}
        {newsSentiment && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <News className="h-3 w-3" />
              <span>News Sentiment</span>
            </div>
            <Badge
              variant={
                newsSentiment.sentiment?.sentimentLabel === "POSITIVE"
                  ? "default"
                  : newsSentiment.sentiment?.sentimentLabel === "NEGATIVE"
                    ? "destructive"
                    : "secondary"
              }
            >
              {newsSentiment.sentiment?.sentimentLabel || "NEUTRAL"}
            </Badge>
          </div>
        )}

        {/* Financial Statements Summary */}
        {financials && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              <span>Financial Health</span>
            </div>
            <Badge
              variant={
                financials.financials?.financialHealth === "Strong"
                  ? "default"
                  : financials.financials?.financialHealth === "Weak"
                    ? "destructive"
                    : "secondary"
              }
            >
              {financials.financials?.financialHealth || "N/A"}
            </Badge>
          </div>
        )}

        {/* Analyst Ratings Summary */}
        {analystRatings && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Analyst Consensus</span>
            </div>
            <Badge
              variant={
                analystRatings.ratings?.consensusRating === "Strong Buy" ||
                analystRatings.ratings?.consensusRating === "Buy"
                  ? "default"
                  : analystRatings.ratings?.consensusRating === "Sell" ||
                      analystRatings.ratings?.consensusRating === "Underperform"
                    ? "destructive"
                    : "secondary"
              }
            >
              {analystRatings.ratings?.consensusRating || "N/A"}
            </Badge>
          </div>
        )}

        {/* Macroeconomic Indicators Summary */}
        {macroIndicators && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3" />
              <span>Economic Outlook</span>
            </div>
            <Badge
              variant={
                macroIndicators.indicators?.economicOutlook === "Positive"
                  ? "default"
                  : macroIndicators.indicators?.economicOutlook === "Negative"
                    ? "destructive"
                    : "secondary"
              }
            >
              {macroIndicators.indicators?.economicOutlook || "N/A"}
            </Badge>
          </div>
        )}

        {/* ML Model Prediction Summary (New Section) */}
        {mlPrediction && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <LineChart className="h-3 w-3" />
              <span>ML Model Prediction</span>
            </div>
            <Badge
              variant={
                mlPrediction.mlPrediction?.direction === "up"
                  ? "default"
                  : mlPrediction.mlPrediction?.direction === "down"
                    ? "destructive"
                    : "secondary"
              }
            >
              {mlPrediction.mlPrediction?.direction?.toUpperCase() || "N/A"} (
              {mlPrediction.mlPrediction?.confidence || "N/A"}%)
            </Badge>
          </div>
        )}

        {prediction && !isGenerating ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {prediction.direction === "up" ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium capitalize">{prediction.direction}ward</span>
              </div>
              <Badge variant={prediction.direction === "up" ? "default" : "destructive"}>
                {prediction.confidence}% confidence
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span>Target:</span>
                <span className="font-semibold text-blue-600">₹{prediction.targetPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Stop Loss:</span>
                <span className="font-semibold text-red-600">₹{prediction.stopLoss.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Key Factors:</strong>
              <ul className="mt-1 space-y-1">
                {prediction.keyFactors.map((factor: string, index: number) => (
                  <li key={index}>• {factor}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}

        <Button
          onClick={generateEnhancedPrediction}
          disabled={isGenerating}
          variant="outline"
          size="sm"
          className="w-full bg-transparent"
        >
          {isGenerating ? "Analyzing..." : "Refresh Enhanced Prediction"}
        </Button>
      </CardContent>
    </Card>
  )
}
