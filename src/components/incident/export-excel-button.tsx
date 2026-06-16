'use client'

import { format } from 'date-fns'
import { Download } from 'lucide-react'
import * as React from 'react'
import type { DateRange } from 'react-day-picker'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import supabase from '@/lib/supabase'
import type { Incident } from '@/lib/types/Incident/formIncident'

interface ExportExcelButtonProps {
  isExporting: boolean
  setIsExporting: (value: boolean) => void
}

export function ExportExcelButton({ isExporting, setIsExporting }: ExportExcelButtonProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

  const downloadExcel = async (filtered = false) => {
    setIsExporting(true)
    try {
      let dataToExport: Incident[] = []

      if (filtered && dateRange?.from && dateRange?.to) {
        const { data, error } = await supabase
          .from('it_incidents')
          .select('*')
          .gte('date_reported', format(dateRange.from, 'yyyy-MM-dd'))
          .lte('date_reported', format(dateRange.to, 'yyyy-MM-dd'))
          .order('date_reported', { ascending: false })

        if (error) throw error
        dataToExport = data
      } else {
        const { data, error } = await supabase
          .from('it_incidents')
          .select('*')
          .order('date_reported', { ascending: false })

        if (error) throw error
        dataToExport = data
      }

      const formattedData = dataToExport.map((item: Incident) => ({
        Judul: item.title,
        Deskripsi: item.description,
        Pelapor: item.reported_by,
        'Tanggal Kejadian': format(new Date(item.date_reported), 'dd MMM yyyy'),
        Status: item.status,
        Prioritas: item.priority,
        Resolusi: item.resolution || '-',
      }))

      const ws = XLSX.utils.json_to_sheet(formattedData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Insiden')

      const fileName = filtered
        ? `insiden_${format(dateRange!.from!, 'yyyyMMdd')}_${format(dateRange!.to!, 'yyyyMMdd')}.xlsx`
        : `insiden_all_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`

      XLSX.writeFile(wb, fileName)
      toast.success('Data berhasil diexport')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Gagal mengexport data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Excel'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-4 space-y-4">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadExcel(false)}
              disabled={isExporting}
            >
              Export All
            </Button>
            <Button
              size="sm"
              onClick={() => downloadExcel(true)}
              disabled={!dateRange?.from || !dateRange?.to || isExporting}
            >
              Export Range
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
