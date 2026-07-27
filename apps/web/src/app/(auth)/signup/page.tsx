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

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "teacher"]),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const setProfile = useAuthStore((state) => state.setProfile);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "student",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: data.role,
          },
        },
      });

      if (error) {
        setAuthError(error.message);
        setIsSubmitting(false);
        return;
      }

      if (authData.user) {
        // Synchronize new user profile to FastAPI backend
        try {
          const syncedProfile = await api.post<UserProfile>("/identity/sync", {
            full_name: data.fullName,
            role: data.role,
          });
          setProfile(syncedProfile);
        } catch {
          // If sync endpoint succeeds or falls back
        }

        router.push("/dashboard");
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "An error occurred during registration");
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
            Create an account
          </CardTitle>
          <CardDescription className="text-stone-600">
            Join RIYAAZ to start structured Kathak learning & practice
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
              <label className="text-sm font-medium text-stone-700">
                I am joining as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue("role", "student")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-sm font-medium transition-all ${
                    selectedRole === "student"
                      ? "border-amber-600 bg-amber-50 text-amber-900 shadow-sm"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <span className="font-semibold">Student</span>
                  <span className="text-xs text-stone-500">Practice Kathak</span>
                </button>

                <button
                  type="button"
                  onClick={() => setValue("role", "teacher")}
                  className={`flex flex-col items-center justify-center rounded-lg border p-3 text-sm font-medium transition-all ${
                    selectedRole === "teacher"
                      ? "border-amber-600 bg-amber-50 text-amber-900 shadow-sm"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <span className="font-semibold">Teacher</span>
                  <span className="text-xs text-stone-500">Guide & Review</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-stone-700"
              >
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="Suhaani Sharma"
                {...register("fullName")}
                className="border-stone-300 focus-visible:ring-amber-500"
              />
              {errors.fullName && (
                <p className="text-xs text-red-600">{errors.fullName.message}</p>
              )}
            </div>

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
              <label
                htmlFor="password"
                className="text-sm font-medium text-stone-700"
              >
                Password
              </label>
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
              {isSubmitting ? "Creating account..." : "Sign Up"}
            </Button>

            <p className="text-center text-sm text-stone-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-amber-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
