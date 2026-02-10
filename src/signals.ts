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
    value_change?: number; // El valor numérico del cambio detectado
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

        // 1. CONTRACCIÓN (2 periodos de caída)
        if (currentVal < prevVal && values[i - 1] < values[i - 2]) {
            signals.push({
                indicator_id: sorted[i].indicator_id,
                type: SignalType.CONTRACTION,
                date: currentDate,
                description: 'Contracción absoluta detectada por 2 periodos consecutivos.',
                value_change: currentVal - prevVal
            });
        }

        // 2. CAMBIO DE TENDENCIA (Benchmark: SMA de los 3 meses PREVIOS)
        // El usuario identificó que para Enero 2026, la media es 48.04 (que es el promedio de Oct, Nov, Dic)
        const sma3_lagged = calculateSMA(values.slice(i - 3, i), 3);

        if (sma3_lagged !== null) {
            // Cruce hacia arriba: actual > tendencia previa, y anterior <= tendencia previa?
            // Simplificamos: si cruza la "línea de tendencia" (el promedio de los últimos 3 meses)
            if (currentVal > sma3_lagged && prevVal <= sma3_lagged) {
                signals.push({
                    indicator_id: sorted[i].indicator_id,
                    type: SignalType.TREND_CHANGE_POS,
                    date: currentDate,
                    description: `El indicador cruzó al alza su línea de tendencia (SMA3: ${sma3_lagged.toFixed(2)}).`,
                    value_change: currentVal - prevVal // Mantenemos delta vs t-1 para claridad del badge
                });
            } else if (currentVal < sma3_lagged && prevVal >= sma3_lagged) {
                signals.push({
                    indicator_id: sorted[i].indicator_id,
                    type: SignalType.TREND_CHANGE_NEG,
                    date: currentDate,
                    description: `El indicador cruzó a la baja su línea de tendencia (SMA3: ${sma3_lagged.toFixed(2)}).`,
                    value_change: currentVal - prevVal
                });
            }
        }

        // 3. DESACELERACIÓN
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
                description: 'Ritmo de crecimiento positivo pero inferior al promedio histórico reciente.',
                value_change: currentVal - prevVal
            });
        }
    }

    return signals;
}
