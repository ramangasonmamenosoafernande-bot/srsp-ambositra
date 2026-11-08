const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 1. FAKANA DOSSIER REHETRA + SIVANA SY FIKAROHANA
router.get('/tous', async (req, res) => {
  try {
    const { search, statut } = req.query;
    let query = 'SELECT * FROM dossiers WHERE 1=1';
    let params = [];
    let paramIndex = 1;

    // Fikarohana (Recherche)
    if (search && search.trim() !== '') {
      query += ` AND (numero_dossier ILIKE $${paramIndex} OR nom_beneficiaire ILIKE $${paramIndex} OR categorie ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Sivana isaky ny Tab (Accueil, Chef Coordo, sns.)
    if (statut && statut !== 'Tous') {
      query += ` AND statut_actuel ILIKE $${paramIndex}`;
      params.push(`%${statut}%`);
      paramIndex++;
    }

    query += ' ORDER BY id DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur Backend /tous:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. STATISTIKA HO AN'NY TABLEAU DE BORD
router.get('/dashboard/stats', async (req, res) => {
  try {
    const totalRes = await pool.query('SELECT COUNT(*) FROM dossiers');
    const bloquesRes = await pool.query('SELECT COUNT(*) FROM dossiers WHERE visa_appose = FALSE AND statut_actuel = \'Contrôle\'');
    const paiementRes = await pool.query('SELECT COUNT(*) FROM dossiers WHERE statut_actuel ILIKE \'%Paiement%\'');

    const services = ['ACCUEIL', 'CHEF COORDO', 'VÉRIFICATION', 'LIQUIDATION', 'CONTRÔLE', 'ORDONNANCEMENT', 'PAIEMENT'];
    let charges = {};
    
    for (let s of services) {
      const r = await pool.query("SELECT COUNT(*) FROM dossiers WHERE UPPER(statut_actuel) = $1", [s]);
      charges[s] = parseInt(r.rows[0].count);
    }

    res.json({
      actifs: parseInt(totalRes.rows[0].count),
      bloques: parseInt(bloquesRes.rows[0].count),
      auPaiement: parseInt(paiementRes.rows[0].count),
      charges: charges
    });
  } catch (err) {
    console.error("Erreur Dashboard stats:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. FAMORONANA DOSSIER VAOVAO
router.post('/nouveau', async (req, res) => {
  try {
    const { numero_dossier, nom_beneficiaire, prenom_beneficiaire, categorie, type_pension, chemin_scan } = req.body;
    
    const newDossier = await pool.query(
      `INSERT INTO dossiers (numero_dossier, nom_beneficiaire, prenom_beneficiaire, categorie, type_pension, statut_actuel, chemin_scan, date_depot) 
       VALUES ($1, $2, $3, $4, $5, 'Accueil', $6, CURRENT_DATE) RETURNING *`,
      [numero_dossier, nom_beneficiaire, prenom_beneficiaire, categorie || 'Retraite civile', type_pension || '-', chemin_scan]
    );
    res.json(newDossier.rows[0]);
  } catch (err) {
    console.error("Erreur Creation dossier:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;