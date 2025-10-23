import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv' // Import the Vercel KV client

export const config = {
  matcher: ['/', '/index'],
}

// ---
// 1. Define your single default redirect URL
// ---
const DEFAULT_REDIRECT_URL = 'https://sites.google.com/studio.digital/multitool/Hw2'

// ---
// 2. Define the expected structure of your data in KV
// ---
type UserCredentials = {
  pwd: string
  redirect?: string // The redirect is now optional
}

export default async function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization')
  const url = req.nextUrl

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':')

    // 3. Get the credentials object from Vercel KV
    // The 'user' (username) is used as the key
    const credentials = await kv.get<UserCredentials>(user)

    // 4. Check if user exists and password is correct
    if (credentials && credentials.pwd === pwd) {
      
      // 5. Check if this user has a special redirect in KV.
      //    If they do, use it. If not, use the default URL.
      const redirectUrl = credentials.redirect || DEFAULT_REDIRECT_URL

      // This logic handles both relative paths (like '/dashboard')
      // and absolute URLs (like 'https://example.com')
      if (redirectUrl.startsWith('/')) {
        const absoluteUrl = new URL(redirectUrl, req.url)
        return NextResponse.redirect(absoluteUrl)
      }
      
      return NextResponse.redirect(redirectUrl)
    }
  }

  // If auth is missing or invalid, rewrite to the auth API route
  url.pathname = '/api/auth'
  return NextResponse.rewrite(url)
}
