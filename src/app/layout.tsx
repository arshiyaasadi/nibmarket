// ** React Imports
import { ReactNode } from 'react'

// ** Config Imports
import themeConfig from 'src/configs/themeConfig'

// ** Global css styles
import '../../styles/globals.css'

// ** Component Imports
import Providers from './providers'

// ** Metadata
export const metadata = {
  title: `${themeConfig.templateName} - Material Design React Admin Template`,
  description: `${themeConfig.templateName} – Material Design React Admin Dashboard Template – is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.`,
  keywords: 'Material Design, MUI, Admin Template, React Admin Template'
}

// ** Root Layout Component
export default function RootLayout({
  children
}: {
  children: ReactNode
}) {
  return (
    <html lang='en'>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        />
        <link rel='preconnect' href='https://cdn.jsdelivr.net' />
        <link
          rel='stylesheet'
          href='https://cdn.jsdelivr.net/gh/rastikerdar/vazirfont@v30.1.0/dist/font-face.css'
        />
        <link rel='apple-touch-icon' sizes='180x180' href='/images/apple-touch-icon.png' />
        <link rel='shortcut icon' href='/images/favicon.png' />
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

