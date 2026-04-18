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
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { ArrowUpDown, ChevronDown, MoreHorizontal, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import supabase from '@/lib/supabase'
import * as XLSX from 'xlsx'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

type User = {
  id: number
  user_estim: string
  ip_address: string
  mac_address: string
  nama: string
  nip: string
  jabatan: string
  unit_kerja: string
  cab: string
  status_user: string
}

export default function IPAddressManagement() {
  const [users, setUsers] = React.useState<User[]>([])
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [formData, setFormData] = React.useState({
    user_estim: '',
    ip_address: '',
    mac_address: '',
    nama: '',
    nip: '',
    jabatan: '',
    unit_kerja: '',
    cab: '',
    status_user: 'Aktif',
  })
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const [userEstimOptions, setUserEstimOptions] = React.useState<string[]>([])
  const [ipAddressOptions, setIpAddressOptions] = React.useState<string[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetchUsers()
  }, [])
  const [lastUpdated, setLastUpdated] = React.useState<string>('')

  // Tambahkan fungsi ini sebelum useEffect
  const groupUsersByNIP = (users: User[]) => {
    const grouped = users.reduce(
      (acc, user) => {
        const key = `${user.nip}-${user.nama}`
        if (!acc[key]) {
          acc[key] = user
        } else {
          // Jika user dengan NIP yang sama sudah ada, gabungkan informasi user
          acc[key].user_estim += `, ${user.user_estim}`
          acc[key].ip_address += `, ${user.ip_address}`
          acc[key].mac_address += `, ${user.mac_address}`
        }
        return acc
      },
      {} as Record<string, User>,
    )

    return Object.values(grouped)
  }

  // Fungsi untuk cek duplikasi
  const checkDuplicateUser = async (userEstim: string, nip: string, id?: number) => {
    try {
      let query = supabase
        .from('users')
        .select('id')
        .or(`user_estim.ilike.%${userEstim}%,nip.eq.${nip}`)

      if (id) {
        query = query.neq('id', id)
      }

      const { data, error } = await query

      if (error) throw error

      return data.length > 0
    } catch (error) {
      console.error('Error checking duplicate:', error)
      throw new Error('Gagal memeriksa duplikasi data')
    }
  }

  // Update fungsi fetchUsers dengan loading dan error handling
  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const groupedUsers = groupUsersByNIP(data || [])
      setUsers(groupedUsers)

      // Update options untuk dropdowns
      const allUserEstims = new Set<string>()
      const allIpAddresses = new Set<string>()

      data?.forEach(user => {
        if (user.user_estim) {
          user.user_estim.split(', ').forEach((estim: string) => {
            allUserEstims.add(estim.trim())
          })
        }
        if (user.ip_address) {
          user.ip_address.split(', ').forEach((ip: string) => {
            allIpAddresses.add(ip.trim())
          })
        }
      })

      setUserEstimOptions(Array.from(allUserEstims))
      setIpAddressOptions(Array.from(allIpAddresses))
      setLastUpdated(new Date().toLocaleString())
    } catch (error: any) {
      console.error('Error fetching users:', error)
      setError(error.message || 'Gagal memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  // Tambahkan fungsi untuk mereset form
  const resetForm = () => {
    setFormData({
      user_estim: '',
      ip_address: '',
      mac_address: '',
      nama: '',
      nip: '',
      jabatan: '',
      unit_kerja: '',
      cab: '',
      status_user: 'Aktif',
    })
    setEditingUser(null)
  }

  // Fungsi untuk handle edit
  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      user_estim: user.user_estim,
      ip_address: user.ip_address,
      mac_address: user.mac_address,
      nama: user.nama,
      nip: user.nip,
      jabatan: user.jabatan,
      unit_kerja: user.unit_kerja,
      cab: user.cab,
      status_user: user.status_user,
    })
    setIsDialogOpen(true)
  }

  // Fungsi untuk handle tambah baru
  const handleAddNew = () => {
    setEditingUser(null)
    setFormData({
      user_estim: '',
      ip_address: '',
      mac_address: '',
      nama: '',
      nip: '',
      jabatan: '',
      unit_kerja: '',
      cab: '',
      status_user: 'Aktif',
    })
    setIsDialogOpen(true)
  }

  // Fungsi untuk handle submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)

      // Cek duplikasi
      const isDuplicate = await checkDuplicateUser(
        formData.user_estim,
        formData.nip,
        editingUser?.id,
      )

      if (isDuplicate) {
        toast.error('User ESTIM atau NIP sudah terdaftar')
        return
      }

      if (editingUser) {
        // Update existing user
        const { error } = await supabase.from('users').update(formData).eq('id', editingUser.id)

        if (error) throw error
        toast.success('Data berhasil diperbarui')
      } else {
        // Create new user
        const { error } = await supabase.from('users').insert([formData])

        if (error) throw error
        toast.success('Data berhasil ditambahkan')
      }

      setIsDialogOpen(false)
      fetchUsers()
    } catch (error: any) {
      console.error('Error saving user:', error)
      toast.error(error.message || 'Gagal menyimpan data')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteUser(id: number) {
    const { error } = await supabase.from('users').delete().eq('id', id)
    if (error) {
      console.error('Error deleting user:', error)
      return
    }
    fetchUsers()
    setLastUpdated(new Date().toLocaleString())
  }

  //fungsi export excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
    XLSX.writeFile(workbook, 'Data User ESTIM.xlsx')
  }
  //fungsi print
  const printTable = () => {
    window.print()
  }

  // Tambahkan fungsi untuk mengupdate data berdasarkan user_estim
  async function updateEmptyUsers() {
    try {
      // Ambil semua data dari database
      const { data: allUsers, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('user_estim') // Menambahkan pengurutan untuk konsistensi

      if (fetchError) throw fetchError

      // Buat map untuk menyimpan data referensi
      const userEstimMap = new Map()

      // Isi map dengan data yang memiliki informasi lengkap
      allUsers?.forEach(user => {
        if (user.user_estim) {
          // Split multiple user_estim jika ada
          const userEstims = user.user_estim.split(',').map((e: string) => e.trim())

          if (user.nama && user.nip) {
            userEstims.forEach((estim: string) => {
              if (estim) {
                userEstimMap.set(estim, {
                  nama: user.nama,
                  nip: user.nip,
                  jabatan: user.jabatan || '',
                  unit_kerja: user.unit_kerja || '',
                  cab: user.cab || '',
                  status_user: user.status_user || 'Aktif',
                })
              }
            })
          }
        }
      })

      // Update data yang kosong berdasarkan user_estim
      const updates = []
      for (const user of allUsers || []) {
        if (user.user_estim && (!user.nama || !user.nip)) {
          // Split multiple user_estim jika ada
          const userEstims = user.user_estim.split(',').map((e: string) => e.trim())

          for (const estim of userEstims) {
            const referenceData = userEstimMap.get(estim)
            if (referenceData) {
              updates.push({
                id: user.id,
                ...referenceData,
                user_estim: user.user_estim, // Pertahankan user_estim asli
                ip_address: user.ip_address, // Pertahankan ip_address asli
                mac_address: user.mac_address, // Pertahankan mac_address asli
              })
              break // Gunakan data referensi pertama yang ditemukan
            }
          }
        }
      }

      // Lakukan update batch dengan penanganan error yang lebih baik
      if (updates.length > 0) {
        let successCount = 0
        for (const update of updates) {
          try {
            const { error: updateError } = await supabase
              .from('users')
              .update({
                nama: update.nama,
                nip: update.nip,
                jabatan: update.jabatan,
                unit_kerja: update.unit_kerja,
                cab: update.cab,
                status_user: update.status_user,
              })
              .eq('id', update.id)

            if (!updateError) {
              successCount++
            } else {
              console.error(`Error updating user ${update.id}:`, updateError)
            }
          } catch (error) {
            console.error(`Failed to update user ${update.id}:`, error)
          }
        }

        // Refresh data dan tampilkan hasil
        await fetchUsers()
        alert(`Berhasil mengupdate ${successCount} dari ${updates.length} data`)
      } else {
        alert('Tidak ada data yang perlu diupdate')
      }
    } catch (error) {
      console.error('Error updating users:', error)
      alert('Terjadi kesalahan saat mengupdate data')
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'No',
      header: 'No',
      enableSorting: false,
      enableHiding: false,
      size: 60,
      cell: ({ row }) => {
        const pageIndex = table.getState().pagination.pageIndex
        const pageSize = table.getState().pagination.pageSize
        return pageIndex * pageSize + row.index + 1
      },
    },
    {
      accessorKey: 'user_estim',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            User ESTIM
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      size: 150,
    },
    {
      accessorKey: 'ip_address',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            IP Address
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      size: 150,
    },
    {
      accessorKey: 'mac_address',
      header: 'MAC Address',
      size: 150,
    },
    {
      accessorKey: 'nama',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Nama Pemegang
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      size: 200,
    },
    {
      accessorKey: 'nip',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            NIP
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      size: 150,
    },
    {
      accessorKey: 'jabatan',
      header: 'Jabatan',
      size: 150,
    },
    {
      accessorKey: 'unit_kerja',
      header: 'Unit Kerja',
      size: 200,
    },
    {
      accessorKey: 'cab',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Cabang/Capem
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      size: 150,
    },
    {
      accessorKey: 'status_user',
      header: 'Status',
      size: 100,
      cell: ({ row }) => {
        const status = row.getValue('status_user') as string
        return <Badge variant={status === 'Aktif' ? 'default' : 'secondary'}>{status}</Badge>
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(user)}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    handleDeleteUser(user.id)
                  }
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: users,
    columns,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: updater => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex,
          pageSize,
        })
        setPageIndex(newState.pageIndex)
        setPageSize(newState.pageSize)
      }
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(users.length / pageSize),
  })

  return (
    <div className="w-full">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Filter data..."
            value={globalFilter}
            onChange={e => setGlobalFilter(e.target.value)}
            className="max-w-sm"
            disabled={isLoading}
          />
          <Button
            variant="secondary"
            onClick={updateEmptyUsers}
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Update Empty Data'
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToExcel} disabled={isLoading}>
            Export Excel
          </Button>
          <Button variant="default" onClick={handleAddNew} disabled={isLoading}>
            Add New User
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Memuat data...</span>
                </div>
              </div>
            )}

            <Table>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className="overflow-hidden"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                          className="overflow-hidden"
                        >
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
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {`Total ${table.getFilteredRowModel().rows.length} data`}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage() || isLoading}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage() || isLoading}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Tambah User Baru'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Edit informasi user ESTIM dan IP Address'
                : 'Tambahkan user ESTIM dan IP Address baru'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Kolom Kiri */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama">Nama Pemegang</Label>
                  <Input
                    id="nama"
                    value={formData.nama}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        nama: e.target.value,
                      }))
                    }
                    placeholder="Nama lengkap"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nip">NIP</Label>
                  <Input
                    id="nip"
                    value={formData.nip}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        nip: e.target.value,
                      }))
                    }
                    placeholder="Nomor Induk Pegawai"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jabatan">Jabatan</Label>
                  <Input
                    id="jabatan"
                    value={formData.jabatan}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        jabatan: e.target.value,
                      }))
                    }
                    placeholder="Jabatan"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit_kerja">Unit Kerja</Label>
                  <Input
                    id="unit_kerja"
                    value={formData.unit_kerja}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        unit_kerja: e.target.value,
                      }))
                    }
                    placeholder="Unit Kerja"
                    required
                  />
                </div>
              </div>

              {/* Kolom Kanan */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user_estim">User ESTIM</Label>
                  <Input
                    id="user_estim"
                    value={formData.user_estim}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        user_estim: e.target.value,
                      }))
                    }
                    placeholder="User ESTIM"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ip_address">IP Address</Label>
                  <Input
                    id="ip_address"
                    value={formData.ip_address}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        ip_address: e.target.value,
                      }))
                    }
                    placeholder="IP Address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mac_address">MAC Address</Label>
                  <Input
                    id="mac_address"
                    value={formData.mac_address}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        mac_address: e.target.value,
                      }))
                    }
                    placeholder="MAC Address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab">Cabang/Capem</Label>
                  <Input
                    id="cab"
                    value={formData.cab}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        cab: e.target.value,
                      }))
                    }
                    placeholder="Cabang/Capem"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status_user">Status User</Label>
                  <Select
                    value={formData.status_user}
                    onValueChange={value =>
                      setFormData(prev => ({
                        ...prev,
                        status_user: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aktif">Aktif</SelectItem>
                      <SelectItem value="Tidak Aktif">Tidak Aktif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingUser ? 'Menyimpan...' : 'Menambahkan...'}
                  </>
                ) : editingUser ? (
                  'Simpan Perubahan'
                ) : (
                  'Tambah User'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="ml-auto">
            Columns <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {table
            .getAllColumns()
            .filter(column => column.getCanHide())
            .map(column => {
              return (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={value => column.toggleVisibility(!!value)}
                >
                  {column.id === 'user_estim'
                    ? 'User ESTIM'
                    : column.id === 'ip_address'
                      ? 'IP Address'
                      : column.id === 'mac_address'
                        ? 'MAC Address'
                        : column.id === 'nama'
                          ? 'Nama Pemegang'
                          : column.id === 'nip'
                            ? 'NIP'
                            : column.id === 'jabatan'
                              ? 'Jabatan'
                              : column.id === 'unit_kerja'
                                ? 'Unit Kerja'
                                : column.id === 'cab'
                                  ? 'Cabang/Capem'
                                  : column.id === 'status_user'
                                    ? 'Status'
                                    : column.id}
                </DropdownMenuCheckboxItem>
              )
            })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
