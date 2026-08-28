"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  ArrowRight,
  Clock,
  Music,
  Search,
  Sparkles,
  Trophy,
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#370A0B] via-[#420A10] to-[#5C141D] p-8 text-cream shadow-2xl border border-gold/20">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none font-devanagari text-[180px] font-bold text-gold">
          रियाज़
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full bg-gold/25 px-3.5 py-1 text-xs font-bold tracking-wider text-amber-200 uppercase border border-gold/40">
            <span className="font-devanagari">रियाज़</span>
            <span>·</span>
            <span>{isTeacher ? "Teacher Portal" : "Student Practice Space"}</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl text-cream">
            Namaste, {profile?.full_name || "Dancer"} 🙏
          </h1>
          <p className="text-amber-100/90 text-sm md:text-base leading-relaxed">
            {isTeacher
              ? "Manage your Kathak students, assign rhythm practice, and review student performance reports."
              : "Ready for your daily riyaaz? Practice Teentaal & Jhaptaal with our rhythm metronome, study hand mudras, or search Kathak compositions."}
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-gold text-[#370A0B] hover:bg-amber-400 font-bold shadow-lg text-sm rounded-xl px-5 py-2.5"
            >
              <Link href="/dashboard/rhythm" className="flex items-center">
                <span>Start Rhythm Practice</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-cream/30 text-cream hover:bg-white/10 font-semibold rounded-xl text-sm px-5 py-2.5"
            >
              <Link href="/dashboard/mudras" className="flex items-center">
                <span>Explore Mudras</span>
                <Sparkles className="ml-2 h-4 w-4 text-gold" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Feature Modules Quick Access Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Rhythm Lab */}
        <Link href="/dashboard/rhythm" className="block group">
          <Card className="border-stone-200/80 bg-white/90 group-hover:border-gold group-hover:shadow-lg transition-all rounded-3xl h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-lg font-bold text-ink">
                Rhythm Lab
              </CardTitle>
              <div className="rounded-xl bg-amber-100 p-2.5 text-amber-900 group-hover:scale-110 transition-transform">
                <Music className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed">
                Interactive Kathak metronome, Web Audio tabla theka clicks, and Laya speed controls.
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-gold pt-2 border-t border-stone-100">
                <span>Open Rhythm Metronome →</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Interactive
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Mudra Studio */}
        <Link href="/dashboard/mudras" className="block group">
          <Card className="border-stone-200/80 bg-white/90 group-hover:border-gold group-hover:shadow-lg transition-all rounded-3xl h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-lg font-bold text-ink">
                Mudra Studio
              </CardTitle>
              <div className="rounded-xl bg-amber-100 p-2.5 text-amber-900 group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed">
                Live webcam studio with full Asamyuta and Samyuta Hastas reference catalog.
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-gold pt-2 border-t border-stone-100">
                <span>Explore Mudra Gallery →</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Interactive
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Kathak Search */}
        <Link href="/dashboard/search" className="block group">
          <Card className="border-stone-200/80 bg-white/90 group-hover:border-gold group-hover:shadow-lg transition-all rounded-3xl h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-lg font-bold text-ink">
                Kathak Search
              </CardTitle>
              <div className="rounded-xl bg-amber-100 p-2.5 text-amber-900 group-hover:scale-110 transition-transform">
                <Search className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed">
                Kathak terminology dictionary and YouTube video timestamp deep-linking.
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-gold pt-2 border-t border-stone-100">
                <span>Search Compositions →</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Interactive
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Overview Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Recent Practice */}
        <Card className="border-stone-200/80 bg-white/90 rounded-3xl p-2">
          <CardHeader>
            <CardTitle className="font-display text-xl font-bold text-ink">
              {isTeacher ? "Pending Student Submissions" : "Recent Practice Sessions"}
            </CardTitle>
            <CardDescription className="text-xs text-stone-500">
              {isTeacher
                ? "Video reviews submitted by your registered Kathak students"
                : "Your daily riyaaz activity and rhythm session tracking"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
              <Clock className="h-8 w-8 text-gold mb-2" />
              <p className="text-sm font-semibold text-ink">
                Ready for practice!
              </p>
              <p className="text-xs text-stone-500 max-w-xs mt-1">
                Head over to the <strong>Rhythm Lab</strong> to start practicing with Teentaal, Jhaptaal, or Ektaal.
              </p>
              <Button asChild size="sm" className="mt-4 bg-ink text-cream hover:bg-ink-deep text-xs rounded-xl">
                <Link href="/dashboard/rhythm">Launch Metronome</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Platform Architecture Status */}
        <Card className="border-stone-200/80 bg-white/90 rounded-3xl p-2">
          <CardHeader>
            <CardTitle className="font-display text-xl font-bold text-ink flex items-center gap-2">
              <Trophy size={18} className="text-gold" />
              <span>Platform Engineering Roadmap</span>
            </CardTitle>
            <CardDescription className="text-xs text-stone-500">
              RIYAAZ multi-year modular architecture & milestone progress
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5">
            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-emerald-50 text-emerald-950 text-xs border border-emerald-200/60 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
              <div>
                <strong className="font-bold">Phase 0 Architecture Foundation</strong>: FastAPI Async Engine, PostgreSQL & Next.js Monorepo.
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-emerald-50 text-emerald-950 text-xs border border-emerald-200/60 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
              <div>
                <strong className="font-bold">Phase 1 Identity & Dashboard</strong>: Supabase Auth, PostgreSQL Users Table, and Route Guards.
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-amber-50 text-amber-950 text-xs border border-gold/40 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-gold flex-shrink-0 animate-pulse" />
              <div>
                <strong className="font-bold">Phase 2 Rhythm Engine & Search</strong>: Interactive Web Audio metronome, Taal catalog & Kathak search studio.
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-stone-100 text-stone-700 text-xs border border-stone-200">
              <span className="h-2 w-2 rounded-full bg-stone-400 flex-shrink-0" />
              <div>
                <strong className="font-bold">Phase 3 & 4 Mudra & Bol AI</strong>: MediaPipe vision pose estimation & Whisper bol speech recognition.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
