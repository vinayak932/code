import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  const { messages, stockData, technicalAnalysis, newsSentiment, financials, analystRatings, macroIndicators } =
    await req.json()

  const enhancedContext = `
COMPREHENSIVE STOCK ANALYSIS CONTEXT:

CURRENT STOCK DATA:
${stockData ? JSON.stringify(stockData, null, 2) : "No stock data"}

TECHNICAL ANALYSIS:
${technicalAnalysis ? JSON.stringify(technicalAnalysis, null, 2) : "No technical analysis"}

NEWS SENTIMENT:
${newsSentiment ? JSON.stringify(newsSentiment, null, 2) : "No sentiment data"}

FINANCIAL STATEMENTS (Latest Annual):
Source: ${financials?.source || "N/A"}
${financials?.financials?.annual?.[0] ? JSON.stringify(financials.financials.annual[0], null, 2) : "No financial data"}
Overall Financial Health: ${financials?.financials?.financialHealth || "N/A"}
Growth Outlook: ${financials?.financials?.growthOutlook || "N/A"}

ANALYST RATINGS:
${analystRatings ? JSON.stringify(analystRatings.ratings, null, 2) : "No analyst ratings"}

MACROECONOMIC INDICATORS:
${macroIndicators ? JSON.stringify(macroIndicators.indicators, null, 2) : "No macroeconomic data"}

ANALYSIS FRAMEWORK:
1. Technical Indicators Weight: 30%
   - RSI: ${technicalAnalysis?.signals?.rsi?.signal || "N/A"} (${technicalAnalysis?.signals?.rsi?.value?.toFixed(2) || "N/A"})
   - MACD: ${technicalAnalysis?.signals?.macd?.signal || "N/A"}
   - Bollinger Bands: ${technicalAnalysis?.signals?.bollinger?.signal || "N/A"}
   - Trend: ${technicalAnalysis?.signals?.trend?.signal || "N/A"}

2. Sentiment Analysis Weight: 20%
   - Overall News Sentiment: ${newsSentiment?.sentiment?.sentimentLabel || "N/A"}
   - News Confidence: ${newsSentiment?.sentiment?.confidence?.toFixed(2) || "N/A"}
   - Recent News Types: ${newsSentiment?.sentiment?.recentNews?.map((n: any) => n.type).join(", ") || "N/A"}

3. Fundamental Analysis Weight: 20%
   - Latest Revenue: ${financials?.financials?.annual?.[0]?.revenue || "N/A"}
   - Latest Net Profit: ${financials?.financials?.annual?.[0]?.netProfit || "N/A"}
   - Latest EPS: ${financials?.financials?.annual?.[0]?.eps || "N/A"}
   - Debt-to-Equity: ${financials?.financials?.annual?.[0]?.debtToEquity || "N/A"}
   - P/E Ratio: ${financials?.financials?.annual?.[0]?.peRatio || "N/A"}
   - Financial Health: ${financials?.financials?.financialHealth || "N/A"}

4. Analyst & Market Context Weight: 20%
   - Analyst Consensus: ${analystRatings?.ratings?.consensusRating || "N/A"}
   - Average Target Price: ₹${analystRatings?.ratings?.averageTargetPrice?.toFixed(2) || "N/A"}
   - Macroeconomic Outlook: ${macroIndicators?.indicators?.economicOutlook || "N/A"}
   - GDP Growth: ${macroIndicators?.indicators?.gdpGrowth || "N/A"}%
   - Inflation Rate: ${macroIndicators?.indicators?.inflationRate || "N/A"}%

5. Price Action Weight: 10%
   - Current Trend: ${stockData?.changePercent > 0 ? "BULLISH" : "BEARISH"}
   - Momentum: ${Math.abs(stockData?.changePercent || 0) > 2 ? "STRONG" : "WEAK"}

6. Market Hours: ${new Date().getHours() >= 9 && new Date().getHours() < 16 ? "OPEN" : "CLOSED"}
7. Day of Week: ${new Date().toLocaleDateString("en-US", { weekday: "long" })}
`

  const result = await streamText({
    model: openai("gpt-4o"),
    messages,
    system: `You are an advanced AI stock analyst specializing in Indian stocks. Your analysis is based on a comprehensive framework that includes technical indicators, news sentiment, fundamental financial data, analyst ratings, and macroeconomic indicators. Data for financial statements is sourced from either a Supabase cache or a simulated Bloomberg feed.

${enhancedContext}

PREDICTION METHODOLOGY:
1. Analyze all provided data points, considering their respective weights in the framework.
2. Synthesize insights from technical, fundamental, and sentiment analysis.
3. Factor in analyst consensus and broader macroeconomic conditions.
4. Account for current market timing and conditions.
5. Provide confidence levels based on the convergence and strength of all signals.

OUTPUT REQUIREMENTS:
- Direction: BUY/SELL/HOLD with clear, concise reasoning based on the comprehensive data.
- Confidence Level: 60-95% based on signal convergence and data quality.
- Target Price: Specific price with a short-term timeframe (e.g., next 1-3 days).
- Stop Loss: A recommended risk management level.
- Key Factors: Top 3-5 most influential factors driving the prediction, drawing from all data categories.
- Risk Assessment: High/Medium/Low with a brief explanation.

ACCURACY FACTORS:
- Signal Convergence: Higher accuracy when multiple indicators and data types align.
- Data Alignment: Technical + Fundamental + Sentiment + Macro + Analyst agreement.
- Market Conditions: Consider volatility and overall market phase.
- Time Horizon: Specify short-term (next 1-3 days) for actionable insights.

Focus on actionable insights with clear risk-reward ratios for Indian market context.`,
  })

  return result.toDataStreamResponse()
}
