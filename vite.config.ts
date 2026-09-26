import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const supabaseUrl =
    env.SUPABASE_URL ||
    env.SUPABASE_CONFIG_URL ||
    env.CONFIG_SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    env.VITE_CONFIG_SUPABASE_URL ||
    '';

  const supabaseAnonKey =
    env.SUPABASE_ANON_KEY ||
    env.SUPABASE_KEY ||
    env.SUPABASE_CONFIG_KEY ||
    env.CONFIG_SUPABASE_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    env.VITE_CONFIG_SUPABASE_KEY ||
    '';

  return {
    plugins: [react()],
    define: {
      '__SUPABASE_CONFIG__': JSON.stringify({
        url: supabaseUrl,
        anonKey: supabaseAnonKey,
      }),
    },
  };
});
