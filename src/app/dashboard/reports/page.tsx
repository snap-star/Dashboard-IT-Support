'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import imageCompression from 'browser-image-compression'
import { id } from 'date-fns/locale'
import { format, toZonedTime } from 'date-fns-tz'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  Camera,
  Check,
  Download,
  Droplets,
  Printer,
  Shield,
  Thermometer,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import supabase from '@/lib/supabase'
import { cn } from '@/lib/utils'

// Schema untuk form checklist
const checklistSchema = z.object({
  location_id: z.string().min(1, 'Lokasi harus dipilih'),
  room_id: z.string().min(1, 'Ruangan harus dipilih'),
  checked_by: z.string().min(1, 'Nama petugas harus diisi'),
  temperature: z.string().regex(/^\d*\.?\d*$/, 'Suhu harus berupa angka'),
  humidity: z.string().regex(/^\d*\.?\d*$/, 'Kelembaban harus berupa angka'),
  is_clean: z.boolean().default(false),
  is_secure: z.boolean().default(false),
  equipment_status: z.string().min(1, 'Status peralatan harus diisi'),
  notes: z.string().optional().default(''),
  image_url: z.string().optional(),
})

interface Location {
  id: string
  name: string
  type: string
}

interface Room {
  id: string
  location_id: string
  name: string
}

interface RoomCheck {
  id: string
  room_id: string
  location_name: string
  room_name: string
  checked_by: string
  temperature: number
  humidity: number
  is_clean: boolean
  is_secure: boolean
  equipment_status: string
  notes: string
  check_date: string
  check_time: string
  formatted_time: string
  image_url: string
}

// Fungsi helper untuk format waktu Indonesia
const formatIndonesianTime = (date: Date | string) => {
  // Konversi ke timezone Asia/Jakarta
  const jakartaTime = toZonedTime(new Date(date), 'Asia/Jakarta')
  return format(jakartaTime, 'HH:mm', { timeZone: 'Asia/Jakarta' })
}

const formatIndonesianDate = (date: Date | string) => {
  const jakartaTime = toZonedTime(new Date(date), 'Asia/Jakarta')
  return format(jakartaTime, 'dd MMMM yyyy', {
    locale: id,
    timeZone: 'Asia/Jakarta',
  })
}

// Tambahkan fungsi untuk kompresi gambar
const compressImage = async (file: File) => {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  }

  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile
  } catch (error) {
    console.error('Error compressing image:', error)
    throw error
  }
}

export default function RoomChecklistPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [checks, setChecks] = useState<RoomCheck[]>([])
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const [isExporting, setIsExporting] = useState(false)
  const form = useForm<z.infer<typeof checklistSchema>>({
    resolver: zodResolver(checklistSchema),
    defaultValues: {
      location_id: '',
      room_id: '',
      checked_by: '',
      temperature: '',
      humidity: '',
      is_clean: false,
      is_secure: false,
      equipment_status: '',
      notes: '',
      image_url: '',
    },
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const checklistRef = useRef<HTMLDivElement>(null)

  //fungsi generate pdf
  const generatePDF = async () => {
    if (!checklistRef.current) return
    try {
      toast.loading('Menyiapkan PDF...')
      const canvas = await html2canvas(checklistRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const imgWidth = 210 // A4 size
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`checklistt_${format(new Date(), 'ddMMyyyy')}.pdf`)
      toast.dismiss()
      toast.success('PDF berhasil dibuat')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Gagal membuat PDF')
    }
  }

  // Fungsi untuk print
  const handlePrint = useCallback(() => {
    if (!checklistRef.current) return

    const printContent = checklistRef.current
    const originalContents = document.body.innerHTML

    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalContents
    window.location.reload() // Reload halaman setelah print
  }, [])

  // Fungsi untuk upload gambar ke Supabase Storage
  const uploadImage = async (file: File) => {
    try {
      const compressedFile = await compressImage(file)
      const fileName = `${Date.now()}-${file.name}`

      const { data, error } = await supabase.storage
        .from('room-checks') // Sesuaikan dengan nama bucket Anda
        .upload(fileName, compressedFile)

      if (error) throw error

      // Dapatkan public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('room-checks').getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }

  // Handler untuk capture/upload gambar
  const handleImageCapture = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      try {
        const imageUrl = await uploadImage(file)
        form.setValue('image_url', imageUrl)
        toast.success('Gambar berhasil diunggah')
      } catch (error: any) {
        toast.error('Gagal mengunggah gambar:' + error + error.message)
      }
    },
    [form],
  )

  // Fetch locations dan rooms
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch locations
        const { data: locationsData, error: locError } = await supabase
          .from('locations')
          .select('*')
          .order('name')

        if (locError) throw locError

        // Fetch rooms
        const { data: roomsData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .order('name')

        if (roomError) throw roomError

        if (locationsData) setLocations(locationsData)
        if (roomsData) setRooms(roomsData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Gagal memuat data')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch checklist hari ini
  useEffect(() => {
    async function fetchChecks() {
      try {
        const today = new Date()
        const jakartaDate = format(toZonedTime(today, 'Asia/Jakarta'), 'yyyy-MM-dd')

        const { data, error } = await supabase
          .from('room_checks')
          .select(
            `
            *,
            rooms:room_id(
              id,
              name,
              locations:location_id(
                id,
                name
              )
            )
          `,
          )
          .eq('check_date', jakartaDate)
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data) {
          const formattedChecks = data.map(check => ({
            ...check,
            location_name: check.rooms.locations.name,
            room_name: check.rooms.name,
            formatted_time: formatIndonesianTime(`${check.check_date}T${check.check_time}`),
          }))
          setChecks(formattedChecks)
        }
      } catch (error) {
        console.error('Error fetching checks:', error)
        toast.error('Gagal memuat data checklist')
      } finally {
        setIsLoading(false)
      }
    }
    fetchChecks()
  }, [])

  // Filter rooms berdasarkan location
  const handleLocationChange = (locationId: string) => {
    console.log('Selected location:', locationId) // Debug
    const filtered = rooms.filter(room => room.location_id === locationId)
    console.log('Filtered rooms:', filtered) // Debug
    setFilteredRooms(filtered)
    form.setValue('room_id', '')
  }

  // Submit checklist
  const onSubmit = async (values: z.infer<typeof checklistSchema>) => {
    try {
      const now = new Date()
      const jakartaTime = toZonedTime(now, 'Asia/Jakarta')
      const checkDate = format(jakartaTime, 'yyyy-MM-dd')
      const checkTime = format(jakartaTime, 'HH:mm:ss')

      const { error } = await supabase
        .from('room_checks')
        .insert([
          {
            room_id: values.room_id,
            checked_by: values.checked_by,
            temperature: Number.parseFloat(values.temperature),
            humidity: Number.parseFloat(values.humidity),
            is_clean: values.is_clean,
            is_secure: values.is_secure,
            equipment_status: values.equipment_status,
            notes: values.notes || '',
            check_date: checkDate,
            check_time: checkTime,
            image_url: values.image_url || null,
          },
        ])
        .select()
        .single()

      if (error) throw error

      toast.success('Checklist berhasil disimpan')
      form.reset(
        {
          location_id: '',
          room_id: '',
          checked_by: '',
          temperature: '',
          humidity: '',
          is_clean: false,
          is_secure: false,
          equipment_status: '',
          notes: '',
          image_url: '',
        },
        { keepValues: false },
      )

      // Refresh data checklist
      const { data: newChecks, error: fetchError } = await supabase
        .from('room_checks')
        .select(
          `
          *,
          rooms:room_id(
            id,
            name,
            locations:location_id(
              id,
              name
            )
          )
        `,
        )
        .eq('check_date', checkDate)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      if (newChecks) {
        const formattedChecks = newChecks.map(check => ({
          ...check,
          location_name: check.rooms.locations.name,
          room_name: check.rooms.name,
          formatted_time: formatIndonesianTime(`${check.check_date}T${check.check_time}`),
        }))
        setChecks(formattedChecks)
      }
    } catch (error) {
      console.error('Error saving checklist:', error)
      toast.error('Gagal menyimpan checklist')
    }
  }

  // Fungsi untuk mengambil data berdasarkan range
  const fetchChecklistData = async (startDate?: Date, endDate?: Date) => {
    try {
      let query = supabase
        .from('room_checks')
        .select(
          `
          *,
          rooms:room_id(
            id,
            name,
            locations:location_id(
              id,
              name
            )
          )
        `,
        )
        .order('check_date', { ascending: false })

      if (startDate) {
        const formattedStart = format(toZonedTime(startDate, 'Asia/Jakarta'), 'yyyy-MM-dd')
        query = query.gte('check_date', formattedStart)
      }
      if (endDate) {
        const formattedEnd = format(toZonedTime(endDate, 'Asia/Jakarta'), 'yyyy-MM-dd')
        query = query.lte('check_date', formattedEnd)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(check => ({
        Tanggal: formatIndonesianDate(check.check_date),
        Waktu: formatIndonesianTime(`${check.check_date}T${check.check_time}`),
        Lokasi: check.rooms.locations.name,
        Ruangan: check.rooms.name,
        'Suhu (°C)': check.temperature,
        'Kelembaban (%)': check.humidity,
        'Kondisi Bersih': check.is_clean ? 'Ya' : 'Tidak',
        'Kondisi Aman': check.is_secure ? 'Ya' : 'Tidak',
        'Status Peralatan': check.equipment_status,
        Petugas: check.checked_by,
        Catatan: check.notes || '-',
        image_url: check.image_url || '-',
      }))
    } catch (error) {
      console.error('Error fetching data:', error)
      throw error
    }
  }

  // Fungsi untuk export ke Excel
  const exportToExcel = async (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Checklist')
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  // Handler untuk export semua data
  const handleExportAll = async () => {
    setIsExporting(true)
    try {
      const data = await fetchChecklistData()
      await exportToExcel(data, `checklist_all_data_${format(new Date(), 'ddMMyyyy')}`)
      toast.success('Data berhasil diexport')
    } catch (error) {
      toast.error('Gagal mengexport data')
    } finally {
      setIsExporting(false)
    }
  }

  // Handler untuk export data berdasarkan range
  const handleExportRange = async () => {
    if (!date?.from) {
      toast.error('Pilih tanggal mulai')
      return
    }
    setIsExporting(true)
    try {
      const data = await fetchChecklistData(date.from, date.to)
      const filename = date.to
        ? `checklist_${format(date.from, 'ddMMyyyy')}_${format(date.to, 'ddMMyyyy')}`
        : `checklist_${format(date.from, 'ddMMyyyy')}`
      await exportToExcel(data, filename)
      toast.success('Data berhasil diexport')
    } catch (error) {
      toast.error('Gagal mengexport data')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'justify-start text-left font-normal',
                  !date && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {formatIndonesianDate(date.from)} - {formatIndonesianDate(date.to)}
                    </>
                  ) : (
                    formatIndonesianDate(date.from)
                  )
                ) : (
                  'Pilih tanggal'
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button disabled={isExporting}>
                {isExporting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Mengexport...
                  </>
                ) : (
                  <>Download Excel</>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportAll}>Semua Data</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportRange} disabled={!date?.from}>
                Data Berdasarkan Tanggal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Form Checklist Ruangan</CardTitle>
            <CardDescription>Isi form checklist untuk pengecekan ruangan</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="location_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lokasi</FormLabel>
                      <Select
                        onValueChange={value => {
                          field.onChange(value)
                          handleLocationChange(value)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih lokasi" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

                <FormField
                  control={form.control}
                  name="room_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ruangan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!form.watch('location_id')}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih ruangan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredRooms.map(room => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="checked_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Petugas</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Masukkan nama petugas" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Suhu (°C)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0.0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="humidity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kelembaban (%)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="0.0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="is_clean"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Kondisi Bersih</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_secure"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Kondisi Aman</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="equipment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status Peralatan</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Perlu Pengecekan">Perlu Pengecekan</SelectItem>
                          <SelectItem value="Butuh Perbaikan">Butuh Perbaikan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Tambahkan catatan jika ada..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tambahkan input file dan preview gambar sebelum Button submit */}
                <div className="space-y-2">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageCapture}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Ambil/Upload Foto
                    </Button>
                  </div>

                  {form.watch('image_url') && (
                    <div className="relative w-full h-48">
                      <img
                        src={form.watch('image_url')}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => form.setValue('image_url', '')}
                      >
                        Hapus
                      </Button>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  Simpan Checklist
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Checklist Hari Ini</CardTitle>
            <CardDescription>{formatIndonesianDate(new Date())}</CardDescription>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={generatePDF} title="Simpan sebagai PDF">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} title="Cetak checklist">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={checklistRef}>
              {/* Tambahkan style untuk print */}
              <style type="text/css" media="print">
                {`
                  @page { size: auto; margin: 20mm; }
                  body { margin: 0; padding: 20px; }
                `}
              </style>
              {isLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
              ) : checks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <p>Belum ada checklist untuk hari ini</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {checks.map(check => (
                    <Card key={check.id} className="hover:border-red-600 dark:hover:border-white">
                      <CardContent className="pt-6">
                        <div className="grid gap-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{check.location_name}</h4>
                              <p className="text-sm text-muted-foreground">{check.room_name}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{check.formatted_time}</p>
                              <p className="text-sm text-muted-foreground">{check.checked_by}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Thermometer className="h-4 w-4 text-orange-500" />
                              <span className="text-sm">Temperatur: {check.temperature}°C</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">Kelembapan: {check.humidity}%</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                              <Check
                                className={`h-4 w-4 ${check.is_clean ? 'text-green-500' : 'text-red-500'}`}
                              />
                              <span className="text-sm">
                                Kondisi: {check.is_clean ? 'Bersih' : 'Perlu Dibersihkan'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield
                                className={`h-4 w-4 ${check.is_secure ? 'text-green-500' : 'text-red-500'}`}
                              />
                              <span className="text-sm">
                                Status: {check.is_secure ? 'Aman' : 'Perlu Dicek'}
                              </span>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium">Status Peralatan:</p>
                            <p
                              className={`text-sm ${
                                check.equipment_status === 'Normal'
                                  ? 'text-green-600'
                                  : check.equipment_status === 'Perlu Pengecekan'
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              {check.equipment_status}
                            </p>
                          </div>

                          {check.image_url && (
                            <div className="mt-4">
                              <img
                                src={check.image_url}
                                alt="Room check"
                                className="w-full h-48 object-cover rounded-md"
                              />
                            </div>
                          )}
                          {check.notes && (
                            <div>
                              <p className="text-sm font-medium">Catatan:</p>
                              <p className="text-sm text-muted-foreground">{check.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
