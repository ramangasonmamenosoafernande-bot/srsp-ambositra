// =====================================================================
// ARCHITECTURE MVC — VUE : BARRE LATÉRALE (Sidebar.jsx)
// =====================================================================

import React from 'react';
import { 
  BarChart3, FilePlus, Layers, Coins, Users, Stamp, 
  GitBranch, Search, Archive, Bell, Settings, LogOut
} from 'lucide-react';
import { canUserAccessTab } from '../../models/userModel';

export default function Sidebar({
  currentUser,
  activeTab = 'dashboard',
  onSelectTab,
  onLogout,
  stats = {},
  archivesCount = 0,
  notificationsCount = 0,
  lang = 'fr',
  theme = {},
  darkMode = false
}) {
  const navItems = [
    { id: 'dashboard', label: lang === 'mg' ? 'Fandraisana' : 'Tableau de bord', icon: BarChart3, badge: null },
    { id: 'nouveauDossier', label: lang === 'mg' ? 'Taratasy Vaovao' : 'Nouveau Dossier', icon: FilePlus, badge: null },
    { section: 'DOSSIERS' },
    { id: 'tousDossiers', label: lang === 'mg' ? 'Taratasy Rehetra' : 'Tous les dossiers', icon: Layers, badge: stats.total },
    { id: 'solde', label: lang === 'mg' ? 'Division Karama (Solde)' : 'Division de la solde', icon: Coins, badge: stats.solde, color: '#F59E0B' },
    { id: 'visa', label: lang === 'mg' ? 'Division Fanamarinana (Visa)' : 'Division de visas', icon: Stamp, badge: stats.visa, color: '#10B981' },
    { id: 'pension', label: lang === 'mg' ? 'Division Misotro Ronono' : 'Division de pensions', icon: Users, badge: stats.pension, color: '#3B82F6' },
    { section: 'CIRCUIT ET TRANSPARENCE' },
    { id: 'circuit', label: lang === 'mg' ? 'Fizotran-draharaha' : 'Circuit du Dossier', icon: GitBranch, badge: null },
    { id: 'suivi', label: lang === 'mg' ? 'Fanaraha-maso' : 'Suivi des utilisateurs publics', icon: Search, badge: null },
    { section: 'OUTILS ET ARCHIVES' },
    { id: 'archives', label: lang === 'mg' ? 'Tahirin-taratasy' : 'Archives régionales', icon: Archive, badge: archivesCount, color: '#8B5CF6' },
    { id: 'alertes', label: lang === 'mg' ? 'Fampandrenesana' : 'Alertes SMS/Mail', icon: Bell, badge: notificationsCount },
    { id: 'parametres', label: lang === 'mg' ? 'Fikirakirana' : 'Paramètres', icon: Settings, badge: null }
  ];

  // Sivanina araka ny rôle connecté (Chef Solde, Visa, Pension, Archive, Coordo)
  const filteredNavItems = React.useMemo(() => {
    const accessible = navItems.filter(item => {
      if (item.section) return true;
      if (!currentUser) return true;
      return canUserAccessTab(currentUser, item.id);
    });

    return accessible.filter((item, idx, arr) => {
      if (!item.section) return true;
      const nextItem = arr[idx + 1];
      return nextItem && !nextItem.section;
    });
  }, [navItems, currentUser]);

  return (
    <aside style={{
      width: '240px',
      background: theme.bgSidebar,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px',
      gap: '4px',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, overflowY: 'auto' }}>
        {filteredNavItems.map((item, idx) => {
          if (item.section) {
            return (
              <div 
                key={`sec-${idx}`} 
                style={{ 
                  fontSize: '10px', 
                  fontWeight: 'bold', 
                  color: '#64748B', 
                  letterSpacing: '0.5px', 
                  padding: '14px 10px 4px 10px' 
                }}
              >
                {item.section}
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#2563EB' : 'transparent',
                color: isActive ? '#FFFFFF' : theme.textPrimary,
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: isActive ? '700' : '500',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = theme.itemHover;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} color={isActive ? '#FFFFFF' : (item.color || theme.textSecondary)} />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(255,255,255,0.25)' : (darkMode ? '#334155' : '#E2E8F0'),
                  color: isActive ? '#FFFFFF' : theme.textPrimary
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '8px',
          border: 'none',
          background: 'transparent',
          color: '#EF4444',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600',
          marginTop: 'auto'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#EF444415'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <LogOut size={16} />
        <span>{lang === 'mg' ? 'Hivoaka' : 'Déconnexion'}</span>
      </button>
    </aside>
  );
}