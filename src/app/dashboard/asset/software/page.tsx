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

type Software = {
  id: number
  nama_software: string
  jenis: string
  versi: string
  lisensi: string
  tanggal_aktivasi: string
  tanggal_expired: string
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

export default function AssetSoftware() {
  const [software, setSoftware] = React.useState<Software[]>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingSoftware, setEditingSoftware] = React.useState<Software | null>(null)
  const [lastUpdated, setLastUpdated] = React.useState<string>('')
  const [users, setUsers] = React.useState<User[]>([])
  const [newSoftware, setNewSoftware] = React.useState<Omit<Software, 'id'>>({
    nama_software: '',
    jenis: '',
    versi: '',
    lisensi: '',
    tanggal_aktivasi: '',
    tanggal_expired: '',
    pengguna: '',
    lokasi: '',
    status: '',
    keterangan: '',
  })

  React.useEffect(() => {
    fetchSoftware()
    fetchUsers()
  }, [])

  async function fetchSoftware() {
    const { data, error } = await supabase.from('software').select('*')
    if (error) {
      console.error('Error fetching software:', error)
    } else {
      setSoftware(data || [])
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

  const columns: ColumnDef<Software>[] = [
    {
      accessorKey: 'nama_software',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nama Software
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: 'jenis',
      header: 'Jenis',
    },
    {
      accessorKey: 'versi',
      header: 'Versi',
    },
    {
      accessorKey: 'lisensi',
      header: 'Lisensi',
    },
    {
      accessorKey: 'tanggal_aktivasi',
      header: 'Tanggal Aktivasi',
    },
    {
      accessorKey: 'tanggal_expired',
      header: 'Tanggal Expired',
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
    // ... sisanya sama seperti hardware
  ]

  async function handleCreateOrUpdateSoftware() {
    if (editingSoftware) {
      const { error } = await supabase
        .from('software')
        .update(editingSoftware)
        .eq('id', editingSoftware.id)
      if (error) {
        console.error('Error updating software:', error)
        return
      }
    } else {
      const { error } = await supabase.from('software').insert([newSoftware])
      if (error) {
        console.error('Error creating software:', error)
        return
      }
    }
    fetchSoftware()
    setIsDialogOpen(false)
    setEditingSoftware(null)
    setNewSoftware({
      nama_software: '',
      jenis: '',
      versi: '',
      lisensi: '',
      tanggal_aktivasi: '',
      tanggal_expired: '',
      pengguna: '',
      lokasi: '',
      status: '',
      keterangan: '',
    })
  }

  async function handleDeleteSoftware(id: number) {
    const { error } = await supabase.from('software').delete().eq('id', id)
    if (error) {
      console.error('Error deleting software:', error)
      return
    }
    fetchSoftware()
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(software)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Software Assets')
    XLSX.writeFile(workbook, 'Data_Aset_Software.xlsx')
  }

  const table = useReactTable({
    data: software,
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
          <Button onClick={() => setIsDialogOpen(true)}>Tambah Software Baru</Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSoftware ? 'Edit Software' : 'Tambah Software Baru'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Nama Software"
              value={editingSoftware ? editingSoftware.nama_software : newSoftware.nama_software}
              onChange={e =>
                editingSoftware
                  ? setEditingSoftware({
                      ...editingSoftware,
                      nama_software: e.target.value,
                    })
                  : setNewSoftware({
                      ...newSoftware,
                      nama_software: e.target.value,
                    })
              }
            />
            <Select
              value={editingSoftware ? editingSoftware.jenis : newSoftware.jenis}
              onValueChange={value =>
                editingSoftware
                  ? setEditingSoftware({ ...editingSoftware, jenis: value })
                  : setNewSoftware({ ...newSoftware, jenis: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jenis Software" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operating-system">Operating System</SelectItem>
                <SelectItem value="office-suite">Office Suite</SelectItem>
                <SelectItem value="antivirus">Antivirus</SelectItem>
                <SelectItem value="design-software">Design Software</SelectItem>
                <SelectItem value="development-tools">Development Tools</SelectItem>
                <SelectItem value="utility">Utility</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Versi"
              value={editingSoftware ? editingSoftware.versi : newSoftware.versi}
              onChange={e =>
                editingSoftware
                  ? setEditingSoftware({
                      ...editingSoftware,
                      versi: e.target.value,
                    })
                  : setNewSoftware({ ...newSoftware, versi: e.target.value })
              }
            />
            <Select
              value={editingSoftware ? editingSoftware.lisensi : newSoftware.lisensi}
              onValueChange={value =>
                editingSoftware
                  ? setEditingSoftware({ ...editingSoftware, lisensi: value })
                  : setNewSoftware({ ...newSoftware, lisensi: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jenis Lisensi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="perpetual">Perpetual</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="Tanggal Aktivasi"
              value={
                editingSoftware ? editingSoftware.tanggal_aktivasi : newSoftware.tanggal_aktivasi
              }
              onChange={e =>
                editingSoftware
                  ? setEditingSoftware({
                      ...editingSoftware,
                      tanggal_aktivasi: e.target.value,
                    })
                  : setNewSoftware({
                      ...newSoftware,
                      tanggal_aktivasi: e.target.value,
                    })
              }
            />
            <Input
              type="date"
              placeholder="Tanggal Expired"
              value={
                editingSoftware ? editingSoftware.tanggal_expired : newSoftware.tanggal_expired
              }
              onChange={e =>
                editingSoftware
                  ? setEditingSoftware({
                      ...editingSoftware,
                      tanggal_expired: e.target.value,
                    })
                  : setNewSoftware({
                      ...newSoftware,
                      tanggal_expired: e.target.value,
                    })
              }
            />
            <Select
              value={editingSoftware ? editingSoftware.pengguna : newSoftware.pengguna}
              onValueChange={value =>
                editingSoftware
                  ? setEditingSoftware({ ...editingSoftware, pengguna: value })
                  : setNewSoftware({ ...newSoftware, pengguna: value })
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
              value={editingSoftware ? editingSoftware.lokasi : newSoftware.lokasi}
              onValueChange={value =>
                editingSoftware
                  ? setEditingSoftware({ ...editingSoftware, lokasi: value })
                  : setNewSoftware({ ...newSoftware, lokasi: value })
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
              value={editingSoftware ? editingSoftware.status : newSoftware.status}
              onValueChange={value =>
                editingSoftware
                  ? setEditingSoftware({ ...editingSoftware, status: value })
                  : setNewSoftware({ ...newSoftware, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="non-aktif">Non-aktif</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Keterangan"
              value={editingSoftware ? editingSoftware.keterangan : newSoftware.keterangan}
              onChange={e =>
                editingSoftware
                  ? setEditingSoftware({
                      ...editingSoftware,
                      keterangan: e.target.value,
                    })
                  : setNewSoftware({
                      ...newSoftware,
                      keterangan: e.target.value,
                    })
              }
            />
          </div>
          <Button onClick={handleCreateOrUpdateSoftware}>
            {editingSoftware ? 'Update Software' : 'Tambah Software'}
          </Button>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold">Daftar Aset Software</h2>
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
