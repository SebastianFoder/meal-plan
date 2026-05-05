import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/features/auth/auth-options";

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireUserId() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/signin");
  }

  return session.user.id;
}
