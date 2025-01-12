"use client"
import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import supabase from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import ReportLayout from './layout'
import { Badge } from '@/components/ui/badge'

type WorkReport = {
  id: number
  title: string
  date: string
  status: string
}

export default function WorkReports() {
  const [reports, setReports] = useState<WorkReport[]>([])

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    const { data, error } = await supabase
      .from('work_reports')
      .select('*')
    
    if (error) console.error('Error fetching reports:', error)
    else setReports(data || [])
}

//handle edit
async function handleEdit(report: WorkReport) {
  // For simplicity, we'll just update the status to "Updated"
  const { error } = await supabase
    .from('work_reports')
    .update({ status: 'Updated' })
    .eq('id', report.id)

  if (error) {
    console.error('Error updating report:', error)
  } else {
    fetchReports() // Refresh the table
  }
}

//handler delete
async function handleDelete(report: WorkReport) {
  const { error } = await supabase
    .from('work_reports')
    .delete()
    .eq('id', report.id)

  if (error) {
    console.error('Error deleting report:', error)
  } else {
    fetchReports() // Refresh the table
  }
}

  return (
    <ReportLayout>
    <h1 className="text-2xl font-bold mb-4">Work Reports</h1>
    <div className='font-[family-name:var(--font-geist-mono)]'>
    <Table>
    <TableHeader>
    <TableRow>
    <TableHead>ID</TableHead>
    <TableHead>Title</TableHead>
    <TableHead>Date</TableHead>
    <TableHead>Status</TableHead>
    <TableHead>Aksi</TableHead>
    </TableRow>
    </TableHeader>
    <TableBody>
    {reports.map((report) => (
      <TableRow key={report.id}>
              <TableCell>{report.id}</TableCell>
              <TableCell>{report.title}</TableCell>
              <TableCell>{report.date}</TableCell>
              <TableCell><Badge>{report.status}</Badge></TableCell>
              <TableCell>
              <Button variant={'outline'} size={'default'} onClick={() => handleEdit(report)}>
                Edit
              </Button>
              <Button className='hover:bg-red-100' variant={'outline'} size={'default'} onClick={() => handleDelete(report)}>
                Delete
              </Button>
            </TableCell>
            </TableRow>
          ))}
          </TableBody>
          </Table>
          </div>
          </ReportLayout>
        )
      }