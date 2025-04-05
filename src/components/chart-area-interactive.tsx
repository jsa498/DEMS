"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

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

// This will be replaced with dynamic data
const defaultChartData = [
  { date: "2024-04-01", leads: 0, clients: 0 },
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
  clients: {
    label: "Clients",
    theme: {
      light: "var(--color-purple)",
      dark: "var(--color-purple)",
    },
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const { session } = useAuth()
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartData, setChartData] = React.useState(defaultChartData)

  // Fetch chart data from Supabase
  React.useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Calculate the date range based on selected timeRange
        const endDate = new Date()
        const startDate = new Date()
        
        if (timeRange === "90d") {
          startDate.setDate(startDate.getDate() - 90)
        } else if (timeRange === "30d") {
          startDate.setDate(startDate.getDate() - 30)
        } else if (timeRange === "7d") {
          startDate.setDate(startDate.getDate() - 7)
        }

        // Create a date map for all days in the range
        const dateMap = new Map()
        const currentDate = new Date(startDate)
        
        while (currentDate <= endDate) {
          const dateString = currentDate.toISOString().split('T')[0]
          dateMap.set(dateString, { date: dateString, leads: 0, clients: 0 })
          currentDate.setDate(currentDate.getDate() + 1)
        }

        // Build query for projects
        let query = supabase
          .from('projects')
          .select('created_at, status, sale_id')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: true });
          
        // If user is a sales employee, only get their projects
        if (session.user?.role === 'sales') {
          query = query.eq('sale_id', session.user.id);
        }
        
        // Execute the query
        const { data: projects, error } = await query;
        
        if (error) throw error

        // Process the data
        projects?.forEach(project => {
          const dateString = new Date(project.created_at).toISOString().split('T')[0]
          const entry = dateMap.get(dateString) || { date: dateString, leads: 0, clients: 0 }
          
          if (project.status === 'Lead') {
            entry.leads += 1
          } else if (project.status === 'Client') {
            entry.clients += 1
          }
          
          dateMap.set(dateString, entry)
        })

        // Convert map to array and sort by date
        const chartDataArray = Array.from(dateMap.values())
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        
        setChartData(chartDataArray)
      } catch (error) {
        console.error('Error fetching chart data:', error)
        // Fallback to empty data set
        setChartData(defaultChartData)
      }
    }

    fetchChartData()
  }, [timeRange, session.user?.role, session.user?.id])

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile, session.user?.id])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
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
    <Card className="@container/card" style={{ '--color-leads': 'var(--chart-1)', '--color-clients': 'var(--color-purple)' } as React.CSSProperties}>
      <CardHeader>
        <CardTitle>{session.user?.role === 'sales' ? 'My Leads & Clients' : 'Leads & Clients'}</CardTitle>
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
              <linearGradient id="fillClients" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-clients)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-clients)"
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
              dataKey="clients"
              type="natural"
              fill="url(#fillClients)"
              stroke="var(--color-clients)"
            />
            <Area
              dataKey="leads"
              type="natural"
              fill="url(#fillLeads)"
              stroke="var(--color-leads)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
