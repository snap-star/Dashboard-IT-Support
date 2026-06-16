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
import { ExportExcelButton } from './export-excel-button'

interface IncidentFiltersProps {
  globalFilter: string
  setGlobalFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  priorityFilter: string
  setPriorityFilter: (value: string) => void
  onAddNew: () => void
  isExporting: boolean
  setIsExporting: (value: boolean) => void
}

const statusOptions = ['all', 'Open', 'In Progress', 'Resolved', 'Closed']
const priorityOptions = ['all', 'Low', 'Medium', 'High', 'Critical']

export function IncidentFilters({
  globalFilter,
  setGlobalFilter,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  onAddNew,
  isExporting,
  setIsExporting,
}: IncidentFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 gap-4 flex-wrap">
        <Input
          placeholder="Search incidents..."
          value={globalFilter}
          onChange={e => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(status => (
              <SelectItem key={status} value={status}>
                {status === 'all' ? 'All Status' : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map(priority => (
              <SelectItem key={priority} value={priority}>
                {priority === 'all' ? 'All Priority' : priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <ExportExcelButton isExporting={isExporting} setIsExporting={setIsExporting} />
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>
    </div>
  )
}
