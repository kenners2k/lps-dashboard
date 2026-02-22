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

interface FplEvent {
  id: number;
  name: string;
  deadline_time: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
  average_entry_score: number | null;
  highest_score: number | null;
  [key: string]: unknown;
}

export function EventsTab() {
  const [events, setEvents] = useState<FplEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabaseBrowser
        .from("fpl_events")
        .select("*")
        .order("id", { ascending: true });

      if (err) {
        setError(err.message);
      } else {
        setEvents((data as FplEvent[]) ?? []);
      }
      setLoading(false);
    }
    fetchEvents();
  }, []);

  if (loading) return <TableSkeleton />;
  if (error)
    return (
      <p className="text-sm text-destructive-foreground p-4">Error: {error}</p>
    );
  if (events.length === 0)
    return (
      <p className="text-sm text-muted-foreground p-4">No events found.</p>
    );

  return (
    <ScrollArea className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Avg&nbsp;Score</TableHead>
            <TableHead className="text-right">Top&nbsp;Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((ev) => (
            <TableRow key={ev.id}>
              <TableCell className="font-mono text-muted-foreground">
                {ev.id}
              </TableCell>
              <TableCell className="font-medium">{ev.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(ev.deadline_time).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell className="text-center">
                {ev.is_current ? (
                  <Badge>Current</Badge>
                ) : ev.is_next ? (
                  <Badge variant="secondary">Next</Badge>
                ) : ev.finished ? (
                  <Badge variant="outline">Finished</Badge>
                ) : (
                  <Badge variant="outline">Upcoming</Badge>
                )}
              </TableCell>
              <TableCell className="text-right font-mono">
                {ev.average_entry_score ?? "-"}
              </TableCell>
              <TableCell className="text-right font-mono">
                {ev.highest_score ?? "-"}
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
