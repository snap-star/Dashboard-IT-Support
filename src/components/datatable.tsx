'use client'

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'
import { ColumnDef, useReactTable, getCoreRowModel } from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
      if (error) console.error(error)
      else setData(users)
      setLoading(false)
    }

    fetchData()
  }, [])

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'id', header: 'ID' }, // Bisa langsung string
    { accessorKey: 'user_estim', header: 'User ESTIM' },
    { accessorKey: 'ip_address', header: 'IP Address' },
    { accessorKey: 'nama', header: 'Nama' },
    { accessorKey: 'nip', header: 'NIP' },
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
  })

  if (loading) return <p>Loading...</p>

  return (
    <div className="p-4">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : (header.column.columnDef.header as string)}
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
    </div>
  )
}
