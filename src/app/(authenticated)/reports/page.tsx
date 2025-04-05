import { IconReport } from "@tabler/icons-react"
import { FeatureComingSoon } from "@/components/feature-coming-soon"

export const metadata = {
  title: "Reports | Employee Portal",
  description: "View and generate reports",
}

export default function ReportsPage() {
  return (
    <div className="flex-1 py-4 md:py-6">
      <FeatureComingSoon 
        title="Reports" 
        icon={<IconReport className="h-8 w-8" />} 
        description="The reports feature will be available after your training has been completed. Here you'll be able to view and generate various reports for business analysis."
      />
    </div>
  )
} 