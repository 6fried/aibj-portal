import { NextRequest, NextResponse } from 'next/server';
import { getTemplates, saveTemplate, updateTemplate } from '@/lib/emailTemplates';

export async function GET() {
  try {
    const templates = await getTemplates();
    return NextResponse.json({ templates });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e?.message || 'Failed to load templates' }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, subject, html } = body || {};
    if (!name || !subject || !html) {
      return NextResponse.json({ error: 'Missing name, subject or html' }, { status: 400 });
    }
    const item = await saveTemplate({ name, subject, html });
    return NextResponse.json({ template: item });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e?.message || 'Failed to save template' }, { status: 500 });
    }
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, subject, html } = body || {};
    if (!id) {
      return NextResponse.json({ error: 'Missing template id' }, { status: 400 });
    }
    const patch: { name?: string; subject?: string; html?: string } = {};
    if (typeof name === 'string') patch.name = name;
    if (typeof subject === 'string') patch.subject = subject;
    if (typeof html === 'string') patch.html = html;

    const updated = await updateTemplate(id, patch);
    if (!updated) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    return NextResponse.json({ template: updated });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e?.message || 'Failed to update template' }, { status: 500 });
    }
  }
}
