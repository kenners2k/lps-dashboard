"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface FplFixture {
  id: number;
  event: number | null;
  team_h_id: number;
  team_a_id: number;
  team_h_score: number | null;
  team_a_score: number | null;
  kickoff_time: string | null;
  finished: boolean;
  started: boolean;
  team_h_short_name?: string;
  team_a_short_name?: string;
  [key: string]: unknown;
}

export function FixturesTab() {
  const [fixtures, setFixtures] = useState<FplFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFixtures() {
      setLoading(true);
      setError(null);
      
      // fetch fixtures with just the needed ids/scores
      const { data: fixturesData, error: fixturesError } = await supabaseBrowser
        .from("fpl_fixtures")
        .select(`
          id,
          event_id,
          team_h_id,
          team_a_id,
          team_h_score,
          team_a_score,
          kickoff_time,
          finished,
          started
        `)
        .order("kickoff_time", { ascending: true });

      if (fixturesError) {
        setError(fixturesError.message);
        setLoading(false);
        return;
      }

      const { data: teamsData, error: teamsError } = await supabaseBrowser
        .from("fpl_teams")
        .select("id, short_name");

      if (teamsError) {
        setError(teamsError.message);
        setLoading(false);
        return;
      }

      const teamMap: Record<number, string> = {};
      if (teamsData) {
        teamsData.forEach((team: any) => {
          teamMap[team.id] = team.short_name;
        });
      }

      const enriched = (fixturesData as any[]).map((f) => ({
        ...f,
        event: f.event_id,
        team_h_short_name: teamMap[f.team_h_id] || `Team ${f.team_h_id}`,
        team_a_short_name: teamMap[f.team_a_id] || `Team ${f.team_a_id}`,
      }));

      setFixtures(enriched);
      setLoading(false);
    }
    fetchFixtures();
  }, []);

  if (loading) return <TableSkeleton />;
  if (error)
    return (
      <p className="text-sm text-destructive-foreground p-4">Error: {error}</p>
    );
  if (fixtures.length === 0)
    return (
      <p className="text-sm text-muted-foreground p-4">No fixtures found.</p>
    );

  return (
    <ScrollArea className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">ID</TableHead>
            <TableHead className="text-center">GW</TableHead>
            <TableHead className="text-right">Home</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead>Away</TableHead>
            <TableHead>Kickoff</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fixtures.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-mono text-muted-foreground">
                {f.id}
              </TableCell>
              <TableCell className="text-center font-mono">
                {f.event ?? "-"}
              </TableCell>
              <TableCell className="text-right font-mono font-medium">
                {f.team_h_short_name || f.team_h_id}
              </TableCell>
              <TableCell className="text-center font-mono">
                {f.team_h_score !== null && f.team_a_score !== null
                  ? `${f.team_h_score} - ${f.team_a_score}`
                  : "- - -"}
              </TableCell>
              <TableCell className="font-mono font-medium">
                {f.team_a_short_name || f.team_a_id}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {f.kickoff_time
                  ? new Date(f.kickoff_time).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "TBD"}
              </TableCell>
              <TableCell className="text-center">
                {f.finished ? (
                  <Badge variant="outline">FT</Badge>
                ) : f.started ? (
                  <Badge>Live</Badge>
                ) : (
                  <Badge variant="secondary">Sched</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  );
}
