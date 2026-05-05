import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/container";
import { UserMenu } from "@/components/layout/user-menu";
import { getAuthSession } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/templates", label: "Templates" },
  { href: "/timeline", label: "Timeline" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0b0c]/70 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-base font-semibold">Meal Planner</p>
            <nav className="flex gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm text-zinc-300 transition duration-200 ease-out hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <UserMenu />
        </Container>
      </header>
      <Container className="py-8">{children}</Container>
    </div>
  );
}
