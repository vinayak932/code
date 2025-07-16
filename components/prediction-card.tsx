"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, TrendingUp, TrendingDown, Target, IndianRupee } from "lucide-react"

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

// Define the structure for a cached prediction, including a timestamp
interface CachedPrediction {
  direction: "up" | "down"
  confidence: number
  targetPrice: number
  timeframe: string
  reasoning: string
  timestamp: number // Add timestamp to cache
}

interface PredictionCardProps {
  stock: Stock
  // Add cache functions to props
  getCachedPrediction: (symbol: string) => CachedPrediction | null
  setCachedPrediction: (symbol: string, prediction: CachedPrediction) => void
}

export function PredictionCard({ stock, getCachedPrediction, setCachedPrediction }: PredictionCardProps) {
  const [prediction, setPrediction] = useState<CachedPrediction | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePrediction = async () => {
    setIsGenerating(true)

    const cached = getCachedPrediction(stock.symbol) // Get from shared cache via props

    if (cached) {
      setPrediction(cached)
      setIsGenerating(false)
      return // Use cached prediction and do not generate a new one
    }

    console.log(`[PredictionCard] Generating NEW prediction for ${stock.symbol} (cache stale or empty).`)
    // If no valid cached prediction, generate a new one
    // Simulate AI prediction generation
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const direction = Math.random() > 0.5 ? "up" : "down"
    const confidence = Math.floor(Math.random() * 30) + 60 // 60-90%

    // Adjust target price for a 2-hour timeframe (smaller movements)
    const priceChangeFactor = Math.random() * 0.015 + 0.002 // Between 0.2% and 1.7%
    const targetPrice =
      direction === "up" ? stock.price * (1 + priceChangeFactor) : stock.price * (1 - priceChangeFactor)

    const reasons = [
      "Intraday momentum indicators suggest a continuation of the current trend in the next 2 hours.",
      "Immediate market sentiment and early trading volume support this short-term move.",
      "Key support/resistance levels indicate a likely bounce or rejection within the next few hours.",
      "Recent price action shows strong buying/selling pressure for the immediate session.",
      "Sectoral performance in the current trading session is influencing this short-term outlook.",
      "Minor news flow or block deals are impacting immediate price direction.",
    ]

    const newPrediction: CachedPrediction = {
      direction,
      confidence,
      targetPrice,
      timeframe: "next 2 hours", // Keep timeframe as "next 2 hours"
      reasoning: reasons[Math.floor(Math.random() * reasons.length)],
      timestamp: Date.now(), // Store current timestamp
    }

    setPrediction(newPrediction)
    setCachedPrediction(stock.symbol, newPrediction) // Store in shared cache via props
    setIsGenerating(false)
  }

  useEffect(() => {
    // Generate prediction on mount or when stock.symbol changes
    // This will now use the cache if available or generate a new one if stale
    generatePrediction()
  }, [stock.symbol, getCachedPrediction, setCachedPrediction]) // Add cache functions to dependency array

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />

      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-500" />
            <span>{stock.symbol}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            AI Prediction
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Target Price</span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" />
                <span className="font-semibold text-blue-600">{prediction.targetPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Timeframe:</strong> {prediction.timeframe}
            </div>

            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
              <strong>AI Reasoning:</strong> {prediction.reasoning}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        <Button
          onClick={generatePrediction} // This will now respect the 30-minute cache
          disabled={isGenerating}
          variant="outline"
          size="sm"
          className="w-full bg-transparent"
        >
          {isGenerating ? "Analyzing..." : "Refresh Prediction"}
        </Button>
      </CardContent>
    </Card>
  )
}
