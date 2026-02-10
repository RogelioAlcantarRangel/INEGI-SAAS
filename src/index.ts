import { CONFIG } from './config';
import { fetchFromInegi, saveToSupabase, saveAlertsToSupabase, AlertData } from './fetchIndicator';
import { analyzeSeries } from './signals';
import { generateExecutiveMessage } from './translator';
import { BusinessProfile } from './personalization';
import { generateFullReport } from './reporter';
import { fetchLiveIndicatorsBatch, enhanceInsightsBatch } from './geminiService';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    console.log('🚀 Iniciando sincronización de indicadores INEGI... (BISE & Gemini-3 Edition)');

    // Simulando perfil registrado del usuario (Onboarding)
    const userProfile: BusinessProfile = {
        state: 'Nuevo León',
        market: 'Export',
        dependency: 'Logistics'
    };

    const indicatorKeys = Object.keys(CONFIG.INDICATORS) as Array<keyof typeof CONFIG.INDICATORS>;
    const allAlerts: AlertData[] = [];

    for (const key of indicatorKeys) {
        const id = CONFIG.INDICATORS[key];
        console.log(`\nConsultando ${key} (ID: ${id})...`);

        try {
            const data = await fetchFromInegi(id);
            console.log(`[DEBUG] ${key}: Recibidos ${data.length} puntos de datos.`);
            if (data.length > 0) {
                console.log(`Obtenidos ${data.length} registros. Guardando en Supabase...`);
                await saveToSupabase(data);

                console.log(`Analizando señales para ${key}...`);
                const signals = analyzeSeries(data);
                if (signals.length > 0) {
                    console.log(`Detectadas ${signals.length} señales. Guardando alertas...`);
                    const meta = CONFIG.INDICATOR_META[key] || { name: key, importance: 'medium' };

                    const alerts = signals.map(s => ({
                        indicator_id: s.indicator_id,
                        indicator_name: meta.name,
                        alert_type: s.type,
                        date: s.date,
                        description: s.description,
                        severity: meta.importance,
                        value_change: s.value_change
                    }));
                    await saveAlertsToSupabase(alerts);
                    allAlerts.push(...alerts);

                    // Log rápido para consola
                    const lastAlert = alerts[alerts.length - 1];
                    console.log(`Última alerta: ${lastAlert.alert_type} (${lastAlert.date})`);
                } else {
                    console.log(`No se detectaron señales de tensión para ${key}.`);
                }
            } else {
                console.log(`⚠️ No se obtuvieron datos para ${key}.`);
            }
        } catch (err: any) {
            console.error(`❌ Error en el procesamiento de ${key}:`, err.message);
        }
    }

    // --- FASE 8: INDICADORES EN TIEMPO REAL (GEMINI - BATCH) ---
    console.log('\n--- Consultando Indicadores Complementarios (Gemini Batch) ---');
    const liveIndicatorNames = ['Tasa de interés Banxico', 'Precio del Acero'];

    try {
        const liveData = await fetchLiveIndicatorsBatch(liveIndicatorNames, userProfile.state);

        if (liveData.length > 0) {
            console.log(`Obtenidos ${liveData.length} puntos de datos de Gemini. Guardando...`);
            await saveToSupabase(liveData);

            // Analizar cada indicador por separado para señales
            for (const name of liveIndicatorNames) {
                const id = `GEMINI_${name.toUpperCase().replace(/\s+/g, '_')}`;
                const indicatorData = liveData.filter(d => d.indicator_id === id);

                if (indicatorData.length > 0) {
                    const liveSignals = analyzeSeries(indicatorData);
                    if (liveSignals.length > 0) {
                        const alerts = liveSignals.map(s => ({
                            indicator_id: s.indicator_id,
                            alert_type: s.type,
                            date: s.date,
                            description: s.description
                        }));
                        await saveAlertsToSupabase(alerts);
                        allAlerts.push(...alerts);
                        console.log(`Alertas detectadas en datos vivos (${name}).`);
                    }
                }
            }
        }
    } catch (err: any) {
        console.error(`❌ Error en Gemini Batch:`, err.message);
    }

    // Filtrar solo alertas recientes (ej: últimos 12 meses) y tomar solo las TOP 5 para cuidar la cuota
    const recentAlerts = allAlerts
        .filter(a => {
            const year = parseInt(a.date.split('/')[0]);
            return year >= 2025; // Solo 2025 y adelante
        })
        .sort((a, b) => b.date.localeCompare(a.date)) // Más recientes primero
        .slice(0, 5); // Máximo 5 alertas para Gemini

    let enhancedAlerts: AlertData[] = [];
    if (recentAlerts.length > 0) {
        console.log(`\n--- Mejorando análisis estratégico con Gemini Batch ---`);
        console.log(`Enviando las TOP ${recentAlerts.length} alertas más recientes a Gemini para análisis...`);
        try {
            enhancedAlerts = await enhanceInsightsBatch(recentAlerts, userProfile);
        } catch (err: any) {
            console.error(`⚠️ No se pudo obtener análisis de IA (Quota/Error):`, err.message);
            enhancedAlerts = recentAlerts; // Seguir con las alertas básicas
        }
    }

    // Generar reporte final
    if (enhancedAlerts.length > 0) {
        console.log('\n Generating full executive report with AI insights...');
        const report = generateFullReport({
            profile: userProfile,
            alerts: enhancedAlerts,
            indicators: {}
        });

        const reportPath = path.join(__dirname, '../reports/executive_report.md');
        fs.writeFileSync(reportPath, report);
        console.log(`✅ Reporte guardado en: ${reportPath}`);
    } else {
        console.log('\nℹ️ No hay alertas detectadas para generar reporte.');
    }

    console.log('\n✅ Sincronización finalizada.');
}

main().catch(err => {
    console.error('❌ Error fatal en la ejecución:', err);
    process.exit(1);
});
