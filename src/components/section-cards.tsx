"use client"

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const { session } = useAuth();
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalClients: 0,
    completedProjects: 0,
    growthRate: 0,
    leadsTrend: { value: 0, isUp: false },
    clientsTrend: { value: 0, isUp: false },
    projectsTrend: { value: 0, isUp: true },
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Base queries
        let leadsQuery = supabase
          .from("projects")
          .select("id")
          .eq("status", "Lead");
        
        let clientsQuery = supabase
          .from("projects")
          .select("id")
          .eq("status", "Client");
        
        let completedQuery = supabase
          .from("projects")
          .select("id")
          .eq("status", "Completed");
        
        // If user is a sales rep, filter by their ID
        if (session.user?.role === 'sales') {
          leadsQuery = leadsQuery.eq("sale_id", session.user.id);
          clientsQuery = clientsQuery.eq("sale_id", session.user.id);
          completedQuery = completedQuery.eq("sale_id", session.user.id);
        }
        
        // Execute the filtered queries
        const { data: leadsData, error: leadsError } = await leadsQuery;
        if (leadsError) throw leadsError;
        
        const { data: clientsData, error: clientsError } = await clientsQuery;
        if (clientsError) throw clientsError;
        
        const { data: completedData, error: completedError } = await completedQuery;
        if (completedError) throw completedError;

        // Calculate previous week leads for trend
        const lastWeek = new Date()
        lastWeek.setDate(lastWeek.getDate() - 7)
        
        let prevWeekLeadsQuery = supabase
          .from("projects")
          .select("id")
          .eq("status", "Lead")
          .lt("created_at", lastWeek.toISOString());
          
        let prevWeekClientsQuery = supabase
          .from("projects")
          .select("id")
          .eq("status", "Client")
          .lt("created_at", lastWeek.toISOString());
          
        // Filter trend queries by sales rep if needed
        if (session.user?.role === 'sales') {
          prevWeekLeadsQuery = prevWeekLeadsQuery.eq("sale_id", session.user.id);
          prevWeekClientsQuery = prevWeekClientsQuery.eq("sale_id", session.user.id);
        }
        
        const { data: prevWeekLeads, error: prevWeekLeadsError } = await prevWeekLeadsQuery;
        if (prevWeekLeadsError) throw prevWeekLeadsError;
        
        const { data: prevWeekClients, error: prevWeekClientsError } = await prevWeekClientsQuery;
        if (prevWeekClientsError) throw prevWeekClientsError;

        // Calculate growth rate and trends
        const totalLeads = leadsData?.length || 0
        const totalClients = clientsData?.length || 0
        const completedProjects = completedData?.length || 0
        const prevLeads = prevWeekLeads?.length || 0
        const prevClients = prevWeekClients?.length || 0
        
        // Calculate lead trend percentage
        const leadTrendValue = prevLeads > 0 
          ? Math.round(((totalLeads - prevLeads) / prevLeads) * 100 * 10) / 10
          : 0
        
        // Calculate client trend percentage
        const clientTrendValue = prevClients > 0 
          ? Math.round(((totalClients - prevClients) / prevClients) * 100 * 10) / 10
          : 0
          
        // Set growth rate to 0% for sales employees as requested
        const growthRate = session.user?.role === 'sales' ? 0 : 4.5;

        // Set the calculated stats
        setStats({
          totalLeads,
          totalClients,
          completedProjects,
          growthRate,
          leadsTrend: { 
            value: Math.abs(leadTrendValue), 
            isUp: leadTrendValue >= 0 
          },
          clientsTrend: { 
            value: Math.abs(clientTrendValue), 
            isUp: clientTrendValue >= 0 
          },
          projectsTrend: { value: 5, isUp: true }, // Keep this hardcoded for now
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [session.user])

  // Use "My" prefix for card descriptions for sales role
  const leadLabel = session.user?.role === 'sales' ? 'My Leads' : 'Total Leads';
  const clientLabel = session.user?.role === 'sales' ? 'My Clients' : 'Total Clients';
  const completedLabel = session.user?.role === 'sales' ? 'My Completed Projects' : 'Completed Projects';

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{leadLabel}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalLeads.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.leadsTrend.isUp ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.leadsTrend.isUp ? '+' : '-'}{stats.leadsTrend.value}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.leadsTrend.isUp ? 'Up' : 'Down'} {stats.leadsTrend.value}% this week {stats.leadsTrend.isUp ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Compared to previous week
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{clientLabel}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalClients.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.clientsTrend.isUp ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.clientsTrend.isUp ? '+' : '-'}{stats.clientsTrend.value}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.clientsTrend.isUp ? 'Up' : 'Down'} {stats.clientsTrend.value}% this week {stats.clientsTrend.isUp ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
          </div>
          <div className="text-muted-foreground">
            Compared to previous week
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{completedLabel}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.completedProjects}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{stats.projectsTrend.value}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Up {stats.projectsTrend.value} this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Across all teams</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.growthRate}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +{stats.growthRate}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}