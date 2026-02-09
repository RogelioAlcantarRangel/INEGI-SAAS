import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

export const CONFIG = {
    INEGI_TOKEN: process.env.INEGI_TOKEN || '',
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_KEY: process.env.SUPABASE_KEY || '',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    // Indicadores seleccionados y VERIFICADOS en BISE (v2.0)
    INDICATORS: {
        IPM: '701618',            // Indicador de Pedidos Manufactureros
        IGoEC: '701570',          // Confianza Empresarial - Manufactura
        IMAI_MAN: '496156',       // IMAI - Industrias manufactureras (BIE/BISE compatible check)
        TREND: '701490',          // Indicador Agregado de Tendencia - Manufactura
        STAFF: '702094',          // Índice global de personal ocupado
    }
};

export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
