'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import supabase from '@/lib/supabase'

// ✅ Fix: Define the proper User type instead of `string`
type User = {
  id: string
  user_estim: string
  ip_address: string
  nama: string
  jabatan: string
  unit_kerja: string
  cab: string
  status_user: string
}

type UserFormProps = {
  onSuccessAction: () => void
  user?: User // Optional untuk edit data // ✅ Was `string`, now `User`
}

export default function UserForm({ onSuccessAction, user }: UserFormProps) {
  const [formData, setFormData] = useState({
    user_estim: user?.user_estim || '',
    ip_address: user?.ip_address || '',
    nama: user?.nama || '',
    jabatan: user?.jabatan || '',
    unit_kerja: user?.unit_kerja || '',
    cab: user?.cab || 'Cabang Ponorogo',
    status_user: user?.status_user || 'Aktif',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (user) {
      // Update data
      const { error } = await supabase.from('users').update(formData).eq('id', user.id)
      if (error) {
        toast.error('Gagal memperbarui data!')
      } else {
        toast.success('Data berhasil diperbarui!')
        onSuccessAction()
      }
    } else {
      // Insert data
      const { error } = await supabase.from('users').insert([formData])
      if (error) {
        toast.error('Gagal menambah data!')
      } else {
        toast.success('Data berhasil ditambahkan!')
        onSuccessAction()
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">
          User ESTIM
          <input
            type="text"
            placeholder="User ESTIM"
            value={formData.user_estim}
            onChange={e => setFormData({ ...formData, user_estim: e.target.value })}
            className="input"
            required
          />
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium">
          Nama
          <input
            type="text"
            placeholder="Nama"
            value={formData.nama}
            onChange={e => setFormData({ ...formData, nama: e.target.value })}
            className="input"
          />
        </label>
      </div>
      {/* Tambahkan field lainnya */}
      <button type="submit" className="btn btn-primary">
        {user ? 'Update' : 'Create'} User
      </button>
    </form>
  )
}
