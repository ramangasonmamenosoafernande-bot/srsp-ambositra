// =====================================================================
// ARCHITECTURE MVC — VUE : EN-TÊTE SUPÉRIEUR (Header.jsx)
// =====================================================================

import React, { useState, useRef, useEffect } from 'react';
import { User, Moon, Sun, Bell, Volume2, VolumeX, LogOut, Eye, Mail, ExternalLink, X } from 'lucide-react';
import { DEMO_USERS } from '../../models/userModel';

export default function Header({
  currentUser,
  onSwitchUser,
  onLogout,
  lang = 'fr',
  onToggleLang,
  darkMode = false,
  onToggleDarkMode,
  sound = true,
  onToggleSound,
  notificationsCount = 0,
  notifications = [],
  onOpenPreview,
  onNavigateToAlerts,
  theme = {}
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      background: theme.bgCard,
      borderBottom: `1px solid ${theme.border}`,
      padding: '12px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px'
    }}>
      {/* Titre & Localisation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#2563EB', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '15px' }}>
          SRSP
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: theme.textPrimary }}>
            Service Régional des Soldes et Pensions • Ambositra
          </div>
          <div style={{ fontSize: '11px', color: theme.textSecondary }}>
            Région Amoron'i Mania • Ministère de l'Économie et des Finances
          </div>
        </div>
      </div>

      {/* Contrôles utilisateur */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        
        {/* Sélecteur de rôle administratif */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: theme.itemHover, padding: '5px 12px', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
          <User size={14} color="#2563EB" />
          <select
            value={currentUser?.username}
            onChange={e => onSwitchUser(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.textPrimary,
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {DEMO_USERS.map(u => (
              <option key={u.username} value={u.username} style={{ background: theme.bgCard, color: theme.textPrimary }}>
                {u.role}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton Déconnexion */}
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              background: darkMode ? '#451A1A' : '#FEE2E2',
              color: '#EF4444',
              border: '1px solid #FCA5A5',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={14} color="#EF4444" />
            <span>Déconnexion</span>
          </button>
        )}

        {/* Bouton Cloche avec Aperçu Direct */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: showDropdown ? '#2563EB' : theme.itemHover,
              border: `1px solid ${showDropdown ? '#2563EB' : theme.border}`,
              color: showDropdown ? '#FFFFFF' : theme.textPrimary,
              padding: '6px 10px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative'
            }}
          >
            <Bell size={15} />
            {notificationsCount > 0 && (
              <span style={{
                background: showDropdown ? '#FFFFFF' : '#EF4444',
                color: showDropdown ? '#2563EB' : 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '1px 5px',
                borderRadius: '10px'
              }}>
                {notificationsCount}
              </span>
            )}
          </button>

          {/* Menu déroulant instantané */}
          {showDropdown && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '380px',
              maxWidth: '90vw',
              backgroundColor: theme.bgCard || '#FFFFFF',
              border: `1px solid ${theme.border || '#CBD5E1'}`,
              borderRadius: '14px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
              zIndex: 999999,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: `1px solid ${theme.border || '#E2E8F0'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: darkMode ? '#0F172A' : '#F8FAFC'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Bell size={14} color="#2563EB" />
                  <strong style={{ fontSize: '13px', color: theme.textPrimary || '#0F172A' }}>
                    Notifications & Alertes
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDropdown(false)}
                  style={{ background: 'none', border: 'none', color: theme.textSecondary || '#64748B', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {notifications.map(notif => (
                  <div
                    key={notif.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: `1px solid ${theme.border || '#E2E8F0'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '800', color: theme.textPrimary || '#0F172A' }}>
                        {notif.obj}
                      </span>
                      <span style={{ fontSize: '10px', color: theme.textSecondary || '#64748B', flexShrink: 0 }}>
                        {notif.date}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: theme.textSecondary || '#64748B', lineHeight: '1.4' }}>
                      {notif.text}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '10px', color: '#059669', fontWeight: '600' }}>
                        {notif.to}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenPreview) onOpenPreview(notif);
                          setShowDropdown(false);
                        }}
                        style={{
                          background: '#2563EB',
                          color: 'white',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={12} />
                        <span>Aperçu Direct</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '10px 16px',
                borderTop: `1px solid ${theme.border || '#E2E8F0'}`,
                backgroundColor: darkMode ? '#0F172A' : '#F8FAFC',
                textAlign: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowDropdown(false);
                    if (onNavigateToAlerts) onNavigateToAlerts();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Voir le journal complet des alertes</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}