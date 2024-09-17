'use client'

import { signIn } from "next-auth/react"

export const AutoSignin = () => {

    signIn('google', { callbackUrl: '/', redirect: true })

    return <div>Loading...</div>
}
