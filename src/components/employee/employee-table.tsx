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
import type { Employee } from '@/lib/types/Employee/formEmployee'

interface EmployeeTableProps {
  employees: Employee[]
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
  globalFilter: string
  departmentFilter: string
}

export function EmployeeTable({
  employees,
  onEdit,
  onDelete,
  globalFilter,
  departmentFilter,
}: EmployeeTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'nip',
      header: 'NIP',
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm truncate max-w-20 sm:max-w-none">
          {row.getValue('nip')}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Nama',
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm truncate max-w-30 sm:max-w-none">
          {row.getValue('name')}
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm truncate max-w-25 sm:max-w-none">
          {row.getValue('department')}
        </div>
      ),
    },
    {
      accessorKey: 'jabatan',
      header: 'Jabatan',
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm truncate max-w-25 sm:max-w-none">
          {row.getValue('jabatan')}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Created At',
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm whitespace-nowrap">
          {row.getValue('created_at')
            ? new Date(row.getValue('created_at') as string).toLocaleDateString('id-ID')
            : '-'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => {
        const employee = row.original
        return (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(employee)}
              className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(employee)}
              className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              Delete
            </Button>
          </div>
        )
      },
    },
  ]

  React.useEffect(() => {
    // Update column filters when external filter values change
    setPageIndex(0)
    setColumnFilters(prev => {
      let newFilters = [...prev]

      // Update department filter
      if (departmentFilter) {
        newFilters = newFilters.filter(filter => filter.id !== 'department')
        newFilters.push({ id: 'department', value: departmentFilter })
      } else {
        newFilters = newFilters.filter(filter => filter.id !== 'department')
      }

      return newFilters
    })
  }, [departmentFilter])

  const table = useReactTable({
    data: employees,
    getRowId: row => row.id!.toString(),
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
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id} className="bg-muted/50">
                  {headerGroup.headers.map(header => (
                    <TableHead
                      key={header.id}
                      className="font-semibold text-xs sm:text-sm px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center h-32 text-muted-foreground text-sm"
                  >
                    Tidak ada data pegawai
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} className="hover:bg-muted/50">
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
        <span className="text-xs sm:text-sm text-muted-foreground">
          Total {table.getFilteredRowModel().rows.length} pegawai
        </span>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Halaman {pageIndex + 1} dari {table.getPageCount()}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex(prev => Math.max(0, prev - 1))}
              disabled={!table.getCanPreviousPage()}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex(prev => Math.min(table.getPageCount() - 1, prev + 1))}
              disabled={!table.getCanNextPage()}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
