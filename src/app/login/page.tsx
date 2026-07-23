import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="text-2xl font-bold">Log in</h1>
      <p className="mt-2 text-sm text-foreground/70">
        Welcome back. Log in to access your membership.
      </p>
      <div className="mt-8">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-foreground/70">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-accent">
          Sign up
        </Link>
      </p>
    </div>
  );
}
