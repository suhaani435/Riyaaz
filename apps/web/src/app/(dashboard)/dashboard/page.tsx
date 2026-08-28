"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  ArrowRight,
  Clock,
  Mic,
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#370A0B] via-[#420A10] to-[#5C141D] p-8 text-[#F5F1E1] shadow-2xl border border-[#C0912E]/30">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none font-devanagari text-[180px] font-bold text-[#C0912E]">
          रियाज़
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 rounded-full bg-[#C0912E]/25 px-3.5 py-1 text-xs font-bold tracking-wider text-[#E0B454] uppercase border border-[#C0912E]/40">
            <span className="font-devanagari">रियाज़</span>
            <span>·</span>
            <span>{isTeacher ? "Teacher Portal" : "Kathak Practice Sanctuary"}</span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-5xl text-[#F5F1E1]">
            Namaste, {profile?.full_name || "Dancer"} 🙏
          </h1>
          <p className="text-[#E6DFD5] text-sm md:text-base leading-relaxed">
            {isTeacher
              ? "Manage your Kathak disciples, assign rhythmic padhant practice, and review student mudra & bol submissions."
              : "Ready for your daily riyaaz? Practice thekas with the Rhythm metronome, study Hasta Mudras with Vision AI, recite bols, or search Kathak compositions."}
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            <Button
              asChild
              className="bg-[#C0912E] text-[#370A0B] hover:bg-[#D4A53D] font-extrabold shadow-lg text-sm rounded-xl px-5 py-2.5"
            >
              <Link href="/dashboard/rhythm" className="flex items-center">
                <span>Start Rhythm Practice</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-[#F5F1E1]/40 text-[#F5F1E1] hover:bg-white/10 font-bold rounded-xl text-sm px-5 py-2.5"
            >
              <Link href="/dashboard/mudras" className="flex items-center">
                <span>Explore Mudras</span>
                <Sparkles className="ml-2 h-4 w-4 text-[#C0912E]" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Specialized Studio Modules Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Module 1: Rhythm Lab */}
        <Link href="/dashboard/rhythm" className="block group">
          <Card className="border-[#420A10]/15 bg-white group-hover:border-[#C0912E] group-hover:shadow-lg transition-all rounded-3xl h-full flex flex-col justify-between p-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-lg font-bold text-[#420A10]">
                Rhythm Lab
              </CardTitle>
              <div className="rounded-xl bg-[#FFF3E0] p-2.5 text-[#420A10] group-hover:scale-110 transition-transform">
                <Music className="h-5 w-5 text-[#C0912E]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-[#5C3B30] leading-relaxed">
                Circular orbital matra metronome, synthesized theka clicks, Nagma loop, and practice logger.
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-[#C0912E] pt-2 border-t border-stone-100">
                <span>Open Rhythm →</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Interactive
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Module 2: Mudra Studio */}
        <Link href="/dashboard/mudras" className="block group">
          <Card className="border-[#420A10]/15 bg-white group-hover:border-[#C0912E] group-hover:shadow-lg transition-all rounded-3xl h-full flex flex-col justify-between p-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-lg font-bold text-[#420A10]">
                Mudra Studio
              </CardTitle>
              <div className="rounded-xl bg-[#FFF3E0] p-2.5 text-[#420A10] group-hover:scale-110 transition-transform">
                <Sparkles className="h-5 w-5 text-[#C0912E]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-[#5C3B30] leading-relaxed">
                Live MediaPipe vision AI camera with 10-mudra classifier & finger-by-finger biomechanical feedback.
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-[#C0912E] pt-2 border-t border-stone-100">
                <span>Open Studio →</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Vision AI
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Module 3: Bol Trainer */}
        <Link href="/dashboard/bols" className="block group">
          <Card className="border-[#420A10]/15 bg-white group-hover:border-[#C0912E] group-hover:shadow-lg transition-all rounded-3xl h-full flex flex-col justify-between p-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-lg font-bold text-[#420A10]">
                Bol Trainer
              </CardTitle>
              <div className="rounded-xl bg-[#FFF3E0] p-2.5 text-[#420A10] group-hover:scale-110 transition-transform">
                <Mic className="h-5 w-5 text-[#C0912E]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-[#5C3B30] leading-relaxed">
                Kathak composition player, live mic recorder with waveform visualizer & audio quality analysis.
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-[#C0912E] pt-2 border-t border-stone-100">
                <span>Practice Bols →</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Speech AI
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Module 4: Kathak Search */}
        <Link href="/dashboard/search" className="block group">
          <Card className="border-[#420A10]/15 bg-white group-hover:border-[#C0912E] group-hover:shadow-lg transition-all rounded-3xl h-full flex flex-col justify-between p-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="font-display text-lg font-bold text-[#420A10]">
                Kathak Search
              </CardTitle>
              <div className="rounded-xl bg-[#FFF3E0] p-2.5 text-[#420A10] group-hover:scale-110 transition-transform">
                <Search className="h-5 w-5 text-[#C0912E]" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-[#5C3B30] leading-relaxed">
                Search Kathak terminology and jump straight to exact timestamps in master video recordings.
              </p>
              <div className="flex items-center justify-between text-xs font-bold text-[#C0912E] pt-2 border-t border-stone-100">
                <span>Search Compositions →</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Timestamp AI
                </span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Overview Widgets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column: Recent Practice */}
        <Card className="border-[#420A10]/15 bg-white rounded-3xl p-2">
          <CardHeader>
            <CardTitle className="font-display text-xl font-bold text-[#420A10]">
              {isTeacher ? "Pending Student Submissions" : "Daily Practice Session"}
            </CardTitle>
            <CardDescription className="text-xs text-[#6B5B52]">
              {isTeacher
                ? "Video & bol reviews submitted by your registered Kathak students"
                : "Track your riyaaz streaks, rhythm timings, and mudra accuracy"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-[#420A10]/20 rounded-2xl bg-[#FDFAF2]/70">
              <Clock className="h-8 w-8 text-[#C0912E] mb-2" />
              <p className="text-sm font-bold text-[#420A10]">
                Ready for today&apos;s riyaaz!
              </p>
              <p className="text-xs text-[#6B5B52] max-w-xs mt-1">
                Choose between <strong>Rhythm Lab</strong>, <strong>Mudra Studio</strong>, or <strong>Bol Trainer</strong> to begin.
              </p>
              <div className="flex gap-2 mt-4">
                <Button asChild size="sm" className="bg-[#420A10] text-[#F5F1E1] hover:bg-[#370A0B] text-xs font-bold rounded-xl px-4 py-2">
                  <Link href="/dashboard/rhythm">Launch Metronome</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="border-[#C0912E]/40 text-[#420A10] text-xs font-bold rounded-xl px-4 py-2">
                  <Link href="/dashboard/mudras">Open Mudras</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Platform Architecture Status */}
        <Card className="border-[#420A10]/15 bg-white rounded-3xl p-2">
          <CardHeader>
            <CardTitle className="font-display text-xl font-bold text-[#420A10] flex items-center gap-2">
              <Trophy size={18} className="text-[#C0912E]" />
              <span>Unified Platform Capabilities</span>
            </CardTitle>
            <CardDescription className="text-xs text-[#6B5B52]">
              Multi-studio Indian Classical Dance technology stack
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-emerald-50 text-emerald-950 text-xs border border-emerald-200/60 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
              <div>
                <strong className="font-bold">Rhythm Synthesis Engine</strong>: Web Audio API tabla claps, Sam/Taali/Khaali acoustics, and Nagma loop.
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-emerald-50 text-emerald-950 text-xs border border-emerald-200/60 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
              <div>
                <strong className="font-bold">MediaPipe Vision AI Studio</strong>: Real-time hand landmark tracking and 10-mudra neural classifier.
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-emerald-50 text-emerald-950 text-xs border border-emerald-200/60 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
              <div>
                <strong className="font-bold">Bol Speech Recognition</strong>: Microphone audio recorder, waveform analyzer & Sarvam AI STT bridge.
              </div>
            </div>

            <div className="flex items-center space-x-3 p-3 rounded-2xl bg-emerald-50 text-emerald-950 text-xs border border-emerald-200/60 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-600 flex-shrink-0" />
              <div>
                <strong className="font-bold">Kathak Video Search</strong>: YouTube transcript parser, normalized terminology dictionary & deep-linking.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
