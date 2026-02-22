"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

type EventRow = { id: number; name: string; deadline_time: string | null; is_current: boolean; is_next: boolean; finished: boolean };
type TeamRow = { id: number; name: string; short_name: string };
type FixRow = { id: number; event_id: number | null; kickoff_time: string | null; team_h_id: number; team_a_id: number; team_h_score: number | null; team_a_score: number | null; finished: boolean };

export default function Page() {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<string>("");

  const [events, setEvents] = useState<EventRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [fixtures, setFixtures] = useState<FixRow[]>([]);

  async function loadAll() {
    setStatus("Loading from Supabase…");

    const ev = await supabaseBrowser.from("fpl_events").select("*").order("id");
    if (ev.error) return setStatus(`Events error: ${ev.error.message}`);
    setEvents(ev.data as any);

    const tm = await supabaseBrowser.from("fpl_teams").select("*").order("id");
    if (tm.error) return setStatus(`Teams error: ${tm.error.message}`);
    setTeams(tm.data as any);

    const fx = await supabaseBrowser.from("fpl_fixtures").select("*").order("kickoff_time", { ascending: true, nullsFirst: false }).limit(50);
    if (fx.error) return setStatus(`Fixtures error: ${fx.error.message}`);
    setFixtures(fx.data as any);

    setStatus(`Loaded: events=${ev.data?.length ?? 0}, teams=${tm.data?.length ?? 0}, fixtures(shown)=${fx.data?.length ?? 0}`);
  }

  async function refresh(path: string) {
    setStatus(`Refreshing ${path}…`);
    const res = await fetch(path, {
      method: "POST",
      headers: { "x-admin-secret": secret },
    });
    const text = await res.text();
    setStatus(`Refresh response (${res.status}): ${text}`);
    await loadAll();
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <main style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700 }}>LPS Dashboard (FPL Source Tables)</h1>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ccc", borderRadius: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <label>Admin secret:</label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="x-admin-secret"
            style={{ padding: 8, border: "1px solid #aaa", borderRadius: 6, minWidth: 260 }}
          />
          <button onClick={() => refresh("/api/lps/refresh/events-teams")} style={{ padding: "8px 12px" }}>
            Refresh Events+Teams
          </button>
          <button onClick={() => refresh("/api/lps/refresh/fixtures")} style={{ padding: "8px 12px" }}>
            Refresh Fixtures
          </button>
          <button
            onClick={async () => {
              await refresh("/api/lps/refresh/events-teams");
              await refresh("/api/lps/refresh/fixtures");
            }}
            style={{ padding: "8px 12px" }}
          >
            Refresh All
          </button>
        </div>

        <p style={{ marginTop: 10, color: "#444" }}>{status}</p>
      </div>

      <section style={{ marginTop: 24 }}>
        <h2>Events (top 10)</h2>
        <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 8, overflowX: "auto" }}>
          {JSON.stringify(events.slice(0, 10), null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Teams</h2>
        <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 8, overflowX: "auto" }}>
          {JSON.stringify(teams, null, 2)}
        </pre>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Fixtures (first 50 by kickoff_time)</h2>
        <pre style={{ background: "#f6f6f6", padding: 12, borderRadius: 8, overflowX: "auto" }}>
          {JSON.stringify(fixtures, null, 2)}
        </pre>
      </section>
    </main>
  );
}