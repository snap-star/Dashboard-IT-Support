'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { Table, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import supabase from '@/lib/supabase'
import WeekendLayout from '@/app/dashboard/weekend_banking/layout'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'

type User = {
  user_estim: string
  nama: string
  nip: string
  ip_address: string
  unit_kerja: string
}

type FormData = {
  supervisor: {
    name: string
    nip: string
    position: string
    unit: string
  }
  applicant: {
    user_estim: string
    name: string
    nip: string
    unit: string
    position: string
    ip: string
  }
  requestType: string
  applications: {
    appName: string
    user: string
    startDate: string
    endDate: string
    reason: string
    risk: string
  }[]
  approvedBy: {
    name: string
    position: string
  }
  createdBy: {
    name: string
    position: string
  }
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const { register, control, handleSubmit, setValue, watch } = useForm<FormData>({
    defaultValues: {
      applications: [
        {
          appName: '',
          user: '',
          startDate: '',
          endDate: '',
          reason: '',
          risk: '',
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'applications',
  })

  const [loading, setLoading] = useState(false)

  // Fetch users saat komponen dimount
  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_estim, nama, nip, ip_address, unit_kerja')
        .not('user_estim', 'is', null)

      if (error) throw error

      // Filter untuk mendapatkan user unik dan memastikan user_estim tidak kosong
      const uniqueUsers = data?.reduce((acc, current) => {
        if (current.user_estim && current.user_estim.trim() !== '') {
          const x = acc.find(item => item.user_estim === current.user_estim)
          if (!x) {
            return acc.concat([current])
          }
        }
        return acc
      }, [] as User[])

      setUsers(uniqueUsers || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  // Handle saat user dipilih
  const handleUserChange = (selectedUserEstim: string) => {
    const selectedUser = users.find(user => user.user_estim === selectedUserEstim)
    if (selectedUser) {
      setValue('applicant.name', selectedUser.nama)
      setValue('applicant.nip', selectedUser.nip)
      setValue('applicant.ip', selectedUser.ip_address)
      setValue('applicant.unit', selectedUser.unit_kerja)
    }
  }

  //handle print sesuai form
  const handlePrint = () => {
    if (formRef.current) {
      // Simpan styling asli form
      const originalStyles = document.querySelectorAll("style, link[rel='stylesheet']")

      const clonedForm = formRef.current.cloneNode(true) as HTMLFormElement

      // Buat elemen sementara untuk menampilkan form
      const printContainer = document.createElement('div')

      //disabled karena muncul 2 halaman todo : next fix
      // printContainer.appendChild(clonedForm);

      //tambahkan header ke print container
      const header = document.querySelector('#header-form-pengajuan')
      if (header) {
        const clonedHeader = header.cloneNode(true) as HTMLElement
        printContainer.insertBefore(clonedHeader, printContainer.firstChild) // harusnya (clonedheader, clonedform)
      }

      //atur scale form untuk print
      printContainer.style.width = '990px' //atur lebar
      printContainer.style.height = '600px' //atur tinggi
      //   printContainer.style.margin = "10px"; //margin uncomment jika membutuhkan
      //   printContainer.style.display = "block";
      //   printContainer.style.position = "absolute"
      //scale dokumen form
      printContainer.style.transform = 'scale(1)'
      printContainer.style.transformOrigin = 'top left'
      printContainer.style.overflow = 'visible' //hidden overflow

      // Sembunyikan semua elemen lain di halaman
      const originalBody = document.body.innerHTML
      document.body.innerHTML = ''
      document.body.appendChild(printContainer)

      // Tambahkan CSS untuk print
      const printStyles = `
        @media print {
          @page {
            size: legal;
          }
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
          }
          table, th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
          }
          .border-0 {
            border: none !important;
          }
        }
      `

      const styleSheet = document.createElement('style')
      styleSheet.type = 'text/css'
      styleSheet.innerText = printStyles
      printContainer.appendChild(styleSheet)

      // Cetak form
      window.print()

      // Kembalikan halaman ke keadaan semula
      document.body.innerHTML = originalBody
      originalStyles.forEach(style => document.head.appendChild(style))
      document.body.style.overflow = 'hidden'
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)

      // Transform data untuk access_logs
      const accessLogData = {
        user_estim: data.applicant.user_estim,
        ip_address: data.applicant.ip,
        nama: data.applicant.name,
        nip: data.applicant.nip,
        tanggal_awal: data.applications[0].startDate,
        tanggal_akhir: data.applications[0].endDate,
        jenis_permohonan: data.requestType,
        nama_supervisor: data.supervisor.name,
        jabatan_atasan: data.supervisor.position,
        nip_atasan: data.supervisor.nip,
        unit_kerja: data.applicant.unit,
        unit_kerja_atasan: data.supervisor.unit,
        alasan_pengguna: data.applications[0].reason,
        risiko: data.applications[0].risk,
        tanggal_dokumen_dibuat: new Date().toISOString(),
        tanggal_dokumen_disetujui: null,
      }

      const { error } = await supabase.from('access_logs').insert(accessLogData)

      if (error) throw error
      alert('Data berhasil disimpan')
    } catch (err) {
      console.error('Error submitting data:', err)
      alert('Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  //internal styles
  const styles = {
    input: {
      fontSize: 12,
      padding: 5,
      height: 25,
    },
    label: {
      fontSize: 12,
      padding: 5,
      height: 25,
    },
    table: {
      fontSize: 12,
      padding: 5,
      height: 25,
    },
  }

  return (
    <WeekendLayout>
      {/* Header */}
      <div id="header-form-pengajuan" className="p-8 max-w-4xl mx-auto">
        <form id="header-form-pengajuan">
          <div className="overflow-x-hidden">
            <Table className="border border-gray-950 bg-white">
              <TableHeader>
                <TableRow>
                  <TableCell className="border px-4 py-2 w-1/3 text-center font-bold text-sm">
                    GROUP IT SUPPORT & HELPDESK
                  </TableCell>
                  <TableCell className="border px-4 py-2 w-1/3 text-center font-bold" rowSpan={3}>
                    PERMOHONAN PELAKSANAAN OPERASIONAL UNTUK LAYANAN TI
                  </TableCell>
                  <TableCell className="border px-4 py-2 w-1/3" rowSpan={4}>
                    <div className="flex justify-center items-center h-full">
                      <Image src="/logo.png" alt="Bank Jatim Logo" width={200} height={100} />
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border px-4 py-2 text-left text-xs">
                    Nomor Registrasi:
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border px-4 py-2 text-left text-xs">Tanggal: </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="border px-4 py-2 text-left text-xs">Halaman:</TableCell>
                  <TableCell className="border px-4 py-2 text-center font-bold bg-red-700 text-white">
                    DOKUMEN 4.3.2
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>{/* Additional table rows or content can go here */}</TableBody>
            </Table>
          </div>
        </form>
        {/* Form */}
        <form
          id="form-pengajuan"
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 bg-white"
        >
          {/* Identitas Atasan Pemohon */}
          <Table className="border p-4">
            <TableHeader>
              <TableRow>
                <TableCell className="border px-4 py-2 text-left font-bold text-sm" colSpan={2}>
                  1. Identitas Atasan Pemohon
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="border px-4 py-2 text-left font-bold text-xs bg-gray-200">
                  Nama
                </TableCell>
                <TableCell className="border px-4 py-2 text-left">
                  <Input
                    aria-placeholder="Isi Nama Atasan"
                    placeholder="Isi Nama Atasan"
                    type="text"
                    {...register('supervisor.name')}
                    className="border-0 w-full input-sm"
                    style={styles.input}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border px-4 py-2 text-left font-bold text-xs bg-gray-200">
                  NIP/NIK
                </TableCell>
                <TableCell className="border px-4 py-2 text-left">
                  <Input
                    aria-placeholder="NIP Atasan"
                    placeholder="NIP Atasan"
                    type="text"
                    {...register('supervisor.nip')}
                    className="border-0"
                    style={styles.input}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border px-4 py-2 text-left font-bold text-xs bg-gray-200">
                  Jabatan
                </TableCell>
                <TableCell className="border px-4 py-2 text-left">
                  <Input
                    aria-placeholder="Jabatan"
                    placeholder="Jabatan"
                    type="text"
                    {...register('supervisor.position')}
                    className="border-0"
                    style={styles.input}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Informasi Pemohon */}
          <Table className="border p-4">
            <TableHeader>
              <TableRow>
                <TableCell className="border px-4 py-2 text-left font-bold" colSpan={2}>
                  2. Informasi Pemohon
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="print:hidden">
                <TableCell className="border px-4 py-2 text-left font-bold text-xs bg-gray-200">
                  User ESTIM
                </TableCell>
                <TableCell className="border px-4 py-2 text-left">
                  <Select
                    onValueChange={handleUserChange}
                    value={watch('applicant.user_estim') || undefined}
                  >
                    <SelectTrigger className="border-0" style={styles.input}>
                      <SelectValue placeholder="Pilih User ESTIM" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter(user => user.user_estim && user.user_estim.trim() !== '')
                        .map(user => (
                          <SelectItem key={user.user_estim} value={user.user_estim}>
                            {user.user_estim} - {user.nama}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border px-4 py-2 text-left font-bold text-xs bg-gray-200">
                  Nama
                </TableCell>
                <TableCell className="border px-4 py-2 text-left">
                  <Input
                    {...register('applicant.name')}
                    className="border-0"
                    style={styles.input}
                    readOnly
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border px-4 py-2 text-left font-bold text-xs bg-gray-200">
                  NIP/NIK
                </TableCell>
                <TableCell className="border px-4 py-2 text-left">
                  <Input
                    {...register('applicant.nip')}
                    className="border-0"
                    style={styles.input}
                    readOnly
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border px-4 py-2 text-left font-bold text-xs bg-gray-200">
                  Unit Kerja
                </TableCell>
                <TableCell className="border px-4 py-2 text-left">
                  <Input
                    {...register('applicant.unit')}
                    className="border-0"
                    style={styles.input}
                    readOnly
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="border px-4 py-2 text-left font-bold text-xs bg-gray-200">
                  IP Address
                </TableCell>
                <TableCell className="border px-4 py-2 text-left">
                  <Input
                    {...register('applicant.ip')}
                    className="border-0"
                    style={styles.input}
                    readOnly
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Tipe Permohonan */}
          <div className="border p-4">
            <h2 className="font-bold mb-2 text-sm">Tipe Permohonan</h2>
            <div className="flex-row grid gap-4">
              <Label className="text-sm font-normal" htmlFor="type">
                <Checkbox id="Normal" {...register('requestType')} className="border-black" />
                Normal
              </Label>
              <Label className="text-sm font-normal" htmlFor="type">
                <Checkbox id="Insidentil" {...register('requestType')} className="border-black" />
                Insidentil
              </Label>
              <Label className="text-sm font-normal" htmlFor="type">
                <Checkbox
                  id="Weekend Banking"
                  {...register('requestType')}
                  className="border-black"
                />
                Weekend Banking
              </Label>
            </div>
          </div>
          {/* Detail Pengajuan */}
          <div className="border p-4">
            <p className="font-bold mb-2 text-sm">Detail Pengajuan</p>
            {/* selalu terpotong di bagian sini */}
            <Table className="w-full border text-center items-center font-normal">
              <TableHeader>
                <TableRow className="w-full">
                  <TableCell
                    className="border px-2 py-2 font-bold text-sm bg-gray-200"
                    align="center"
                  >
                    No
                  </TableCell>
                  <TableCell
                    className="border px-2 py-2 font-bold text-sm w-36 bg-gray-200"
                    align="center"
                  >
                    Nama Aplikasi
                  </TableCell>
                  <TableCell
                    className="border px-2 py-2 font-bold text-sm w-36 bg-gray-200"
                    align="center"
                  >
                    User Pengguna
                  </TableCell>
                  <TableCell
                    className="border px-2 py-2 font-bold text-sm w-20 bg-gray-200"
                    align="center"
                  >
                    Tanggal Mulai Akses
                  </TableCell>
                  <TableCell
                    className="border px-2 py-2 font-bold text-sm w-20 bg-gray-200"
                    align="center"
                  >
                    Tanggal Akhir Akses
                  </TableCell>
                  <TableCell
                    className="border px-2 py-2 font-bold text-sm w-24 bg-gray-200"
                    align="center"
                  >
                    Alasan
                  </TableCell>
                  <TableCell
                    className="border px-2 py-2 font-bold text-sm w-24 bg-gray-200"
                    align="center"
                  >
                    Risiko
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell className="border px-2">{index + 1}</TableCell>
                    <TableCell className="border px-2">
                      <Textarea
                        placeholder="Nama Aplikasi"
                        {...register(`applications.${index}.appName`)}
                        className="border-0 w-full"
                        style={styles.input}
                      />
                    </TableCell>
                    <TableCell className="border px-2">
                      <Textarea
                        placeholder="User "
                        {...register(`applications.${index}.user`)}
                        className="border-0 w-full"
                        style={styles.input}
                      />
                    </TableCell>
                    <TableCell className="border px-2">
                      {/* <Input
              type="datetime-local"
              {...register(`applications.${index}.startDate`)}
              className="border-0 w-25"
              style={styles.table}
            /> */}
                      <DatePicker />
                    </TableCell>
                    <TableCell className="border px-2">
                      {/* <Input
              type="datetime-local"
              {...register(`applications.${index}.endDate`)}
              className="border-0 w-25"
              style={styles.table}
            /> */}
                      <DatePicker />
                    </TableCell>
                    <TableCell className="border px-2">
                      <Textarea
                        placeholder="Alasan"
                        {...register(`applications.${index}.reason`)}
                        className="border-0 w-full"
                        style={styles.input}
                      />
                    </TableCell>
                    <TableCell className="border px-2">
                      <Textarea
                        placeholder="Risiko"
                        {...register(`applications.${index}.risk`)}
                        className="border-0 w-full"
                        style={styles.input}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* bagian diperiksa */}
          <div className="border p-4">
            <div className="overflow-x-hidden">
              <Table className="border border-gray-300 w-full">
                <TableHeader>
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="border px-1 py-1 text-center bg-red-700 font-bold text-white text-sm"
                    >
                      Diperiksa Oleh
                    </TableCell>
                    <TableCell className="border px-1 py-1 text-center bg-red-700 font-bold text-white text-sm">
                      Disetujui Oleh
                    </TableCell>
                    <TableCell className="border px-1 py-1 text-center bg-red-700 font-bold text-white text-sm">
                      Dibuat Oleh
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="border px-1 py-1 text-left text-xs">Tanggal</TableCell>
                    <TableCell className="border px-1 py-1 text-left text-xs">Tanggal</TableCell>
                    <TableCell className="border px-1 py-1 text-left text-xs">Tanggal: </TableCell>
                    <TableCell className="border px-1 py-1 text-left text-xs">
                      Tanggal: {new Date().toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border px-4 py-2 text-center font-bold text-xs w-34">
                      Senior Officer IT Support & Helpdesk
                    </TableCell>
                    <TableCell className="border px-2 py-1 text-center font-bold text-xs w-44">
                      AVP Security TI
                    </TableCell>
                    <TableCell className="border px-2 py-1 text-center font-bold text-xs w-34">
                      <Input
                        aria-placeholder="Jabatan Atasan"
                        placeholder="Jabatan Atasan"
                        type="text"
                        {...register('approvedBy.position')}
                        className="flex justify-center border-0 mt-2 text-center text-xs"
                      />
                    </TableCell>
                    <TableCell className="border px-2 py-1 text-center font-bold text-xs">
                      <Input
                        aria-placeholder="Jabatan Pemohon"
                        placeholder="Jabatan Pemohon"
                        type="text"
                        {...register('createdBy.position')}
                        className="flex justify-center border-0 mt-2 text-center text-xs"
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border px-2 py-9 text-center"></TableCell>
                    <TableCell className="border px-2 py-9 text-center"></TableCell>
                    <TableCell className="border px-2 py-9 text-center"></TableCell>
                    <TableCell className="border px-2 py-9 text-center"></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border px-2 py-2 text-center"></TableCell>
                    <TableCell className="border px-2 py-2 text-center"></TableCell>
                    <TableCell className="border px-1 py-1 text-center text-xs">
                      <Input
                        aria-placeholder="Nama Atasan"
                        placeholder="Nama Atasan"
                        type="text"
                        {...register('approvedBy.name')}
                        className="flex h-[10px] rounded-sm justify-center border-0 text-center text-xs"
                      />
                    </TableCell>
                    <TableCell className="border px-1 py-1 text-center text-xs">
                      <Input
                        aria-placeholder="Nama Pemohon"
                        placeholder="Nama Pemohon"
                        type="text"
                        {...register('createdBy.name')}
                        className="flex h-[10px] rounded-sm justify-center border-0 text-center text-xs"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              {/* bagian mengetahui */}
              <div className="border p-4">
                <Table className="border border-gray-300 w-full">
                  <TableHeader>
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="border px-1 py-1 text-center bg-red-700 font-bold text-white text-sm"
                      >
                        Mengetahui
                      </TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="border px-1 py-1 text-left text-xs">
                        Tanggal:{' '}
                      </TableCell>
                      <TableCell className="border px-1 py-1 text-left text-xs">
                        Tanggal:{' '}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border px-4 py-2 text-center font-bold text-xs">
                        Pjs. VP Teknologi Informasi
                      </TableCell>
                      <TableCell className="border px-4 py-2 text-center font-bold text-xs">
                        AVP Infrastruktur TI & Operasi
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border px-2 py-12 text-center"></TableCell>
                      <TableCell className="border px-2 py-12 text-center"></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border px-2 py-4 text-center"></TableCell>
                      <TableCell className="border px-2 py-4 text-center"></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <div className="flex-row gap-4 mt-2 p-2 space-x-2 justify-between">
            <Button
              className="hover:bg-yellow-400 hover:text-dark print:hidden"
              variant="outline"
              type="button"
              onClick={() =>
                append({
                  appName: '',
                  user: '',
                  startDate: '',
                  endDate: '',
                  reason: '',
                  risk: '',
                })
              }
            >
              Tambah Aplikasi
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => remove()}
              className="hover:bg-red-600 hover:text-white print:hidden"
            >
              Hapus
            </Button>
            <Button className="print:hidden" variant="outline" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Submit'}
            </Button>
            <Button className="print:hidden" variant="outline" type="button" onClick={handlePrint}>
              Print
            </Button>
          </div>
        </form>
      </div>
    </WeekendLayout>
  )
}
