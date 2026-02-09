import axios from 'axios';
import { CONFIG } from './src/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function testInegi(fuente: string) {
    const id = '6207061433';
    const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${id}/es/00/false/${fuente}/2.0/${CONFIG.INEGI_TOKEN}?type=json`;
    console.log(`Probando INEGI con fuente ${fuente}...`);
    try {
        const resp = await axios.get(url);
        console.log(`✅ Resultado ${fuente}: OK (Status ${resp.status})`);
        return true;
    } catch (e: any) {
        console.log(`❌ Resultado ${fuente}: Error ${e.response?.status || e.message}`);
        return false;
    }
}

async function testGemini(modelName: string) {
    console.log(`Probando Gemini API con modelo: ${modelName}...`);
    const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hola");
        console.log(`✅ Gemini (${modelName}): OK`);
        return true;
    } catch (e: any) {
        console.log(`❌ Gemini (${modelName}): Error`, e.message);
        return false;
    }
}

async function run() {
    console.log('Token INEGI longitud:', CONFIG.INEGI_TOKEN.length);
    console.log('Token Gemini longitud:', CONFIG.GEMINI_API_KEY.length);

    await testInegi('BIE');
    await testGemini('gemini-1.5-flash');
    await testGemini('gemini-1.5-flash-latest');
    await testGemini('gemini-pro');
}

run();
