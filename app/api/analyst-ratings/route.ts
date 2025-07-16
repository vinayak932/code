import { NextResponse } from "next/server"

// Simulated Analyst Ratings and Price Targets
async function getAnalystRatings(symbol: string) {
  const ratings = ["Strong Buy", "Buy", "Hold", "Underperform", "Sell"]
  const randomRating = ratings[Math.floor(Math.random() * ratings.length)]
  const numAnalysts = Math.floor(Math.random() * 15) + 5 // 5-20 analysts

  // Simulate target price based on current price (assuming stock data is available)
  // For demo, we'll use a generic base and add variability
  const baseTargetPrice = 1000 + Math.random() * 500
  const targetPrice = (baseTargetPrice * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2) // +/- 10%

  return {
    lastUpdated: new Date().toISOString(),
    consensusRating: randomRating,
    averageTargetPrice: Number.parseFloat(targetPrice),
    numberOfAnalysts: numAnalysts,
    highTarget: Number.parseFloat((Number.parseFloat(targetPrice) * (1 + Math.random() * 0.05)).toFixed(2)),
    lowTarget: Number.parseFloat((Number.parseFloat(targetPrice) * (1 - Math.random() * 0.05)).toFixed(2)),
    ratingTrend: Math.random() > 0.6 ? "Upgraded" : Math.random() > 0.3 ? "Downgraded" : "Stable",
    fallback: true, // Indicate that this is simulated data
  }
}

export async function POST(request: Request) {
  try {
    const { symbol } = await request.json()
    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }
    const ratings = await getAnalystRatings(symbol)
    return NextResponse.json({ symbol, ratings })
  } catch (error) {
    console.error("Error fetching analyst ratings:", error)
    return NextResponse.json({ error: "Failed to fetch analyst ratings" }, { status: 500 })
  }
}
