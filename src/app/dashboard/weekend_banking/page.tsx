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
import { ArrowUpDown, ChevronDown } from 'lucide-react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import supabase from '@/lib/supabase'

type AccessLog = {
  id: number
  user_estim: string
  ip_address: string
  nama: string
  tanggal_awal: Date
  tanggal_akhir: Date
  jenis_permohonan: string
}

export default function WeekendBankingTable() {
  const [accessLogs, setAccessLogs] = React.useState<AccessLog[]>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [newLog, setNewLog] = React.useState<Omit<AccessLog, 'id' | 'akses_count' | 'last_access'>>(
    {
      user_estim: '',
      ip_address: '',
      nama: '',
      tanggal_awal: new Date(),
      tanggal_akhir: new Date(),
      jenis_permohonan: '',
    },
  )
  const [users, setUsers] = React.useState<
    Array<{
      user_estim: string
      ip_address: string
      nama: string
    }>
  >([])

  React.useEffect(() => {
    fetchUsers()
    fetchAccessLogs()
  }, [])

  const groupUsersByEstim = (
    users: Array<{
      user_estim: string
      ip_address: string
      nama: string
    }>,
  ) => {
    const grouped = users.reduce(
      (acc, user) => {
        if (!acc[user.user_estim]) {
          acc[user.user_estim] = user
        }
        return acc
      },
      {} as Record<string, { user_estim: string; ip_address: string; nama: string }>,
    )

    return Object.values(grouped)
  }

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('user_estim, ip_address, nama')
      .not('user_estim', 'is', null)

    if (error) {
      console.error('Error fetching users:', error)
      return
    }

    const groupedUsers = groupUsersByEstim(data || [])
    setUsers(groupedUsers)
  }

  async function fetchAccessLogs() {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('user_estim, ip_address, nama')

    if (userError) {
      console.error('Error fetching users:', userError)
      return
    }

    const { data: logsData, error: logsError } = await supabase.from('access_logs').select('*')

    if (logsError) {
      console.error('Error fetching access logs:', logsError)
      return
    }

    const combinedData = logsData?.map(log => {
      const user = userData?.find(u => u.user_estim === log.user_estim)
      return {
        ...log,
        ip_address: user?.ip_address || '',
        nama: user?.nama || '',
      }
    })

    setAccessLogs(combinedData || [])
  }

  async function handleAddLog() {
    const { error } = await supabase.from('access_logs').insert({
      ...newLog,
      akses_count: 0,
      last_access: new Date().toISOString(),
    })
    if (error) {
      console.error('Error adding log:', error)
      return
    }
    fetchAccessLogs()
    setIsDialogOpen(false)
    setNewLog({
      user_estim: '',
      ip_address: '',
      nama: '',
      tanggal_awal: new Date(),
      tanggal_akhir: new Date(),
      jenis_permohonan: '',
    })
  }

  const columns: ColumnDef<AccessLog>[] = [
    { accessorKey: 'user_estim', header: 'User ESTIM' },
    { accessorKey: 'ip_address', header: 'IP Address' },
    { accessorKey: 'nama', header: 'Nama Pemegang' },
    {
      accessorKey: 'tanggal_awal',
      header: 'Tanggal Awal',
      cell: ({ row }) => (
        <span>
          {new Date(row.original.tanggal_awal).toLocaleString('id-ID', {
            dateStyle: 'medium',
          })}
        </span>
      ),
    },
    {
      accessorKey: 'tanggal_akhir',
      header: 'Tanggal Akhir',
      cell: ({ row }) => (
        <span>
          {new Date(row.original.tanggal_akhir).toLocaleString('id-ID', {
            dateStyle: 'medium',
          })}
        </span>
      ),
    },
    { accessorKey: 'jenis_permohonan', header: 'Jenis Permohonan' },
  ]

  const table = useReactTable({
    data: accessLogs,
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <Input
          placeholder="Filter logs..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <DialogTrigger asChild> */}
          <Button onClick={() => setIsDialogOpen(true)}>Add New Data</Button>
          {/* </DialogTrigger> */}
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Access Log</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select
              value={newLog.user_estim || undefined}
              onValueChange={value => {
                const selectedUser = users.find(u => u.user_estim === value)
                setNewLog({
                  ...newLog,
                  user_estim: value,
                  ip_address: selectedUser?.ip_address || '',
                  nama: selectedUser?.nama || '',
                })
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih User ESTIM" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter(user => user.user_estim && user.user_estim.trim() !== '')
                  .map(user => (
                    <SelectItem key={user.user_estim} value={user.user_estim}>
                      {user.user_estim} - {user.nama}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Input placeholder="IP Address" value={newLog.ip_address} disabled />
            <Input placeholder="Nama" value={newLog.nama} disabled />
            <Input
              type="date"
              placeholder="Tanggal Awal"
              value={newLog.tanggal_awal.toISOString().substring(0, 10)}
              onChange={e => setNewLog({ ...newLog, tanggal_awal: new Date(e.target.value) })}
            />
            <Input
              type="date"
              placeholder="Tanggal Akhir"
              value={newLog.tanggal_akhir.toISOString().substring(0, 10)}
              onChange={e =>
                setNewLog({
                  ...newLog,
                  tanggal_akhir: new Date(e.target.value),
                })
              }
            />
            <Select
              value={newLog.jenis_permohonan || undefined}
              onValueChange={value => setNewLog({ ...newLog, jenis_permohonan: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Jenis Permohonan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekend Banking">Weekend Banking</SelectItem>
                <SelectItem value="Perpanjangan Akses">Perpanjangan Akses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddLog}>Add Data</Button>
        </DialogContent>
      </Dialog>
      <div className="rounded-md border">
        <Card>
          <CardHeader className="font-bold text-lg">
            Weekend Banking dan Perpanjangan Akses
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead key={header.id}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      No data found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between items-center py-4">
        <span className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} rows
        </span>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
