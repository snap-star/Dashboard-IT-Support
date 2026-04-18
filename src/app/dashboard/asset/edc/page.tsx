'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { MoreHorizontal, Pencil, Trash, Plus, Download } from 'lucide-react'
import { toast } from 'sonner'
import supabase from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { format } from 'date-fns'
import * as XLSX from 'xlsx'

// Schema validasi form
const formSchema = z.object({
  tid: z.string().min(1, 'TID harus diisi'),
  mid: z.string().min(1, 'MID harus diisi'),
  merchant_name: z.string().min(1, 'Nama merchant harus diisi'),
  location: z.string().min(1, 'Lokasi harus diisi'),
  serial_number: z.string().min(1, 'Serial number harus diisi'),
  ip_address: z.string().min(1, 'IP Address harus diisi'),
  status: z.string().min(1, 'Status harus diisi'),
  description: z.string().optional(),
})

interface EDCAsset {
  id: string
  created_at: string
  tid: string
  mid: string
  merchant_name: string
  location: string
  serial_number: string
  ip_address: string
  status: string
  description?: string
}

const locationOptions = [
  'Cabang Ponorogo',
  'Capem Sumoroto',
  'Capem Jetis',
  'Capem Pulung',
  'Capem Balong',
]

const statusOptions = ['Aktif', 'Rusak', 'Maintenance', 'Stock']

export default function EDCAssetPage() {
  const [assets, setAssets] = useState<EDCAsset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<EDCAsset | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tid: '',
      mid: '',
      merchant_name: '',
      location: '',
      serial_number: '',
      status: '',
      description: '',
    },
  })

  // Fetch data dari Supabase
  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('edc_assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      console.error('Error fetching EDC assets:', error)
      toast.error('Gagal memuat data EDC')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && selectedAsset) {
        const { error } = await supabase
          .from('edc_assets')
          .update(values)
          .eq('id', selectedAsset.id)

        if (error) throw error
        toast.success('Data EDC berhasil diperbarui')
      } else {
        const { error } = await supabase.from('edc_assets').insert([values])

        if (error) throw error
        toast.success('Data EDC berhasil ditambahkan')
      }

      fetchAssets()
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving EDC asset:', error)
      toast.error('Gagal menyimpan data EDC')
    }
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setIsEditing(false)
    setSelectedAsset(null)
    form.reset({
      tid: '',
      mid: '',
      merchant_name: '',
      location: '',
      serial_number: '',
      status: '',
      description: '',
    })
  }

  const handleAddNew = () => {
    setIsEditing(false)
    setSelectedAsset(null)
    form.reset({
      tid: '',
      mid: '',
      merchant_name: '',
      location: '',
      serial_number: '',
      status: '',
      description: '',
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (asset: EDCAsset) => {
    setSelectedAsset(asset)
    setIsEditing(true)
    form.reset(asset)
    setIsDialogOpen(true)
  }

  const handleDelete = (asset: EDCAsset) => {
    setSelectedAsset(asset)
    setIsDeleteAlertOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedAsset) {
      try {
        const { error } = await supabase.from('edc_assets').delete().eq('id', selectedAsset.id)

        if (error) throw error
        toast.success('Data EDC berhasil dihapus')
        fetchAssets()
      } catch (error) {
        console.error('Error deleting EDC asset:', error)
        toast.error('Gagal menghapus data EDC')
      }
    }
    setIsDeleteAlertOpen(false)
  }

  const downloadExcel = async () => {
    try {
      const { data, error } = await supabase
        .from('edc_assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData = data.map(item => ({
        TID: item.tid,
        MID: item.mid,
        'Nama Merchant': item.merchant_name,
        Lokasi: item.location,
        'Serial Number': item.serial_number,
        'IP Address': item.ip_address,
        Status: item.status,
        Keterangan: item.description || '-',
        'Tanggal Dibuat': format(new Date(item.created_at), 'dd MMM yyyy HH:mm'),
      }))

      const ws = XLSX.utils.json_to_sheet(formattedData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'EDC Assets')

      const fileName = `edc_assets_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`
      XLSX.writeFile(wb, fileName)
      toast.success('Data berhasil diexport')
    } catch (error) {
      console.error('Error exporting data:', error)
      toast.error('Gagal mengexport data')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center align-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Manajemen Asset EDC</CardTitle>
              <CardDescription>
                Kelola data EDC Pinpad, Android, Merchant, dan lainnya
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={downloadExcel} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleAddNew}>
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah EDC
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                      {isEditing ? 'Edit Data EDC' : 'Tambah Data EDC'}
                    </DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="tid"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">TID</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan TID..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="mid"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">MID</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan MID..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="merchant_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">Nama Merchant</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan nama merchant..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">Lokasi</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih lokasi" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {locationOptions.map(location => (
                                    <SelectItem key={location} value={location}>
                                      {location}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="serial_number"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">Serial Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan serial number..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ip_address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold">IP Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Masukkan IP address..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusOptions.map(status => (
                                  <SelectItem key={status} value={status}>
                                    {status}
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
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Keterangan</FormLabel>
                            <FormControl>
                              <Input placeholder="Masukkan keterangan (opsional)..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button variant="outline" type="button" onClick={handleCloseDialog}>
                          Batal
                        </Button>
                        <Button type="submit">{isEditing ? 'Simpan Perubahan' : 'Tambah'}</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">TID</TableHead>
                  <TableHead className="font-semibold">MID</TableHead>
                  <TableHead className="font-semibold">Merchant</TableHead>
                  <TableHead className="font-semibold">Lokasi</TableHead>
                  <TableHead className="font-semibold">Serial Number</TableHead>
                  <TableHead className="font-semibold">IP Address</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Keterangan</TableHead>
                  <TableHead className="w-[70px] font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">
                      Tidak ada data EDC
                    </TableCell>
                  </TableRow>
                ) : (
                  assets.map(asset => (
                    <TableRow key={asset.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{asset.tid}</TableCell>
                      <TableCell>{asset.mid}</TableCell>
                      <TableCell>{asset.merchant_name}</TableCell>
                      <TableCell>{asset.location}</TableCell>
                      <TableCell>{asset.serial_number}</TableCell>
                      <TableCell>{asset.ip_address}</TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            asset.status === 'Aktif'
                              ? 'bg-green-100 text-green-800'
                              : asset.status === 'Rusak'
                                ? 'bg-red-100 text-red-800'
                                : asset.status === 'Maintenance'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {asset.status}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{asset.description}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEdit(asset)}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(asset)}
                              className="cursor-pointer text-red-600"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data EDC ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
