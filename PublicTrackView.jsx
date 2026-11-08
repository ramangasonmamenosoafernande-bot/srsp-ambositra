// =====================================================================
// ARCHITECTURE MVC — VUE : SUIVI USAGER PUBLIC (PublicTrackView.jsx)
// Responsabilité : Portail public de transparence permettant aux agents
// de l'État de suivre leur dossier par Matricule IM ou N° de dossier.
// =====================================================================

import React, { useState } from 'react';
import { Search, CheckCircle2, Clock, Hourglass, AlertTriangle, FileText } from 'lucide-react';
import { STAGES } from '../models/dossierModel';

export default function PublicTrackView({
  dossiers = [],
  lang = 'fr',
  theme = {},
  darkMode = false,
  onOpenDetail
}) {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.trim().toLowerCase();
    const found = dossiers.find(d => 
      (d.im && d.im.toLowerCase() === q) || 
      (d.numero && d.numero.toLowerCase() === q)
    );

    setResult(found || null);
    setSearched(true);
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Carte de recherche */}
      <div style={{ background: theme.bgCard || '#FFFFFF', padding: '24px', borderRadius: '14px', border: `1px solid ${theme.border || '#E2E8F0'}`, textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 'bold' }}>PORTAIL TRANSPARENCE SRSP • AMBOSITRA</div>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: theme.textPrimary || '#0F172A', margin: '8px 0' }}>
          Suivi en Ligne de Votre Dossier Administratif
        </h2>
        <div style={{ fontSize: '12px', color: theme.textSecondary || '#64748B', marginBottom: '18px' }}>
          Saisissez votre matricule (IM à 6 chiffres) ou la référence attribuée lors du dépôt (DOS-...)
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', maxWidth: '520px', margin: '0 auto' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary || '#64748B' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ex: 324176 ou DOS-1805-324176"
              style={{
                width: '100%',
                padding: '11px 14px 11px 38px',
                borderRadius: '8px',
                background: theme.inputBg || '#F8FAFC',
                border: `1.5px solid ${theme.inputBorder || '#CBD5E1'}`,
                color: theme.textPrimary || '#0F172A',
                fontSize: '13px',
                fontWeight: '600'
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              background: '#2563EB',
              color: 'white',
              border: 'none',
              padding: '11px 20px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            Rechercher
          </button>
        </form>
      </div>

      {/* Résultat de la recherche */}
      {searched && (
        <div>
          {result ? (
            <div style={{
              background: theme.bgCard || '#FFFFFF',
              borderRadius: '14px',
              border: `1px solid ${theme.border || '#E2E8F0'}`,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${theme.border || '#E2E8F0'}`, paddingBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: theme.textSecondary || '#64748B' }}>Réf Dossier Officielle</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563EB' }}>{result.numero}</div>
                  <div style={{ fontSize: '13px', color: theme.textPrimary || '#0F172A', fontWeight: 'bold', marginTop: '2px' }}>
                    {result.nom} (IM: {result.im})
                  </div>
                </div>

                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  background: result.etat === 'Validé' ? '#10B98120' : result.etat === 'Rejeté' ? '#EF444420' : '#2563EB20',
                  color: result.etat === 'Validé' ? '#059669' : result.etat === 'Rejeté' ? '#DC2626' : '#2563EB'
                }}>
                  {result.etat}
                </span>
              </div>

              {/* Barre de progression des 4 étapes */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: theme.textSecondary || '#64748B', marginBottom: '10px' }}>
                  Progression dans le circuit administratif :
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {STAGES.map((st, i) => {
                    const currentIdx = STAGES.indexOf(result.stage);
                    const isPassed = i <= currentIdx;
                    const isCurrent = i === currentIdx;

                    return (
                      <div
                        key={st}
                        style={{
                          background: isPassed ? '#2563EB15' : (theme.itemHover || '#F1F5F9'),
                          border: `1.5px solid ${isCurrent ? '#2563EB' : isPassed ? '#93C5FD' : (theme.border || '#E2E8F0')}`,
                          padding: '10px 8px',
                          borderRadius: '8px',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: '10px', color: isPassed ? '#2563EB' : (theme.textSecondary || '#64748B'), fontWeight: 'bold' }}>
                          Étape {i + 1}
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: isPassed ? '#1E40AF' : (theme.textSecondary || '#64748B'), marginTop: '2px' }}>
                          {st}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Détails complémentaires */}
              <div style={{ background: theme.itemHover || '#F1F5F9', padding: '14px', borderRadius: '10px', fontSize: '12px', lineHeight: '1.6' }}>
                <div>Ministère : <strong>{result.min}</strong></div>
                <div>Nature de l'acte : <strong>{result.cat}</strong> ({result.filiere})</div>
                <div>Date de dépôt : <strong>{result.date}</strong> (Bordereau n° {result.be})</div>
                {result.motif && <div style={{ color: '#DC2626', marginTop: '6px' }}>Observation : {result.motif}</div>}
              </div>

              {/* Bouton pour ouvrir le détail officiel */}
              <button
                onClick={() => onOpenDetail && onOpenDetail(result, 'historique')}
                style={{
                  background: '#2563EB',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <FileText size={14} />
                <span>Consulter la Piste d'Audit Complète & Récépissé</span>
              </button>
            </div>
          ) : (
            <div style={{ background: theme.bgCard || '#FFFFFF', padding: '24px', borderRadius: '12px', border: `1px solid ${theme.border || '#E2E8F0'}`, textAlign: 'center' }}>
              <AlertTriangle size={32} color="#EF4444" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: theme.textPrimary || '#0F172A' }}>Aucun dossier trouvé</div>
              <div style={{ fontSize: '12px', marginTop: '4px', color: theme.textSecondary || '#64748B' }}>
                Aucun dossier ne correspond au matricule ou numéro « {query} ».
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}