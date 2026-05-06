import { requestJson } from "@/lib/client-api";
import type { UpdateAccountInput, UpdateAccountResponse } from "./types";
import type { AuthProviderId } from "@/features/account/auth-providers";

export async function updateAccount(input: UpdateAccountInput) {
  return requestJson<UpdateAccountResponse>("/api/account", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function unlinkProvider(provider: AuthProviderId) {
  return requestJson<{ ok: true }>(`/api/account/connections/${provider}`, {
    method: "DELETE",
  });
}

export async function deleteAccount() {
  return requestJson<{ ok: true }>("/api/account", {
    method: "DELETE",
  });
}
