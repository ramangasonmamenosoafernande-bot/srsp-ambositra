// =====================================================================
// ARCHITECTURE MVC — VUE : TABLEAU DE BORD (DashboardView.jsx)
// =====================================================================

import React, { useState, useMemo } from 'react';
import { 
  FileText, Clock, CheckCircle2, AlertTriangle, ArrowRight, 
  Hourglass, History, Search, X, SlidersHorizontal, RotateCcw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { MONTHLY_PROCESSING_DATA } from '../models/dossierModel';

export default function DashboardView({ 
  dossiers = [], 
  stats = {},
  theme = {}, 
  darkMode = false, 
  onOpenDetail, 
  onAdvanceStep
}) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [filiereFilter, setFiliereFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDossiers = useMemo(() => {
    return dossiers.filter(d => {
      // 1. Statut
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'En attente') {
          const isAttente = d.etat === 'En attente' || (d.etat === 'En cours' && d.stage === 'Accueil');
          if (!isAttente) return false;
        } else if (statusFilter === 'En cours') {
          const isEnCours = d.etat === 'En cours' && d.stage !== 'Accueil';
          if (!isEnCours) return false;
        } else if (statusFilter === 'Validé') {
          if (d.etat !== 'Validé') return false;
        } else if (statusFilter === 'Rejeté') {
          if (d.etat !== 'Rejeté') return false;
        }
      }

      // 2. Filière
      if (filiereFilter !== 'ALL' && d.filiere.toLowerCase() !== filiereFilter.toLowerCase()) return false;

      // 3. Recherche multi-mots
      if (searchTerm.trim()) {
        const tokens = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
        const searchable = [d.nom, d.im, d.numero, d.min, d.cat, d.filiere].map(s => String(s || '').toLowerCase());
        const match = tokens.every(tok => searchable.some(field => field.includes(tok)));
        if (!match) return false;
      }

      return true;
    });
  }, [dossiers, statusFilter, filiereFilter, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. CARTES KPI CLIQUABLES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        
        {/* TOTAL */}
        <div onClick={() => setStatusFilter('ALL')} style={{ background: theme.bgCard, padding: '16px', borderRadius: '12px', border: `1.5px solid ${statusFilter === 'ALL' ? '#2563EB' : theme.border}`, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: theme.textSecondary }}>TOTAL DOSSIERS</span>
            <FileText size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: theme.textPrimary, marginTop: '8px' }}>{stats.total}</div>
        </div>

        {/* EN ATTENTE */}
        <div onClick={() => setStatusFilter(statusFilter === 'En attente' ? 'ALL' : 'En attente')} style={{ background: theme.bgCard, padding: '16px', borderRadius: '12px', border: `1.5px solid ${statusFilter === 'En attente' ? '#EAB308' : theme.border}`, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#CA8A04' }}>EN ATTENTE</span>
            <Hourglass size={18} color="#CA8A04" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#CA8A04', marginTop: '8px' }}>{stats.enAttente} <span style={{ fontSize: '11px', color: theme.textSecondary }}>({stats.pctEnAttente}%)</span></div>
        </div>

        {/* EN COURS */}
        <div onClick={() => setStatusFilter(statusFilter === 'En cours' ? 'ALL' : 'En cours')} style={{ background: theme.bgCard, padding: '16px', borderRadius: '12px', border: `1.5px solid ${statusFilter === 'En cours' ? '#3B82F6' : theme.border}`, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563EB' }}>EN COURS</span>
            <Clock size={18} color="#2563EB" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#2563EB', marginTop: '8px' }}>{stats.enCours} <span style={{ fontSize: '11px', color: theme.textSecondary }}>({stats.pctEnCours}%)</span></div>
        </div>

        {/* VALIDÉS */}
        <div onClick={() => setStatusFilter(statusFilter === 'Validé' ? 'ALL' : 'Validé')} style={{ background: theme.bgCard, padding: '16px', borderRadius: '12px', border: `1.5px solid ${statusFilter === 'Validé' ? '#10B981' : theme.border}`, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#059669' }}>VALIDÉS</span>
            <CheckCircle2 size={18} color="#059669" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#059669', marginTop: '8px' }}>{stats.valides} <span style={{ fontSize: '11px', color: theme.textSecondary }}>({stats.pctValides}%)</span></div>
        </div>

        {/* REJETÉS */}
        <div onClick={() => setStatusFilter(statusFilter === 'Rejeté' ? 'ALL' : 'Rejeté')} style={{ background: theme.bgCard, padding: '16px', borderRadius: '12px', border: `1.5px solid ${statusFilter === 'Rejeté' ? '#EF4444' : theme.border}`, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#DC2626' }}>REJETÉS</span>
            <AlertTriangle size={18} color="#DC2626" />
          </div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#DC2626', marginTop: '8px' }}>{stats.rejetes} <span style={{ fontSize: '11px', color: theme.textSecondary }}>({stats.pctRejetes}%)</span></div>
        </div>

      </div>

      {/* 2. BARRE DE RECHERCHE AVANCÉE & FILTRES */}
      <div style={{ background: theme.bgCard, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Recherche multi-critères : Nom, IM, Réf dossier (DOS-...), Ministère..."
              style={{ width: '100%', padding: '11px 40px', background: theme.inputBg, border: `1.5px solid ${searchTerm ? '#2563EB' : theme.inputBorder}`, borderRadius: '8px', color: theme.textPrimary, fontSize: '13px' }}
            />
            {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary, cursor: 'pointer' }} />}
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['ALL', 'En attente', 'En cours', 'Validé', 'Rejeté'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${statusFilter === st ? '#2563EB' : theme.border}`,
                  background: statusFilter === st ? '#2563EB' : theme.itemHover,
                  color: statusFilter === st ? 'white' : theme.textPrimary,
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {st === 'ALL' ? 'Tous' : st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. TABLEAU DES DOSSIERS AVEC BOUTON D'ACCÈS À L'HISTORIQUE */}
      <div style={{ background: theme.bgCard, borderRadius: '14px', border: `1px solid ${theme.border}`, padding: '20px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.border}`, color: theme.textSecondary }}>
                <th style={{ padding: '10px' }}>Dossier & Date</th>
                <th style={{ padding: '10px' }}>Matricule IM</th>
                <th style={{ padding: '10px' }}>Bénéficiaire</th>
                <th style={{ padding: '10px' }}>Filière</th>
                <th style={{ padding: '10px' }}>Étape</th>
                <th style={{ padding: '10px' }}>Statut</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDossiers.slice(0, 8).map(dossier => (
                <tr key={dossier.id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 'bold', color: '#2563EB' }}>{dossier.numero}</div>
                    <div style={{ fontSize: '10px', color: theme.textSecondary }}>{dossier.date}</div>
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{dossier.im}</td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 'bold', color: theme.textPrimary }}>{dossier.nom}</div>
                    <div style={{ fontSize: '10px', color: theme.textSecondary }}>{dossier.min}</div>
                  </td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{dossier.filiere}</td>
                  <td style={{ padding: '10px' }}>{dossier.stage}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold',
                      background: dossier.etat === 'Validé' ? '#10B98120' : dossier.etat === 'Rejeté' ? '#EF444420' : '#2563EB20',
                      color: dossier.etat === 'Validé' ? '#059669' : dossier.etat === 'Rejeté' ? '#DC2626' : '#2563EB'
                    }}>
                      {dossier.etat}
                    </span>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>
                    <button
                      onClick={() => onOpenDetail(dossier, 'historique')}
                      style={{
                        background: '#2563EB', color: 'white', border: 'none', padding: '6px 12px',
                        borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <History size={13} />
                      <span>Historique & Audit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}