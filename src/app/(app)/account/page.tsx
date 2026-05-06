import { getAccountOverview } from "@/features/account/server/account-service";
import { requireUserId } from "@/lib/auth";
import { ConnectionsSection } from "./connections-section";
import { DeleteAccountSection } from "./delete-account-section";
import { ProfileForm } from "./profile-form";

export default async function AccountPage() {
  const userId = await requireUserId();
  const overview = await getAccountOverview(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="text-sm text-zinc-400">Manage your profile and sign-in methods.</p>
      </div>

      <ProfileForm initialName={overview.name} email={overview.email} />

      <ConnectionsSection linkedProviders={overview.linkedProviders} />

      <DeleteAccountSection email={overview.email} />
    </div>
  );
}
