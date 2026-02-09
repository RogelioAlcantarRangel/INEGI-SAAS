import { SignalType } from './signals';
import { AlertData } from './fetchIndicator';
import { BusinessProfile, getRegionalContext, getPersonalizedAdvice } from './personalization';

export type MessageTone = 'conservative' | 'neutral' | 'alarmist';

interface TranslationTemplate {
    title: string;
    impact: string;
    action: string;
}

const TEMPLATES: Record<SignalType, Record<MessageTone, TranslationTemplate>> = {
    [SignalType.DECELERATION]: {
        conservative: {
            title: "Moderación en el ritmo de crecimiento",
            impact: "Se observa una ligera pérdida de impulso en la actividad. Aunque el crecimiento es positivo, no se mantiene el ritmo de los últimos 6 meses.",
            action: "Mantener monitoreo de costos operativos sin realizar ajustes estructurales inmediatos."
        },
        neutral: {
            title: "Alerta de Desaceleración Detectada",
            impact: "El indicador muestra un crecimiento por debajo de su tendencia histórica reciente (promedio 6 meses). Esto suele preceder un estancamiento en la demanda.",
            action: "Revisar proyecciones de flujo de caja para el próximo trimestre y optimizar inventarios."
        },
        alarmist: {
            title: "CRÍTICO: Pérdida sostenida de momentum",
            impact: "La desaceleración es clara y peligrosa. El sistema está perdiendo energía rápidamente y el riesgo de contracción en el corto plazo es alto.",
            action: "Suspender contrataciones no críticas y renegociar plazos con proveedores clave de inmediato."
        }
    },
    [SignalType.TREND_CHANGE_NEG]: {
        conservative: {
            title: "Ajuste en la trayectoria reciente",
            impact: "El valor ha cruzado por debajo de su media de corto plazo. Podría ser una fluctuación estacional.",
            action: "Validar si este movimiento se refleja en sus pedidos internos actuales."
        },
        neutral: {
            title: "Cambio de Tendencia Negativo",
            impact: "Ruptura del patrón de los últimos 3 meses. El entorno está cambiando de dirección hacia una fase de menor actividad.",
            action: "Ajustar la estrategia de ventas y priorizar la retención de clientes actuales sobre la expansión."
        },
        alarmist: {
            title: "SEÑAL DE ALERTA: Ruptura de Soporte Económico",
            impact: "El entorno ha roto su trayectoria de soporte. Estamos ante un cambio estructural que invalidará presupuestos anteriores.",
            action: "Ejecutar plan de contingencia por baja demanda y reducir exposición a deuda variable."
        }
    },
    [SignalType.TREND_CHANGE_POS]: {
        conservative: {
            title: "Leve mejora en el entorno",
            impact: "El indicador empieza a mostrar señales de recuperación por encima de su media reciente.",
            action: "Preparar capacidad instalada para un posible aumento moderado de carga."
        },
        neutral: {
            title: "Cambio de Tendencia Positivo",
            impact: "Recuperación confirmada frente al promedio de los últimos 3 meses. El sector está ganando tracción.",
            action: "Considerar inversiones ligeras en marketing o mejora de procesos para capitalizar la subida."
        },
        alarmist: {
            title: "OPORTUNIDAD: Aceleración del Mercado",
            impact: "El entorno está rebotando con fuerza. Quienes no se muevan rápido perderán cuota de mercado.",
            action: "Acelerar planes de expansión y asegurar suministro de insumos críticos ante posible escasez por demanda."
        }
    },
    [SignalType.CONTRACTION]: {
        conservative: {
            title: "Contracción detectada en el sector",
            impact: "El indicador ha caído por dos meses consecutivos. Es necesario vigilar la rentabilidad.",
            action: "Revisar márgenes y buscar eficiencias en la cadena de suministro."
        },
        neutral: {
            title: "ALERTA: Fase de Contracción Económica",
            impact: "Caída sostenida en la actividad. El mercado se está encogiendo, lo que impactará directamente su volumen de negocio.",
            action: "Reducir gastos administrativos y enfocarse en productos de alta rotación y margen seguro."
        },
        alarmist: {
            title: "PELIGRO: Recesión e Impacto Inminente",
            impact: "La caída es profunda y persistente. La viabilidad operativa del sector está bajo gran presión logística y financiera.",
            action: "Medidas drásticas de ahorro. Proteger liquidez a toda costa y prepararse para un escenario de baja facturación prolongada."
        }
    }
};

export function generateExecutiveMessage(
    alert: AlertData,
    tone: MessageTone = 'neutral',
    profile?: BusinessProfile
): string {
    const signalType = alert.alert_type as SignalType;
    const template = TEMPLATES[signalType]?.[tone];

    if (!template) {
        return `Se ha detectado una alerta de tipo ${alert.alert_type} para el indicador ${alert.indicator_id} en la fecha ${alert.date}.`;
    }

    let message = `
📊 **${template.title}**
📅 Fecha: ${alert.date}
🔍 **Análisis:** ${template.impact}
💡 **Acción recomendada:** ${template.action}
    `.trim();

    if (alert.description && alert.description !== template.impact) {
        // Separar descripción técnica del análisis de IA si existe
        const parts = alert.description.split('🤖 **Análisis Gemini:**');
        const technicalDetail = parts[0].trim();
        const aiInsight = parts[1] ? parts[1].trim() : null;

        if (technicalDetail && technicalDetail !== template.impact) {
            message += `\n\n📖 **Detalle Técnico:** ${technicalDetail}`;
        }

        if (aiInsight) {
            message += `\n\n🤖 **Análisis Estratégico Gemini:** ${aiInsight}`;
        }
    }

    if (profile) {
        const regionalContext = getRegionalContext(profile);
        const personalizedAdvice = getPersonalizedAdvice(profile, alert.alert_type);

        message += `\n\n📍 **Contexto para ${profile.state}:** ${regionalContext}`;
        message += `\n🎯 **Para su negocio:** ${personalizedAdvice}`;
    }

    return message;
}
