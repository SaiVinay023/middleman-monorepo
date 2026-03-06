# Middleman - Next.js 15 + Capacitor 8 Mobile App

A production-ready mobile-first application built with Next.js 15 and Capacitor 8, fully compatible with iOS, Android, and Web.

## 🏗️ Architecture Overview

This project uses **static site generation** (SSG) with Next.js to create a mobile app that works seamlessly across all platforms. The architecture eliminates the need for a Node.js server on mobile devices.

### Core Technologies

- **Next.js 15**: React framework with static export
- **Capacitor 8**: Native mobile runtime
- **Supabase**: Authentication and database
- **TanStack Query**: Client-side data fetching
- **Zustand**: State management
- **ImageKit**: Image optimization
- **Zod**: Schema validation
- **Tailwind CSS**: Utility-first styling

## 📁 Project Structure

```
├── capacitor.config.ts          # Capacitor configuration
├── next.config.ts               # Next.js static export config
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with QueryProvider
│   │   ├── page.tsx             # Home page
│   │   ├── globals.css          # Global styles with safe areas
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Dashboard (mobile-responsive)
│   │   ├── auth/
│   │   │   └── page.tsx         # Authentication page
│   │   └── profile/
│   │       └── page.tsx         # User profile page
│   ├── components/
│   │   └── adaptive-nav/
│   │       └── index.tsx        # Adaptive navigation component
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client singleton
│   │   └── imagekit.ts          # ImageKit client singleton
│   ├── hooks/
│   │   ├── useCamera.ts         # Capacitor Camera hook
│   │   └── useHaptics.ts        # Capacitor Haptics hook
│   ├── store/
│   │   └── userStore.ts         # Zustand user state
│   └── utils/
│       └── queryClient.ts       # TanStack Query setup
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your-imagekit-url-endpoint
```

## 📱 Building for Mobile

### Build and Sync

```bash
# Build static site and sync to Capacitor
npm run static
```

### iOS Development

```bash
# Open iOS project in Xcode
npm run ios
```

### Android Development

```bash
# Open Android project in Android Studio
npm run android
```

## 🔑 Key Features

### 1. Static Export Configuration

The `next.config.ts` ensures compatibility with Capacitor:

- `output: 'export'` - Generates static HTML/CSS/JS
- `trailingSlash: true` - Fixes routing in WebViews
- `images.unoptimized: true` - No server-side image optimization

### 2. Adaptive Navigation

The `AdaptiveNav` component automatically switches between:
- **Desktop**: Sidebar navigation
- **Mobile**: Bottom tab bar navigation

### 3. Client-Side Data Fetching

All data fetching uses TanStack Query with the `enabled` flag:

```typescript
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: async () => { /* fetch data */ },
  enabled: mounted, // Only runs on client
});
```

### 4. Safe Area Handling

Global CSS includes safe area insets for notch/dynamic island:

```css
.safe-area-padding {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 5. Native Device Features

- **Camera**: `useCamera` hook for photo capture
- **Haptics**: `useHaptics` hook for tactile feedback

## 🛠️ Development Workflow

1. **Develop**: Run `npm run dev` and test in browser
2. **Build**: Run `npm run static` to generate static files
3. **Test Mobile**: Open native IDEs with `npm run ios` or `npm run android`
4. **Deploy**: Build and publish to App Store/Play Store

## ⚠️ Important Compatibility Notes

### Do NOT Use

- Server Components with dynamic functions (`headers()`, `cookies()`)
- Next.js Image Optimization (use `unoptimized: true`)
- API Routes (use external APIs or Supabase)
- Server-side rendering (SSR)

### Do Use

- `'use client'` for all interactive components
- Client-side data fetching with TanStack Query
- Environment variables prefixed with `NEXT_PUBLIC_`
- Trailing slashes in all routes (e.g., `/dashboard/`)

## 📚 Additional Resources

- [Next.js Static Exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [TanStack Query](https://tanstack.com/query/latest)

## 📄 License

MIT

## Lighthouse Performance Audits

Use the built-in audit scripts to test production static output by route:

```bash
# Full route suite (desktop + mobile)
pnpm perf:audit

# Quick check (home + company)
pnpm perf:audit:quick
```

Reports are written to `apps/web/performance/lighthouse`.

The script fails when any route/profile misses these budgets:

- Performance score < 95
- LCP > 2500ms
- TBT > 200ms
- CLS > 0.1
