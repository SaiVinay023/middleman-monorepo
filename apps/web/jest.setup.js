// jest.setup.js
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY = 'test-imagekit-key';
process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT = 'https://test.imagekit.io';

// Mock Capacitor
jest.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: jest.fn(() => false),
    getPlatform: jest.fn(() => 'web'),
  },
}));

jest.mock('@capacitor/camera', () => ({
  Camera: {
    getPhoto: jest.fn(),
  },
}));

jest.mock('@capacitor/haptics', () => ({
  Haptics: {
    impact: jest.fn(),
    vibrate: jest.fn(),
  },
}));

// Suppress console errors in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
