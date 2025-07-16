import { NextResponse } from "next/server"

// Function to fetch USD/INR exchange rate from Alpha Vantage
async function fetchUSDINR(apiKey: string) {
  const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=INR&apikey=${apiKey}`
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`Alpha Vantage HTTP error: ${response.status} - ${response.statusText}`)
      return null
    }

    const data = await response.json()

    if (data["Realtime Currency Exchange Rate"]) {
      return Number.parseFloat(data["Realtime Currency Exchange Rate"]["5. Exchange Rate"])
    } else if (data.Note) {
      console.warn(`Alpha Vantage API limit reached or other issue: ${data.Note}`)
      return null
    } else {
      console.warn("Alpha Vantage USD/INR data not found or invalid format.")
      return null
    }
  } catch (error: any) {
    console.error("Error fetching USD/INR from Alpha Vantage:", error.message)
    return null
  }
}

// Combined function to get macroeconomic indicators
async function getMacroIndicators() {
  const date = new Date()
  const currentMonth = date.toLocaleString("en-US", { month: "long" })
  const currentYear = date.getFullYear()

  let forexUSDINR: number | null = null
  const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY

  if (ALPHA_VANTAGE_API_KEY) {
    forexUSDINR = await fetchUSDINR(ALPHA_VANTAGE_API_KEY)
    if (forexUSDINR) {
      console.log(`Fetched real USD/INR: ${forexUSDINR}`)
    } else {
      console.warn("Failed to fetch real USD/INR, using simulated data.")
    }
  } else {
    console.warn("ALPHA_VANTAGE_API_KEY is not set. Using simulated macroeconomic data.")
  }

  return {
    lastUpdated: date.toISOString(),
    // These indicators are still simulated due to limitations of free APIs for India-specific data
    gdpGrowth: (Math.random() * 2 + 5).toFixed(2), // Simulated annual GDP growth (e.g., 5-7%)
    inflationRate: (Math.random() * 1.5 + 4).toFixed(2), // Simulated annual inflation (e.g., 4-5.5%)
    interestRate: (Math.random() * 0.5 + 6).toFixed(2), // Simulated repo rate (e.g., 6-6.5%)
    crudeOilPrice: (Math.random() * 10 + 70).toFixed(2), // Simulated crude oil price per barrel (e.g., $70-80)
    // Use real USD/INR if fetched, otherwise simulate
    forexUSDINR: forexUSDINR ? forexUSDINR.toFixed(2) : (Math.random() * 0.5 + 82).toFixed(2),
    globalMarketSentiment: (Math.random() - 0.5).toFixed(2), // -1 to 1
    economicOutlook: Math.random() > 0.7 ? "Positive" : Math.random() > 0.3 ? "Neutral" : "Negative",
    keyEvents: [
      `RBI Monetary Policy Meeting in ${currentMonth}`,
      `Q${Math.ceil(date.getMonth() / 3) + 1} GDP data release`,
      `Global crude oil supply report`,
    ],
    fallback: !forexUSDINR, // Indicate fallback if USD/INR couldn't be fetched
  }
}

export async function GET() {
  try {
    const indicators = await getMacroIndicators()
    return NextResponse.json({ indicators })
  } catch (error) {
    console.error("Error fetching macroeconomic indicators:", error)
    return NextResponse.json({ error: "Failed to fetch macroeconomic indicators" }, { status: 500 })
  }
}
