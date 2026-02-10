export enum SignalType {
    DECELERATION = 'ALERTA_DESACELERACION',
    TREND_CHANGE_NEG = 'CAMBIO_TENDENCIA_NEGATIVO',
    TREND_CHANGE_POS = 'CAMBIO_TENDENCIA_POSITIVO',
    CONTRACTION = 'ALERTA_CONTRACCION'
}

export interface AlertData {
    indicator_id: string;
    indicator_name?: string;
    alert_type: string;
    date: string;
    description: string;
    severity?: 'high' | 'medium' | 'low';
    value_change?: number;
}

export interface BusinessProfile {
    state: 'Nuevo León' | 'Estado de México' | 'Other';
    market: 'Export' | 'Domestic';
    dependency: 'Labor' | 'Logistics' | 'Raw Materials';
}

const TEMPLATES: Record<string, any> = {
    'ALERTA_DESACELERACION': {
        title: "Moderación en el ritmo de crecimiento",
        impact: "Se observa una pérdida de impulso en la actividad regional.",
        action: "Revisar proyecciones de flujo de caja y inventarios."
    },
    'CAMBIO_TENDENCIA_NEGATIVO': {
        title: "Cambio de Tendencia Detectado",
        impact: "Ruptura del patrón de los últimos meses hacia una fase de menor actividad.",
        action: "Priorizar retención de clientes y optimizar costos variables."
    },
    'ALERTA_CONTRACCION': {
        title: "Alerta de Contracción Crítica",
        impact: "Caída sostenida en la actividad industrial del sector.",
        action: "Medidas drásticas de ahorro y protección de liquidez."
    },
    'CAMBIO_TENDENCIA_POSITIVO': {
        title: "Oportunidad de Recuperación",
        impact: "El entorno está ganando tracción frente al promedio reciente.",
        action: "Preparar capacidad para aumento de pedidos."
    }
};

export function getAlertMeta(type: string) {
    return TEMPLATES[type] || { title: "Alerta Económica", impact: "Desviación relevante en los datos.", action: "Monitoreo estrecho." };
}
