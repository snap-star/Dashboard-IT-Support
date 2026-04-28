'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import FileSaver from 'file-saver'
import { Download, FileSpreadsheet, Trash, Upload } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import * as z from 'zod'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// Schema untuk form konfigurasi
const configSchema = z.object({
  macroType: z.string().min(1, 'Tipe macro harus dipilih'),
  startRow: z.string().regex(/^\d+$/, 'Harus berupa angka'),
  waitTime: z.string().regex(/^\d+$/, 'Harus berupa angka'),
  customScript: z.string().optional(),
})

// Tipe macro yang tersedia
const macroTypes = [
  {
    value: 'kycp',
    label: 'KYCP Tanggal',
    template: (data: any, waitTime: number) =>
      `[PCOMM SCRIPT HEADER]
LANGUAGE=VBSCRIPT
DESCRIPTION=Macro untuk KYCP Tanggal Update
[PCOMM SCRIPT SOURCE]
Sub Main
    autECLSession.SetConnectionByName(ThisSessionName)
' Loop through data
    ${data
      .map(
        (row: any, index: number) => `
    ' Record ${index + 1}
    autECLSession.autECLOIA.WaitForInputReady
autECLSession.autECLPS.SendKeys "${row.NONAS}"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "${row.TGL_UPDATE}"
autECLSession.autECLPS.SendKeys "[FIELD+]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "0"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "0"
autECLSession.autECLPS.SendKeys "[PF10]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "9900"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "[tab]"
autECLSession.autECLPS.SendKeys "T"
autECLSession.autECLPS.SendKeys "[tab]
autECLSession.autECLPS.SendKeys "T"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
autECLSession.autECLPS.SendKeys "[ENTER]"
    WScript.Sleep ${waitTime}
    `,
      )
      .join('\n')}
End Sub`,
  },
  {
    value: 'MACRO OTOR',
    label: 'MACRO OTOR',
    template: (data: any, waitTime: number) =>
      `[PCOMM SCRIPT HEADER]
LANGUAGE=VBSCRIPT
DESCRIPTION=Macro untuk OTOR
[PCOMM SCRIPT SOURCE]
Sub Main
' Loop through data
    ${data
      .map(
        (row: any, index: number) => `
' Record ${index + 1}
    autECLSession.SetConnectionByName(ThisSessionName)
    autECLSession.autECLPS.SendKeys "${row.id}"
    autECLSession.autECLPS.SendKeys "[ENTER]"
    autECLSession.autECLPS.SendKeys "Y"
    autECLSession.autECLPS.SendKeys "[ENTER]"
    WScript.Sleep ${waitTime}
    `,
      )
      .join('\n')}
End Sub`,
  },
  {
    value: 'new-account',
    label: 'Pembuatan Rekening Baru',
    template: (data: any, waitTime: number) =>
      `[PCOMM SCRIPT HEADER]
LANGUAGE=VBSCRIPT
DESCRIPTION=Macro untuk pembuatan rekening baru
[PCOMM SCRIPT SOURCE]
Sub Main
    autECLSession.SetConnectionByName(ThisSessionName)
    
    ' Loop through data
    ${data
      .map(
        (row: any, index: number) => `
    ' Record ${index + 1}
    autECLSession.autECLOIA.WaitForInputReady
    autECLSession.autECLPS.SendKeys "${row.accountType}"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "${row.customerName}"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "${row.idNumber}"
    autECLSession.autECLPS.SendKeys "[enter]"
    autECLSession.autECLOIA.WaitForInputReady
    WScript.Sleep ${waitTime}
    `,
      )
      .join('\n')}
End Sub`,
  },
  {
    value: 'maintenance',
    label: 'Maintenance Data Nasabah',
    template: (data: any, waitTime: number) =>
      `[PCOMM SCRIPT HEADER]
LANGUAGE=VBSCRIPT
DESCRIPTION=Macro untuk maintenance data nasabah
[PCOMM SCRIPT SOURCE]
Sub Main
    autECLSession.SetConnectionByName(ThisSessionName)
    
    ' Loop through data
    ${data
      .map(
        (row: any, index: number) => `
    ' Record ${index + 1}
    autECLSession.autECLOIA.WaitForInputReady
    autECLSession.autECLPS.SendKeys "${row.accountNumber}"
    autECLSession.autECLPS.SendKeys "[enter]"
    autECLSession.autECLOIA.WaitForInputReady
    autECLSession.autECLPS.SendKeys "${row.newData}"
    autECLSession.autECLPS.SendKeys "[enter]"
    WScript.Sleep ${waitTime}
    `,
      )
      .join('\n')}
End Sub`,
  },
  {
    value: 'Rubah Saldo Minimum',
    label: 'Rubah Saldo Minimum',
    template: (data: any, waitTime: number) =>
      `[PCOMM SCRIPT HEADER]
LANGUAGE=VBSCRIPT
DESCRIPTION=Macro Rubah saldo minimum
[PCOMM SCRIPT SOURCE]
Sub Main
    autECLSession.SetConnectionByName(ThisSessionName)
    
    ' Loop through data
    ${data
      .map(
        (row: any, index: number) => `
    ' Record ${index + 1}
    autECLSession.autECLOIA.WaitForInputReady
    autECLSession.autECLPS.SendKeys "${row.NONAS}"
    autECLSession.autECLPS.SendKeys "[enter]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "1"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[eraseeof]"
    autECLSession.autECLOIA.WaitForInputReady
    autECLSession.autECLPS.SendKeys "0"
    autECLSession.autECLPS.SendKeys "[enter]"
    autECLSession.autECLPS.SendKeys "[reset]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[tab]"
    autECLSession.autECLPS.SendKeys "[enter]"
    autECLSession.autECLPS.SendKeys "[enter]"
    autECLSession.autECLPS.SendKeys "[enter]"
    autECLSession.autECLPS.SendKeys "[enter]"
    WScript.Sleep ${waitTime}
    `,
      )
      .join('\n')}
End Sub`,
  },
  {
    value: 'custom',
    label: 'Custom Macro',
  },
]

// Tambahkan fungsi untuk generate preview macro
const generatePreviewMacro = (values: z.infer<typeof configSchema>, data: any[]) => {
  if (data.length === 0) return ''

  const waitTime = Number.parseInt(values.waitTime)
  const previewData = data.slice(0, 3) // Preview 3 data pertama
  const selectedType = macroTypes.find(type => type.value === values.macroType)

  if (values.macroType === 'custom' && values.customScript) {
    return `[PCOMM SCRIPT HEADER]
LANGUAGE=VBSCRIPT
DESCRIPTION=Custom Macro
[PCOMM SCRIPT SOURCE]
Sub Main
    autECLSession.SetConnectionByName(ThisSessionName)
    ${previewData
      .map((row, index) => {
        let script = values.customScript
        Object.keys(row).forEach(key => {
          script = script?.replace(new RegExp(`\\[${key}\\]`, 'g'), row[key])
        })
        return `
    ' Record ${index + 1}
    autECLSession.autECLOIA.WaitForInputReady
    autECLSession.autECLPS.SendKeys "${script}"
    WScript.Sleep ${waitTime}`
      })
      .join('\n')}
    ' ... dan seterusnya untuk ${data.length - 3} data lainnya
End Sub`
  }
  if (selectedType?.template) {
    return selectedType
      .template(previewData, waitTime)
      .replace('End Sub', `    ' ... dan seterusnya untuk ${data.length - 3} data lainnya\nEnd Sub`)
  }

  return ''
}

export default function MacroGeneratorPage() {
  const [excelData, setExcelData] = useState<any[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [previewData, setPreviewData] = useState<any[]>([])
  const [previewMacro, setPreviewMacro] = useState<string>('')

  const form = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      macroType: '',
      startRow: '1',
      waitTime: '1000',
      customScript: '',
    },
  })

  const formValues = form.watch()

  useEffect(() => {
    if (excelData.length > 0 && formValues.macroType) {
      const preview = generatePreviewMacro(formValues, excelData)
      setPreviewMacro(preview)
    }
  }, [formValues, excelData])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          const jsonData = XLSX.utils.sheet_to_json(firstSheet)
          setExcelData(jsonData)
          setPreviewData(jsonData.slice(0, 5)) // Preview 5 baris pertama
          toast.success('File Excel berhasil dimuat')
        } catch (error) {
          toast.error('Gagal membaca file Excel')
          console.error(error)
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const generateMacro = (values: z.infer<typeof configSchema>) => {
    if (excelData.length === 0) {
      toast.error('Belum ada data yang dimuat')
      return
    }

    try {
      const startRow = Number.parseInt(values.startRow) - 1
      const waitTime = Number.parseInt(values.waitTime)
      const data = excelData.slice(startRow)

      let macroContent = ''
      const selectedType = macroTypes.find(type => type.value === values.macroType)

      if (values.macroType === 'custom' && values.customScript) {
        // Generate custom macro
        macroContent = `[PCOMM SCRIPT HEADER]
LANGUAGE=VBSCRIPT
DESCRIPTION=Custom Macro
[PCOMM SCRIPT SOURCE]
Sub Main
    autECLSession.SetConnectionByName(ThisSessionName)
    ${data
      .map((row, index) => {
        let script = values.customScript
        // Replace placeholders with actual data
        Object.keys(row).forEach(key => {
          script = script?.replace(new RegExp(`\\[${key}\\]`, 'g'), row[key])
        })
        return `
    ' Record ${index + 1}
    ${script}
    WScript.Sleep ${waitTime}`
      })
      .join('\n')}
End Sub`
      } else if (selectedType?.template) {
        // Generate macro using predefined template
        macroContent = selectedType.template(data, waitTime)
      }

      // Create and download .mac file
      const blob = new Blob([macroContent], {
        type: 'text/plain;charset=utf-8',
      })
      FileSaver.saveAs(blob, `${fileName.split('.')[0]}_macro.mac`)
      toast.success('Macro berhasil digenerate')
    } catch (error) {
      toast.error('Gagal generate macro')
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Macro Generator AS400</h2>
        <p className="text-muted-foreground">
          Generate macro untuk automation input data di IBM Client Access
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:border-red-600 dark:hover:border-white">
          <CardHeader>
            <CardTitle>Upload Data</CardTitle>
            <CardDescription>
              Upload file Excel (.xls/.xlsx) yang berisi data untuk di-generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="excel">File Excel</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="excel"
                  type="file"
                  accept=".xls,.xlsx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => document.getElementById('excel')?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setExcelData([])
                    setFileName('')
                    setPreviewData([])
                    setPreviewMacro('')
                    form.reset()
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Close File
                </Button>
              </div>
              {fileName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileSpreadsheet className="h-4 w-4" />
                  {fileName}{' '}
                  <Badge variant="default" className="rounded-sm">
                    Opened
                  </Badge>
                </div>
              )}
            </div>

            {previewData.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Preview Data</h4>
                <div className="max-h-[350px] overflow-auto rounded border p-2">
                  <pre className="text-xs">{JSON.stringify(previewData, null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:border-red-600 dark:hover:border-white">
          <CardHeader>
            <CardTitle>Konfigurasi Macro</CardTitle>
            <CardDescription>Atur konfigurasi untuk generate macro</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(generateMacro)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="macroType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Macro</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe macro" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {macroTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
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
                    name="startRow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Baris Mulai</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="1" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="waitTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waktu Tunggu (ms)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch('macroType') === 'custom' && (
                  <FormField
                    control={form.control}
                    name="customScript"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Script</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Masukkan script custom..."
                            className="font-mono"
                            rows={10}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full" disabled={excelData.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Macro
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {previewMacro && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Macro</CardTitle>
            <CardDescription>
              Preview 3 data pertama dari macro yang akan digenerate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute right-2 top-2 rounded-sm">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(previewMacro)
                    toast.success('Macro preview disalin ke clipboard')
                  }}
                >
                  Copy
                </Button>
              </div>
              <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted p-4 font-mono text-sm">
                {previewMacro}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-red-600 dark:border-green-500 hover:shadow-red-600/50 hover:dark:shadow-green-500/50">
        <CardHeader>
          <CardTitle>Panduan Penggunaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Format Excel</h4>
            <p className="text-sm text-muted-foreground">
              Pastikan file Excel memiliki kolom yang sesuai dengan tipe macro yang dipilih:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
              <li>
                Pembuatan Rekening: accountType, customerName, idNumber{' '}
                <Badge variant="default" className="rounded-sm">
                  Tahap Pengembangan
                </Badge>
              </li>
              <li>
                Maintenance Data: accountNumber, newData{' '}
                <Badge variant="default" className="rounded-sm">
                  Tahap Pengembangan
                </Badge>
              </li>
              <li>
                Rubah Saldo Minimum: NONAS{' '}
                <Badge variant="default" className="rounded-sm">
                  Work
                </Badge>
              </li>
              <li>
                KYCP Tanggal: NONAS, TGL_UPDATE{' '}
                <Badge variant="default" className="rounded-sm">
                  Work
                </Badge>
              </li>
              <li>
                OTOR: id{' '}
                <Badge variant="default" className="rounded-sm">
                  Work
                </Badge>
              </li>
              <li>
                Custom: Sesuaikan dengan kebutuhan, gunakan [nama_kolom] sebagai placeholder{' '}
                <Badge variant="default" className="rounded-sm">
                  Work
                </Badge>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Custom Script</h4>
            <p className="text-sm text-muted-foreground">
              Untuk custom macro, gunakan placeholder [nama_kolom] yang akan diganti dengan data
              dari Excel. Contoh: <code>autECLSession.autECLPS.SendKeys "[nama_kolom]"</code>
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Tips</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Sesuaikan waktu tunggu dengan kecepatan sistem</li>
              <li>Preview macro akan menampilkan 3 data pertama</li>
              <li>Pastikan format data Excel sesuai dengan kebutuhan macro</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Informasi</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>
                Macro yang masih dalam tahap pengembangan akan ditandai dengan badge{' '}
                <Badge variant="default" className="rounded-sm">
                  Tahap Pengembangan
                </Badge>
              </li>
              <li>
                Macro yang sudah selesai dan sudah di-test akan ditandai dengan badge{' '}
                <Badge variant="default" className="rounded-sm">
                  Work
                </Badge>
              </li>
              <li>
                Request template macro dapat dilakukan melalui{' '}
                <a
                  href="https://wa.me/6285236695155"
                  target="_blank"
                  className="text-blue-500 hover:underline"
                  rel="noopener noreferrer"
                >
                  Whatsapp
                </a>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
