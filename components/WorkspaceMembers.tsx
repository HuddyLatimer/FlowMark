'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, X, Mail, UserPlus } from 'lucide-react'

interface WorkspaceMembersProps {
  workspaceId: string
  isOwner: boolean
  userRole: string
}

export default function WorkspaceMembers({ workspaceId, isOwner, userRole }: WorkspaceMembersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [members, setMembers] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchMembers()
    }
  }, [isOpen])

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('*, profiles(*)')
      .eq('workspace_id', workspaceId)

    if (!error && data) {
      setMembers(data)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Find user by email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (!profile) {
        throw new Error('User not found with this email')
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', profile.id)
        .single()

      if (existing) {
        throw new Error('User is already a member of this workspace')
      }

      // Add member
      const { error: memberError } = await supabase.from('workspace_members').insert({
        workspace_id: workspaceId,
        user_id: profile.id,
        role: 'member',
      })

      if (memberError) throw memberError

      // Log activity
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('activity_log').insert({
          workspace_id: workspaceId,
          user_id: user.id,
          action: 'invited',
          entity_type: 'workspace_member',
          entity_id: profile.id,
        })
      }

      setEmail('')
      fetchMembers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const canInvite = isOwner || userRole === 'admin'

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Users className="w-5 h-5" />
        Members
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Workspace Members</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {canInvite && (
              <form onSubmit={handleInvite} className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Invite by email
                </label>
                <div className="flex gap-2">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Members ({members.length})</h3>
              {members.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                      {member.profiles?.full_name?.[0]?.toUpperCase() ||
                        member.profiles?.email?.[0]?.toUpperCase() ||
                        'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {member.profiles?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">{member.profiles?.email}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-200 rounded capitalize">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
