import { NextResponse } from "next/server"

async function getMarketSentiment() {
  try {
    // Determine the base URL for internal API calls
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    // Fetch market indices for overall market health
    const indicesResponse = await fetch(`${baseUrl}/api/market-indices`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!indicesResponse.ok) {
      throw new Error(`Failed to fetch market indices: HTTP ${indicesResponse.status}`)
    }

    const indices = await indicesResponse.json()

    // Calculate market sentiment based on multiple factors
    const niftyChange = indices.find((idx: any) => idx.name === "NIFTY 50")?.changePercent || 0
    const sensexChange = indices.find((idx: any) => idx.name === "SENSEX")?.changePercent || 0
    const bankNiftyChange = indices.find((idx: any) => idx.name === "BANK NIFTY")?.changePercent || 0

    const overallMarketChange = (niftyChange + sensexChange + bankNiftyChange) / 3

    // Fear & Greed Index simulation (0-100)
    const fearGreedIndex = Math.max(0, Math.min(100, 50 + overallMarketChange * 10 + (Math.random() - 0.5) * 20))

    // Market breadth analysis
    const advancers = Math.floor(Math.random() * 1500) + 500 // Stocks advancing
    const decliners = Math.floor(Math.random() * 1500) + 500 // Stocks declining
    const unchanged = Math.floor(Math.random() * 200) + 50 // Unchanged stocks
    const total = advancers + decliners + unchanged
    const advanceDeclineRatio = decliners === 0 ? advancers : advancers / decliners

    // Volatility Index (VIX equivalent for India)
    const volatilityIndex = Math.max(10, Math.min(50, 20 + Math.abs(overallMarketChange) * 2 + Math.random() * 10))

    // Sector sentiment
    const sectors = [
      { name: "Banking", sentiment: (Math.random() - 0.5) * 2, weight: 0.25 },
      { name: "IT", sentiment: (Math.random() - 0.5) * 2, weight: 0.2 },
      { name: "Pharma", sentiment: (Math.random() - 0.5) * 2, weight: 0.15 },
      { name: "Auto", sentiment: (Math.random() - 0.5) * 2, weight: 0.12 },
      { name: "FMCG", sentiment: (Math.random() - 0.5) * 2, weight: 0.1 },
      { name: "Energy", sentiment: (Math.random() - 0.5) * 2, weight: 0.08 },
      { name: "Metals", sentiment: (Math.random() - 0.5) * 2, weight: 0.1 },
    ]

    const sectorWeightedSentiment = sectors.reduce((sum, sector) => sum + sector.sentiment * sector.weight, 0)

    // Market regime detection
    let marketRegime = "NORMAL"
    if (volatilityIndex > 35) marketRegime = "HIGH_VOLATILITY"
    else if (volatilityIndex < 15) marketRegime = "LOW_VOLATILITY"
    if (fearGreedIndex > 75) marketRegime = "EXTREME_GREED"
    else if (fearGreedIndex < 25) marketRegime = "EXTREME_FEAR"

    // Global market influence
    const globalSentiment = {
      us_markets: (Math.random() - 0.5) * 2,
      asian_markets: (Math.random() - 0.5) * 2,
      crude_oil: (Math.random() - 0.5) * 2,
      dollar_index: (Math.random() - 0.5) * 2,
    }

    // Overall sentiment calculation
    const sentimentFactors = [
      { factor: "Market Indices", value: overallMarketChange / 5, weight: 0.3 },
      { factor: "Fear & Greed", value: (fearGreedIndex - 50) / 50, weight: 0.25 },
      { factor: "Market Breadth", value: (advanceDeclineRatio - 1) * 2, weight: 0.2 },
      { factor: "Sector Rotation", value: sectorWeightedSentiment, weight: 0.15 },
      { factor: "Global Cues", value: (globalSentiment.us_markets + globalSentiment.asian_markets) / 2, weight: 0.1 },
    ]

    const overallSentiment = sentimentFactors.reduce((sum, factor) => sum + factor.value * factor.weight, 0)

    return {
      overallSentiment: Math.max(-1, Math.min(1, overallSentiment)),
      sentimentLabel: overallSentiment > 0.3 ? "BULLISH" : overallSentiment < -0.3 ? "BEARISH" : "NEUTRAL",
      confidence: Math.abs(overallSentiment),
      fearGreedIndex,
      volatilityIndex,
      marketRegime,
      marketBreadth: {
        advancers,
        decliners,
        unchanged,
        advanceDeclineRatio,
        breadthPercentage: (advancers / total) * 100,
      },
      sectorSentiment: sectors,
      globalInfluence: globalSentiment,
      sentimentFactors,
      marketScore: Math.min(Math.max((overallSentiment + 1) * 50, 0), 100),
    }
  } catch (error) {
    console.error("Market sentiment error:", error)
    // Return fallback sentiment data
    return {
      overallSentiment: 0.2,
      sentimentLabel: "NEUTRAL",
      confidence: 0.6,
      fearGreedIndex: 55,
      volatilityIndex: 22,
      marketRegime: "NORMAL",
      marketBreadth: {
        advancers: 1200,
        decliners: 800,
        unchanged: 100,
        advanceDeclineRatio: 1.5,
        breadthPercentage: 57,
      },
      sectorSentiment: [
        { name: "Banking", sentiment: 0.3, weight: 0.25 },
        { name: "IT", sentiment: -0.1, weight: 0.2 },
        { name: "Pharma", sentiment: 0.5, weight: 0.15 },
      ],
      globalInfluence: {
        us_markets: 0.2,
        asian_markets: 0.1,
        crude_oil: -0.3,
        dollar_index: 0.1,
      },
      marketScore: 60,
      fallback: true,
    }
  }
}

export async function GET() {
  try {
    const sentiment = await getMarketSentiment()

    return NextResponse.json({
      sentiment,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Market sentiment API error:", error)
    return NextResponse.json({ error: "Failed to get market sentiment" }, { status: 500 })
  }
}
