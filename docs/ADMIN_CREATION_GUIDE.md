# 👑 Admin Creation Guide

> Yeh guide Zaynahs E-Store (aur uski tamaam branches jese Little Mister, Mini Mahal etc.) mein naye Admin users create karne ke liye hai.
> Hamare architecture mein Admin portal ki security do (2) layers par mushtamil hai. Admin banne ke liye user ko dono layers pass karni zaroori hain.

---

## Architecture / Security Concept

1. **Auth Layer (Supabase):** User ka account Supabase `auth.users` mein mojud hona chahiye.
2. **Authorization Layer (Vercel):** User ka email address Next.js (Vercel) ke environment variables mein `NEXT_PUBLIC_ADMIN_EMAIL` ke andar whitelisted hona chahiye.

Agar user Supabase mein mojood hai lekin Vercel env mein list nahi kiya gaya, to login karne par **"Access denied: Not authorized for admin portal."** ka error aayega (aur user automatically sign out ho jayega).

---

## 🛠️ Step-by-Step Guide (API-Only Approach)

Zaynahs e-store strict API-only approach follow karta hai (Zero Dashboard Clicks). Neeche diye gaye commands ko apne terminal mein run karein.

### Step 1: Create the User in Supabase
Supabase Admin API (Service Role) use karein taake account direct create ho aur email verification skip ho jaye.

_Requirement: Apni `.env.local` ya backup `.env` file se credentials nikalein._

```bash
# Apne terminal mein bash variables set karein:
SUPABASE_URL="https://[YOUR_PROJECT_REF].supabase.co"
SUPABASE_SERVICE_KEY="[YOUR_SERVICE_ROLE_KEY]"
SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"

# API Call for User Creation:
curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@example.com",
    "password": "StrongPassword123",
    "email_confirm": true,
    "user_metadata": {"full_name": "Admin Name", "role": "super_admin"}
  }'
```
*Note: `email_confirm: true` ki wajah se user ko confirmation link par click karne ki zaroorat nahi padti.*

### Step 2: Whitelist Email in Vercel
Naye admin ka email Vercel ke environment variables mein add karein. 

```bash
VERCEL_TOKEN="[YOUR_VERCEL_TOKEN]"
VERCEL_PROJECT="[YOUR_PROJECT_NAME]" # e.g., eestore
# Purane emails ke sath naya email comma laga kar likhein (No Spaces)
NEW_EMAILS="oldadmin@gmail.com,newadmin@example.com"

# 1. Purana variable remove karein
npx -y vercel@latest env rm NEXT_PUBLIC_ADMIN_EMAIL --project $VERCEL_PROJECT --token $VERCEL_TOKEN --yes

# 2. Nayi comma-separated list add karein
npx -y vercel@latest env add NEXT_PUBLIC_ADMIN_EMAIL production,preview,development --project $VERCEL_PROJECT --token $VERCEL_TOKEN --value "$NEW_EMAILS" --no-sensitive --visibility config --yes
```

### Step 3: Redeploy the App
Environment variables (jo `NEXT_PUBLIC_` se start hote hain) ko Next.js build time par embed karta hai. Is liye naye email ko apply karne ke liye redeploy karna laazmi hai.

```bash
npx -y vercel@latest deploy --prod --project $VERCEL_PROJECT --token $VERCEL_TOKEN --yes
```

Deploy complete hone ke baad (taqreeban 1-2 minute), naya admin safely Admin Portal mein login kar sake ga.

---

## 🖥️ Alternative: Vercel Dashboard (GUI Method)
Agar aap CLI ki bajaye Dashboard use kar rahe hain:
1. Vercel dashboard par jayen -> Project Settings -> **Environment Variables**.
2. `NEXT_PUBLIC_ADMIN_EMAIL` search karein aur usay Edit karein.
3. Values ko comma se separate kar ke likhein: `admin1@gmail.com,admin2@gmail.com`.
4. Save karein.
5. Project ki **Deployments** tab mein jayen -> Latest production deploy ke samne 3 dots par click karein -> **Redeploy**.
