export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'sales' | 'engineer';
  created_at: string;
  updated_at: string;
}

export interface Session {
  user: User | null;
  isAuthenticated: boolean;
}

export interface Project {
  id: number;
  name: string;
  status: 'Lead' | 'Client' | 'In Development' | 'Completed';
  sale_id?: number;
  engineer_id?: number;
  sale?: User;
  engineer?: User;
  created_at: string;
  updated_at: string;
} 