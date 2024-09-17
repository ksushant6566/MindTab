import { HydrateClient } from '~/trpc/server'
import { getServerAuthSession } from '~/server/auth'
import { redirect } from 'next/navigation'
import { AutoSignin } from './_auto-signin'

export default async function App() {

  const session = await getServerAuthSession()
  const user = session?.user

  if (user) {
    redirect('/')
  }

  if (!user) {
    return <AutoSignin />
  }

  return (
    <HydrateClient>
        <main className="flex min-h-screen w-full flex-col justify-center items-center bg-gradient-to-b">
          <div>
            <h1>Logging you in...</h1>
          </div>
        </main>
    </HydrateClient>
  )
}
