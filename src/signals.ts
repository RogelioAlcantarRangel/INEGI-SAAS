import { NormalizedData } from './fetchIndicator';

export enum SignalType {
    DECELERATION = 'ALERTA_DESACELERACION',
    TREND_CHANGE_NEG = 'CAMBIO_TENDENCIA_NEGATIVO',
    TREND_CHANGE_POS = 'CAMBIO_TENDENCIA_POSITIVO',
    CONTRACTION = 'ALERTA_CONTRACCION'
}

export interface Signal {
    indicator_id: string;
    type: SignalType;
    date: string;
    description: string;
}

/**
 * Calcula el promedio simple de los últimos 'period' valores.
 */
function calculateSMA(data: number[], period: number): number | null {
    if (data.length < period) return null;
    const slice = data.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

/**
 * Calcula la tasa de crecimiento t vs t-1.
 */
function getGrowthRate(current: number, previous: number): number {
    return (current - previous) / previous;
}

export function analyzeSeries(series: NormalizedData[]): Signal[] {
    const signals: Signal[] = [];
    if (series.length < 7) return []; // Necesitamos al menos 7 periodos para SMA3 y promedios de 6 meses

    // Ordenar por fecha por si acaso
    const sorted = [...series].sort((a, b) => a.date.localeCompare(b.date));
    const values = sorted.map(s => s.value);
    const dates = sorted.map(s => s.date);

    for (let i = 6; i < sorted.length; i++) {
        const currentVal = values[i];
        const prevVal = values[i - 1];
        const currentDate = dates[i];

        // 1. CONTRACCIÓN
        // 2 o más meses de caída absoluta
        if (currentVal < prevVal && values[i - 1] < values[i - 2]) {
            signals.push({
                indicator_id: sorted[i].indicator_id,
                type: SignalType.CONTRACTION,
                date: currentDate,
                description: 'Caída absoluta consecutiva en el indicador por 2 o más periodos.'
            });
        }

        // 2. CAMBIO DE TENDENCIA (SMA3)
        const sma3_curr = calculateSMA(values.slice(0, i + 1), 3);
        const sma3_prev = calculateSMA(values.slice(0, i), 3);

        if (sma3_curr !== null && sma3_prev !== null) {
            if (currentVal < sma3_curr && values[i - 1] >= sma3_prev) {
                signals.push({
                    indicator_id: sorted[i].indicator_id,
                    type: SignalType.TREND_CHANGE_NEG,
                    date: currentDate,
                    description: 'El indicador cruzó hacia abajo su media móvil de 3 meses.'
                });
            } else if (currentVal > sma3_curr && values[i - 1] <= sma3_prev) {
                signals.push({
                    indicator_id: sorted[i].indicator_id,
                    type: SignalType.TREND_CHANGE_POS,
                    date: currentDate,
                    description: 'El indicador cruzó hacia arriba su media móvil de 3 meses.'
                });
            }
        }

        // 3. DESACELERACIÓN
        // Crecimiento positivo pero menor al promedio de los últimos 6 meses por 2 periodos
        const growth_curr = getGrowthRate(currentVal, prevVal);
        const growth_prev = getGrowthRate(values[i - 1], values[i - 2]);

        const historicalGrowths = [];
        for (let j = i - 5; j <= i; j++) {
            historicalGrowths.push(getGrowthRate(values[j], values[j - 1]));
        }
        const avgGrowth6 = historicalGrowths.reduce((a, b) => a + b, 0) / historicalGrowths.length;

        if (growth_curr > 0 && growth_curr < avgGrowth6 && growth_prev < avgGrowth6) {
            signals.push({
                indicator_id: sorted[i].indicator_id,
                type: SignalType.DECELERATION,
                date: currentDate,
                description: 'Ritmo de crecimiento positivo pero inferior al promedio de los últimos 6 meses.'
            });
        }
    }

    return signals;
}
