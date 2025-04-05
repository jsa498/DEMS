import { IconCalendarEvent } from "@tabler/icons-react"
import { FeatureComingSoon } from "@/components/feature-coming-soon"

export const metadata = {
  title: "Calendar | Employee Portal",
  description: "View and manage your schedule",
}

export default function CalendarPage() {
  return (
    <div className="flex-1 py-4 md:py-6">
      <FeatureComingSoon 
        title="Calendar" 
        icon={<IconCalendarEvent className="h-8 w-8" />} 
        description="The calendar feature will be available after your training has been completed. Here you'll be able to view and manage your schedule, meetings, and important dates."
      />
    </div>
  )
} 