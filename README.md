# 📡 Radar Macro / Context Engine (Estado Real de la Demo)

Esta es la documentación técnica del estado actual del proyecto desplegado en `https://inegi-saas.vercel.app/`.

## 🚀 Lo que ves en vivo hoy
Actualmente, el sitio web muestra la **Capa de Señales** operativa, pero en su fase de prototipo técnico:

1.  **Indicadores Crudos**: Las tarjetas muestran IDs numéricos del INEGI (e.g., `701618`) en lugar de nombres comerciales. El mapeo a nombres legibles está programado pero requiere una nueva sincronización de datos.
2.  **Señales Matemáticas**: El "Cerebro" ya calcula y muestra alertas reales basadas en los datos de **Enero 2026** (BISE v2.0). 
    *   `CAMBIO TENDENCIA POSITIVO`: Detectado por cruce de medias móviles.
    *   `ALERTA CONTRACCION`: Detectado por caídas consecutivas.
3.  **Análisis Estructural**: Mensajes predefinidos basados en la lógica técnica de cada señal.
4.  **Estado de Gemini AI**: La integración está lista en el código, pero las tarjetas actuales no muestran el badge 🤖 debido a que se alcanzó el límite de cuota gratuita (Error 429) durante las últimas pruebas.

## 🏗️ Cómo funciona por detrás

### Flujo de Datos
1.  **Extracción**: `src/index.ts` jala datos de la API v2.0 del INEGI.
2.  **Análisis**: `src/signals.ts` detecta las anomalías.
3.  **Persistencia**: Se guardan en **Supabase** (Tablas `economic_signals` y `economic_alerts`).
4.  **Visualización**: El Frontend en Next.js consulta Supabase y renderiza las tarjetas con **Framer Motion**.

## 🛠️ Comandos de Mantenimiento

### Actualizar API Key de Gemini
Para restaurar los análisis de IA sin redesplegar, usa el SQL Editor de Supabase:
```sql
INSERT INTO app_config (config_key, config_value) 
VALUES ('GEMINI_API_KEY', 'TU_NUEVA_LLAVE')
ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value;
```

### Forzar Sincronización de Datos
```bash
npm start
```

## � Limitaciones Actuales a Resolver
- [ ] Cambiar IDs técnicos (`701618`) por nombres humanos (*Producción de Autopartes*).
- [ ] Implementar la sección regional específica para **Monterrey**.
- [ ] Restaurar la conexión estable de Gemini con la nueva clave dinámica.