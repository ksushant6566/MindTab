'use client'

import { signIn } from "next-auth/react"
import { useLayoutEffect } from "react"

export const AutoSignin = () => {

    useLayoutEffect(() => {
        signIn('google', { callbackUrl: '/', redirect: true })
    }, [])

    return <div>Loading...</div>
}
