import { redirect } from 'next/navigation'

import { isTemplateLoginEnabled } from 'src/configs/auth'

/**
 * App entry: never talks to the backend.
 * `/login` handles cached-session redirects on the client.
 */
export default function RootEntryPage() {
  redirect(isTemplateLoginEnabled ? '/login/template' : '/login')
}
