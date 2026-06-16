'use client'

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'
import { Pencil, Trash } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Incident } from '@/lib/types/Incident/formIncident'
import getPriorityColor from '@/lib/types/util/getPriorityColor'
import getStatusColor from '@/lib/types/util/getStatusColor'

interface IncidentTableProps {
  incidents: Incident[]
  onEdit: (incident: Incident) => void
  onDelete: (id: number) => void
  globalFilter: string
  statusFilter: string
  priorityFilter: string
}

export function IncidentTable({
  incidents,
  onEdit,
  onDelete,
  globalFilter,
  statusFilter,
  priorityFilter,
}: IncidentTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

  const columns: ColumnDef<Incident>[] = [
    {
      accessorKey: 'title',
      header: 'Problem/Error/Kegiatan',
      cell: ({ row }) => <div className="font-medium">{row.getValue('title')}</div>,
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ row }) => (
        <div className="max-w-75 truncate" title={row.getValue('description')}>
          {row.getValue('description')}
        </div>
      ),
    },
    {
      accessorKey: 'reported_by',
      header: 'Pelapor',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">
              {(row.getValue('reported_by') as string).charAt(0).toUpperCase()}
            </span>
          </div>
          <span>{row.getValue('reported_by')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'date_reported',
      header: 'Tanggal Kejadian',
      cell: ({ row }) => (
        <div className="font-medium">
          {format(new Date(row.getValue('date_reported')), 'dd MMM yyyy', {
            locale: id,
          })}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
          >
            {status}
          </span>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.getValue('priority') as string
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}
          >
            {priority}
          </span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(row.original)}
            className="h-8 px-2 lg:px-3"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(row.original.id)}
            className="h-8 px-2 lg:px-3"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  React.useEffect(() => {
    // Update column filters when external filter values change
    setPageIndex(0)
    setColumnFilters(prev => {
      let newFilters = [...prev]

      // Update status filter
      if (statusFilter) {
        newFilters = newFilters.filter(filter => filter.id !== 'status')
        newFilters.push({ id: 'status', value: statusFilter })
      } else {
        newFilters = newFilters.filter(filter => filter.id !== 'status')
      }

      // Update priority filter
      if (priorityFilter) {
        newFilters = newFilters.filter(filter => filter.id !== 'priority')
        newFilters.push({ id: 'priority', value: priorityFilter })
      } else {
        newFilters = newFilters.filter(filter => filter.id !== 'priority')
      }

      return newFilters
    })
  }, [statusFilter, priorityFilter])

  const table = useReactTable({
    data: incidents || [],
    getRowId: row => row.id.toString(),
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: updater => {
      const newState = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater
      setPageIndex(newState.pageIndex)
      setPageSize(newState.pageSize)
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No incidents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {pageIndex + 1} of {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(prev => Math.min(table.getPageCount() - 1, prev + 1))}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
