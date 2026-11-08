const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Tahiry vonjimaika (Data en mémoire) na afaka ampifandraisina amin'ny Base de données
let dossiers = [
  { id: 1, numero_dossier: 'DOS-2026-001', nom_beneficiaire: 'Rabe', prenom_beneficiaire: 'Jean', categorie: 'Visa', categorie_verrouillee: false, statut_actuel: 'Accueil', date_depot: new Date(), chemin_scan: 'scan1.pdf' },
  { id: 2, numero_dossier: 'DOS-2026-002', nom_beneficiaire: 'Rakoto', prenom_beneficiaire: 'Paul', categorie: 'Solde', categorie_verrouillee: true, statut_actuel: 'En cours', date_depot: new Date(), chemin_scan: 'scan2.pdf' }
];
let commentairesMap = {};

// 1. Maka ny lisitry ny dossier rehetra
app.get('/api/dossiers/tous', (req, res) => {
  res.json(dossiers);
});

// 2. Statistika ho an'ny Tableau de bord (misy an'ireo Sokajy rehetra)
app.get('/api/dossiers/dashboard/stats', (req, res) => {
  const total = dossiers.length;
  const nouveaux = dossiers.filter(d => d.statut_actuel === 'nouveau' || d.statut_actuel === 'Accueil').length;
  const clotures = dossiers.filter(d => d.statut_actuel === 'Cloture' || d.statut_actuel === 'Clôturer').length;
  const enCours = total - (nouveaux + clotures);

  // Isany isaky ny sokajy tianao (Solde, Visa, Pension)
  const soldeCount = dossiers.filter(d => d.categorie === 'Solde').length;
  const visaCount = dossiers.filter(d => d.categorie === 'Visa').length;
  const pensionCount = dossiers.filter(d => d.categorie === 'Pension').length;

  res.json({ 
    total, 
    nouveaux, 
    enCours, 
    clotures,
    soldeCount,
    visaCount,
    pensionCount
  });
});

// 3. Famoronana dossier vaovao
app.post('/api/dossiers/nouveau', (req, res) => {
  const { numero_dossier, nom_beneficiaire, prenom_beneficiaire, categorie, chemin_scan } = req.body;
  const nouveauDossier = {
    id: Date.now(),
    numero_dossier,
    nom_beneficiaire,
    prenom_beneficiaire,
    categorie: categorie || 'Visa',
    categorie_verrouillee: false,
    statut_actuel: 'Accueil',
    date_depot: new Date(),
    chemin_scan: chemin_scan || 'document.pdf'
  };
  dossiers.unshift(nouveauDossier);
  res.status(201).json(nouveauDossier);
});

// 4. Fanavaozana Statut (Ity no niteraka 404 teo aloha, tafiditra eto izao)
app.put('/api/dossiers/valider/:id', (req, res) => {
  const { id } = req.params;
  const { nouveau_statut } = req.body;
  
  const dossier = dossiers.find(d => d.id == id);
  if (dossier) {
    if (nouveau_statut) dossier.statut_actuel = nouveau_statut;
    res.json({ message: 'Mis à jour avec succès', dossier });
  } else {
    res.status(404).json({ error: 'Dossier introuvable' });
  }
});

// 5. Fanavaozana sy Fihidina Sokajy (Verrouillage Catégorie)
app.put('/api/dossiers/:id', (req, res) => {
  const { id } = req.params;
  const { categorie, categorie_verrouillee, statut_actuel } = req.body;
  
  const dossier = dossiers.find(d => d.id == id);
  if (dossier) {
    if (!dossier.categorie_verrouillee) {
      if (categorie) dossier.categorie = categorie;
    }
    if (categorie_verrouillee !== undefined) {
      dossier.categorie_verrouillee = categorie_verrouillee;
    }
    if (statut_actuel) dossier.statut_actuel = statut_actuel;
    
    res.json({ message: 'Mis à jour avec succès', dossier });
  } else {
    res.status(404).json({ error: 'Dossier introuvable' });
  }
});

// 6. Commentaires
app.get('/api/dossiers/:id/commentaires', (req, res) => {
  const { id } = req.params;
  res.json(commentairesMap[id] || []);
});

app.post('/api/dossiers/:id/commentaires', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  if (!commentairesMap[id]) commentairesMap[id] = [];
  const comm = { message, date: new Date() };
  commentairesMap[id].push(comm);
  res.status(201).json(comm);
});

// 7. Fafana ny dossier
app.delete('/api/dossiers/:id', (req, res) => {
  const { id } = req.params;
  dossiers = dossiers.filter(d => d.id != id);
  res.json({ message: 'Supprimé avec succès' });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});