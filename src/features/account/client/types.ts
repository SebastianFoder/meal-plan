export type { AuthProviderId } from "@/features/account/auth-providers";

export type LinkedProvider = {
  provider: string;
  providerAccountId: string;
};

export type AccountOverview = {
  name: string | null;
  email: string | null;
  image: string | null;
  linkedProviders: LinkedProvider[];
};

export type UpdateAccountInput = {
  name: string;
};

export type UpdateAccountResponse = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};
