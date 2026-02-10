import axios from 'axios';
import { CONFIG, supabase } from './config';

export interface InegiObservation {
    TIME_PERIOD: string;
    OBS_VALUE: string;
}

export interface NormalizedData {
    indicator_id: string;
    date: string;
    value: number;
}

export interface AlertData {
    indicator_id: string;
    indicator_name?: string; // Nombre legible
    alert_type: string;
    date: string;
    description: string;
    severity?: 'high' | 'medium' | 'low';
    value_change?: number;
}

export async function fetchFromInegi(indicatorId: string, source: string = 'BISE') {
    const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${indicatorId}/es/00/false/${source}/2.0/${CONFIG.INEGI_TOKEN}?type=json`;

    try {
        const response = await axios.get(url);
        const series = response.data?.Series;

        if (!series || series.length === 0) {
            throw new Error(`No se encontraron datos para el indicador ${indicatorId}`);
        }

        const observations: InegiObservation[] = series[0].OBSERVATIONS;
        return observations.map(obs => ({
            indicator_id: indicatorId,
            date: obs.TIME_PERIOD,
            value: parseFloat(obs.OBS_VALUE)
        }));
    } catch (error: any) {
        if (error.response) {
            console.error(`Error al consultar INEGI (${indicatorId}):`, error.response.status, JSON.stringify(error.response.data).substring(0, 200));
        } else {
            console.error(`Error al consultar INEGI (${indicatorId}):`, error.message);
        }
        return [];
    }
}

export async function saveToSupabase(data: NormalizedData[]) {
    if (data.length === 0) return;

    const { error } = await supabase
        .from('economic_signals')
        .upsert(data, { onConflict: 'indicator_id, date' });

    if (error) {
        console.error('Error al guardar en Supabase:', error.message);
    } else {
        console.log(`Guardados ${data.length} registros de señales exitosamente.`);
    }
}

export async function saveAlertsToSupabase(alerts: AlertData[]) {
    if (alerts.length === 0) return;

    const { error } = await supabase
        .from('economic_alerts')
        .upsert(alerts, { onConflict: 'indicator_id, alert_type, date' });

    if (error) {
        console.error('Error al guardar alertas en Supabase:', error.message);
    } else {
        console.log(`Guardadas ${alerts.length} alertas exitosamente.`);
    }
}
