import { NextResponse } from "next/server"

const INITIAL_INDIAN_STOCKS = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries Ltd" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd" },
  { symbol: "INFY.NS", name: "Infosys Ltd" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever Ltd" },
  { symbol: "ITC.NS", name: "ITC Ltd" },
  { symbol: "SBIN.NS", name: "State Bank of India" },
  { symbol: "COALINDIA.NS", name: "Coal India Ltd" },
  { symbol: "NTPC.NS", name: "NTPC Ltd" },
  { symbol: "ONGC.NS", name: "Oil and Natural Gas Corporation Ltd" },
  { symbol: "IOC.NS", name: "Indian Oil Corporation Ltd" },
  { symbol: "BPCL.NS", name: "Bharat Petroleum Corporation Ltd" },
  { symbol: "HINDPETRO.NS", name: "Hindustan Petroleum Corporation Ltd" },
  { symbol: "POWERGRID.NS", name: "Power Grid Corporation of India Ltd" },
  { symbol: "BEL.NS", name: "Bharat Electronics Ltd" },
  { symbol: "HAL.NS", name: "Hindustan Aeronautics Ltd" },
  { symbol: "GAIL.NS", name: "GAIL (India) Ltd" },
  { symbol: "RVNL.NS", name: "Rail Vikas Nigam Ltd" },
  { symbol: "LT.NS", name: "Larsen & Toubro Ltd" },
  { symbol: "M&M.NS", name: "Mahindra & Mahindra Ltd" },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises Ltd" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Ltd" },
  { symbol: "BAJAJFINSV.NS", name: "Bajaj Finserv Ltd" },
  { symbol: "TITAN.NS", name: "Titan Company Ltd" },
  { symbol: "ASIANPAINT.NS", name: "Asian Paints Ltd" },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki India Ltd" },
  { symbol: "ULTRACEMCO.NS", name: "UltraTech Cement Ltd" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical Industries Ltd" },
  { symbol: "NESTLEIND.NS", name: "Nestle India Ltd" },
  // New additions for broader coverage
  { symbol: "WIPRO.NS", name: "Wipro Ltd" },
  { symbol: "TECHM.NS", name: "Tech Mahindra Ltd" },
  { symbol: "GRASIM.NS", name: "Grasim Industries Ltd" },
  { symbol: "SHREECEM.NS", name: "Shree Cement Ltd" },
  { symbol: "HCLTECH.NS", name: "HCL Technologies Ltd" },
  { symbol: "INDUSINDBK.NS", name: "IndusInd Bank Ltd" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank Ltd" },
  { symbol: "AXISBANK.NS", name: "Axis Bank Ltd" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance Ltd" },
  { symbol: "DMART.NS", name: "Avenue Supermarts Ltd" },
  // 20 Penny Stocks (typically < ₹100)
  { symbol: "SUZLON.NS", name: "Suzlon Energy Ltd" },
  { symbol: "IDEA.NS", name: "Vodafone Idea Ltd" },
  { symbol: "RPOWER.NS", name: "Reliance Power Ltd" },
  { symbol: "JPPOWER.NS", name: "Jaiprakash Power Ventures Ltd" },
  { symbol: "IRFC.NS", name: "Indian Railway Finance Corporation Ltd" },
  { symbol: "YESBANK.NS", name: "Yes Bank Ltd" },
  { symbol: "GTLINFRA.NS", name: "GTL Infrastructure Ltd" },
  { symbol: "DISHTV.NS", name: "Dish TV India Ltd" },
  { symbol: "SOUTHBANK.NS", name: "South Indian Bank Ltd" },
  { symbol: "CENTRALBK.NS", name: "Central Bank of India" },
  { symbol: "IOB.NS", name: "Indian Overseas Bank" },
  { symbol: "UCOBANK.NS", name: "UCO Bank" },
  { symbol: "PNB.NS", name: "Punjab National Bank" },
  { symbol: "RAILTEL.NS", name: "RailTel Corporation of India Ltd" },
  { symbol: "IRCON.NS", name: "IRCON International Ltd" },
  { symbol: "NBCC.NS", name: "NBCC (India) Ltd" },
  { symbol: "HUDCO.NS", name: "Housing and Urban Development Corporation Ltd" },
  { symbol: "TRIDENT.NS", name: "Trident Ltd" },
  { symbol: "JPASSOCIAT.NS", name: "Jaiprakash Associates Ltd" },
  { symbol: "RTNPOWER.NS", name: "Rattanindia Power Ltd" },
]

async function fetchYahooFinanceData(symbol: string) {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    const responseText = await response.text()

    if (responseText.includes("Too Many Requests") || response.status === 429) {
      console.warn(`Yahoo Finance rate limit exceeded for ${symbol}.`)
      return null
    }

    if (!response.ok) {
      console.error(
        `Yahoo Finance HTTP error for ${symbol}: status ${response.status} - ${response.statusText}. Response: ${responseText.substring(0, 100)}...`,
      )
      return null
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (jsonError: any) {
      console.error(
        `Yahoo Finance JSON parsing error for ${symbol}: ${jsonError.message}. Response was: ${responseText.substring(0, 100)}...`,
      )
      return null
    }

    if (!data.chart || !data.chart.result || !data.chart.result[0]) {
      console.error(`Yahoo Finance: Invalid response structure for ${symbol}: Missing chart data.`)
      return null
    }

    const result = data.chart.result[0]
    const meta = result.meta

    if (!meta) {
      console.error(`Yahoo Finance: No meta data available for ${symbol}.`)
      return null
    }

    const currentPrice = meta.regularMarketPrice || meta.previousClose || 0
    const previousClose = meta.previousClose || currentPrice
    const change = currentPrice - previousClose
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0

    return {
      symbol: symbol.replace(".NS", ""),
      fullSymbol: symbol,
      name: INITIAL_INDIAN_STOCKS.find((s) => s.symbol === symbol)?.name || symbol.replace(".NS", ""),
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: meta.regularMarketVolume || 0,
      marketCap: meta.marketCap || 0,
      high: meta.regularMarketDayHigh || currentPrice,
      low: meta.regularMarketDayLow || currentPrice,
      fallback: false,
    }
  } catch (error: any) {
    console.error(`Yahoo Finance fetch error for ${symbol}:`, error.message)
    return null
  }
}

// Fallback stock data (used if Yahoo Finance fails)
function getFallbackStockDataForInitial() {
  return [
    {
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd",
      price: 2456.75,
      change: 23.45,
      changePercent: 0.96,
      volume: 1000000,
      marketCap: 1500000000000,
      high: 2480,
      low: 2430,
      fallback: true,
    },
    {
      symbol: "TCS",
      name: "Tata Consultancy Services",
      price: 3789.2,
      change: -45.3,
      changePercent: -1.18,
      volume: 800000,
      marketCap: 1400000000000,
      high: 3820,
      low: 3760,
      fallback: true,
    },
    {
      symbol: "HDFCBANK",
      name: "HDFC Bank Ltd",
      price: 1678.9,
      change: 12.85,
      changePercent: 0.77,
      volume: 1200000,
      marketCap: 900000000000,
      high: 1690,
      low: 1665,
      fallback: true,
    },
    {
      symbol: "INFY",
      name: "Infosys Ltd",
      price: 1534.6,
      change: 28.7,
      changePercent: 1.91,
      volume: 900000,
      marketCap: 650000000000,
      high: 1545,
      low: 1520,
      fallback: true,
    },
    {
      symbol: "ICICIBANK",
      name: "ICICI Bank Ltd",
      price: 1089.45,
      change: -8.25,
      changePercent: -0.75,
      volume: 1100000,
      marketCap: 750000000000,
      high: 1095,
      low: 1080,
      fallback: true,
    },
    {
      symbol: "HINDUNILVR",
      name: "Hindustan Unilever Ltd",
      price: 2234.8,
      change: 15.6,
      changePercent: 0.7,
      volume: 600000,
      marketCap: 520000000000,
      high: 2245,
      low: 2220,
      fallback: true,
    },
    {
      symbol: "ITC",
      name: "ITC Ltd",
      price: 456.3,
      change: 3.45,
      changePercent: 0.76,
      volume: 2000000,
      marketCap: 570000000000,
      high: 460,
      low: 452,
      fallback: true,
    },
    {
      symbol: "SBIN",
      name: "State Bank of India",
      price: 623.75,
      change: -12.4,
      changePercent: -1.95,
      volume: 1500000,
      marketCap: 550000000000,
      high: 635,
      low: 620,
      fallback: true,
    },
    {
      symbol: "COALINDIA",
      name: "Coal India Ltd",
      price: 250.0,
      change: 2.5,
      changePercent: 1.01,
      volume: 5000000,
      marketCap: 150000000000,
      high: 255,
      low: 248,
      fallback: true,
    },
    {
      symbol: "NTPC",
      name: "NTPC Ltd",
      price: 300.0,
      change: 3.0,
      changePercent: 1.0,
      volume: 4000000,
      marketCap: 200000000000,
      high: 305,
      low: 298,
      fallback: true,
    },
    {
      symbol: "ONGC",
      name: "Oil and Natural Gas Corporation Ltd",
      price: 200.0,
      change: -1.5,
      changePercent: -0.74,
      volume: 3000000,
      marketCap: 250000000000,
      high: 202,
      low: 198,
      fallback: true,
    },
    {
      symbol: "IOC",
      name: "Indian Oil Corporation Ltd",
      price: 150.0,
      change: 1.0,
      changePercent: 0.67,
      volume: 6000000,
      marketCap: 180000000000,
      high: 152,
      low: 149,
      fallback: true,
    },
    {
      symbol: "BPCL",
      name: "Bharat Petroleum Corporation Ltd",
      price: 400.0,
      change: 4.0,
      changePercent: 1.01,
      volume: 2500000,
      marketCap: 100000000000,
      high: 405,
      low: 398,
      fallback: true,
    },
    {
      symbol: "HINDPETRO",
      name: "Hindustan Petroleum Corporation Ltd",
      price: 350.0,
      change: -2.0,
      changePercent: -0.57,
      volume: 2000000,
      marketCap: 80000000000,
      high: 352,
      low: 348,
      fallback: true,
    },
    {
      symbol: "POWERGRID",
      name: "Power Grid Corporation of India Ltd",
      price: 240.0,
      change: 2.4,
      changePercent: 1.01,
      volume: 3000000,
      marketCap: 160000000000,
      high: 242,
      low: 238,
      fallback: true,
    },
    {
      symbol: "BEL",
      name: "Bharat Electronics Ltd",
      price: 180.0,
      change: 1.8,
      changePercent: 1.01,
      volume: 1500000,
      marketCap: 70000000000,
      high: 182,
      low: 178,
      fallback: true,
    },
    {
      symbol: "HAL",
      name: "Hindustan Aeronautics Ltd",
      price: 3500.0,
      change: 35.0,
      changePercent: 1.01,
      volume: 800000,
      marketCap: 230000000000,
      high: 3550,
      low: 3480,
      fallback: true,
    },
    {
      symbol: "GAIL",
      name: "GAIL (India) Ltd",
      price: 120.0,
      change: 1.2,
      changePercent: 1.01,
      volume: 4000000,
      marketCap: 80000000000,
      high: 122,
      low: 118,
      fallback: true,
    },
    {
      symbol: "RVNL",
      name: "Rail Vikas Nigam Ltd",
      price: 250.0,
      change: 2.5,
      changePercent: 1.01,
      volume: 7000000,
      marketCap: 50000000000,
      high: 255,
      low: 248,
      fallback: true,
    },
    {
      symbol: "LT",
      name: "Larsen & Toubro Ltd",
      price: 2200.0,
      change: 22.0, // Added missing property
      changePercent: 1.01, // Added missing property
      volume: 1000000, // Added missing property
      marketCap: 300000000000, // Added missing property
      high: 2220, // Added missing property
      low: 2180, // Added missing property
      fallback: true, // Added missing property
    },
    {
      symbol: "M&M",
      name: "Mahindra & Mahindra Ltd",
      price: 1500.0,
      change: 15.0,
      changePercent: 1.01,
      volume: 1000000,
      marketCap: 200000000000,
      high: 1520,
      low: 1480,
      fallback: true,
    },
    {
      symbol: "ADANIENT",
      name: "Adani Enterprises Ltd",
      price: 2500.0,
      change: 25.0,
      changePercent: 1.01,
      volume: 1500000,
      marketCap: 280000000000,
      high: 2520,
      low: 2480,
      fallback: true,
    },
    {
      symbol: "BHARTIARTL",
      name: "Bharti Airtel Ltd",
      price: 800.0,
      change: 8.0,
      changePercent: 1.01,
      volume: 2000000,
      marketCap: 450000000000,
      high: 810,
      low: 790,
      fallback: true,
    },
    {
      symbol: "BAJAJFINSV",
      name: "Bajaj Finserv Ltd",
      price: 1600.0,
      change: 16.0,
      changePercent: 1.01,
      volume: 900000,
      marketCap: 250000000000,
      high: 1620,
      low: 1580,
      fallback: true,
    },
    {
      symbol: "TITAN",
      name: "Titan Company Ltd",
      price: 2800.0,
      change: 28.0,
      changePercent: 1.01,
      volume: 1100000,
      marketCap: 260000000000,
      high: 2820,
      low: 2780,
      fallback: true,
    },
    {
      symbol: "ASIANPAINT",
      name: "Asian Paints Ltd",
      price: 3200.0,
      change: 32.0,
      changePercent: 1.01,
      volume: 700000,
      marketCap: 310000000000,
      high: 3220,
      low: 3180,
      fallback: true,
    },
    {
      symbol: "MARUTI",
      name: "Maruti Suzuki India Ltd",
      price: 9000.0,
      change: 90.0,
      changePercent: 1.01,
      volume: 600000,
      marketCap: 270000000000,
      high: 9050,
      low: 8950,
      fallback: true,
    },
    {
      symbol: "ULTRACEMCO",
      name: "UltraTech Cement Ltd",
      price: 7500.0,
      change: 75.0,
      changePercent: 1.01,
      volume: 500000,
      marketCap: 220000000000,
      high: 7550,
      low: 7450,
      fallback: true,
    },
    {
      symbol: "SUNPHARMA",
      name: "Sun Pharmaceutical Industries Ltd",
      price: 1100.0,
      change: 11.0,
      changePercent: 1.01,
      volume: 1300000,
      marketCap: 290000000000,
      high: 1110,
      low: 1090,
      fallback: true,
    },
    {
      symbol: "NESTLEIND",
      name: "Nestle India Ltd",
      price: 20000.0,
      change: 200.0,
      changePercent: 1.01,
      volume: 400000,
      marketCap: 650000000000,
      high: 20100,
      low: 19900,
      fallback: true,
    },
    // Fallback data for new additions
    {
      symbol: "WIPRO",
      name: "Wipro Ltd",
      price: 450.0,
      change: 4.5,
      changePercent: 1.01,
      volume: 2000000,
      marketCap: 240000000000,
      high: 455,
      low: 445,
      fallback: true,
    },
    {
      symbol: "TECHM",
      name: "Tech Mahindra Ltd",
      price: 1300.0,
      change: 13.0,
      changePercent: 1.01,
      volume: 1500000,
      marketCap: 120000000000,
      high: 1310,
      low: 1290,
      fallback: true,
    },
    {
      symbol: "GRASIM",
      name: "Grasim Industries Ltd",
      price: 2000.0,
      change: 20.0,
      changePercent: 1.01,
      volume: 800000,
      marketCap: 130000000000,
      high: 2020,
      low: 1980,
      fallback: true,
    },
    {
      symbol: "SHREECEM",
      name: "Shree Cement Ltd",
      price: 25000.0,
      change: 250.0,
      changePercent: 1.01,
      volume: 150000,
      marketCap: 90000000000,
      high: 25200,
      low: 24800,
      fallback: true,
    },
    {
      symbol: "HCLTECH",
      name: "HCL Technologies Ltd",
      price: 1200.0,
      change: 12.0,
      changePercent: 1.01,
      volume: 1800000,
      marketCap: 320000000000,
      high: 1210,
      low: 1190,
      fallback: true,
    },
    {
      symbol: "INDUSINDBK",
      name: "IndusInd Bank Ltd",
      price: 1400.0,
      change: 14.0,
      changePercent: 1.01,
      volume: 1000000,
      marketCap: 110000000000,
      high: 1410,
      low: 1390,
      fallback: true,
    },
    {
      symbol: "KOTAKBANK",
      name: "Kotak Mahindra Bank Ltd",
      price: 1800.0,
      change: 18.0,
      changePercent: 1.01,
      volume: 900000,
      marketCap: 350000000000,
      high: 1810,
      low: 1790,
      fallback: true,
    },
    {
      symbol: "AXISBANK",
      name: "Axis Bank Ltd",
      price: 900.0,
      change: 9.0,
      changePercent: 1.01,
      volume: 1600000,
      marketCap: 280000000000,
      high: 905,
      low: 895,
      fallback: true,
    },
    {
      symbol: "BAJFINANCE",
      name: "Bajaj Finance Ltd",
      price: 7000.0,
      change: 70.0,
      changePercent: 1.01,
      volume: 700000,
      marketCap: 430000000000,
      high: 7050,
      low: 6950,
      fallback: true,
    },
    {
      symbol: "DMART",
      name: "Avenue Supermarts Ltd",
      price: 4000.0,
      change: 40.0,
      changePercent: 1.01,
      volume: 300000,
      marketCap: 260000000000,
      high: 4020,
      low: 3980,
      fallback: true,
    },
    // Fallback data for the 20 new Penny Stocks
    {
      symbol: "SUZLON",
      name: "Suzlon Energy Ltd",
      price: 45.2,
      change: 0.85,
      changePercent: 1.92,
      volume: 50000000,
      marketCap: 60000000000,
      high: 46.0,
      low: 44.5,
      fallback: true,
    },
    {
      symbol: "IDEA",
      name: "Vodafone Idea Ltd",
      price: 14.8,
      change: -0.15,
      changePercent: -1.0,
      volume: 80000000,
      marketCap: 45000000000,
      high: 15.0,
      low: 14.6,
      fallback: true,
    },
    {
      symbol: "RPOWER",
      name: "Reliance Power Ltd",
      price: 28.5,
      change: 0.3,
      changePercent: 1.06,
      volume: 30000000,
      marketCap: 10000000000,
      high: 29.0,
      low: 28.0,
      fallback: true,
    },
    {
      symbol: "JPPOWER",
      name: "Jaiprakash Power Ventures Ltd",
      price: 12.1,
      change: 0.1,
      changePercent: 0.83,
      volume: 25000000,
      marketCap: 8000000000,
      high: 12.2,
      low: 11.9,
      fallback: true,
    },
    {
      symbol: "IRFC",
      name: "Indian Railway Finance Corporation Ltd",
      price: 85.6,
      change: 1.2,
      changePercent: 1.42,
      volume: 40000000,
      marketCap: 1100000000000,
      high: 86.0,
      low: 84.5,
      fallback: true,
    },
    {
      symbol: "YESBANK",
      name: "Yes Bank Ltd",
      price: 23.4,
      change: -0.25,
      changePercent: -1.06,
      volume: 70000000,
      marketCap: 70000000000,
      high: 23.6,
      low: 23.2,
      fallback: true,
    },
    {
      symbol: "GTLINFRA",
      name: "GTL Infrastructure Ltd",
      price: 1.55,
      change: 0.05,
      changePercent: 3.33,
      volume: 10000000,
      marketCap: 2000000000,
      high: 1.6,
      low: 1.5,
      fallback: true,
    },
    {
      symbol: "DISHTV",
      name: "Dish TV India Ltd",
      price: 18.7,
      change: 0.2,
      changePercent: 1.08,
      volume: 15000000,
      marketCap: 35000000000,
      high: 18.8,
      low: 18.5,
      fallback: true,
    },
    {
      symbol: "SOUTHBANK",
      name: "South Indian Bank Ltd",
      price: 30.1,
      change: 0.4,
      changePercent: 1.35,
      volume: 20000000,
      marketCap: 60000000000,
      high: 30.3,
      low: 29.8,
      fallback: true,
    },
    {
      symbol: "CENTRALBK",
      name: "Central Bank of India",
      price: 65.3,
      change: 0.7,
      changePercent: 1.08,
      volume: 18000000,
      marketCap: 55000000000,
      high: 65.5,
      low: 64.8,
      fallback: true,
    },
    {
      symbol: "IOB",
      name: "Indian Overseas Bank",
      price: 72.5,
      change: -0.8,
      changePercent: -1.09,
      volume: 22000000,
      marketCap: 80000000000,
      high: 73.0,
      low: 72.0,
      fallback: true,
    },
    {
      symbol: "UCOBANK",
      name: "UCO Bank",
      price: 58.9,
      change: 0.6,
      changePercent: 1.03,
      volume: 17000000,
      marketCap: 45000000000,
      high: 59.2,
      low: 58.5,
      fallback: true,
    },
    {
      symbol: "PNB",
      name: "Punjab National Bank",
      price: 98.1,
      change: 1.1,
      changePercent: 1.13,
      volume: 28000000,
      marketCap: 100000000000,
      high: 98.5,
      low: 97.5,
      fallback: true,
    },
    {
      symbol: "RAILTEL",
      name: "RailTel Corporation of India Ltd",
      price: 32.7,
      change: 0.35,
      changePercent: 1.08,
      volume: 12000000,
      marketCap: 10000000000,
      high: 33.0,
      low: 32.4,
      fallback: true,
    },
    {
      symbol: "IRCON",
      name: "IRCON International Ltd",
      price: 155.8,
      change: 1.5,
      changePercent: 0.97,
      volume: 10000000, // Added missing property
      marketCap: 140000000000, // Added missing property
      high: 156.0, // Added missing property
      low: 154.5, // Added missing property
      fallback: true,
    },
    {
      symbol: "NBCC",
      name: "NBCC (India) Ltd",
      price: 140.2,
      change: 1.4,
      changePercent: 1.01,
      volume: 11000000, // Added missing property
      marketCap: 25000000000, // Added missing property
      high: 140.5, // Added missing property
      low: 139.0, // Added missing property
      fallback: true,
    },
    {
      symbol: "HUDCO",
      name: "Housing and Urban Development Corporation Ltd",
      price: 210.5,
      change: 2.1,
      changePercent: 1.01,
      volume: 13000000, // Added missing property
      marketCap: 40000000000, // Added missing property
      high: 211.0, // Added missing property
      low: 209.0, // Added missing property
      fallback: true,
    },
    {
      symbol: "TRIDENT",
      name: "Trident Ltd",
      price: 38.9,
      change: 0.4,
      changePercent: 1.04,
      volume: 16000000,
      marketCap: 20000000000,
      high: 39.0,
      low: 38.5,
      fallback: true,
    },
    {
      symbol: "JPASSOCIAT",
      name: "Jaiprakash Associates Ltd",
      price: 10.2,
      change: 0.1,
      changePercent: 0.99,
      volume: 9000000,
      marketCap: 5000000000,
      high: 10.3,
      low: 10.1,
      fallback: true,
    },
    {
      symbol: "RTNPOWER",
      name: "Rattanindia Power Ltd",
      price: 15.7,
      change: 0.15,
      changePercent: 0.96,
      volume: 14000000,
      marketCap: 8000000000,
      high: 15.8,
      low: 15.5,
      fallback: true,
    },
  ]
}

export async function GET(request: Request) {
  try {
    const stockPromises = INITIAL_INDIAN_STOCKS.map(async (stock) => {
      const realData = await fetchYahooFinanceData(stock.symbol)

      if (realData) {
        return {
          ...realData,
          name: stock.name,
        }
      } else {
        console.warn(`Skipping stock ${stock.symbol} due to data fetch failure from Yahoo Finance.`)
        return null
      }
    })

    let stocksToReturn = await Promise.all(stockPromises)
    stocksToReturn = stocksToReturn.filter((stock) => stock !== null)

    if (stocksToReturn.length === 0 && INITIAL_INDIAN_STOCKS.length > 0) {
      console.warn("All stock APIs failed for all initial stocks, returning full fallback data.")
      const fallbackStocks = getFallbackStockDataForInitial()
      return NextResponse.json({
        stocks: fallbackStocks,
        hasMore: false,
        totalStocks: fallbackStocks.length,
        currentPage: 1,
        perPage: fallbackStocks.length,
        error: "Failed to fetch any stocks, using fallback data.",
      })
    }

    return NextResponse.json({
      stocks: stocksToReturn,
      hasMore: false,
      totalStocks: stocksToReturn.length,
      currentPage: 1,
      perPage: stocksToReturn.length,
    })
  } catch (error) {
    console.error("Critical error in stocks API:", error)
    const fallbackStocks = getFallbackStockDataForInitial()
    return NextResponse.json({
      stocks: fallbackStocks,
      hasMore: false,
      totalStocks: fallbackStocks.length,
      currentPage: 1,
      perPage: fallbackStocks.length,
      error: "Failed to fetch stocks, using fallback data.",
    })
  }
}
