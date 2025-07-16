import { NextResponse } from "next/server"

// Simulated Financial Statement Data (now representing "Bloomberg" source)
async function getSimulatedBloombergFinancials(symbol: string) {
  const currentYear = new Date().getFullYear()
  const previousYear = currentYear - 1
  const twoYearsAgo = currentYear - 2

  // Simulate some variability based on symbol (simple hash for demo)
  const symbolHash = symbol.charCodeAt(0) + symbol.charCodeAt(1)
  const baseRevenue = 1000 + symbolHash * 10
  const baseProfit = 100 + symbolHash * 2
  const baseEPS = 10 + symbolHash * 0.1
  const baseDebtEquity = 0.5 + symbolHash * 0.01

  return {
    source: "Simulated Bloomberg", // Indicate source
    lastUpdated: new Date().toISOString(),
    annual: [
      {
        year: currentYear,
        revenue: (baseRevenue * (1 + Math.random() * 0.1)).toFixed(2),
        netProfit: (baseProfit * (1 + Math.random() * 0.1)).toFixed(2),
        eps: (baseEPS * (1 + Math.random() * 0.1)).toFixed(2),
        debtToEquity: (baseDebtEquity * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2),
        peRatio: (Math.random() * 10 + 20).toFixed(2), // P/E ratio
        operatingCashflow: (baseProfit * 1.2 * (1 + Math.random() * 0.1)).toFixed(2),
      },
      {
        year: previousYear,
        revenue: (baseRevenue * (1 + Math.random() * 0.05)).toFixed(2),
        netProfit: (baseProfit * (1 + Math.random() * 0.05)).toFixed(2),
        eps: (baseEPS * (1 + Math.random() * 0.05)).toFixed(2),
        debtToEquity: (baseDebtEquity * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2),
        peRatio: (Math.random() * 10 + 18).toFixed(2),
        operatingCashflow: (baseProfit * 1.1 * (1 + Math.random() * 0.05)).toFixed(2),
      },
      {
        year: twoYearsAgo,
        revenue: baseRevenue.toFixed(2),
        netProfit: baseProfit.toFixed(2),
        eps: baseEPS.toFixed(2),
        debtToEquity: baseDebtEquity.toFixed(2),
        peRatio: (Math.random() * 10 + 15).toFixed(2),
        operatingCashflow: (baseProfit * (1 + Math.random() * 0.02)).toFixed(2),
      },
    ],
    financialHealth: Math.random() > 0.7 ? "Strong" : Math.random() > 0.3 ? "Stable" : "Weak",
    growthOutlook: Math.random() > 0.6 ? "Positive" : "Neutral",
    fallback: false, // This is the primary simulated source now
  }
}

export async function POST(request: Request) {
  try {
    const { symbol } = await request.json()
    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    const financialsData = await getSimulatedBloombergFinancials(symbol)

    return NextResponse.json({ symbol, financials: financialsData, source: financialsData.source })
  } catch (error) {
    console.error("Error in financial statements API:", error)
    return NextResponse.json({ error: "Failed to fetch financial statements" }, { status: 500 })
  }
}
