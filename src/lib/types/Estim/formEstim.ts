import { z } from 'zod'

// Base AS400User schema
export const As400UserSchema = z.object({
  id: z.number().optional(),
  employee_id: z.number().optional(),
  username: z.string().min(1, 'Username ESTIM wajib diisi'),
  display_user: z.string().min(1, 'Display user wajib diisi'),
  ip_address: z.string().min(1, 'IP Address wajib diisi'),
  mac_address: z.string().min(1, 'MAC Address wajib diisi'),
  last_login: z.string().optional(),
})

// Pegawai (Employee) schema with AS400 users
export const PegawaiSchema = z.object({
  id: z.number().optional(),
  nip: z.string().min(1, 'NIP wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  jabatan: z.string().min(1, 'Jabatan wajib diisi'),
  department: z.string().min(1, 'Unit/Department wajib diisi'),
  as400_users: z.array(As400UserSchema).default([]),
})

// Form schema for creating/updating pegawai
export const PegawaiFormSchema = z.object({
  nip: z.string().min(1, 'NIP wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  jabatan: z.string().min(1, 'Jabatan wajib diisi'),
  department: z.string().min(1, 'Unit/Department wajib diisi'),
})

// Form schema for creating/updating AS400 user
export const As400UserFormSchema = z.object({
  username: z.string().min(1, 'Username ESTIM wajib diisi'),
  display_user: z.string().min(1, 'Display user wajib diisi'),
  ip_address: z.string().min(1, 'IP Address wajib diisi'),
  mac_address: z.string().min(1, 'MAC Address wajib diisi'),
})

// Excel upload schema for bulk import
export const ExcelPegawaiSchema = z.object({
  nip: z.string(),
  name: z.string(),
  jabatan: z.string(),
  department: z.string(),
  username: z.string().optional(),
  display_user: z.string().optional(),
  ip_address: z.string().optional(),
  mac_address: z.string().optional(),
})

// Export types inferred from schemas
export type As400User = z.infer<typeof As400UserSchema>
export type Pegawai = z.infer<typeof PegawaiSchema>
export type PegawaiFormValues = z.infer<typeof PegawaiFormSchema>
export type As400UserFormValues = z.infer<typeof As400UserFormSchema>
export type ExcelPegawai = z.infer<typeof ExcelPegawaiSchema>
