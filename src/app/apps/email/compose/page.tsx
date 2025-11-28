"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import EmailDesigner from "@/modules/email/components/EmailDesigner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Recipient, EmailPayload } from "@/modules/email/types";
import { Loader2, ArrowLeft, Blocks, Send as SendIcon } from "lucide-react";

function ComposeEmailContent() {
  const searchParams = useSearchParams();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [subject, setSubject] = useState("");
  const [fromName, setFromName] = useState("AIESEC Team");
  const [cc, setCc] = useState("");
  const [bcc, setBcc] = useState("");
  const [html, setHtml] = useState<string>("<table class='container'><tr><td><h1>AIESEC</h1><p>Votre contenu ici...</p></td></tr></table>");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Load recipients from localStorage (set in Leads)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("compose_recipients");
      if (raw) setRecipients(JSON.parse(raw));
    } catch {}
  }, []);

  // Load Gmail connection status
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

  const firstRecipient = useMemo(() => recipients[0], [recipients]);

  const applyPlaceholders = (content: string) => {
    const r = firstRecipient;
    if (!r) return content;
    return content
      .replace(/\{\{\s*firstName\s*\}\}/g, r.firstName || "")
      .replace(/\{\{\s*lastName\s*\}\}/g, r.lastName || "")
      .replace(/\{\{\s*committee\s*\}\}/g, r.committee || "");
  };

  // Load saved template from server if templateId is present in URL
  useEffect(() => {
    const id = searchParams.get("templateId");
    if (!id) return;

    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/email/templates", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        const list = (json.templates || []) as { id: string; subject: string; html: string }[];
        const found = list.find(t => t.id === id);
        if (found && mounted) {
          setSubject(found.subject || "");
          setHtml(found.html);
        }
      } catch {
        // silencieux pour ne pas bloquer la composition
      }
    })();
    return () => {
      mounted = false;
    };
  }, [searchParams]);


  const handleSend = async (testOnly = false) => {
    setSending(true);
    setError(null);
    try {
      const payload: EmailPayload = {
        subject,
        html,
        recipients: testOnly ? recipients.slice(0, 1) : recipients,
        mode: "individual",
        fromName: fromName || undefined,
        cc: cc || undefined,
        bcc: bcc || undefined,
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
      setSuccess(`Email envoyé: sent=${data.sent ?? 0}, failed=${data.failed ?? 0}`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setSending(false);
    }
  };

  if (!recipients || recipients.length === 0) {
    return (
      <main className="px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/apps/leads"><ArrowLeft className="h-4 w-4" /> Retour aux leads</Link>
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Aucune sélection trouvée. Veuillez sélectionner des personnes depuis la page Leads.
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-6">
      <div className="mx-auto max-w-[1200px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <Link href="/apps/leads"><ArrowLeft className="h-4 w-4" /> Leads</Link>
            </Button>
            <div className="hidden md:block w-px h-4 bg-border" />
            <div className="text-sm text-muted-foreground">Composer un email</div>
            <span className="rounded-full border bg-muted px-2 py-0.5 text-xs text-muted-foreground">{recipients.length} destinataire(s)</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/apps/email/templates"><Blocks className="h-4 w-4" /> Templates</Link>
            </Button>
            {connected === false && (
              <Button variant="outline" onClick={() => {
                const state = typeof window !== 'undefined' ? window.location.pathname : '/apps/leads';
                const url = `/api/email/auth?state=${encodeURIComponent(state)}`;
                window.location.href = url;
              }}>Connecter Gmail</Button>
            )}
            <Button variant="outline" onClick={() => setPreviewOpen(true)} disabled={recipients.length === 0}>
              Aperçu
            </Button>
            <Button variant="outline" onClick={() => handleSend(true)} disabled={sending || !connected}>Envoyer un test</Button>
            <Button onClick={() => handleSend(false)} disabled={sending || !connected || recipients.length === 0} className="gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendIcon className="h-4 w-4" />}
              Envoyer
            </Button>
          </div>
        </div>

        {/* Fields Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{`Paramètres de l'email`}</CardTitle>
            <CardDescription>{`Définissez l'objet et l'expéditeur`}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Sujet</label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Sujet de l'email" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">De (nom affiché)</label>
              <Input value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="AIESEC Team" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">CC</label>
              <Input value={cc} onChange={(e) => setCc(e.target.value)} placeholder="email1@example.com, email2@example.com" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">CCI (BCC)</label>
              <Input value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="email1@example.com, email2@example.com" />
            </div>
          </CardContent>
        </Card>

        {/* Variables reminder */}
        <div className="flex items-center gap-2 text-xs px-1">
          <span className="text-muted-foreground">Variables disponibles :</span>
          <div className="flex flex-wrap gap-2">
            {["{{firstName}}", "{{lastName}}", "{{email}}", "{{committee}}"].map((v) => (
              <code
                key={v}
                className="px-2 py-0.5 bg-primary/10 text-primary rounded cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => navigator.clipboard.writeText(v)}
                title="Cliquer pour copier"
              >
                {v}
              </code>
            ))}
          </div>
        </div>

        {/* Editor only */}
        <Card className="h-[85vh]">
          <CardContent className="p-0 h-full">
            <EmailDesigner initialHtml={html} inline onChange={setHtml} />
          </CardContent>
        </Card>

        {/* Preview Modal */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-[900px] w-[95vw] h-[80vh]">
            <DialogHeader>
              <DialogTitle>{`Aperçu de l'email`}</DialogTitle>
            </DialogHeader>
            <div className="h-full flex flex-col overflow-hidden">
              <div className="border-b px-3 py-2 text-xs text-muted-foreground">Exemple avec: {firstRecipient?.email || '—'}</div>
              <div className="p-4 overflow-auto grow bg-background">
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: applyPlaceholders(html) }} />
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-emerald-700">{success}</p>}
      </div>
    </main>
  );
}

export default function ComposeEmailPage() {
  return (
    <Suspense fallback={
      <main className="px-6 py-8">
        <div className="mx-auto max-w-5xl flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    }>
      <ComposeEmailContent />
    </Suspense>
  );
}
