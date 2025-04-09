import { IconCirclePlusFilled } from "@tabler/icons-react"
import { EmailForm } from "@/components/email-form"

export const metadata = {
  title: "Quick Create | Employee Portal",
  description: "Send an email to your client",
}

export default function QuickCreatePage() {
  return (
    <main className="flex flex-col min-h-[calc(100vh-theme(spacing.16))]">
      <div className="flex-1 container py-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-4 rounded-full">
            <IconCirclePlusFilled className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mt-4">Quick Create</h1>
          <p className="text-muted-foreground mt-2 text-center max-w-md">
            Use this form to send an email to your client. You can format your message using the rich text editor.
          </p>
        </div>
        <EmailForm />
      </div>
    </main>
  )
} 