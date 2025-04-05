'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { IconTrash, IconPlus } from '@tabler/icons-react';

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { User } from '@/lib/types';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [addEmployeeDialogOpen, setAddEmployeeDialogOpen] = useState(false);
  const { session, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // New employee form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'sales' | 'engineer'>('sales');
  const [pin, setPin] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .neq('role', 'admin') // Filter out admin users
          .order('name');
        
        if (error) {
          throw error;
        }
        
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    if (session.isAuthenticated && session.user?.role === 'admin') {
      fetchUsers();
    }
  }, [session]);

  // Check if user is authenticated and is an admin
  useEffect(() => {
    if (!authLoading && !session.isAuthenticated) {
      router.push('/login');
    } else if (!authLoading && session.isAuthenticated && session.user?.role !== 'admin') {
      toast.error('Only admins can access this page');
      router.push('/dashboard');
    }
  }, [authLoading, session, router]);

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userToDelete);
      
      if (error) {
        throw error;
      }
      
      // Update users list after deletion
      setUsers(users.filter(user => user.id !== userToDelete));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    } finally {
      setConfirmDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleAddEmployee = () => {
    // Reset form fields
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setRole('sales');
    setPin('');
    
    // Open dialog
    setAddEmployeeDialogOpen(true);
  };

  const submitEmployeeForm = async () => {
    // Basic validation
    if (!firstName || !lastName || !pin) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (pin.length < 4) {
      toast.error('PIN must be at least 4 digits');
      return;
    }

    setFormSubmitting(true);

    try {
      // Create a username from first initial and last name, lowercase
      const username = (firstName.charAt(0) + lastName).toLowerCase();
      const fullName = `${firstName} ${lastName}`;

      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            username, 
            name: fullName, 
            pin, 
            role 
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      // Add new user to the state
      if (data && data[0]) {
        setUsers([...users, data[0]]);
      }
      
      toast.success('Employee added successfully');
      setAddEmployeeDialogOpen(false);
    } catch (error: unknown) {
      console.error('Error adding employee:', error);

      // Check if the error object has a 'code' property before accessing it
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
        toast.error('Username already exists. Try a different name.');
      } else {
        toast.error('Failed to add employee');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'sales':
        return 'default';
      case 'engineer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex justify-between items-center px-4 lg:px-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                  <p className="text-muted-foreground">Manage your organization&apos;s employees</p>
                </div>
                <Button onClick={handleAddEmployee} className="flex items-center gap-1">
                  <IconPlus className="h-4 w-4" />
                  <span>Add Employee</span>
                </Button>
              </div>
              
              <div className="px-4 lg:px-6 space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center min-h-[300px]">
                    <p>Loading employees...</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Employee ID</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              No employees found
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>
                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteClick(user.id)}
                                  className="text-destructive hover:text-destructive/90"
                                >
                                  <IconTrash className="h-4 w-4" />
                                  <span className="sr-only">Delete user</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={addEmployeeDialogOpen} onOpenChange={setAddEmployeeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Fill out the form below to add a new employee to your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={(value) => setRole(value as 'sales' | 'engineer')}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="engineer">Engineer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="pin">PIN * (at least 4 digits)</Label>
              <Input
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                type="password"
                minLength={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEmployeeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitEmployeeForm} 
              disabled={formSubmitting || !firstName || !lastName || !pin}
            >
              {formSubmitting ? 'Adding...' : 'Add Employee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
} 