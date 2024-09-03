import React from "react";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import Image from "next/image";
import { ModeToggle } from "./theme-toggle";

export const Header = async () => {
  const session = await getServerAuthSession();

  return (
    <div className="flex w-full items-center justify-between">
      <div className="relative mx-8 flex items-center">
        <div className="absolute left-0 top-0 flex h-11 w-11 -translate-x-[78%] -translate-y-[6%] items-center justify-center rounded-full bg-blue-800">
          <h1 className="text-2xl font-medium text-white">M</h1>
        </div>
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt="profile"
            className="z-10 h-10 w-10 rounded-full ring-1 ring-white"
            width={48}
            height={48}
          />
        ) : (
          <div className="z-10 h-10 w-10 rounded-full bg-slate-300" />
        )}
      </div>
      <div className="flex items-center gap-4">
        {!session && (
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-white/10 px-6 py-2 text-sm font-medium no-underline transition hover:bg-white/20"
          >
            {session ? "Sign out" : "Sign in"}
          </Link>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};
