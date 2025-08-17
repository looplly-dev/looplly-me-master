import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b924d040e3a74d1f94fab78b84f2f3ff',
  appName: 'loop-earn-build',
  webDir: 'dist',
  server: {
    url: 'https://b924d040-e3a7-4d1f-94fa-b78b84f2f3ff.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;