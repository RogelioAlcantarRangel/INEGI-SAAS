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
        IMAI_MAN: '496156',       // IMAI - Industrias manufactureras
        TREND: '701490',          // Indicador Agregado de Tendencia - Manufactura
        STAFF: '702094',          // Índice global de personal ocupado
    },
    // Metadatos para transformar IDs técnicos en nombres de negocio
    INDICATOR_META: {
        '701618': { name: 'Pedidos Manufactureros', importance: 'high', unit: 'ptos' },
        '701570': { name: 'Confianza Empresarial', importance: 'medium', unit: 'ptos' },
        '496156': { name: 'Producción Industrial (IMAI)', importance: 'high', unit: 'índice' },
        '701490': { name: 'Tendencia Manufacturera', importance: 'medium', unit: 'índice' },
        '702094': { name: 'Personal Ocupado', importance: 'high', unit: 'índice' }
    } as Record<string, { name: string, importance: 'high' | 'medium' | 'low', unit: string }>
};

export const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
