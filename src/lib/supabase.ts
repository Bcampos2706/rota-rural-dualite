import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltam variáveis de ambiente do Supabase. Verifique o arquivo .env');
}

// Conecta ao banco real usando as variáveis do .env
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
