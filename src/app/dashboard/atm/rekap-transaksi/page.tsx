'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, Loader2, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CartesianGrid, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import type { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getErrorMessage } from '@/hooks/functionGetErrorMessage'
import supabase from '@/lib/supabase'
import formSchema from '@/lib/types/ATM/AtmSchema'
import atmOptions from '@/lib/types/ATM/idATM'
import type TransaksiATM from '@/lib/types/ATM/TransaksiAtm'
import bulanOptions from '@/lib/types/util/bulan'
import formatToRupiah from '@/lib/types/util/formatToRupiah'

// Konfigurasi chart
const chartConfig = {
  total_transaksi: {
    label: 'Total Transaksi',
    color: '#2563eb',
  },
  total_nominal: {
    label: 'Total Nominal',
    color: '#60a5fa',
  },
} satisfies ChartConfig

export default function RekapTransaksiATM() {
  const [isLoading, setIsLoading] = useState(true)
  const [transaksi, setTransaksi] = useState<(typeof TransaksiATM)[]>([])
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [years, setYears] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingData, setEditingData] = useState<typeof TransaksiATM | null>(null)
  const [chartData, setChartData] = useState<any[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      atm_id: '',
      tahun: new Date().getFullYear().toString(),
      bulan: '',
      jumlah_transaksi: '',
      total_nominal: '',
      keterangan: '',
    },
  })

  // Reset form saat dialog ditutup
  useEffect(() => {
    if (!isDialogOpen) {
      form.reset()
      setEditingData(null)
    }
  }, [isDialogOpen])

  // Fetch data saat tahun berubah
  useEffect(() => {
    fetchTransaksi()
  }, [selectedYear])

  const fetchTransaksi = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('rekap_transaksi_atm')
        .select('*')
        .eq('tahun', Number.parseInt(selectedYear))
        .order('atm_id', { ascending: true })
        .order('bulan', { ascending: true })

      if (error) throw error

      setTransaksi(data || [])

      // Siapkan data untuk chart
      const chartData = data?.reduce((acc: (typeof chartConfig)[], TRXATM: typeof TransaksiATM) => {
        const existingData = acc.find(item => item.bulan === TRXATM.bulan)
        if (existingData) {
          existingData.total_transaksi += TRXATM.jumlah_transaksi
          existingData.total_nominal += Number.parseFloat(TRXATM.total_nominal)
        } else {
          acc.push({
            bulan: TRXATM.bulan,
            total_transaksi: TRXATM.jumlah_transaksi,
            total_nominal: Number.parseFloat(TRXATM.total_nominal),
          })
        }
        return acc
      }, [])

      setChartData(chartData || [])

      // Fetch tahun yang tersedia
      const { data: yearsData } = await supabase
        .from('rekap_transaksi_atm')
        .select('tahun')
        .order('tahun', { ascending: false })

      const uniqueYears = [...new Set(yearsData?.map(item => item.tahun.toString()) || [])]
      if (!uniqueYears.includes(selectedYear)) {
        uniqueYears.push(selectedYear)
      }
      setYears(uniqueYears.sort((a, b) => Number.parseInt(b) - Number.parseInt(a)))
    } catch (error: unknown) {
      console.error('Error:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)
      console.log('Form values:', values)

      // Validasi input
      if (
        !values.atm_id ||
        !values.tahun ||
        !values.bulan ||
        !values.jumlah_transaksi ||
        !values.total_nominal
      ) {
        toast.error('Semua field harus diisi')
        return
      }

      const dataToSubmit = {
        atm_id: values.atm_id,
        tahun: Number.parseInt(values.tahun),
        bulan: values.bulan,
        jumlah_transaksi: Number.parseInt(values.jumlah_transaksi),
        total_nominal: Number.parseFloat(values.total_nominal),
        rata_rata_harian: Number.parseFloat(
          (Number.parseInt(values.jumlah_transaksi) / 30).toFixed(2),
        ), // Simplified average
        keterangan: values.keterangan || null,
      }

      console.log('Data to submit:', dataToSubmit)

      if (editingData) {
        // Update existing data
        const { error: updateError } = await supabase
          .from('rekap_transaksi_atm')
          .update(dataToSubmit)
          .eq('id', editingData.id)

        if (updateError) {
          console.error('Update error:', updateError)
          toast.error('Gagal memperbarui data')
          return
        }

        toast.success('Data berhasil diperbarui')
      } else {
        // Check for existing data
        const { data: existingData, error: checkError } = await supabase
          .from('rekap_transaksi_atm')
          .select('id')
          .eq('atm_id', values.atm_id)
          .eq('tahun', dataToSubmit.tahun)
          .eq('bulan', values.bulan)
          .maybeSingle()

        if (checkError) {
          console.error('Check error:', checkError)
          return
        }

        if (existingData) {
          toast.error(
            `Data untuk ATM ${values.atm_id} periode ${values.bulan} ${values.tahun} sudah ada`,
          )
          return
        }

        // Insert new data
        const { error: insertError } = await supabase
          .from('rekap_transaksi_atm')
          .insert([dataToSubmit])

        if (insertError) {
          console.error('Insert error:', insertError)
          toast.error('Gagal menambahkan data')
          return
        }

        toast.success('Data berhasil ditambahkan')
      }

      // Reset form and refresh data
      setIsDialogOpen(false)
      form.reset({
        atm_id: '',
        tahun: new Date().getFullYear().toString(),
        bulan: '',
        jumlah_transaksi: '',
        total_nominal: '',
        keterangan: '',
      })
      fetchTransaksi()
    } catch (error: unknown) {
      console.error('Error:', error)
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      const exportData = transaksi.map(item => ({
        'ATM ID': item.atm_id,
        Bulan: item.bulan,
        'Jumlah Transaksi': item.jumlah_transaksi.toLocaleString(),
        'Total Nominal': formatToRupiah(item.total_nominal),
        'Rata-rata Harian': item.rata_rata_harian.toLocaleString(),
        Keterangan: item.keterangan || '-',
      }))

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)

      ws['!cols'] = [
        { wch: 15 }, // ATM ID
        { wch: 15 }, // Bulan
        { wch: 20 }, // Jumlah Transaksi
        { wch: 25 }, // Total Nominal
        { wch: 20 }, // Rata-rata Harian
        { wch: 30 }, // Keterangan
      ]

      XLSX.utils.book_append_sheet(wb, ws, `Rekap Transaksi ATM ${selectedYear}`)
      XLSX.writeFile(wb, `rekap_transaksi_atm_${selectedYear}.xlsx`)

      toast.success('Data berhasil di-export')
    } catch (error: unknown) {
      console.error('Export error:', error)
      toast.error(getErrorMessage(error))
    }
  }

  // Tambahkan fungsi untuk mengecek kelengkapan data bulan ini
  const checkMonthlyCompletion = async (tahun: number, bulan: string) => {
    try {
      const { data, error } = await supabase
        .from('rekap_transaksi_atm')
        .select('atm_id')
        .eq('tahun', tahun)
        .eq('bulan', bulan)

      if (error) throw error

      const submittedAtms = new Set(data?.map(item => item.atm_id))
      const remainingAtms = atmOptions.filter(atmId => !submittedAtms.has(atmId))

      return {
        total: atmOptions.length,
        submitted: submittedAtms.size,
        remaining: remainingAtms,
        isComplete: submittedAtms.size === atmOptions.length,
      }
    } catch (error) {
      console.error('Error checking completion:', error)
      return null
    }
  }

  // Update tampilan untuk menampilkan progress
  useEffect(() => {
    const checkCompletion = async () => {
      const completion = await checkMonthlyCompletion(
        Number.parseInt(selectedYear),
        bulanOptions[new Date().getMonth()],
      )
      if (completion) {
        // Tampilkan informasi progress
        const progressMessage = completion.isComplete
          ? `Semua data ATM (${completion.total}) untuk bulan ini telah lengkap`
          : `${completion.submitted} dari ${completion.total} ATM telah diinput`

        if (!completion.isComplete) {
          toast.info(progressMessage)
        }
      }
    }

    checkCompletion()
  }, [selectedYear])

  // Pastikan format input numerik benar
  const formatNumber = (value: string) => {
    // Hapus semua karakter non-digit
    return value.replace(/[^0-9]/g, '')
  }

  // Tambahkan fungsi untuk handle edit dan delete
  const handleEdit = (data: TransaksiATM) => {
    setEditingData(data)
    form.reset({
      atm_id: data.atm_id,
      tahun: data.tahun.toString(),
      bulan: data.bulan,
      jumlah_transaksi: data.jumlah_transaksi.toString(),
      total_nominal: data.total_nominal.toString(),
      keterangan: data.keterangan || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      try {
        const { error } = await supabase.from('rekap_transaksi_atm').delete().eq('id', id)

        if (error) throw error
        toast.success('Data berhasil dihapus')
        fetchTransaksi()
      } catch (error: unknown) {
        console.error('Error:', error)
        toast.error(getErrorMessage(error))
      }
    }
  }

  return (
    <div className="space-y-4 p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Rekap Transaksi ATM</CardTitle>
            <CardDescription>Data transaksi ATM per bulan</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsDialogOpen(true)}>Tambah Data</Button>
            <Button variant="outline" onClick={handleExport}>
              Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ATM ID</TableHead>
                  <TableHead>Bulan</TableHead>
                  <TableHead className="text-right">Jumlah Transaksi</TableHead>
                  <TableHead className="text-right">Total Nominal</TableHead>
                  <TableHead className="text-right">Rata-rata Harian</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transaksi.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.atm_id}</TableCell>
                    <TableCell>{item.bulan}</TableCell>
                    <TableCell className="text-right">
                      {item.jumlah_transaksi.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatToRupiah(item.total_nominal)}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.rata_rata_harian.toLocaleString()}
                    </TableCell>
                    <TableCell>{item.keterangan || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visualisasi Data Transaksi</CardTitle>
          <CardDescription>
            Grafik menunjukkan total transaksi dan nominal per bulan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_transaksi"
                stroke={chartConfig.total_transaksi.color}
              />
              <Line
                type="monotone"
                dataKey="total_nominal"
                stroke={chartConfig.total_nominal.color}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingData ? 'Edit Data Transaksi' : 'Tambah Data Transaksi'}
            </DialogTitle>
            <DialogDescription>
              Masukkan detail transaksi ATM untuk periode yang dipilih
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="atm_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ATM ID</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih ATM ID" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {atmOptions.map(atmId => (
                          <SelectItem key={atmId} value={atmId}>
                            {atmId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tahun"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun</FormLabel>
                      <FormControl>
                        <Input placeholder="2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bulan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bulan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih Bulan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bulanOptions.map(bulan => (
                            <SelectItem key={bulan} value={bulan}>
                              {bulan}
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
                name="jumlah_transaksi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumlah Transaksi</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="100000"
                        {...field}
                        onChange={e => field.onChange(formatNumber(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="total_nominal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Nominal</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="100000000"
                        {...field}
                        onChange={e => field.onChange(formatNumber(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keterangan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keterangan</FormLabel>
                    <FormControl>
                      <Input placeholder="Keterangan (opsional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : editingData ? (
                    'Simpan Perubahan'
                  ) : (
                    'Tambah Data'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
