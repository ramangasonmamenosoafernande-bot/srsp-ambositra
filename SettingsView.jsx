// =====================================================================
// ARCHITECTURE MVC — VUE : PARAMÈTRES (SettingsView.jsx)
// Responsabilité : Configuration système, signaux sonores avec test
// =====================================================================

import React from 'react';
import { Settings, Moon, Sun, Volume2, VolumeX, RotateCcw, Play } from 'lucide-react';

export default function SettingsView({
  darkMode = false,
  onToggleDarkMode,
  sound = true,
  onToggleSound,
  onTestSound,
  lang = 'fr',
  onToggleLang,
  onResetAll,
  theme = {}
}) {
  const bgCard = theme?.bgCard || (darkMode ? '#1E293B' : '#FFFFFF');
  const border = theme?.border || (darkMode ? '#334155' : '#E2E8F0');
  const textPrimary = theme?.textPrimary || (darkMode ? '#F8FAFC' : '#0F172A');
  const textSecondary = theme?.textSecondary || (darkMode ? '#94A3B8' : '#64748B');
  const itemHover = theme?.itemHover || (darkMode ? '#334155' : '#F1F5F9');

  const isMg = lang === 'mg';

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* En-tête */}
      <div style={{ background: bgCard, padding: '20px', borderRadius: '12px', border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: '#2563EB15', color: '#2563EB' }}>
            <Settings size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>
              {isMg ? "Fikirakirana & Safidin'ny Sehatra" : "Paramètres de l'Application & Préférences"}
            </h2>
            <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>
              {isMg ? "Fandrindrana ny feo, ny fahitana ary ny firaketana" : "Gestion des signaux sonores, de l'affichage et du registre local"}
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div style={{ background: bgCard, borderRadius: '12px', border: `1px solid ${border}`, padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* Mode Sombre */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: `1px solid ${border}` }}>
          <div>
            <strong style={{ fontSize: '13px', color: textPrimary }}>
              {isMg ? 'Fomba fijery' : "Mode d'affichage"}
            </strong>
            <div style={{ fontSize: '11px', color: textSecondary }}>
              {isMg ? 'Hanova ny lohahevitra maizina na mazava' : 'Basculer entre le thème clair et le thème sombre'}
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleDarkMode}
            style={{
              background: itemHover,
              color: textPrimary,
              border: `1px solid ${border}`,
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {darkMode ? <Sun size={15} color="#F59E0B" /> : <Moon size={15} />}
            <span>{darkMode ? "Thème Sombre Actif" : "Thème Clair Actif"}</span>
          </button>
        </div>

        {/* Effets sonores avec bouton de test */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: `1px solid ${border}` }}>
          <div>
            <strong style={{ fontSize: '13px', color: textPrimary }}>
              {isMg ? "Famantarana amin'ny Feo" : 'Signaux sonores & Alertes acoustiques'}
            </strong>
            <div style={{ fontSize: '11px', color: textSecondary }}>
              {isMg ? 'Feo rehefa misy fanamarihana na dosie vaovao' : "Carillon sonore lors des dépôts de dossiers, alertes et validations"}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {sound && onTestSound && (
              <button
                type="button"
                onClick={onTestSound}
                title="Tester le signal sonore"
                style={{
                  background: itemHover,
                  color: '#2563EB',
                  border: `1px solid ${border}`,
                  padding: '7px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Play size={12} />
                <span>Tester</span>
              </button>
            )}
            <button
              type="button"
              onClick={onToggleSound}
              style={{
                background: sound ? '#10B98115' : itemHover,
                color: sound ? '#059669' : textSecondary,
                border: `1px solid ${sound ? '#10B981' : border}`,
                padding: '8px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {sound ? <Volume2 size={15} color="#059669" /> : <VolumeX size={15} />}
              <span>{sound ? "Sons Activés" : "Sons Désactivés"}</span>
            </button>
          </div>
        </div>

        {/* Langue de l'interface */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: `1px solid ${border}` }}>
          <div>
            <strong style={{ fontSize: '13px', color: textPrimary }}>Langue de l'interface</strong>
            <div style={{ fontSize: '11px', color: textSecondary }}>Français ou Malagasy officiel</div>
          </div>
          <button
            type="button"
            onClick={onToggleLang}
            style={{
              background: itemHover,
              color: textPrimary,
              border: `1px solid ${border}`,
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🇲🇬 / 🇫🇷 {lang ? lang.toUpperCase() : 'FR'}
          </button>
        </div>

        {/* Réinitialisation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ fontSize: '13px', color: '#DC2626' }}>Réinitialiser les dossiers & archives</strong>
            <div style={{ fontSize: '11px', color: textSecondary }}>Restaure le registre d'origine de la SRSP</div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm("Voulez-vous vraiment réinitialiser toutes les données de test du SRSP ?")) {
                if (onResetAll) onResetAll();
              }
            }}
            style={{
              background: '#EF4444',
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
            <RotateCcw size={14} />
            <span>Réinitialiser</span>
          </button>
        </div>

      </div>

    </div>
  );
}