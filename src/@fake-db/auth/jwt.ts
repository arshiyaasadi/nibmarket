// ** JWT import
import jwt from 'jsonwebtoken'

// ** Mock Adapter
import mock from 'src/@fake-db/mock'

// ** Default AuthConfig
import defaultAuthConfig from 'src/configs/auth'
import { normalizeUserRole } from 'src/configs/acl'

// ** Types
import { UserDataType } from 'src/context/types'

const users: UserDataType[] = [
  {
    id: 1,
    role: 'admin',
    password: 'admin',
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'admin@materialize.com'
  },
  {
    id: 2,
    role: 'client',
    password: 'client',
    fullName: 'Jane Doe',
    username: 'janedoe',
    email: 'client@materialize.com'
  },
  {
    id: 3,
    role: 'manager',
    password: 'manager',
    fullName: 'Manager User',
    username: 'manager',
    email: 'manager@materialize.com'
  }
]

// ! These two secrets should be in .env file and not in any other file
const jwtConfig = {
  secret: process.env.NEXT_PUBLIC_JWT_SECRET,
  expirationTime: process.env.NEXT_PUBLIC_JWT_EXPIRATION,
  refreshTokenSecret: process.env.NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET
}

type ResponseType = [number, { [key: string]: any }]

mock.onPost('/jwt/login').reply(request => {
  const { email, password } = JSON.parse(request.data)

  let error = {
    email: ['Something went wrong']
  }

  const user = users.find(u => u.email === email && u.password === password)

  if (user) {
    const accessToken = jwt.sign({ id: user.id }, jwtConfig.secret as string, { expiresIn: jwtConfig.expirationTime })

    const response = {
      accessToken,
      userData: { ...user, password: undefined, role: normalizeUserRole(user.role) }
    }

    return [200, response]
  } else {
    error = {
      email: ['email or Password is Invalid']
    }

    return [400, { error }]
  }
})

mock.onPost('/jwt/register').reply(request => {
  if (request.data.length > 0) {
    const { email, password, username } = JSON.parse(request.data)
    const isEmailAlreadyInUse = users.find(user => user.email === email)
    const isUsernameAlreadyInUse = users.find(user => user.username === username)
    const error = {
      email: isEmailAlreadyInUse ? 'This email is already in use.' : null,
      username: isUsernameAlreadyInUse ? 'This username is already in use.' : null
    }

    if (!error.username && !error.email) {
      const { length } = users
      let lastIndex = 0
      if (length) {
        lastIndex = users[length - 1].id
      }
      const userData = {
        id: lastIndex + 1,
        email,
        password,
        username,
        avatar: null,
        fullName: '',
        role: 'admin'
      }

      users.push(userData)

      const accessToken = jwt.sign({ id: userData.id }, jwtConfig.secret as string)

      const user = { ...userData }
      delete user.password

      const response = { accessToken }

      return [200, response]
    }

    return [200, { error }]
  } else {
    return [401, { error: 'Invalid Data' }]
  }
})

mock.onGet('/auth/me').reply(config => {
  // ** Get token from header
  // @ts-ignore
  const token = config.headers.Authorization as string

  // ** Default response
  let response: ResponseType = [200, {}]

  // ** Checks if the token is valid or expired
  jwt.verify(token, jwtConfig.secret as string, (err, decoded) => {
    // ** If token is expired
    if (err) {
      // ** If onTokenExpiration === 'logout' then send 401 error
      if (defaultAuthConfig.onTokenExpiration === 'logout') {
        // ** 401 response will logout user from AuthContext file
        response = [401, { error: { error: 'Invalid User' } }]
      } else {
        const oldTokenDecoded = jwt.decode(token, { complete: true })
        const payload = (oldTokenDecoded?.payload ?? {}) as {
          id?: number
          user_id?: number
          role?: string | number
        }

        const userId = payload.user_id ?? payload.id
        const appRole = normalizeUserRole(payload.role)
        const user = users.find(u => u.id === userId)

        if (user && userId) {
          const accessToken = jwt.sign({ id: userId }, jwtConfig.secret as string, {
            expiresIn: jwtConfig.expirationTime
          })
          window.localStorage.setItem(defaultAuthConfig.storageTokenKeyName, accessToken)
          response = [200, { userData: { ...user, password: undefined, role: appRole } }]
        } else if (userId) {
          response = [
            200,
            {
              userData: {
                id: userId,
                role: appRole,
                email: '',
                fullName: '',
                username: String(userId),
                password: ''
              }
            }
          ]
        } else {
          response = [401, { error: { error: 'Invalid User' } }]
        }
      }
    } else {
      // ** If token is valid do nothing
      // @ts-ignore
      const userId = decoded.id

      // ** Get user that matches id in token
      const user = users.find((u: UserDataType) => u.id === userId)
      if (!user) {
        response = [401, { error: { error: 'Invalid User' } }]
      } else {
        const userData = JSON.parse(JSON.stringify(user))
        delete userData.password
        userData.role = normalizeUserRole(userData.role)
        response = [200, { userData }]
      }
    }
  })

  return response
})
