"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  Calendar,
  Compass,
  Home,
  LogOut,
  Menu,
  Mic,
  Music,
  Search,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api-client";
import { useAuthStore, UserProfile } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, setProfile, reset } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const userProfile = await api.get<UserProfile>("/identity/me");
        setProfile(userProfile);
      } catch {
        // Fallback sync if initial login
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const synced = await api.post<UserProfile>("/identity/sync", {
              full_name:
                user.user_metadata?.full_name ||
                user.email?.split("@")[0] ||
                "Dancer",
              role: user.user_metadata?.role || "student",
            });
            setProfile(synced);
          }
        } catch {
          // If unauthenticated or backend unreachable
        }
      }
    }

    if (!profile) {
      loadProfile();
    }
  }, [profile, setProfile]);

  const handleSignOut = async () => {
    document.cookie = "riyaaz_demo_session=; path=/; max-age=0";
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    reset();
    router.push("/login");
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "Rhythm Lab", href: "/dashboard/rhythm", icon: Music },
    { name: "Mudra Studio", href: "/dashboard/mudras", icon: Sparkles },
    { name: "Bol Trainer", href: "/dashboard/bols", icon: Mic },
    { name: "Kathak Search", href: "/dashboard/search", icon: Search },
  ];

  if (profile?.role === "teacher") {
    navItems.push({ name: "Students", href: "/dashboard/students", icon: Users });
    navItems.push({ name: "Assignments", href: "/dashboard/assignments", icon: BookOpen });
  }

  return (
    <div className="flex min-h-screen bg-[#FDFAF2]">
      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200/80 bg-[#F5F1E1] shadow-md transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-stone-200/60">
          <Link href="/dashboard" className="flex flex-col">
            <span className="font-devanagari text-xs text-gold font-bold tracking-widest uppercase">
              रियाज़
            </span>
            <span className="font-display text-2xl font-bold tracking-wider text-ink">
              RIYAAZ
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-stone-500 hover:text-stone-700 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-ink text-cream shadow-md font-bold scale-[1.02]"
                    : "text-stone-700 hover:bg-amber-100/50 hover:text-ink"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-gold" : "text-stone-500"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer - Role Badge */}
        <div className="p-4 border-t border-stone-200/60">
          <div className="rounded-2xl border border-gold/30 bg-amber-50/80 p-3.5 text-xs text-ink shadow-sm">
            <div className="font-bold capitalize flex items-center justify-between">
              <span>{profile?.role || "Student"} Workspace</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="mt-1 text-[11px] text-stone-600 font-medium">
              Kathak Practice & Riyaaz Portal
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200/80 bg-white/80 px-6 backdrop-blur-md">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-stone-700 hover:text-stone-900 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            {/* User Avatar & Menu */}
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-cream font-display font-bold text-sm shadow-sm border border-gold/30">
                {profile?.full_name?.charAt(0).toUpperCase() || "D"}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-ink">
                  {profile?.full_name || "Kathak Dancer"}
                </div>
                <div className="text-[10px] text-stone-500 font-medium">{profile?.email}</div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-stone-700 hover:text-red-700 border-stone-300 rounded-xl text-xs"
            >
              <LogOut className="h-3.5 w-3.5 md:mr-1.5" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
