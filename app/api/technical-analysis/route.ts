import { NextResponse } from "next/server"

// Technical Analysis Functions
function calculateSMA(prices: number[], period: number): number[] {
  const sma = []
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }
  return sma
}

function calculateEMA(prices: number[], period: number): number[] {
  const ema = []
  const multiplier = 2 / (period + 1)
  ema[0] = prices[0]

  for (let i = 1; i < prices.length; i++) {
    ema[i] = prices[i] * multiplier + ema[i - 1] * (1 - multiplier)
  }
  return ema
}

function calculateRSI(prices: number[], period = 14): number[] {
  const gains = []
  const losses = []

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    gains.push(change > 0 ? change : 0)
    losses.push(change < 0 ? Math.abs(change) : 0)
  }

  const rsi = []
  for (let i = period - 1; i < gains.length; i++) {
    const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period
    const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period

    if (avgLoss === 0) {
      rsi.push(100)
    } else {
      const rs = avgGain / avgLoss
      rsi.push(100 - 100 / (1 + rs))
    }
  }

  return rsi
}

function calculateMACD(prices: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)

  const macd = []
  for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
    macd.push(ema12[i] - ema26[i])
  }

  const signal = calculateEMA(macd, 9)
  const histogram = []

  for (let i = 0; i < Math.min(macd.length, signal.length); i++) {
    histogram.push(macd[i] - signal[i])
  }

  return { macd, signal, histogram }
}

function calculateBollingerBands(prices: number[], period = 20, stdDev = 2) {
  const sma = calculateSMA(prices, period)
  const bands = { upper: [], middle: [], lower: [] }

  for (let i = 0; i < sma.length; i++) {
    const slice = prices.slice(i, i + period)
    const mean = sma[i]
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)

    bands.upper.push(mean + standardDeviation * stdDev)
    bands.middle.push(mean)
    bands.lower.push(mean - standardDeviation * stdDev)
  }

  return bands
}

function generateTechnicalSignals(data: any) {
  const prices = data.map((d: any) => d.close)
  const volumes = data.map((d: any) => d.volume)

  const rsi = calculateRSI(prices)
  const macd = calculateMACD(prices)
  const bollinger = calculateBollingerBands(prices)
  const sma20 = calculateSMA(prices, 20)
  const sma50 = calculateSMA(prices, 50)

  const currentPrice = prices[prices.length - 1]
  const currentRSI = rsi[rsi.length - 1]
  const currentMACD = macd.macd[macd.macd.length - 1]
  const currentSignal = macd.signal[macd.signal.length - 1]

  // Generate signals
  const signals = {
    rsi: {
      value: currentRSI,
      signal: currentRSI > 70 ? "SELL" : currentRSI < 30 ? "BUY" : "NEUTRAL",
      strength: Math.abs(currentRSI - 50) / 50,
    },
    macd: {
      value: currentMACD,
      signal: currentMACD > currentSignal ? "BUY" : "SELL",
      strength: Math.abs(currentMACD - currentSignal) / Math.max(Math.abs(currentMACD), Math.abs(currentSignal)),
    },
    bollinger: {
      upper: bollinger.upper[bollinger.upper.length - 1],
      lower: bollinger.lower[bollinger.lower.length - 1],
      signal:
        currentPrice > bollinger.upper[bollinger.upper.length - 1]
          ? "SELL"
          : currentPrice < bollinger.lower[bollinger.lower.length - 1]
            ? "BUY"
            : "NEUTRAL",
    },
    trend: {
      sma20: sma20[sma20.length - 1],
      sma50: sma50[sma50.length - 1],
      signal: sma20[sma20.length - 1] > sma50[sma50.length - 1] ? "BULLISH" : "BEARISH",
    },
  }

  return signals
}

export async function POST(request: Request) {
  try {
    const { symbol } = await request.json()

    // Determine the base URL for internal API calls
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    // Fetch historical data
    const response = await fetch(`${baseUrl}/api/stock-history?symbol=${symbol}&period=3mo`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(15000), // 15 second timeout
    })
    const historicalData = await response.json()

    if (!historicalData || historicalData.length === 0) {
      return NextResponse.json({ error: "No historical data available" }, { status: 404 })
    }

    const technicalSignals = generateTechnicalSignals(historicalData)

    return NextResponse.json({
      symbol,
      signals: technicalSignals,
      dataPoints: historicalData.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Technical analysis error:", error)
    return NextResponse.json({ error: "Failed to perform technical analysis" }, { status: 500 })
  }
}
