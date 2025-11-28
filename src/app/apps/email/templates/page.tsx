"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Eye, FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EmailTemplateItem {
  id: string;
  name: string;
  subject: string;
  html: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplateItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [deleteTemplate, setDeleteTemplate] = useState<EmailTemplateItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/email/templates", { cache: "no-store" });
        if (!res.ok) throw new Error("Impossible de charger les templates");
        const json = await res.json();
        if (mounted) setTemplates(json.templates || []);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : "Erreur inattendue");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleUseTemplate = (templateId: string) => {
    router.push(`/apps/email/compose?templateId=${encodeURIComponent(templateId)}`);
  };

  const handleCreate = async () => {
    if (!newName.trim() || !newSubject.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/email/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          subject: newSubject.trim(),
          html: "<p>Bonjour {{firstName}},</p>\n<p>Votre contenu ici...</p>",
          description: newDescription.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Impossible de créer le template");
      }
      const data = await res.json();
      setShowCreate(false);
      setNewName("");
      setNewSubject("");
      setNewDescription("");
      // Redirect to edit page
      router.push(`/apps/email/templates/${data.template.id}/edit`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTemplate) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/email/templates/${deleteTemplate.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Impossible de supprimer le template");
      }
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTemplate.id));
      setDeleteTemplate(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="px-6 py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{`Templates d'email`}</h1>
            <p className="text-muted-foreground mt-1">Sélectionnez un template pour envoyer un email.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un template
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-5 animate-pulse">
                <div className="h-5 w-3/4 bg-muted rounded mb-3" />
                <div className="h-4 w-full bg-muted rounded mb-2" />
                <div className="h-4 w-2/3 bg-muted rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && templates.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">Aucun template</h3>
            <p className="text-sm text-muted-foreground">Les templates seront ajoutés directement dans Supabase.</p>
          </div>
        )}

        {/* Templates Grid */}
        {!loading && templates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((t) => (
              <div
                key={t.id}
                className="group rounded-lg border bg-card hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleUseTemplate(t.id)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/apps/email/templates/${t.id}/edit`);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(t);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTemplate(t);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{t.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {t.description || t.subject}
                  </p>
                </div>
                <div className="border-t px-5 py-3 bg-muted/30">
                  <span className="text-xs text-muted-foreground">
                    Mis à jour le {new Date(t.updatedAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={(open) => { if (!open) setPreviewTemplate(null); }}>
          <DialogContent className="max-w-[900px] w-[95vw] max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{previewTemplate?.name}</DialogTitle>
            </DialogHeader>
            <div className="border-b px-1 py-2 text-sm">
              <span className="text-muted-foreground">Sujet:</span> {previewTemplate?.subject}
            </div>
            <div className="flex-1 overflow-auto p-4 bg-white rounded-md border">
              {previewTemplate && (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: previewTemplate.html }} />
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Fermer</Button>
              <Button onClick={() => {
                if (previewTemplate) {
                  handleUseTemplate(previewTemplate.id);
                }
              }}>
                Utiliser ce template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent className="max-w-[500px] w-[95vw]">
            <DialogHeader>
              <DialogTitle>Nouveau template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nom du template</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Bienvenue nouveaux membres"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{`Sujet de l'email`}</label>
                <Input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ex: Bienvenue chez AIESEC {{firstName}}"
                />
                <p className="text-xs text-muted-foreground">
                  Variables: {"{{firstName}}"}, {"{{lastName}}"}, {"{{email}}"}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (optionnel)</label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Ex: Email envoyé aux nouveaux membres"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowCreate(false)}>
                  Annuler
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim() || !newSubject.trim()}
                >
                  {creating ? "Création..." : "Continuer"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteTemplate} onOpenChange={(open) => { if (!open) setDeleteTemplate(null); }}>
          <DialogContent className="max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Supprimer le template</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Êtes-vous sûr de vouloir supprimer le template <strong>{deleteTemplate?.name}</strong> ? Cette action est irréversible.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTemplate(null)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
