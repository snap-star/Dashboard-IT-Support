import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import supabase from '@/lib/supabase'
import type { Employee } from '@/lib/types/Employee/formEmployee'

interface EmployeeState {
  employees: Employee[]
  loading: boolean
  error: string | null
  fetchEmployees: () => Promise<void>
  createEmployee: (employee: Omit<Employee, 'id' | 'created_at'>) => Promise<void>
  updateEmployee: (id: number, updates: Partial<Employee>) => Promise<void>
  deleteEmployee: (id: number) => Promise<void>
  getEmployeeById: (id: number) => Employee | undefined
}

export const useEmployees = create<EmployeeState>()(
  devtools(
    (set, get) => ({
      employees: [],
      loading: false,
      error: null,

      fetchEmployees: async () => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('id, nip, name, jabatan, department, created_at')
            .order('nip', { ascending: true })

          if (error) throw error
          set({ employees: data || [], loading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Gagal memuat data pegawai'
          set({ error: errorMessage, loading: false })
          console.error(errorMessage, error)
        }
      },

      createEmployee: async employee => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase.from('employees').insert([employee])
          if (error) throw error
          await get().fetchEmployees()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan pegawai'
          set({ error: errorMessage, loading: false })
          console.error(errorMessage, error)
        }
      },

      updateEmployee: async (id, updates) => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase.from('employees').update(updates).eq('id', id)
          if (error) throw error
          await get().fetchEmployees()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Gagal mengupdate pegawai'
          set({ error: errorMessage, loading: false })
          console.error(errorMessage, error)
        }
      },

      deleteEmployee: async id => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase.from('employees').delete().eq('id', id)
          if (error) throw error
          await get().fetchEmployees()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus pegawai'
          set({ error: errorMessage, loading: false })
          console.error(errorMessage, error)
        }
      },

      getEmployeeById: id => {
        return get().employees.find(emp => emp.id === id)
      },
    }),
    {
      name: 'employees-store',
    },
  ),
)
