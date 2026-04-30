'use client'

import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog'
import { Popover } from '@radix-ui/react-popover'
import { Download, Pencil, PlusCircle, Save, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import supabase from '@/lib/supabase'
import { DialogHeader } from './ui/dialog'

export default function NotesTask() {
  const [noteContent, setNoteContent] = useState('')
  const [notes, setNotes] = useState<Note[]>([])
  const [taskTitle, setTaskTitle] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null)
  const [editingContent, setEditingContent] = useState('')
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  interface Note {
    id: number
    content: string
    created_at: string
  }

  interface Task {
    id: number
    title: string
    is_completed: boolean
    created_at: string
  }

  // Fetch initial data
  useEffect(() => {
    fetchNotes()
    fetchTasks()
  }, [])

  // Notes Handlers
  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setNotes(data)
  }

  const saveNote = async () => {
    if (!noteContent.trim()) {
      toast.error('Note cannot be empty')
      return
    }

    const { error } = await supabase.from('notes').insert([{ content: noteContent }])

    if (error) {
      toast.error('Failed to save note')
    } else {
      toast.success('Note saved successfully')
      setNoteContent('')
      fetchNotes()
    }
  }

  const deleteNote = async (noteId: number) => {
    const { error } = await supabase.from('notes').delete().eq('id', noteId)

    if (error) {
      toast.error('Failed to delete note')
    } else {
      toast.success('Note deleted successfully')
      fetchNotes()
    }
  }

  const editNote = async (noteId: number) => {
    if (!editingContent.trim()) {
      toast.error('Note cannot be empty')
      return
    }

    const { error } = await supabase
      .from('notes')
      .update({ content: editingContent })
      .eq('id', noteId)

    if (error) {
      toast.error('Failed to update note')
    } else {
      toast.success('Note updated successfully')
      setEditingNoteId(null)
      fetchNotes()
    }
  }

  const exportNotes = () => {
    try {
      const notesText = notes.map(note => `${note.content}\n\n`).join('')
      const blob = new Blob([notesText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'notes.txt'
      a.click()
      toast.success('Notes exported successfully')
    } catch (error) {
      toast.error('Failed to export notes')
    }
  }

  // Task Handlers
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setTasks(data)
  }

  const addTask = async () => {
    const { error } = await supabase.from('tasks').insert([{ title: taskTitle }])

    if (!error) {
      setTaskTitle('')
      fetchTasks()
    }
  }

  const toggleTask = async (taskId: any, isCompleted: any) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_completed: !isCompleted })
      .eq('id', taskId)

    if (!error) fetchTasks()
  }

  const deleteTask = async (taskId: any) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)

    if (!error) fetchTasks()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && taskTitle.trim()) {
      addTask()
    }
  }

  return (
    <div className="container mx-auto p-6 grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Catatan Tugas</CardTitle>
          <CardDescription className="mx-auto">
            Catatan Tugas adalah fitur untuk menulis catatan tugas yang dapat di akses dimanapun dan
            kapanpun.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            placeholder="Tulis Catatan mu disini..."
            className="min-h-[150px] resize-y"
          />
          <Button onClick={saveNote} className="w-full" variant="default">
            <Save className="w-4 h-4 mr-2" />
            Save Note
          </Button>

          <Button onClick={exportNotes} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Notes
          </Button>

          <ScrollArea className="h-[400px]">
            <div className="pr-4">
              {notes.map(note => (
                <Card key={note.id} className="mb-3">
                  <CardContent className="pt-4">
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingContent}
                          onChange={e => setEditingContent(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => editNote(note.id)} size="sm">
                            Save
                          </Button>
                          <Button
                            onClick={() => setEditingNoteId(null)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <p
                          className="whitespace-pre-wrap text-sm line-clamp-3 cursor-pointer hover:text-muted-foreground"
                          onClick={() => {
                            setSelectedNote(note)
                            setIsModalOpen(true)
                          }}
                        >
                          {note.content}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingNoteId(note.id)
                              setEditingContent(note.content)
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteNote(note.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-md dark:bg-zinc-800 p-6 border space-y-2">
          <DialogHeader className="bg-inherit font-bold text-lg">
            <DialogTitle>Note Tanggal {selectedNote?.created_at.split('T')[0]}</DialogTitle>
          </DialogHeader>
          <div className="whitespace-pre-wrap mt-4">{selectedNote?.content}</div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Tugas</CardTitle>
          <CardDescription />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder="Judul tugas baru..."
              onKeyPress={handleKeyPress}
            />
            <Button onClick={addTask} variant="default">
              <PlusCircle className="w-4 h-4" />
            </Button>
          </div>

          <ScrollArea className="h-[450px]">
            <div className="pr-4">
              {tasks.map(task => (
                <Card key={task.id} className="mb-3">
                  <CardContent className="py-3">
                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-muted-foreground">
                        {new Date(task.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={task.is_completed}
                            onCheckedChange={() => toggleTask(task.id, task.is_completed)}
                          />
                          <span
                            className={`${task.is_completed ? 'line-through text-muted-foreground' : ''}`}
                          >
                            {task.title}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTask(task.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
