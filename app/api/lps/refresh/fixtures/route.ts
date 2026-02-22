import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase";

const FIXTURES = "https://fantasy.premierleague.com/api/fixtures/";

function assertAdmin(req: Request) {
  const secret = req.headers.get("x-admin-secret");
  if (!secret || secret !== process.env.ADMIN_REFRESH_SECRET) {
    throw new Error("Unauthorized");
  }
}

export async function POST(req: Request) {
  try {
    assertAdmin(req);

    const r = await fetch(FIXTURES, { cache: "no-store" });
    if (!r.ok) throw new Error(`FPL fixtures failed: ${r.status}`);

    const fixtures = await r.json();
    if (!Array.isArray(fixtures)) throw new Error("Unexpected fixtures response (not an array)");

    const rows = fixtures.map((f: any) => ({
      id: f.id,
      event_id: f.event ?? null,
      kickoff_time: f.kickoff_time ?? null,
      team_h_id: f.team_h,
      team_a_id: f.team_a,
      team_h_score: f.team_h_score ?? null,
      team_a_score: f.team_a_score ?? null,
      finished: !!f.finished,
      started: !!f.started,
      provisional_start_time: !!f.provisional_start_time,
      minutes: f.minutes ?? null,
      code: f.code ?? null,
      updated_at: new Date().toISOString(),
    }));

    // Upsert in chunks (safer)
    const supabase = supabaseService();
    const chunkSize = 500;
    let upserted = 0;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const res = await supabase.from("fpl_fixtures").upsert(chunk);
      if (res.error) throw res.error;
      upserted += chunk.length;
    }

    return NextResponse.json({ ok: true, fixtures: upserted });
  } catch (err: any) {
    const msg = err?.message ?? "Unknown error";
    const status = msg === "Unauthorized" ? 401 : 500;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}