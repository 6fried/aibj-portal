"use client";

import React, { useEffect, useRef } from "react";
import grapesjs from "grapesjs";
import presetNewsletter from "grapesjs-preset-newsletter";

interface EmailDesignerProps {
  initialHtml: string;
  onClose?: (html: string) => void;
  onChange?: (html: string) => void;
  inline?: boolean; // if true, hide top bar and fill container
}

// Very simple wrapper around GrapesJS configured for email/newsletter design
export default function EmailDesigner({ initialHtml, onClose, onChange, inline }: EmailDesignerProps) {
  const editorRef = useRef<ReturnType<typeof grapesjs.init> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = grapesjs.init({
      container: containerRef.current,
      height: inline ? '100%' : 'calc(100vh - 56px)',
      fromElement: false,
      storageManager: false,
      plugins: [presetNewsletter],
      pluginsOpts: {
        [presetNewsletter.toString()]: {},
      },
    });
    editorRef.current = editor;

    // Load initial HTML into canvas
    if (initialHtml && initialHtml.trim()) {
      // If HTML has <style>, keep it as is; GrapesJS can parse HTML+CSS separately
      editor.setComponents(initialHtml);
    } else {
      // Minimal starter block
      editor.setComponents('<table class="container"><tr><td><h1>AIESEC</h1><p>Votre contenu ici...</p></td></tr></table>');
    }

    // Emit changes if requested
    if (onChange) {
      const handler = () => {
        const html = editor.getHtml();
        const css = editor.getCss();
        const combined = css && css.trim()
          ? `<!DOCTYPE html><html><head><meta charSet="utf-8"/><style>${css}</style></head><body>${html}</body></html>`
          : html;
        onChange(combined);
      };
      editor.on('update', handler);
    }

    return () => {
      // Clean up editor instance on unmount
      try {
        if (editor && typeof editor.destroy === 'function') {
          editor.destroy();
        }
      } catch {
        // Ignore cleanup errors
      }
      editorRef.current = null;
    };
  }, [initialHtml, onChange, inline]);

  const handleExport = () => {
    const ed = editorRef.current;
    if (!ed) return;
    const html = ed.getHtml();
    const css = ed.getCss();
    // Combine HTML + CSS (style tag) for email usage
    const combined = css && css.trim()
      ? `<!DOCTYPE html><html><head><meta charSet="utf-8"/><style>${css}</style></head><body>${html}</body></html>`
      : html;
    onClose?.(combined);
  };

  return (
    <div className={inline ? "h-full w-full" : "flex h-[80vh] w-full flex-col"}>
      {!inline && (
        <div className="flex h-14 items-center justify-between border-b bg-card px-3">
          <div className="text-sm text-muted-foreground">Éditeur visuel (GrapesJS)</div>
          <div className="flex items-center gap-2">
            <button
              className="rounded border px-3 py-1.5 text-sm hover:bg-muted"
              onClick={handleExport}
              title="Exporter vers le composer"
            >
              Utiliser ce design
            </button>
          </div>
        </div>
      )}
      <div ref={containerRef} className={inline ? "h-full" : "flex-1"} />
    </div>
  );
}
