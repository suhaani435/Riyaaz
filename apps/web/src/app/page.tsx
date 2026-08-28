"use client";

import Link from "next/link";
import {
  ArrowRight,
  Music,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFAF2] text-[#420A10] selection:bg-[#C0912E]/30 selection:text-[#420A10]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#420A10]/15 bg-[#F5F1E1]/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="font-devanagari text-2xl font-bold text-[#C0912E]">
              रियाज़
            </div>
            <div className="h-4 w-px bg-[#420A10]/20" />
            <div className="font-display text-xl font-bold tracking-widest text-[#420A10]">
              RIYAAZ
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Button
              asChild
              variant="ghost"
              className="text-[#420A10] hover:text-[#370A0B] hover:bg-[#420A10]/10 text-xs font-bold"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-[#420A10] text-[#F5F1E1] hover:bg-[#370A0B] text-xs font-bold rounded-xl shadow-md px-4 py-2"
            >
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center space-x-2 rounded-full border border-[#C0912E]/40 bg-[#FFF8E1] px-4 py-1.5 text-xs font-bold text-[#420A10] shadow-sm mb-6">
            <Sparkles size={13} className="text-[#C0912E]" />
            <span className="font-devanagari">शास्त्रीय कथक साधना</span>
            <span>·</span>
            <span>Intelligent Kathak Practice Platform</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#420A10] leading-[1.15]">
            Practice Kathak with{" "}
            <span className="text-[#C0912E] italic underline decoration-[#C0912E]/40 decoration-wavy underline-offset-8">
              Intention
            </span>{" "}
            & Precision.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-[#5C3B30] leading-relaxed font-body">
            RIYAAZ is a dedicated digital sanctuary for Kathak dancers and gurus.
            Master your <strong>Laya</strong> with high-precision metronomes, explore 
            <strong> Hasta Mudras</strong>, and discover classical compositions with 
            timestamped video mastery.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              className="bg-[#420A10] text-[#F5F1E1] hover:bg-[#370A0B] font-bold text-sm rounded-2xl px-7 py-3.5 shadow-xl hover:scale-105 transition-all"
            >
              <Link href="/dashboard" className="flex items-center">
                <span>Enter Practice Studio</span>
                <ArrowRight className="ml-2 h-4 w-4 text-[#C0912E]" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-[#420A10]/30 bg-white text-[#420A10] hover:bg-[#FFF8E1] font-bold text-sm rounded-2xl px-6 py-3.5 shadow-sm"
            >
              <Link href="/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="px-6 py-16 bg-[#F5F1E1]/70 border-y border-[#420A10]/15">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <span className="font-devanagari text-[#C0912E] text-base font-bold">
              मंच एवं तकनीक
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-[#420A10] mt-1">
              Engineered for Classical Rigor
            </h2>
            <p className="text-[#6B5B52] text-sm mt-2 max-w-xl mx-auto">
              Built on clean architecture with Web Audio synthesis, vision AI, and structured Kathak ontology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Rhythm Lab */}
            <div className="rounded-3xl border border-[#420A10]/15 bg-white p-6 shadow-sm hover:shadow-xl hover:border-[#C0912E] transition-all flex flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3E0] text-[#420A10] shadow-sm">
                  <Music className="h-5 w-5 text-[#C0912E]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#420A10] mb-2">
                  Rhythm Lab
                </h3>
                <p className="text-[#5C3B30] text-xs leading-relaxed">
                  Orbital matra metronome calibrated for Teentaal, Jhaptaal, and Ektaal with synthesized tabla clicks and Laya presets.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#C0912E]">
                <span>Metronome</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Interactive
                </span>
              </div>
            </div>

            {/* Card 2: Mudra Studio */}
            <div className="rounded-3xl border border-[#420A10]/15 bg-white p-6 shadow-sm hover:shadow-xl hover:border-[#C0912E] transition-all flex flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3E0] text-[#420A10] shadow-sm">
                  <Sparkles className="h-5 w-5 text-[#C0912E]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#420A10] mb-2">
                  Mudra Studio
                </h3>
                <p className="text-[#5C3B30] text-xs leading-relaxed">
                  Real MediaPipe Vision AI hand tracking for 10 Abhinaya Darpana mudras with finger-by-finger biomechanical correction.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#C0912E]">
                <span>Vision AI</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Live
                </span>
              </div>
            </div>

            {/* Card 3: Bol Trainer */}
            <div className="rounded-3xl border border-[#420A10]/15 bg-white p-6 shadow-sm hover:shadow-xl hover:border-[#C0912E] transition-all flex flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3E0] text-[#420A10] shadow-sm">
                  <Zap className="h-5 w-5 text-[#C0912E]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#420A10] mb-2">
                  Bol Trainer
                </h3>
                <p className="text-[#5C3B30] text-xs leading-relaxed">
                  Kathak composition player, live mic recorder with waveform visualizer & Sarvam AI bol speech recognition.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#C0912E]">
                <span>Speech AI</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Live
                </span>
              </div>
            </div>

            {/* Card 4: Kathak Search */}
            <div className="rounded-3xl border border-[#420A10]/15 bg-white p-6 shadow-sm hover:shadow-xl hover:border-[#C0912E] transition-all flex flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3E0] text-[#420A10] shadow-sm">
                  <Search className="h-6 w-6 text-[#C0912E]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#420A10] mb-2">
                  Kathak Search
                </h3>
                <p className="text-[#5C3B30] text-xs leading-relaxed">
                  Search terminology across classical compositions and jump straight to the exact second where masters perform them.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#C0912E]">
                <span>Deep Links</span>
                <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                  Live
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Production Architecture Credibility Banner */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-[#370A0B] to-[#420A10] p-8 md:p-10 shadow-2xl border border-[#C0912E]/40 text-[#F5F1E1]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 text-xs font-bold text-[#E0B454] uppercase tracking-wider">
                <Zap size={14} className="text-[#C0912E]" />
                <span>Long-Term Production Architecture</span>
              </div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-[#F5F1E1]">
                Built to Scale for Tens of Thousands of Dancers
              </h3>
              <p className="text-xs md:text-sm text-[#E6DFD5] max-w-xl leading-relaxed">
                FastAPI Clean Architecture, PostgreSQL Async ORM, Supabase Auth, Web Audio API, and Next.js 16 SSR.
              </p>
            </div>

            <Button
              asChild
              className="bg-[#C0912E] text-[#370A0B] hover:bg-[#D4A53D] font-extrabold text-sm rounded-xl px-6 py-3 shadow-lg flex-shrink-0"
            >
              <Link href="/dashboard">Launch Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#420A10]/15 bg-[#F5F1E1] px-6 py-8 text-center text-xs text-[#5C3B30]">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-devanagari text-[#C0912E] font-bold text-sm">रियाज़</span>
            <span>·</span>
            <span className="font-display font-bold text-[#420A10]">RIYAAZ © 2026</span>
          </div>
          <p className="text-[#6B5B52]">
            Dedicated to the preservation and structured practice of Indian Classical Dance.
          </p>
        </div>
      </footer>
    </div>
  );
}
