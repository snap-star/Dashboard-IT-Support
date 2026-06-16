import { TableCell, TableRow } from '@/components/ui/table'

export function TableSkeleton() {
  return (
    <TableRow>
      <TableCell colSpan={10}>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 w-[10%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[20%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-[15%] animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </TableCell>
    </TableRow>
  )
}
