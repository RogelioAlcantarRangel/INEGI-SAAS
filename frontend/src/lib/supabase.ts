import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Si faltan las credenciales, creamos un cliente "ficticio" para que el build de Vercel no truene.
// Esto permite que el sitio se construya y solo muestre una advertencia en consola.
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        from: () => ({
            select: () => ({
                order: () => ({
                    limit: () => Promise.resolve({ data: [], error: null })
                })
            })
        })
    } as any;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials missing. The build will proceed but data fetching will fail until variables are set in Vercel Dashboard.');
}
