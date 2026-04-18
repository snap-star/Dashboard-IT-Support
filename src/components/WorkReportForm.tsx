'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { CalendarIcon } from '@radix-ui/react-icons'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

type WorkReport = {
  id?: number
  title: string
  description: string
  date: string
  status: string
}

type WorkReportFormProps = {
  initialData?: WorkReport
  onSubmitSuccess?: () => void
}

export default function WorkReportForm({ initialData, onSubmitSuccess }: WorkReportFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [date, setDate] = useState(initialData?.date || '')
  const [status, setStatus] = useState(initialData?.status || 'pending')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const report = { title, description, date, status }

    try {
      if (!validateForm(report)) {
        return
      }

      if (initialData?.id) {
        // Update existing report
        const { error } = await supabase
          .from('work_reports')
          .update(report)
          .eq('id', initialData.id)
        if (error) throw error
      } else {
        // Insert new report
        const { error } = await supabase.from('work_reports').insert([report])
        if (error) throw error
      }

      if (onSubmitSuccess) {
        onSubmitSuccess()
      } else {
        router.push('/dashboard/reports')
      }
    } catch (error: any) {
      setError('Error submitting report: ' + error.message)
    }
  }

  const validateForm = (report: WorkReport) => {
    if (!report.title) {
      setError('Title is required')
      return false
    }

    if (!report.description) {
      setError('Description is required')
      return false
    }

    if (!report.date) {
      setError('Date is required')
      return false
    }

    if (!['pending', 'in_progress', ' completed'].includes(report.status)) {
      setError('Invalid status')
      return false
    }

    setError('')
    return true
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={`w-full justify-start text-left font-normal ${!date && 'text-muted-foreground'}`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(new Date(date), 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date ? new Date(date) : undefined}
              onSelect={date => setDate(date ? date.toISOString() : '')}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">{initialData ? 'Update Report' : 'Add Report'}</Button>
    </form>
  )
}
