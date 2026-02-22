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

interface FplTeam {
  id: number;
  name: string;
  short_name: string;
  strength: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
  [key: string]: unknown;
}

export function TeamsTab() {
  const [teams, setTeams] = useState<FplTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTeams() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabaseBrowser
        .from("fpl_teams")
        .select("*")
        .order("name", { ascending: true });

      if (err) {
        setError(err.message);
      } else {
        setTeams((data as FplTeam[]) ?? []);
      }
      setLoading(false);
    }
    fetchTeams();
  }, []);

  if (loading) return <TableSkeleton />;
  if (error)
    return (
      <p className="text-sm text-destructive-foreground p-4">Error: {error}</p>
    );
  if (teams.length === 0)
    return (
      <p className="text-sm text-muted-foreground p-4">No teams found.</p>
    );

  return (
    <ScrollArea className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">ID</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="w-16 text-center">Code</TableHead>
            <TableHead className="text-center">Strength</TableHead>
            <TableHead className="text-right">ATK&nbsp;H</TableHead>
            <TableHead className="text-right">ATK&nbsp;A</TableHead>
            <TableHead className="text-right">DEF&nbsp;H</TableHead>
            <TableHead className="text-right">DEF&nbsp;A</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-mono text-muted-foreground">
                {t.id}
              </TableCell>
              <TableCell className="font-medium">{t.name}</TableCell>
              <TableCell className="text-center">
                <Badge variant="outline">{t.short_name}</Badge>
              </TableCell>
              <TableCell className="text-center font-mono">
                {t.strength}
              </TableCell>
              <TableCell className="text-right font-mono">
                {t.strength_attack_home}
              </TableCell>
              <TableCell className="text-right font-mono">
                {t.strength_attack_away}
              </TableCell>
              <TableCell className="text-right font-mono">
                {t.strength_defence_home}
              </TableCell>
              <TableCell className="text-right font-mono">
                {t.strength_defence_away}
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
