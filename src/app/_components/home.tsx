import React from "react";
import Image from "next/image";
import { Goals } from "./goals";
import { Habits } from "./habits";
import { Journals } from "./jounal";
import { getServerAuthSession } from "~/server/auth";
import { Header } from "./header";

export default async function Component() {
  const session = await getServerAuthSession();

  return (
    <div className="h-screen w-screen space-y-4 p-14 px-20">
      {session ? (
        <div className="flex flex-col space-y-5">
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
          <div className="flex flex-col gap-1">
            <h1 className="text-6xl font-thin">
              {new Date().toLocaleTimeString("en-IN", {
                minute: "numeric",
                hour: "numeric",
                hour12: false,
              })}
            </h1>
            <h1 className="text-xl font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h1>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <Header />
        </div>
      )}
      <div className="grid grid-cols-3 gap-6">
        <Goals />
        <Habits />
        <Journals />
      </div>
    </div>
  );
}
