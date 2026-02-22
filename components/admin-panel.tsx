"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function AdminPanel() {
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loadingEndpoint, setLoadingEndpoint] = useState<string | null>(null);

  async function handleRefresh(endpoint: string, label: string) {
    if (!secret.trim()) {
      toast.error("Please enter the admin secret first.");
      return;
    }

    setLoadingEndpoint(endpoint);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "x-admin-secret": secret },
      });

      if (res.ok) {
        toast.success(`${label} refreshed successfully.`);
      } else {
        const body = await res.text();
        toast.error(`Failed to refresh ${label}: ${body || res.statusText}`);
      }
    } catch (err) {
      toast.error(
        `Network error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setLoadingEndpoint(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-muted-foreground" />
          <CardTitle>Admin Controls</CardTitle>
        </div>
        <CardDescription>
          Enter your admin secret to trigger data refreshes from the FPL API.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="relative">
          <Input
            type={showSecret ? "text" : "password"}
            placeholder="Admin secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="pr-10"
            aria-label="Admin secret"
          />
          <button
            type="button"
            onClick={() => setShowSecret((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showSecret ? "Hide secret" : "Show secret"}
          >
            {showSecret ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1"
            disabled={loadingEndpoint !== null}
            onClick={() =>
              handleRefresh(
                "/api/lps/refresh/events-teams",
                "Events & Teams"
              )
            }
          >
            {loadingEndpoint === "/api/lps/refresh/events-teams" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            <span>Refresh Events &amp; Teams</span>
          </Button>

          <Button
            variant="outline"
            className="flex-1"
            disabled={loadingEndpoint !== null}
            onClick={() =>
              handleRefresh("/api/lps/refresh/fixtures", "Fixtures")
            }
          >
            {loadingEndpoint === "/api/lps/refresh/fixtures" ? (
              <Loader2 className="animate-spin" />
            ) : (
              <RefreshCw />
            )}
            <span>Refresh Fixtures</span>
          </Button>
        </div>

        {secret.trim() && (
          <Badge variant="secondary" className="self-start">
            Secret set
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
