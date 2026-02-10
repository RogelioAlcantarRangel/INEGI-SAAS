import { supabase } from './config';

/**
 * Gestor de configuración dinámica.
 * Permite obtener valores desde Supabase para evitar redespliegues.
 */
export class ConfigManager {
    /**
     * Obtiene una clave de configuración desde la tabla app_config.
     */
    static async get(key: string, defaultValue: string = ''): Promise<string> {
        try {
            const { data, error } = await supabase
                .from('app_config')
                .select('config_value')
                .eq('config_key', key)
                .single();

            if (error || !data) {
                if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
                    console.warn(`⚠️ Error al leer config dinámica (${key}):`, error.message);
                }
                return defaultValue || process.env[key] || '';
            }

            return data.config_value;
        } catch (err) {
            console.error(`❌ Error crítico en ConfigManager (${key}):`, err);
            return defaultValue || process.env[key] || '';
        }
    }

    /**
     * Obtiene específicamente la API Key de Gemini con prioridad dinámica.
     */
    static async getGeminiKey(): Promise<string> {
        return this.get('GEMINI_API_KEY', process.env.GEMINI_API_KEY || '');
    }
}
