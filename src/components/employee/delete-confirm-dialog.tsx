'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Employee } from '@/lib/types/Employee/formEmployee'

interface DeleteConfirmDialogProps {
  employee: Employee | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function DeleteConfirmDialog({
  employee,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) {
  if (!employee) return null

  return (
    <AlertDialog open={!!employee} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] max-w-100 mx-4">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">Konfirmasi Hapus</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Apakah Anda yakin ingin menghapus data pegawai <strong>{employee.name}</strong> dengan
            NIP <strong>{employee.nip}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="w-full sm:w-auto">Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
