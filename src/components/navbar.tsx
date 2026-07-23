import Link from "next/link";
import { auth } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-background/90 backdrop-blur dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Hormone Optimization
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/pricing" className="text-foreground/70 hover:text-foreground">
            Pricing
          </Link>
          {session?.user ? (
            <>
              <Link href="/dashboard" className="text-foreground/70 hover:text-foreground">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-foreground/70 hover:text-foreground">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-accent px-4 py-2 text-accent-foreground hover:opacity-90"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
