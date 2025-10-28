'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { createClient } from '@/lib/supabase/client'
import TaskCard from './TaskCard'
import CreateTaskButton from './CreateTaskButton'
import SearchAndFilter from './SearchAndFilter'

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100' },
  { id: 'review', title: 'Review', color: 'bg-yellow-100' },
  { id: 'done', title: 'Done', color: 'bg-green-100' },
]

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  assigned_to: string | null
  due_date: string | null
  position: number
  profiles: {
    id: string
    full_name: string | null
    email: string
  } | null
}

interface KanbanBoardProps {
  projectId: string
  initialTasks: Task[]
  members: any[]
  userId: string
}

export default function KanbanBoard({ projectId, initialTasks, members, userId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null)
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel(`project:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `project_id=eq.${projectId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the new task with profile data
            const { data: newTask } = await supabase
              .from('tasks')
              .select('*, profiles!tasks_assigned_to_fkey(id, full_name, email)')
              .eq('id', payload.new.id)
              .single()

            if (newTask) {
              setTasks((prev) => [...prev, newTask])
            }
          } else if (payload.eventType === 'UPDATE') {
            const { data: updatedTask } = await supabase
              .from('tasks')
              .select('*, profiles!tasks_assigned_to_fkey(id, full_name, email)')
              .eq('id', payload.new.id)
              .single()

            if (updatedTask) {
              setTasks((prev) =>
                prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
              )
            }
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((task) => task.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const newStatus = destination.droppableId
    const taskId = draggableId

    // Optimistically update UI
    setTasks((prev) => {
      const updated = prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
      return updated
    })

    // Update in database
    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', taskId)

    if (error) {
      console.error('Error updating task:', error)
      // Revert on error
      setTasks(initialTasks)
    }
  }

  const getFilteredTasks = () => {
    let filtered = tasks

    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    if (priorityFilter) {
      filtered = filtered.filter((task) => task.priority === priorityFilter)
    }

    if (assigneeFilter) {
      filtered = filtered.filter((task) => task.assigned_to === assigneeFilter)
    }

    return filtered
  }

  const getTasksByColumn = (columnId: string) => {
    return getFilteredTasks().filter((task) => task.status === columnId)
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <SearchAndFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        members={members}
      />

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((column) => (
            <div key={column.id} className="flex flex-col bg-white rounded-lg border-2 border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="text-sm text-gray-500">
                    ({getTasksByColumn(column.id).length})
                  </span>
                </div>
                <CreateTaskButton projectId={projectId} status={column.id} members={members} />
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-3 min-h-[200px] rounded-lg p-2 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-indigo-50' : ''
                    }`}
                  >
                    {getTasksByColumn(column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'opacity-50' : ''}
                          >
                            <TaskCard task={task} members={members} projectId={projectId} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}
