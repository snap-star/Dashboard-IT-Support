'use client'

import { useEffect, useState } from 'react'
import { DeleteConfirmDialog } from '@/components/employee/delete-confirm-dialog'
import { EmployeeFilters } from '@/components/employee/employee-filters'
import { EmployeeFormDialog } from '@/components/employee/employee-form-dialog'
import { EmployeeTable } from '@/components/employee/employee-table'
import { useEmployees } from '@/hooks/employee/use-employees'
import type { EmployeeFormValues } from '@/lib/types/Employee/formEmployee'

export default function PegawaiPage() {
  const { employees, loading, fetchEmployees, createEmployee, updateEmployee, deleteEmployee } =
    useEmployees()

  const [globalFilter, setGlobalFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [_pageIndex, setPageIndex] = useState(0)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<{
    id: number
    nip: string
    name: string
    jabatan: string
    department: string
  } | null>(null)
  const [deleteEmployeeData, setDeleteEmployeeData] = useState<(typeof employees)[0] | null>(null)

  // Get unique departments for filter options
  const departmentOptions = Array.from(
    new Set(employees.map(emp => emp.department).filter(Boolean)),
  ).sort()

  useEffect(() => {
    void fetchEmployees()
  }, [fetchEmployees])

  const handleAddNew = () => {
    setIsCreateOpen(true)
  }

  const handleEdit = (employee: (typeof employees)[0]) => {
    if (!employee.id) return // Guard clause to prevent undefined ID
    setEditingEmployee({
      id: employee.id,
      nip: employee.nip,
      name: employee.name,
      jabatan: employee.jabatan,
      department: employee.department,
    })
    setIsEditOpen(true)
  }

  const handleDelete = (employee: (typeof employees)[0]) => {
    if (!employee.id) return // Guard clause to prevent undefined ID
    setDeleteEmployeeData(employee)
  }

  const handleCreateSubmit = async (data: EmployeeFormValues) => {
    await createEmployee({
      nip: data.nip,
      name: data.nama,
      jabatan: data.jabatan,
      department: data.department,
    })
  }

  const handleEditSubmit = async (data: EmployeeFormValues) => {
    if (!editingEmployee?.id) return
    await updateEmployee(editingEmployee.id, {
      nip: data.nip,
      name: data.nama,
      jabatan: data.jabatan,
      department: data.department,
    })
    setEditingEmployee(null)
  }

  const handleConfirmDelete = async () => {
    if (!deleteEmployeeData?.id) return
    await deleteEmployee(deleteEmployeeData.id)
    setDeleteEmployeeData(null)
  }

  if (loading && employees.length === 0) {
    return (
      <div className="container mx-auto py-4 px-4 sm:py-10 sm:px-0">
        <div className="flex justify-center items-center py-8">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-4 sm:py-10 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Data Pegawai</h1>
      </div>

      <EmployeeFilters
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        departmentFilter={departmentFilter}
        setDepartmentFilter={setDepartmentFilter}
        departmentOptions={departmentOptions}
        onAddNew={handleAddNew}
        setPageIndex={setPageIndex}
      />

      <EmployeeTable
        employees={employees}
        onEdit={handleEdit}
        onDelete={handleDelete}
        globalFilter={globalFilter}
        departmentFilter={departmentFilter}
      />

      {/* Create Employee Dialog */}
      <EmployeeFormDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Employee Dialog */}
      <EmployeeFormDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSubmit={handleEditSubmit}
        editingEmployee={editingEmployee}
        isEdit={true}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        employee={deleteEmployeeData}
        onOpenChange={() => setDeleteEmployeeData(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
