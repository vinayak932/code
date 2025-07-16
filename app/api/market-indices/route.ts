import { NextResponse } from "next/server"

const INDICES = [
  { symbol: "^NSEI", name: "NIFTY 50", fallback: "NIFTY_50.NS" },
  { symbol: "^BSESN", name: "SENSEX", fallback: "BSE.BO" },
  { symbol: "^NSEBANK", name: "BANK NIFTY", fallback: "BANKNIFTY.NS" },
]

// Increased retries to 5 and initialDelay to 2000ms for better resilience against network issues
async function fetchIndexData(symbol: string, fallback?: string, retries = 5, initialDelay = 2000) {
  const symbolsToTry = [symbol, fallback].filter(Boolean)

  for (const sym of symbolsToTry) {
    let currentDelay = initialDelay
    for (let i = 0; i < retries; i++) {
      let controller: AbortController | null = null
      let timeoutId: NodeJS.Timeout | null = null

      try {
        controller = new AbortController()
        timeoutId = setTimeout(() => {
          controller?.abort()
          console.warn(`Fetch for ${sym} timed out after 15s. (Attempt ${i + 1}/${retries})`)
        }, 15000) // 15 second timeout

        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          signal: controller.signal,
        })

        // Clear timeout immediately after successful fetch or error
        if (timeoutId) clearTimeout(timeoutId)

        const responseText = await response.text()

        if (responseText.includes("Too Many Requests") || response.status === 429) {
          console.warn(
            `Rate limit exceeded for ${sym}. Retrying in ${currentDelay / 1000}s... (Attempt ${i + 1}/${retries})`,
          )
          await new Promise((res) => setTimeout(res, currentDelay))
          currentDelay *= 2
          continue
        }

        if (!response.ok) {
          console.error(
            `HTTP error for ${sym}: status ${response.status} - ${response.statusText}. Retrying in ${currentDelay / 1000}s... (Attempt ${i + 1}/${retries}). Response: ${responseText.substring(0, 100)}...`,
          )
          await new Promise((res) => setTimeout(res, currentDelay))
          currentDelay *= 2
          continue
        }

        let data
        try {
          data = JSON.parse(responseText)
        } catch (jsonError: any) {
          console.error(
            `JSON parsing error for ${sym}: ${jsonError.message}. Retrying in ${currentDelay / 1000}s... (Attempt ${i + 1}/${retries}). Response was: ${responseText.substring(0, 100)}...`,
          )
          await new Promise((res) => setTimeout(res, currentDelay))
          currentDelay *= 2
          continue
        }

        if (!data.chart || !data.chart.result || !data.chart.result[0]) {
          console.log(
            `No data in response for ${sym}. Retrying in ${currentDelay / 1000}s... (Attempt ${i + 1}/${retries})`,
          )
          await new Promise((res) => setTimeout(res, currentDelay))
          currentDelay *= 2
          continue
        }

        const result = data.chart.result[0]
        const meta = result.meta

        if (!meta) {
          console.log(`No meta data for ${sym}. Retrying in ${currentDelay / 1000}s... (Attempt ${i + 1}/${retries})`)
          await new Promise((res) => setTimeout(res, currentDelay))
          currentDelay *= 2
          continue
        }

        const currentPrice = meta.regularMarketPrice || meta.previousClose || 0
        const previousClose = meta.previousClose || currentPrice
        const change = currentPrice - previousClose
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

        return {
          symbol: sym,
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: meta.regularMarketVolume || 0,
          success: true,
        }
      } catch (error: any) {
        let errorMessage = error.message
        if (error.name === "AbortError") {
          errorMessage = `Request timed out: ${error.message}`
        } else if (error instanceof TypeError) {
          // 'Failed to fetch' is often a TypeError for network issues (e.g., DNS, connection refused)
          errorMessage = `Network error: ${error.message}`
        }
        console.error(
          `Error fetching data for ${sym}: ${errorMessage}. Retrying in ${currentDelay / 1000}s... (Attempt ${i + 1}/${retries})`,
        )
        await new Promise((res) => setTimeout(res, currentDelay))
        currentDelay *= 2
      } finally {
        if (timeoutId) clearTimeout(timeoutId)
      }
    }
    console.error(`All ${retries} attempts failed for ${sym}. Giving up on this symbol.`)
  }

  // If all symbols and all their retries fail, return null, which will trigger the fallback data in GET()
  return null
}

// Fallback data for when APIs fail
function getFallbackData() {
  return [
    {
      symbol: "^NSEI",
      name: "NIFTY 50",
      price: 21456.78,
      change: 145.32,
      changePercent: 0.68,
      volume: 0,
      fallback: true,
    },
    {
      symbol: "^BSESN",
      name: "SENSEX",
      price: 71234.56,
      change: -89.45,
      changePercent: -0.13,
      volume: 0,
      fallback: true,
    },
    {
      symbol: "^NSEBANK",
      name: "BANK NIFTY",
      price: 45678.9,
      change: 234.67,
      changePercent: 0.52,
      volume: 0,
      fallback: true,
    },
  ]
}

export async function GET() {
  try {
    const indexPromises = INDICES.map(async (index) => {
      const data = await fetchIndexData(index.symbol, index.fallback)
      if (data) {
        return {
          ...data,
          name: index.name,
          fallback: false,
        }
      }
      return null
    })

    const results = await Promise.all(indexPromises)
    const validIndices = results.filter((index) => index !== null)

    if (validIndices.length > 0) {
      return NextResponse.json(validIndices)
    }

    console.log("All market index APIs failed after retries, using fallback data")
    return NextResponse.json(getFallbackData())
  } catch (error) {
    console.error("Error in market indices API:", error)
    return NextResponse.json(getFallbackData())
  }
}
