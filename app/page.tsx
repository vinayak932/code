"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react" // Import useRef
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, TrendingDown, Search, RefreshCw, Brain, IndianRupee } from "lucide-react"
import { StockChart } from "@/components/stock-chart"
import { PredictionCard } from "@/components/prediction-card"
import { StockCard } from "@/components/stock-card"
import { MarketOverview } from "@/components/market-overview"
import { SocialSentimentCard } from "@/components/social-sentiment-card"
import { VolumeAnalysisCard } from "@/components/volume-analysis-card"
import { MarketSentimentOverview } from "@/components/market-sentiment-overview"

// Define the structure for a cached prediction, including a timestamp
interface CachedPrediction {
  direction: "up" | "down"
  confidence: number
  targetPrice: number
  timeframe: string
  reasoning: string
  timestamp: number
}

const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

export default function StockPredictor() {
  const [stocks, setStocks] = useState<any[]>([])
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [loading, setLoading] = useState(true)

  // Centralized prediction cache using useRef
  const predictionsCache = useRef<Map<string, CachedPrediction>>(new Map())

  const getCachedPrediction = useCallback((symbol: string): CachedPrediction | null => {
    const cached = predictionsCache.current.get(symbol)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(
        `[AppPageCache] Using cached prediction for ${symbol}. Expires in ${Math.ceil(
          (cached.timestamp + CACHE_DURATION - Date.now()) / 1000 / 60,
        )} minutes.`,
      )
      return cached
    }
    return null
  }, [])

  const setCachedPrediction = useCallback((symbol: string, prediction: CachedPrediction) => {
    predictionsCache.current.set(symbol, prediction)
    console.log(`[AppPageCache] Stored new prediction for ${symbol}.`)
  }, [])

  const fetchStockData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stocks`)
      const data = await response.json()

      setStocks(data.stocks)
      if (
        data.stocks.length > 0 &&
        (!selectedStock || !data.stocks.some((s: any) => s.symbol === selectedStock.symbol))
      ) {
        setSelectedStock(data.stocks[0])
      }
    } catch (error) {
      console.error("Error fetching stock data:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
      setLastUpdated(new Date())
    }
  }, [selectedStock])

  useEffect(() => {
    fetchStockData()
    const interval = setInterval(fetchStockData, 60000)
    return () => clearInterval(interval)
  }, [fetchStockData])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setStocks([])
    setSelectedStock(null)
    setSearchTerm("")
    // Optionally clear the prediction cache on full app refresh
    predictionsCache.current.clear()
    fetchStockData()
  }

  const topGainers = useMemo(() => {
    return [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5)
  }, [stocks])

  const topLosers = useMemo(() => {
    return [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)
  }, [stocks])

  const initialDashboardStocks = useMemo(() => {
    const combined = [...topGainers, ...topLosers]
    const uniqueStocks = Array.from(new Map(combined.map((stock) => [stock.symbol, stock])).values())
    return uniqueStocks
  }, [topGainers, topLosers])

  const searchedStocks = useMemo(() => {
    if (!searchTerm) {
      return []
    }
    return stocks.filter(
      (stock: any) =>
        stock?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock?.symbol?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [stocks, searchTerm])

  const pennyStocks = stocks.filter((stock: any) => stock.price < 100)

  if (loading && stocks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600">Loading Indian stock market data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Stock Predictor
          </h1>
          <p className="text-gray-600">Real-time Indian Stock Market Analysis & Predictions</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="h-6 w-6 p-0">
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        <MarketOverview />

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search all stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            AI Powered
          </Badge>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
            <TabsTrigger value="analysis">Technical Analysis</TabsTrigger>
            <TabsTrigger value="penny-stocks">Penny Stocks</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {searchTerm ? (
              <>
                <h2 className="text-2xl font-bold text-blue-600">Search Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {searchedStocks.length > 0 ? (
                    searchedStocks.map((stock: any) => (
                      <StockCard
                        key={stock.symbol}
                        stock={stock}
                        isSelected={selectedStock?.symbol === stock.symbol}
                        onClick={() => setSelectedStock(stock)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      No stocks found matching your search.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-green-600">Top 5 Gainers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topGainers.length > 0 ? (
                    topGainers.map((stock: any) => (
                      <StockCard
                        key={stock.symbol}
                        stock={stock}
                        isSelected={selectedStock?.symbol === stock.symbol}
                        onClick={() => setSelectedStock(stock)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-4">No top gainers available.</div>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-red-600">Top 5 Losers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {topLosers.length > 0 ? (
                    topLosers.map((stock: any) => (
                      <StockCard
                        key={stock.symbol}
                        stock={stock}
                        isSelected={selectedStock?.symbol === stock.symbol}
                        onClick={() => setSelectedStock(stock)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-4">No top losers available.</div>
                  )}
                </div>
              </>
            )}

            {selectedStock && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div>
                      <span>{selectedStock.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {selectedStock.symbol}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      <span className="text-2xl font-bold">{selectedStock.price.toFixed(2)}</span>
                      <Badge variant={selectedStock.change >= 0 ? "default" : "destructive"}>
                        {selectedStock.change >= 0 ? "+" : ""}
                        {selectedStock.change.toFixed(2)}({selectedStock.changePercent.toFixed(2)}%)
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <StockChart stock={selectedStock} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="predictions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {stocks.slice(0, 6).map((stock: any) => (
                <PredictionCard
                  key={stock.symbol}
                  stock={stock}
                  getCachedPrediction={getCachedPrediction} // Pass functions as props
                  setCachedPrediction={setCachedPrediction} // Pass functions as props
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <MarketSentimentOverview />

            {selectedStock && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SocialSentimentCard symbol={selectedStock.symbol} />
                <VolumeAnalysisCard symbol={selectedStock.symbol} />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Movers</CardTitle>
                  <CardDescription>Biggest gainers and losers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stocks
                      .sort((a: any, b: any) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
                      .slice(0, 5)
                      .map((stock: any) => (
                        <div key={stock.symbol} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{stock.symbol}</span>
                            <p className="text-sm text-gray-500">{stock.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {stock.changePercent >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <Badge variant={stock.changePercent >= 0 ? "default" : "destructive"}>
                              {stock.changePercent.toFixed(2)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Market Insights</CardTitle>
                  <CardDescription>Key market observations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Strong institutional buying in banking sector</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>IT stocks showing resilience amid global concerns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>Pharma sector experiencing rotation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>FII activity remains cautiously optimistic</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="penny-stocks" className="space-y-6">
            <h2 className="text-2xl font-bold text-purple-600">Indian Penny Stocks (Price &lt; ₹100)</h2>
            <p className="text-gray-600">
              Explore high-volatility, low-price stocks for potential high returns (and risks).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pennyStocks.length > 0 ? (
                pennyStocks.map((stock: any) => (
                  <StockCard
                    key={stock.symbol}
                    stock={stock}
                    isSelected={selectedStock?.symbol === stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No penny stocks found matching your search.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
