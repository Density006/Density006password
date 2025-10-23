import { NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: ['/', '/index'],
}

// ---
// 1. Define your redirect URLs
// ---
const DEFAULT_REDIRECT_URL = 'https://sites.google.com/studio.digital/multitool/Hw2'
const DENSITY_REDIRECT_URL = 'https://sites.google.com/studio.digital/multitool/Admin' // A relative path
const ETHAN_REDIRECT_URL = 'https://ethans-page.com'   // An external site
const ADMIN_REDIRECT_URL = 'https://vercel.com/density006'
const DISALLOWED_REDIRECT_URL = 'https://sites.google.com/studio.digital/hmmm/home'

// ---
// 2. Store credentials and their unique redirect URLs together.
//    Users without a 'redirect' property will go to the default URL.
// ---
const validCredentials = new Map([
  // User: Density006 -> Special Page
  ['Density006', { pwd: 'dense', redirect: DENSITY_REDIRECT_URL }],
  
  // User: Ethan -> Special Page
  ['Ethan', { pwd: 'ethan', redirect: ETHAN_REDIRECT_URL }],

  // User: Jimmy -> Default Page (no 'redirect' property)
  ['Jimmy', { pwd: 'germanleader' }],
  ['4dmin', { pwd: 'NATE', redirect: ADMIN_REDIRECT_URL }],
  ['Duke', { pwd: 'danby', redirect: DISALLOWED_REDIRECT_URL }],
  
  // ---
  // Add as many users as you want here:
  // ['anotherUser', { pwd: 'password123', redirect: '/another-page' }],
  // ['defaultUser', { pwd: 'password456' }], // Will go to default URL
  // ---
])

export default function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization')
  const url = req.nextUrl

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = Buffer.from(authValue, 'base64').toString().split(':')

    // 3. Get the credentials object for the user
    const credentials = validCredentials.get(user)

    // 4. Check if user exists and password is correct
    if (credentials && credentials.pwd === pwd) {
      
      // 5. Check if this user has a special redirect.
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
