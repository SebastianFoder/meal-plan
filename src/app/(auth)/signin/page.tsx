"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function SignInPage() {
  const [signingIn, setSigningIn] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold text-white">Meal Planner</h1>
        <p className="text-sm text-zinc-400">Sign in with Google to access your timeline.</p>
        <Button
          className="w-full gap-2"
          disabled={signingIn}
          type="button"
          onClick={async () => {
            setSigningIn(true);
            try {
              await signIn("google", { callbackUrl: "/dashboard" });
            } finally {
              setSigningIn(false);
            }
          }}
        >
          {signingIn ? <Spinner size="sm" tone="on-light" /> : null}
          {signingIn ? "Continuing…" : "Continue with Google"}
        </Button>
      </Card>
    </main>
  );
}
