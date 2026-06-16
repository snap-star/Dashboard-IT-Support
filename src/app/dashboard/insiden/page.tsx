'use client'

import * as React from 'react'
import ReportLayout from '@/app/dashboard/reports/layout'
import { DeleteConfirmDialog } from '@/components/incident/delete-confirm-dialog'
import { IncidentFilters } from '@/components/incident/incident-filters'
import { IncidentFormDialog } from '@/components/incident/incident-form-dialog'
import { IncidentTable } from '@/components/incident/incident-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useIncidents } from '@/hooks/incident/use-incidents'
import type { Incident } from '@/lib/types/Incident/formIncident'

export default function ITIncidentManagement() {
  const { incidents, loading, fetchIncidents, createIncident, updateIncident, deleteIncident } =
    useIncidents()
  const [editingIncident, setEditingIncident] = React.useState<Incident | null>(null)
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [deleteIncidentId, setDeleteIncidentId] = React.useState<number | null>(null)
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('')
  const [priorityFilter, setPriorityFilter] = React.useState('')
  const [isExporting, setIsExporting] = React.useState(false)

  React.useEffect(() => {
    fetchIncidents()
  }, [fetchIncidents])

  const handleEdit = (incident: Incident) => {
    setEditingIncident(incident)
    setIsFormDialogOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setDeleteIncidentId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleFormSubmit = async (incident: Incident | Omit<Incident, 'id'>) => {
    if ('id' in incident) {
      await updateIncident(incident.id, incident)
    } else {
      await createIncident(incident)
    }
    setIsFormDialogOpen(false)
    setEditingIncident(null)
  }

  const handleConfirmDelete = async () => {
    if (deleteIncidentId) {
      await deleteIncident(deleteIncidentId)
      setIsDeleteDialogOpen(false)
      setDeleteIncidentId(null)
    }
  }

  const handleAddNew = () => {
    setEditingIncident(null)
    setIsFormDialogOpen(true)
  }

  const handleCancel = () => {
    setIsFormDialogOpen(false)
    setEditingIncident(null)
  }

  return (
    <ReportLayout>
      <Card>
        <CardHeader>
          <CardTitle>IT Incident Management</CardTitle>
          <CardDescription>Manage and track all IT incidents in your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <IncidentFilters
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            onAddNew={handleAddNew}
            isExporting={isExporting}
            setIsExporting={setIsExporting}
          />

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <IncidentTable
              incidents={incidents}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              globalFilter={globalFilter}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
            />
          )}
        </CardContent>
      </Card>

      <IncidentFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        editingIncident={editingIncident}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={loading}
      />
    </ReportLayout>
  )
}
