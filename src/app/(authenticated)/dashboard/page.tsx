'use client';

import { useEffect, useState } from 'react';
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// Define a proper type for projects
interface Project {
  id: number;
  header: string;
  status: string;
  sale?: string;
  engineer?: string;
  sale_id?: number;
  engineer_id?: number;
  client_number?: string | null;
}

export default function Page() {
  const { session } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Fetch projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // First get all sales and engineers for later reference
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('role', ['sales', 'engineer']);
        
        if (usersError) throw usersError;

        // This will be our user lookup map
        const userMap = users.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {});

        // Then fetch projects
        let query = supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });
        
        // If user is a sales employee, only show their projects
        if (session.user?.role === 'sales') {
          query = query.eq('sale_id', session.user.id);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;

        // If we don't have any projects yet, create dummy data for initial UI
        if (!data || data.length === 0) {
          setProjects([]);
        } else {
          // Transform the data into the format expected by DataTable
          const formattedProjects = data.map(project => ({
            id: project.id,
            header: project.name,
            status: project.status,
            sale: project.sale_id ? userMap[project.sale_id]?.name : undefined,
            engineer: project.engineer_id ? userMap[project.engineer_id]?.name : undefined,
            sale_id: project.sale_id,
            engineer_id: project.engineer_id,
            client_number: project.client_number
          }));
          
          setProjects(formattedProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    };

    if (session.isAuthenticated) {
      fetchProjects();
    }
  }, [session.isAuthenticated, session.user]);

  if (loadingProjects) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={projects} />
    </div>
  );
} 