# Botvio Authentication

The independent Botvio application uses Supabase Auth directly.

## Supabase project

- Project URL: https://bkygpojmlxcikhbuqgmv.supabase.co
- Auth issuer: https://bkygpojmlxcikhbuqgmv.supabase.co/auth/v1

## Browser configuration

The frontend uses:

- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY

Only the publishable/anon key belongs in the browser. Never expose a Supabase service-role key in frontend code.

## Authentication flows

- Email/password sign up
- Email/password sign in
- Persistent sessions
- Automatic token refresh
- Password reset
- Protected application routes
- Supabase auth state change handling

The independent application stores its browser session locally and does not depend on Lovable preview authentication.

## Production security

Authentication is only one layer of security. Sensitive tables must remain protected by Supabase Row Level Security (RLS), and privileged operations should be performed through trusted server-side/Edge Function code.

