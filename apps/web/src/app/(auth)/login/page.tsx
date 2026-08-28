"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api-client";
import { useAuthStore, UserProfile } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setProfile = useAuthStore((state) => state.setProfile);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setAuthError(error.message);
        setIsSubmitting(false);
        return;
      }

      if (authData.user) {
        setProfile({
          id: authData.user.id,
          email: authData.user.email || data.email,
          full_name:
            authData.user.user_metadata?.full_name ||
            data.email.split("@")[0] ||
            "Kathak Dancer",
          role: authData.user.user_metadata?.role || "student",
          avatar_url: null,
        });

        try {
          const syncedProfile = await api.get<UserProfile>("/identity/me");
          setProfile(syncedProfile);
        } catch {
          // Fallback sync
        }

        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : "Invalid credentials or login error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = (role: "student" | "teacher") => {
    setProfile({
      id: role === "student" ? "demo-student-id" : "demo-teacher-id",
      email: role === "student" ? "student@riyaaz.app" : "guru@riyaaz.app",
      full_name: role === "student" ? "Suhaani Sharma" : "Pandit Birju Maharaj",
      role: role,
      avatar_url: null,
    });
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FDFAF2] px-4 py-12">
      <Card className="w-full max-w-md border-[#420A10]/15 bg-white/95 shadow-xl backdrop-blur-sm rounded-3xl p-2">
        <CardHeader className="space-y-1 text-center">
          <div className="font-devanagari text-base font-bold text-[#C0912E]">
            रियाज़
          </div>
          <CardTitle className="font-display text-2xl font-bold tracking-tight text-[#420A10]">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-xs text-[#6B5B52]">
            Sign in to continue your daily Kathak riyaaz
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {authError && (
              <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {authError}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-bold text-[#420A10]"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="dancer@example.com"
                {...register("email")}
                className="border-stone-300 focus-visible:ring-[#C0912E] rounded-xl text-sm"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-bold text-[#420A10]"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="border-stone-300 focus-visible:ring-[#C0912E] rounded-xl text-sm"
              />
              {errors.password && (
                <p className="text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#420A10] hover:bg-[#370A0B] text-[#F5F1E1] font-bold py-2.5 rounded-xl transition-all shadow-md"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            {/* Quick Demo Access Bar */}
            <div className="w-full pt-2 border-t border-stone-200 text-center">
              <p className="text-[11px] font-bold text-[#C0912E] uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                <Sparkles size={12} />
                <span>Instant Judge Demo Access</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDemoAccess("student")}
                  className="text-xs font-bold border-[#C0912E]/40 hover:bg-[#FFF8E1] rounded-xl text-[#420A10]"
                >
                  Enter as Student
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDemoAccess("teacher")}
                  className="text-xs font-bold border-[#C0912E]/40 hover:bg-[#FFF8E1] rounded-xl text-[#420A10]"
                >
                  Enter as Teacher
                </Button>
              </div>
            </div>

            <p className="text-center text-xs text-[#6B5B52]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-bold text-[#C0912E] hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
