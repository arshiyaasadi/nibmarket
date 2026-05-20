'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Spinner from 'src/@core/components/spinner'

/**
 * Test entry: external site redirects here with a token in the path.
 * For now we only confirm receipt and send the user to normal login.
 */
export default function LoginTokenPage() {
  const params = useParams()
  const router = useRouter()
  const token = typeof params?.token === 'string' ? params.token : undefined

  useEffect(() => {
    if (!token) return

    toast.success('SSO token received — test flow OK. Redirecting to login.', {
      duration: 4500,
      id: 'sso-token-test'
    })
    router.replace('/')
  }, [token, router])

  return <Spinner />
}
