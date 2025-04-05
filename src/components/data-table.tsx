"use client"

import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLoader,
  IconPlus,
  IconUser,
  IconBriefcase,
  IconPointFilled,
  IconChevronUp,
  IconSelector,
} from "@tabler/icons-react"
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
} from "@tanstack/react-table"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"
import { z } from "zod"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

type User = { id: number; name: string; role: string };

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  status: z.string(),
  sale: z.string().optional(),
  engineer: z.string().optional(),
  sale_id: z.number().optional(),
  engineer_id: z.number().optional(),
})

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Add this component before the createColumns function
function DataTableColumnHeader({
  column,
  title,
}: {
  column: Column<z.infer<typeof schema>, unknown>
  title: string
}) {
  if (!column.getCanSort()) {
    return <div className="text-sm font-medium">{title}</div>
  }

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="flex items-center gap-1 p-0 hover:bg-transparent text-sm font-medium"
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <IconChevronUp className="h-3.5 w-3.5" />
      ) : column.getIsSorted() === "desc" ? (
        <IconChevronDown className="h-3.5 w-3.5" />
      ) : (
        <IconSelector className="h-3.5 w-3.5 opacity-50" />
      )}
    </Button>
  )
}

const createColumns = (
  data: z.infer<typeof schema>[],
  setData: React.Dispatch<React.SetStateAction<z.infer<typeof schema>[]>>,
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setProjectToDelete: React.Dispatch<React.SetStateAction<number | null>>,
  isAdmin: boolean,
): ColumnDef<z.infer<typeof schema>>[] => [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "header",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    cell: ({ row }) => {
      return <TableCellViewer 
        item={row.original} 
        onProjectUpdated={() => { /* TODO: Implement refresh logic if needed */ }} 
      />
    },
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      let icon: React.ReactNode = <IconPointFilled />
      let colorClass = "text-muted-foreground"

      switch (status) {
        case "Lead":
          icon = <IconUser className="size-4" />
          colorClass = "text-blue-500 dark:text-blue-400"
          break
        case "Client":
          icon = <IconBriefcase className="size-4" />
          colorClass = "text-purple-500 dark:text-purple-400"
          break
        case "In Development":
          icon = <IconLoader className="size-4 animate-spin" />
          colorClass = "text-orange-500 dark:text-orange-400"
          break
        case "Completed":
          icon = <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
          colorClass = "text-green-500 dark:text-green-400"
          break
      }

      return (
        <Badge variant="outline" className="px-1.5">
          <span className={cn("mr-1.5", colorClass)}>{icon}</span>
          <span className={colorClass}>{status}</span>
        </Badge>
      )
    },
  },
  {
    accessorKey: "sale",
    header: "Client Rep",
    cell: ({ row }) => <div>{row.original.sale || "N/A"}</div>,
  },
  {
    accessorKey: "engineer",
    header: "Engineer",
    cell: ({ row }) => <div>{row.original.engineer || "N/A"}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const projectId = row.original.id;
      
      const handleDelete = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Set the project to delete and open the confirmation dialog
        setProjectToDelete(projectId);
        setDeleteDialogOpen(true);
      };
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Open menu</span>
              <IconDotsVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
            >
              View details
            </DropdownMenuItem>
            {/* Only show delete option for admin users */}
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={handleDelete}
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: z.infer<typeof schema>[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  const { session } = useAuth()
  
  // State for client dialog
  const [addClientDialogOpen, setAddClientDialogOpen] = React.useState(false)
  const [projectName, setProjectName] = React.useState("")
  const [selectedStatus, setSelectedStatus] = React.useState("Lead")
  const [selectedSale, setSelectedSale] = React.useState<number | null>(null)
  const [selectedEngineer, setSelectedEngineer] = React.useState<number | null>(null)
  const [salesUsers, setSalesUsers] = React.useState<User[]>([])
  const [engineerUsers, setEngineerUsers] = React.useState<User[]>([])
  
  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [projectToDelete, setProjectToDelete] = React.useState<number | null>(null)
  const userRole = session.user?.role || '';
  const isAdmin = userRole === 'admin';
  
  // Load sales and engineer users for the dropdown
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch sales users
        const { data: salesData, error: salesError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'sales');
        
        if (salesError) throw salesError;
        setSalesUsers(salesData || []);

        // Fetch engineer users
        const { data: engineerData, error: engineerError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'engineer');
        
        if (engineerError) throw engineerError;
        setEngineerUsers(engineerData || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      }
    };

    if (session.isAuthenticated) {
      fetchUsers();
    }
  }, [session.isAuthenticated]);

  // Update data when initialData changes
  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  // Create the columns with access to data and setData
  const columns = React.useMemo<ColumnDef<z.infer<typeof schema>>[]>(() => {
    return createColumns(data, setData, setDeleteDialogOpen, setProjectToDelete, isAdmin);
  }, [data, isAdmin, setDeleteDialogOpen, setProjectToDelete]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  // Function to add a new client
  const handleAddClient = async () => {
    if (!projectName) {
      toast.error("Please enter a project name");
      return;
    }

    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    // Create client data
    let saleId = selectedSale;
    const engineerId = selectedEngineer;
    
    // If user is a sales employee, automatically set saleId to current user
    if (session.user?.role === 'sales') {
      saleId = session.user.id;
    }

    try {
      // Add to Supabase
      const { data: newProject, error } = await supabase
        .from('projects')
        .insert([
          { 
            name: projectName, 
            status: selectedStatus,
            sale_id: saleId,
            engineer_id: engineerId
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Get user names for display
      let saleName = undefined;
      let engineerName = undefined;
      
      if (saleId) {
        const { data: saleUser } = await supabase
          .from('users')
          .select('name')
          .eq('id', saleId)
          .single();
        
        if (saleUser) {
          saleName = saleUser.name;
        }
      }
      
      if (engineerId) {
        const { data: engineerUser } = await supabase
          .from('users')
          .select('name')
          .eq('id', engineerId)
          .single();
        
        if (engineerUser) {
          engineerName = engineerUser.name;
        }
      }
      
      // Add to local state with correct format for DataTable
      setData(prev => [...prev, {
        id: newProject?.[0]?.id || Math.random(),
        header: projectName,
        status: selectedStatus,
        sale: saleName,
        engineer: engineerName,
        sale_id: saleId || undefined,
        engineer_id: engineerId || undefined
      }]);
      
      // Close dialog and reset form
      setProjectName('');
      setSelectedStatus('');
      setSelectedSale(null);
      setSelectedEngineer(null);
      setAddClientDialogOpen(false);
      
      toast.success("Client added successfully");
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error("Failed to add client");
    }
  };

  // Function to handle tab changes and update filters
  const handleTabChange = (value: string) => {
    const statusColumn = table.getColumn("status")
    if (statusColumn) {
      statusColumn.setFilterValue(value === "all" ? undefined : value)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  // Function to handle client deletion when confirmed
  const confirmDelete = async () => {
    if (projectToDelete === null) return;
    
    // Only admins can delete clients
    if (!isAdmin) {
      toast.error('You do not have permission to delete clients');
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      return;
    }
    
    try {
      // Delete the project from the database
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete);
        
      if (error) throw error;
      
      // Remove the project from the local state
      setData(data.filter(item => item.id !== projectToDelete));
      toast.success('Client deleted successfully');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  return (
    <Tabs
      defaultValue="all"
      className="w-full flex-col justify-start gap-6"
      onValueChange={handleTabChange}
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="Lead">Lead</TabsTrigger>
          <TabsTrigger value="Client">Client</TabsTrigger>
          <TabsTrigger value="In Development">In Development</TabsTrigger>
          <TabsTrigger value="Completed">Completed</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          {/* Client button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setAddClientDialogOpen(true)}
          >
            <IconPlus />
            <span className="hidden lg:inline">Client</span>
          </Button>
        </div>
      </div>
      <TabsContent
        value="all"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {["Lead", "Client", "In Development", "Completed"].map((statusValue) => (
        <TabsContent
          key={statusValue}
          value={statusValue}
          className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
        >
          <div className="overflow-hidden rounded-lg border">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={`${sortableId}-${statusValue}`}
            >
              <Table>
                <TableHeader className="bg-muted sticky top-0 z-10">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} colSpan={header.colSpan}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                  {table.getRowModel().rows?.length ? (
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center"
                      >
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>
          <div className="flex items-center justify-between px-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor={`rows-per-page-${statusValue}`} className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger size="sm" className="w-20" id={`rows-per-page-${statusValue}`}>
                    <SelectValue
                      placeholder={table.getState().pagination.pageSize}
                    />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <IconChevronsLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <IconChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <IconChevronsRight />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      ))}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Client Dialog */}
      <Dialog open={addClientDialogOpen} onOpenChange={setAddClientDialogOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
          <div className="flex flex-col">
            {/* Header Section with dark/neutral background */}
            <div className="bg-muted p-6 border-b">
              <DialogTitle className="text-2xl font-semibold">Add New Project</DialogTitle>
              <DialogDescription className="text-muted-foreground mt-2">
                Create a new lead or client. {!isAdmin && "Only admins can edit details after creation."}
              </DialogDescription>
            </div>

            {/* Form Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Client Name */}
                <div>
                  <Label htmlFor="name" className="text-base font-medium">
                    Client Name
                  </Label>
                  <Input 
                    id="name" 
                    className="mt-2"
                    placeholder="Enter client name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                
                {/* Status */}
                <div>
                  <Label htmlFor="status" className="text-base font-medium">
                    Status
                  </Label>
                  <Select 
                    value={selectedStatus} 
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger id="status" className="mt-2 w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Client">Client</SelectItem>
                      <SelectItem value="In Development">In Development</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sales Representative - Only for admin */}
                  {isAdmin && (
                    <div>
                      <Label htmlFor="sale" className="text-base font-medium">
                        Sales Representative
                      </Label>
                      <Select 
                        value={selectedSale?.toString() || 'none'} 
                        onValueChange={(value) => setSelectedSale(value === "none" ? null : parseInt(value))}
                      >
                        <SelectTrigger id="sale" className="mt-2 w-full">
                          <SelectValue placeholder="Select representative" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {salesUsers.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* Engineer */}
                  <div>
                    <Label htmlFor="engineer" className="text-base font-medium">
                      Engineer
                    </Label>
                    <Select 
                      value={selectedEngineer?.toString() || 'none'} 
                      onValueChange={(value) => setSelectedEngineer(value === "none" ? null : parseInt(value))}
                    >
                      <SelectTrigger id="engineer" className="mt-2 w-full">
                        <SelectValue placeholder="Select engineer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {engineerUsers.map(user => (
                          <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="p-6 flex flex-row justify-end gap-2 border-t bg-muted/20">
              <Button 
                variant="outline" 
                onClick={() => setAddClientDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddClient} 
                disabled={!projectName}
                className="px-8"
              >
                Add Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}

const chartData = [
  { month: "January", leads: 186, clients: 80 },
  { month: "February", leads: 305, clients: 200 },
  { month: "March", leads: 237, clients: 120 },
  { month: "April", leads: 73, clients: 190 },
  { month: "May", leads: 209, clients: 130 },
  { month: "June", leads: 214, clients: 140 },
]

const chartConfig = {
  leads: {
    label: "Leads",
    theme: { light: "var(--chart-1)", dark: "var(--chart-1)" },
  },
  clients: {
    label: "Clients",
    theme: { light: "var(--color-purple)", dark: "var(--color-purple)" },
  },
} satisfies ChartConfig

function TableCellViewer({ 
  item, 
  onProjectUpdated 
}: { 
  item: z.infer<typeof schema>;
  onProjectUpdated: () => void 
}) {
  const isMobile = useIsMobile()
  const { session } = useAuth()
  const userRole = session.user?.role || ''
  const isAdmin = userRole === 'admin'
  const [projectName, setProjectName] = React.useState(item.header)
  const [status, setStatus] = React.useState(item.status)
  const [selectedSaleId, setSelectedSaleId] = React.useState<number | undefined>(item.sale_id)
  const [selectedEngineerId, setSelectedEngineerId] = React.useState<number | undefined>(item.engineer_id)
  const [salesUsers, setSalesUsers] = React.useState<User[]>([])
  const [engineerUsers, setEngineerUsers] = React.useState<User[]>([])
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  
  // Track the original values to detect changes
  const [originalValues, setOriginalValues] = React.useState({
    projectName: item.header,
    status: item.status,
    selectedSaleId: item.sale_id,
    selectedEngineerId: item.engineer_id,
  })
  
  // Function to detect if form has changes
  const hasChanges = React.useMemo(() => {
    return (
      projectName !== originalValues.projectName ||
      status !== originalValues.status ||
      selectedSaleId !== originalValues.selectedSaleId ||
      selectedEngineerId !== originalValues.selectedEngineerId
    )
  }, [projectName, status, selectedSaleId, selectedEngineerId, originalValues])

  // Load sales and engineer users for the dropdown
  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch sales users
        const { data: salesData, error: salesError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'sales');
        
        if (salesError) throw salesError;
        setSalesUsers(salesData || []);

        // Fetch engineer users
        const { data: engineerData, error: engineerError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'engineer');
        
        if (engineerError) throw engineerError;
        setEngineerUsers(engineerData || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      }
    };

    if (drawerOpen) {
      fetchUsers();
      
      // Reset form values to original when drawer opens
      setProjectName(item.header);
      setStatus(item.status);
      setSelectedSaleId(item.sale_id);
      setSelectedEngineerId(item.engineer_id);
      
      // Update original values
      setOriginalValues({
        projectName: item.header,
        status: item.status,
        selectedSaleId: item.sale_id,
        selectedEngineerId: item.engineer_id,
      });
    }
  }, [drawerOpen, item]);

  // Add a useEffect to reset form when drawer is closed
  React.useEffect(() => {
    if (!drawerOpen) {
      // Reset form values when drawer closes without saving
      setProjectName(originalValues.projectName);
      setStatus(originalValues.status);
      setSelectedSaleId(originalValues.selectedSaleId);
      setSelectedEngineerId(originalValues.selectedEngineerId);
    }
  }, [drawerOpen, originalValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Get the project ID from the item
      const projectId = item.id

      // Update the project in Supabase
      const { error } = await supabase
        .from('projects')
        .update({ 
          name: projectName,
          status,
          sale_id: selectedSaleId === undefined ? null : selectedSaleId,
          engineer_id: selectedEngineerId === undefined ? null : selectedEngineerId
        })
        .eq('id', projectId)

      if (error) throw error

      // Update original values after successful save
      setOriginalValues({
        projectName,
        status,
        selectedSaleId,
        selectedEngineerId
      })

      toast.success('Project updated successfully')
      // Trigger refresh of the parent data table
      onProjectUpdated()
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project')
    }
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"} open={drawerOpen} onOpenChange={setDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{projectName}</DrawerTitle>
          <DrawerDescription>
            Project details and information
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <ChartContainer config={chartConfig}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="fillClients" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-purple)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-purple)" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={1.0} />
                      <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="clients"
                    type="natural"
                    fill="url(#fillClients)"
                    stroke="var(--color-purple)"
                  />
                  <Area
                    dataKey="leads"
                    type="natural"
                    fill="url(#fillLeads)"
                    stroke="var(--chart-1)"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Project Information
                </div>
                <div className="text-muted-foreground">
                  {isAdmin 
                    ? "As an admin, you can edit all project details including client representatives and engineers."
                    : "Viewing project details. Only admins can edit this information after creation."}
                </div>
              </div>
              <Separator />
            </>
          )}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3">
              <Label htmlFor="header">Project Details</Label>
              <Input 
                id="header" 
                value={projectName} 
                onChange={(e) => setProjectName(e.target.value)}
                required
                disabled={!isAdmin}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus} disabled={!isAdmin}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lead">Lead</SelectItem>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="In Development">In Development</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="sale">Client Representative</Label>
                <Select
                  value={selectedSaleId?.toString() || "none"}
                  onValueChange={(value) => setSelectedSaleId(value === "none" ? undefined : parseInt(value))}
                  disabled={!isAdmin}
                >
                  <SelectTrigger id="sale">
                    <SelectValue placeholder="Select a client representative" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {salesUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "Choose a client representative for this project" : "Only admins can change the client representative"}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="engineer">Engineer</Label>
                <Select 
                  value={selectedEngineerId?.toString() || "none"} 
                  onValueChange={(value) => setSelectedEngineerId(value === "none" ? undefined : parseInt(value))}
                  disabled={!isAdmin}
                >
                  <SelectTrigger id="engineer">
                    <SelectValue placeholder="Select an engineer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {engineerUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "Choose an engineer for this project" : "Only admins can change the engineer"}
                </p>
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          {hasChanges && isAdmin && (
            <Button onClick={handleSubmit} disabled={!projectName}>
              Save
            </Button>
          )}
          {!isAdmin && (
            <p className="text-sm text-muted-foreground text-center">Only admins can edit project details</p>
          )}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
