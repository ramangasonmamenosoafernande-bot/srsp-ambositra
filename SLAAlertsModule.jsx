// =====================================================================
// ARCHITECTURE MVC — COMPOSANT : MODULE D'ALERTES DÉLAIS SLA (SLAAlertsModule.jsx)
// Responsabilité : Identification visuelle immédiate des dossiers dépassant
// les délais réglementaires (seuil légal SRSP : 3.0 jours).
// Pastilles d'avertissement, diagnostic des goulots, et filtrage direct 1-clic.
// =====================================================================

import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, AlertCircle, Clock, CheckCircle2, ShieldAlert, 
  ArrowRight, Flame, Filter, ChevronDown, ChevronUp, History, Sparkles, AlertOctagon
} from 'lucide-react';

export const SLA_TARGET_DAYS = 3.0; // Norme réglementaire régionale SRSP Ambositra

/**
 * Détermine le statut SLA d'un dossier
 * @param {Object} dossier 
 * @returns {'OVERDUE' | 'WARNING' | 'COMPLIANT'}
 */
export const getDossierSLAStatus = (dossier) => {
  const delai = typeof dossier?.delai === 'number' ? dossier.delai : 0;
  if (delai > SLA_TARGET_DAYS) return 'OVERDUE';
  if (delai >= 2.5) return 'WARNING';
  return 'COMPLIANT';
};

/**
 * Rendu d'une pastille d'avertissement SLA unifiée
 */
export function SLAPastille({ delai = 0, compact = false, showLabel = true }) {
  const isOverdue = delai > SLA_TARGET_DAYS;
  const isWarning = !isOverdue && delai >= 2.5;
  const excess = (delai - SLA_TARGET_DAYS).toFixed(1);

  if (isOverdue) {
    return (
      <span 
        title={`Dépassement du délai légal de 3 jours (+${excess}j de retard)`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: compact ? '2px 6px' : '3px 8px',
          borderRadius: '6px',
          fontSize: compact ? '10px' : '11px',
          fontWeight: 'bold',
          background: '#EF444418',
          color: '#DC2626',
          border: '1px solid #EF444455',
          boxShadow: '0 1px 3px rgba(239,68,68,0.15)',
          whiteSpace: 'nowrap'
        }}
      >
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          background: '#DC2626',
          display: 'inline-block',
          animation: 'pulse 1.8s infinite'
        }} />
        <AlertCircle size={compact ? 11 : 12} color="#DC2626" />
        <span>{delai}j</span>
        {showLabel && <span style={{ opacity: 0.9 }}>• +{excess}j retard</span>}
      </span>
    );
  }

  if (isWarning) {
    return (
      <span 
        title="Dossier sous surveillance : approche du délai réglementaire de 3 jours"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: compact ? '2px 6px' : '3px 8px',
          borderRadius: '6px',
          fontSize: compact ? '10px' : '11px',
          fontWeight: 'bold',
          background: '#F59E0B18',
          color: '#D97706',
          border: '1px solid #F59E0B55',
          whiteSpace: 'nowrap'
        }}
      >
        <AlertTriangle size={compact ? 11 : 12} color="#D97706" />
        <span>{delai}j</span>
        {showLabel && <span style={{ opacity: 0.9 }}>• Risque SLA</span>}
      </span>
    );
  }

  return (
    <span 
      title="Dossier traité dans le respect des délais réglementaires (≤ 3.0j)"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: compact ? '2px 6px' : '3px 8px',
        borderRadius: '6px',
        fontSize: compact ? '10px' : '11px',
        fontWeight: '600',
        background: '#10B98115',
        color: '#059669',
        border: '1px solid #10B98140',
        whiteSpace: 'nowrap'
      }}
    >
      <CheckCircle2 size={compact ? 11 : 12} color="#059669" />
      <span>{delai}j</span>
      {showLabel && <span style={{ opacity: 0.85 }}>• Conforme</span>}
    </span>
  );
}

export default function SLAAlertsModule({
  dossiers = [],
  activeSLAFilter = 'ALL',
  onSelectSLAFilter,
  onOpenDetail,
  lang = 'fr',
  theme = {},
  darkMode = false
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Analyse complète des dépassements sur les dossiers non validés/rejetés ou tous dossiers actifs
  const slaAnalysis = useMemo(() => {
    const activeDossiers = dossiers.filter(d => d.etat !== 'Validé' && d.etat !== 'Rejeté');
    const overdueList = activeDossiers.filter(d => (d.delai || 0) > SLA_TARGET_DAYS);
    const warningList = activeDossiers.filter(d => (d.delai || 0) >= 2.5 && (d.delai || 0) <= SLA_TARGET_DAYS);
    const compliantList = activeDossiers.filter(d => (d.delai || 0) < 2.5);

    // Tri des dossiers en retard par ordre de dépassement décroissant
    const sortedOverdue = [...overdueList].sort((a, b) => (b.delai || 0) - (a.delai || 0));

    // Calcul du dépassement moyen
    const totalExcess = sortedOverdue.reduce((acc, d) => acc + (d.delai - SLA_TARGET_DAYS), 0);
    const avgExcess = sortedOverdue.length ? (totalExcess / sortedOverdue.length).toFixed(1) : 0;

    return {
      totalActive: activeDossiers.length,
      overdueCount: overdueList.length,
      warningCount: warningList.length,
      compliantCount: compliantList.length,
      sortedOverdue,
      avgExcess
    };
  }, [dossiers]);

  return (
    <div style={{
      background: theme.bgCard,
      borderRadius: '16px',
      border: `1.5px solid ${slaAnalysis.overdueCount > 0 ? (darkMode ? '#7F1D1D' : '#FCA5A5') : theme.border}`,
      boxShadow: slaAnalysis.overdueCount > 0 
        ? (darkMode ? '0 4px 20px rgba(220,38,38,0.2)' : '0 4px 18px rgba(239,68,68,0.1)') 
        : 'none',
      overflow: 'hidden',
      transition: 'all 0.25s ease'
    }}>
      
      {/* 1. EN-TÊTE D'ALERTE VISUELLE */}
      <div style={{
        padding: '16px 20px',
        background: slaAnalysis.overdueCount > 0 
          ? (darkMode ? 'linear-gradient(90deg, #451A1A, #1E1B4B)' : 'linear-gradient(90deg, #FEF2F2, #FFFBEB)')
          : theme.itemHover,
        borderBottom: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '9px',
            borderRadius: '10px',
            background: slaAnalysis.overdueCount > 0 ? '#DC2626' : '#F59E0B',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: slaAnalysis.overdueCount > 0 ? '0 0 14px rgba(220,38,38,0.45)' : 'none'
          }}>
            <ShieldAlert size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '14px', color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Module d'Alerte Délais Réglementaires (SLA ≤ 3.0 Jours)</span>
              </strong>

              {slaAnalysis.overdueCount > 0 ? (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#EF4444',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Flame size={12} />
                  <span>{slaAnalysis.overdueCount} dossier(s) en dépassement</span>
                </span>
              ) : (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#10B98125',
                  color: '#059669',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  Tous les délais sont respectés
                </span>
              )}
            </div>

            <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '2px' }}>
              Surveillance continue des paliers Accueil, Liquidation, Contrôle et Visa selon le barème régional SRSP
            </div>
          </div>
        </div>

        {/* 2. PASTILLES D'AVERTISSEMENT & FILTRES RAPIDES INTERACTIFS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* PASTILLE 1 : DÉPASSEMENT CRITIQUE */}
          <button
            onClick={() => onSelectSLAFilter && onSelectSLAFilter(activeSLAFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1.5px solid ${activeSLAFilter === 'OVERDUE' ? '#DC2626' : (darkMode ? '#7F1D1D' : '#FCA5A5')}`,
              background: activeSLAFilter === 'OVERDUE' ? '#DC2626' : (darkMode ? '#451A1A' : '#FEE2E2'),
              color: activeSLAFilter === 'OVERDUE' ? 'white' : '#DC2626',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: activeSLAFilter === 'OVERDUE' ? 'white' : '#DC2626'
            }} />
            <AlertCircle size={13} />
            <span>Retard Critique (&gt;3j)</span>
            <span style={{
              background: activeSLAFilter === 'OVERDUE' ? 'rgba(255,255,255,0.25)' : 'rgba(220,38,38,0.15)',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '10px'
            }}>
              {slaAnalysis.overdueCount}
            </span>
          </button>

          {/* PASTILLE 2 : RISQUE IMMINENT */}
          <button
            onClick={() => onSelectSLAFilter && onSelectSLAFilter(activeSLAFilter === 'WARNING' ? 'ALL' : 'WARNING')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1.5px solid ${activeSLAFilter === 'WARNING' ? '#D97706' : (darkMode ? '#78350F' : '#FDE68A')}`,
              background: activeSLAFilter === 'WARNING' ? '#D97706' : (darkMode ? '#3D2505' : '#FEF3C7'),
              color: activeSLAFilter === 'WARNING' ? 'white' : '#D97706',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <AlertTriangle size={13} />
            <span>Sous Surveillance (2.5 - 3j)</span>
            <span style={{
              background: activeSLAFilter === 'WARNING' ? 'rgba(255,255,255,0.25)' : 'rgba(217,119,6,0.15)',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '10px'
            }}>
              {slaAnalysis.warningCount}
            </span>
          </button>

          {/* PASTILLE 3 : CONFORME */}
          <button
            onClick={() => onSelectSLAFilter && onSelectSLAFilter(activeSLAFilter === 'COMPLIANT' ? 'ALL' : 'COMPLIANT')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1.5px solid ${activeSLAFilter === 'COMPLIANT' ? '#059669' : theme.border}`,
              background: activeSLAFilter === 'COMPLIANT' ? '#059669' : 'transparent',
              color: activeSLAFilter === 'COMPLIANT' ? 'white' : theme.textSecondary,
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <CheckCircle2 size={13} />
            <span>Conforme (&lt;2.5j)</span>
            <span style={{ fontSize: '10px' }}>({slaAnalysis.compliantCount})</span>
          </button>

          {/* BOUTON PLIER / DÉPLIER */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Masquer les détails" : "Afficher les détails des dossiers en retard"}
            style={{
              background: 'transparent',
              border: `1px solid ${theme.border}`,
              padding: '6px 8px',
              borderRadius: '6px',
              color: theme.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* 3. LISTE D'ACTION PRIORITAIRE SUR LES DOSSIERS EN DÉPASSEMENT */}
      {isExpanded && slaAnalysis.sortedOverdue.length > 0 && (
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={14} />
              <span>Dossiers Prioritaires à Traiter d'Urgence ({slaAnalysis.sortedOverdue.length})</span>
            </span>

            {activeSLAFilter !== 'OVERDUE' && (
              <button
                onClick={() => onSelectSLAFilter && onSelectSLAFilter('OVERDUE')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563EB',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>Filtrer ces dossiers dans le registre</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
            gap: '10px'
          }}>
            {slaAnalysis.sortedOverdue.map(dossier => {
              return (
                <div
                  key={dossier.id}
                  style={{
                    background: darkMode ? '#1E293B80' : '#FFFFFF',
                    border: `1px solid ${darkMode ? '#7F1D1D80' : '#FCA5A5'}`,
                    borderLeft: '4px solid #DC2626',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 'bold', color: '#2563EB', fontSize: '12px' }}>
                          {dossier.numero}
                        </span>
                        <span style={{
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          background: dossier.filiere === 'Solde' ? '#F59E0B20' : dossier.filiere === 'Pension' ? '#3B82F620' : '#10B98120',
                          color: dossier.filiere === 'Solde' ? '#D97706' : dossier.filiere === 'Pension' ? '#2563EB' : '#059669'
                        }}>
                          {dossier.filiere}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textPrimary, marginTop: '2px' }}>
                        {dossier.nom} <span style={{ color: theme.textSecondary, fontWeight: 'normal', fontSize: '11px' }}>(IM: {dossier.im})</span>
                      </div>
                    </div>

                    {/* PASTILLE VISUELLE DE DÉPASSEMENT */}
                    <SLAPastille delai={dossier.delai} compact={false} />
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '6px',
                    borderTop: `1px dashed ${theme.border}`,
                    fontSize: '11px'
                  }}>
                    <div style={{ color: theme.textSecondary }}>
                      Étape : <strong style={{ color: theme.textPrimary }}>{dossier.stage}</strong>
                    </div>

                    <button
                      onClick={() => onOpenDetail && onOpenDetail(dossier, 'historique')}
                      style={{
                        background: '#DC262615',
                        color: '#DC2626',
                        border: '1px solid #DC262640',
                        padding: '4px 8px',
                        borderRadius: '5px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <History size={12} />
                      <span>Consulter & Débloquer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Si aucun dépassement */}
      {isExpanded && slaAnalysis.sortedOverdue.length === 0 && (
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '12px' }}>
          <CheckCircle2 size={16} />
          <span>Aucun dossier en dépassement réglementaire actuellement. La totalité des actes respectent le délai contractuel de 3.0 jours.</span>
        </div>
      )}

    </div>
  );
}