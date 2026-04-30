'use client'

import { CalendarIcon } from '@radix-ui/react-icons'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  date: Date
  setDateAction: (date: Date | undefined) => void
}

export function DatePickerDefault({ date, setDateAction }: DatePickerProps) {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Menyesuaikan tanggal agar tidak terpengaruh zona waktu
      const adjustedDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        12, // Set jam ke tengah hari untuk menghindari masalah timezone
      )
      setDateAction(adjustedDate)
    } else {
      setDateAction(undefined)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'PPP', { locale: id }) : <span>Pilih Tanggal</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          locale={id}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
