import { IconChartBar } from "@tabler/icons-react"
import { FeatureComingSoon } from "@/components/feature-coming-soon"

export const metadata = {
  title: "Analytics | Admin Portal",
  description: "View and analyze business metrics",
}

export default function AnalyticsPage() {
  return (
    <main className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
      <div className="flex-1">
        <FeatureComingSoon 
          title="Analytics" 
          icon={<IconChartBar className="h-8 w-8" />} 
          description="The analytics feature will be available after your training has been completed. Here you'll be able to view comprehensive business metrics, performance data, and generate reports."
        />
      </div>
    </main>
  )
} 