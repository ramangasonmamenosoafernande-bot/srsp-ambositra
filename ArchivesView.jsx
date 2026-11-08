// =====================================================================
// ARCHITECTURE MVC — VUE : ARCHIVES RÉGIONALES (ArchivesView.jsx)
// Responsabilité : Gestion et classement des archives par division
// (Division de la solde, Division de visas, Division de pensions)
// Tableau allégé selon les spécifications : sans Cote de boîte,
// sans Localisation salle, sans Date de versement.
// =====================================================================

import React, { useState } from 'react';
import { 
  Archive, 
  Search, 
  Printer, 
  X,
  CreditCard,
  Stamp,
  Award
} from 'lucide-react';

// Helper pour déterminer la division d'une archive
export const getArchiveDivision = (archive) => {
  const f = (archive?.filiere || archive?.division || archive?.categorie || '').toLowerCase();
  if (f.includes('solde')) return 'Solde';
  if (f.includes('visa')) return 'Visas';
  if (f.includes('pension')) return 'Pensions';
  return 'Autre';
};

export default function ArchivesView({
  archives = [],
  currentUser = null,
  lang = 'fr',
  theme = {},
  darkMode = false,
  onOpenArchiveSlip,
  onOpenArchiveDetail
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDivision, setFilterDivision] = useState('ALL'); // 'ALL' | 'Solde' | 'Visas' | 'Pensions'

  // Calcul des compteurs par division
  const countSolde = archives.filter(a => getArchiveDivision(a) === 'Solde').length;
  const countVisas = archives.filter(a => getArchiveDivision(a) === 'Visas').length;
  const countPensions = archives.filter(a => getArchiveDivision(a) === 'Pensions').length;
  const countTotal = archives.length;

  // Filtrage combiné
  const filteredArchives = archives.filter(a => {
    const div = getArchiveDivision(a);
    if (filterDivision !== 'ALL' && div !== filterDivision) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = [
        a.numero || '',
        a.im || '',
        a.nom || '',
        a.min || '',
        a.cat || '',
        a.filiere || '',
        div || ''
      ].some(val => String(val).toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getDivisionBadge = (archive) => {
    const div = getArchiveDivision(archive);
    if (div === 'Solde') {
      return {
        label: lang === 'mg' ? 'Fizarana Karama (Solde)' : 'Division de la Solde',
        color: '#10B981',
        bg: '#10B98115',
        border: '#10B98130',
        icon: <CreditCard size={13} />
      };
    }
    if (div === 'Visas') {
      return {
        label: lang === 'mg' ? 'Fizarana Visas' : 'Division de Visas',
        color: '#F59E0B',
        bg: '#F59E0B15',
        border: '#F59E0B30',
        icon: <Stamp size={13} />
      };
    }
    return {
      label: lang === 'mg' ? 'Fizarana Fisondrotana (Pensions)' : 'Division de Pensions',
      color: '#8B5CF6',
      bg: '#8B5CF615',
      border: '#8B5CF630',
      icon: <Award size={13} />
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. EN-TÊTE OFFICIEL DES ARCHIVES */}
      <div style={{ background: theme.bgCard, padding: '20px', borderRadius: '14px', border: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '12px', background: '#8B5CF618', color: '#8B5CF6' }}>
              <Archive size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: theme.textPrimary, margin: 0 }}>
                  {lang === 'mg' ? 'Tahiry Rezionaly — SRSP Ambositra' : 'Archives Régionales — SRSP Ambositra'}
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#8B5CF620',
                  color: '#8B5CF6',
                  border: '1px solid #8B5CF640'
                }}>
                  {archives.length} {lang === 'mg' ? 'dossiers voatahiry' : 'dossiers archivés'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '3px' }}>
                {lang === 'mg'
                  ? 'Fizarana mazava : Tahirin\'ny Solde, Visas ary Pensions • Fitehirizana ara-dalàna'
                  : 'Classement réglementaire par division : Solde, Visas et Pensions • Conservation légale'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATISTIQUES PAR DIVISION (3 CARTES CLICQUABLES) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* CARTE : ARCHIVES SOLDE */}
        <div
          onClick={() => setFilterDivision('Solde')}
          style={{
            background: filterDivision === 'Solde' ? (darkMode ? '#064E3B20' : '#ECFDF5') : theme.bgCard,
            border: filterDivision === 'Solde' ? '2px solid #10B981' : `1px solid ${theme.border}`,
            padding: '16px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: filterDivision === 'Solde' ? '0 4px 12px rgba(16,185,129,0.15)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: filterDivision === 'Solde' ? '#10B981' : theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'mg' ? 'Tahirin\'ny Solde' : 'Archives Solde'}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#10B98115', color: '#10B981' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#10B981' }}>
            {countSolde}
          </div>
          <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '4px' }}>
            {lang === 'mg' ? 'Fizarana Karama & Tambin-karama' : 'Division de la Solde & Rémunérations'}
          </div>
        </div>

        {/* CARTE : ARCHIVES VISAS */}
        <div
          onClick={() => setFilterDivision('Visas')}
          style={{
            background: filterDivision === 'Visas' ? (darkMode ? '#78350F20' : '#FFFBEB') : theme.bgCard,
            border: filterDivision === 'Visas' ? '2px solid #F59E0B' : `1px solid ${theme.border}`,
            padding: '16px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: filterDivision === 'Visas' ? '0 4px 12px rgba(245,158,11,0.15)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: filterDivision === 'Visas' ? '#F59E0B' : theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'mg' ? 'Tahirin\'ny Visas' : 'Archives Visas'}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#F59E0B15', color: '#F59E0B' }}>
              <Stamp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#D97706' }}>
            {countVisas}
          </div>
          <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '4px' }}>
            {lang === 'mg' ? 'Fizarana Visas (Titres & Mandats)' : 'Division de Visas (Titres & Engagements)'}
          </div>
        </div>

        {/* CARTE : ARCHIVES PENSIONS */}
        <div
          onClick={() => setFilterDivision('Pensions')}
          style={{
            background: filterDivision === 'Pensions' ? (darkMode ? '#581C8720' : '#FAF5FF') : theme.bgCard,
            border: filterDivision === 'Pensions' ? '2px solid #8B5CF6' : `1px solid ${theme.border}`,
            padding: '16px',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: filterDivision === 'Pensions' ? '0 4px 12px rgba(139,92,246,0.15)' : 'none'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: filterDivision === 'Pensions' ? '#8B5CF6' : theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {lang === 'mg' ? 'Tahirin\'ny Pensions' : 'Archives Pensions'}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#8B5CF615', color: '#8B5CF6' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: '#8B5CF6' }}>
            {countPensions}
          </div>
          <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '4px' }}>
            {lang === 'mg' ? 'Fizarana Fisotroan-dronono (Retraites)' : 'Division de Pensions (Retraites & Réversions)'}
          </div>
        </div>

      </div>

      {/* 3. BARRE DE RECHERCHE & ONGLET DE SÉLECTION RAPIDE */}
      <div style={{
        background: theme.bgCard,
        padding: '14px 18px',
        borderRadius: '12px',
        border: `1px solid ${theme.border}`,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Input de recherche */}
        <div style={{ flex: '1 1 320px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textSecondary }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={lang === 'mg' ? "Tadiavo amin'ny laharana, anarana, IM, asa, fizarana..." : "Rechercher par numéro de dossier, nom, IM, type d'acte, division..."}
            style={{
              width: '100%',
              padding: '9px 12px 9px 38px',
              borderRadius: '8px',
              background: theme.inputBg,
              border: `1px solid ${theme.inputBorder}`,
              color: theme.textPrimary,
              fontSize: '13px'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Boutons d'onglets de division */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: lang === 'mg' ? 'Rehetra' : 'Toutes divisions', count: countTotal },
            { id: 'Solde', label: lang === 'mg' ? 'Solde' : 'Div. Solde', count: countSolde, color: '#10B981' },
            { id: 'Visas', label: lang === 'mg' ? 'Visas' : 'Div. Visas', count: countVisas, color: '#F59E0B' },
            { id: 'Pensions', label: lang === 'mg' ? 'Pensions' : 'Div. Pensions', count: countPensions, color: '#8B5CF6' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterDivision(tab.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700',
                border: filterDivision === tab.id ? `2px solid ${tab.color || '#2563EB'}` : `1px solid ${theme.border}`,
                background: filterDivision === tab.id ? (tab.color ? `${tab.color}18` : '#2563EB15') : theme.itemHover || 'transparent',
                color: filterDivision === tab.id ? (tab.color || '#2563EB') : theme.textPrimary,
                cursor: 'pointer'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '10px',
                padding: '1px 6px',
                borderRadius: '10px',
                background: filterDivision === tab.id ? (tab.color || '#2563EB') : (darkMode ? '#334155' : '#E2E8F0'),
                color: filterDivision === tab.id ? 'white' : theme.textPrimary,
                fontWeight: '800'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. TABLEAU DES ARCHIVES PAR DIVISION */}
      <div style={{ background: theme.bgCard, borderRadius: '14px', border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: darkMode ? '#0F172A' : '#F8FAFC', borderBottom: `2px solid ${theme.border}`, color: theme.textSecondary }}>
                <th style={{ padding: '13px 16px', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Division</th>
                <th style={{ padding: '13px 16px', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>N° Dossier & IM</th>
                <th style={{ padding: '13px 16px', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>Bénéficiaire & Acte</th>
                <th style={{ padding: '13px 16px', fontWeight: '700', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px', textAlign: 'right' }}>Bordereau</th>
              </tr>
            </thead>
            <tbody>
              {filteredArchives.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px 20px', textAlign: 'center', color: theme.textSecondary }}>
                    <Archive size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>
                      {lang === 'mg' ? 'Tsy misy rakitra mifanaraka amin\'ny fikarohana' : 'Aucune archive trouvée pour ces critères.'}
                    </div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      {lang === 'mg' ? 'Andramo ovaina ny sivana na ny teny tadiavina.' : 'Modifiez vos filtres de division ou vos mots-clés de recherche.'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredArchives.map(arch => {
                  const badge = getDivisionBadge(arch);
                  return (
                    <tr 
                      key={arch.id} 
                      style={{ 
                        borderBottom: `1px solid ${theme.border}`,
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = darkMode ? '#1E293B50' : '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      {/* Division Badge */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: '700',
                          fontSize: '11px',
                          color: badge.color,
                          background: badge.bg,
                          border: `1px solid ${badge.border}`,
                          padding: '5px 10px',
                          borderRadius: '8px'
                        }}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Dossier & IM */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '800', color: '#2563EB', fontFamily: 'monospace', fontSize: '13px' }}>{arch.numero}</div>
                        <div style={{ fontSize: '11px', color: theme.textSecondary, fontWeight: '600', marginTop: '2px' }}>IM : {arch.im}</div>
                      </td>

                      {/* Bénéficiaire & Acte */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '700', color: theme.textPrimary, fontSize: '13px' }}>{arch.nom}</div>
                        <div style={{ fontSize: '11px', color: theme.textSecondary, marginTop: '2px' }}>
                          {arch.cat || arch.filiere}
                        </div>
                        {arch.min && (
                          <div style={{ fontSize: '10px', color: theme.textSecondary, opacity: 0.8, marginTop: '1px' }}>
                            {arch.min}
                          </div>
                        )}
                      </td>

                      {/* Action : Bordereau */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => onOpenArchiveSlip && onOpenArchiveSlip(arch)}
                          style={{
                            background: '#8B5CF6',
                            color: 'white',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(139,92,246,0.25)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <Printer size={13} />
                          <span>{lang === 'mg' ? 'Taratasy' : 'Bordereau'}</span>
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