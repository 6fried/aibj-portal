"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

export default function EmailSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { show } = useToast();

  const refreshStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/email/status", { cache: "no-store" });
      const json = await res.json();
      setConnected(!!json.connected);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleDisconnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/email/disconnect", { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to disconnect");
      }
      const j = await res.json().catch(() => ({ ok: true }));
      await refreshStatus();
      show({
        title: "Compte Gmail déconnecté",
        description: j.revoked ? "Le token Google a été révoqué." : "Déconnexion locale effectuée.",
        variant: "success",
      });
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : "Failed to disconnect";
      setError(errorMsg);
      show({
        title: "Échec de la déconnexion",
        description: errorMsg || "Veuillez réessayer.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const connectUrl = "/api/email/auth?state=" + encodeURIComponent("/settings/email");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Paramètres · Email</h1>
          <p className="text-sm text-muted-foreground">{`Gérer la connexion Gmail utilisée pour l'envoi des emails.`}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Mail className="h-4 w-4 text-primary" />
              </span>
              Connexion Gmail
            </CardTitle>
            <CardDescription>Connectez votre compte Google pour envoyer des emails depuis votre adresse principale.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Statut</p>
                <p className="text-sm text-muted-foreground">
                  {loading ? "Chargement..." : connected ? "Connecté à Gmail" : "Non connecté"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!connected ? (
                  <Button asChild disabled={loading} variant="default">
                    <Link href={connectUrl}>Connecter Gmail</Link>
                  </Button>
                ) : (
                  <Button onClick={handleDisconnect} variant="outline" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Déconnecter
                  </Button>
                )}
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
