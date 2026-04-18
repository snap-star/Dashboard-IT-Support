'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import supabase from '@/lib/supabase'
import * as XLSX from 'xlsx'

type Hardware = {
  id: number
  nama_aset: string
  jenis: string
  merk: string
  serial_number: string
  tahun: string
  pengguna: string
  lokasi: string
  status: string
  keterangan: string
}

type User = {
  id: number
  user_estim: string
  nama: string
  ip_address: string
  nip: string
  jabatan: string
}

export default function AssetHardware() {
  const [hardware, setHardware] = React.useState<Hardware[]>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingHardware, setEditingHardware] = React.useState<Hardware | null>(null)
  const [lastUpdated, setLastUpdated] = React.useState<string>('')
  const [newHardware, setNewHardware] = React.useState<Omit<Hardware, 'id'>>({
    nama_aset: '',
    jenis: '',
    merk: '',
    serial_number: '',
    tahun: '',
    pengguna: '',
    lokasi: '',
    status: '',
    keterangan: '',
  })
  const [users, setUsers] = React.useState<User[]>([])

  React.useEffect(() => {
    fetchHardware()
    fetchUsers()
  }, [])

  async function fetchHardware() {
    const { data, error } = await supabase.from('hardware').select('*')
    if (error) {
      console.error('Error fetching hardware:', error)
    } else {
      setHardware(data || [])
      setLastUpdated(new Date().toLocaleString())
    }
  }

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, user_estim, nama, ip_address, nip, jabatan')

    if (error) {
      console.error('Error fetching users:', error)
    } else {
      setUsers(data || [])
    }
  }

  async function handleCreateOrUpdateHardware() {
    if (editingHardware) {
      const { error } = await supabase
        .from('hardware')
        .update(editingHardware)
        .eq('id', editingHardware.id)
      if (error) {
        console.error('Error updating hardware:', error)
        return
      }
    } else {
      const { error } = await supabase.from('hardware').insert([newHardware])
      if (error) {
        console.error('Error creating hardware:', error)
        return
      }
    }
    fetchHardware()
    setIsDialogOpen(false)
    setEditingHardware(null)
    setNewHardware({
      nama_aset: '',
      jenis: '',
      merk: '',
      serial_number: '',
      tahun: '',
      pengguna: '',
      lokasi: '',
      status: '',
      keterangan: '',
    })
  }

  async function handleDeleteHardware(id: number) {
    const { error } = await supabase.from('hardware').delete().eq('id', id)
    if (error) {
      console.error('Error deleting hardware:', error)
      return
    }
    fetchHardware()
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(hardware)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hardware Assets')
    XLSX.writeFile(workbook, 'Data_Aset_Hardware.xlsx')
  }

  const columns: ColumnDef<Hardware>[] = [
    {
      accessorKey: 'nama_aset',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nama Aset
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'jenis',
      header: 'Jenis',
    },
    {
      accessorKey: 'merk',
      header: 'Merk',
    },
    {
      accessorKey: 'serial_number',
      header: 'Serial Number',
    },
    {
      accessorKey: 'tahun',
      header: 'Tahun',
    },
    {
      accessorKey: 'pengguna',
      header: 'Pengguna',
    },
    {
      accessorKey: 'lokasi',
      header: 'Lokasi',
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'keterangan',
      header: 'Keterangan',
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                setEditingHardware(row.original)
                setIsDialogOpen(true)
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDeleteHardware(row.original.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({
    data: hardware,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
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
          placeholder="Filter semua kolom..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            Export Excel
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>Tambah Aset Baru</Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingHardware ? 'Edit Aset' : 'Tambah Aset Baru'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Nama Aset"
              value={editingHardware ? editingHardware.nama_aset : newHardware.nama_aset}
              onChange={e =>
                editingHardware
                  ? setEditingHardware({
                      ...editingHardware,
                      nama_aset: e.target.value,
                    })
                  : setNewHardware({
                      ...newHardware,
                      nama_aset: e.target.value,
                    })
              }
            />
            <Input
              placeholder="Jenis"
              value={editingHardware ? editingHardware.jenis : newHardware.jenis}
              onChange={e =>
                editingHardware
                  ? setEditingHardware({
                      ...editingHardware,
                      jenis: e.target.value,
                    })
                  : setNewHardware({ ...newHardware, jenis: e.target.value })
              }
            />
            <Input
              placeholder="Merk"
              value={editingHardware ? editingHardware.merk : newHardware.merk}
              onChange={e =>
                editingHardware
                  ? setEditingHardware({
                      ...editingHardware,
                      merk: e.target.value,
                    })
                  : setNewHardware({ ...newHardware, merk: e.target.value })
              }
            />
            <Input
              placeholder="Serial Number"
              value={editingHardware ? editingHardware.serial_number : newHardware.serial_number}
              onChange={e =>
                editingHardware
                  ? setEditingHardware({
                      ...editingHardware,
                      serial_number: e.target.value,
                    })
                  : setNewHardware({
                      ...newHardware,
                      serial_number: e.target.value,
                    })
              }
            />
            <Input
              placeholder="Tahun"
              value={editingHardware ? editingHardware.tahun : newHardware.tahun}
              onChange={e =>
                editingHardware
                  ? setEditingHardware({
                      ...editingHardware,
                      tahun: e.target.value,
                    })
                  : setNewHardware({ ...newHardware, tahun: e.target.value })
              }
            />
            <Select
              value={editingHardware ? editingHardware.pengguna : newHardware.pengguna}
              onValueChange={value =>
                editingHardware
                  ? setEditingHardware({ ...editingHardware, pengguna: value })
                  : setNewHardware({ ...newHardware, pengguna: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Pengguna" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.user_estim || `user-${user.id}`}>
                    {user.nama} - {user.user_estim} ({user.jabatan})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={editingHardware ? editingHardware.lokasi : newHardware.lokasi}
              onValueChange={value =>
                editingHardware
                  ? setEditingHardware({ ...editingHardware, lokasi: value })
                  : setNewHardware({ ...newHardware, lokasi: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Lokasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cabang-ponorogo">Cabang Ponorogo</SelectItem>
                <SelectItem value="capem-sumoroto">Capem Sumoroto</SelectItem>
                <SelectItem value="capem-jetis">Capem Jetis</SelectItem>
                <SelectItem value="capem-pulung">Capem Pulung</SelectItem>
                <SelectItem value="capem-balong">Capem Balong</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={editingHardware ? editingHardware.status : newHardware.status}
              onValueChange={value =>
                editingHardware
                  ? setEditingHardware({ ...editingHardware, status: value })
                  : setNewHardware({ ...newHardware, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="tidak-aktif">Tidak Aktif</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="rusak">Rusak</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Keterangan"
              value={editingHardware ? editingHardware.keterangan : newHardware.keterangan}
              onChange={e =>
                editingHardware
                  ? setEditingHardware({
                      ...editingHardware,
                      keterangan: e.target.value,
                    })
                  : setNewHardware({
                      ...newHardware,
                      keterangan: e.target.value,
                    })
              }
            />
          </div>
          <Button onClick={handleCreateOrUpdateHardware}>
            {editingHardware ? 'Update Aset' : 'Tambah Aset'}
          </Button>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">Daftar Aset Hardware</h2>
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Tidak ada data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
