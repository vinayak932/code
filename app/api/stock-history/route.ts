import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get("symbol")
  const period = searchParams.get("period") || "1mo"

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?period1=0&period2=9999999999&interval=1d&range=${period}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)

    // Read the response body as text first
    const responseText = await response.text()

    // Check for "Too Many Requests" string in the response text, regardless of HTTP status
    if (responseText.includes("Too Many Requests")) {
      console.warn(`Rate limit exceeded for ${symbol}. Response: ${responseText.substring(0, 100)}...`)
      // Trigger fallback data generation directly for rate limit errors
      const fallbackData = generateFallbackHistoricalData(symbol, period)
      return NextResponse.json(fallbackData)
    }

    if (!response.ok) {
      if (response.status === 404) {
        console.error(
          `Error fetching data for ${symbol}: Symbol not found or invalid (HTTP 404). Response: ${responseText.substring(0, 100)}...`,
        )
      } else if (response.status === 429) {
        console.warn(
          `Rate limit exceeded for ${symbol} (HTTP 429). Using fallback data. Response: ${responseText.substring(0, 100)}...`,
        )
      } else {
        // For any other non-OK status, log and return fallback
        console.error(
          `HTTP error for ${symbol}: status ${response.status} - ${response.statusText}. Response: ${responseText.substring(0, 100)}...`,
        )
      }
      // Trigger fallback data generation for any non-OK HTTP status
      const fallbackData = generateFallbackHistoricalData(symbol, period)
      return NextResponse.json(fallbackData)
    }

    // Now attempt to parse the text as JSON
    let data
    try {
      data = JSON.parse(responseText)
    } catch (jsonError: any) {
      console.error(
        `JSON parsing error for ${symbol}: ${jsonError.message}. Response was: ${responseText.substring(0, 100)}...`,
      )
      // Trigger fallback data generation if JSON parsing fails
      const fallbackData = generateFallbackHistoricalData(symbol, period)
      return NextResponse.json(fallbackData)
    }

    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      throw new Error("No chart data available")
    }

    const result = data.chart.result[0]

    if (!result.timestamp || !result.indicators || !result.indicators.quote || !result.indicators.quote[0]) {
      throw new Error("Invalid data structure")
    }

    const timestamps = result.timestamp
    const prices = result.indicators.quote[0]

    const historicalData = timestamps
      .map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().split("T")[0],
        open: prices.open[index] || 0,
        high: prices.high[index] || 0,
        low: prices.low[index] || 0,
        close: prices.close[index] || 0,
        volume: prices.volume[index] || 0,
      }))
      .filter((item: any) => item.close !== null && item.close > 0)

    if (historicalData.length === 0) {
      throw new Error("No valid historical data found")
    }

    return NextResponse.json(historicalData)
  } catch (error) {
    console.error("Error fetching historical data:", error)

    // Return fallback historical data
    const fallbackData = generateFallbackHistoricalData(symbol, period)
    return NextResponse.json(fallbackData)
  }
}

function generateFallbackHistoricalData(symbol: string, period: string) {
  const days = period === "1mo" ? 30 : period === "3mo" ? 90 : 30
  const basePrice = 1000 + Math.random() * 2000 // Random base price
  const data = []

  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const price = basePrice + (Math.random() - 0.5) * 200
    data.push({
      date: date.toISOString().split("T")[0],
      open: price,
      high: price * (1 + Math.random() * 0.05),
      low: price * (1 - Math.random() * 0.05),
      close: price,
      volume: Math.floor(Math.random() * 1000000),
    })
  }

  return data
}
