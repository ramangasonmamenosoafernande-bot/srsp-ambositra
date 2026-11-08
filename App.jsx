// =====================================================================
// ARCHITECTURE MVC — APPLICATION PRINCIPALE (App.jsx)
// Service Régional des Soldes et Pensions (SRSP) Ambositra
// =====================================================================

import React, { useState, Component } from 'react';
import { CheckCircle2, Archive, X, Printer, Mail, AlertTriangle, RefreshCw } from 'lucide-react';

// Modèles
import { INITIAL_NOTIFICATIONS } from './models/notificationModel';
import { generateArchiveCote } from './models/archiveModel';
import { DEMO_USERS, checkUserPermission } from './models/userModel';
import * as UserModelSafe from './models/userModel';

// Fiarovana ny fahazoan-dalana (RBAC Isolation)
const canUserAccessTab = UserModelSafe.canUserAccessTab || ((user, tabId) => {
  if (!user) return false;
  const role = user.role;
  if (role === 'Administrateur' || role === 'Chef Coordo') return true;
  if (role === 'Chef de Service Solde') {
    return ['dashboard', 'analyticsD3', 'solde', 'circuit', 'alertes', 'parametres'].includes(tabId);
  }
  if (role === 'Chef de Service Visa') {
    return ['dashboard', 'analyticsD3', 'visa', 'circuit', 'alertes', 'parametres'].includes(tabId);
  }
  if (role === 'Chef de Service Pension') {
    return ['dashboard', 'analyticsD3', 'pension', 'circuit', 'alertes', 'parametres'].includes(tabId);
  }
  if (role === 'Responsable des Archives') {
    return ['dashboard', 'archives', 'alertes', 'parametres'].includes(tabId);
  }
  if (role?.includes('Accueil') || role?.includes('Guichet')) {
    return ['dashboard', 'nouveauDossier', 'tousDossiers', 'suivi', 'alertes', 'parametres'].includes(tabId);
  }
  return true;
});

const canUserViewDossier = UserModelSafe.canUserViewDossier || ((user, dossier) => {
  if (!user || !dossier) return false;
  const role = user.role;
  if (role === 'Administrateur' || role === 'Chef Coordo' || role?.includes('Accueil') || role?.includes('Guichet')) {
    return true;
  }
  if (role === 'Chef de Service Solde') return dossier.filiere === 'Solde';
  if (role === 'Chef de Service Visa') return dossier.filiere === 'Visa';
  if (role === 'Chef de Service Pension') return dossier.filiere === 'Pension';
  if (role === 'Responsable des Archives') return dossier.etat === 'Validé' || dossier.etat === 'Archivé';
  return true;
});

// Contrôleurs
import { useAuthController } from './controllers/useAuthController';
import { useUIController } from './controllers/useUIController';
import { useDossierController } from './controllers/useDossierController';
import { useArchiveController } from './controllers/useArchiveController';

// Vues (TSY MISY PensionSimulatorView INTSONY)
import Header from './views/components/Header';
import Sidebar from './views/components/Sidebar';
import DashboardView from './views/DashboardView';
import DossiersListView from './views/DossiersListView';
import DossierDetailModal from './views/DossierDetailModal';
import NewDossierView from './views/NewDossierView';
import CircuitWorkflowView from './views/CircuitWorkflowView';
import PublicTrackView from './views/PublicTrackView';
import ArchivesView from './views/ArchivesView';
import AlertsView from './views/AlertsView';
import SettingsView from './views/SettingsView';
import LoginView from './views/LoginView';
import D3WorkflowDashboard from './views/components/D3WorkflowDashboard';

// =====================================================================
// 1. GARDE-FOU ANTI-PAGE BLANCHE (Error Boundary)
// =====================================================================
class SafeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Erreur détectée par le gestionnaire SRSP:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0F172A',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'sans-serif'
        }}>
          <div style={{ background: '#1E293B', border: '1px solid #EF4444', borderRadius: '16px', padding: '32px', maxWidth: '600px', width: '100%', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#EF4444" style={{ margin: '0 auto 16px auto' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#EF4444', marginBottom: '8px' }}>
              Une erreur d'affichage a été interceptée
            </h2>
            <div style={{ background: '#0F172A', padding: '12px', borderRadius: '8px', color: '#FCA5A5', fontSize: '12px', textAlign: 'left', fontFamily: 'monospace', marginBottom: '16px', wordBreak: 'break-word' }}>
              {this.state.error?.message || "Erreur de rendu"}
            </div>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                background: '#2563EB',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={14} />
              <span>Réinitialiser les données locales & Recharger</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// =====================================================================
// 2. MODALES INTÉGRÉES
// =====================================================================
function ArchiveModal({ targetDossier, archivesCount = 0, theme = {}, onClose, onConfirm }) {
  const [coteBoite, setCoteBoite] = useState(() => (generateArchiveCote ? generateArchiveCote(archivesCount) : `ARCH-2026/B-01`));
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
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textSecondary || '#64748B', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ background: theme.itemHover || '#F1F5F9', padding: '12px', borderRadius: '10px', fontSize: '12px', lineHeight: '1.6' }}>
          <div>N° Dossier : <strong style={{ color: '#2563EB' }}>{targetDossier.numero}</strong></div>
          <div>Bénéficiaire : <strong>{targetDossier.nom}</strong> (IM: {targetDossier.im})</div>
          <div>Filière : <strong>{targetDossier.filiere}</strong> — {targetDossier.cat}</div>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: theme.textSecondary || '#64748B', marginBottom: '4px' }}>Cote de Boîte d'Archive *</label>
            <input type="text" value={coteBoite} onChange={e => setCoteBoite(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: theme.inputBg || '#F8FAFC', border: `1px solid ${theme.inputBorder || '#CBD5E1'}`, color: theme.textPrimary || '#0F172A', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: theme.textSecondary || '#64748B', marginBottom: '4px' }}>Emplacement Physique *</label>
            <input type="text" value={emplacement} onChange={e => setEmplacement(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: theme.inputBg || '#F8FAFC', border: `1px solid ${theme.inputBorder || '#CBD5E1'}`, color: theme.textPrimary || '#0F172A', borderRadius: '6px', fontSize: '12px' }} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: theme.textSecondary || '#64748B', marginBottom: '4px' }}>Motif de Clôture *</label>
            <textarea rows={2} value={motif} onChange={e => setMotif(e.target.value)} style={{ width: '100%', padding: '8px 10px', background: theme.inputBg || '#F8FAFC', border: `1px solid ${theme.inputBorder || '#CBD5E1'}`, color: theme.textPrimary || '#0F172A', borderRadius: '6px', fontSize: '12px' }} required />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{ background: theme.itemHover || '#F1F5F9', color: theme.textPrimary || '#0F172A', border: `1px solid ${theme.border || '#E2E8F0'}`, padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Annuler</button>
            <button type="submit" style={{ background: '#8B5CF6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Archive size={14} /><span>Confirmer</span></button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ArchiveSlipModal({ slip, theme = {}, onClose }) {
  if (!slip) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ background: theme.bgCard || '#FFFFFF', padding: '24px', borderRadius: '14px', maxWidth: '580px', width: '100%', border: `1px solid ${theme.border || '#E2E8F0'}`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${theme.border || '#E2E8F0'}`, paddingBottom: '10px' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 'bold' }}>REPOBLIKAN'I MADAGASIKARA</div>
            <strong style={{ fontSize: '14px', color: '#2563EB', display: 'block', marginTop: '4px' }}>BORDEREAU OFFICIEL DE VERSEMENT AUX ARCHIVES</strong>
            <div style={{ fontSize: '10px', color: theme.textSecondary || '#64748B' }}>DIRECTION RÉGIONALE DU BUDGET • SRSP AMBOSITRA</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textSecondary || '#64748B', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        <div style={{ fontSize: '12px', lineHeight: '1.6', background: theme.itemHover || '#F1F5F9', padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border || '#E2E8F0'}` }}>
          <div>Réf Bordereau : <strong>BV-{slip.id}</strong></div>
          <div>Date de Versement : <strong>{slip.dateArchivage}</strong></div>
          <div>Cote Boîte : <strong style={{ color: '#8B5CF6' }}>{slip.coteBoite}</strong></div>
          <div>Localisation : <strong>{slip.emplacement}</strong></div>
        </div>
        <div style={{ fontSize: '11px', lineHeight: '1.6', padding: '10px', background: theme.bgCard || '#FFFFFF', borderRadius: '8px', border: `1px solid ${theme.border || '#E2E8F0'}` }}>
          <div><strong>Dossier N° :</strong> {slip.numero} (Matricule : {slip.im})</div>
          <div><strong>Nom :</strong> {slip.nom}</div>
          <div><strong>Nature :</strong> {slip.cat} ({slip.filiere})</div>
          <div><strong>Décision Finale :</strong> {slip.statutCloture}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button onClick={() => window.print()} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '9px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><Printer size={14} /> Imprimer</button>
          <button onClick={onClose} style={{ background: theme.itemHover || '#F1F5F9', color: theme.textPrimary || '#0F172A', border: `1px solid ${theme.border || '#E2E8F0'}`, padding: '9px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

function AlertPreviewModal({ previewMsg, theme = {}, darkMode = false, onClose }) {
  const [channel, setChannel] = useState('email');
  if (!previewMsg) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ background: theme.bgCard || '#FFFFFF', padding: '20px', borderRadius: '14px', maxWidth: '480px', width: '100%', border: `1px solid ${theme.border || '#E2E8F0'}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border || '#E2E8F0'}`, paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setChannel('email')} style={{ background: channel === 'email' ? '#2563EB' : (theme.itemHover || '#F1F5F9'), color: channel === 'email' ? 'white' : (theme.textPrimary || '#0F172A'), border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>E-mail</button>
            <button onClick={() => setChannel('sms')} style={{ background: channel === 'sms' ? '#10B981' : (theme.itemHover || '#F1F5F9'), color: channel === 'sms' ? 'white' : (theme.textPrimary || '#0F172A'), border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>SMS Mobile</button>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textSecondary || '#64748B', cursor: 'pointer' }}><X size={16} /></button>
        </div>
        {channel === 'email' ? (
          <div style={{ background: darkMode ? '#0F172A' : '#F8FAFC', padding: '14px', borderRadius: '8px', border: `1px solid ${theme.border || '#E2E8F0'}`, fontSize: '12px', lineHeight: '1.6' }}>
            <div><strong>À :</strong> {previewMsg.to}</div>
            <div><strong>Objet :</strong> {previewMsg.obj}</div>
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: `1px solid ${theme.border || '#E2E8F0'}` }}>{previewMsg.text}</div>
          </div>
        ) : (
          <div style={{ background: darkMode ? '#0F172A' : '#1E293B', padding: '16px', borderRadius: '10px', color: 'white', border: '2px solid #334155' }}>
            <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '8px' }}>SMS • SRSP-ALERTE ({previewMsg.tel || '034 12 345 67'})</div>
            <div style={{ background: '#10B981', padding: '10px 12px', borderRadius: '10px 10px 2px 10px', fontSize: '12px' }}>{previewMsg.text}</div>
          </div>
        )}
        <button onClick={onClose} style={{ background: '#2563EB', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Fermer</button>
      </div>
    </div>
  );
}

// =====================================================================
// 3. APPLICATION SRSP
// =====================================================================
function AppContent() {
  const auth = useAuthController();
  const ui = useUIController();

  const usersList = Array.isArray(DEMO_USERS) ? DEMO_USERS : Object.values(DEMO_USERS || {});

  // ÉTAT DE SESSION
  const [sessionUser, setSessionUser] = useState(() => {
    try {
      if (auth?.currentUser) return auth.currentUser;
      const saved = localStorage.getItem('srsp_authenticated_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        const valid = usersList.find(u => u && u.username === parsed.username);
        if (valid) return valid;
      }
    } catch (e) {
      console.warn("Erreur lecture session:", e);
    }
    return usersList[0] || { username: 'admin', role: 'Administrateur', name: 'Administrateur SRSP' };
  });
  
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS || []);

  const activeUser = sessionUser;

  const dossiersCtrl = useDossierController(activeUser, ({ message }) => {
    if (ui?.showToast) ui.showToast(message);
  });

  const archivesCtrl = useArchiveController();

  // Thème garanti
  const theme = ui?.theme || {
    bgApp: ui?.darkMode ? '#0B1120' : '#F8FAFC',
    bgSidebar: ui?.darkMode ? '#0F172A' : '#1E293B',
    bgCard: ui?.darkMode ? '#1E293B' : '#FFFFFF',
    textPrimary: ui?.darkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: ui?.darkMode ? '#94A3B8' : '#64748B',
    border: ui?.darkMode ? '#334155' : '#E2E8F0',
    itemHover: ui?.darkMode ? '#334155' : '#F1F5F9',
    inputBg: ui?.darkMode ? '#0F172A' : '#FFFFFF',
    inputBorder: ui?.darkMode ? '#475569' : '#CBD5E1'
  };

  // Données et statistiques sécurisées filtrées selon le rôle
  const allDossiers = dossiersCtrl?.dossiers || [];
  const dossiers = allDossiers.filter(d => canUserViewDossier(sessionUser, d));

  const stats = dossiersCtrl?.stats || {
    total: dossiers.length,
    attente: dossiers.filter(d => d.etat === 'En attente').length,
    cours: dossiers.filter(d => d.etat === 'En cours').length,
    valide: dossiers.filter(d => d.etat === 'Validé').length,
    rejete: dossiers.filter(d => d.etat === 'Rejeté').length,
    solde: dossiers.filter(d => d.filiere === 'Solde').length,
    pension: dossiers.filter(d => d.filiere === 'Pension').length,
    visa: dossiers.filter(d => d.filiere === 'Visa').length
  };
  const archives = archivesCtrl?.archives || [];

  const handleConfirmArchive = (targetDossier, archiveInfo) => {
    if (!archivesCtrl?.archiveDossier) return;
    const archiveRecord = archivesCtrl.archiveDossier(targetDossier, archiveInfo);
    if (dossiersCtrl?.removeDossier) dossiersCtrl.removeDossier(targetDossier.id);
    if (ui?.setArchiveModalTarget) ui.setArchiveModalTarget(null);
    if (ui?.showToast) ui.showToast(`Dossier ${targetDossier.numero} versé aux archives régionales`);
    if (ui?.setActiveArchiveSlip) ui.setActiveArchiveSlip(archiveRecord);
  };

  const handleResetAll = () => {
    if (dossiersCtrl?.resetDossiers) dossiersCtrl.resetDossiers();
    if (archivesCtrl?.resetArchives) archivesCtrl.resetArchives();
    setNotifications(INITIAL_NOTIFICATIONS || []);
    if (ui?.showToast) ui.showToast(ui?.lang === 'mg' ? "Voaverina ny rafitra rehetra" : "Données réinitialisées");
  };

  const currentSelectedDossier = ui?.selectedDossierDetail 
    ? dossiers.find(d => d.id === ui.selectedDossierDetail.id) || ui.selectedDossierDetail
    : null;

  const currentTab = ui?.tab || 'dashboard';

  // Redirection automatique si l'utilisateur tente d'accéder à un onglet interdit (ex: Solde accédant aux archives)
  if (sessionUser && !canUserAccessTab(sessionUser, currentTab)) {
    setTimeout(() => {
      if (ui?.setTab) ui.setTab('dashboard');
      if (ui?.showToast) {
        ui.showToast({
          message: ui?.lang === 'mg' 
            ? "Tsy mahazo miditra amin'io fizarana io ianao amin'ny andraikitrao." 
            : "Accès restreint : Votre poste n'est pas habilité pour cette section.",
          type: 'rejet'
        });
      }
    }, 0);
  }

  // Si déconnexion explicite via bouton -> Affichage de la page de connexion
  if (!sessionUser) {
    if (ui?.tab === 'publicTrack') {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: theme.bgApp,
          color: theme.textPrimary,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}>
          <div style={{ padding: '16px 24px', background: theme.bgCard, borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>SRSP Ambositra • Portail Suivi Usager</div>
            <button
              onClick={() => ui?.setTab && ui.setTab('dashboard')}
              style={{ background: '#2563EB', color: 'white', border: 'none', padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Retour à la page de connexion
            </button>
          </div>
          <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
            <PublicTrackView
              dossiers={dossiers}
              lang={ui?.lang || 'fr'}
              theme={theme}
              darkMode={Boolean(ui?.darkMode)}
            />
          </div>
        </div>
      );
    }

    return (
      <LoginView
        onLogin={(u, p) => {
          const cleanU = (u || '').trim().toLowerCase();
          const cleanP = (p || '').trim().toLowerCase();
          
          let target = usersList.find(user => user && user.username && user.username.toLowerCase() === cleanU);
          if (!target) {
            target = usersList.find(user => user && user.name && user.name.toLowerCase().includes(cleanU));
          }
          if (!target && (cleanU === 'admin' || cleanU === '')) {
            target = usersList[0];
          }

          if (target) {
            setSessionUser(target);
            if (auth?.switchUser) auth.switchUser(target.username);
            if (ui?.showToast) ui.showToast(`Bienvenue, ${target.name}`);
            return { success: true, user: target };
          }
          return { success: false, error: "Identifiant incorrect. Cliquez sur un des profils de démonstration ci-dessous." };
        }}
        onDirectLogin={(user) => {
          setSessionUser(user);
          if (auth?.switchUser) auth.switchUser(user.username);
          if (ui?.showToast) ui.showToast(`Connecté : ${user.name}`);
        }}
        onOpenPublicTrack={() => ui?.setTab && ui.setTab('publicTrack')}
        lang={ui?.lang || 'fr'}
        onToggleLang={() => ui?.setLang && ui.setLang(ui.lang === 'fr' ? 'mg' : 'fr')}
        darkMode={Boolean(ui?.darkMode)}
        onToggleDarkMode={() => ui?.setDarkMode && ui.setDarkMode(!ui.darkMode)}
        theme={theme}
      />
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: theme.bgApp,
      color: theme.textPrimary,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      
      {/* 1. EN-TÊTE SUPÉRIEUR */}
      <Header
        currentUser={sessionUser}
        onSwitchUser={(uname) => {
          const f = usersList.find(u => u && u.username === uname);
          if (f) {
            setSessionUser(f);
            if (auth?.switchUser) auth.switchUser(uname);
            if (ui?.showToast) ui.showToast(`Rôle : ${f.role}`);
          }
        }}
        onLogout={() => {
          setSessionUser(null);
          if (auth?.logout) auth.logout();
          if (ui?.showToast) ui.showToast(ui?.lang === 'mg' ? "Tafavoaka soa aman-tsara ianao" : "Déconnexion réussie. Reconnectez-vous.");
        }}
        lang={ui?.lang || 'fr'}
        onToggleLang={() => ui?.setLang && ui.setLang(ui.lang === 'fr' ? 'mg' : 'fr')}
        darkMode={Boolean(ui?.darkMode)}
        onToggleDarkMode={() => ui?.setDarkMode && ui.setDarkMode(!ui.darkMode)}
        sound={Boolean(ui?.sound)}
        onToggleSound={() => {
          if (ui?.setSound) {
            ui.setSound(!ui.sound);
            if (ui.showToast) ui.showToast(ui.sound ? "Signaux sonores désactivés" : "Signaux sonores activés");
          }
        }}
        notificationsCount={notifications.length}
        notifications={notifications}
        onOpenPreview={ui?.setPreviewMsg}
        onNavigateToAlerts={() => ui?.setTab && ui.setTab('alertes')}
        theme={theme}
      />

      {/* 2. ZONE PRINCIPALE : SIDEBAR + VUE ACTIVE */}
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar
          currentUser={sessionUser}
          activeTab={currentTab}
          onSelectTab={ui?.setTab}
          onLogout={() => {
            setSessionUser(null);
            if (auth?.logout) auth.logout();
            if (ui?.showToast) ui.showToast(ui?.lang === 'mg' ? "Tafavoaka soa aman-tsara ianao" : "Déconnexion réussie. Reconnectez-vous.");
          }}
          stats={stats}
          archivesCount={archives.length}
          notificationsCount={notifications.length}
          lang={ui?.lang || 'fr'}
          theme={theme}
          darkMode={Boolean(ui?.darkMode)}
        />

        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', maxWidth: '1400px' }}>
          {currentTab === 'dashboard' && (
            <DashboardView
              dossiers={dossiers}
              stats={stats}
              lang={ui?.lang || 'fr'}
              theme={theme}
              darkMode={Boolean(ui?.darkMode)}
              onOpenDetail={ui?.openDossierDetail}
              onAdvanceStep={(id) => {
                if (dossiersCtrl?.advanceDossierStep) dossiersCtrl.advanceDossierStep(id, sessionUser);
                if (ui?.showToast) ui.showToast("Dossier transmis à l'étape suivante");
              }}
              onUpdateStatus={(id, st, motif) => {
                if (dossiersCtrl?.updateDossierStatus) dossiersCtrl.updateDossierStatus(id, st, sessionUser, motif);
                if (ui?.showToast) ui.showToast(`Statut mis à jour : ${st}`);
              }}
              onNavigateToTab={ui?.setTab}
            />
          )}

          {currentTab === 'analyticsD3' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <D3WorkflowDashboard
                dossiers={dossiers}
                lang={ui?.lang || 'fr'}
                theme={theme}
                darkMode={Boolean(ui?.darkMode)}
              />
            </div>
          )}

          {currentTab === 'nouveauDossier' && (
            <NewDossierView
              currentUser={sessionUser}
              lang={ui?.lang || 'fr'}
              theme={theme}
              darkMode={Boolean(ui?.darkMode)}
              onCreateDossier={(data) => {
                if (!checkUserPermission(sessionUser, 'create_dossier')) {
                  if (ui?.showToast) ui.showToast({
                    message: "Habilitation requise : Votre rôle n'a pas la permission d'enregistrer de nouveaux dossiers.",
                    type: 'rejet'
                  });
                  return null;
                }
                if (!dossiersCtrl?.createDossier) return null;
                const newD = dossiersCtrl.createDossier(data, sessionUser);
                
                // NOTIFICATION AUTOMATIQUE DÈS QU'UN DOSSIER EST DÉPOSÉ
                const now = new Date();
                const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                
                const newNotif = {
                  id: Date.now(),
                  to: newD.email || `${String(newD.im).toLowerCase()}@education.mg`,
                  tel: newD.tel || '034 12 345 67',
                  obj: `Dépôt Acte ${newD.numero} — ${newD.filiere}`,
                  text: `Bonjour ${newD.nom}, votre dossier (${newD.filiere} - ${newD.cat}) a été enregistré au guichet SRSP Ambositra sous le numéro ${newD.numero}. Récépissé remis. Suivi en ligne actif.`,
                  date: dateStr,
                  read: false
                };

                setNotifications(prev => [newNotif, ...prev]);
                if (ui?.playSound) {
                  ui.playSound('notification');
                }
                if (ui?.showToast) {
                  ui.showToast(`🔔 Dépôt effectué : Dossier ${newD.numero} (${newD.nom}) enregistré au guichet ! Notification automatique SMS & Email envoyée.`, 'notification');
                }
                return newD;
              }}
              onOpenDetail={ui?.openDossierDetail}
            />
          )}

          {(currentTab === 'tousDossiers' || currentTab === 'solde' || currentTab === 'pension' || currentTab === 'visa') && (
            <DossiersListView
              dossiers={dossiers}
              activeFiliere={currentTab === 'solde' ? 'Solde' : currentTab === 'pension' ? 'Pension' : currentTab === 'visa' ? 'Visa' : 'ALL'}
              lang={ui?.lang || 'fr'}
              theme={theme}
              darkMode={Boolean(ui?.darkMode)}
              onOpenDetail={ui?.openDossierDetail}
              onAdvanceStep={(id) => {
                if (!checkUserPermission(sessionUser, 'advance_step')) {
                  if (ui?.showToast) ui.showToast({
                    message: "Action non autorisée : Votre rôle ne dispose pas de la permission de transmission d'étape.",
                    type: 'rejet'
                  });
                  return;
                }
                const target = dossiers.find(d => d.id === id);
                if (dossiersCtrl?.advanceDossierStep) dossiersCtrl.advanceDossierStep(id, sessionUser);
                const nextInfo = target ? `Dossier ${target.numero} (${target.nom}) transmis à l'étape suivante` : "Dossier transmis à l'étape suivante";
                if (ui?.showToast) ui.showToast({
                  message: nextInfo,
                  type: 'transmission'
                });
              }}
              onUpdateStatus={(id, st, motif) => {
                if (st === 'Validé' && !checkUserPermission(sessionUser, 'validate_dossier')) {
                  if (ui?.showToast) ui.showToast({
                    message: "Visa refusé : Votre poste n'a pas l'habilitation pour valider définitivement ce dossier.",
                    type: 'rejet'
                  });
                  return;
                }
                if (st === 'Rejeté' && !checkUserPermission(sessionUser, 'reject_dossier')) {
                  if (ui?.showToast) ui.showToast({
                    message: "Action refusée : Votre rôle ne peut pas prononcer de rejet officiel.",
                    type: 'rejet'
                  });
                  return;
                }
                const target = dossiers.find(d => d.id === id);
                if (dossiersCtrl?.updateDossierStatus) dossiersCtrl.updateDossierStatus(id, st, sessionUser, motif);
                const num = target ? target.numero : `N°${id}`;
                let toastType = 'info';
                let message = `Dossier ${num} : Statut ${st}`;
                if (st === 'Validé') {
                  toastType = 'validation';
                  message = `✅ Dossier ${num} validé avec succès pour ordonnancement & paiement au Trésor !`;
                } else if (st === 'Rejeté') {
                  toastType = 'rejet';
                  message = `⛔ Dossier ${num} rejeté : ${motif || 'Non-conformité réglementaire'}`;
                } else if (st === 'En attente') {
                  toastType = 'attente';
                  message = `⏳ Dossier ${num} mis en attente de complément de pièces.`;
                }
                if (ui?.showToast) ui.showToast({ message, type: toastType });
              }}
              onChangeFiliere={(id, newFiliere) => {
                if (dossiersCtrl?.changeDossierFiliere) dossiersCtrl.changeDossierFiliere(id, newFiliere, sessionUser);
                if (ui?.showToast) ui.showToast({
                  message: `Dossier réorienté vers la filière ${newFiliere}`,
                  type: 'transmission'
                });
              }}
              onOpenArchiveModal={ui?.setArchiveModalTarget}
            />
          )}

          {currentTab === 'circuit' && (
            <CircuitWorkflowView
              dossiers={dossiers}
              lang={ui?.lang || 'fr'}
              theme={theme}
              darkMode={Boolean(ui?.darkMode)}
              onOpenDetail={ui?.openDossierDetail}
              onAdvanceStep={(id) => {
                if (!checkUserPermission(sessionUser, 'advance_step')) {
                  if (ui?.showToast) ui.showToast({
                    message: "Action non autorisée : Votre rôle ne dispose pas de la permission d'avancement.",
                    type: 'rejet'
                  });
                  return;
                }
                const target = dossiers.find(d => d.id === id);
                if (dossiersCtrl?.advanceDossierStep) dossiersCtrl.advanceDossierStep(id, sessionUser);
                const nextInfo = target ? `Dossier ${target.numero} (${target.nom}) avancé vers l'étape suivante` : "Dossier transmis à l'étape suivante";
                if (ui?.showToast) ui.showToast({
                  message: nextInfo,
                  type: 'transmission'
                });
              }}
              onUpdateStatus={(id, st, motif) => {
                if (st === 'Validé' && !checkUserPermission(sessionUser, 'validate_dossier')) {
                  if (ui?.showToast) ui.showToast({
                    message: "Visa refusé : Votre poste n'a pas l'habilitation pour valider définitivement ce dossier.",
                    type: 'rejet'
                  });
                  return;
                }
                if (st === 'Rejeté' && !checkUserPermission(sessionUser, 'reject_dossier')) {
                  if (ui?.showToast) ui.showToast({
                    message: "Action refusée : Votre rôle ne peut pas prononcer de rejet officiel.",
                    type: 'rejet'
                  });
                  return;
                }
                const target = dossiers.find(d => d.id === id);
                if (dossiersCtrl?.updateDossierStatus) dossiersCtrl.updateDossierStatus(id, st, sessionUser, motif);
                const num = target ? target.numero : `N°${id}`;
                let toastType = 'info';
                let message = `Dossier ${num} : Statut ${st}`;
                if (st === 'Validé') {
                  toastType = 'validation';
                  message = `✅ Dossier ${num} validé pour paiement Trésor !`;
                } else if (st === 'Rejeté') {
                  toastType = 'rejet';
                  message = `⛔ Dossier ${num} rejeté : ${motif || 'Motif administratif'}`;
                } else if (st === 'En attente') {
                  toastType = 'attente';
                  message = `⏳ Dossier ${num} mis en attente.`;
                }
                if (ui?.showToast) ui.showToast({ message, type: toastType });
              }}
            />
          )}

          {currentTab === 'suivi' && (
            <PublicTrackView
              dossiers={dossiers}
              lang={ui?.lang || 'fr'}
              theme={theme}
              darkMode={Boolean(ui?.darkMode)}
              onOpenDetail={ui?.openDossierDetail}
            />
          )}

          {currentTab === 'archives' && (
            <ArchivesView
              archives={archives}
              currentUser={sessionUser}
              lang={ui?.lang || 'fr'}
              theme={theme}
              darkMode={Boolean(ui?.darkMode)}
              onOpenArchiveSlip={ui?.setActiveArchiveSlip}
            />
          )}

          {currentTab === 'alertes' && (
            <AlertsView
              notifications={notifications}
              theme={theme}
              darkMode={Boolean(ui?.darkMode)}
              onOpenPreview={ui?.setPreviewMsg}
            />
          )}

          {currentTab === 'parametres' && (
            <SettingsView
              darkMode={Boolean(ui?.darkMode)}
              onToggleDarkMode={() => ui?.setDarkMode && ui.setDarkMode(!ui.darkMode)}
              sound={Boolean(ui?.sound)}
              onToggleSound={() => {
                if (ui?.toggleSound) {
                  ui.toggleSound();
                  if (ui?.showToast) ui.showToast(!ui.sound ? "Signaux sonores activés (carillon audible)" : "Signaux sonores désactivés");
                } else if (ui?.setSound) {
                  ui.setSound(!ui.sound);
                }
              }}
              onTestSound={() => {
                if (ui?.playSound) ui.playSound('notification');
              }}
              lang={ui?.lang || 'fr'}
              onToggleLang={() => ui?.setLang && ui.setLang(ui.lang === 'fr' ? 'mg' : 'fr')}
              onResetAll={handleResetAll}
              theme={theme}
            />
          )}
        </main>
      </div>

      {/* 3. MODALES ET VUES DE DÉTAIL (HISTORIQUE AUDIT TRAIL) */}
      {currentSelectedDossier && (
        <DossierDetailModal
          dossier={currentSelectedDossier}
          currentUser={sessionUser}
          initialTab={ui?.detailInitialTab || 'historique'}
          lang={ui?.lang || 'fr'}
          theme={theme}
          darkMode={Boolean(ui?.darkMode)}
          onClose={ui?.closeDossierDetail}
          onAddAuditNote={(id, note) => {
            if (dossiersCtrl?.addAuditObservation) dossiersCtrl.addAuditObservation(id, note, sessionUser);
            if (ui?.showToast) ui.showToast("Observation enregistrée dans l'audit trail");
          }}
          onUpdateStatus={(id, st, motif) => {
            if (dossiersCtrl?.updateDossierStatus) dossiersCtrl.updateDossierStatus(id, st, sessionUser, motif);
            if (ui?.showToast) ui.showToast(`Statut mis à jour : ${st}`);
          }}
          onAdvanceStep={(id) => {
            if (dossiersCtrl?.advanceDossierStep) dossiersCtrl.advanceDossierStep(id, sessionUser);
            if (ui?.showToast) ui.showToast("Dossier transmis à l'étape suivante");
          }}
        />
      )}

      {ui?.archiveModalTarget && (
        <ArchiveModal
          targetDossier={ui.archiveModalTarget}
          archivesCount={archives.length}
          theme={theme}
          onClose={() => ui?.setArchiveModalTarget && ui.setArchiveModalTarget(null)}
          onConfirm={handleConfirmArchive}
        />
      )}

      {ui?.activeArchiveSlip && (
        <ArchiveSlipModal
          slip={ui.activeArchiveSlip}
          theme={theme}
          onClose={() => ui?.setActiveArchiveSlip && ui.setActiveArchiveSlip(null)}
        />
      )}

      {ui?.previewMsg && (
        <AlertPreviewModal
          previewMsg={ui.previewMsg}
          theme={theme}
          darkMode={Boolean(ui?.darkMode)}
          onClose={() => ui?.setPreviewMsg && ui.setPreviewMsg(null)}
        />
      )}

      {/* TOAST DE NOTIFICATION */}
      {ui?.toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: ui.darkMode ? '#1E293B' : '#0F172A',
          color: 'white',
          padding: '12px 18px',
          borderRadius: '10px',
          border: '1px solid #3B82F6',
          zIndex: 9999,
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
        }}>
          <CheckCircle2 size={16} color="#10B981" />
          <span>{typeof ui.toast === 'object' ? (ui.toast.message || JSON.stringify(ui.toast)) : String(ui.toast)}</span>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <SafeErrorBoundary>
      <AppContent />
    </SafeErrorBoundary>
  );
}