import { IconSettings } from "@tabler/icons-react"
import { FeatureComingSoon } from "@/components/feature-coming-soon"

export const metadata = {
  title: "Settings | Employee Portal",
  description: "Manage your account settings",
}

export default function SettingsPage() {
  return (
    <div className="flex-1 py-4 md:py-6">
      <FeatureComingSoon 
        title="Settings" 
        icon={<IconSettings className="h-8 w-8" />} 
        description="The settings feature will be available after your training has been completed. Here you'll be able to manage your account settings and preferences."
      />
    </div>
  )
} 