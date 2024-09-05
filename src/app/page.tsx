import Home from "~/app/_components/home";
import { HydrateClient } from "~/trpc/server";

export default async function App() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-b">
        <Home />
      </main>
    </HydrateClient>
  );
}
