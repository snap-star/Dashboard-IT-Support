import { z } from 'zod'

// Zod schema for employee validation
export const EmployeeSchema = z.object({
  id: z.number().optional(),
  nip: z.string().min(1, 'NIP is required'),
  name: z.string().min(1, 'Name is required'),
  jabatan: z.string().min(1, 'Jabatan is required'),
  department: z.string().min(1, 'Department is required'),
  created_at: z.string().nullable().optional(),
})

export type Employee = z.infer<typeof EmployeeSchema>

// Form schema for creating/editing employees
export const EmployeeFormSchema = z.object({
  nip: z.string().min(1, 'NIP wajib diisi'),
  nama: z.string().min(1, 'Nama wajib diisi'),
  jabatan: z.string().min(1, 'Jabatan wajib diisi'),
  department: z.string().min(1, 'Unit wajib diisi'),
})

export type EmployeeFormValues = z.infer<typeof EmployeeFormSchema>
