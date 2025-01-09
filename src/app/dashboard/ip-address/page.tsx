// FILEPATH: e:/work-report/dev/reportapp/src/app/dashboard/ip-address/page.tsx
"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import ReportLayout from '@/app/dashboard/reports/layout'

const supabase = createClient('https://qqtcdaamobxjtahrorwl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxdGNkYWFtb2J4anRhaHJvcndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg5Mjg4MzEsImV4cCI6MjA0NDUwNDgzMX0.QabGqfgW1xflzw1QnuRMvh5jVv8pM5i3VJZeSiPOumE')

type User = {
  id: number
  user_estim: string
  ip_address: string
  nama: string
  nip: string
  jabatan: string
  unit_kerja: string
  cab: string
  status_user: string
}

export default function IPAddressManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    user_estim: '',
    ip_address: '',
    nama: '',
    nip: '',
    jabatan: '',
    unit_kerja: '',
    cab: '',
    status_user: ''
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
    
    if (error) console.error('Error fetching users:', error)
    else setUsers(data || [])
  }

  async function handleCreate() {
    const { data, error } = await supabase
      .from('users')
      .insert([newUser])
    
    if (error) console.error('Error creating user:', error)
    else {
      fetchUsers()
      setNewUser({
        user_estim: '',
        ip_address: '',
        nama: '',
        nip: '',
        jabatan: '',
        unit_kerja: '',
        cab: '',
        status_user: ''
      })
      setIsDialogOpen(false)
    }
  }

  async function handleUpdate() {
    if (!editingUser) return

    const { error } = await supabase
      .from('users')
      .update(editingUser)
      .eq('id', editingUser.id)

    if (error) console.error('Error updating user:', error)
    else {
      fetchUsers()
      setEditingUser(null)
      setIsDialogOpen(false)
    }
  }

  async function handleDelete(id: number) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)

    if (error) console.error('Error deleting user:', error)
    else fetchUsers()
  }

  return (
    <ReportLayout>
      <h1 className="text-2xl font-bold mb-4">User and IP Address Management</h1>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Add New User</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {['user_estim', 'ip_address', 'nama', 'nip', 'jabatan', 'unit_kerja', 'cab', 'status_user'].map((field) => (
              <Input
                key={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                value={editingUser ? editingUser[field as keyof User] : newUser[field as keyof Omit<User, 'id'>]}
                onChange={(e) => {
                  if (editingUser) {
                    setEditingUser({...editingUser, [field]: e.target.value})
                  } else {
                    setNewUser({...newUser, [field]: e.target.value})
                  }
                }}
              />
            ))}
          </div>
          <Button onClick={editingUser ? handleUpdate : handleCreate}>
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogContent>
      </Dialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Estim</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>NIP</TableHead>
            <TableHead>Jabatan</TableHead>
            <TableHead>Unit Kerja</TableHead>
            <TableHead>Cab</TableHead>
            <TableHead>Status User</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.user_estim}</TableCell>
              <TableCell>{user.ip_address}</TableCell>
              <TableCell>{user.nama}</TableCell>
              <TableCell>{user.nip}</TableCell>
              <TableCell>{user.jabatan}</TableCell>
              <TableCell>{user.unit_kerja}</TableCell>
              <TableCell>{user.cab}</TableCell>
              <TableCell>{user.status_user}</TableCell>
              <TableCell>
                <Button
                  className="mr-2"
                  onClick={() => {
                    setEditingUser(user)
                    setIsDialogOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ReportLayout>
  )
}
