import React from "react";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";

export const Header = async () => {
  const session = await getServerAuthSession();

  return (
    <div className="flex w-full justify-end">
      <Link
        href={session ? "/api/auth/signout" : "/api/auth/signin"}
        className="rounded-full bg-white/10 px-6 py-2 font-semibold no-underline transition hover:bg-white/20"
      >
        {session ? "Sign out" : "Sign in"}
      </Link>
    </div>
  );
};
