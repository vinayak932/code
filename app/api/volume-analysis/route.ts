import { NextResponse } from "next/server"

async function getVolumeAnalysis(symbol: string) {
  try {
    // Determine the base URL for internal API calls
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    // Fetch historical data for volume analysis
    const response = await fetch(`${baseUrl}/api/stock-history?symbol=${symbol}&period=3mo`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })
    const historicalData = await response.json()

    if (!historicalData || historicalData.length === 0) {
      throw new Error("No historical data available")
    }

    const volumes = historicalData.map((d: any) => d.volume).filter((v: number) => v > 0)
    const prices = historicalData.map((d: any) => d.close)

    // Calculate volume metrics
    const avgVolume = volumes.reduce((sum: number, vol: number) => sum + vol, 0) / volumes.length
    const currentVolume = volumes[volumes.length - 1]
    const volumeRatio = currentVolume / avgVolume

    // Volume trend analysis
    const recentVolumes = volumes.slice(-10) // Last 10 days
    const olderVolumes = volumes.slice(-20, -10) // Previous 10 days
    const recentAvg = recentVolumes.reduce((sum: number, vol: number) => sum + vol, 0) / recentVolumes.length
    const olderAvg = olderVolumes.reduce((sum: number, vol: number) => sum + vol, 0) / olderVolumes.length
    const volumeTrend = ((recentAvg - olderAvg) / olderAvg) * 100

    // Price-Volume correlation
    const priceChanges = []
    const volumeChanges = []
    for (let i = 1; i < Math.min(prices.length, volumes.length); i++) {
      priceChanges.push(((prices[i] - prices[i - 1]) / prices[i - 1]) * 100)
      volumeChanges.push(((volumes[i] - volumes[i - 1]) / volumes[i - 1]) * 100)
    }

    // Calculate correlation coefficient
    const correlation = calculateCorrelation(priceChanges, volumeChanges)

    // Volume breakout detection
    const volumeBreakout = volumeRatio > 2.0 // 200% of average volume
    const priceChange = ((prices[prices.length - 1] - prices[prices.length - 2]) / prices[prices.length - 2]) * 100

    // Institutional activity indicators
    const largeVolumeSpikes = volumes.filter((v: number) => v > avgVolume * 3).length
    const institutionalActivity = largeVolumeSpikes > volumes.length * 0.1 ? "HIGH" : "MODERATE"

    // Volume-based signals
    const signals = []
    if (volumeBreakout && priceChange > 2) signals.push("BULLISH_BREAKOUT")
    if (volumeBreakout && priceChange < -2) signals.push("BEARISH_BREAKDOWN")
    if (volumeRatio > 1.5 && correlation > 0.5) signals.push("STRONG_MOMENTUM")
    if (volumeRatio < 0.5) signals.push("LOW_INTEREST")

    return {
      currentVolume,
      avgVolume,
      volumeRatio,
      volumeTrend,
      correlation,
      volumeBreakout,
      institutionalActivity,
      signals,
      volumeScore: Math.min(volumeRatio * 50, 100), // Convert to 0-100 scale
      liquidityIndex: Math.min((currentVolume / 1000000) * 10, 100), // Liquidity based on volume
    }
  } catch (error) {
    console.error("Volume analysis error:", error)
    // Return fallback data
    return {
      currentVolume: 1000000,
      avgVolume: 800000,
      volumeRatio: 1.25,
      volumeTrend: 15.5,
      correlation: 0.65,
      volumeBreakout: false,
      institutionalActivity: "MODERATE",
      signals: ["STRONG_MOMENTUM"],
      volumeScore: 62,
      liquidityIndex: 75,
      fallback: true,
    }
  }
}

function calculateCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n === 0) return 0

  const sumX = x.slice(0, n).reduce((sum, val) => sum + val, 0)
  const sumY = y.slice(0, n).reduce((sum, val) => sum + val, 0)
  const sumXY = x.slice(0, n).reduce((sum, val, i) => sum + val * y[i], 0)
  const sumX2 = x.slice(0, n).reduce((sum, val) => sum + val * val, 0)
  const sumY2 = y.slice(0, n).reduce((sum, val) => sum + val * val, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  return denominator === 0 ? 0 : numerator / denominator
}

export async function POST(request: Request) {
  try {
    const { symbol } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    const analysis = await getVolumeAnalysis(symbol)

    return NextResponse.json({
      symbol,
      analysis,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Volume analysis API error:", error)
    return NextResponse.json({ error: "Failed to perform volume analysis" }, { status: 500 })
  }
}
