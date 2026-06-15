// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Imports
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'
import { redirectToPanelLogin } from 'src/configs/auth-redirect'
import { normalizeUserRole } from 'src/configs/acl'

// ** Auth
import {
  clearAuthSession,
  exchangeEntryToken,
  hasSessionAccessToken,
  userFromSessionTokenJwt
} from 'src/lib/auth-exchange'
import { persistSessionAccessToken } from 'src/lib/auth-token'
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

// ** Types
import { AuthValuesType, LoginParams, TokenLoginParams, ErrCallbackType, UserDataType } from './types'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  loginWithToken: () => Promise.resolve(),
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
    const initAuth = async (): Promise<void> => {
      setLoading(true)

      try {
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

            clearAuthSession()
          } else {
            const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
            if (storedToken) {
              await import('src/@fake-db')
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
      } finally {
        setLoading(false)
      }
    }

    void initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const redirectAfterLogin = (userData: UserDataType) => {
    const returnUrl = searchParams.get('returnUrl')
    const redirectURL =
      returnUrl && returnUrl !== '/' && returnUrl.startsWith('/')
        ? returnUrl
        : getHomeRoute(userData.role)

    router.replace(redirectURL)
  }

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    void import('src/@fake-db')
      .then(() => axios.post(authConfig.loginEndpoint, params))
      .then(async response => {
        const userData = {
          ...response.data.userData,
          role: normalizeUserRole(response.data.userData?.role)
        }

        if (params.adminOnly && normalizeUserRole(userData.role) !== 'admin') {
          if (errorCallback) errorCallback(new Error('admin_only'))

          return
        }

        if (params.rememberMe) {
          persistSessionAccessToken(response.data.accessToken)
          window.localStorage.setItem('userData', JSON.stringify(userData))
        }

        setUser(userData)
        redirectAfterLogin(userData)
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleTokenLogin = async (params: TokenLoginParams, errorCallback?: ErrCallbackType) => {
    const token = params.token.trim()
    if (!token) return

    setLoading(true)

    try {
      const userData = await exchangeEntryToken(token)
      setUser(userData)
      redirectAfterLogin(userData)
    } catch (err) {
      clearAuthSession()
      setUser(null)
      if (errorCallback) errorCallback(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuthSession()
    setUser(null)
    router.replace('/logged-out')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    loginWithToken: handleTokenLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
