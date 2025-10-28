-- Complete Fix for RLS Infinite Recursion Issues
-- This removes all circular dependencies between workspaces and workspace_members
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL existing policies on workspaces and workspace_members
DROP POLICY IF EXISTS "Workspaces are viewable by members" ON workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON workspaces;
DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON workspaces;

DROP POLICY IF EXISTS "Workspace members are viewable by workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners and admins can add members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners and admins can remove members" ON workspace_members;
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can add members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove members" ON workspace_members;
DROP POLICY IF EXISTS "Users can leave workspaces" ON workspace_members;

-- Step 2: Create fixed policies for WORKSPACES (simplified - only check owner_id)
-- This breaks the circular dependency by NOT checking workspace_members

CREATE POLICY "Users can view their own workspaces"
  ON workspaces FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can update their workspaces"
  ON workspaces FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Workspace owners can delete their workspaces"
  ON workspaces FOR DELETE
  USING (auth.uid() = owner_id);

-- Step 3: Create fixed policies for WORKSPACE_MEMBERS (check workspaces, not workspace_members)

-- Users can view workspace_members records where they are the owner of the workspace
CREATE POLICY "Users can view members of their workspaces"
  ON workspace_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Workspace owners can add members
CREATE POLICY "Workspace owners can add members"
  ON workspace_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Workspace owners can remove members
CREATE POLICY "Workspace owners can remove members"
  ON workspace_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Users can remove themselves from workspaces
CREATE POLICY "Users can leave workspaces"
  ON workspace_members FOR DELETE
  USING (user_id = auth.uid());

-- Step 4: Update projects policies to work with simplified workspace access
DROP POLICY IF EXISTS "Projects are viewable by workspace members" ON projects;
DROP POLICY IF EXISTS "Workspace members can create projects" ON projects;
DROP POLICY IF EXISTS "Workspace members can update projects" ON projects;
DROP POLICY IF EXISTS "Workspace owners can delete projects" ON projects;

-- Simplified: Only workspace owners can manage projects
CREATE POLICY "Workspace owners can view projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = projects.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = projects.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can update projects"
  ON projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = projects.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can delete projects"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = projects.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Step 5: Update tasks policies
DROP POLICY IF EXISTS "Tasks are viewable by workspace members" ON tasks;
DROP POLICY IF EXISTS "Workspace members can create tasks" ON tasks;
DROP POLICY IF EXISTS "Workspace members can update tasks" ON tasks;
DROP POLICY IF EXISTS "Workspace members can delete tasks" ON tasks;

CREATE POLICY "Workspace owners can view tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspaces ON workspaces.id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspaces ON workspaces.id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can update tasks"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspaces ON workspaces.id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can delete tasks"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN workspaces ON workspaces.id = projects.workspace_id
      WHERE projects.id = tasks.project_id
      AND workspaces.owner_id = auth.uid()
    )
  );

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'RLS policies fixed successfully! All circular dependencies removed.';
END $$;
