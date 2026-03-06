

# 🚀 TechPulse AI: Senior Development Guidelines (2026)

### 1. The "Static Export" Rule

Since we are using **Capacitor**, we use `output: 'export'`.

* **The Constraint:** No Node.js runtime on the phone.
* **Keep in Mind:** * ❌ Do **not** use `getServerSideProps` or `getStaticProps`.
* ❌ Do **not** use Next.js "API Routes" (`/api/...`) if you expect them to run on the phone.
* ✅ **Do** use Client-side fetching (TanStack Query or `useEffect`) to talk to Supabase.
* ✅ **Do** use Supabase Edge Functions if you need secure "backend" logic.



### 2. Authentication Strategy (Hybrid)

Mobile apps and Web browsers handle sessions differently.

* **Web:** Uses Cookies (SSR friendly).
* **Mobile:** Uses LocalStorage (Capacitor friendly).
* **Action:** Always use the `createClient` helper we built that detects `Capacitor.isNativePlatform()`. If you don't, technicians will be logged out every time they minimize the app.

### 3. File & Image Handling (Cloudinary)

We have **25GB**, but we must be smart to keep it free.

* **Optimization:** Always use `f_auto` and `q_auto`.
* **The "Native" Trap:** On mobile, `next/image` won't work with its default loader.
* **Solution:** Use `next-cloudinary` components or standard `<img>` tags with Cloudinary URLs. Set `unoptimized: true` in `next.config.ts`.

### 4. Database & Security (Supabase RLS)

Since the frontend talks directly to the database (bypassing a traditional backend), **Row Level Security (RLS)** is your only line of defense.

* **Rule:** Every table must have an RLS policy.
* **Example:** `auth.uid() = user_id`. Never allow a technician to see another technician's uploaded documents.
* **Schema:** Use "Soft Deletes" (`deleted_at` column) instead of permanent deletion for mission-critical data.

### 5. UI/UX: The "Mobile-Native" Feel

A website wrapped in an app looks obvious unless you fix these:

* **Touch Feedback:** Use `-webkit-tap-highlight-color: transparent` in CSS.
* **Safe Areas:** Use `env(safe-area-inset-bottom)` for fixed elements (like your bottom nav) so they don't overlap the iPhone home bar.
* **Over-scroll:** Disable bounce on the body to prevent the "floating website" look.


### Critical File Checklist for 5,000 Users

| File | Responsibility |
| --- | --- |
| `src/lib/supabase.ts` | Cross-platform Auth client. |
| `src/components/Navigation.tsx` | Swaps Sidebar (Web) for Bottom Bar (Mobile). |
| `next.config.ts` | Must have `output: 'export'`. |
| `.env.local` | Must contain `NEXT_PUBLIC_` keys for Supabase/Cloudinary. |

---
