import { IconFileWord } from "@tabler/icons-react"
import { FeatureComingSoon } from "@/components/feature-coming-soon"

export const metadata = {
  title: "Documentation | Employee Portal",
  description: "Access company documentation and resources",
}

export default function DocumentationPage() {
  return (
    <div className="flex-1 py-4 md:py-6">
      <FeatureComingSoon 
        title="Documentation" 
        icon={<IconFileWord className="h-8 w-8" />} 
        description="The documentation feature will be available after your training has been completed. Here you'll be able to access company documentation, guides, and resources."
      />
    </div>
  )
} 