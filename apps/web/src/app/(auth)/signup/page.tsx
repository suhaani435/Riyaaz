"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Sparkles } from "lucide-react";

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
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
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
    setSuccessInfo(null);

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

      // Always set the profile in the client store
      setProfile({
        id: authData.user?.id || "demo-user-id",
        email: data.email,
        full_name: data.fullName,
        role: data.role,
        avatar_url: null,
      });

      // Attempt to sync to backend
      try {
        await api.post<UserProfile>("/identity/sync", {
          full_name: data.fullName,
          role: data.role,
        });
      } catch {
        // Fallback sync
      }

      if (authData.session) {
        router.push("/dashboard");
      } else {
        setSuccessInfo(
          "Account created successfully! You can now enter your dashboard directly.",
        );
      }
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : "An error occurred during registration",
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
            Create your account
          </CardTitle>
          <CardDescription className="text-xs text-[#6B5B52]">
            Join RIYAAZ to start structured Kathak learning & practice
          </CardDescription>
        </CardHeader>

        {successInfo ? (
          <CardContent className="space-y-4 text-center py-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-semibold text-[#420A10]">{successInfo}</p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-[#420A10] text-[#F5F1E1] hover:bg-[#370A0B] font-bold py-2.5 rounded-xl mt-4"
            >
              Proceed to Dashboard →
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {authError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  {authError}
                </div>
              )}

              {/* Role Toggle Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#420A10]">
                  I am joining as a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue("role", "student")}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 text-sm font-medium transition-all ${
                      selectedRole === "student"
                        ? "border-[#C0912E] bg-[#FFF8E1] text-[#420A10] shadow-sm font-bold ring-2 ring-[#C0912E]/30"
                        : "border-stone-200 bg-white text-[#6B5B52] hover:border-stone-300"
                    }`}
                  >
                    <span className="font-bold">Student</span>
                    <span className="text-[11px] text-[#6B5B52]">Practice Kathak</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValue("role", "teacher")}
                    className={`flex flex-col items-center justify-center rounded-xl border p-3 text-sm font-medium transition-all ${
                      selectedRole === "teacher"
                        ? "border-[#C0912E] bg-[#FFF8E1] text-[#420A10] shadow-sm font-bold ring-2 ring-[#C0912E]/30"
                        : "border-stone-200 bg-white text-[#6B5B52] hover:border-stone-300"
                    }`}
                  >
                    <span className="font-bold">Teacher</span>
                    <span className="text-[11px] text-[#6B5B52]">Guide & Review</span>
                  </button>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="fullName"
                  className="text-xs font-bold text-[#420A10]"
                >
                  Full Name
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Suhaani Sharma"
                  {...register("fullName")}
                  className="border-stone-300 focus-visible:ring-[#C0912E] rounded-xl text-sm"
                />
                {errors.fullName && (
                  <p className="text-xs text-red-600">{errors.fullName.message}</p>
                )}
              </div>

              {/* Email Field */}
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
                  placeholder="student@example.com"
                  {...register("email")}
                  className="border-stone-300 focus-visible:ring-[#C0912E] rounded-xl text-sm"
                />
                {errors.email && (
                  <p className="text-xs text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
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
                {isSubmitting ? "Creating account..." : "Sign Up"}
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
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#C0912E] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
