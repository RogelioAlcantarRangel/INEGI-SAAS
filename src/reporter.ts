import { AlertData, NormalizedData } from './fetchIndicator';
import { BusinessProfile } from './personalization';
import { generateExecutiveMessage } from './translator';
import { SignalType } from './signals';

export interface ReportContext {
    profile: BusinessProfile;
    alerts: AlertData[];
    indicators: Record<string, NormalizedData[]>;
}

export function generateFullReport(context: ReportContext): string {
    const { profile, alerts } = context;
    const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    let report = `# Context Engine | Reporte Ejecutivo de Situación\n`;
    report += `**Cliente:** [Nombre de Empresa]  \n`;
    report += `**Perfil:** ${profile.state} | ${profile.market} | ${profile.dependency}  \n`;
    report += `**Fecha:** ${date}\n\n`;
    report += `---\n\n`;

    // 1. RESUMEN EJECUTIVO
    report += `## 1. Resumen Ejecutivo\n`;
    if (alerts.length === 0) {
        report += `El entorno regional se mantiene estable. No se han detectado desviaciones significativas en los indicadores monitoreados que sugieran tensiones operativas inmediatas.\n\n`;
    } else {
        const hasContraction = alerts.some(a => a.alert_type === SignalType.CONTRACTION);
        const hasDeceleration = alerts.some(a => a.alert_type === SignalType.DECELERATION);

        report += `El entorno manufacturero en **${profile.state}** muestra señales de `;
        if (hasContraction) report += `**contracción crítica**`;
        else if (hasDeceleration) report += `**desaceleración preventiva**`;
        else report += `**inestabilidad moderada**`;

        report += `. Se recomienda atención inmediata a las tensiones detectadas en la cadena de valor.\n\n`;
    }

    report += `---\n\n`;

    // 2. TENSIONES DETECTADAS
    report += `## 2. Tensiones Detectadas\n\n`;
    if (alerts.length === 0) {
        report += `*No hay alertas activas en este periodo.*\n\n`;
    } else {
        alerts.forEach(alert => {
            report += `${generateExecutiveMessage(alert, 'neutral', profile)}\n\n`;
        });
    }

    report += `---\n\n`;

    // 3. PERSPECTIVA ESTRATÉGICA
    report += `## 3. Perspectiva Estratégica\n`;
    report += `Basado en el cruce de indicadores, el sistema identifica que su dependencia en **${profile.dependency}** `;
    if (alerts.length > 0) {
        report += `está entrando en una zona de riesgo. Históricamente, este patrón en ${profile.state} precede ajustes operativos importantes en un horizonte de 60 a 90 días.`;
    } else {
        report += `se encuentra dentro de parámetros normales de operación regional.`;
    }
    report += `\n\n---\n\n`;

    // 4. ACCIONES SUGERIDAS PARA DIRECCIÓN
    report += `## 4. Acciones Sugeridas para Dirección\n`;
    if (alerts.length > 0) {
        report += `1. **Protección de Liquidez**: Evaluar la exposición bancaria ante posibles cambios en tasas por volatilidad sectorial.\n`;
        report += `2. **Eficiencia en ${profile.dependency}**: Implementar medidas de optimización inmediata antes de que la tensión se profundice.\n`;
        report += `3. **Comunicación**: Informar a los responsables de área sobre la posible necesidad de ajustar presupuestos de gastos variables.\n`;
    } else {
        report += `1. **Mantener Continuidad**: No se requieren ajustes estructurales.\n`;
        report += `2. **Optimización de Márgenes**: Buen momento para buscar eficiencias internas mientras el entorno es favorable.\n`;
    }

    report += `\n---\n*Este reporte fue generado automáticamente por el Motor de Contexto de Context Engine.*\n`;

    return report;
}
