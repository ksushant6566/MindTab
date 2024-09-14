import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'

import { ThemeProvider } from '~/app/_components/theme-provider'
import { TRPCReactProvider } from '~/trpc/react'

export const metadata: Metadata = {
  title: 'MindTab',
  description: 'MindTab',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  viewport: 'width=device-width, initial-scale=1.0',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} `}>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
