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
  Music,
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
                user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
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
    const supabase = createClient();
    await supabase.auth.signOut();
    reset();
    router.push("/login");
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "Rhythm Lab", href: "/dashboard/rhythm", icon: Music },
    { name: "Mudra Guide", href: "/dashboard/mudras", icon: Sparkles },
    { name: "Bol Practice", href: "/dashboard/bols", icon: Compass },
    { name: "History", href: "/dashboard/history", icon: Calendar },
  ];

  if (profile?.role === "teacher") {
    navItems.push({ name: "Students", href: "/dashboard/students", icon: Users });
    navItems.push({ name: "Assignments", href: "/dashboard/assignments", icon: BookOpen });
  }

  return (
    <div className="flex min-h-screen bg-[#fffaf5]">
      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-stone-200 bg-white shadow-sm transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-stone-100">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-widest text-amber-900">
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
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-amber-100/70 text-amber-900 shadow-sm font-semibold"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "text-amber-700" : "text-stone-400"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer - Role Badge */}
        <div className="p-4 border-t border-stone-100">
          <div className="rounded-lg bg-amber-50/80 p-3 text-xs text-amber-900">
            <div className="font-semibold capitalize">
              Role: {profile?.role || "Student"}
            </div>
            <div className="mt-0.5 text-amber-700">Kathak Practice Workspace</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/80 px-6 backdrop-blur-md">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-stone-600 hover:text-stone-900 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            {/* User Avatar & Menu */}
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-200 text-amber-900 font-bold text-sm">
                {profile?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-stone-900">
                  {profile?.full_name || "User"}
                </div>
                <div className="text-xs text-stone-500">{profile?.email}</div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-stone-600 hover:text-red-700 border-stone-300"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
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
