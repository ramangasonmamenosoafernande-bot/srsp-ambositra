// =====================================================================
// ARCHITECTURE MVC — VUE : MODALE ARCHIVAGE (ArchiveModal.jsx)
// Responsabilité : Saisie des données de classement physique et versement
// =====================================================================

import React, { useState } from 'react';
import { Archive, X } from 'lucide-react';
import { generateArchiveCote } from '../../models/archiveModel';

export default function ArchiveModal({
  targetDossier,
  archivesCount = 0,
  theme = {},
  darkMode = false,
  onClose,
  onConfirm
}) {
  const [coteBoite, setCoteBoite] = useState(() => generateArchiveCote(archivesCount));
  const [emplacement, setEmplacement] = useState('Salle Archives A • Rayonnage 1 • Tablette B');
  const [motif, setMotif] = useState('Traitement achevé et ordonnancé au paiement');
  const [agentArchiviste, setAgentArchiviste] = useState('Responsable Archives SRSP Ambositra');

  if (!targetDossier) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(targetDossier, {
      coteBoite: coteBoite.trim(),
      emplacement: emplacement.trim(),
      motif: motif.trim(),
      agentArchiviste: agentArchiviste.trim()
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ background: theme.bgCard || '#FFFFFF', padding: '22px', borderRadius: '14px', maxWidth: '500px', width: '100%', border: `1px solid ${theme.border || '#E2E8F0'}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border || '#E2E8F0'}`, paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Archive size={18} color="#8B5CF6" />
            <strong style={{ fontSize: '15px', color: theme.textPrimary || '#0F172A' }}>Versement aux Archives Régionales</strong>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textSecondary || '#64748B', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ background: theme.itemHover || '#F1F5F9', padding: '12px', borderRadius: '10px', fontSize: '12px', lineHeight: '1.6' }}>
          <div>N° Dossier : <strong style={{ color: '#2563EB' }}>{targetDossier.numero}</strong></div>
          <div>Bénéficiaire : <strong>{targetDossier.nom}</strong> (IM: {targetDossier.im})</div>
          <div>Filière : <strong>{targetDossier.filiere}</strong> — {targetDossier.cat}</div>
          <div>Statut actuel : <span style={{ fontWeight: 'bold', color: targetDossier.etat === 'Validé' ? '#10B981' : '#EF4444' }}>{targetDossier.etat}</span></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: theme.textSecondary || '#64748B', marginBottom: '4px' }}>
              Cote de Boîte d'Archive *
            </label>
            <input 
              type="text" 
              value={coteBoite} 
              onChange={e => setCoteBoite(e.target.value)} 
              style={{ width: '100%', padding: '8px 10px', background: theme.inputBg || '#F8FAFC', border: `1px solid ${theme.inputBorder || '#CBD5E1'}`, color: theme.textPrimary || '#0F172A', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }} 
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: theme.textSecondary || '#64748B', marginBottom: '4px' }}>
              Emplacement Physique dans la Salle *
            </label>
            <input 
              type="text" 
              value={emplacement} 
              onChange={e => setEmplacement(e.target.value)} 
              style={{ width: '100%', padding: '8px 10px', background: theme.inputBg || '#F8FAFC', border: `1px solid ${theme.inputBorder || '#CBD5E1'}`, color: theme.textPrimary || '#0F172A', borderRadius: '6px', fontSize: '12px' }} 
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: theme.textSecondary || '#64748B', marginBottom: '4px' }}>
              Motif de Clôture *
            </label>
            <textarea 
              rows={2} 
              value={motif} 
              onChange={e => setMotif(e.target.value)} 
              style={{ width: '100%', padding: '8px 10px', background: theme.inputBg || '#F8FAFC', border: `1px solid ${theme.inputBorder || '#CBD5E1'}`, color: theme.textPrimary || '#0F172A', borderRadius: '6px', fontSize: '12px' }} 
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: theme.textSecondary || '#64748B', marginBottom: '4px' }}>
              Agent Responsable du Versement
            </label>
            <input 
              type="text" 
              value={agentArchiviste} 
              onChange={e => setAgentArchiviste(e.target.value)} 
              style={{ width: '100%', padding: '8px 10px', background: theme.inputBg || '#F8FAFC', border: `1px solid ${theme.inputBorder || '#CBD5E1'}`, color: theme.textPrimary || '#0F172A', borderRadius: '6px', fontSize: '12px' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button 
              type="button"
              onClick={onClose} 
              style={{ background: theme.itemHover || '#F1F5F9', color: theme.textPrimary || '#0F172A', border: `1px solid ${theme.border || '#E2E8F0'}`, padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              style={{ background: '#8B5CF6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Archive size={14} />
              <span>Confirmer le Versement aux Archives</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}