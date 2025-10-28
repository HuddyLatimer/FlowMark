'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, User, AlertCircle, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import TaskModal from './TaskModal'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description: string | null
    status: string
    priority: string
    assigned_to: string | null
    due_date: string | null
    profiles: {
      full_name: string | null
      email: string
    } | null
  }
  members: any[]
  projectId: string
}

const PRIORITY_COLORS = {
  low: 'text-gray-600 bg-gray-100',
  medium: 'text-blue-600 bg-blue-100',
  high: 'text-orange-600 bg-orange-100',
  urgent: 'text-red-600 bg-red-100',
}

export default function TaskCard({ task, members, projectId }: TaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()

  const isDueSoon =
    task.due_date && new Date(task.due_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
      >
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {task.title}
          </h4>
          <span
            className={`px-2 py-1 text-xs font-semibold rounded capitalize ${
              PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]
            }`}
          >
            {task.priority}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {task.profiles && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate max-w-[100px]">
                  {task.profiles.full_name || task.profiles.email}
                </span>
              </div>
            )}
          </div>

          {task.due_date && (
            <div
              className={`flex items-center gap-1 ${
                isOverdue ? 'text-red-600 font-semibold' : isDueSoon ? 'text-orange-600' : ''
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>{format(new Date(task.due_date), 'MMM d')}</span>
            </div>
          )}
        </div>

        {isOverdue && (
          <div className="mt-2 flex items-center gap-1 text-xs text-red-600 font-semibold">
            <AlertCircle className="w-3 h-3" />
            <span>Overdue</span>
          </div>
        )}
      </div>

      {isModalOpen && (
        <TaskModal
          task={task}
          members={members}
          projectId={projectId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
