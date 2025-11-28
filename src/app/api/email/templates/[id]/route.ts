import { NextRequest, NextResponse } from 'next/server';
import { getTemplateById, updateTemplate, deleteTemplate } from '@/lib/emailTemplates';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const template = await getTemplateById(id);
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    return NextResponse.json({ template });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e?.message || 'Failed to load template' }, { status: 500 });
    }
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, subject, html } = body || {};
    if (!name && !subject && !html) {
      return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    }
    const updated = await updateTemplate(id, { name, subject, html });
    if (!updated) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    return NextResponse.json({ template: updated });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e?.message || 'Failed to update template' }, { status: 500 });
    }
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const ok = await deleteTemplate(id);
    if (!ok) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e?.message || 'Failed to delete template' }, { status: 500 });
    }
  }
}
