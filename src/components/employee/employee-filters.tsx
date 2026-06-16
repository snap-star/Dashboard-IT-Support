'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface EmployeeFiltersProps {
  globalFilter: string
  setGlobalFilter: (value: string) => void
  departmentFilter: string
  setDepartmentFilter: (value: string) => void
  departmentOptions: string[]
  onAddNew: () => void
  setPageIndex: (value: number) => void
}

export function EmployeeFilters({
  globalFilter,
  setGlobalFilter,
  departmentFilter,
  setDepartmentFilter,
  departmentOptions,
  onAddNew,
  setPageIndex,
}: EmployeeFiltersProps) {
  return (
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
            setPageIndex(0)
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
        <Button onClick={onAddNew} className="w-full sm:w-auto h-10">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pegawai
        </Button>
      </div>
    </div>
  )
}
