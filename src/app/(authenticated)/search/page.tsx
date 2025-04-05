import { IconSearch } from "@tabler/icons-react"
import { FeatureComingSoon } from "@/components/feature-coming-soon"

export const metadata = {
  title: "Search | Employee Portal",
  description: "Search for content across the platform",
}

export default function SearchPage() {
  return (
    <div className="flex-1 py-4 md:py-6">
      <FeatureComingSoon 
        title="Search" 
        icon={<IconSearch className="h-8 w-8" />} 
        description="The search feature will be available after your training has been completed. Here you'll be able to search for content across the entire platform."
      />
    </div>
  )
} 