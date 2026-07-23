"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-foreground/70 hover:text-foreground"
    >
      Log out
    </button>
  );
}
