export interface BusinessProfile {
    state: 'Nuevo León' | 'Estado de México' | 'Other';
    market: 'Export' | 'Domestic';
    dependency: 'Labor' | 'Logistics' | 'Raw Materials';
}

export function getRegionalContext(profile: BusinessProfile): string {
    const { state, market } = profile;

    if (state === 'Nuevo León') {
        if (market === 'Export') {
            return "Su operación en Nuevo León está altamente vinculada a la demanda de EE.UU. e indicadores IMMEX. Cualquier señal de desaceleración aquí impacta directamente su capacidad exportadora.";
        }
        return "Nuevo León, aunque orientado a la exportación, presenta retos de costos locales. Su mercado doméstico depende de la derrama económica de las grandes manufactureras.";
    }

    if (state === 'Estado de México') {
        return "El Estado de México (ej. Toluca) se especializa en valor agregado y mercado interno. Las variaciones en costos de insumos y consumo doméstico son críticas para su rentabilidad.";
    }

    return "Contexto regional general: Monitoree las tendencias sectoriales nacionales para anticipar ajustes en su cadena de valor.";
}

export function getPersonalizedAdvice(profile: BusinessProfile, alertType: string): string {
    const { dependency } = profile;

    if (alertType.includes('CONTRACTION') || alertType.includes('DECELERATION')) {
        switch (dependency) {
            case 'Labor':
                return "Dado que su dependencia crítica es la mano de obra, considere esquemas de flexibilidad laboral antes de reducir plantilla.";
            case 'Logistics':
                return "Optimice rutas y consolide envíos; la baja en la actividad sectorial podría afectar las tarifas de flete.";
            case 'Raw Materials':
                return "Revise sus niveles de inventario de seguridad. Una contracción suele preceder ajustes de precios por parte de proveedores.";
            default:
                return "Revise su estructura de costos fijos.";
        }
    }

    return "Mantenga su estrategia operativa actual pero con vigilancia estrecha de márgenes.";
}
