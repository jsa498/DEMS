import { IconClock } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface FeatureComingSoonProps {
  title: string
  icon: React.ReactNode
  description?: string
}

export function FeatureComingSoon({ 
  title, 
  icon, 
  description = "This feature will be available after your training has been completed." 
}: FeatureComingSoonProps) {
  return (
    <div className="container max-w-4xl mx-auto">
      <Card className="border-none shadow-none bg-muted/40">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base mt-2">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4 pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
            <IconClock className="h-4 w-4" />
            <span>Coming soon</span>
          </div>
          <Button asChild className="mt-4">
            <Link href="/dashboard">
              Return to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 