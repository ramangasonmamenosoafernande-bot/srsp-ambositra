// =====================================================================
// ARCHITECTURE MVC — VUE : LISTE DES DOSSIERS (DossiersListView.jsx)
// Responsabilité : Affichage complet des dossiers avec onglets par division,
// recherche textuelle, filtres de statut et actions d'audit.
// =====================================================================

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, X, Filter, History, FileText, CheckCircle2, 
  AlertTriangle, Archive, ArrowRight, Hourglass, Clock, 
  RotateCcw, Sparkles, Building2, User
} from 'lucide-react';
import { SLAPastille, SLA_TARGET_DAYS } from './components/SLAAlertsModule';

export default function DossiersListView({
  dossiers = [],
  activeFiliere = 'ALL', // 'ALL' | 'Solde' | 'Pension' | 'Visa'
  lang = 'fr',
  theme = {},
  darkMode = false,
  onOpenDetail,
  onAdvanceStep,
  onUpdateStatus,
  onChangeFiliere,
  onOpenArchiveModal
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'En attente' | 'En cours' | 'Validé' | 'Rejeté'
  const [localFiliere, setLocalFiliere] = useState(activeFiliere);

  // Synchronisation dynamique quand on clique sur une division dans la sidebar
  useEffect(() => {
    setLocalFiliere(activeFiliere);
  }, [activeFiliere]);

  // Filtrage combiné
  const filteredDossiers = useMemo(() => {
    return dossiers.filter(d => {
      // 1. Division
      if (localFiliere !== 'ALL' && d.filiere.toLowerCase() !== localFiliere.toLowerCase()) {
        return false;
      }

      // 2. Statut
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

      // 3. Recherche multi-mots
      if (searchTerm && searchTerm.trim()) {
        const tokens = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
        const searchableFields = [
          d.nom || '',
          d.im || '',
          d.numero || '',
          d.min || '',
          d.cat || '',
          d.be || '',
          d.email || ''
        ].map(s => String(s).toLowerCase());

        const match = tokens.every(tok => 
          searchableFields.some(field => field.includes(tok))
        );
        if (!match) return false;
      }

      return true;
    });
  }, [dossiers, localFiliere, statusFilter, searchTerm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* En-tête et onglets division */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: theme.textPrimary, margin: 0 }}>
            {localFiliere === 'ALL' 
              ? 'Tous les Dossiers Administratifs' 
              : (localFiliere === 'Solde' 
                  ? 'Division de la solde' 
                  : (localFiliere === 'Visa' ? 'Division de visas' : 'Division de pensions'))}
          </h2>
          <div style={{ fontSize: '12px', color: theme.textSecondary, marginTop: '2px' }}>
            Gestion, consultation des pistes d'audit et traitement des actes
          </div>
        </div>

        {/* Onglets rapides Divisions */}
        <div style={{ display: 'flex', background: theme.bgCard, padding: '4px', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'Solde', label: 'Division de la solde' },
            { id: 'Visa', label: 'Division de visas' },
            { id: 'Pension', label: 'Division de pensions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setLocalFiliere(tab.id)}
              style={{
                background: localFiliere === tab.id ? '#2563EB' : 'transparent',
                color: localFiliere === tab.id ? 'white' : theme.textPrimary,
                border: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Barre de recherche et filtres de statut */}
      <div style={{
        background: theme.bgCard,
        padding: '14px 18px',
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Filtrer par nom, IM, référence de dossier, ministère..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 34px',
              background: theme.inputBg,
              border: `1px solid ${theme.inputBorder}`,
              borderRadius: '6px',
              color: theme.textPrimary,
              fontSize: '12px'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtres de statut rapides */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['ALL', 'En attente', 'En cours', 'Validé', 'Rejeté'].map(st => {
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: isSelected ? (darkMode ? '#334155' : '#0F172A') : theme.itemHover,
                  color: isSelected ? 'white' : theme.textPrimary,
                  border: `1px solid ${isSelected ? (darkMode ? '#475569' : '#0F172A') : theme.border}`,
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {st === 'ALL' ? 'Tous les statuts' : st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tableau des dossiers */}
      <div style={{
        background: theme.bgCard,
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.border}`, background: theme.itemHover, color: theme.textSecondary }}>
                <th style={{ padding: '12px' }}>N° Dossier & Date</th>
                <th style={{ padding: '12px' }}>Matricule IM</th>
                <th style={{ padding: '12px' }}>Bénéficiaire & Ministère</th>
                <th style={{ padding: '12px' }}>Division & Nature</th>
                <th style={{ padding: '12px' }}>Étape</th>
                <th style={{ padding: '12px' }}>Statut</th>
                <th style={{ padding: '12px' }}>Délai SLA</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDossiers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: theme.textSecondary }}>
                    Aucun dossier ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredDossiers.map(dossier => {
                  const isValide = dossier.etat === 'Validé';
                  const isRejete = dossier.etat === 'Rejeté';
                  const isEnAttente = dossier.etat === 'En attente' || (dossier.etat === 'En cours' && dossier.stage === 'Accueil');

                  const statusColor = isValide ? '#059669' : isRejete ? '#DC2626' : isEnAttente ? '#CA8A04' : '#2563EB';
                  const statusBg = isValide ? '#10B98118' : isRejete ? '#EF444418' : isEnAttente ? '#EAB30818' : '#2563EB18';

                  return (
                    <tr 
                      key={dossier.id}
                      style={{ 
                        borderBottom: `1px solid ${theme.border}`,
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: 'bold', color: '#2563EB' }}>{dossier.numero}</div>
                        <div style={{ fontSize: '10px', color: theme.textSecondary }}>{dossier.dateDepot}</div>
                      </td>

                      <td style={{ padding: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {dossier.im}
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '600', color: theme.textPrimary }}>{dossier.nom}</div>
                        <div style={{ fontSize: '10px', color: theme.textSecondary }}>{dossier.min}</div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <div style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: dossier.filiere === 'Solde' ? '#F59E0B20' : dossier.filiere === 'Pension' ? '#3B82F620' : '#10B98120',
                          color: dossier.filiere === 'Solde' ? '#D97706' : dossier.filiere === 'Pension' ? '#2563EB' : '#059669',
                          marginBottom: '3px'
                        }}>
                          {dossier.filiere === 'Solde' ? 'Division de la solde' : dossier.filiere === 'Visa' ? 'Division de visas' : 'Division de pensions'}
                        </div>
                        <div style={{ fontSize: '10px', color: theme.textSecondary }}>{dossier.cat}</div>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: theme.itemHover,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: theme.textPrimary
                        }}>
                          {dossier.stage}
                        </span>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: statusBg,
                          color: statusColor,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {dossier.etat}
                        </span>
                      </td>

                      <td style={{ padding: '12px' }}>
                        <SLAPastille delaiJours={dossier.delai || 0} />
                      </td>

                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          onClick={() => onOpenDetail(dossier, 'historique')}
                          style={{
                            background: '#2563EB',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <History size={13} />
                          <span>Historique & Audit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}