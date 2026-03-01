import Home from '~/app/_components/home'
import { HydrateClient } from '~/trpc/server'
import { getServerAuthSession } from '~/server/auth'
import Auth from '~/app/_components/auth'
import { Header } from './_components/header'
import { headers } from 'next/headers'
import MobilePlaceholder from './_components/mobile-layout-placeholder'
import { Onboarding } from './_components/onboarding'

export default async function App() {
  const session = await getServerAuthSession()
  const user = session?.user

  if (!user) return (
    <Auth />
  )

  const userAgent = headers().get('user-agent') || ''
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  if (isMobile) {
    return (
      <MobilePlaceholder />
    )
  }

  if (!user.onboardingCompleted) {
    return (
      <HydrateClient>
        <Onboarding userName={user.name || 'there'} />
      </HydrateClient>
    )
  }

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
