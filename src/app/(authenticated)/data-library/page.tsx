import { IconDatabase } from "@tabler/icons-react"
import { FeatureComingSoon } from "@/components/feature-coming-soon"

export const metadata = {
  title: "Data Library | Employee Portal",
  description: "Access company data and resources",
}

export default function DataLibraryPage() {
  return (
    <div className="flex-1 py-4 md:py-6">
      <FeatureComingSoon 
        title="Data Library" 
        icon={<IconDatabase className="h-8 w-8" />} 
        description="The data library will be available after your training has been completed. Here you'll be able to access and manage company data, resources, and analytics."
      />
    </div>
  )
} 