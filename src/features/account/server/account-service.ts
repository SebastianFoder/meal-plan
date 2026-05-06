import { db } from "@/lib/prisma";
import type { AuthProviderId } from "@/features/account/auth-providers";

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

export async function getAccountOverview(userId: string): Promise<AccountOverview> {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        },
      },
    },
  });

  return {
    name: user.name,
    email: user.email,
    image: user.image,
    linkedProviders: user.accounts.map((a) => ({
      provider: a.provider,
      providerAccountId: a.providerAccountId,
    })),
  };
}

export async function updateAccount(userId: string, input: { name: string }) {
  return db.user.update({
    where: { id: userId },
    data: { name: input.name },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });
}

export class LastConnectionError extends Error {
  constructor() {
    super("Cannot remove the only sign-in method.");
    this.name = "LastConnectionError";
  }
}

export async function unlinkProvider(userId: string, provider: AuthProviderId): Promise<void> {
  const count = await db.account.count({ where: { userId } });
  if (count <= 1) {
    throw new LastConnectionError();
  }

  const deleted = await db.account.deleteMany({
    where: { userId, provider },
  });

  if (deleted.count === 0) {
    const err = new Error("No linked account for that provider.");
    err.name = "ProviderNotLinkedError";
    throw err;
  }
}

export async function deleteAccount(userId: string): Promise<void> {
  await db.user.delete({ where: { id: userId } });
}
