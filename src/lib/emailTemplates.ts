import { supabase } from '@/lib/supabase/client';

export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  html: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

type SupabaseEmailTemplateRow = {
  id: string;
  name: string;
  subject: string;
  body: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

// Map Supabase row to EmailTemplate
function mapRow(row: SupabaseEmailTemplateRow): EmailTemplate {
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    html: row.body,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getTemplates(): Promise<EmailTemplate[]> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map(mapRow);
}

export async function getTemplateById(id: string): Promise<EmailTemplate | null> {
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(error.message);
  }
  return data ? mapRow(data) : null;
}

export async function saveTemplate(t: { name: string; subject: string; html: string; description?: string }): Promise<EmailTemplate> {
  const { data, error } = await supabase
    .from('email_templates')
    .insert({
      name: t.name,
      subject: t.subject,
      body: t.html,
      description: t.description,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRow(data);
}

export async function updateTemplate(id: string, patch: Partial<{ name: string; subject: string; html: string; description: string }>): Promise<EmailTemplate | null> {
  const updates: Partial<Omit<SupabaseEmailTemplateRow, 'id' | 'created_at' | 'updated_at'>> = {};
  if (patch.name !== undefined) updates.name = patch.name;
  if (patch.subject !== undefined) updates.subject = patch.subject;
  if (patch.html !== undefined) updates.body = patch.html;
  if (patch.description !== undefined) updates.description = patch.description;

  const { data, error } = await supabase
    .from('email_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data ? mapRow(data) : null;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('email_templates')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
}
