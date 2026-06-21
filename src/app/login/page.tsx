"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn.email({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Login gagal");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream/30 px-5">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-7 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/logo.jpg"
            alt="Logo"
            width={56}
            height={56}
            unoptimized
            className="h-14 w-14 rounded-full object-cover"
          />
          <h1 className="mt-4 text-xl font-semibold">Masuk Admin</h1>
          <p className="mt-1 text-sm text-muted">Panel pengelola</p>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border bg-white px-3 py-2.5 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand px-4 py-3 font-medium text-brand-fg transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
