'use client'

import Link from 'next/link'
import { Folder, Users } from 'lucide-react'

interface Workspace {
  id: string
  name: string
  description: string | null
  owner_id: string
  created_at: string
}

interface WorkspacesListProps {
  workspaces: Workspace[]
  userId: string
}

export default function WorkspacesList({ workspaces, userId }: WorkspacesListProps) {
  if (workspaces.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {workspaces.map((workspace) => (
        <Link
          key={workspace.id}
          href={`/workspace/${workspace.id}`}
          className="group bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-all p-6 hover:shadow-md"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <Folder className="w-6 h-6 text-indigo-600" />
            </div>
            {workspace.owner_id === userId && (
              <span className="px-2 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded">
                Owner
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
            {workspace.name}
          </h3>

          {workspace.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{workspace.description}</p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users className="w-4 h-4" />
            <span>Team workspace</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
