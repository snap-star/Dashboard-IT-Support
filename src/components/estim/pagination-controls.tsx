import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getVisiblePageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l: number | null = null

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between">
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        Halaman {currentPage} dari {totalPages}
      </div>
      <div className="flex items-center gap-1 flex-wrap justify-center order-1 sm:order-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 px-2 text-xs"
        >
          Sebelumnya
        </Button>
        {getVisiblePageNumbers().map((page, index) => (
          <Button
            key={`${page}-${// biome-ignore lint/suspicious/noArrayIndexKey: <next implementation will fix>
index}`}
            variant={page === currentPage ? 'default' : 'ghost'}
            size="sm"
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className="min-w-8 h-8 text-xs"
          >
            {page}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 px-2 text-xs"
        >
          Selanjutnya
        </Button>
      </div>
    </div>
  )
}
