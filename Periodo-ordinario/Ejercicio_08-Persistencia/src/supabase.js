import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const configurado = Boolean(url && key && !url.includes('TU-PROYECTO'));

export const supabase = createClient(url ?? 'http://localhost', key ?? 'sin-key', {
  auth: { persistSession: false, autoRefreshToken: false },
});
