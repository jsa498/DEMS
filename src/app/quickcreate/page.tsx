import { IconCirclePlusFilled } from "@tabler/icons-react"
import { FeatureComingSoon } from "@/components/feature-coming-soon"

export const metadata = {
  title: "Quick Create | Employee Portal",
  description: "Quickly create new tasks and resources",
}

export default function QuickCreatePage() {
  return (
    <main className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
      <div className="flex-1">
        <FeatureComingSoon 
          title="Quick Create" 
          icon={<IconCirclePlusFilled className="h-8 w-8" />} 
          description="The quick create feature will be available after your training has been completed. Here you'll be able to quickly create new tasks, projects, and other resources."
        />
      </div>
    </main>
  )
} 