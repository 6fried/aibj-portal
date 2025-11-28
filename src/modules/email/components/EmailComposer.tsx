"use client";

import React, { useEffect, useState } from "react";
import { EmailPayload, Recipient, SendMode } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Blocks, Mail as MailIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EmailDesigner from "./EmailDesigner";

interface EmailComposerProps {
  recipients: Recipient[];
  onClose: () => void;
  onSent?: (result: { jobId: string }) => void;
}

export default function EmailComposer({ recipients, onClose, onSent }: EmailComposerProps) {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("<p>Hello {{firstName}},</p>\n<p>...</p>");
  const [mode, setMode] = useState<SendMode>("individual");
  const [replyTo, setReplyTo] = useState("");
  const [fromName ] = useState("AIESEC Team");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [designerOpen, setDesignerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const firstRecipient: Recipient | undefined = recipients[0];
  const applyPlaceholders = (content: string, r?: Recipient) => {
    if (!r) return content;
    return content
      .replace(/\{\{\s*firstName\s*\}\}/g, r.firstName || "")
      .replace(/\{\{\s*lastName\s*\}\}/g, r.lastName || "")
      .replace(/\{\{\s*committee\s*\}\}/g, r.committee || "");
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/email/status', { cache: 'no-store' });
        const json = await res.json();
        if (mounted) setConnected(!!json.connected);
      } catch {
        if (mounted) setConnected(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSend = async (testOnly = false) => {
    setSending(true);
    setError(null);
    try {
      const payload: EmailPayload = {
        subject,
        html,
        recipients: testOnly ? recipients.slice(0, 1) : recipients,
        mode,
        replyTo: replyTo || undefined,
        fromName: fromName || undefined,
      };
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, testOnly }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to send email");
      }
      const data = await res.json();
      onSent?.(data);
      setSuccess(`Email envoyé: sent=${data.sent ?? 0}, failed=${data.failed ?? 0}`);
      // Auto close after short delay
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
              <MailIcon className="h-4 w-4 text-primary" />
            </span>
            <div className="min-w-0">
              <CardTitle className="truncate">Composer un email</CardTitle>
              <CardDescription className="truncate">Préparez le message et envoyez-le</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 rounded-full border bg-muted px-2 py-0.5 text-xs text-muted-foreground">{recipients.length} destinataire(s)</span>
            {connected === false ? (
              <Button variant="outline" onClick={() => {
                const state = typeof window !== 'undefined' ? window.location.pathname : '/apps/leads';
                const url = `/api/email/auth?state=${encodeURIComponent(state)}`;
                window.location.href = url;
              }}>Connecter Gmail</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => handleSend(true)} disabled={sending}>Envoyer un test</Button>
                <Button onClick={() => handleSend(false)} disabled={sending || recipients.length === 0}>Envoyer</Button>
              </>
            )}
            <Button variant="outline" onClick={() => setDesignerOpen(true)} className="hidden sm:inline-flex gap-1"><Blocks className="h-4 w-4" /> Visuel</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Fields */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-muted-foreground">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Sujet de l'email" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Reply-To</label>
              <Input value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="team@aiesec.org" />
            </div>
            <div className="space-y-1">
              <label className="text-sm text-muted-foreground">Mode d’envoi</label>
              <div className="inline-flex rounded-md border p-1">
                <Button type="button" variant={mode === 'individual' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMode('individual')}>Individual</Button>
                <Button type="button" variant={mode === 'bcc' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMode('bcc')}>BCC</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content tabs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b">
            <button className={`px-3 py-2 text-sm ${activeTab==='edit' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`} onClick={() => setActiveTab('edit')}>Éditer</button>
            <button className={`px-3 py-2 text-sm ${activeTab==='preview' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground'}`} onClick={() => setActiveTab('preview')}>Aperçu</button>
            <div className="ml-auto">
              <Button variant="outline" size="sm" onClick={() => setDesignerOpen(true)} className="sm:hidden gap-1"><Blocks className="h-3 w-3" /> Visuel</Button>
            </div>
          </div>
          {activeTab === 'edit' ? (
            <div className="space-y-2">
              <textarea
                className="min-h-[240px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={html}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setHtml(e.target.value)}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <p>Placeholders: {'{{firstName}}'}, {'{{lastName}}'}, {'{{committee}}'}</p>
                <button className="underline inline-flex items-center gap-1" onClick={() => setDesignerOpen(true)}><Blocks className="h-3 w-3" /> Ouvrir l’éditeur visuel</button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border bg-background overflow-hidden">
              <div className="border-b px-3 py-2 text-xs text-muted-foreground">Aperçu avec: {firstRecipient?.email || '—'}</div>
              <div className="p-4 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: applyPlaceholders(html, firstRecipient) }} />
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && (
          <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>
        )}
      </CardContent>
      {/* Visual Designer Dialog */}
      <Dialog open={designerOpen} onOpenChange={setDesignerOpen}>
        <DialogContent className="max-w-[96vw] w-[96vw] h-[90vh] p-0">
          <DialogHeader>
            <DialogTitle className="sr-only">Éditeur visuel</DialogTitle>
          </DialogHeader>
          <div className="h-full">
            <EmailDesigner
              initialHtml={html}
              onClose={(newHtml) => {
                setHtml(newHtml);
                setDesignerOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
