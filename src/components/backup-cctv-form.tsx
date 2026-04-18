'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Download, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import * as XLSX from 'xlsx'
import supabase from '@/lib/supabase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { id } from 'date-fns/locale'

// Schema validasi form
const formSchema = z.object({
  backupFileName: z.string().min(8, {
    message:
      'Nama file backup harus diisi minimal tanggal mulai backup dan akhir backup. (contoh: 01-02-2021 s/d 30-09-2021)',
  }),
  tanggalBackup: z.date({
    required_error: 'Tanggal backup harus diisi',
  }),
  dvr: z
    .string({
      required_error: 'DVR harus dipilih.',
    })
    .min(4, {
      message: 'DVR harus dipilih',
    }),
  location: z
    .string({
      required_error: 'Lokasi backup harus dipilih.',
    })
    .min(12, {
      message: 'Lokasi harus diisi',
    }),
  petugas: z.string().min(2, {
    message: 'Nama petugas harus diisi',
  }),
  notes: z.string().optional(),
})

const locations = [
  { id: 'cabang-ponorogo', name: 'Cabang Ponorogo' },
  { id: 'kff-pemda', name: 'KFF Pemda' },
  { id: 'kff-sukorejo', name: 'KFF Sukorejo' },
  { id: 'kff-jenangan', name: 'KFF Jenangan' },
  { id: 'kff-rsud-harjono', name: 'KFF RSUD Harjono' },
  { id: 'kff-slahung', name: 'KFF Slahung' },
  { id: 'kff-sawoo', name: 'KFF Sawoo' },
  { id: 'capem-sumoroto', name: 'Capem Sumoroto' },
  { id: 'capem-jetis', name: 'Capem Jetis' },
  { id: 'capem-pulung', name: 'Capem Pulung' },
  { id: 'capem-balong', name: 'Capem Balong' },
  { id: 'jtm02009', name: 'JTM 02009 - ATM RS Muslimat' },
  { id: 'jtm02010', name: 'JTM 02010 - ATM RS Darmayu' },
  { id: 'jtm02014', name: 'JTM 02014 - ATM Gedung Terpadu' },
  { id: 'jtm02019', name: 'JTM 02019 - ATM Pasar Legi' },
  { id: 'jtm02020', name: 'JTM 02020 - ATM Pasar Pon' },
  { id: 'jtm09302', name: 'JTM 09302 - ATM Pasar Bungkal' },
]

export function BackupCCTVForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      backupFileName: '',
      dvr: '',
      location: '',
      petugas: '',
      notes: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const loadingToast = toast.loading('Menyimpan data...')

    try {
      const { error } = await supabase.from('cctv_backups').insert([
        {
          backup_file_name: values.backupFileName,
          tanggal_backup: values.tanggalBackup,
          dvr: values.dvr,
          lokasi: values.location,
          petugas: values.petugas,
          notes: values.notes,
        },
      ])

      if (error) throw error

      form.reset(
        {
          backupFileName: '',
          petugas: '',
          dvr: '',
          location: '',
          notes: '',
        },
        { keepValues: false },
      )
      toast.success('Data berhasil disimpan!', {
        id: loadingToast,
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan saat menyimpan data', {
        id: loadingToast,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function exportToExcel(locationId?: string) {
    const loadingToast = toast.loading('Mengekspor data...')

    try {
      let query = supabase
        .from('cctv_backups')
        .select('*')
        .order('tanggal_backup', { ascending: false })

      if (locationId) {
        query = query.eq('lokasi', locationId)
      }

      const { data, error } = await query

      if (error) throw error

      if (!data || data.length === 0) {
        toast.error('Tidak ada data untuk diekspor', {
          id: loadingToast,
        })
        return
      }

      // Format data sebelum di-export
      const formattedData = data.map((record: any) => ({
        ...record,
        tanggal_backup: format(new Date(record.tanggal_backup), 'dd MMMM yyyy', { locale: id }),
        created_at:
          format(new Date(record.created_at), 'dd MMMM yyyy HH:mm:ss', { locale: id }) + ' WIB',
      }))

      const ws = XLSX.utils.json_to_sheet(formattedData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Backup CCTV')

      const fileName = locationId
        ? `backup-cctv-${locationId}-${format(new Date(), 'dd-MM-yyyy-HH-mm', { locale: id })}.xlsx`
        : `backup-cctv-all-${format(new Date(), 'dd-MM-yyyy-HH-mm', { locale: id })}.xlsx`

      XLSX.writeFile(wb, fileName)

      toast.success('Data berhasil diekspor!', {
        id: loadingToast,
      })
    } catch (error) {
      console.error('Error:', error)
      toast.error('Terjadi kesalahan saat mengekspor data', {
        id: loadingToast,
      })
    }
  }

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-2xl mx-auto p-6 pb-20 space-y-8">
        <div className="space-y-2">
          <Card className="p-4 shadow-lg hover:border-red-600 dark:hover:border-white">
            <CardHeader>
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
                Form Register Backup CCTV
              </h1>
            </CardHeader>
            <CardFooter>
              <p className="text-gray-500 justify-center">
                Silakan isi form pencatatan backup CCTV di bawah ini
              </p>
            </CardFooter>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="backupFileName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama File Backup</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama file backup" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tanggalBackup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tanggal Backup</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground',
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP', { locale: id })
                                ) : (
                                  <span>Pilih tanggal</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={date => date > new Date() || date < new Date('1900-01-01')}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="dvr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DVR</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''} required>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih DVR" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="dvr1">DVR 1</SelectItem>
                              <SelectItem value="dvr2">DVR 2</SelectItem>
                              <SelectItem value="dvr3">DVR 3</SelectItem>
                              <SelectItem value="dvr4">DVR 4</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lokasi</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''} required>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih lokasi" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[200px] overflow-y-auto">
                              {locations.map(location => (
                                <SelectItem key={location.id} value={location.id}>
                                  {location.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="petugas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Petugas Backup</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama petugas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Catatan (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan catatan tambahan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button type="submit" disabled={isLoading}>
                      <Save className="h-4 w-4" />
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        'Simpan'
                      )}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Export Excel
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-[200px] max-h-[300px] overflow-y-auto"
                        side="top"
                      >
                        <DropdownMenuItem onClick={() => exportToExcel()}>
                          Semua Lokasi
                        </DropdownMenuItem>
                        {locations.map(location => (
                          <DropdownMenuItem
                            key={location.id}
                            onClick={() => exportToExcel(location.id)}
                          >
                            {location.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
