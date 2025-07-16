"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity, IndianRupee, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function MarketOverview() {
  const [marketData, setMarketData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setError(null)
        const response = await fetch("/api/market-indices")

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received")
        }

        setMarketData(data)
      } catch (error) {
        console.error("Error fetching market data:", error)
        setError(error.message)

        // Set fallback data on error
        setMarketData([
          { name: "NIFTY 50", price: 21456.78, change: 145.32, changePercent: 0.68, fallback: true },
          { name: "SENSEX", price: 71234.56, change: -89.45, changePercent: -0.13, fallback: true },
          { name: "BANK NIFTY", price: 45678.9, change: 234.67, changePercent: 0.52, fallback: true },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getCardColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-green-500 to-green-600",
      "from-orange-500 to-orange-600",
    ]
    return colors[index] || colors[0]
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Using cached data due to API issues. Data may not be real-time.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData.slice(0, 3).map((index, i) => (
          <Card key={index.name} className={`bg-gradient-to-br ${getCardColor(i)} text-white relative`}>
            {index.fallback && (
              <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                Demo
              </Badge>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {index.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {index.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-2">
                  {index.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="text-sm">
                    {index.change >= 0 ? "+" : ""}
                    {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IndianRupee className="h-4 w-4" />
              Market Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="text-2xl font-bold">
                {new Date().getHours() >= 9 && new Date().getHours() < 16 ? "OPEN" : "CLOSED"}
              </div>
              <div className="text-sm opacity-90">
                {new Date().getHours() >= 9 && new Date().getHours() < 16
                  ? "Market is open"
                  : "Market opens at 9:15 AM"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
