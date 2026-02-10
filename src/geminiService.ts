import { GoogleGenAI } from '@google/genai';
import { CONFIG } from './config';
import { ConfigManager } from './config_manager';
import { NormalizedData } from './fetchIndicator';
import { AlertData, BusinessProfile } from './lib/types';

// Gemini 3 Flash Migration - Standard Pattern v2026
const MODEL_NAME = "gemini-3-flash-preview";

export async function fetchLiveIndicator(indicatorName: string, region: string): Promise<NormalizedData[]> {
    const dynamicKey = await ConfigManager.getGeminiKey();
    const ai = new GoogleGenAI({ apiKey: dynamicKey || CONFIG.GEMINI_API_KEY });

    const prompt = `
        Actúa como un analista económico experto para Monterrey, NL. Proporciona los valores mensuales más recientes (últimos 12 meses) del siguiente indicador económico: "${indicatorName}" para la región: "${region}".
        El formato debe ser estrictamente un JSON array de objetos con las propiedades "date" (YYYY-MM) y "value" (número).
        No incluyas texto adicional, solo el JSON.
        Si no tienes el dato exacto, proporciona una estimación basada en las tendencias actuales del mercado.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt
        });

        const responseText = response.text || "";
        const cleanedJson = responseText.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleanedJson);

        return data.map((item: any) => ({
            indicator_id: `GEMINI_${indicatorName.toUpperCase().replace(/\s+/g, '_')}`,
            date: item.date,
            value: item.value
        }));
    } catch (error: any) {
        console.error(`Error al consultar Gemini para ${indicatorName}:`, error.message);
        return [];
    }
}

export async function enhanceInsight(alert: AlertData, profile: BusinessProfile): Promise<string> {
    const dynamicKey = await ConfigManager.getGeminiKey();
    const ai = new GoogleGenAI({ apiKey: dynamicKey || CONFIG.GEMINI_API_KEY });

    const prompt = `
        Contexto del Negocio:
        - Ubicación: ${profile.state} (Monterrey/NL Focus)
        - Mercado: ${profile.market}
        - Dependencia Crítica: ${profile.dependency}

        Alerta Detectada:
        - Tipo: ${alert.alert_type}
        - Indicador: ${alert.indicator_id} (${alert.indicator_name})
        - Fecha: ${alert.date}
        - Descripción Técnica: ${alert.description}

        Tarea:
        Escribe un breve comentario ejecutivo (máximo 250 caracteres) que aporte "perspicacia" estratégica real. 
        Cruza este dato técnico con la situación económica actual de Monterrey (Nearshoring, logística, energía). 
        Habla directamente al CEO. No uses lenguaje genérico.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt
        });
        return (response.text || "").trim();
    } catch (error: any) {
        console.error(`Error al mejorar el insight con Gemini:`, error.message);
        return "Atención: La señal técnica sugiere un ajuste preventivo en la estrategia de corto plazo.";
    }
}
export async function fetchLiveIndicatorsBatch(indicatorNames: string[], region: string): Promise<NormalizedData[]> {
    const dynamicKey = await ConfigManager.getGeminiKey();
    const ai = new GoogleGenAI({ apiKey: dynamicKey || CONFIG.GEMINI_API_KEY });

    const prompt = `
        Actúa como un analista económico experto. Proporciona los valores mensuales más recientes (últimos 12 meses) de los siguientes indicadores económicos: ${indicatorNames.map(n => `"${n}"`).join(', ')} para la región: "${region}".
        El formato debe ser estrictamente un objeto JSON con las claves de los nombres de los indicadores, y cada valor debe ser un JSON array de objetos con las propiedades "date" (YYYY-MM) y "value" (número).
        
        Ejemplo de formato esperado:
        {
          "${indicatorNames[0]}": [{"date": "2023-12", "value": 10.5}, ...],
          "${indicatorNames[1]}": [...]
        }

        No incluyas texto adicional, solo el JSON puro.
        Si no tienes el dato exacto, proporciona una estimación basada en las tendencias actuales del mercado.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt
        });
        const responseText = response.text || "";
        const cleanedJson = responseText.replace(/```json|```/g, '').trim();
        const batchData = JSON.parse(cleanedJson);

        const allNormalized: NormalizedData[] = [];
        for (const name of indicatorNames) {
            const data = batchData[name] || [];
            allNormalized.push(...data.map((item: any) => ({
                indicator_id: `GEMINI_${name.toUpperCase().replace(/\s+/g, '_')}`,
                date: item.date,
                value: item.value
            })));
        }

        return allNormalized;
    } catch (error: any) {
        console.error(`Error al consultar Gemini Batch:`, error.message);
        return [];
    }
}

export async function enhanceInsightsBatch(alerts: AlertData[], profile: BusinessProfile): Promise<AlertData[]> {
    if (alerts.length === 0) return [];

    const dynamicKey = await ConfigManager.getGeminiKey();
    const ai = new GoogleGenAI({ apiKey: dynamicKey || CONFIG.GEMINI_API_KEY });

    const prompt = `
        Contexto del Negocio:
        - Ubicación: ${profile.state}
        - Mercado: ${profile.market}
        - Dependencia Crítica: ${profile.dependency}

        Alertas Detectadas:
        ${alerts.map((a, i) => `ID ${i}: [${a.indicator_id}] ${a.alert_type} (${a.date}). Detalle: ${a.description}`).join('\n')}

        Tarea:
        Escribe un breve comentario ejecutivo (máximo 250 caracteres por alerta) para CADA alerta anterior que aporte "perspicacia" estratégica. 
        Cruza cada dato técnico con la situación económica actual.
        Devuelve un objeto JSON donde las llaves sean el ID (0, 1, 2...) y el valor sea el comentario estratégico.
        
        No incluyas texto adicional, solo el JSON puro. Tono CEO.
    `;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt
        });
        const responseText = response.text || "";
        const cleanedJson = responseText.replace(/```json|```/g, '').trim();
        const insightsMap = JSON.parse(cleanedJson);

        return alerts.map((alert, i) => ({
            ...alert,
            ai_strategy: insightsMap[i] || 'Señal técnica validada. Se recomienda monitoreo de inventarios.'
        }));
    } catch (error: any) {
        console.error(`Error al mejorar insights batch:`, error.message);
        return alerts;
    }
}
