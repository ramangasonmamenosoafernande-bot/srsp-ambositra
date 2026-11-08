// =====================================================================
// ARCHITECTURE MVC — VUE : MODALE BORDEREAU AUX ARCHIVES (ArchiveSlipModal.jsx)
// Responsabilité : Fiche bordereau aux archives imprimable
// Allégé et épuré selon les spécifications exactes :
// - Titre : "BORDEREAU AUX ARCHIVES"
// - Sans date de versement, sans cote boîte, sans localisation, sans décision finale
// =====================================================================

import React from 'react';
import { X, Printer } from 'lucide-react';

export default function ArchiveSlipModal({
  slip,
  theme = {},
  darkMode = false,
  onClose
}) {
  if (!slip) return null;

  // Calcul d'une référence propre au bordereau
  const refBordereau = slip.bordereau_id 
    ? `BV-${slip.bordereau_id}` 
    : slip.id 
      ? `BV-${slip.id}` 
      : `BV-${slip.numero || 'ARCH-001'}`;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.75)', 
        backdropFilter: 'blur(3px)',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000, 
        padding: '16px' 
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div 
        style={{ 
          background: theme.bgCard || (darkMode ? '#0F172A' : '#FFFFFF'), 
          padding: '24px', 
          borderRadius: '14px', 
          maxWidth: '560px', 
          width: '100%', 
          border: `1px solid ${theme.border || (darkMode ? '#1E293B' : '#E2E8F0')}`, 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          position: 'relative'
        }}
      >
        
        {/* Bouton Fermer (X) en haut à droite */}
        <button 
          onClick={onClose} 
          aria-label="Fermer"
          style={{ 
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none', 
            border: 'none', 
            color: theme.textSecondary || '#94A3B8', 
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* En-tête officiel centré */}
        <div style={{ textAlign: 'center', paddingBottom: '6px' }}>
          <div style={{ fontSize: '10px', color: '#94A3B8', letterSpacing: '0.8px', fontWeight: '700' }}>
            REPOBLIKAN'I MADAGASIKARA
          </div>
          <strong style={{ 
            fontSize: '15px', 
            color: '#3B82F6', 
            display: 'block', 
            marginTop: '6px',
            fontWeight: '800',
            letterSpacing: '0.5px'
          }}>
            BORDEREAU AUX ARCHIVES
          </strong>
          <div style={{ fontSize: '10px', color: theme.textSecondary || '#64748B', marginTop: '4px', letterSpacing: '0.3px', fontWeight: '500' }}>
            DIRECTION RÉGIONALE DU BUDGET • SRSP AMBOSITRA
          </div>
        </div>

        {/* 1er Encadré : Référence Bordereau (sans Date, sans Cote boîte, sans Localisation) */}
        <div 
          style={{ 
            background: darkMode ? '#131D31' : '#F1F5F9', 
            padding: '16px', 
            borderRadius: '10px', 
            border: `1px solid ${darkMode ? '#1E293B' : '#E2E8F0'}`,
            textAlign: 'center',
            fontSize: '13px',
            lineHeight: '1.6'
          }}
        >
          <div style={{ color: theme.textPrimary || '#F8FAFC' }}>
            Réf Bordereau : <strong style={{ fontWeight: '700' }}>{refBordereau}</strong>
          </div>
          {slip.min && (
            <div style={{ fontSize: '11px', color: theme.textSecondary || '#94A3B8', marginTop: '4px' }}>
              Ministère d'Origine : <strong>{slip.min}</strong>
            </div>
          )}
        </div>

        {/* 2ème Encadré : Informations Dossier & Bénéficiaire (sans Décision Finale) */}
        <div 
          style={{ 
            background: darkMode ? '#131D31' : '#F1F5F9', 
            padding: '16px', 
            borderRadius: '10px', 
            border: `1px solid ${darkMode ? '#1E293B' : '#E2E8F0'}`,
            textAlign: 'center',
            fontSize: '12px',
            lineHeight: '1.8'
          }}
        >
          <div style={{ color: theme.textPrimary || '#F8FAFC' }}>
            <strong>Dossier N° :</strong> {slip.numero} {slip.im ? `(Matricule : ${slip.im})` : ''}
          </div>
          <div style={{ color: theme.textPrimary || '#F8FAFC', fontWeight: '700', textTransform: 'uppercase' }}>
            Nom : {slip.nom}
          </div>
          <div style={{ color: theme.textPrimary || '#F8FAFC' }}>
            <strong>Nature :</strong> {slip.cat || 'Dossier'} {slip.filiere ? `(${slip.filiere})` : ''}
          </div>
          {slip.motif && (
            <div style={{ fontSize: '11px', color: theme.textSecondary || '#94A3B8', marginTop: '4px' }}>
              Motif : {slip.motif}
            </div>
          )}
        </div>

        {/* Boutons d'actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
          <button 
            type="button"
            onClick={() => window.print()} 
            style={{ 
              background: '#2563EB', 
              color: '#FFFFFF', 
              border: 'none', 
              padding: '9px 18px', 
              borderRadius: '8px', 
              fontWeight: '700', 
              cursor: 'pointer', 
              fontSize: '13px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              boxShadow: '0 2px 6px rgba(37,99,235,0.3)'
            }}
          >
            <Printer size={15} /> 
            <span>Imprimer</span>
          </button>
          
          <button 
            type="button"
            onClick={onClose} 
            style={{ 
              background: darkMode ? '#1E293B' : '#E2E8F0', 
              color: theme.textPrimary || (darkMode ? '#F8FAFC' : '#1E293B'), 
              border: `1px solid ${darkMode ? '#334155' : '#CBD5E1'}`, 
              padding: '9px 18px', 
              borderRadius: '8px', 
              fontWeight: '600', 
              cursor: 'pointer', 
              fontSize: '13px'
            }}
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
}