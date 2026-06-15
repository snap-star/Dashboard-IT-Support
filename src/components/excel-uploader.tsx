'use client'

import { Upload } from 'lucide-react'
import React, { useState } from 'react'
import * as XLSX from 'xlsx'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import supabase from '@/lib/supabase'

const ExcelUploader = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const processExcel = (file: any) => {
    const reader = new FileReader()
    reader.onload = async (e: any) => {
      try {
        setLoading(true)
        setError(null)

        const workbook = XLSX.read(e.target.result, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData: any = XLSX.utils.sheet_to_json(worksheet)

        setData(jsonData)

        // Upload data ke Supabase
        const { error: uploadError } = await supabase
          .from('excel_data') // Ganti dengan nama tabel Anda
          .insert(jsonData)

        if (uploadError) throw uploadError

        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    reader.readAsBinaryString(file)
  }

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0]
    if (file) {
      processExcel(file)
    }
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Excel File Uploader</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="w-full"
              disabled={loading}
            />
            <Button disabled={loading}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>

          {loading && (
            <Alert>
              <AlertDescription>Sedang memproses file...</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default">
              <AlertDescription>Data berhasil diupload ke database!</AlertDescription>
            </Alert>
          )}

          {data.length > 0 && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(data[0]).map(header => (
                      <TableHead key={header}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((cell: any, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ExcelUploader
