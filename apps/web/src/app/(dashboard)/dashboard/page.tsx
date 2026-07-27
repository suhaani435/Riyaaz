"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Compass,
  Music,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardPage() {
  const profile = useAuthStore((state) => state.profile);

  const isTeacher = profile?.role === "teacher";

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 p-6 md:p-8 text-white shadow-xl">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full bg-amber-700/50 px-3 py-1 text-xs font-semibold tracking-wider text-amber-200 uppercase">
            <span>{isTeacher ? "Teacher Portal" : "Student Practice Space"}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Namaste, {profile?.full_name || "Dancer"} 🙏
          </h1>
          <p className="text-amber-100 text-sm md:text-base leading-relaxed">
            {isTeacher
              ? "Manage your Kathak students, assign rhythm practice, and review student performance reports."
              : "Ready for your daily riyaaz? Practice Teentaal, check your hand mudras, or record your bol recitations."}
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            {!isTeacher ? (
              <Button
                asChild
                className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-semibold"
              >
                <Link href="/dashboard/rhythm" className="flex items-center">
                  <span>Start Rhythm Practice</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="bg-amber-500 text-stone-950 hover:bg-amber-400 font-semibold"
              >
                <Link href="/dashboard/students" className="flex items-center">
                  <span>View Student Roster</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Feature Modules Quick Access Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Rhythm Lab */}
        <Card className="border-stone-200 bg-white hover:border-amber-300 transition-all shadow-sm hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-stone-900">
              Rhythm Engine
            </CardTitle>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-800">
              <Music className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-stone-600">
              Interactive metronome & Nagma loops for Teentaal, Jhaptal, and Ektaal practice.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800 pt-2 border-t border-stone-100">
              <span>BPM & Taal Controls</span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px]">
                Phase 2
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Mudra AI */}
        <Card className="border-stone-200 bg-white hover:border-amber-300 transition-all shadow-sm hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-stone-900">
              Mudra Recognition
            </CardTitle>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-800">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-stone-600">
              Real-time MediaPipe hand tracking for Asamyuta and Samyuta Hastas evaluation.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800 pt-2 border-t border-stone-100">
              <span>Vision AI</span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px]">
                Phase 3
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Bol AI */}
        <Card className="border-stone-200 bg-white hover:border-amber-300 transition-all shadow-sm hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold text-stone-900">
              Bol Recognition
            </CardTitle>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-800">
              <Compass className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-stone-600">
              Audio speech capture scoring for Dha Dhin Dhin Dha bol clarity & Laya synchronization.
            </p>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800 pt-2 border-t border-stone-100">
              <span>Whisper AI</span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px]">
                Phase 4
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-Based Overview Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Recent Practice or Submissions */}
        <Card className="border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-stone-900">
              {isTeacher ? "Pending Student Submissions" : "Recent Practice Sessions"}
            </CardTitle>
            <CardDescription className="text-xs text-stone-500">
              {isTeacher
                ? "Video reviews submitted by your registered Kathak students"
                : "Your recent riyaaz activity and rhythm session history"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50/50">
              <Clock className="h-8 w-8 text-stone-400 mb-2" />
              <p className="text-sm font-medium text-stone-700">
                No session data recorded yet
              </p>
              <p className="text-xs text-stone-500 max-w-xs mt-1">
                {isTeacher
                  ? "As students complete practice modules in Phase 2, their session reports will appear here."
                  : "Start a rhythm session in Phase 2 to track your practice history."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Milestones & Stats */}
        <Card className="border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-stone-900">
              Platform Status & Milestones
            </CardTitle>
            <CardDescription className="text-xs text-stone-500">
              RIYAAZ long-term platform development roadmap
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 text-green-900 text-xs">
              <Trophy className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div>
                <span className="font-semibold">Phase 0 Foundation</span> — Architecture, FastAPI Async Engine, PostgreSQL & Next.js complete.
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-amber-50 text-amber-900 text-xs">
              <Users className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-semibold">Phase 1 Auth & User Identity</span> — Active now! Supabase Auth & Role-based Dashboard.
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-lg bg-stone-100 text-stone-700 text-xs">
              <BookOpen className="h-5 w-5 text-stone-400 flex-shrink-0" />
              <div>
                <span className="font-semibold">Phase 2 Rhythm Engine</span> — Next milestone for Taal, BPM, and Nagma loop playback.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
