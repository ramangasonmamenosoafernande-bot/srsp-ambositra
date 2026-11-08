// =====================================================================
// ARCHITECTURE MVC — MODÈLE : NOTIFICATION (notificationModel.js)
// Responsabilité : Modèles d'alertes SMS/Email & journal des notifications
// =====================================================================

export const INITIAL_NOTIFICATIONS = [
    {
      id: 1,
      to: "marie.andri@gmail.com",
      tel: "034 11 223 34",
      obj: "Validation Dossier DOS-1805-324176",
      text: "Votre dossier d'avancement a été validé et ordonnancé au paiement au Trésor Régional.",
      date: "24/09/2026 16:20",
      read: false
    },
    {
      id: 2,
      to: "jean.rabe@gmail.com",
      tel: "032 45 678 90",
      obj: "Transmission Liquidation DOS-1806-410982",
      text: "Votre dossier Retraite a été transmis au bureau de Vérification et de Liquidation des droits.",
      date: "25/09/2026 10:15",
      read: true
    }
  ];
  
  export const generateNotificationTemplate = (dossier, eventType) => {
    const dossierRef = dossier.numero || `DOS-${dossier.id}`;
    const nom = dossier.nom || 'Usager';
  
    if (eventType === 'creation') {
      return {
        obj: `Enregistrement Dossier ${dossierRef}`,
        emailText: `Bonjour ${nom},\n\nVotre dossier ${dossier.cat} a bien été enregistré au guichet SRSP Ambositra sous le numéro ${dossierRef}.\nVous pouvez suivre son avancée en ligne avec votre matricule ${dossier.im}.`,
        smsText: `SRSP AMBOSITRA: Votre dossier ${dossierRef} a bien été enregistré au guichet. Suivi en ligne possible.`
      };
    }
    if (eventType === 'validation') {
      return {
        obj: `Validation & Ordonnancement Dossier ${dossierRef}`,
        emailText: `Bonjour ${nom},\n\nExcellente nouvelle ! Votre dossier administratif (${dossierRef}) a été validé par la Direction Régionale et mandaté au paiement.`,
        smsText: `SRSP AMBOSITRA: Votre dossier ${dossierRef} a été VALIDÉ et mandaté au Trésor pour paiement.`
      };
    }
    if (eventType === 'rejet') {
      return {
        obj: `Avis de Rejet / Complément Dossier ${dossierRef}`,
        emailText: `Bonjour ${nom},\n\nVotre dossier ${dossierRef} a fait l'objet d'un rejet administratif : ${dossier.motif || 'Pièces manquantes'}.\nMerci de vous présenter au guichet SRSP pour régularisation.`,
        smsText: `SRSP AMBOSITRA: Dossier ${dossierRef} REJETÉ : ${dossier.motif || 'Pièces manquantes'}. Contactez la SRSP.`
      };
    }
  
    return {
      obj: `Mise à jour Dossier ${dossierRef}`,
      emailText: `Bonjour ${nom},\n\nVotre dossier ${dossierRef} a changé d'étape : ${dossier.stage} (Statut: ${dossier.etat}).`,
      smsText: `SRSP AMBOSITRA: Dossier ${dossierRef} mis à jour : étape ${dossier.stage}.`
    };
  };