"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

export function NavMain({
  items,
  currentPath,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
  }[]
  currentPath?: string
}) {
  const { session } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const isAdmin = session.user?.role === 'admin'

  // Fetch unread message count if user is admin
  useEffect(() => {
    if (!isAdmin) return

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false)

        if (error) throw error
        
        setUnreadCount(count || 0)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    // Initial fetch
    fetchUnreadCount()

    // Setup subscription for real-time updates
    const subscription = supabase
      .channel('messages-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' }, 
        () => fetchUnreadCount()
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [isAdmin])

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              asChild
            >
              <Link href="/quickcreate">
                <IconCirclePlusFilled />
                <span>Quick Create</span>
              </Link>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
              asChild
            >
              <Link href="/quickcreate">
                <IconMail />
                <span className="sr-only">Inbox</span>
              </Link>
            </Button>
          </SidebarMenuItem>
          {isAdmin && unreadCount > 0 && (
            <SidebarMenuItem>
              <SidebarMenuButton
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-hover active:bg-sidebar-active min-w-8"
                asChild
              >
                <Link href="/messages">
                  <Badge variant="destructive" className="mr-2">
                    {unreadCount}
                  </Badge>
                  <span>New Messages</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = currentPath === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  className={cn(
                    "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-hover active:bg-sidebar-active min-w-8",
                    isActive &&
                      "text-sidebar-foreground bg-sidebar-active hover:bg-sidebar-active"
                  )}
                  asChild
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.title === 'Messages' && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto">
                        {unreadCount}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
