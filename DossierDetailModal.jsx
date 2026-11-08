// =====================================================================
// ARCHITECTURE MVC — VUE : DÉTAIL DU DOSSIER (DossierDetailModal.jsx)
// Responsabilité : Affichage de la vue détaillée avec VOLET HISTORIQUE
// (Audit Trail chronologique) et VOLET RÉCÉPISSÉ avec QR Code SVG
// =====================================================================

import React, { useState } from 'react';
import { 
  X, Printer, History, FileText, CheckCircle2, AlertTriangle, 
  ArrowRight, Clock, User, Building2, Send, Filter, Fingerprint
} from 'lucide-react';

// Générateur minimaliste SVG de QR Code autonome
function MiniQrCode({ code, size = 80 }) {
  const hash = String(code).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cells = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const isCorner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
      const isFilled = isCorner || ((hash * (r + 1) + c * 7) % 3 === 0);
      if (isFilled) {
        cells.push(
          <rect key={`${r}-${c}`} x={c * 10} y={r * 10} width="8" height="8" fill="#1E293B" rx="1.5" />
        );
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 70 70" style={{ background: '#FFFFFF', padding: '6px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
      {cells}
    </svg>
  );
}

export default function DossierDetailModal({ 
  dossier, 
  currentUser,
  lang = 'fr', 
  theme = {}, 
  darkMode = false, 
  initialTab = 'historique', // 'historique' | 'apercu'
  onClose,
  onAddAuditNote,
  onUpdateStatus,
  onAdvanceStep
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [auditFilter, setAuditFilter] = useState('ALL'); // 'ALL' | 'statut' | 'transmission' | 'note'
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  if (!dossier) return null;

  const logs = dossier.historique || [];

  // Filtrage dans l'historique chronologique
  const filteredLogs = logs.filter(log => {
    if (auditFilter === 'statut') return Boolean(log.ancienStatut && log.nouveauStatut);
    if (auditFilter === 'transmission') return log.type === 'transmission' || log.type === 'avancement';
    if (auditFilter === 'note') return log.type === 'note';
    return true;
  });

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    if (onAddAuditNote) {
      onAddAuditNote(dossier.id, newNote.trim());
    }
    setNewNote('');
    setShowAddNote(false);
  };

  const getStatusBadge = (status) => {
    const isValide = status === 'Validé';
    const isRejete = status === 'Rejeté';
    const isEnAttente = status === 'En attente';
    const bg = isValide ? '#10B98120' : isRejete ? '#EF444420' : isEnAttente ? '#EAB30820' : '#2563EB20';
    const color = isValide ? '#059669' : isRejete ? '#DC2626' : isEnAttente ? '#CA8A04' : '#2563EB';
    return (
      <span style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', background: bg, color }}>
        {status}
      </span>
    );
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{
        background: theme.bgCard || (darkMode ? '#1E293B' : '#FFFFFF'),
        borderRadius: '16px',
        maxWidth: '820px',
        width: '100%',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme.border || '#E2E8F0'}`,
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        overflow: 'hidden'
      }}>
        
        {/* EN-TÊTE DU DOSSIER */}
        <div style={{ padding: '18px 22px', borderBottom: `1px solid ${theme.border || '#E2E8F0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: darkMode ? '#0F172A' : '#F8FAFC' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: '800', letterSpacing: '0.5px' }}>
              REPOBLIKAN'I MADAGASIKARA • DIRECTION RÉGIONALE DU BUDGET • SRSP AMBOSITRA
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: theme.textPrimary || '#0F172A', margin: 0 }}>
                Dossier {dossier.numero}
              </h2>
              {getStatusBadge(dossier.etat)}
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', background: darkMode ? '#334155' : '#E2E8F0', color: theme.textSecondary || '#64748B', fontWeight: '600' }}>
                Étape : {dossier.stage}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: theme.textSecondary || '#64748B', marginTop: '2px' }}>
              Bénéficiaire : <strong style={{ color: theme.textPrimary || '#0F172A' }}>{dossier.nom}</strong> • Matricule IM : <strong style={{ color: '#2563EB' }}>{dossier.im}</strong> • {dossier.min}
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: theme.textSecondary || '#64748B', cursor: 'pointer', padding: '6px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION DES VOLETS (HISTORIQUE VS RÉCÉPISSÉ) */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border || '#E2E8F0'}`, background: darkMode ? '#1E293B' : '#FFFFFF', padding: '0 22px' }}>
          <button
            onClick={() => setActiveTab('historique')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'historique' ? '3px solid #2563EB' : '3px solid transparent',
              color: activeTab === 'historique' ? '#2563EB' : (theme.textSecondary || '#64748B'),
              fontWeight: activeTab === 'historique' ? 'bold' : '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <History size={16} />
            <span>Volet Historique & Audit Trail</span>
            <span style={{ background: activeTab === 'historique' ? '#2563EB20' : (theme.itemHover || '#F1F5F9'), color: activeTab === 'historique' ? '#2563EB' : (theme.textSecondary || '#64748B'), padding: '2px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
              {logs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('apercu')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'apercu' ? '3px solid #2563EB' : '3px solid transparent',
              color: activeTab === 'apercu' ? '#2563EB' : (theme.textSecondary || '#64748B'),
              fontWeight: activeTab === 'apercu' ? 'bold' : '600',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <FileText size={16} />
            <span>Récépissé de Dépôt & QR Code</span>
          </button>
        </div>

        {/* CONTENU DU VOLET ACTIF */}
        <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
          
          {/* ======================================================== */}
          {/* 1. VOLET HISTORIQUE & AUDIT TRAIL (CHRONOLOGIE)           */}
          {/* ======================================================== */}
          {activeTab === 'historique' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Filtres du journal d'audit */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', background: theme.itemHover || '#F1F5F9', padding: '10px 14px', borderRadius: '10px', border: `1px solid ${theme.border || '#E2E8F0'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter size={14} color={theme.textSecondary || '#64748B'} />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: theme.textSecondary || '#64748B' }}>Filtrer par type :</span>
                  
                  {['ALL', 'statut', 'transmission', 'note'].map(fKey => {
                    const label = fKey === 'ALL' ? 'Tous les événements' : fKey === 'statut' ? 'Changements statut' : fKey === 'transmission' ? 'Transmissions' : 'Notes & Obs.';
                    const isSelected = auditFilter === fKey;
                    return (
                      <button
                        key={fKey}
                        onClick={() => setAuditFilter(fKey)}
                        style={{
                          background: isSelected ? '#2563EB' : (darkMode ? '#334155' : '#FFFFFF'),
                          color: isSelected ? 'white' : (theme.textPrimary || '#0F172A'),
                          border: `1px solid ${isSelected ? '#2563EB' : (theme.border || '#E2E8F0')}`,
                          padding: '4px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setShowAddNote(!showAddNote)}
                  style={{
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Send size={12} />
                  <span>Ajouter une observation</span>
                </button>
              </div>

              {/* Formulaire d'ajout d'observation */}
              {showAddNote && (
                <form onSubmit={handleSaveNote} style={{ background: darkMode ? '#0F172A' : '#EFF6FF', padding: '14px', borderRadius: '10px', border: '1px solid #93C5FD', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: '#1E40AF' }}>
                    <Fingerprint size={14} />
                    <span>Nouvelle annotation d'audit par {currentUser?.name || 'Agent'} ({currentUser?.role || 'SRSP'})</span>
                  </div>
                  <textarea
                    rows={2}
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Saisissez une observation formelle, visa de contrôle, note de régularisation ou instruction..."
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: theme.bgCard || '#FFFFFF',
                      border: `1px solid ${theme.border || '#CBD5E1'}`,
                      color: theme.textPrimary || '#0F172A',
                      fontSize: '12px'
                    }}
                    autoFocus
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => { setShowAddNote(false); setNewNote(''); }}
                      style={{ background: theme.itemHover || '#F1F5F9', border: `1px solid ${theme.border || '#CBD5E1'}`, color: theme.textPrimary || '#0F172A', padding: '5px 10px', borderRadius: '5px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={!newNote.trim()}
                      style={{ background: '#2563EB', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px', fontSize: '11px', fontWeight: 'bold', cursor: newNote.trim() ? 'pointer' : 'not-allowed' }}
                    >
                      Enregistrer dans l'audit trail
                    </button>
                  </div>
                </form>
              )}

              {/* Chronologie verticale */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '8px' }}>
                {filteredLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: theme.textSecondary || '#64748B', fontSize: '12px' }}>
                    Aucun événement correspondant au filtre sélectionné.
                  </div>
                ) : (
                  filteredLogs.map((log, idx) => {
                    const isValide = log.type === 'validation';
                    const isRejet = log.type === 'rejet';
                    const isNote = log.type === 'note';
                    const isTransmission = log.type === 'transmission';

                    const dotBg = isValide ? '#10B981' : isRejet ? '#EF4444' : isNote ? '#8B5CF6' : isTransmission ? '#3B82F6' : '#64748B';

                    return (
                      <div 
                        key={log.id || idx}
                        style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', position: 'relative' }}
                      >
                        {/* Point chronologique */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
                          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: dotBg, border: '3px solid white', boxShadow: '0 0 0 2px ' + dotBg }} />
                          {idx < filteredLogs.length - 1 && (
                            <div style={{ width: '2px', flex: 1, minHeight: '50px', background: darkMode ? '#334155' : '#CBD5E1', margin: '4px 0' }} />
                          )}
                        </div>

                        {/* Carte de l'événement */}
                        <div style={{
                          flex: 1,
                          background: darkMode ? '#0F172A' : '#F8FAFC',
                          border: `1px solid ${theme.border || '#E2E8F0'}`,
                          borderRadius: '10px',
                          padding: '12px 16px'
                        }}>
                          {/* Titre & Horodatage */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', borderBottom: `1px solid ${theme.border || '#E2E8F0'}`, paddingBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <strong style={{ fontSize: '13px', color: theme.textPrimary || '#0F172A' }}>
                                {log.action}
                              </strong>
                              {log.etape && (
                                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: darkMode ? '#334155' : '#E2E8F0', color: theme.textSecondary || '#64748B', fontWeight: 'bold' }}>
                                  Étape: {log.etape}
                                </span>
                              )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: theme.textSecondary || '#64748B' }}>
                              <Clock size={13} />
                              <span>{log.date}</span>
                            </div>
                          </div>

                          {/* Changement de statut */}
                          {log.ancienStatut && log.nouveauStatut && log.ancienStatut !== log.nouveauStatut && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0', fontSize: '11px' }}>
                              <span style={{ color: theme.textSecondary || '#64748B' }}>Statut :</span>
                              <span style={{ padding: '2px 6px', borderRadius: '4px', background: darkMode ? '#1E293B' : '#E2E8F0', color: theme.textSecondary || '#64748B', textDecoration: 'line-through' }}>
                                {log.ancienStatut}
                              </span>
                              <ArrowRight size={13} color="#2563EB" />
                              {getStatusBadge(log.nouveauStatut)}
                            </div>
                          )}

                          {/* Motif / Justification */}
                          <div style={{ fontSize: '12px', color: theme.textPrimary || '#0F172A', margin: '8px 0', lineHeight: '1.5' }}>
                            {log.motif}
                          </div>

                          {/* Utilisateur et poste d'audit */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', paddingTop: '8px', borderTop: `1px dashed ${theme.border || '#CBD5E1'}`, fontSize: '11px', color: theme.textSecondary || '#64748B' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <User size={13} color="#2563EB" />
                              <span>
                                Effectué par : <strong style={{ color: theme.textPrimary || '#0F172A' }}>{log.utilisateur?.nom || 'Agent SRSP'}</strong> ({log.utilisateur?.role || 'SRSP'})
                              </span>
                            </div>

                            {log.utilisateur?.dept && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Building2 size={12} />
                                <span>{log.utilisateur.dept}</span>
                              </div>
                            )}
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* 2. VOLET RÉCÉPISSÉ OFFICIEL                              */}
          {/* ======================================================== */}
          {activeTab === 'apercu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: theme.itemHover || '#F1F5F9', padding: '16px', borderRadius: '12px', border: `1px solid ${theme.border || '#E2E8F0'}` }}>
                <MiniQrCode code={`${dossier.numero}-${dossier.im}`} size={90} />
                <div style={{ fontSize: '13px', lineHeight: '1.7', flex: 1 }}>
                  <div>Numéro de Dossier : <strong style={{ color: '#2563EB', fontSize: '15px' }}>{dossier.numero}</strong></div>
                  <div>Matricule (IM) : <strong style={{ color: theme.textPrimary || '#0F172A' }}>{dossier.im}</strong></div>
                  <div>Nom & Prénom : <strong>{dossier.nom}</strong></div>
                  <div>Filière & Acte : <strong style={{ color: '#F59E0B' }}>{dossier.filiere}</strong> — {dossier.cat}</div>
                  <div>Date de dépôt : {dossier.date} (Bordereau n° {dossier.be})</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div style={{ background: theme.bgCard || '#FFFFFF', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border || '#E2E8F0'}`, fontSize: '12px' }}>
                  <div style={{ color: theme.textSecondary || '#64748B', fontSize: '11px' }}>Ministère d'appartenance</div>
                  <div style={{ fontWeight: 'bold', marginTop: '2px' }}>{dossier.min}</div>
                </div>

                <div style={{ background: theme.bgCard || '#FFFFFF', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border || '#E2E8F0'}`, fontSize: '12px' }}>
                  <div style={{ color: theme.textSecondary || '#64748B', fontSize: '11px' }}>Coordonnées</div>
                  <div style={{ fontWeight: 'bold', marginTop: '2px' }}>{dossier.email || 'Non renseigné'}</div>
                  <div style={{ color: theme.textSecondary || '#64748B', fontSize: '11px' }}>{dossier.tel || ''}</div>
                </div>

                <div style={{ background: theme.bgCard || '#FFFFFF', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border || '#E2E8F0'}`, fontSize: '12px' }}>
                  <div style={{ color: theme.textSecondary || '#64748B', fontSize: '11px' }}>Statut & Étape</div>
                  <div style={{ marginTop: '4px', display: 'flex', gap: '6px' }}>
                    {getStatusBadge(dossier.etat)}
                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{dossier.stage}</span>
                  </div>
                </div>
              </div>

              {/* Cadre de signature & visa */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: `1px solid ${theme.border || '#E2E8F0'}`, paddingTop: '16px', fontSize: '11px' }}>
                <div style={{ border: `1px dashed ${theme.border || '#CBD5E1'}`, padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: theme.textSecondary || '#64748B' }}>Le Déposant / Usager</div>
                  <div style={{ height: '40px' }} />
                  <div style={{ fontSize: '10px', fontStyle: 'italic' }}>Signature de dépôt</div>
                </div>

                <div style={{ border: `1px dashed ${theme.border || '#CBD5E1'}`, padding: '14px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', color: '#2563EB' }}>Le Guichet Unique SRSP Ambositra</div>
                  <div style={{ height: '40px' }} />
                  <div style={{ fontSize: '10px', fontStyle: 'italic' }}>Cachet officiel et dateur</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* PIED DE PAGE AVEC ACTIONS */}
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${theme.border || '#E2E8F0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: darkMode ? '#0F172A' : '#F8FAFC' }}>
          <div style={{ fontSize: '11px', color: theme.textSecondary || '#64748B' }}>
            Traçabilité certifiée SRSP • Piste d'audit inviolable
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => window.print()}
              style={{
                background: '#2563EB',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Printer size={14} />
              <span>Imprimer</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: theme.itemHover || '#F1F5F9',
                color: theme.textPrimary || '#0F172A',
                border: `1px solid ${theme.border || '#E2E8F0'}`,
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}