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
import { type FormEvent, useEffect, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

interface Employee {
  id?: number
  nip: string
  name: string
  jabatan: string
  department: string
  created_at?: string | null
}

export default function PegawaiPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [globalFilter, setGlobalFilter] = useState('')
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    jabatan: '',
    department: '',
  })
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [deleteEmployee, setDeleteEmployee] = useState<Employee | null>(null)
  const [departmentFilter, setDepartmentFilter] = useState('')

  // Get unique departments for filter options
  const departmentOptions = Array.from(
    new Set(employees.map(emp => emp.department).filter(Boolean)),
  ).sort()

  const updateColumnFilter = (id: string, value: string) => {
    setPageIndex(0)
    setColumnFilters(prev => {
      const filtered = prev.filter(filter => filter.id !== id)
      return value && value !== 'all' ? [...filtered, { id, value }] : filtered
    })
  }

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'nip',
      header: 'NIP',
      cell: ({ row }) => (
        <div className="font-medium text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">
          {row.getValue('nip')}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Nama',
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
          {row.getValue('name')}
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
          {row.getValue('department')}
        </div>
      ),
    },
    {
      accessorKey: 'jabatan',
      header: 'Jabatan',
      cell: ({ row }) => (
        <div className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
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
              onClick={() => handleEdit(employee)}
              className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(employee)}
              className="h-8 px-2 sm:px-3 text-xs sm:text-sm"
            >
              Delete
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: employees,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
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
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const nip = row.getValue('nip') as string
      const name = row.getValue('name') as string
      return (
        nip.toLowerCase().includes(filterValue.toLowerCase()) ||
        name.toLowerCase().includes(filterValue.toLowerCase())
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  })

  useEffect(() => {
    void fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('employees')
      .select('id, nip, name, jabatan, department, created_at')
      .order('nip', { ascending: true })

    if (error) {
      console.error('Gagal memuat data pegawai:', error)
    } else if (data) {
      setEmployees(data)
    }

    setLoading(false)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const { error } = await supabase.from('employees').insert([
      {
        nip: formData.nip,
        name: formData.nama,
        jabatan: formData.jabatan,
        department: formData.department,
      },
    ])

    if (error) {
      console.error('Gagal menyimpan pegawai:', error)
      return
    }

    setFormData({ nip: '', nama: '', jabatan: '', department: '' })
    setIsOpen(false)
    void fetchEmployees()
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      nip: employee.nip,
      nama: employee.name,
      jabatan: employee.jabatan,
      department: employee.department,
    })
    setIsEditOpen(true)
  }

  const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!editingEmployee?.id) return

    const { error } = await supabase
      .from('employees')
      .update({
        nip: formData.nip,
        name: formData.nama,
        jabatan: formData.jabatan,
        department: formData.department,
      })
      .eq('id', editingEmployee.id)

    if (error) {
      console.error('Gagal mengupdate pegawai:', error)
      return
    }

    setFormData({ nip: '', nama: '', jabatan: '', department: '' })
    setEditingEmployee(null)
    setIsEditOpen(false)
    void fetchEmployees()
  }

  const handleDelete = (employee: Employee) => {
    setDeleteEmployee(employee)
  }

  const confirmDelete = async () => {
    if (!deleteEmployee?.id) return

    const { error } = await supabase.from('employees').delete().eq('id', deleteEmployee.id)

    if (error) {
      console.error('Gagal menghapus pegawai:', error)
      return
    }

    setDeleteEmployee(null)
    void fetchEmployees()
  }

  return (
    <div className="container mx-auto py-4 px-4 sm:py-10 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Data Pegawai</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">Tambah Pegawai</Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[500px] mx-4">
            <DialogHeader>
              {/* DialogTitle is required for accessibility - screen readers use this to announce the dialog */}
              <DialogTitle className="text-lg">Tambah Data Pegawai Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nip" className="text-sm font-medium">
                  NIP
                </Label>
                <Input
                  id="nip"
                  value={formData.nip}
                  onChange={e => setFormData({ ...formData, nip: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-sm font-medium">
                  Nama
                </Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium">
                  Unit
                </Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jabatan" className="text-sm font-medium">
                  Jabatan
                </Label>
                <Input
                  id="jabatan"
                  value={formData.jabatan}
                  onChange={e => setFormData({ ...formData, jabatan: e.target.value })}
                  className="h-10"
                />
              </div>
              <Button type="submit" className="w-full h-10">
                Simpan
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="w-[95vw] max-w-[500px] mx-4">
            <DialogHeader>
              {/* DialogTitle is required for accessibility - screen readers use this to announce the dialog */}
              <DialogTitle className="text-lg">Edit Data Pegawai</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nip" className="text-sm font-medium">
                  NIP
                </Label>
                <Input
                  id="edit-nip"
                  value={formData.nip}
                  onChange={e => setFormData({ ...formData, nip: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nama" className="text-sm font-medium">
                  Nama
                </Label>
                <Input
                  id="edit-nama"
                  value={formData.nama}
                  onChange={e => setFormData({ ...formData, nama: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department" className="text-sm font-medium">
                  Unit
                </Label>
                <Input
                  id="edit-department"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-jabatan" className="text-sm font-medium">
                  Jabatan
                </Label>
                <Input
                  id="edit-jabatan"
                  value={formData.jabatan}
                  onChange={e => setFormData({ ...formData, jabatan: e.target.value })}
                  className="h-10"
                />
              </div>
              <Button type="submit" className="w-full h-10">
                Update
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteEmployee} onOpenChange={() => setDeleteEmployee(null)}>
          <AlertDialogContent className="w-[95vw] max-w-[400px] mx-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg">Konfirmasi Hapus</AlertDialogTitle>
              <AlertDialogDescription className="text-sm">
                Apakah Anda yakin ingin menghapus data pegawai{' '}
                <strong>{deleteEmployee?.name}</strong> dengan NIP{' '}
                <strong>{deleteEmployee?.nip}</strong>? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
              <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Cari berdasarkan NIP atau Nama..."
            value={globalFilter}
            onChange={e => {
              setGlobalFilter(e.target.value)
              setPageIndex(0)
            }}
            className="flex-1 h-10"
          />
          <Select
            value={departmentFilter || 'all'}
            onValueChange={value => {
              setDepartmentFilter(value === 'all' ? '' : value)
              updateColumnFilter('department', value)
            }}
          >
            <SelectTrigger className="w-full sm:w-48 h-10">
              <SelectValue placeholder="Filter Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Department</SelectItem>
              {departmentOptions.map(department => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      ) : (
        <>
          {/* Table Container with Horizontal Scroll */}
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
                          {flexRender(header.column.columnDef.header, header.getContext())}
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

          {/* Pagination Section */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Total {table.getFilteredRowModel().rows.length} pegawai
            </span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
                Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
              </span>
              <div className="flex items-center gap-2">
                <Select
                  value={String(pageSize)}
                  onValueChange={value => {
                    setPageSize(Number(value))
                    setPageIndex(0)
                  }}
                >
                  <SelectTrigger className="w-20 sm:w-24 h-8 sm:h-9">
                    <SelectValue placeholder="Rows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
