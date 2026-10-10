import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    pool: 'forks',
    include: ['src/tests/**/*.test.tsx', 'src/tests/**/*.test.ts'],
  },
});
