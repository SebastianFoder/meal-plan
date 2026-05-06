import { NextResponse } from "next/server";
import {
  LastConnectionError,
  unlinkProvider,
} from "@/features/account/server/account-service";
import { requireUserId } from "@/lib/auth";
import { isAuthProviderId } from "@/features/account/auth-providers";

export async function DELETE(
  _: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const userId = await requireUserId();
  const { provider } = await context.params;

  if (!isAuthProviderId(provider)) {
    return NextResponse.json({ message: "Unknown provider." }, { status: 400 });
  }

  try {
    await unlinkProvider(userId, provider);
  } catch (e) {
    if (e instanceof LastConnectionError) {
      return NextResponse.json({ message: e.message }, { status: 409 });
    }
    if (e instanceof Error && e.name === "ProviderNotLinkedError") {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    throw e;
  }

  return NextResponse.json({ ok: true as const });
}
