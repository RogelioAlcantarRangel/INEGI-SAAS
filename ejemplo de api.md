# inegi_api.py
"""
Módulo para interactuar con la API de Indicadores del INEGI (v2.0)
Documentación oficial: https://www.inegi.org.mx/servicios/api_indicadores.html

Este módulo está diseñado para ser usado con token válido,
obtenido en: https://www.inegi.org.mx/app/api/indicadores/#/registro
"""

import os
import requests
import certifi

from catalogo_inegi import obtener_catalogo_completo, buscar_por_id

# ====================================================================
# CONFIGURACIÓN
# ====================================================================

INEGI_TOKEN = os.getenv("INEGI_TOKEN", "").strip()
if not INEGI_TOKEN:
    print("⚠️ ADVERTENCIA: INEGI_TOKEN no configurado en variables de entorno")

# Ruta base oficial para la API de indicadores v2.0
BASE_URL = "https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR"

HEADERS = {
    "Accept": "application/json",
    "User-Agent": "INEGI-Gemini-App/1.0"
}

VERIFY_SSL = certifi.where()

# ====================================================================
# FUNCIONES PRINCIPALES
# ====================================================================

def obtener_indicadores():
    """
    Devuelve el catálogo local (obtener_catalogo_completo debe estar
    definido en catalogo_inegi.py). No llama a la API.
    """
    return obtener_catalogo_completo()


def generar_url_inegi(
    id_indicador,
    idioma="es",
    area_geo="00",
    recientes=False,
    fuente="BISE",
    version="2.0",
    formato="json"
):
    """
    Genera la URL final para consultar la API oficial del INEGI.
    
    Argumentos:
      - id_indicador (str): ID del indicador (ej: "1002000001")
      - idioma (str): "es" o "en"
      - area_geo (str): por documentación "00" para nacional
      - recientes (bool): True = último dato, False = serie histórica
      - fuente (str): típicamente "BISE"
      - version (str): típicamente "2.0"
      - formato (str): "json", "xml", "jsonp"
    """
    recientes_str = "true" if recientes else "false"
    return (
        f"{BASE_URL}/{id_indicador}/{idioma}/{area_geo}/{recientes_str}/"
        f"{fuente}/{version}/{INEGI_TOKEN}?type={formato}"
    )


def obtener_datos_indicador(
    id_indicador,
    area_geo="00",
    dato_reciente=False,
    fuente="BISE",
    version="2.0",
    formato="json",
    idioma="es"
):
    """
    Consulta la API del INEGI para un indicador específico.
    """
    if not INEGI_TOKEN:
        print("⚠️ No hay token configurado. Revisa tu variable de entorno INEGI_TOKEN.")
        return None

    url = generar_url_inegi(
        id_indicador,
        idioma=idioma,
        area_geo=area_geo,
        recientes=dato_reciente,
        fuente=fuente,
        version=version,
        formato=formato
    )

    print(f"DEBUG: Consultando indicador {id_indicador}")
    print(f"DEBUG: URL final: {url}")

    try:
        resp = requests.get(url, headers=HEADERS, timeout=20, verify=VERIFY_SSL)
        print(f"DEBUG: Status HTTP {resp.status_code}")

        if resp.status_code != 200:
            # Mostrar el body parcial si no es 200
            body = resp.text[:800]
            print(f"⚠️ Respuesta no 200:\n{body}")
            return None

        return resp.json()

    except requests.exceptions.RequestException as e:
        print(f"⚠️ Error al consultar indicador {id_indicador}: {e}")
        return None


def procesar_datos(datos_crudos, ultimos_n=12):
    """
    Normaliza la respuesta cruda de la API a una lista de dicts
    con clave "fecha" y "valor".
    """
    if not datos_crudos:
        return []

    resultado = []
    try:
        series = datos_crudos.get("Series", [])
        if not isinstance(series, list) or len(series) == 0:
            print("⚠️ Estructura inesperada: 'Series' no es lista o está vacía")
            return []

        obs = series[0].get("OBSERVATIONS", [])
        if not isinstance(obs, list):
            print("⚠️ Estructura inesperada: 'OBSERVATIONS' no es una lista")
            return []

        for item in obs[-ultimos_n:]:
            fecha = item.get("TIME_PERIOD")
            raw_val = item.get("OBS_VALUE")
            if fecha is None or raw_val is None:
                continue
            try:
                valor = float(raw_val)
            except Exception:
                valor = raw_val
            resultado.append({"fecha": fecha, "valor": valor})

    except Exception as e:
        print(f"⚠️ Error normalizando datos: {e}")

    return resultado


def obtener_metadatos_indicador(id_indicador):
    """
    Devuelve los metadatos de un indicador desde catálogo local.
    """
    return buscar_por_id(id_indicador)


# ====================================================================
# UTILIDADES / TEST
# ====================================================================

def verificar_token():
    if not INEGI_TOKEN:
        print("❌ Token no configurado.")
        return False
    print(f"✓ Token configurado ({len(INEGI_TOKEN)} caracteres)")
    return True


def test_conexion(id_indicador="1002000001"):
    """
    Prueba rápida de conexión a la API del INEGI.
    """
    print("\n========== TEST DE CONEXIÓN ==========")
    if not verificar_token():
        return False

    print(f"Probando indicador: {id_indicador}")
    datos = obtener_datos_indicador(id_indicador, area_geo="00")
    if not datos:
        print("❌ No se recibieron datos de la API.")
        return False

    procesados = procesar_datos(datos, ultimos_n=5)
    if not procesados:
        print("⚠️ No se procesaron observaciones.")
        return False

    print("✅ Conexión exitosa. Últimos valores:")
    for i in procesados:
        print(f"  {i['fecha']}: {i['valor']}")
    return True


if __name__ == "__main__":
    test_conexion()
