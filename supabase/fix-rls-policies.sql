-- Fix for infinite recursion in workspace_members policies
-- Run this in your Supabase SQL Editor

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Workspace members are viewable by workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners and admins can add members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners and admins can remove members" ON workspace_members;

-- Create fixed policies for workspace_members
-- The key is to check against the workspaces table instead of workspace_members itself

-- Allow users to view members of workspaces they own or are members of
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    -- User is the member being queried
    user_id = auth.uid()
    OR
    -- User owns the workspace
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Allow workspace owners to add members
CREATE POLICY "Workspace owners can add members"
  ON workspace_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Allow workspace owners to remove members
CREATE POLICY "Workspace owners can remove members"
  ON workspace_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Also allow users to remove themselves from workspaces
CREATE POLICY "Users can leave workspaces"
  ON workspace_members FOR DELETE
  USING (user_id = auth.uid());
