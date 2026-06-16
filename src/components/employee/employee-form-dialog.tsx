'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { EmployeeFormValues } from '@/lib/types/Employee/formEmployee'
import { EmployeeFormSchema } from '@/lib/types/Employee/formEmployee'

interface EmployeeFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: EmployeeFormValues) => Promise<void>
  editingEmployee?: {
    id: number
    nip: string
    name: string
    jabatan: string
    department: string
  } | null
  isEdit?: boolean
}

export function EmployeeFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  editingEmployee,
  isEdit = false,
}: EmployeeFormDialogProps) {
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    jabatan: '',
    department: '',
  })

  // Update form data when editingEmployee changes (when edit dialog opens)
  useEffect(() => {
    if (editingEmployee && isEdit) {
      setFormData({
        nip: editingEmployee.nip,
        nama: editingEmployee.name,
        jabatan: editingEmployee.jabatan,
        department: editingEmployee.department,
      })
    } else if (!isEdit) {
      // Reset form when creating new employee
      setFormData({ nip: '', nama: '', jabatan: '', department: '' })
    }
  }, [editingEmployee, isEdit])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ nip: '', nama: '', jabatan: '', department: '' })
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validated = EmployeeFormSchema.parse(formData)
    await onSubmit(validated)
    // Reset form after submission
    setFormData({ nip: '', nama: '', jabatan: '', department: '' })
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-125 mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {isEdit ? 'Edit Pegawai' : 'Create Pegawai'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {isEdit ? 'Merubah Data Pegawai' : 'Tambah data pegawai baru'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nip" className="text-sm font-medium">
              NIP
            </Label>
            <Input
              id="nip"
              placeholder="Masukkan 8 Digit NIP"
              value={formData.nip}
              onChange={e => setFormData({ ...formData, nip: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nama" className="text-sm font-medium">
              Nama Lengkap
            </Label>
            <Input
              id="nama"
              placeholder="Masukkan Nama Lengkap"
              value={formData.nama}
              onChange={e => setFormData({ ...formData, nama: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">
              Unit
            </Label>
            <Input
              id="department"
              placeholder="Masukkan Unit Kerja"
              value={formData.department}
              onChange={e => setFormData({ ...formData, department: e.target.value })}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jabatan" className="text-sm font-medium">
              Jabatan
            </Label>
            <Input
              id="jabatan"
              placeholder="Masukkan Jabatan"
              value={formData.jabatan}
              onChange={e => setFormData({ ...formData, jabatan: e.target.value })}
              className="h-10"
            />
          </div>
          <Button type="submit" className="w-full h-10">
            {isEdit ? 'Update' : 'Simpan'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
