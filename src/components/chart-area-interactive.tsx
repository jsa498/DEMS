"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"

export const description = "An interactive area chart"

const chartData = [
  { date: "2024-04-01", leads: 222, sales: 150 },
  { date: "2024-04-02", leads: 97, sales: 180 },
  { date: "2024-04-03", leads: 167, sales: 120 },
  { date: "2024-04-04", leads: 242, sales: 260 },
  { date: "2024-04-05", leads: 373, sales: 290 },
  { date: "2024-04-06", leads: 301, sales: 340 },
  { date: "2024-04-07", leads: 245, sales: 180 },
  { date: "2024-04-08", leads: 409, sales: 320 },
  { date: "2024-04-09", leads: 59, sales: 110 },
  { date: "2024-04-10", leads: 261, sales: 190 },
  { date: "2024-04-11", leads: 327, sales: 350 },
  { date: "2024-04-12", leads: 292, sales: 210 },
  { date: "2024-04-13", leads: 342, sales: 380 },
  { date: "2024-04-14", leads: 137, sales: 220 },
  { date: "2024-04-15", leads: 120, sales: 170 },
  { date: "2024-04-16", leads: 138, sales: 190 },
  { date: "2024-04-17", leads: 446, sales: 360 },
  { date: "2024-04-18", leads: 364, sales: 410 },
  { date: "2024-04-19", leads: 243, sales: 180 },
  { date: "2024-04-20", leads: 89, sales: 150 },
  { date: "2024-04-21", leads: 137, sales: 200 },
  { date: "2024-04-22", leads: 224, sales: 170 },
  { date: "2024-04-23", leads: 138, sales: 230 },
  { date: "2024-04-24", leads: 387, sales: 290 },
  { date: "2024-04-25", leads: 215, sales: 250 },
  { date: "2024-04-26", leads: 75, sales: 130 },
  { date: "2024-04-27", leads: 383, sales: 420 },
  { date: "2024-04-28", leads: 122, sales: 180 },
  { date: "2024-04-29", leads: 315, sales: 240 },
  { date: "2024-04-30", leads: 454, sales: 380 },
  { date: "2024-05-01", leads: 165, sales: 220 },
  { date: "2024-05-02", leads: 293, sales: 310 },
  { date: "2024-05-03", leads: 247, sales: 190 },
  { date: "2024-05-04", leads: 385, sales: 420 },
  { date: "2024-05-05", leads: 481, sales: 390 },
  { date: "2024-05-06", leads: 498, sales: 520 },
  { date: "2024-05-07", leads: 388, sales: 300 },
  { date: "2024-05-08", leads: 149, sales: 210 },
  { date: "2024-05-09", leads: 227, sales: 180 },
  { date: "2024-05-10", leads: 293, sales: 330 },
  { date: "2024-05-11", leads: 335, sales: 270 },
  { date: "2024-05-12", leads: 197, sales: 240 },
  { date: "2024-05-13", leads: 197, sales: 160 },
  { date: "2024-05-14", leads: 448, sales: 490 },
  { date: "2024-05-15", leads: 473, sales: 380 },
  { date: "2024-05-16", leads: 338, sales: 400 },
  { date: "2024-05-17", leads: 499, sales: 420 },
  { date: "2024-05-18", leads: 315, sales: 350 },
  { date: "2024-05-19", leads: 235, sales: 180 },
  { date: "2024-05-20", leads: 177, sales: 230 },
  { date: "2024-05-21", leads: 82, sales: 140 },
  { date: "2024-05-22", leads: 81, sales: 120 },
  { date: "2024-05-23", leads: 252, sales: 290 },
  { date: "2024-05-24", leads: 294, sales: 220 },
  { date: "2024-05-25", leads: 201, sales: 250 },
  { date: "2024-05-26", leads: 213, sales: 170 },
  { date: "2024-05-27", leads: 420, sales: 460 },
  { date: "2024-05-28", leads: 233, sales: 190 },
  { date: "2024-05-29", leads: 78, sales: 130 },
  { date: "2024-05-30", leads: 340, sales: 280 },
  { date: "2024-05-31", leads: 178, sales: 230 },
  { date: "2024-06-01", leads: 178, sales: 200 },
  { date: "2024-06-02", leads: 470, sales: 410 },
  { date: "2024-06-03", leads: 103, sales: 160 },
  { date: "2024-06-04", leads: 439, sales: 380 },
  { date: "2024-06-05", leads: 88, sales: 140 },
  { date: "2024-06-06", leads: 294, sales: 250 },
  { date: "2024-06-07", leads: 323, sales: 370 },
  { date: "2024-06-08", leads: 385, sales: 320 },
  { date: "2024-06-09", leads: 438, sales: 480 },
  { date: "2024-06-10", leads: 155, sales: 200 },
  { date: "2024-06-11", leads: 92, sales: 150 },
  { date: "2024-06-12", leads: 492, sales: 420 },
  { date: "2024-06-13", leads: 81, sales: 130 },
  { date: "2024-06-14", leads: 426, sales: 380 },
  { date: "2024-06-15", leads: 307, sales: 350 },
  { date: "2024-06-16", leads: 371, sales: 310 },
  { date: "2024-06-17", leads: 475, sales: 520 },
  { date: "2024-06-18", leads: 107, sales: 170 },
  { date: "2024-06-19", leads: 341, sales: 290 },
  { date: "2024-06-20", leads: 408, sales: 450 },
  { date: "2024-06-21", leads: 169, sales: 210 },
  { date: "2024-06-22", leads: 317, sales: 270 },
  { date: "2024-06-23", leads: 480, sales: 530 },
  { date: "2024-06-24", leads: 132, sales: 180 },
  { date: "2024-06-25", leads: 141, sales: 190 },
  { date: "2024-06-26", leads: 434, sales: 380 },
  { date: "2024-06-27", leads: 448, sales: 490 },
  { date: "2024-06-28", leads: 149, sales: 200 },
  { date: "2024-06-29", leads: 103, sales: 160 },
  { date: "2024-06-30", leads: 446, sales: 400 },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  leads: {
    label: "Leads",
    theme: {
      light: "var(--chart-1)",
      dark: "var(--chart-1)",
    },
  },
  sales: {
    label: "Sales",
    theme: {
      light: "var(--chart-2)",
      dark: "var(--chart-2)",
    },
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Leads & Sales</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total for the last 3 months
          </span>
          <span className="@[540px]/card:hidden">Last 3 months</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-leads)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-leads)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-sales)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-sales)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 10}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="sales"
              type="natural"
              fill="url(#fillSales)"
              stroke="var(--color-sales)"
              stackId="a"
            />
            <Area
              dataKey="leads"
              type="natural"
              fill="url(#fillLeads)"
              stroke="var(--color-leads)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
