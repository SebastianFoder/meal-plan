"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-white">Meal Planner</h1>
        <p className="text-sm text-zinc-400">Sign in with Google to access your timeline.</p>
        <Button className="w-full" onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
          Continue with Google
        </Button>
      </Card>
    </main>
  );
}
