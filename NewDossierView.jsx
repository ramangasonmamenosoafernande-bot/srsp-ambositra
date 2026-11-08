// =====================================================================
// ARCHITECTURE MVC — VUE : NOUVEAU DOSSIER (NewDossierView.jsx)
// Responsabilité : Guichet d'enregistrement des actes, validation de saisie,
// génération automatique du récépissé et de la première trace d'audit.
// =====================================================================

import React, { useState } from 'react';
import { 
  FilePlus, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { MINISTERES, CATEGORIES } from '../models/dossierModel';

const DEFAULT_MINISTERES = [
  "MINISTERE DE L'EDUCATION NATIONALE",
  "MINISTERE DE LA SANTE PUBLIQUE",
  "MINISTERE DE L'ECONOMIE ET DES FINANCES",
  "MINISTERE DE LA JUSTICE",
  "MINISTERE DE LA DEFENSE NATIONALE",
  "MINISTERE DE L'ENSEIGNEMENT SUPERIEUR",
  "MINISTERE DE L'INTERIEUR ET DE LA DECENTRALISATION",
  "MINISTERE DE L'AGRICULTURE ET DE L'ELEVAGE",
  "AUTRE MINISTERE OU INSTITUTION PUBLIQUE"
];

const DEFAULT_CATEGORIES = {
  Solde: [
    { value: "13 AVANCEMENT DE CLASSE OU ECHELON", label: "Avancement d'échelon / classe" },
    { value: "11 INTEGRATION ET 1ERE PRISE EN CHARGE", label: "Intégration & 1ère prise en charge" },
    { value: "15 RAPPEL DIFFERENTIEL DE SOLDE", label: "Rappel différentiel de solde" },
    { value: "12 INDEMNITE DE DIRECTION ET SUJETION", label: "Indemnités de fonction & sujétion" },
    { value: "14 VALIDATION DE SERVICES PRECAIRES", label: "Validation de services auxiliaires" }
  ],
  Pension: [
    { value: "01 PENSION D'ANCIENNETE (RETRAITE)", label: "Pension d'ancienneté (Retraite normale)" },
    { value: "03 REVERSION DE PENSION CIVILE", label: "Pension de réversion (Veuves & Orphelins)" },
    { value: "02 PENSION PROPORTIONNELLE", label: "Pension proportionnelle" },
    { value: "04 PENSION D'INVALIDITE", label: "Pension d'invalidité temporaire ou définitive" },
    { value: "05 CAPITAL DECES ET SECOURS", label: "Capital décès et secours immédiat" }
  ],
  Visa: [
    { value: "08 CONGE DE LONGUE DUREE (CLD)", label: "Visa Congé de longue durée (CLD)" },
    { value: "09 DETACHEMENT OU DISPONIBILITE", label: "Visa Détachement / Disponibilité" },
    { value: "10 VISA D'ENGAGEMENT COMPTABLE", label: "Visa préalable d'engagement comptable" },
    { value: "07 AFFECTATION ET MUTATION REGIONALE", label: "Visa Affectation et mutation" }
  ]
};

export default function NewDossierView({
  currentUser,
  lang = 'fr',
  theme = {},
  darkMode = false,
  onCreateDossier,
  onOpenDetail
}) {
  const ministeresList = (MINISTERES && Array.isArray(MINISTERES) && MINISTERES.length > 0) ? MINISTERES : DEFAULT_MINISTERES;
  const categoriesMap = (CATEGORIES && CATEGORIES.Solde) ? CATEGORIES : DEFAULT_CATEGORIES;

  const [filiere, setFiliere] = useState('Solde');
  const [im, setIm] = useState('');
  const [nom, setNom] = useState('');
  const [min, setMin] = useState(ministeresList[0]);
  const [cat, setCat] = useState((categoriesMap.Solde && categoriesMap.Solde[0]?.value) || "13 AVANCEMENT DE CLASSE OU ECHELON");
  const [be, setBe] = useState('085/MEN');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);

  const bgCard = theme?.bgCard || (darkMode ? '#1E293B' : '#FFFFFF');
  const border = theme?.border || (darkMode ? '#334155' : '#E2E8F0');
  const textPrimary = theme?.textPrimary || (darkMode ? '#F8FAFC' : '#0F172A');
  const textSecondary = theme?.textSecondary || (darkMode ? '#94A3B8' : '#64748B');
  const inputBg = theme?.inputBg || (darkMode ? '#0F172A' : '#F8FAFC');
  const inputBorder = theme?.inputBorder || (darkMode ? '#475569' : '#CBD5E1');

  const handleFiliereChange = (newFil) => {
    setFiliere(newFil);
    const available = categoriesMap[newFil];
    if (available && available[0]) {
      setCat(available[0].value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);
    const newErrors = {};

    if (!im.trim()) newErrors.im = "Le matricule IM est obligatoire (6 chiffres)";
    if (!nom.trim()) newErrors.nom = "Le nom et prénom du bénéficiaire sont obligatoires";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let created = null;
      if (onCreateDossier) {
        created = onCreateDossier({
          im: im.trim(),
          nom: nom.trim(),
          min,
          filiere,
          cat,
          be: be.trim() || '001/BE',
          email: email.trim(),
          tel: tel.trim()
        });
      }

      setIm('');
      setNom('');
      setEmail('');
      setTel('');
      setErrors({});

      if (created && onOpenDetail) {
        onOpenDetail(created, 'apercu');
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du dossier:", err);
      setSubmitError(err.message || "Erreur lors de l'enregistrement du dossier");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* En-tête */}
      <div style={{ background: bgCard, padding: '20px', borderRadius: '12px', border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: '#2563EB15', color: '#2563EB' }}>
            <FilePlus size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: textPrimary, margin: 0 }}>
              Guichet Unique : Enregistrement d'un Nouvel Acte
            </h2>
            <div style={{ fontSize: '12px', color: textSecondary, marginTop: '2px' }}>
              Dépôt physique des pièces, attribution de la référence et remise du récépissé avec QR Code
            </div>
          </div>
        </div>
      </div>

      {submitError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} />
          <span>{submitError}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{
        background: bgCard,
        padding: '24px',
        borderRadius: '12px',
        border: `1px solid ${border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
        
        {/* Choix de la Filière */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: textSecondary, marginBottom: '8px' }}>
            Filière d'affectation *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {['Solde', 'Pension', 'Visa'].map(f => (
              <button
                type="button"
                key={f}
                onClick={() => handleFiliereChange(f)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: `2px solid ${filiere === f ? '#2563EB' : border}`,
                  background: filiere === f ? '#2563EB10' : inputBg,
                  color: filiere === f ? '#2563EB' : textPrimary,
                  fontWeight: 'bold',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Matricule IM & Nom */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: textSecondary, marginBottom: '6px' }}>
              Matricule IM (6 chiffres) *
            </label>
            <input
              type="text"
              value={im}
              onChange={e => setIm(e.target.value)}
              placeholder="Ex: 345678"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: inputBg,
                border: `1.5px solid ${errors.im ? '#EF4444' : inputBorder}`,
                color: textPrimary,
                fontSize: '13px',
                fontWeight: 'bold'
              }}
            />
            {errors.im && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.im}</div>}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: textSecondary, marginBottom: '6px' }}>
              Nom & Prénoms du Bénéficiaire *
            </label>
            <input
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
              placeholder="Ex: RANDRIANARISOA HERIMANANA"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: inputBg,
                border: `1.5px solid ${errors.nom ? '#EF4444' : inputBorder}`,
                color: textPrimary,
                fontSize: '13px'
              }}
            />
            {errors.nom && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '4px' }}>{errors.nom}</div>}
          </div>
        </div>

        {/* Nature de l'Acte */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: textSecondary, marginBottom: '6px' }}>
            Nature de l'Acte Administratif ({filiere}) *
          </label>
          <select
            value={cat}
            onChange={e => setCat(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              background: inputBg,
              border: `1px solid ${inputBorder}`,
              color: textPrimary,
              fontSize: '13px'
            }}
          >
            {(categoriesMap[filiere] || []).map(c => (
              <option key={c.value} value={c.value}>{c.label} ({c.value})</option>
            ))}
          </select>
        </div>

        {/* Ministère & Bordereau d'Envoi (BE) */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: textSecondary, marginBottom: '6px' }}>
              Ministère employeur *
            </label>
            <select
              value={min}
              onChange={e => setMin(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                color: textPrimary,
                fontSize: '13px'
              }}
            >
              {ministeresList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: textSecondary, marginBottom: '6px' }}>
              Bordereau d'Envoi (BE) *
            </label>
            <input
              type="text"
              value={be}
              onChange={e => setBe(e.target.value)}
              placeholder="Ex: 085/MEN"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                color: textPrimary,
                fontSize: '13px'
              }}
            />
          </div>
        </div>

        {/* Contacts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: textSecondary, marginBottom: '6px' }}>
              Adresse Email (Notification)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="beneficiaire@gmail.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                color: textPrimary,
                fontSize: '13px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: textSecondary, marginBottom: '6px' }}>
              Téléphone Mobile (SMS)
            </label>
            <input
              type="tel"
              value={tel}
              onChange={e => setTel(e.target.value)}
              placeholder="034 12 345 67"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                background: inputBg,
                border: `1px solid ${inputBorder}`,
                color: textPrimary,
                fontSize: '13px'
              }}
            />
          </div>
        </div>

        {/* Bouton de validation */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <button
            type="submit"
            style={{
              background: '#2563EB',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>Enregistrer l'Acte & Générer Récépissé</span>
          </button>
        </div>

      </form>
    </div>
  );
}