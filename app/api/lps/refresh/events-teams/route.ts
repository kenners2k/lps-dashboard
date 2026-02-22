import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

const BOOTSTRAP = "https://fantasy.premierleague.com/api/bootstrap-static/";

function assertAdmin(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_REFRESH_SECRET) {
    throw new Error("Unauthorized");
  }
}

export async function POST(req: Request) {
  try {
    assertAdmin(req);

    const r = await fetch(BOOTSTRAP, { cache: "no-store" });
    if (!r.ok) throw new Error(`FPL bootstrap failed: ${r.status}`);
    const json = await r.json();

    const events = (json.events ?? []).map((e: any) => ({
      id: e.id,
      name: e.name,
      deadline_time: e.deadline_time,
      is_current: e.is_current,
      is_next: e.is_next,
      finished: e.finished,
      data_checked: e.data_checked,
      average_entry_score: e.average_entry_score,
      highest_score: e.highest_score,
      updated_at: new Date().toISOString(),
    }));

    const teams = (json.teams ?? []).map((t: any) => ({
      id: t.id,
      name: t.name,
      short_name: t.short_name,
      code: t.code,
      updated_at: new Date().toISOString(),
    }));

    const supabase = supabaseService();

    const evRes = await supabase.from("fpl_events").upsert(events);
    if (evRes.error) throw evRes.error;

    const tmRes = await supabase.from("fpl_teams").upsert(teams);
    if (tmRes.error) throw tmRes.error;

    return NextResponse.json({ ok: true, events: events.length, teams: teams.length });
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}