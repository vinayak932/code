"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, IndianRupee } from "lucide-react"

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface StockCardProps {
  stock: Stock
  isSelected?: boolean
  onClick?: () => void
}

export function StockCard({ stock, isSelected, onClick }: StockCardProps) {
  const isPositive = stock.change >= 0

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-sm">{stock.symbol}</h3>
              <p className="text-xs text-gray-500 truncate">{stock.name}</p>
            </div>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              <span className="font-bold text-lg">{stock.price.toFixed(2)}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}
                {stock.change.toFixed(2)}
              </span>
              <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                {isPositive ? "+" : ""}
                {stock.changePercent.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
