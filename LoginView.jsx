// =====================================================================
// ARCHITECTURE MVC — VUE : PAGE DE CONNEXION & AUTHENTIFICATION MODERNE
// Service Régional des Soldes et Pensions (SRSP) Ambositra — Amoron'i Mania
// =====================================================================

import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, User, Eye, EyeOff, LogIn, AlertCircle, 
  Sun, Moon, KeyRound, Users, Stamp, Coins, Archive, ChevronRight, 
  Landmark, FileSearch, ExternalLink, ShieldAlert, FileCheck2, ReceiptText
} from 'lucide-react';
import { DEMO_USERS } from '../models/userModel';
import { playAcousticSignal } from '../services/soundService';

export default function LoginView({
  onLogin,
  onDirectLogin,
  onOpenPublicTrack,
  lang = 'fr',
  onToggleLang,
  darkMode = false,
  onToggleDarkMode,
  theme = {}
}) {
  const [activeMode, setActiveMode] = useState('credentials'); // 'credentials' | 'roles'
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const isMg = lang === 'mg';

  // Palette de styles intégrés (anti-page blanche ou brute)
  const S = {
    page: {
      minHeight: '100vh',
      backgroundColor: darkMode ? '#0B1120' : '#F1F5F9',
      color: darkMode ? '#F8FAFC' : '#0F172A',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box'
    },
    topBar: {
      padding: '12px 24px',
      backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
      borderBottom: `1px solid ${darkMode ? '#1E293B' : '#E2E8F0'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backdropFilter: 'blur(8px)'
    },
    heroCard: {
      background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 50%, #134E4A 100%)',
      borderRadius: '24px',
      padding: '32px',
      color: '#FFFFFF',
      border: '1px solid rgba(16, 185, 129, 0.25)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    },
    authCard: {
      backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
      borderRadius: '24px',
      padding: '32px',
      border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`,
      boxShadow: darkMode ? '0 20px 40px rgba(0, 0, 0, 0.5)' : '0 10px 30px rgba(0, 0, 0, 0.08)'
    },
    input: {
      width: '100%',
      padding: '12px 14px 12px 40px',
      borderRadius: '12px',
      fontSize: '14px',
      border: `1px solid ${darkMode ? '#475569' : '#CBD5E1'}`,
      backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
      color: darkMode ? '#FFFFFF' : '#0F172A',
      outline: 'none',
      boxSizing: 'border-box'
    },
    btnPrimary: {
      width: '100%',
      padding: '14px 20px',
      borderRadius: '14px',
      background: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
      color: '#FFFFFF',
      border: 'none',
      fontWeight: '700',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: '0 8px 20px rgba(5, 150, 105, 0.35)',
      transition: 'all 0.2s ease'
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const u = username.trim();
    const p = password.trim();

    if (!u) {
      setErrorMsg(isMg ? "Ampidiro ny solonanarana na laharana IM" : "Veuillez saisir votre identifiant administratif.");
      playAcousticSignal('alert');
      return;
    }

    if (!p) {
      setErrorMsg(isMg ? "Ampidiro ny tenimiafina" : "Veuillez renseigner votre mot de passe.");
      playAcousticSignal('alert');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = onLogin(u, p, rememberMe);
      setIsLoading(false);

      if (res && res.success) {
        playAcousticSignal('success');
      } else {
        setErrorMsg(res?.error || (isMg ? "Diso ny solonanarana na ny tenimiafina" : "Identifiant ou mot de passe incorrect."));
        playAcousticSignal('alert');
      }
    }, 300);
  };

  const handleRoleCardClick = (user) => {
    setIsLoading(true);
    playAcousticSignal('success');
    setTimeout(() => {
      if (onDirectLogin) {
        onDirectLogin(user);
      } else {
        onLogin(user.username, user.password || 'admin', true);
      }
      setIsLoading(false);
    }, 200);
  };

  const getRoleIcon = (roleName) => {
    const r = (roleName || '').toLowerCase();
    if (r.includes('admin')) return <Stamp size={18} color="#10B981" />;
    if (r.includes('coordo')) return <ShieldCheck size={18} color="#3B82F6" />;
    if (r.includes('accueil') || r.includes('guichet')) return <Users size={18} color="#14B8A6" />;
    if (r.includes('visa')) return <FileCheck2 size={18} color="#8B5CF6" />;
    if (r.includes('solde')) return <Coins size={18} color="#F59E0B" />;
    if (r.includes('pension')) return <ReceiptText size={18} color="#EC4899" />;
    if (r.includes('archive')) return <Archive size={18} color="#6366F1" />;
    return <User size={18} color="#10B981" />;
  };

  return (
    <div style={S.page}>
      
      {/* En-tête */}
      <header style={S.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
          }}>
            <Landmark size={22} />
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#059669' }}>
              Repoblikan'i Madagasikara
            </div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: darkMode ? '#94A3B8' : '#64748B' }}>
              Direction Régionale du Budget · SRSP Ambositra
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={onOpenPublicTrack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              border: `1px solid ${darkMode ? '#334155' : '#CBD5E1'}`,
              backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
              color: darkMode ? '#F8FAFC' : '#0F172A',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            <FileSearch size={14} color="#059669" />
            <span>{isMg ? 'Fanaraha-maso ho an’ny vahoaka' : 'Suivi Public Usager'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleLang}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: `1px solid ${darkMode ? '#334155' : '#CBD5E1'}`,
              backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
              color: '#059669',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {lang === 'fr' ? '🇲🇬 MG' : '🇫🇷 FR'}
          </button>

          <button
            type="button"
            onClick={onToggleDarkMode}
            style={{
              padding: '8px 10px',
              borderRadius: '10px',
              border: `1px solid ${darkMode ? '#334155' : '#CBD5E1'}`,
              backgroundColor: darkMode ? '#1E293B' : '#FFFFFF',
              color: darkMode ? '#FBBF24' : '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Zone centrale */}
      <main style={{
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '32px',
        alignItems: 'stretch',
        boxSizing: 'border-box'
      }}>
        
        {/* Colonne gauche institutionnelle */}
        <div style={S.heroCard}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '30px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#6EE7B7',
              fontSize: '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              <ShieldCheck size={14} />
              <span>Système Officiel Sécurisé</span>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: '800', lineHeight: '1.25', margin: '0 0 10px 0' }}>
              Service Régional des Soldes et Pensions
            </h1>
            <div style={{ fontSize: '14px', color: '#A7F3D0', fontWeight: '600' }}>
              Direction Régionale du Budget & Finances · Amoron'i Mania — Ambositra
            </div>
            <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '12px', lineHeight: '1.6' }}>
              Portail centralisé de liquidation des pensions civiles, gestion des états de solde des agents de l'État, visas de conformité et archivage réglementaire.
            </p>

            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                padding: '12px 16px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <ReceiptText size={20} color="#34D399" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>Pensions & Soldes Publiques</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Liquidation officielle conforme au statut général</div>
                </div>
              </div>

              <div style={{
                padding: '12px 16px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FileCheck2 size={20} color="#38BDF8" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>Visa Trésor & Contrôle SLA</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Circuit traçable en temps réel avec alertes sonores</div>
                </div>
              </div>

              <div style={{
                padding: '12px 16px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Archive size={20} color="#A78BFA" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>Archives Régionales & Récépissés</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>Numérisation sécurisée et cotation automatique</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '32px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#6EE7B7'
          }}>
            <span>Tanindrazana - Fahafahana - Fandrosoana</span>
            <span style={{ fontFamily: 'monospace' }}>SRSP-2026.2</span>
          </div>
        </div>

        {/* Colonne droite de connexion */}
        <div style={S.authCard}>
          
          <div style={{
            display: 'flex',
            gap: '6px',
            padding: '4px',
            borderRadius: '14px',
            backgroundColor: darkMode ? '#0F172A' : '#F1F5F9',
            border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`,
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => { setActiveMode('credentials'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                backgroundColor: activeMode === 'credentials' ? (darkMode ? '#1E293B' : '#FFFFFF') : 'transparent',
                color: activeMode === 'credentials' ? '#059669' : (darkMode ? '#94A3B8' : '#64748B'),
                boxShadow: activeMode === 'credentials' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <KeyRound size={14} />
              <span>{isMg ? 'Fidirana tenimiafina' : 'Identifiant & Mot de Passe'}</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveMode('roles'); setErrorMsg(''); }}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                backgroundColor: activeMode === 'roles' ? (darkMode ? '#1E293B' : '#FFFFFF') : 'transparent',
                color: activeMode === 'roles' ? '#059669' : (darkMode ? '#94A3B8' : '#64748B'),
                boxShadow: activeMode === 'roles' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Users size={14} />
              <span>{isMg ? 'Safidy andraikitra' : 'Sélection Rapide par Rôle'}</span>
            </button>
          </div>

          {errorMsg && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: darkMode ? '#450A0A' : '#FEF2F2',
              border: `1px solid ${darkMode ? '#7F1D1D' : '#FCA5A5'}`,
              color: darkMode ? '#FCA5A5' : '#B91C1C',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <div>{errorMsg}</div>
            </div>
          )}

          {activeMode === 'credentials' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', color: darkMode ? '#CBD5E1' : '#475569' }}>
                  {isMg ? 'Solonanarana' : 'Identifiant administratif'}
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }}>
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ex: admin, chef.coordo, chef.visa"
                    autoComplete="username"
                    style={S.input}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: darkMode ? '#CBD5E1' : '#475569' }}>
                    {isMg ? 'Tenimiafina' : 'Mot de passe officiel'}
                  </label>
                  {capsLockActive && (
                    <span style={{ fontSize: '10px', color: '#F59E0B', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldAlert size={12} /> Majuscule active
                    </span>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '12px', top: '13px', color: '#94A3B8' }}>
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={(e) => setCapsLockActive(e.getModifierState && e.getModifierState('CapsLock'))}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{ ...S.input, paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '12px',
                      background: 'none',
                      border: 'none',
                      color: '#94A3B8',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: darkMode ? '#94A3B8' : '#64748B' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>{isMg ? 'Tadidio aho' : 'Mémoriser ma session'}</span>
                </label>
                <span
                  onClick={() => { setUsername('admin'); setPassword('admin'); }}
                  style={{ color: '#059669', fontWeight: '700', cursor: 'pointer' }}
                >
                  Remplir Admin
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={S.btnPrimary}
              >
                {isLoading ? (
                  <span>Vérification...</span>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>{isMg ? 'Hiditra amin’ny rindranasa' : 'Se Connecter à l’Espace SRSP'}</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* SÉLECTION RAPIDE DES 7 POSTES EN 1 CLIC */}
          {activeMode === 'roles' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '380px', overflowY: 'auto' }}>
              <div style={{ fontSize: '12px', color: darkMode ? '#94A3B8' : '#64748B', marginBottom: '4px', fontWeight: '600' }}>
                {isMg ? 'Safidio ny andraikitra hidiranao :' : 'Choisissez la fonction administrative pour vous connecter en 1 clic :'}
              </div>

              {DEMO_USERS.map((u) => (
                <div
                  key={u.username}
                  onClick={() => handleRoleCardClick(u)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '14px',
                    backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                    border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = darkMode ? '#334155' : '#E2E8F0'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: darkMode ? '#1E293B' : '#E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getRoleIcon(u.role)}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '800', color: darkMode ? '#FFFFFF' : '#0F172A' }}>
                        {u.role}
                      </div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600' }}>
                        Identifiant : <span style={{ fontFamily: 'monospace' }}>{u.username}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: darkMode ? '#1E293B' : '#E2E8F0',
                      color: darkMode ? '#94A3B8' : '#475569'
                    }}>
                      {u.password}
                    </span>
                    <ChevronRight size={16} color="#94A3B8" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px'
          }}>
            <span style={{ color: darkMode ? '#94A3B8' : '#64748B' }}>
              {isMg ? 'Mpampiasa na mpandray fisotroan-dronono ?' : 'Usager ou titulaire de pension ?'}
            </span>
            <button
              type="button"
              onClick={onOpenPublicTrack}
              style={{
                background: 'none',
                border: 'none',
                color: '#059669',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{isMg ? 'Hijery dosie' : 'Suivre votre dossier'}</span>
              <ExternalLink size={14} />
            </button>
          </div>

        </div>

      </main>

      <footer style={{
        padding: '16px 24px',
        borderTop: `1px solid ${darkMode ? '#1E293B' : '#E2E8F0'}`,
        textAlign: 'center',
        fontSize: '11px',
        color: darkMode ? '#94A3B8' : '#64748B'
      }}>
        Ministère de l'Économie et des Finances · Direction Générale du Budget et des Finances · SRSP Ambositra Amoron'i Mania
      </footer>

    </div>
  );
}