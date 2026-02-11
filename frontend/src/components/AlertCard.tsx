"use client";

import React from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import { AlertCircle, TrendingDown, TrendingUp, Zap, Sparkles, ChevronRight, FileText, Send } from 'lucide-react';
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
            whileHover={{
                scale: 1.02,
                translateY: -5,
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
            }}
            transition={{ duration: 0.3 }}
            style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
            className={`card ${getClass()}`}
        >
            {/* Brillo de IA si tiene Estrategia Generada */}
            {alert.ai_strategy && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                    pointerEvents: 'none',
                    zIndex: 0
                }} />
            )}

            <div className={`tag ${getClass()}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                    >
                        {getIcon()}
                    </motion.div>
                    <span>{alert.alert_type.replace(/_/g, ' ')}</span>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <h3 className="title" style={{ margin: 0 }}>{alert.indicator_name || alert.indicator_id}</h3>
                {alert.value_change !== undefined && (
                    <div style={{
                        background: alert.value_change >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: alert.value_change >= 0 ? '#10b981' : '#ef4444',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        border: `1px solid ${alert.value_change >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                        {alert.value_change > 0 ? '+' : ''}{typeof alert.value_change === 'number' ? (alert.value_change < 1 && alert.value_change > -1 ? (alert.value_change * 100).toFixed(1) + '%' : alert.value_change.toFixed(1)) : ''}
                    </div>
                )}
            </div>
            <p className="meta">{alert.date} • {alert.indicator_id} {alert.severity ? `• [${alert.severity.toUpperCase()}]` : ''}</p>

            <div className="description" style={{ marginBottom: '1rem', borderLeft: '2px solid var(--card-border)', paddingLeft: '1rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>ANÁLISIS ESTRUCTURAL</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>{meta.impact}</p>
            </div>

            <div className="description" style={{ background: 'var(--glass-bg)', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.7rem', color: 'var(--accent-success)', letterSpacing: '0.05em' }}>ACCIÓN RECOMENDADA</p>
                <p style={{ fontSize: '0.9rem' }}>{meta.action}</p>
            </div>

            {alert.description && (
                <div className="description" style={{
                    padding: '0.75rem',
                    background: alert.description.includes('🤖') ? 'rgba(var(--accent-secondary-rgb), 0.05)' : 'transparent',
                    border: alert.description.includes('🤖') ? '1px solid var(--accent-secondary)' : '1px solid var(--card-border)',
                    borderRadius: '0.75rem',
                    fontSize: '0.85rem',
                    boxShadow: alert.description.includes('🤖') ? '0 0 15px rgba(var(--accent-secondary-rgb), 0.1)' : 'none',
                    animation: alert.description.includes('🤖') ? 'pulse-ai 3s infinite ease-in-out' : 'none'
                }}>
                    {alert.description.includes('🤖') ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                <Sparkles className="h-4 w-4" style={{ color: 'var(--accent-secondary)' }} />
                                <p style={{ fontWeight: 600, fontSize: '0.7rem', color: 'var(--accent-secondary)', letterSpacing: '0.05em' }}>GEMINI STRATEGIC INSIGHT</p>
                            </div>
                            <p style={{ fontStyle: 'italic', opacity: 0.9 }}>{alert.description.replace('🤖 **Análisis Gemini:**', '').trim()}</p>
                        </>
                    ) : (
                        <>
                            <p style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>DETALLE TÉCNICO</p>
                            <p style={{ opacity: 0.7 }}>{alert.description}</p>
                        </>
                    )}
                </div>
            )}
            {/* Acciones Interactivas - Premium Design */}
            <div style={{
                marginTop: '1.5rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.5rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                paddingTop: '1rem'
            }}>
                <button
                    className="action-btn-ia"
                    onClick={(e) => {
                        e.stopPropagation();
                        window.alert(`🚀 ESTRATEGIA DE IA:\n\n${alert.ai_strategy || 'Analizando mejor curso de acción...'}`);
                    }}
                >
                    <Zap className="h-3 w-3" />
                    ACCIÓN
                </button>
                <button
                    className="action-btn-glass"
                    onClick={(e) => {
                        e.stopPropagation();
                        const text = encodeURIComponent(`🚨 Radar: ${alert.indicator_name || alert.indicator_id}\n\nEstrategia: ${alert.description}`);
                        window.open(`https://wa.me/?text=${text}`, '_blank');
                    }}
                >
                    <Send className="h-3 w-3" />
                    WHATSAPP
                </button>
                <button
                    className="action-btn-glass"
                    onClick={(e) => {
                        e.stopPropagation();
                        const doc = new jsPDF();
                        doc.text(`Alerta: ${alert.indicator_name || alert.indicator_id}`, 10, 10);
                        doc.text(`Tipo: ${alert.alert_type}`, 10, 20);
                        doc.text(`Fecha: ${alert.date}`, 10, 30);
                        doc.text(`Análisis: ${alert.description || ''}`, 10, 40, { maxWidth: 180 });
                        doc.save(`alerta-${alert.indicator_id}-${alert.date}.pdf`);
                    }}
                >
                    <FileText className="h-3 w-3" />
                    PDF
                </button>
            </div>
        </motion.div>
    );
};

export default AlertCard;
