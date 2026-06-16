import { ArrowLeft, Filter, Plus, Search, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface EstimFiltersProps {
  globalFilter: string
  setGlobalFilter: (value: string) => void
  departmentFilter: string
  setDepartmentFilter: (value: string) => void
  departmentOptions: string[]
  onAddNew: () => void
  onUpload: () => void
  onFilterDuplicates: () => void
  onResetFilters: () => void
  setCurrentPage: (page: number) => void
}

export function EstimFilters({
  globalFilter,
  setGlobalFilter,
  departmentFilter,
  setDepartmentFilter,
  departmentOptions,
  onAddNew,
  onUpload,
  onFilterDuplicates,
  onResetFilters,
  setCurrentPage,
}: EstimFiltersProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value === 'all' ? '' : value)
    setCurrentPage(1)
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 sm:flex-initial min-w-0">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari Nama Pegawai..."
          value={globalFilter}
          onChange={handleSearchChange}
          className="pl-9 w-full sm:w-64"
        />
      </div>

      <Select value={departmentFilter || 'all'} onValueChange={handleDepartmentChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filter Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua</SelectItem>
          {departmentOptions.map(department => (
            <SelectItem key={department} value={department}>
              {department}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={onFilterDuplicates}>
              <Filter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Filter Data Duplikat</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={onResetFilters}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reset Filter</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="ml-auto flex gap-2">
        <Button variant="secondary" onClick={onUpload}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Excel
        </Button>
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pegawai
        </Button>
      </div>
    </div>
  )
}
