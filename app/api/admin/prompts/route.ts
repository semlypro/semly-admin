/**
 * Admin API: Prompts Management
 * GET: List all prompts (project prompts and recommended prompts)
 * POST: Create/Update prompt
 * DELETE: Delete prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-utils';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// GET: List all prompts
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') || 'all'; // 'project', 'recommended', 'all'
    const projectId = searchParams.get('project_id');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const supabase = createServerSupabaseClient();

    let results: any[] = [];
    let total = 0;

    // Fetch project prompts
    if (type === 'project' || type === 'all') {
      let projectPromptsQuery = supabase
        .from('project_prompts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (projectId) {
        projectPromptsQuery = projectPromptsQuery.eq('project_id', projectId);
      }
      if (search) {
        projectPromptsQuery = projectPromptsQuery.ilike('prompt_text', `%${search}%`);
      }

      const { data: projectPrompts, count: projectCount } = await projectPromptsQuery
        .range(offset, offset + limit - 1);

      // Fetch related project data
      if (projectPrompts && projectPrompts.length > 0) {
        const projectIds = [...new Set(projectPrompts.map(p => p.project_id))];
        const { data: projects } = await supabase
          .from('projects')
          .select('id, name, website_url')
          .in('id', projectIds);

        const projectMap = new Map(projects?.map(p => [p.id, p]) || []);

        results.push(...projectPrompts.map(p => ({
          ...p,
          prompt_type: 'project' as const,
          projects: projectMap.get(p.project_id) || null,
        })));
      }
      if (type === 'project') {
        total = projectCount || 0;
      }
    }

    // Fetch recommended prompts
    if (type === 'recommended' || type === 'all') {
      let recommendedPromptsQuery = supabase
        .from('recommended_prompts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        recommendedPromptsQuery = recommendedPromptsQuery.ilike('prompt_text', `%${search}%`);
      }

      const { data: recommendedPrompts, count: recommendedCount } = await recommendedPromptsQuery
        .range(offset, offset + limit - 1);

      if (recommendedPrompts) {
        results.push(...recommendedPrompts.map(p => ({
          ...p,
          prompt_type: 'recommended',
        })));
      }
      if (type === 'recommended') {
        total = recommendedCount || 0;
      }
    }

    // Sort by created_at if fetching all types
    if (type === 'all') {
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      total = results.length;
      results = results.slice(offset, offset + limit);
    }

    return NextResponse.json({
      prompts: results || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error in prompts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Create or update prompt
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();

    const body = await req.json();
    const {
      id,
      prompt_type, // 'project' or 'recommended'
      project_id,
      prompt_text,
      is_recommended,
      tag,
      category,
      sub_category,
      country,
      applies_to,
    } = body;

    if (!prompt_text) {
      return NextResponse.json(
        { error: 'prompt_text is required' },
        { status: 400 }
      );
    }

    if (prompt_type === 'project' && !project_id) {
      return NextResponse.json(
        { error: 'project_id is required for project prompts' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    if (prompt_type === 'project') {
      // Update or create project prompt
      if (id) {
        const updateData: any = { prompt_text };
        if (is_recommended !== undefined) updateData.is_recommended = is_recommended;
        if (tag !== undefined) updateData.tag = tag;

        const { data, error } = await supabase
          .from('project_prompts')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating project prompt:', error);
          return NextResponse.json(
            { error: 'Failed to update project prompt' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          prompt: { ...data, prompt_type: 'project' },
        });
      } else {
          const { data, error } = await supabase
            .from('project_prompts')
            .insert({
              project_id,
              prompt_text,
              is_recommended: is_recommended || false,
              tag: tag || null,
            })
            .select()
            .single();

        if (error) {
          console.error('Error creating project prompt:', error);
          return NextResponse.json(
            { error: 'Failed to create project prompt' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          prompt: { ...data, prompt_type: 'project' },
        });
      }
    } else {
      // Update or create recommended prompt
      if (id) {
        const updateData: any = { prompt_text };
        if (category !== undefined) updateData.category = category;
        if (sub_category !== undefined) updateData.sub_category = sub_category;
        if (country !== undefined) updateData.country = country;
        if (applies_to !== undefined) updateData.applies_to = applies_to;

        const { data, error } = await supabase
          .from('recommended_prompts')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('Error updating recommended prompt:', error);
          return NextResponse.json(
            { error: 'Failed to update recommended prompt' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          prompt: { ...data, prompt_type: 'recommended' },
        });
      } else {
        const { data, error } = await supabase
          .from('recommended_prompts')
          .insert({
            prompt_text,
            category: category || null,
            sub_category: sub_category || null,
            country: country || null,
            applies_to: applies_to || null,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating recommended prompt:', error);
          return NextResponse.json(
            { error: 'Failed to create recommended prompt' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          prompt: { ...data, prompt_type: 'recommended' },
        });
      }
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error in prompts POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete prompt
export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const prompt_type = searchParams.get('type') || 'project'; // 'project' or 'recommended'

    if (!id) {
      return NextResponse.json(
        { error: 'Prompt id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    if (prompt_type === 'project') {
      const { error } = await supabase
        .from('project_prompts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project prompt:', error);
        return NextResponse.json(
          { error: 'Failed to delete project prompt' },
          { status: 500 }
        );
      }
    } else {
      const { error } = await supabase
        .from('recommended_prompts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting recommended prompt:', error);
        return NextResponse.json(
          { error: 'Failed to delete recommended prompt' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Prompt deleted successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden - Admin access required') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

