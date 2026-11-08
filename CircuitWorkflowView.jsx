// =====================================================================
// ARCHITECTURE MVC — VUE : CIRCUIT WORKFLOW (CircuitWorkflowView.jsx)
// Responsabilité : Visualisation des 4 étapes administratives et avancement
// =====================================================================

import React, { useState } from 'react';
import { GitBranch, ArrowRight, CheckCircle2, History } from 'lucide-react';
import { STAGES, STAGE_LABELS } from '../models/dossierModel';

export default function CircuitWorkflowView({
  dossiers = [],
  lang = 'fr',
  theme = {},
  darkMode = false,
  onOpenDetail,
  onAdvanceStep
}) {
  const [activeStage, setActiveStage] = useState('ALL');
  const [filiereFilter, setFiliereFilter] = useState('ALL');

  const filteredDossiers = dossiers.filter(d => {
    if (activeStage !== 'ALL' && d.stage !== activeStage) return false;
    if (filiereFilter !== 'ALL' && d.filiere.toLowerCase() !== filiereFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* En-tête */}
      <div style={{ background: theme.bgCard || '#FFFFFF', padding: '20px', borderRadius: '12px', border: `1px solid ${theme.border || '#E2E8F0'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: theme.textPrimary || '#0F172A', margin: 0 }}>
              Circuit d'Instruction & Validation Régionale
            </h2>
            <div style={{ fontSize: '12px', color: theme.textSecondary || '#64748B', marginTop: '2px' }}>
              Suivi de progression à travers les 4 étapes administratives réglementaires
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'Solde', 'Pension', 'Visa'].map(fil => (
              <button
                key={fil}
                onClick={() => setFiliereFilter(fil)}
                style={{
                  background: filiereFilter === fil ? '#2563EB' : (theme.itemHover || '#F1F5F9'),
                  color: filiereFilter === fil ? 'white' : (theme.textPrimary || '#0F172A'),
                  border: `1px solid ${theme.border || '#E2E8F0'}`,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {fil === 'ALL' ? 'Toutes filières' : fil}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cartes des 4 étapes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        {STAGES.map((stageName, idx) => {
          const countInStage = dossiers.filter(d => d.stage === stageName && d.etat !== 'Validé' && d.etat !== 'Rejeté').length;
          const isSelected = activeStage === stageName;

          return (
            <div
              key={stageName}
              onClick={() => setActiveStage(activeStage === stageName ? 'ALL' : stageName)}
              style={{
                background: theme.bgCard || '#FFFFFF',
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${isSelected ? '#2563EB' : (theme.border || '#E2E8F0')}`,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: theme.textSecondary || '#64748B' }}>
                  Étape {idx + 1} / 4
                </span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  background: countInStage > 0 ? '#2563EB15' : (theme.itemHover || '#F1F5F9'),
                  color: countInStage > 0 ? '#2563EB' : (theme.textSecondary || '#64748B')
                }}>
                  {countInStage} dossier(s)
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary || '#0F172A', marginTop: '8px' }}>
                {STAGE_LABELS[lang]?.[stageName] || stageName}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tableau des dossiers dans le circuit */}
      <div style={{ background: theme.bgCard || '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.border || '#E2E8F0'}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: darkMode ? '#0F172A' : '#F8FAFC', borderBottom: `2px solid ${theme.border || '#E2E8F0'}`, color: theme.textSecondary || '#64748B' }}>
                <th style={{ padding: '10px 14px' }}>Dossier</th>
                <th style={{ padding: '10px 14px' }}>Matricule IM</th>
                <th style={{ padding: '10px 14px' }}>Bénéficiaire</th>
                <th style={{ padding: '10px 14px' }}>Étape actuelle</th>
                <th style={{ padding: '10px 14px' }}>Statut</th>
                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: theme.textSecondary || '#64748B' }}>
                    Aucun dossier à cette étape.
                  </td>
                </tr>
              ) : (
                filteredDossiers.map(dossier => (
                  <tr key={dossier.id} style={{ borderBottom: `1px solid ${theme.border || '#E2E8F0'}` }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 'bold', color: '#2563EB' }}>{dossier.numero}</div>
                      <div style={{ fontSize: '10px', color: theme.textSecondary || '#64748B' }}>{dossier.cat}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>{dossier.im}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 'bold', color: theme.textPrimary || '#0F172A' }}>{dossier.nom}</div>
                      <div style={{ fontSize: '10px', color: theme.textSecondary || '#64748B' }}>{dossier.min}</div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#2563EB' }}>{dossier.stage}</span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        background: '#2563EB20',
                        color: '#2563EB'
                      }}>
                        {dossier.etat}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => onOpenDetail && onOpenDetail(dossier, 'historique')}
                          style={{
                            background: '#2563EB',
                            color: 'white',
                            border: 'none',
                            padding: '5px 9px',
                            borderRadius: '5px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <History size={12} />
                          <span>Historique</span>
                        </button>

                        {dossier.stage !== 'Paiement' && dossier.etat !== 'Validé' && (
                          <button
                            onClick={() => onAdvanceStep && onAdvanceStep(dossier.id)}
                            style={{
                              background: '#10B981',
                              color: 'white',
                              border: 'none',
                              padding: '5px 9px',
                              borderRadius: '5px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <ArrowRight size={12} />
                            <span>Avancer</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}