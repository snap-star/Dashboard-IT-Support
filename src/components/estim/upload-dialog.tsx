import { useRef, useState } from 'react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useEstim } from '@/hooks/estim/use-estim'

interface UploadDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadDialog({ isOpen, onOpenChange }: UploadDialogProps) {
  const { uploadBulkData } = useEstim()
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const template = [
      {
        nip: 'NIP 8 Digit',
        name: 'Nama Lengkap',
        jabatan: 'Jabatan Pegawai',
        department: 'Unit Bagian',
        username: 'User ESTIM',
        display_user: 'Display User',
        ip_address: '192.168.1.1',
        mac_address: '00:00:00:00:00:00',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(template)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'template_pegawai.xlsx')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) setFile(selectedFile)
  }

  const handleSubmit = async () => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = async event => {
      try {
        const data = event.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        await uploadBulkData(jsonData)
        toast.success('Data berhasil diupload')
        onOpenChange(false)
        setFile(null)
      } catch (error) {
        console.error('Error processing file:', error)
        toast.error('Gagal memproses file')
      }
    }
    reader.readAsBinaryString(file)
  }

  const handleClose = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Upload Data Pegawai dari Excel</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button variant="secondary" onClick={downloadTemplate}>
            Download Template
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="file:mr-4 file:rounded file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />
          {file && <p className="text-sm text-muted-foreground">File: {file.name}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!file}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
