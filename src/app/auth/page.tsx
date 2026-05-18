"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store/appStore";

function AuthPageContent() {
  const router = useRouter();
  const { isLoggedIn, ready, login, signup } = useAuth();
  const t = useAppStore((s) => s.t);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && isLoggedIn) {
      router.replace("/dashboard");
    }
  }, [ready, isLoggedIn, router]);

  const switchToSignup = () => {
    setMode("signup");
    setError(null);
    setConfirmPassword("");
  };

  const switchToLogin = () => {
    setMode("login");
    setError(null);
    setConfirmPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError(t.passwordsMismatch);
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const result = await login(email, password);
        if (result.ok) {
          router.push("/dashboard");
        } else {
          setError(result.error ?? t.authError);
        }
      } else {
        const result = await signup(name, email, password);
        if (result.ok) {
          router.push("/dashboard");
        } else {
          setError(result.error ?? t.authError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (!ready || isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center grid-bg">
        <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 grid-bg flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo variant="full" href="/" className="max-w-[200px]" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">
            {mode === "login" ? t.loginTitle : t.signupTitle}
          </h1>
          <p className="text-slate-400 text-sm mt-2">{t.authSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-2xl p-6 sm:p-8 space-y-5">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                {t.name}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="bg-slate-900/50 border-cyan-500/20"
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              {t.email}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-slate-900/50 border-cyan-500/20"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300">
              {t.password}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-slate-900/50 border-cyan-500/20"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">
                {t.confirmPassword}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-900/50 border-cyan-500/20"
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 text-center rounded-lg bg-red-500/10 py-2 px-3">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : mode === "login" ? (
              t.login
            ) : (
              t.createAccount
            )}
          </Button>

          <p className="text-center text-sm text-slate-400 pt-1">
            {mode === "login" ? (
              <>
                {t.noAccount}{" "}
                <button
                  type="button"
                  onClick={switchToSignup}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  {t.createOne}
                </button>
              </>
            ) : (
              <>
                {t.haveAccount}{" "}
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                >
                  {t.signIn}
                </button>
              </>
            )}
          </p>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300">
            ← {t.backHome}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
