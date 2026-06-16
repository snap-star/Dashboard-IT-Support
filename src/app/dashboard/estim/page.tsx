'use client'

import { useEffect, useState } from 'react'
import { As400FormDialog } from '@/components/estim/as400-form-dialog'
import { DeleteConfirmDialog } from '@/components/estim/delete-confirm-dialog'
import { EstimFilters } from '@/components/estim/estim-filters'
import { EstimTable } from '@/components/estim/estim-table'
import { PegawaiFormDialog } from '@/components/estim/pegawai-form-dialog'
import { UploadDialog } from '@/components/estim/upload-dialog'
import { useEstim } from '@/hooks/estim/use-estim'
import type { As400UserFormValues, PegawaiFormValues } from '@/lib/types/Estim/formEstim'

export default function EstimPage() {
  const {
    pegawai,
    loading,
    fetchPegawai,
    createPegawai,
    updatePegawai,
    deletePegawai,
    createAs400User,
    updateAs400User,
    deleteAs400User,
    filterDuplicates,
    resetFilters,
  } = useEstim()

  const [globalFilter, setGlobalFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Dialog states
  const [isAddPegawaiOpen, setIsAddPegawaiOpen] = useState(false)
  const [isEditPegawaiOpen, setIsEditPegawaiOpen] = useState(false)
  const [isAddAs400Open, setIsAddAs400Open] = useState(false)
  const [isEditAs400Open, setIsEditAs400Open] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  // Selected entities
  const [editingPegawai, setEditingPegawai] = useState<{
    id: number
    nip: string
    name: string
    jabatan: string
    department: string
  } | null>(null)

  const [editingAs400, setEditingAs400] = useState<{
    id: number
    username: string
    display_user: string
    ip_address: string
    mac_address: string
  } | null>(null)

  const [selectedPegawaiId, setSelectedPegawaiId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'pegawai' | 'as400'
    id: number
  } | null>(null)

  // Get unique departments for filter
  const departmentOptions = Array.from(
    new Set(pegawai.map(emp => emp.department).filter(Boolean)),
  ).sort()

  useEffect(() => {
    setCurrentPage(1)
    void fetchPegawai(globalFilter, departmentFilter)
  }, [globalFilter, departmentFilter, fetchPegawai])

  const handleFilterDuplicates = () => {
    filterDuplicates()
  }

  const handleResetFilters = async () => {
    await resetFilters()
  }

  // Pegawai handlers
  const handleAddPegawai = () => setIsAddPegawaiOpen(true)
  const handleEditPegawai = (pegawai: any) => {
    if (!pegawai.id) return
    setEditingPegawai({
      id: pegawai.id,
      nip: pegawai.nip,
      name: pegawai.name,
      jabatan: pegawai.jabatan,
      department: pegawai.department,
    })
    setIsEditPegawaiOpen(true)
  }
  const handleDeletePegawai = (id: number) => {
    setDeleteTarget({ type: 'pegawai', id })
  }

  const handleCreatePegawai = async (data: PegawaiFormValues) => {
    await createPegawai(data)
    setIsAddPegawaiOpen(false)
  }

  const handleUpdatePegawai = async (data: PegawaiFormValues) => {
    if (!editingPegawai?.id) return
    await updatePegawai(editingPegawai.id, data)
    setEditingPegawai(null)
    setIsEditPegawaiOpen(false)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    if (deleteTarget.type === 'pegawai') {
      await deletePegawai(deleteTarget.id)
    } else {
      await deleteAs400User(deleteTarget.id)
    }
    setDeleteTarget(null)
  }

  // AS400 handlers
  const handleAddAs400 = (pegawaiId: number) => {
    setSelectedPegawaiId(pegawaiId)
    setIsAddAs400Open(true)
  }
  const handleEditAs400 = (user: any) => {
    if (!user.id) return
    setEditingAs400({
      id: user.id,
      username: user.username,
      display_user: user.display_user,
      ip_address: user.ip_address,
      mac_address: user.mac_address,
    })
    setIsEditAs400Open(true)
  }
  const handleDeleteAs400 = (id: number) => {
    setDeleteTarget({ type: 'as400', id })
  }

  const handleCreateAs400 = async (data: As400UserFormValues) => {
    if (!selectedPegawaiId) return
    await createAs400User(selectedPegawaiId, data)
    setSelectedPegawaiId(null)
    setIsAddAs400Open(false)
  }

  const handleUpdateAs400 = async (data: As400UserFormValues) => {
    if (!editingAs400?.id) return
    await updateAs400User(editingAs400.id, data)
    setEditingAs400(null)
    setIsEditAs400Open(false)
  }

  if (loading && pegawai.length === 0) {
    return (
      <div className="container mx-auto py-4 px-4 sm:py-10 sm:px-0">
        <div className="flex justify-center items-center py-8">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Daftar Pemegang User ESTIM</h1>
      </div>

      <EstimFilters
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        departmentOptions={departmentOptions}
        onAddNew={handleAddPegawai}
        onUpload={() => setIsUploadOpen(true)}
        onFilterDuplicates={handleFilterDuplicates}
        onResetFilters={handleResetFilters}
        setCurrentPage={setCurrentPage}
      />

      <EstimTable
        pegawai={pegawai}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onEditPegawai={handleEditPegawai}
        onDeletePegawai={handleDeletePegawai}
        onAddAs400={handleAddAs400}
        onEditAs400={handleEditAs400}
        onDeleteAs400={handleDeleteAs400}
      />

      {/* Dialogs */}
      <PegawaiFormDialog
        isOpen={isAddPegawaiOpen}
        onOpenChange={setIsAddPegawaiOpen}
        onSubmit={handleCreatePegawai}
        isEdit={false}
      />

      <PegawaiFormDialog
        isOpen={isEditPegawaiOpen}
        onOpenChange={setIsEditPegawaiOpen}
        onSubmit={handleUpdatePegawai}
        editingPegawai={editingPegawai}
        isEdit={true}
      />

      <As400FormDialog
        isOpen={isAddAs400Open}
        onOpenChange={setIsAddAs400Open}
        onSubmit={handleCreateAs400}
        isEdit={false}
      />

      <As400FormDialog
        isOpen={isEditAs400Open}
        onOpenChange={setIsEditAs400Open}
        onSubmit={handleUpdateAs400}
        editingAs400={editingAs400}
        isEdit={true}
      />

      <UploadDialog isOpen={isUploadOpen} onOpenChange={setIsUploadOpen} />

      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.type === 'pegawai' ? 'Hapus Pegawai' : 'Hapus User ESTIM'}
        description="Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  )
}
