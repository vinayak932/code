"use client"

import { useEffect, useState } from "react"

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface StockChartProps {
  stock: Stock
}

interface HistoricalData {
  date: string
  close: number
  high: number
  low: number
  volume: number
}

export function StockChart({ stock }: StockChartProps) {
  const [chartData, setChartData] = useState<HistoricalData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/stock-history?symbol=${stock.symbol}&period=1mo`)
        const data = await response.json()
        setChartData(data.slice(-30)) // Last 30 days
      } catch (error) {
        console.error("Error fetching historical data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (stock.symbol) {
      fetchHistoricalData()
    }
  }, [stock.symbol])

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!chartData.length) {
    return <div className="w-full h-64 flex items-center justify-center text-gray-500">No chart data available</div>
  }

  const prices = chartData.map((d) => d.close)
  const maxPrice = Math.max(...prices)
  const minPrice = Math.min(...prices)
  const priceRange = maxPrice - minPrice

  return (
    <div className="w-full h-64 relative">
      <svg className="w-full h-full" viewBox="0 0 400 200">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Price line */}
        <polyline
          fill="none"
          stroke={stock.change >= 0 ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          points={prices
            .map((price, index) => {
              const x = (index / (prices.length - 1)) * 380 + 10
              const y = 190 - ((price - minPrice) / priceRange) * 170
              return `${x},${y}`
            })
            .join(" ")}
        />

        {/* Fill area under the line */}
        <polygon
          fill={`url(#gradient-${stock.symbol})`}
          points={`10,190 ${prices
            .map((price, index) => {
              const x = (index / (prices.length - 1)) * 380 + 10
              const y = 190 - ((price - minPrice) / priceRange) * 170
              return `${x},${y}`
            })
            .join(" ")} 390,190`}
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id={`gradient-${stock.symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={stock.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={stock.change >= 0 ? "#10b981" : "#ef4444"} stopOpacity="0.05" />
          </linearGradient>
        </defs>
      </svg>

      {/* Price labels */}
      <div className="absolute top-2 left-2 text-xs text-gray-500">₹{maxPrice.toFixed(0)}</div>
      <div className="absolute bottom-2 left-2 text-xs text-gray-500">₹{minPrice.toFixed(0)}</div>

      {/* Date range */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500">
        {chartData.length > 0 && `${chartData[0].date} to ${chartData[chartData.length - 1].date}`}
      </div>
    </div>
  )
}
