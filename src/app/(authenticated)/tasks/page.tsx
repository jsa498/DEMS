import { IconListCheck } from "@tabler/icons-react"
import { FeatureComingSoon } from "@/components/feature-coming-soon"

export const metadata = {
  title: "Tasks | Employee Portal",
  description: "Manage your tasks and assignments",
}

export default function TasksPage() {
  return (
    <div className="flex-1 py-4 md:py-6">
      <FeatureComingSoon 
        title="Tasks Management" 
        icon={<IconListCheck className="h-8 w-8" />} 
        description="The task management feature will be available after your training has been completed. Here you'll be able to view, manage, and track all your assigned tasks."
      />
    </div>
  )
} 