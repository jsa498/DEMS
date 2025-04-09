"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { 
  IconMail, 
  IconMailOpened, 
  IconChevronRight 
} from '@tabler/icons-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Message {
  id: number
  sender_id: number
  subject: string
  content: string
  is_read: boolean
  created_at: string
  updated_at: string
  sender?: {
    name: string
    username: string
    role: string
  }
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const { session } = useAuth()
  const router = useRouter()

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!session.isAuthenticated) return
        
        // Only admins can see all messages
        if (session.user?.role !== 'admin') {
          toast.error('Only admins can access messages')
          router.push('/dashboard')
          return
        }

        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(name, username, role)
          `)
          .order('created_at', { ascending: false })
        
        if (error) throw error

        setMessages(data || [])
      } catch (error) {
        console.error('Error fetching messages:', error)
        toast.error('Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [session, router])

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message)
    setMessageDialogOpen(true)

    // Mark as read if not already
    if (!message.is_read) {
      try {
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('id', message.id)
        
        if (error) throw error

        // Update local state
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id ? { ...msg, is_read: true } : msg
          )
        )
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    }
  }

  // Show loading skeleton if data is loading
  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-2/3 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      
      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <IconMail className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium">No messages yet</h2>
            <p className="text-muted-foreground mt-2">
              When employees send messages, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card 
              key={message.id} 
              className={`${!message.is_read ? 'border-primary/50 bg-primary/5' : ''} cursor-pointer transition-colors hover:bg-accent`}
              onClick={() => handleMessageClick(message)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {message.is_read ? 
                      <IconMailOpened className="h-5 w-5 text-muted-foreground" /> : 
                      <IconMail className="h-5 w-5 text-primary" />
                    }
                    <CardTitle className="text-lg">{message.subject}</CardTitle>
                  </div>
                  <IconChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>
                  From: {message.sender?.name} ({message.sender?.role})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(message.created_at), 'PPp')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
                <DialogDescription>
                  <div className="text-sm mt-2">
                    <div className="flex justify-between">
                      <div>
                        <p><strong>From:</strong> {selectedMessage.sender?.name} ({selectedMessage.sender?.role})</p>
                        <p><strong>To:</strong> golu@gmail.com</p>
                      </div>
                      <p className="text-muted-foreground">{format(new Date(selectedMessage.created_at), 'PPpp')}</p>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="border-t mt-4 pt-4">
                <div 
                  className="prose prose-sm dark:prose-invert max-w-none overflow-auto"
                  dangerouslySetInnerHTML={{ __html: selectedMessage.content }}
                />
              </div>
              <div className="mt-6 flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setMessageDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 