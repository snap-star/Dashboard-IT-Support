import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PegawaiFormSchema, type PegawaiFormValues } from '@/lib/types/Estim/formEstim'

interface PegawaiFormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PegawaiFormValues) => void
  isEdit: boolean
  editingPegawai?: {
    id: number
    nip: string
    name: string
    jabatan: string
    department: string
  } | null
}

export function PegawaiFormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isEdit,
  editingPegawai,
}: PegawaiFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PegawaiFormValues>({
    resolver: zodResolver(PegawaiFormSchema),
    defaultValues: {
      nip: '',
      name: '',
      jabatan: '',
      department: '',
    },
  })

  // Update form values when editing pegawai changes
  useEffect(() => {
    if (isEdit && editingPegawai) {
      reset({
        nip: editingPegawai.nip,
        name: editingPegawai.name,
        jabatan: editingPegawai.jabatan,
        department: editingPegawai.department,
      })
    } else if (!isOpen) {
      reset({
        nip: '',
        name: '',
        jabatan: '',
        department: '',
      })
    }
  }, [editingPegawai, isEdit, isOpen, reset])

  const onFormSubmit = (data: PegawaiFormValues) => {
    onSubmit(data)
    reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nip" className="text-right">
                NIP
              </Label>
              <Input id="nip" {...register('nip')} className="col-span-3" />
              {errors.nip && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.nip.message}</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <Input id="name" {...register('name')} className="col-span-3" />
              {errors.name && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="jabatan" className="text-right">
                Jabatan
              </Label>
              <Input id="jabatan" {...register('jabatan')} className="col-span-3" />
              {errors.jabatan && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.jabatan.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Unit
              </Label>
              <Input id="department" {...register('department')} className="col-span-3" />
              {errors.department && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.department.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{isEdit ? 'Simpan Perubahan' : 'Tambah'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
