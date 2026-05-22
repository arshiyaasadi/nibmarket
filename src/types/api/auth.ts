/** Response from POST/GET /api/v1/auth/check_token */
export type CheckTokenResponse = {
  accessToken: string
  userId: number
  role: number | string
}

export type CheckTokenErrorResponse = {
  detail?: string
}
