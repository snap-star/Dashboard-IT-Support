// FILEPATH: e:/work-report/dev/reportapp/src/app/dashboard/it-incidents/page.tsx
"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import ReportLayout from '@/app/dashboard/reports/layout'

const supabase = createClient('https://qqtcdaamobxjtahrorwl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGNkYWFtb2J4anRhaHJvcndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5Mjg4MzEsImV4cCI6MjA0NDUwNDgzMX0.QabGqfgW1xflzw1QnuRMvh5jVv8pM5i3VJZeSiPOumE')

type Incident = {
  id: number
  title: string
  description: string
  reported_by: string
  date_reported: string
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  resolution?: string
}

export default function ITIncidentManagement() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [newIncident, setNewIncident] = useState<Omit<Incident, 'id'>>({
    title: '',
    description: '',
    reported_by: '',
    date_reported: new Date().toISOString().split('T')[0],
    status: 'Open',
    priority: 'Medium',
    resolution: ''
  })
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchIncidents()
  }, [])

  async function fetchIncidents() {
    const { data, error } = await supabase
      .from('it_incidents')
      .select('*')
      .order('date_reported', { ascending: false })
    
    if (error) console.error('Error fetching incidents:', error)
    else setIncidents(data || [])
  }

  async function handleCreate() {
    const { data, error } = await supabase
      .from('it_incidents')
      .insert([newIncident])
    
    if (error) console.error('Error creating incident:', error)
    else {
      fetchIncidents()
      setNewIncident({
        title: '',
        description: '',
        reported_by: '',
        date_reported: new Date().toISOString().split('T')[0],
        status: 'Open',
        priority: 'Medium',
        resolution: ''
      })
      setIsDialogOpen(false)
    }
  }

  async function handleUpdate() {
    if (!editingIncident) return

    const { error } = await supabase
      .from('it_incidents')
      .update(editingIncident)
      .eq('id', editingIncident.id)

    if (error) console.error('Error updating incident:', error)
    else {
      fetchIncidents()
      setEditingIncident(null)
      setIsDialogOpen(false)
    }
  }

  async function handleDelete(id: number) {
    const { error } = await supabase
      .from('it_incidents')
      .delete()
      .eq('id', id)

    if (error) console.error('Error deleting incident:', error)
    else fetchIncidents()
  }

  return (
    <ReportLayout>
      <h1 className="text-2xl font-bold mb-4">IT Incident Management</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Add New Incident</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingIncident ? 'Edit Incident' : 'Add New Incident'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Judul"
              value={editingIncident ? editingIncident.title : newIncident.title}
              onChange={(e) => editingIncident 
                ? setEditingIncident({...editingIncident, title: e.target.value})
                : setNewIncident({...newIncident, title: e.target.value})}
            />
            <Textarea
              placeholder="Deskripsi"
              value={editingIncident ? editingIncident.description : newIncident.description}
              onChange={(e) => editingIncident
                ? setEditingIncident({...editingIncident, description: e.target.value})
                : setNewIncident({...newIncident, description: e.target.value})}
            />
            <Input
              placeholder="Pelapor"
              value={editingIncident ? editingIncident.reported_by : newIncident.reported_by}
              onChange={(e) => editingIncident
                ? setEditingIncident({...editingIncident, reported_by: e.target.value})
                : setNewIncident({...newIncident, reported_by: e.target.value})}
            />
            <Input
              type="date"
              value={editingIncident ? editingIncident.date_reported : newIncident.date_reported}
              onChange={(e) => editingIncident
                ? setEditingIncident({...editingIncident, date_reported: e.target.value})
                : setNewIncident({...newIncident, date_reported: e.target.value})}
            />
            <Select
              value={editingIncident ? editingIncident.status : newIncident.status}
              onValueChange={(value: 'Open' | 'In Progress' | 'Resolved' | 'Closed') => editingIncident
                ? setEditingIncident({...editingIncident, status: value})
                : setNewIncident({...newIncident, status: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={editingIncident ? editingIncident.priority : newIncident.priority}
              onValueChange={(value: 'Low' | 'Medium' | 'High' | 'Critical') => editingIncident
                ?                 setEditingIncident({ ...editingIncident, priority: value })
                : setNewIncident({ ...newIncident, priority: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            {editingIncident && (
              <Textarea
                placeholder="Resolution (if applicable)"
                value={editingIncident.resolution || ''}
                onChange={(e) =>
                  setEditingIncident({ ...editingIncident, resolution: e.target.value })
                }
              />
            )}
          </div>
          <div className="flex justify-end gap-4">
            <Button
              onClick={() => {
                if (editingIncident) handleUpdate();
                else handleCreate();
              }}
            >
              {editingIncident ? 'Update Incident' : 'Create Incident'}
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
<Card className='w-full'>
  <CardHeader className='font-bold text-lg'>
    Handling Problem Incident
  </CardHeader>
<CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>Problem/Error</TableCell>
            <TableCell>Deskripsi</TableCell>
            <TableCell>Pelapor</TableCell>
            <TableCell>Tanggal Kejadian</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Aksi</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => (
            <TableRow key={incident.id}>
              <TableCell>{incident.title}</TableCell>
              <TableCell>{incident.description}</TableCell>
              <TableCell>{incident.reported_by}</TableCell>
              <TableCell>{incident.date_reported}</TableCell>
              <TableCell>{incident.status}</TableCell>
              <TableCell>{incident.priority}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingIncident(incident);
                      setIsDialogOpen(true);
                    }}
                    >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(incident.id)}
                    >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
          </CardContent>
      <CardFooter className='text-xs italic font-bold'>
        Terakhir di update
      </CardFooter>
          </Card>
    </ReportLayout>
  );
}