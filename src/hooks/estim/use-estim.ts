import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import supabase from '@/lib/supabase'
import type { As400UserFormValues, Pegawai, PegawaiFormValues } from '@/lib/types/Estim/formEstim'

interface EstimState {
  pegawai: Pegawai[]
  loading: boolean
  error: string | null

  // Actions
  fetchPegawai: (searchTerm?: string, departmentFilter?: string) => Promise<void>
  createPegawai: (data: Omit<PegawaiFormValues, 'id'>) => Promise<void>
  updatePegawai: (id: number, data: Partial<PegawaiFormValues>) => Promise<void>
  deletePegawai: (id: number) => Promise<void>

  // AS400 user actions
  createAs400User: (employeeId: number, data: As400UserFormValues) => Promise<void>
  updateAs400User: (userId: number, data: As400UserFormValues) => Promise<void>
  deleteAs400User: (userId: number) => Promise<void>

  // Bulk actions
  uploadBulkData: (data: any[]) => Promise<void>
  filterDuplicates: () => void
  resetFilters: () => Promise<void>
}

export const useEstim = create<EstimState>()(
  devtools(
    (set, get) => ({
      pegawai: [],
      loading: false,
      error: null,

      fetchPegawai: async (searchTerm = '', departmentFilter = '') => {
        set({ loading: true, error: null })
        try {
          let query = supabase.from('employees').select(`
            *,
            as400_users (
              id,
              username,
              display_user,
              ip_address,
              mac_address
            )
          `)

          if (searchTerm) {
            query = query.ilike('name', `%${searchTerm}%`)
          }

          if (departmentFilter && departmentFilter !== 'all') {
            query = query.eq('department', departmentFilter)
          }

          const { data, error } = await query
          if (error) throw error
          set({ pegawai: data || [], loading: false })
        } catch (error) {
          console.error('Error fetching data:', error)
          set({ error: 'Failed to fetch data', loading: false })
        }
      },

      createPegawai: async data => {
        set({ loading: true })
        try {
          const { data: newPegawai, error } = await supabase
            .from('employees')
            .insert([data])
            .select()
            .single()

          if (error) throw error
          set(state => ({
            pegawai: [...state.pegawai, newPegawai],
            loading: false,
          }))
        } catch (error) {
          console.error('Error creating pegawai:', error)
          set({ error: 'Failed to create pegawai', loading: false })
        }
      },

      updatePegawai: async (id, data) => {
        set({ loading: true })
        try {
          const { error } = await supabase.from('employees').update(data).eq('id', id)

          if (error) throw error

          // Update local state
          set(state => ({
            pegawai: state.pegawai.map(p => (p.id === id ? { ...p, ...data } : p)),
            loading: false,
          }))
        } catch (error) {
          console.error('Error updating pegawai:', error)
          set({ error: 'Failed to update pegawai', loading: false })
        }
      },

      deletePegawai: async id => {
        set({ loading: true })
        try {
          const { error } = await supabase.from('employees').delete().eq('id', id)

          if (error) throw error

          set(state => ({
            pegawai: state.pegawai.filter(p => p.id !== id),
            loading: false,
          }))
        } catch (error) {
          console.error('Error deleting pegawai:', error)
          set({ error: 'Failed to delete pegawai', loading: false })
        }
      },

      createAs400User: async (employeeId, data) => {
        set({ loading: true })
        try {
          const { data: newUser, error } = await supabase
            .from('as400_users')
            .insert([{ ...data, employee_id: employeeId }])
            .select()
            .single()

          if (error) throw error

          set(state => ({
            pegawai: state.pegawai.map(p => {
              if (p.id === employeeId) {
                return {
                  ...p,
                  as400_users: [...(p.as400_users || []), newUser],
                }
              }
              return p
            }),
            loading: false,
          }))
        } catch (error) {
          console.error('Error creating AS400 user:', error)
          set({ error: 'Failed to create AS400 user', loading: false })
        }
      },

      updateAs400User: async (userId, data) => {
        set({ loading: true })
        try {
          const { error } = await supabase.from('as400_users').update(data).eq('id', userId)

          if (error) throw error

          set(state => ({
            pegawai: state.pegawai.map(p => ({
              ...p,
              as400_users: p.as400_users.map(u => (u.id === userId ? { ...u, ...data } : u)),
            })),
            loading: false,
          }))
        } catch (error) {
          console.error('Error updating AS400 user:', error)
          set({ error: 'Failed to update AS400 user', loading: false })
        }
      },

      deleteAs400User: async userId => {
        set({ loading: true })
        try {
          const { error } = await supabase.from('as400_users').delete().eq('id', userId)

          if (error) throw error

          set(state => ({
            pegawai: state.pegawai.map(p => ({
              ...p,
              as400_users: p.as400_users.filter(u => u.id !== userId),
            })),
            loading: false,
          }))
        } catch (error) {
          console.error('Error deleting AS400 user:', error)
          set({ error: 'Failed to delete AS400 user', loading: false })
        }
      },

      uploadBulkData: async data => {
        set({ loading: true })
        try {
          for (const row of data) {
            // Create or update employee
            const { data: employeeData, error: employeeError } = await supabase
              .from('employees')
              .upsert([
                {
                  nip: row.nip,
                  name: row.name,
                  jabatan: row.jabatan,
                  department: row.department,
                },
              ])
              .select()
              .single()

            if (employeeError) throw employeeError

            // Create AS400 user if data exists
            if (row.username && row.ip_address) {
              const { error: as400Error } = await supabase.from('as400_users').upsert([
                {
                  employee_id: employeeData.id,
                  username: row.username,
                  display_user: row.display_user,
                  ip_address: row.ip_address,
                  mac_address: row.mac_address,
                },
              ])

              if (as400Error) throw as400Error
            }
          }

          // Refresh data after bulk upload
          await get().fetchPegawai()
        } catch (error) {
          console.error('Error uploading bulk data:', error)
          set({ error: 'Failed to upload bulk data', loading: false })
        }
      },

      filterDuplicates: () => {
        const { pegawai } = get()
        const nipCounts = pegawai.reduce(
          (acc, curr) => {
            acc[curr.nip] = (acc[curr.nip] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        const duplicates = pegawai.filter(p => nipCounts[p.nip] > 1)
        set({ pegawai: duplicates })
      },

      resetFilters: async () => {
        await get().fetchPegawai()
      },
    }),
    {
      name: 'estim-store',
    },
  ),
)
