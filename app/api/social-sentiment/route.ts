import { NextResponse } from "next/server"

// Simulated social media sentiment data
// In production, integrate with Twitter API, Reddit API, StockTwits, etc.
async function getSocialSentiment(symbol: string) {
  // Simulate API calls to various social platforms
  const platforms = [
    {
      platform: "Twitter",
      mentions: Math.floor(Math.random() * 5000) + 1000,
      sentiment: (Math.random() - 0.5) * 2, // -1 to 1
      engagement: Math.floor(Math.random() * 50000) + 10000,
      trending: Math.random() > 0.7,
    },
    {
      platform: "Reddit",
      mentions: Math.floor(Math.random() * 2000) + 500,
      sentiment: (Math.random() - 0.5) * 2,
      engagement: Math.floor(Math.random() * 20000) + 5000,
      trending: Math.random() > 0.8,
    },
    {
      platform: "StockTwits",
      mentions: Math.floor(Math.random() * 1500) + 300,
      sentiment: (Math.random() - 0.5) * 2,
      engagement: Math.floor(Math.random() * 15000) + 3000,
      trending: Math.random() > 0.75,
    },
    {
      platform: "YouTube",
      mentions: Math.floor(Math.random() * 800) + 100,
      sentiment: (Math.random() - 0.5) * 2,
      engagement: Math.floor(Math.random() * 100000) + 20000,
      trending: Math.random() > 0.85,
    },
  ]

  // Calculate overall sentiment
  const totalMentions = platforms.reduce((sum, p) => sum + p.mentions, 0)
  const weightedSentiment = platforms.reduce((sum, p) => sum + p.sentiment * (p.mentions / totalMentions), 0)

  // Generate sentiment keywords
  const positiveKeywords = ["bullish", "buy", "moon", "rocket", "strong", "growth", "profit", "breakout"]
  const negativeKeywords = ["bearish", "sell", "crash", "dump", "weak", "loss", "decline", "resistance"]

  const trendingKeywords = []
  for (let i = 0; i < 5; i++) {
    if (weightedSentiment > 0) {
      trendingKeywords.push(positiveKeywords[Math.floor(Math.random() * positiveKeywords.length)])
    } else {
      trendingKeywords.push(negativeKeywords[Math.floor(Math.random() * negativeKeywords.length)])
    }
  }

  return {
    overallSentiment: weightedSentiment,
    sentimentLabel: weightedSentiment > 0.3 ? "BULLISH" : weightedSentiment < -0.3 ? "BEARISH" : "NEUTRAL",
    confidence: Math.abs(weightedSentiment),
    totalMentions,
    platforms,
    trendingKeywords: [...new Set(trendingKeywords)],
    socialScore: Math.min(Math.max((weightedSentiment + 1) * 50, 0), 100), // Convert to 0-100 scale
    viralityIndex: platforms.filter((p) => p.trending).length / platforms.length,
  }
}

export async function POST(request: Request) {
  try {
    const { symbol } = await request.json()

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    const sentiment = await getSocialSentiment(symbol)

    return NextResponse.json({
      symbol,
      sentiment,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Social sentiment error:", error)
    return NextResponse.json({ error: "Failed to analyze social sentiment" }, { status: 500 })
  }
}
