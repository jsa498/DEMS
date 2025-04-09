"use client"

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { RichTextEditor } from './ui/rich-text-editor'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface Client {
  id: number
  header: string
  email: string | null
}

export function EmailForm() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('<p>Hi,</p>')
  const [isSending, setIsSending] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientEmail, setSelectedClientEmail] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { session } = useAuth()

  // Fetch clients for the current user
  useEffect(() => {
    const fetchClients = async () => {
      if (!session.user?.id) return

      try {
        setIsLoading(true)
        
        let query = supabase
          .from('projects')
          .select('id, name, email')
          .or('status.eq.Lead,status.eq.Client')
          .order('name', { ascending: true })
        
        // If user is a sales employee, only get their projects
        if (session.user?.role === 'sales') {
          query = query.eq('sale_id', session.user.id)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        // Transform the data into clients with emails
        const clientsWithEmails = (data || [])
          .filter(project => project.email) // Only include projects with emails
          .map(project => ({
            id: project.id,
            header: project.name,
            email: project.email
          }))
        
        setClients(clientsWithEmails)
      } catch (error) {
        console.error('Error fetching clients:', error)
        toast.error('Failed to load clients')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchClients()
  }, [session.user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim()) {
      toast.error('Please enter a subject')
      return
    }

    if (content === '<p>Hi,</p>' || content === '<p></p>' || !content.trim()) {
      toast.error('Please enter a message')
      return
    }

    if (!selectedClientEmail) {
      toast.error('Please select a client email')
      return
    }

    if (!session.user?.id) {
      toast.error('You need to be logged in to send emails')
      return
    }

    try {
      setIsSending(true)
      
      // Prepare message data
      const messageData = {
        sender_id: session.user.id,
        recipient_email: selectedClientEmail,
        subject,
        content,
      }
      
      // Try inserting with recipient_email field
      let { error } = await supabase
        .from('messages')
        .insert([messageData])
        .select()

      // If there's an error about recipient_email column not existing
      if (error && error.message && (
          error.message.includes("column \"recipient_email\" does not exist") || 
          error.message.includes("recipient_email")
        )) {
        console.warn('recipient_email field not available in messages table - falling back to regular message')
        
        // Try again without recipient_email field
        const { error: fallbackError } = await supabase
          .from('messages')
          .insert([{
            sender_id: session.user.id,
            subject: `Email to ${selectedClientEmail}: ${subject}`,
            content: `<p><strong>To: ${selectedClientEmail}</strong></p>${content}`,
          }])
          .select()
          
        // Update our references
        error = fallbackError
      }

      if (error) throw error

      toast.success('Email sent successfully')
      
      // Reset form
      setSubject('')
      setContent('<p>Hi,</p>')
      setSelectedClientEmail('')
      
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error('Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">New Email</CardTitle>
        <CardDescription>
          Create and send an email to your client
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-email">Client Email</Label>
            <Select
              value={selectedClientEmail}
              onValueChange={setSelectedClientEmail}
            >
              <SelectTrigger id="client-email" className="w-full">
                <SelectValue placeholder="Select client email" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading clients...
                  </SelectItem>
                ) : clients.length > 0 ? (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.email || ''}>
                      {client.header} ({client.email})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-clients" disabled>
                    No clients with email found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              className="min-h-[250px]"
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSending || isLoading || clients.length === 0}>
            {isSending ? 'Sending...' : 'Send Email'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
} 