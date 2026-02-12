import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const getGithubPagesBase = () => {
  if (process.env.GITHUB_ACTIONS !== 'true') return '/';
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  return repoName ? `/${repoName}/` : '/';
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: getGithubPagesBase(),
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
