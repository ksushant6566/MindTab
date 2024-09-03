import React from "react";
import { Goals } from "./goals";
import { Habits } from "./habits";
import { Journals } from "./jounal";
import { Header } from "./header";

export default async function Component() {
  return (
    <div className="h-screen w-screen space-y-8 p-14 px-20">
      <Header />
      <div className="grid grid-cols-3 gap-6">
        <Goals />
        <Habits />
        <Journals />
      </div>
    </div>
  );
}
