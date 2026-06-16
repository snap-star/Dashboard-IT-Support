'use client'

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import supabase from '@/lib/supabase'
import type { Incident } from '@/lib/types/Incident/formIncident'

interface IncidentState {
  incidents: Incident[]
  loading: boolean
  error: string | null
  fetchIncidents: () => Promise<void>
  createIncident: (incident: Omit<Incident, 'id'>) => Promise<void>
  updateIncident: (id: number, updates: Partial<Incident>) => Promise<void>
  deleteIncident: (id: number) => Promise<void>
  getIncidentById: (id: number) => Incident | undefined
}

export const useIncidents = create<IncidentState>()(
  devtools(
    (set, get) => ({
      incidents: [],
      loading: false,
      error: null,

      fetchIncidents: async () => {
        set({ loading: true, error: null })
        try {
          const { data, error } = await supabase
            .from('it_incidents')
            .select('*')
            .order('date_reported', { ascending: false })

          if (error) throw error
          set({ incidents: data || [], loading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch incidents'
          set({ error: errorMessage, loading: false })
          console.error('Error fetching incidents:', errorMessage)
        }
      },

      createIncident: async incident => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase.from('it_incidents').insert([incident])
          if (error) throw error
          await get().fetchIncidents()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create incident'
          set({ error: errorMessage, loading: false })
          console.error('Error creating incident:', errorMessage)
          throw error
        }
      },

      updateIncident: async (id, updates) => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase.from('it_incidents').update(updates).eq('id', id)
          if (error) throw error
          await get().fetchIncidents()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update incident'
          set({ error: errorMessage, loading: false })
          console.error('Error updating incident:', errorMessage)
          throw error
        }
      },

      deleteIncident: async id => {
        set({ loading: true, error: null })
        try {
          const { error } = await supabase.from('it_incidents').delete().eq('id', id)
          if (error) throw error
          await get().fetchIncidents()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete incident'
          set({ error: errorMessage, loading: false })
          console.error('Error deleting incident:', errorMessage)
          throw error
        }
      },

      getIncidentById: id => {
        return get().incidents.find(incident => incident.id === id)
      },
    }),
    {
      name: 'incidents-store',
    },
  ),
)
