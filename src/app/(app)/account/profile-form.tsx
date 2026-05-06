"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/client-api";
import { useUpdateAccountMutation } from "@/features/account/client/mutations";

type ProfileFormProps = {
  initialName: string | null;
  email: string | null;
};

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const [name, setName] = useState(() => initialName ?? "");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const updateMutation = useUpdateAccountMutation();

  const trimmed = name.trim();
  const canSubmit =
    trimmed.length > 0 && trimmed.length <= 80 && !updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) {
      setSubmitError("Name is required.");
      return;
    }
    setSubmitError(null);
    try {
      await updateMutation.mutateAsync({ name: trimmed });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Network error. Try again.");
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="text-sm text-zinc-400">Update how your name appears in the app.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {submitError ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {submitError}
          </p>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="account-name" className="text-sm font-medium text-zinc-200">
            Display name
          </label>
          <Input
            id="account-name"
            value={name}
            disabled={updateMutation.isPending}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            autoComplete="name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="account-email" className="text-sm font-medium text-zinc-200">
            Email
          </label>
          <Input
            id="account-email"
            value={email ?? ""}
            readOnly
            disabled
            className="cursor-not-allowed opacity-80"
            aria-readonly
          />
          <p className="text-xs text-zinc-500">
            Email is managed by your sign-in provider and cannot be changed here.
          </p>
        </div>

        <Button type="submit" disabled={!canSubmit}>
          {updateMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Spinner size="sm" />
              Saving…
            </span>
          ) : (
            "Save changes"
          )}
        </Button>
      </form>
    </Card>
  );
}
