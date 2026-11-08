// =====================================================================
// ARCHITECTURE MVC — CONTRÔLEUR : DOSSIERS (useDossierController.js)
// =====================================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  INITIAL_DOSSIERS, 
  STAGES, 
  createAuditLogEntry, 
  calculateDossierStats 
} from '../models/dossierModel';

const STORAGE_KEY = 'srsp_data_v11';

export function useDossierController(currentUser, onNotify) {
  const [dossiers, setDossiers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Erreur lecture dossiers localStorage", e);
    }
    return INITIAL_DOSSIERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dossiers));
    } catch (e) {
      console.warn("Erreur sauvegarde dossiers", e);
    }
  }, [dossiers]);

  const stats = useMemo(() => calculateDossierStats(dossiers), [dossiers]);

  // 1. Enregistrement d'un dossier
  const createDossier = useCallback((formData, user = currentUser) => {
    const nextId = dossiers.reduce((max, d) => Math.max(max, d.id || 0), 0) + 1;
    const dateNow = new Date();
    const dateFormatted = `${String(dateNow.getDate()).padStart(2, '0')}/${String(dateNow.getMonth() + 1).padStart(2, '0')}/${dateNow.getFullYear()}`;
    const dossierNum = `DOS-${String(dateNow.getFullYear()).slice(-2)}${String(dateNow.getMonth() + 1).padStart(2, '0')}-${String(formData.im).padStart(6, '0')}`;

    const newAuditLog = createAuditLogEntry({
      action: "Enregistrement & Dépôt Initial au Guichet",
      type: "depot",
      ancienStatut: "Non enregistré",
      nouveauStatut: "En attente",
      etape: "Accueil",
      utilisateur: user,
      motif: `Dépôt physique sous bordereau n° ${formData.be || 'BE-01'}. Récépissé remis à l'usager.`
    });

    const newDossier = {
      id: nextId,
      date: dateFormatted,
      numero: dossierNum,
      im: String(formData.im).trim(),
      nom: String(formData.nom).trim().toUpperCase(),
      min: formData.min,
      filiere: formData.filiere,
      cat: formData.cat,
      be: formData.be || '001/BE',
      stage: "Accueil",
      etat: "En attente",
      email: formData.email || '',
      tel: formData.tel || '',
      historique: [newAuditLog]
    };

    setDossiers(prev => [newDossier, ...prev]);
    if (onNotify) onNotify({ message: `Dossier ${dossierNum} enregistré au guichet` });
    return newDossier;
  }, [dossiers, currentUser, onNotify]);

  // 2. Avancement d'étape dans le circuit
  const advanceDossierStep = useCallback((id, user = currentUser, customMotif = '') => {
    setDossiers(prev => prev.map(d => {
      if (d.id !== id) return d;
      const currentIdx = STAGES.indexOf(d.stage);
      if (currentIdx >= STAGES.length - 1) return d;

      const nextStage = STAGES[currentIdx + 1];
      const isFinal = nextStage === "Paiement";
      const newStatus = isFinal ? "Validé" : "En cours";

      const newAuditLog = createAuditLogEntry({
        action: isFinal ? "Validation Administrative & Ordonnancement" : `Transmission vers [${nextStage}]`,
        type: isFinal ? "validation" : "transmission",
        ancienStatut: d.etat,
        nouveauStatut: newStatus,
        etape: nextStage,
        utilisateur: user,
        motif: customMotif || (isFinal ? "Dossier contrôlé et ordonnancé au paiement." : `Transmission à l'étape suivante : ${nextStage}.`)
      });

      return {
        ...d,
        stage: nextStage,
        etat: newStatus,
        historique: [newAuditLog, ...(d.historique || [])]
      };
    }));
  }, [currentUser]);

  // 3. Mise à jour de statut (Validé, Rejeté, En cours, En attente)
  const updateDossierStatus = useCallback((id, newStatus, user = currentUser, motif = '') => {
    setDossiers(prev => prev.map(d => {
      if (d.id !== id) return d;
      const isRejet = newStatus === 'Rejeté';
      const isValidation = newStatus === 'Validé';

      const newAuditLog = createAuditLogEntry({
        action: isRejet ? "Notification de Rejet Administratif" : isValidation ? "Validation Définitive & Ordonnancement" : `Mise à jour statut : ${newStatus}`,
        type: isRejet ? 'rejet' : isValidation ? 'validation' : 'statut',
        ancienStatut: d.etat,
        nouveauStatut: newStatus,
        etape: d.stage,
        utilisateur: user,
        motif: motif || (isRejet ? "Dossier incomplet ou pièce non certifiée conforme." : `Statut mis à jour à ${newStatus}.`)
      });

      return {
        ...d,
        etat: newStatus,
        motif: isRejet ? motif : (d.motif || ''),
        stage: isValidation ? "Paiement" : d.stage,
        historique: [newAuditLog, ...(d.historique || [])]
      };
    }));
  }, [currentUser]);

  // 4. Ajout d'une observation / annotation dans l'historique
  const addAuditObservation = useCallback((id, noteText, user = currentUser) => {
    if (!noteText || !noteText.trim()) return;
    setDossiers(prev => prev.map(d => {
      if (d.id !== id) return d;

      const newAuditLog = createAuditLogEntry({
        action: "Observation / Annotation d'Audit",
        type: "note",
        ancienStatut: d.etat,
        nouveauStatut: d.etat,
        etape: d.stage,
        utilisateur: user,
        motif: noteText.trim()
      });

      return {
        ...d,
        historique: [newAuditLog, ...(d.historique || [])]
      };
    }));
  }, [currentUser]);

  // 5. Retrait lors de l'archivage
  const removeDossier = useCallback((id) => {
    setDossiers(prev => prev.filter(d => d.id !== id));
  }, []);

  const resetDossiers = useCallback(() => {
    setDossiers(INITIAL_DOSSIERS);
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }, []);

  return {
    dossiers,
    stats,
    createDossier,
    advanceDossierStep,
    updateDossierStatus,
    addAuditObservation,
    removeDossier,
    resetDossiers
  };
}