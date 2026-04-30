'use client'

import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import supabase from '@/lib/supabase'

type User = {
  id: number
  created_at: string
  user_estim: string
  ip_address: string | null
  nama: string | null
  nip: string | null
  jabatan: string | null
  unit_kerja: string | null
  cab: string | null
  status_user: string | null
  display: string | null
  updated_at: string | null
  mac_address: string | null
  multi: string | null
}

export default function DataTable() {
  const [data, setData] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: users, error } = await supabase.from('users').select('*')
      if (error) {
        console.error(error)
        toast.error('Gagal memuat data!')
      } else {
        const uniqueData = removeDuplicates(users) // Filter duplikasi
        setData(uniqueData)
        toast.success('Data berhasil dimuat!')
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const removeDuplicates = (users: User[]) => {
    const seen: Set<string> = new Set()
    return users.filter(user => {
      if (seen.has(user.user_estim)) {
        return false // Skip duplikasi
      }
      seen.add(user.user_estim)
      return true
    })
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users')
    XLSX.writeFile(workbook, 'users.xlsx')
    toast.success('Data berhasil diekspor ke Excel!')
  }

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'user_estim', header: 'User ESTIM' },
    {
      accessorKey: 'nama',
      header: 'Pemegang',
      cell: ({ row }) => <TableCell colSpan={2}>{row.original.nama || 'Tidak Ada'}</TableCell>,
    },
    { accessorKey: 'jabatan', header: 'Jabatan' },
    { accessorKey: 'unit_kerja', header: 'Unit Kerja' },
    { accessorKey: 'cab', header: 'Cabang' },
    { accessorKey: 'status_user', header: 'Status' },
    { accessorKey: 'updated_at', header: 'Last Updated' },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Manajemen User ESTIM</h1>
        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Ekspor ke Excel
        </button>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {typeof header.column.columnDef.header === 'function'
                    ? header.column.columnDef.header(header.getContext()) // Panggil fungsi header
                    : header.column.columnDef.header || null}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>{cell.getValue() as string}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
