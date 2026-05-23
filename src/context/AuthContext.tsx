// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Imports
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'
import { normalizeUserRole } from 'src/configs/acl'

// ** Auth
import {
  clearAuthSession,
  clearStaleSession,
  exchangeEntryToken,
  hasSessionAccessToken,
  userFromSessionTokenJwt
} from 'src/lib/auth-exchange'
import { extractTokenFromLoginPath, isLoginTokenPath } from 'src/lib/auth-entry'
import { getEntryToken, seedEntryTokenFromEnv, setEntryToken } from 'src/lib/auth-token'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

// ** Types
import { AuthValuesType, LoginParams, ErrCallbackType, UserDataType } from './types'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

function loadUserFromStorage(): UserDataType | null {
  const raw = window.localStorage.getItem('userData')
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as UserDataType

    return { ...parsed, role: normalizeUserRole(parsed.role) }
  } catch {
    return null
  }
}

function isApiDataSource(): boolean {
  return (process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock').toLowerCase() === 'api'
}

const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (isLoginTokenPath(pathname)) {
      return
    }

    const initAuth = async (): Promise<void> => {
      setLoading(true)
      seedEntryTokenFromEnv()

      const pathToken = extractTokenFromLoginPath(pathname)
      const tokenFromQuery = searchParams.get('token')?.trim()
      if (pathToken) setEntryToken(pathToken)
      if (tokenFromQuery) setEntryToken(tokenFromQuery)

      try {
        const entryToken = getEntryToken()
        if (entryToken) {
          clearStaleSession()
          const userData = await exchangeEntryToken(entryToken)
          setUser(userData)
          setLoading(false)

          return
        }

        if (hasSessionAccessToken()) {
          const cachedUser = loadUserFromStorage()
          if (cachedUser) {
            setUser(cachedUser)
            setLoading(false)

            return
          }

          if (isApiDataSource()) {
            const fromJwt = userFromSessionTokenJwt()
            if (fromJwt) {
              setUser(fromJwt)
              window.localStorage.setItem('userData', JSON.stringify(fromJwt))
              setLoading(false)

              return
            }

            clearStaleSession()
          } else {
            const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
            if (storedToken) {
              await axios
                .get(authConfig.meEndpoint, {
                  headers: {
                    Authorization: storedToken.startsWith('Bearer ') ? storedToken : `Bearer ${storedToken}`
                  }
                })
                .then(response => {
                  const userData = {
                    ...response.data.userData,
                    role: normalizeUserRole(response.data.userData?.role)
                  }
                  setUser(userData)
                  window.localStorage.setItem('userData', JSON.stringify(userData))
                })

              setLoading(false)

              return
            }
          }
        }

        setUser(null)
      } catch {
        clearAuthSession()
        setUser(null)
        if (pathname !== '/' && !pathname.startsWith('/login')) {
          router.replace('/')
        }
      } finally {
        setLoading(false)
      }
    }

    void initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  useEffect(() => {
    if (loading || !user) return
    if (pathname !== '/') return

    const returnUrl = searchParams.get('returnUrl')
    const destination =
      returnUrl && returnUrl !== '/' && returnUrl.startsWith('/')
        ? returnUrl
        : getHomeRoute(user.role)

    router.replace(destination)
  }, [loading, user, pathname, searchParams, router])

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    axios
      .post(authConfig.loginEndpoint, params)
      .then(async response => {
        params.rememberMe
          ? window.localStorage.setItem(authConfig.storageTokenKeyName, response.data.accessToken)
          : null
        const returnUrl = searchParams.get('returnUrl')

        const userData = {
          ...response.data.userData,
          role: normalizeUserRole(response.data.userData?.role)
        }
        setUser(userData)
        params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(userData)) : null

        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : getHomeRoute(userData.role)

        router.replace(redirectURL)
      })

      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    clearAuthSession()
    setUser(null)
    router.push('/')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
