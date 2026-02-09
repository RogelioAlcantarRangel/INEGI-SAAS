# INEGI API Data Fetcher

Este proyecto automatiza la descarga de indicadores económicos del INEGI y su almacenamiento en Supabase.

## Requisitos
- Node.js v18+
- Token de la API del INEGI ([Obtenlo aquí](https://www.inegi.org.mx/app/api/indicadores/#/registro))
- Proyecto en Supabase

## Configuración
1. Copia `.env.example` a `.env` y rellena las variables.
2. Ejecuta el script SQL en `setup.sql` dentro del editor SQL de Supabase para crear la tabla necesaria.

## Instalación
```bash
npm install
```

## Ejecución
```bash
npm start
```

## Automatización (GitHub Actions)
Puedes programar este script para que se ejecute diariamente o semanalmente usando un workflow de GitHub Actions:

Crea un archivo en `.github/workflows/update_indicators.yml`:

```yaml
name: Update INEGI Indicators
on:
  schedule:
    - cron: '0 0 * * 1' # Cada lunes a las 00:00
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm start
        env:
          INEGI_TOKEN: ${{ secrets.INEGI_TOKEN }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
```