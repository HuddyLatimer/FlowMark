import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import CreateProjectButton from '@/components/CreateProjectButton'
import UserMenu from '@/components/UserMenu'
import WorkspaceMembers from '@/components/WorkspaceMembers'
import { ArrowLeft, FolderKanban } from 'lucide-react'

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch workspace
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single()

  if (workspaceError || !workspace) {
    notFound()
  }

  // Check if user has access to this workspace
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', id)
    .eq('user_id', user.id)
    .single()

  const isOwner = workspace.owner_id === user.id

  if (!isOwner && !membership) {
    redirect('/dashboard')
  }

  // Fetch projects in this workspace
  const { data: projects } = await supabase
    .from('projects')
    .select('*, profiles!projects_created_by_fkey(full_name)')
    .eq('workspace_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-2xl font-bold text-indigo-600">Flowmark</h1>
            </div>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{workspace.name}</h2>
              {workspace.description && (
                <p className="text-gray-600 mt-2">{workspace.description}</p>
              )}
            </div>
            <div className="flex gap-3">
              <WorkspaceMembers
                workspaceId={id}
                isOwner={isOwner}
                userRole={membership?.role || 'owner'}
              />
              <CreateProjectButton workspaceId={id} />
            </div>
          </div>

          {/* Projects Grid */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Projects</h3>
            {projects && projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project: any) => (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    className="group bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-500 transition-all p-6 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: project.color + '20' }}
                      >
                        <FolderKanban className="w-6 h-6" style={{ color: project.color }} />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {project.name}
                    </h3>

                    {project.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                    )}

                    <p className="text-xs text-gray-500">
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-4">Create your first project to get started</p>
                <CreateProjectButton workspaceId={id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
