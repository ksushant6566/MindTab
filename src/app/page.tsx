import Home from '~/app/_components/home'
import { HydrateClient } from '~/trpc/server'
import { getServerAuthSession } from '~/server/auth'
import Auth from '~/app/_components/auth'
import { Header } from './_components/header'

export default async function App() {

  const session = await getServerAuthSession()
  const user = session?.user

  if (!user) return (
    <Auth />
  )

  return (
    <HydrateClient>
      <main className="flex min-h-screen w-full flex-col items-center bg-gradient-to-b">
        <div className='w-full flex flex-col items-center p-6 px-12 max-w-screen-2xl mx-auto'>
          <Header session={session} />
        </div>
        <Home />
      </main>
    </HydrateClient>
  )
}
