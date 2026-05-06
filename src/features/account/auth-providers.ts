/** IDs must match NextAuth provider `id` (e.g. GoogleProvider default is "google"). */
export const AUTH_PROVIDER_IDS = ["google"] as const;

export type AuthProviderId = (typeof AUTH_PROVIDER_IDS)[number];

export type AuthProviderMeta = {
  id: AuthProviderId;
  label: string;
};

export const AUTH_PROVIDERS: AuthProviderMeta[] = [
  { id: "google", label: "Google" },
];

export function isAuthProviderId(value: string): value is AuthProviderId {
  return (AUTH_PROVIDER_IDS as readonly string[]).includes(value);
}
