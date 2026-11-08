// =====================================================================
// ARCHITECTURE MVC — CONTRÔLEUR : INTERFACE UTILISATEUR (useUIController.js)
// Responsabilité : États d'affichage, thème, langue, toasts, sons & navigation
// =====================================================================

import { useState, useCallback } from 'react';
import { playAcousticSignal, unlockAudio } from '../services/soundService';

export function useUIController() {
  const [tab, setTab] = useState('dashboard');
  const [lang, setLang] = useState('fr'); // 'fr' | 'mg'
  const [darkMode, setDarkMode] = useState(false);
  const [sound, setSound] = useState(true);
  
  // États de sélection et modales
  const [selectedDossierDetail, setSelectedDossierDetail] = useState(null);
  const [detailInitialTab, setDetailInitialTab] = useState('historique');
  const [archiveModalTarget, setArchiveModalTarget] = useState(null);
  const [activeArchiveSlip, setActiveArchiveSlip] = useState(null);
  const [activeArchiveDetail, setActiveArchiveDetail] = useState(null);
  const [previewMsg, setPreviewMsg] = useState(null);
  const [rejectModalTarget, setRejectModalTarget] = useState(null);

  // Thème adaptatif clair / sombre
  const theme = {
    bgApp: darkMode ? '#0B0F19' : '#F1F5F9',
    bgCard: darkMode ? '#111827' : '#FFFFFF',
    bgSidebar: darkMode ? '#0F172A' : '#1E293B',
    border: darkMode ? '#1F2937' : '#E2E8F0',
    textPrimary: darkMode ? '#F9FAFB' : '#0F172A',
    textSecondary: darkMode ? '#9CA3AF' : '#64748B',
    itemHover: darkMode ? '#1F2937' : '#F8FAFC',
    inputBg: darkMode ? '#1F2937' : '#FFFFFF',
    inputBorder: darkMode ? '#374151' : '#CBD5E1'
  };

  // Déclenchement d'un signal acoustique si le son est activé
  const playSound = useCallback((type = 'notification') => {
    if (!sound) return;
    playAcousticSignal(type);
  }, [sound]);

  // Bascule du son avec retour acoustique immédiat
  const toggleSound = useCallback(() => {
    setSound(prev => {
      const next = !prev;
      if (next) {
        unlockAudio();
        setTimeout(() => playAcousticSignal('notification'), 30);
      }
      return next;
    });
  }, []);

  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('info');
  const [toastDetails, setToastDetails] = useState(null);

  // Affichage d'un toast enrichi (validation, rejet, attente, transmission, notification)
  const showToast = useCallback((msg, defaultType = 'info') => {
    let toastObj = {
      id: Date.now(),
      message: '',
      type: defaultType // 'validation' | 'rejet' | 'attente' | 'transmission' | 'info'
    };

    if (typeof msg === 'object' && msg !== null) {
      toastObj.message = msg.message || JSON.stringify(msg);
      toastObj.type = msg.type || defaultType;
    } else {
      toastObj.message = String(msg || '');
      // Détection automatique du type de toast à partir des mots-clés
      const lower = toastObj.message.toLowerCase();
      if (lower.includes('valid') || lower.includes('succès') || lower.includes('ordonnanc')) {
        toastObj.type = 'validation';
      } else if (lower.includes('rejet') || lower.includes('erreur') || lower.includes('incomplet') || lower.includes('refus')) {
        toastObj.type = 'rejet';
      } else if (lower.includes('attente') || lower.includes('suspendu') || lower.includes('en cours')) {
        toastObj.type = 'attente';
      } else if (lower.includes('transmis') || lower.includes('étape') || lower.includes('avancement')) {
        toastObj.type = 'transmission';
      }
    }

    // Déclenchement automatique du bon signal acoustique
    if (toastObj.type === 'validation') {
      playSound('success');
    } else if (toastObj.type === 'rejet') {
      playSound('alert');
    } else {
      playSound('notification');
    }

    // IMPORTANT : toast est stocké sous forme de string textuel
    // pour éviter l'erreur React : "Objects are not valid as a React child"
    // si l'application rend directement <span>{ui.toast}</span>
    setToast(toastObj.message);
    setToastType(toastObj.type);
    setToastDetails(toastObj);

    setTimeout(() => {
      setToast(prev => (prev === toastObj.message ? null : prev));
      setToastDetails(null);
    }, 4500);
  }, [playSound]);

  // Ouverture de la vue détaillée avec choix de l'onglet
  const openDossierDetail = useCallback((dossier, initialTab = 'historique') => {
    setSelectedDossierDetail(dossier);
    setDetailInitialTab(initialTab);
  }, []);

  const closeDossierDetail = useCallback(() => {
    setSelectedDossierDetail(null);
  }, []);

  return {
    tab,
    setTab,
    lang,
    setLang,
    darkMode,
    setDarkMode,
    sound,
    setSound,
    toggleSound,
    playSound,
    toast,
    toastType,
    toastDetails,
    showToast,
    theme,
    selectedDossierDetail,
    detailInitialTab,
    openDossierDetail,
    closeDossierDetail,
    archiveModalTarget,
    setArchiveModalTarget,
    activeArchiveSlip,
    setActiveArchiveSlip,
    activeArchiveDetail,
    setActiveArchiveDetail,
    previewMsg,
    setPreviewMsg,
    rejectModalTarget,
    setRejectModalTarget
  };
}