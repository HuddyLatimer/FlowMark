import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WorkspacesList from '@/components/WorkspacesList'
import CreateWorkspaceButton from '@/components/CreateWorkspaceButton'
import UserMenu from '@/components/UserMenu'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's workspaces (only owned workspaces for now)
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch recent activity
  const { data: recentActivity } = await supabase
    .from('activity_log')
    .select('*, profiles(*)')
    .in(
      'workspace_id',
      (workspaces || []).map((w) => w.id)
    )
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">Flowmark</h1>
            </div>
            <UserMenu user={user} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-gray-600 mt-1">Manage your workspaces and projects</p>
            </div>
            <CreateWorkspaceButton />
          </div>

          {/* Workspaces Grid */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Workspaces</h3>
            <WorkspacesList workspaces={workspaces || []} userId={user.id} />
          </div>

          {/* Recent Activity */}
          {recentActivity && recentActivity.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
                {recentActivity.map((activity: any) => (
                  <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{activity.profiles?.full_name || 'Someone'}</span>{' '}
                          {activity.action} {activity.entity_type}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!workspaces || workspaces.length === 0) && (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No workspaces yet</h3>
              <p className="text-gray-600 mb-4">Create your first workspace to get started</p>
              <CreateWorkspaceButton />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
