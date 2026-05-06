"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/client-api";
import { useDeleteAccountMutation } from "@/features/account/client/mutations";

type DeleteAccountSectionProps = {
  email: string | null;
};

export function DeleteAccountSection({ email }: DeleteAccountSectionProps) {
  const router = useRouter();
  const deleteMutation = useDeleteAccountMutation();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const expected =
    email?.trim() ??
    null;
  const fallbackPhrase = "DELETE MY ACCOUNT";
  const confirmationTarget = expected ?? fallbackPhrase;
  const confirmationOk =
    confirmText.trim() === confirmationTarget;

  const handleDelete = async () => {
    if (!confirmationOk) return;
    setSubmitError(null);
    try {
      await deleteMutation.mutateAsync();
      await signOut({ callbackUrl: "/signin" });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not delete account.");
      router.refresh();
    }
  };

  return (
    <>
      <Card className="space-y-3 border-red-500/20 bg-red-500/[0.06]">
        <div>
          <h2 className="text-lg font-semibold text-red-200">Danger zone</h2>
          <p className="text-sm text-zinc-400">
            Permanently delete your account and all recipes, schedule, and history. This cannot be
            undone.
          </p>
        </div>
        <Button type="button" variant="secondary" className="border-red-500/30 text-red-200 hover:bg-red-500/10" onClick={() => {
          setConfirmText("");
          setSubmitError(null);
          setOpen(true);
        }}>
          Delete account…
        </Button>
      </Card>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Delete account?"
        description="This removes your data from our servers. You will be signed out."
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="secondary" disabled={deleteMutation.isPending} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="border-red-500/40 bg-red-500/20 text-red-100 hover:bg-red-500/30"
              disabled={!confirmationOk || deleteMutation.isPending}
              onClick={handleDelete}
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center gap-2" role="status">
                  <Spinner size="sm" />
                  <span className="sr-only">Deleting</span>
                  Deleting…
                </span>
              ) : (
                "Delete forever"
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4 px-2">
          {submitError ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {submitError}
            </p>
          ) : null}

          <p className="text-sm text-zinc-300">
            Type{" "}
            <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white">
              {confirmationTarget}
            </span>{" "}
            to confirm.
          </p>
          <div className="space-y-2">
            <label htmlFor="delete-confirm" className="text-sm font-medium text-zinc-200">
              Confirmation
            </label>
            <Input
              id="delete-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={deleteMutation.isPending}
              autoComplete="off"
              placeholder={expected ? "Your email" : fallbackPhrase}
            />
          </div>
        </div>
      </Dialog>
    </>
  );
}
