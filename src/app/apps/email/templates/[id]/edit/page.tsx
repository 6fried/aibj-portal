"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Eye, Code, Palette } from "lucide-react";
import Link from "next/link";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism.css";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  description?: string;
}

export default function EditTemplatePage() {
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [editorMode, setEditorMode] = useState<"code" | "visual">("visual");
  const [grapesjsLoading, setGrapesjsLoading] = useState(false);
  const grapesjsContainerRef = useRef<HTMLDivElement>(null);
  const grapesjsEditorRef = useRef<ReturnType<typeof import('grapesjs').default.init> | null>(null);

  // Fetch template
  useEffect(() => {
    if (!templateId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/email/templates/${templateId}`);
        if (!res.ok) throw new Error("Template introuvable");
        const data = await res.json();
        setTemplate(data.template);
        setHtml(data.template.html || "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur");
      } finally {
        setLoading(false);
      }
    })();
  }, [templateId]);

  // Track changes
  useEffect(() => {
    if (template) {
      setHasChanges(html !== template.html);
    }
  }, [html, template]);

  // Save
  const handleSave = useCallback(async () => {
    if (!template) return;
    setSaving(true);
    try {
      const res = await fetch("/api/email/templates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: template.id, html }),
      });
      if (!res.ok) throw new Error("Impossible de sauvegarder");
      const data = await res.json();
      setTemplate(data.template);
      setHasChanges(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }, [template, html]);

  // Keyboard shortcut: Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (hasChanges && !saving) handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hasChanges, saving, handleSave]);

  // Initialize GrapesJS when switching to visual mode
  useEffect(() => {
    // Wait for template to be loaded and visual mode to be active
    if (editorMode !== "visual" || loading || !template) return;
    
    setGrapesjsLoading(true);
    
    // Small delay to ensure the container is mounted
    const timeoutId = setTimeout(() => {
      if (!grapesjsContainerRef.current) {
        setGrapesjsLoading(false);
        return;
      }

      const initGrapesJS = async () => {
        try {
          const grapesjs = (await import("grapesjs")).default;
          // @ts-expect-error - CSS import
          await import("grapesjs/dist/css/grapes.min.css");
          const newsletterPlugin = (await import("grapesjs-preset-newsletter")).default;

          if (grapesjsEditorRef.current) {
            grapesjsEditorRef.current.destroy();
          }

          const editor = grapesjs.init({
            container: grapesjsContainerRef.current!,
            height: "100%",
            width: "100%",
            storageManager: false,
            plugins: [newsletterPlugin],
            pluginsOpts: {
              [newsletterPlugin.toString()]: {},
            },
            canvas: {
              styles: [
                "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
              ],
            },
          });

          // Load existing HTML
          editor.setComponents(html);

          // Sync changes back to state
          editor.on("change:changesCount", () => {
            const newHtml = editor.getHtml() + `<style>${editor.getCss()}</style>`;
            setHtml(newHtml);
          });

          grapesjsEditorRef.current = editor;
        } catch (err) {
          console.error("Failed to init GrapesJS:", err);
        } finally {
          setGrapesjsLoading(false);
        }
      };

      initGrapesJS();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (grapesjsEditorRef.current) {
        grapesjsEditorRef.current.destroy();
        grapesjsEditorRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorMode, loading, template]);

  // Switch to visual mode
  const handleSwitchToVisual = () => {
    setEditorMode("visual");
  };

  // Switch back to code mode (get HTML from GrapesJS first)
  const handleSwitchToCode = () => {
    if (grapesjsEditorRef.current) {
      const editorHtml = grapesjsEditorRef.current.getHtml();
      const editorCss = grapesjsEditorRef.current.getCss();
      const newHtml = editorCss ? `${editorHtml}<style>${editorCss}</style>` : editorHtml;
      setHtml(newHtml);
      // Destroy GrapesJS instance
      grapesjsEditorRef.current.destroy();
      grapesjsEditorRef.current = null;
    }
    setEditorMode("code");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-destructive">{error || "Template introuvable"}</div>
        <Button asChild variant="outline">
          <Link href="/apps/email/templates">Retour aux templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/apps/email/templates">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h1 className="font-semibold text-foreground">{template.name}</h1>
            <p className="text-xs text-muted-foreground">{template.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              Modifications non sauvegardées
            </span>
          )}
          {editorMode === "code" ? (
            <Button
              onClick={handleSwitchToVisual}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Palette className="h-4 w-4" />
              Éditeur visuel
            </Button>
          ) : (
            <Button
              onClick={handleSwitchToCode}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Code className="h-4 w-4" />
              Éditeur code
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            size="sm"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </header>

      {/* Variables reminder bar */}
      <div className="px-4 py-2 border-b bg-muted/20 flex items-center gap-2 text-xs shrink-0">
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

      {/* Content Area */}
      {editorMode === "code" ? (
        // Split View: Code + Preview
        <div key="code-editor" className="flex-1 flex overflow-hidden">
          {/* Left: HTML Editor */}
          <div className="w-1/2 border-r flex flex-col bg-[#fafafa]">
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">HTML</span>
            </div>
            <div className="flex-1 overflow-auto">
              <Editor
                value={html}
                onValueChange={(code) => setHtml(code)}
                highlight={(code) => highlight(code, languages.markup, "markup")}
                padding={16}
                style={{
                  fontFamily: '"Fira Code", "Fira Mono", Consolas, monospace',
                  fontSize: 13,
                  lineHeight: 1.6,
                  minHeight: "100%",
                }}
                textareaClassName="focus:outline-none"
                placeholder="<p>Votre contenu HTML ici...</p>"
              />
            </div>
          </div>

          {/* Right: Live Preview (iframe for style isolation) */}
          <div className="w-1/2 flex flex-col bg-slate-200">
            <div className="px-4 py-2 border-b bg-muted/30 flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Aperçu</span>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-[600px] mx-auto">
                <iframe
                  srcDoc={`
                    <!DOCTYPE html>
                    <html>
                      <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                          body {
                            margin: 0;
                            padding: 0;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            background: #f5f5f5;
                          }
                          .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            background: white;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                          }
                        </style>
                      </head>
                      <body>
                        <div class="email-container">
                          ${html}
                        </div>
                      </body>
                    </html>
                  `}
                  className="w-full bg-transparent border-0 rounded-lg"
                  style={{ minHeight: 500, height: "100%" }}
                  title="Aperçu email"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Full Width: GrapesJS Visual Editor
        <div key="visual-editor" className="flex-1 overflow-hidden relative">
          {grapesjsLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{`Chargement de l'éditeur...`}</p>
              </div>
            </div>
          )}
          <div ref={grapesjsContainerRef} className="h-full w-full" />
        </div>
      )}
    </div>
  );
}
