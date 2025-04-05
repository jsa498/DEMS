import { IconHelp } from "@tabler/icons-react"
import { FeatureComingSoon } from "@/components/feature-coming-soon"

export const metadata = {
  title: "Help | Employee Portal",
  description: "Get help and support",
}

export default function HelpPage() {
  return (
    <div className="flex-1 py-4 md:py-6">
      <FeatureComingSoon 
        title="Help Center" 
        icon={<IconHelp className="h-8 w-8" />} 
        description="The help center will be available after your training has been completed. Here you'll be able to access support resources and get assistance with the platform."
      />
    </div>
  )
} 