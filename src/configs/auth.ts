export default {
  meEndpoint: '/auth/me',
  loginEndpoint: '/jwt/login',
  registerEndpoint: '/jwt/register',
  checkTokenEndpoint: '/api/auth/check_token',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken' // logout | refreshToken
}

/** Materialize email/password login — off by default; use `/login/template` when enabled. */
export const isTemplateLoginEnabled =
  process.env.NEXT_PUBLIC_ENABLE_TEMPLATE_LOGIN === 'true'
