import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { deleteAccount, unlinkProvider, updateAccount } from "./api";
import type { UpdateAccountInput } from "./types";
import type { AuthProviderId } from "@/features/account/auth-providers";

export function useUpdateAccountMutation() {
  const router = useRouter();
  return useMutation({
    mutationFn: (input: UpdateAccountInput) => updateAccount(input),
    onSuccess: () => {
      router.refresh();
    },
  });
}

export function useUnlinkProviderMutation() {
  const router = useRouter();
  return useMutation({
    mutationFn: (provider: AuthProviderId) => unlinkProvider(provider),
    onSuccess: () => {
      router.refresh();
    },
  });
}

export function useDeleteAccountMutation() {
  return useMutation({
    mutationFn: () => deleteAccount(),
  });
}
