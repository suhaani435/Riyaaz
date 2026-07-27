"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
        // Fetch or sync user profile from FastAPI backend
        try {
          const profile = await api.get<UserProfile>("/identity/me");
          setProfile(profile);
        } catch {
          // If profile sync needed
          const syncedProfile = await api.post<UserProfile>("/identity/sync", {
            full_name: data.email.split("@")[0],
            role: "student",
          });
          setProfile(syncedProfile);
        }

        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "An error occurred during sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fffaf5] px-4 py-12">
      <Card className="w-full max-w-md border-stone-200 bg-white/80 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <p className="text-xs font-semibold tracking-[0.2em] text-amber-800 uppercase">
            RIYAAZ
          </p>
          <CardTitle className="text-2xl font-bold tracking-tight text-stone-900">
            Welcome back
          </CardTitle>
          <CardDescription className="text-stone-600">
            Sign in to continue your Kathak practice journey
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {authError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {authError}
              </div>
            )}

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-stone-700"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="student@example.com"
                {...register("email")}
                className="border-stone-300 focus-visible:ring-amber-500"
              />
              {errors.email && (
                <p className="text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-stone-700"
                >
                  Password
                </label>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="border-stone-300 focus-visible:ring-amber-500"
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
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 rounded-md transition-colors"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-center text-sm text-stone-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-amber-700 hover:underline"
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
