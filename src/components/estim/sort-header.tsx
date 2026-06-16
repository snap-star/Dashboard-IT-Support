import { ChevronDown, ChevronUp } from 'lucide-react'
import { TableHead } from '@/components/ui/table'
import type { Pegawai } from '@/lib/types/Estim/formEstim'

interface SortHeaderProps {
  column: keyof Pegawai
  label: string
  sortConfig: { key: keyof Pegawai | null; direction: 'asc' | 'desc' }
  onSort: (column: keyof Pegawai) => void
  className?: string
}

export function SortHeader({ column, label, sortConfig, onSort, className = '' }: SortHeaderProps) {
  return (
    <TableHead
      className={`cursor-pointer hover:bg-muted/60 ${className}`}
      onClick={() => onSort(column)}
    >
      <div className="flex items-center space-x-1">
        <span>{label}</span>
        <span className="flex flex-col">
          <ChevronUp
            className={`h-3 w-3 ${
              sortConfig.key === column && sortConfig.direction === 'asc'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          />
          <ChevronDown
            className={`h-3 w-3 ${
              sortConfig.key === column && sortConfig.direction === 'desc'
                ? 'text-primary'
                : 'text-muted-foreground'
            }`}
          />
        </span>
      </div>
    </TableHead>
  )
}
