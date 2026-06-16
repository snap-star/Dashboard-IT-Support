'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { DatePickerDefault } from '@/components/ui/date-picker-default'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Incident } from '@/lib/types/Incident/formIncident'

interface IncidentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingIncident: Incident | null
  onSubmit: (incident: Incident | Omit<Incident, 'id'>) => Promise<void>
  onCancel: () => void
}

const statusOptions = ['Open', 'In Progress', 'Resolved', 'Closed']
const priorityOptions = ['Low', 'Medium', 'High', 'Critical']

export function IncidentFormDialog({
  open,
  onOpenChange,
  editingIncident,
  onSubmit,
  onCancel,
}: IncidentFormDialogProps) {
  const [formData, setFormData] = React.useState<Partial<Incident>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (editingIncident) {
      setFormData(editingIncident)
    } else {
      setFormData({
        title: '',
        description: '',
        reported_by: '',
        date_reported: new Date().toISOString().split('T')[0],
        status: 'Open',
        priority: 'Medium',
        resolution: '',
      })
    }
  }, [editingIncident, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingIncident) {
        await onSubmit({ ...editingIncident, ...formData } as Incident)
      } else {
        await onSubmit(formData as Omit<Incident, 'id'>)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingIncident ? 'Edit Incident' : 'Add New Incident'}</DialogTitle>
          <DialogDescription>
            {editingIncident ? 'Edit the details of the incident' : 'Add a new incident'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 overflow-auto">
          <Input
            placeholder="Title"
            value={formData.title || ''}
            onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
          <Textarea
            placeholder="Description"
            value={formData.description || ''}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
          <Input
            placeholder="Reported By"
            value={formData.reported_by || ''}
            onChange={e => setFormData(prev => ({ ...prev, reported_by: e.target.value }))}
            required
          />
          <div className="flex flex-cols-3 justify-start gap-3">
            <div className="flex flex-col justify-between gap-4 w-36">
              <DatePickerDefault
                date={formData.date_reported ? new Date(formData.date_reported) : new Date()}
                setDateAction={(newDate: Date | undefined) => {
                  const selectedDate = newDate || new Date()
                  setFormData(prev => ({
                    ...prev,
                    date_reported: selectedDate.toISOString().split('T')[0],
                  }))
                }}
              />
            </div>
          </div>
          <Select
            value={formData.status || 'Open'}
            onValueChange={value =>
              setFormData(prev => ({ ...prev, status: value as Incident['status'] }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={formData.priority || 'Medium'}
            onValueChange={value =>
              setFormData(prev => ({ ...prev, priority: value as Incident['priority'] }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map(priority => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Resolution (optional)"
            value={formData.resolution || ''}
            onChange={e => setFormData(prev => ({ ...prev, resolution: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editingIncident ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
