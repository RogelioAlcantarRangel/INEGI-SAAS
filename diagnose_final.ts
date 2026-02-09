import axios from 'axios';
import { CONFIG } from './src/config';

async function testFinal() {
    const id = '701618'; // IPM General BISE
    const token = CONFIG.INEGI_TOKEN;
    const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/${id}/es/00/false/BISE/2.0/${token}?type=json`;

    console.log('Probando URL (v2.0 Ejemplo):', url);
    try {
        const resp = await axios.get(url);
        console.log('✅ OK! Status:', resp.status);
        console.log('Primeras observaciones:', JSON.stringify(resp.data.Series[0].OBSERVATIONS.slice(0, 2)));
    } catch (e: any) {
        console.log('❌ Error:', e.response?.status || e.message);
        if (e.response) {
            console.log('Body:', JSON.stringify(e.response.data));
        }
    }
}

testFinal();
