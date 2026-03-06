import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.middleman.app',
  appName: 'Middleman',
  // Next.js 'output: export' creates the 'out' folder
  webDir: 'out',
  server: {
    // Allows Cloudinary and Supabase images to load over the local protocol
    androidScheme: 'https'
  }
};

export default config;