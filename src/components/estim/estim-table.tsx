import { Edit, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Pegawai } from '@/lib/types/Estim/formEstim'
import { PaginationControls } from './pagination-controls'
import { SortHeader } from './sort-header'

interface EstimTableProps {
  pegawai: Pegawai[]
  currentPage: number
  setCurrentPage: (page: number) => void
  onEditPegawai: (pegawai: Pegawai) => void
  onDeletePegawai: (id: number) => void
  onAddAs400: (pegawaiId: number) => void
  onEditAs400: (user: any) => void
  onDeleteAs400: (id: number) => void
}

export function EstimTable({
  pegawai,
  currentPage,
  setCurrentPage,
  onEditPegawai,
  onDeletePegawai,
  onAddAs400,
  onEditAs400,
  onDeleteAs400,
}: EstimTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Pegawai | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  const itemsPerPage = 10

  const sortedPegawai = useMemo(() => {
    if (!sortConfig.key) return pegawai
    return [...pegawai].sort((a, b) => {
      const aVal = a[sortConfig.key!] ?? ''
      const bVal = b[sortConfig.key!] ?? ''
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [pegawai, sortConfig])

  const handleSort = (key: keyof Pegawai) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedPegawai.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(pegawai.length / itemsPerPage)

  return (
    <div className="rounded-md border">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHeader
                column="nip"
                label="NIP"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="w-32"
              />
              <SortHeader
                column="name"
                label="Nama"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="w-48"
              />
              <SortHeader
                column="jabatan"
                label="Jabatan"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="w-48"
              />
              <SortHeader
                column="department"
                label="Unit"
                sortConfig={sortConfig}
                onSort={handleSort}
                className="w-40"
              />
              <TableHead className="w-64">User ESTIM</TableHead>
              <TableHead className="text-right w-28">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
            {currentItems.map(pegawai => {
              // Guard clause to ensure pegawai has required properties
              if (!pegawai.id) return null

              return (
                <TableRow key={pegawai.id}>
                  <TableCell className="font-medium truncate">{pegawai.nip}</TableCell>
                  <TableCell className="truncate max-w-48">{pegawai.name}</TableCell>
                  <TableCell className="truncate max-w-48">{pegawai.jabatan}</TableCell>
                  <TableCell className="truncate max-w-40">{pegawai.department}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {pegawai.as400_users && pegawai.as400_users.length > 0 ? (
                        pegawai.as400_users.map(user => {
                          if (!user.id) return null
                          return (
                            <div key={user.id} className="p-2 bg-muted rounded space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium">{user.username}</span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => onEditAs400(user)}
                                  >
                                    <Edit className="h-2.5 w-2.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5"
                                    onClick={() => onDeleteAs400(user.id!)}
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </Button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                <div>
                                  <p className="text-muted-foreground">IP</p>
                                  <p>{user.ip_address || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-muted-foreground">MAC</p>
                                  <p>{user.mac_address || '-'}</p>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <span className="text-xs text-muted-foreground">Tidak ada user</span>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-1 h-7 text-xs"
                        onClick={() => onAddAs400(pegawai.id!)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Tambah User
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEditPegawai(pegawai)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeletePegawai(pegawai.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4">
        {currentItems.length === 0 && (
          <div className="text-center py-10 text-muted-foreground">Tidak ada data</div>
        )}
        {currentItems.map(pegawai => {
          // Guard clause to ensure pegawai has required properties
          if (!pegawai.id) return null

          return (
            <div key={pegawai.id} className="bg-card rounded-lg border p-4 space-y-3">
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-muted-foreground">NIP</p>
                    <p className="font-medium">{pegawai.nip}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEditPegawai(pegawai)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDeletePegawai(pegawai.id!)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Nama</p>
                  <p className="font-medium">{pegawai.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Jabatan</p>
                  <p>{pegawai.jabatan}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Unit</p>
                  <p>{pegawai.department}</p>
                </div>
              </div>

              {/* AS400 Users Section */}
              <div className="border-t pt-3">
                <p className="text-xs text-muted-foreground mb-2">User ESTIM</p>
                <div className="space-y-2">
                  {pegawai.as400_users && pegawai.as400_users.length > 0 ? (
                    pegawai.as400_users.map(user => {
                      if (!user.id) return null
                      return (
                        <div key={user.id} className="p-2 bg-muted rounded-md space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{user.username}</span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onEditAs400(user)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onDeleteAs400(user.id!)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="text-muted-foreground">IP Address</p>
                              <p>{user.ip_address || '-'}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">MAC Address</p>
                              <p>{user.mac_address || '-'}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <span className="text-xs text-muted-foreground">Tidak ada user</span>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={() => onAddAs400(pegawai.id!)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah User
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}
