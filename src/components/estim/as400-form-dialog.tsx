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
import { As400UserFormSchema, type As400UserFormValues } from '@/lib/types/Estim/formEstim'

interface As400FormDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: As400UserFormValues) => void
  isEdit: boolean
  editingAs400?: {
    id: number
    username: string
    display_user: string
    ip_address: string
    mac_address: string
  } | null
}

export function As400FormDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  isEdit,
  editingAs400,
}: As400FormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<As400UserFormValues>({
    resolver: zodResolver(As400UserFormSchema),
    defaultValues: {
      username: '',
      display_user: '',
      ip_address: '',
      mac_address: '',
    },
  })

  // Update form values when editing user changes
  useEffect(() => {
    if (isEdit && editingAs400) {
      reset({
        username: editingAs400.username,
        display_user: editingAs400.display_user,
        ip_address: editingAs400.ip_address,
        mac_address: editingAs400.mac_address,
      })
    } else if (!isOpen) {
      reset({
        username: '',
        display_user: '',
        ip_address: '',
        mac_address: '',
      })
    }
  }, [editingAs400, isEdit, isOpen, reset])

  const onFormSubmit = (data: As400UserFormValues) => {
    onSubmit(data)
    reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User ESTIM' : 'Tambah User ESTIM Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input id="username" {...register('username')} className="col-span-3" />
              {errors.username && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="display_user" className="text-right">
                Display User
              </Label>
              <Input id="display_user" {...register('display_user')} className="col-span-3" />
              {errors.display_user && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.display_user.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ip_address" className="text-right">
                IP Address
              </Label>
              <Input id="ip_address" {...register('ip_address')} className="col-span-3" />
              {errors.ip_address && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.ip_address.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mac_address" className="text-right">
                MAC Address
              </Label>
              <Input id="mac_address" {...register('mac_address')} className="col-span-3" />
              {errors.mac_address && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.mac_address.message}
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
