import { NextResponse } from "next/server"

// Function to perform a very basic sentiment analysis on a headline
function analyzeHeadlineSentiment(headline: string): number {
  const lowerHeadline = headline.toLowerCase()
  let score = 0

  // Positive keywords
  if (lowerHeadline.includes("gain")) score += 0.2
  if (lowerHeadline.includes("rise")) score += 0.2
  if (lowerHeadline.includes("growth")) score += 0.3
  if (lowerHeadline.includes("strong")) score += 0.3
  if (lowerHeadline.includes("bullish")) score += 0.4
  if (lowerHeadline.includes("profit")) score += 0.3
  if (lowerHeadline.includes("up")) score += 0.1
  if (lowerHeadline.includes("positive")) score += 0.4
  if (lowerHeadline.includes("boost")) score += 0.2
  if (lowerHeadline.includes("surge")) score += 0.3

  // Negative keywords
  if (lowerHeadline.includes("fall")) score -= 0.2
  if (lowerHeadline.includes("drop")) score -= 0.2
  if (lowerHeadline.includes("decline")) score -= 0.3
  if (lowerHeadline.includes("weak")) score -= 0.3
  if (lowerHeadline.includes("bearish")) score -= 0.4
  if (lowerHeadline.includes("loss")) score -= 0.3
  if (lowerHeadline.includes("down")) score -= 0.1
  if (lowerHeadline.includes("negative")) score -= 0.4
  if (lowerHeadline.includes("slump")) score -= 0.3
  if (lowerHeadline.includes("plunge")) score -= 0.3

  // Neutral keywords (to balance out if both positive/negative are present)
  if (lowerHeadline.includes("market")) score += 0
  if (lowerHeadline.includes("stock")) score += 0
  if (lowerHeadline.includes("shares")) score += 0

  // Normalize score to -1 to 1 range (very basic, can be improved with NLP library)
  return Math.max(-1, Math.min(1, score))
}

async function getNewsSentiment(symbol: string) {
  const NEWS_API_KEY = process.env.NEWS_API_KEY
  const query = encodeURIComponent(symbol.replace(".NS", "") + " stock India") // Remove .NS for better search results
  const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=relevancy&apiKey=${NEWS_API_KEY}`

  let isFallback = false
  let articles = []

  if (!NEWS_API_KEY) {
    console.warn("NEWS_API_KEY is not set. Using simulated news data.")
    isFallback = true
  } else {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`NewsAPI HTTP error: ${response.status} - ${response.statusText}`)
        isFallback = true
      } else {
        const data = await response.json()
        if (data.status === "ok" && data.articles.length > 0) {
          articles = data.articles.slice(0, 8) // Get top 8 articles
        } else {
          console.warn("NewsAPI returned no articles or an error status. Using simulated data.")
          isFallback = true
        }
      }
    } catch (error: any) {
      console.error("Error fetching news from NewsAPI:", error.message)
      isFallback = true
    }
  }

  if (isFallback) {
    // Fallback to simulated data if API fails or key is missing
    const simulatedArticles = [
      {
        source: { name: "Economic Times" },
        title: `${symbol} shows strong quarterly results`,
        publishedAt: new Date().toISOString(),
        description: "Company reports robust earnings, exceeding analyst expectations.",
        url: "#",
      },
      {
        source: { name: "Business Standard" },
        title: `Market analysts bullish on ${symbol}`,
        publishedAt: new Date().toISOString(),
        description: "Positive outlook from leading financial institutions.",
        url: "#",
      },
      {
        source: { name: "Moneycontrol" },
        title: `${symbol} faces regulatory challenges`,
        publishedAt: new Date().toISOString(),
        description: "New government policies might impact future operations.",
        url: "#",
      },
      {
        source: { name: "LiveMint" },
        title: `Sector outlook positive for ${symbol}`,
        publishedAt: new Date().toISOString(),
        description: "Industry-wide tailwinds are expected to benefit the stock.",
        url: "#",
      },
      {
        source: { name: "NSE Filings" },
        title: `${symbol} Board approves dividend payout`,
        publishedAt: new Date().toISOString(),
        description: "Shareholders to receive a significant dividend.",
        url: "#",
      },
      {
        source: { name: "BSE Announcements" },
        title: `${symbol} announces new product launch`,
        publishedAt: new Date().toISOString(),
        description: "Innovative product expected to boost market share.",
        url: "#",
      },
      {
        source: { name: "Reuters India" },
        title: `${symbol} secures major new contract`,
        publishedAt: new Date().toISOString(),
        description: "New deal strengthens company's order book.",
        url: "#",
      },
      {
        source: { name: "NDTV Profit" },
        title: `${symbol} shares dip on profit booking`,
        publishedAt: new Date().toISOString(),
        description: "Investors taking profits after recent rally.",
        url: "#",
      },
    ]
    articles = simulatedArticles.slice(0, 8)
  }

  const sentimentScores = articles.map((article: any) => ({
    source: article.source.name,
    headline: article.title,
    sentiment: analyzeHeadlineSentiment(article.title),
    date: article.publishedAt,
    type: "News", // Generic type for now
    url: article.url,
  }))

  const avgSentiment = sentimentScores.reduce((sum, item) => sum + item.sentiment, 0) / sentimentScores.length || 0

  return {
    overallSentiment: avgSentiment,
    sentimentLabel: avgSentiment > 0.2 ? "POSITIVE" : avgSentiment < -0.2 ? "NEGATIVE" : "NEUTRAL",
    confidence: Math.abs(avgSentiment),
    newsCount: sentimentScores.length,
    recentNews: sentimentScores,
    fallback: isFallback,
  }
}

export async function POST(request: Request) {
  try {
    const { symbol } = await request.json()

    const sentiment = await getNewsSentiment(symbol)

    return NextResponse.json({
      symbol,
      sentiment,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("News sentiment error:", error)
    return NextResponse.json({ error: "Failed to analyze news sentiment" }, { status: 500 })
  }
}
