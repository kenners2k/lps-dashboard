"use client";

import { CalendarDays, Shield, Trophy } from "lucide-react";
import { Toaster } from "sonner";
import { AdminPanel } from "@/components/admin-panel";
import { EventsTab } from "@/components/events-tab";
import { TeamsTab } from "@/components/teams-tab";
import { FixturesTab } from "@/components/fixtures-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
            <Trophy className="size-5 text-primary" />
            <h1 className="text-lg font-semibold tracking-tight">
              FPL Dashboard
            </h1>
          </div>
        </header>

        <main className="mx-auto max-w-5xl flex flex-col gap-6 px-4 py-6">
          <AdminPanel />

          <Card>
            <CardHeader>
              <CardTitle>Data Explorer</CardTitle>
              <CardDescription>
                Browse events, teams, and fixtures from your Supabase tables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="events">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="events">
                    <CalendarDays className="size-4" />
                    <span className="hidden sm:inline">Events</span>
                    <span className="sm:hidden">Events</span>
                  </TabsTrigger>
                  <TabsTrigger value="teams">
                    <Shield className="size-4" />
                    <span className="hidden sm:inline">Teams</span>
                    <span className="sm:hidden">Teams</span>
                  </TabsTrigger>
                  <TabsTrigger value="fixtures">
                    <Trophy className="size-4" />
                    <span className="hidden sm:inline">Fixtures</span>
                    <span className="sm:hidden">Fixtures</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="events" className="mt-4">
                  <EventsTab />
                </TabsContent>
                <TabsContent value="teams" className="mt-4">
                  <TeamsTab />
                </TabsContent>
                <TabsContent value="fixtures" className="mt-4">
                  <FixturesTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}
