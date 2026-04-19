import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      include: ['src/**/*.test.{js,ts,tsx}'],
      exclude: ['tests/e2e/**'],
    },
  })
);
