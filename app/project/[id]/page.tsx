import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import KanbanBoard from '@/components/KanbanBoard'
import UserMenu from '@/components/UserMenu'
import { ArrowLeft } from 'lucide-react'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch project with workspace info
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*, workspaces(*)')
    .eq('id', id)
    .single()

  if (projectError || !project) {
    notFound()
  }

  // Check if user has access
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', project.workspace_id)
    .eq('user_id', user.id)
    .single()

  const isOwner = project.workspaces.owner_id === user.id

  if (!isOwner && !membership) {
    redirect('/dashboard')
  }

  // Fetch tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, profiles!tasks_assigned_to_fkey(id, full_name, email)')
    .eq('project_id', id)
    .order('position', { ascending: true })

  // Fetch workspace members for assignment
  const { data: workspaceMembers } = await supabase
    .from('workspace_members')
    .select('profiles(*)')
    .eq('workspace_id', project.workspace_id)

  const members = workspaceMembers?.map((m: any) => m.profiles) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href={`/workspace/${project.workspace_id}`}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: project.color + '20' }}
                >
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: project.color }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                  {project.description && (
                    <p className="text-sm text-gray-600">{project.description}</p>
                  )}
                </div>
              </div>
            </div>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <KanbanBoard
          projectId={id}
          initialTasks={tasks || []}
          members={members}
          userId={user.id}
        />
      </main>
    </div>
  )
}
