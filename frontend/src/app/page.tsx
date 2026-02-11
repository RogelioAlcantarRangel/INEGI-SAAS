"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertData } from '@/lib/types';
import AlertCard from '@/components/AlertCard';
import { LayoutDashboard, Bell, Settings, Info, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const { data, error } = await supabase
          .from('economic_alerts')
          .select('*')
          .order('date', { ascending: false })
          .limit(20);

        if (error) throw error;
        setAlerts(data || []);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, []);

  return (
    <div className="main-container">
      <header className="header">
        <div className="logo">Context Engine</div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Bell className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }} />
          <Info className="h-5 w-5" style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }} />
          <div style={{ padding: '0.4rem', border: '1px solid var(--card-border)', borderRadius: '8px' }}>
            <Settings className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }} />
          </div>
        </div>
      </header>

      <section className="ai-command-center">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{
            background: 'rgba(var(--accent-secondary-rgb), 0.2)',
            padding: '0.75rem',
            borderRadius: '12px',
            border: '1px solid rgba(var(--accent-secondary-rgb), 0.3)'
          }}>
            <Sparkles className="h-6 w-6" style={{ color: 'var(--accent-secondary)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, letterSpacing: '0.02em' }}>
                INTELIGENCIA REGIONAL: <span style={{ color: 'var(--accent-secondary)' }}>MONTERREY / NL</span>
              </h2>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>LIVE ANALYSIS v2.0</div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              {alerts.length > 0
                ? `Detectadas ${alerts.length} señales activas. ${
                    alerts.filter(a => a.alert_type === 'ALERTA_CONTRACCION').length > 0
                      ? 'Alerta de contracción crítica en manufactura.'
                      : 'Monitoreo de tendencias en curso.'
                  }`
                : 'El entorno regional se encuentra dentro de parámetros normales.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="action-btn-ia" style={{ fontSize: '0.7rem', padding: '0.6rem 1rem' }}>Consultar Especialista IA</button>
              <button className="action-btn-glass" style={{ fontSize: '0.7rem', padding: '0.6rem 1rem' }}>Exportar Panorama NL</button>
            </div>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <LayoutDashboard className="h-5 w-5" style={{ color: 'var(--accent-primary)' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Capa de Señales</h2>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
          Monitoreo en tiempo real de desviaciones económicas para manufactura regional.
        </p>
      </section>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="title" style={{ opacity: 0.5 }}>Cargando señales...</div>
        </div>
      ) : (
        <div className="grid">
          {alerts.length > 0 ? (
            alerts.map((alert, idx) => (
              <AlertCard key={`${alert.indicator_id}-${idx}`} alert={alert} />
            ))
          ) : (
            <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem' }}>
              <p className="title" style={{ opacity: 0.7 }}>Sin alertas activas</p>
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>El entorno regional se encuentra dentro de los parámetros normales.</p>
            </div>
          )}
        </div>
      )}

      <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--card-border)', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
          &copy; 2026 Context Engine. Infraestructura de Señales Económicas.
        </p>
      </footer>

      <style jsx>{`
        h2 { color: #fff; }
      `}</style>
    </div>
  );
}
