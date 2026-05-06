"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ApiError } from "@/lib/client-api";
import { AUTH_PROVIDERS } from "@/features/account/auth-providers";
import type { AuthProviderId } from "@/features/account/auth-providers";
import { useUnlinkProviderMutation } from "@/features/account/client/mutations";
import type { LinkedProvider } from "@/features/account/client/types";

type ConnectionsSectionProps = {
  linkedProviders: LinkedProvider[];
};

export function ConnectionsSection({ linkedProviders }: ConnectionsSectionProps) {
  const unlinkMutation = useUnlinkProviderMutation();
  const [connectingId, setConnectingId] = useState<AuthProviderId | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const linkedCount = linkedProviders.length;

  const isLinked = (providerId: string) =>
    linkedProviders.some((p) => p.provider === providerId);

  const handleConnect = async (providerId: AuthProviderId) => {
    setActionError(null);
    setConnectingId(providerId);
    try {
      await signIn(providerId, { callbackUrl: "/account" });
    } finally {
      setConnectingId(null);
    }
  };

  const handleDisconnect = async (providerId: AuthProviderId) => {
    setActionError(null);
    try {
      await unlinkMutation.mutateAsync(providerId);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Something went wrong.");
    }
  };

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Sign-in connections</h2>
        <p className="text-sm text-zinc-400">
          Link additional providers when they become available. You must keep at least one way to
          sign in.
        </p>
      </div>

      {actionError ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {actionError}
        </p>
      ) : null}

      <ul className="divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
        {AUTH_PROVIDERS.map((meta) => {
          const linked = isLinked(meta.id);
          const canDisconnect = linked && linkedCount > 1;
          const busyConnect = connectingId === meta.id;
          const busyDisconnect = unlinkMutation.isPending && unlinkMutation.variables === meta.id;

          return (
            <li
              key={meta.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium text-zinc-100">{meta.label}</p>
                <p className="text-xs text-zinc-500">
                  {linked ? "Connected" : "Not connected"}
                </p>
              </div>
              <div className="flex gap-2">
                {linked ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={!canDisconnect || busyDisconnect}
                    title={
                      !canDisconnect
                        ? "Add another sign-in method before disconnecting this one."
                        : undefined
                    }
                    onClick={() => handleDisconnect(meta.id)}
                  >
                    {busyDisconnect ? (
                      <span className="flex items-center gap-2" role="status">
                        <Spinner size="sm" />
                        <span className="sr-only">Disconnecting</span>
                        Disconnecting…
                      </span>
                    ) : (
                      "Disconnect"
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={busyConnect}
                    onClick={() => handleConnect(meta.id)}
                  >
                    {busyConnect ? (
                      <span className="flex items-center gap-2" role="status">
                        <Spinner size="sm" />
                        <span className="sr-only">Connecting</span>
                        Continuing…
                      </span>
                    ) : (
                      "Connect"
                    )}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
