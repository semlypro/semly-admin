/**
 * Admin API: Projects Management
 * GET: List all projects
 * POST: Update project
 * DELETE: Delete project
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-utils';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: List all projects with filters
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const userId = searchParams.get('user_id');
    const orgId = searchParams.get('org_id');
    const offset = (page - 1) * limit;

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,website_url.ilike.%${search}%,brand_name.ilike.%${search}%`);
    }
    if (userId) {
      query = query.eq('owner_user_id', userId);
    }
    if (orgId) {
      query = query.eq('organization_id', orgId);
    }

    const { data: projects, error, count } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // Fetch related user and organization data
    const userIds = [...new Set(projects?.map(p => p.owner_user_id) || [])];
    const orgIds = [...new Set(projects?.map(p => p.organization_id).filter(Boolean) || [])];
    const projectIds = projects?.map(p => p.id) || [];

    const { data: users } = userIds.length > 0
      ? await supabase.from('users').select('clerk_user_id, email, first_name, last_name').in('clerk_user_id', userIds)
      : { data: [] };

    const { data: orgs } = orgIds.length > 0
      ? await supabase.from('organizations').select('clerk_org_id, name, slug').in('clerk_org_id', orgIds)
      : { data: [] };

    const { data: prompts } = projectIds.length > 0
      ? await supabase.from('project_prompts').select('project_id').in('project_id', projectIds)
      : { data: [] };

    const userMap = new Map(users?.map(u => [u.clerk_user_id, u]) || []);
    const orgMap = new Map(orgs?.map(o => [o.clerk_org_id, o]) || []);

    const promptCounts = prompts?.reduce((acc, prompt) => {
      acc[prompt.project_id] = (acc[prompt.project_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const projectsWithStats = projects?.map(project => ({
      ...project,
      users: userMap.get(project.owner_user_id),
      organizations: project.organization_id ? orgMap.get(project.organization_id) : null,
      promptCount: promptCounts[project.id] || 0,
    }));

    return NextResponse.json({
      projects: projectsWithStats || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error in projects API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update project
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      id,
      name,
      website_url,
      country,
      language,
      brand_name,
      category,
      sub_category,
      primary_llm,
      meta,
      is_draft,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Project id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (website_url !== undefined) updateData.website_url = website_url;
    if (country !== undefined) updateData.country = country;
    if (language !== undefined) updateData.language = language;
    if (brand_name !== undefined) updateData.brand_name = brand_name;
    if (category !== undefined) updateData.category = category;
    if (sub_category !== undefined) updateData.sub_category = sub_category;
    if (primary_llm !== undefined) updateData.primary_llm = primary_llm;
    if (meta !== undefined) updateData.meta = meta;
    if (is_draft !== undefined) updateData.is_draft = is_draft;

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: data,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete project (soft delete)
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Project id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

