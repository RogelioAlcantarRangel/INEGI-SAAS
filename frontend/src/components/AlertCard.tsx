"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import { AlertData, getAlertMeta } from '@/lib/types';

interface AlertCardProps {
    alert: AlertData;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
    const meta = getAlertMeta(alert.alert_type);

    const getIcon = () => {
        switch (alert.alert_type) {
            case 'ALERTA_CONTRACCION': return <TrendingDown className="h-5 w-5" />;
            case 'ALERTA_DESACELERACION': return <Zap className="h-5 w-5" />;
            case 'CAMBIO_TENDENCIA_NEGATIVO': return <TrendingDown className="h-5 w-5" />;
            case 'CAMBIO_TENDENCIA_POSITIVO': return <TrendingUp className="h-5 w-5" />;
            default: return <AlertCircle className="h-5 w-5" />;
        }
    };

    const getClass = () => {
        switch (alert.alert_type) {
            case 'ALERTA_CONTRACCION': return 'contraction';
            case 'ALERTA_DESACELERACION': return 'deceleration';
            case 'CAMBIO_TENDENCIA_NEGATIVO': return 'trend-neg';
            case 'CAMBIO_TENDENCIA_POSITIVO': return 'trend-pos';
            default: return '';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card ${getClass()}`}
        >
            <div className={`tag ${getClass()}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {getIcon()}
                    <span>{alert.alert_type.replace(/_/g, ' ')}</span>
                </div>
            </div>

            <h3 className="title">{meta.title}</h3>
            <p className="meta">{alert.date} • Indicador: {alert.indicator_id}</p>

            <div className="description" style={{ marginBottom: '1rem', borderLeft: '2px solid var(--card-border)', paddingLeft: '1rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>ANÁLISIS ESTRUCTURAL</p>
                <p>{meta.impact}</p>
            </div>

            <div className="description" style={{ background: 'var(--glass-bg)', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--accent-success)' }}>ACCIÓN RECOMENDADA</p>
                <p>{meta.action}</p>
            </div>

            {alert.description && (
                <div className="description" style={{ padding: '0.75rem', border: '1px solid var(--accent-primary)', borderRadius: '0.75rem', fontSize: '0.85rem' }}>
                    {alert.description.includes('🤖') ? (
                        <>
                            <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--accent-secondary)' }}>GEMINI STRATEGIC INSIGHT</p>
                            <p>{alert.description}</p>
                        </>
                    ) : (
                        <>
                            <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.8rem', color: 'var(--accent-primary)' }}>DETALLE TÉCNICO</p>
                            <p>{alert.description}</p>
                        </>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default AlertCard;
