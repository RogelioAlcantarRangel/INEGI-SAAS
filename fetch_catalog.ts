import axios from 'axios';
import { CONFIG } from './src/config';

async function fetchCatalog() {
    const token = CONFIG.INEGI_TOKEN;
    // Intentando obtener el catálogo de indicadores (CL_INDICATOR es un nombre común de catálogo)
    // O probando con la búsqueda de metadatos si está disponible
    const catalogs = ['CL_INDICATOR', 'CL_INDICADOR', 'INDICATORS'];

    for (const cat of catalogs) {
        const url = `https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/${cat}/null/es/BISE/2.0/${token}?type=json`;
        console.log(`Probando catálogo: ${cat}...`);
        try {
            const resp = await axios.get(url);
            console.log(`✅ OK! Catálogo ${cat} encontrado.`);
            const codes = resp.data.CODE || [];
            console.log(`Encontrados ${codes.length} elementos.`);
            const manufactura = codes.filter((c: any) =>
                c.Description.toLowerCase().includes('manufactur') ||
                c.Description.toLowerCase().includes('ipm')
            );
            console.log(`Encontrados ${manufactura.length} indicadores de manufactura.`);
            const fs = require('fs');
            fs.writeFileSync('indicators_manufactura.json', JSON.stringify(manufactura, null, 2));
            console.log('Resultados guardados en indicators_manufactura.json');
            break;
        } catch (e: any) {
            console.log(`❌ Error en ${cat}:`, e.response?.status || e.message);
        }
    }
}

fetchCatalog();
