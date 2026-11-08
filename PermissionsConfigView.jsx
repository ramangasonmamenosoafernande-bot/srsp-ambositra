import React, { useState } from 'react';
import { ShieldCheck, Check, X, RotateCcw, Save, AlertCircle } from 'lucide-react';
import { ROLES, DEFAULT_PERMISSIONS, getStoredPermissions, saveStoredPermissions } from '../models/userModel';

export default function PermissionsConfigView({ currentUser, onShowNotification }) {
  const [matrix, setMatrix] = useState(getStoredPermissions());
  const [hasChanges, setHasChanges] = useState(false);

  const permissionList = [
    { key: 'canViewAllDossiers', label: 'Consulter tous les dossiers' },
    { key: 'canCreateDossier', label: 'Créer un nouveau dossier (Accueil)' },
    { key: 'canEditDossier', label: 'Modifier les détails et montants' },
    { key: 'canValidateDossier', label: 'Valider et transmettre au poste suivant' },
    { key: 'canRejectDossier', label: 'Rejeter / Renvoyer pour rejet ou correction' },
    { key: 'canArchiveDossier', label: 'Archiver les dossiers terminés' },
    { key: 'canExportReports', label: 'Exporter les bordereaux et statistiques' },
    { key: 'canManageUsers', label: 'Gérer les comptes utilisateurs' },
    { key: 'canConfigurePermissions', label: 'Modifier cette matrice de droits' }
  ];

  const handleToggle = (role, permKey) => {
    setMatrix(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permKey]: !prev[role]?.[permKey]
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveStoredPermissions(matrix);
    setHasChanges(false);
    onShowNotification?.('Droits d\'accès et permissions mis à jour avec succès.', 'success');
  };

  const handleReset = () => {
    setMatrix(DEFAULT_PERMISSIONS);
    saveStoredPermissions(DEFAULT_PERMISSIONS);
    setHasChanges(false);
    onShowNotification?.('Matrice des droits réinitialisée aux valeurs par défaut.', 'info');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Configuration des Droits d'Accès & Permissions</h1>
            <p className="text-xs text-slate-400">
              Définissez pour chaque rôle du circuit SRSP les prérogatives de consultation, modification, et validation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition"
          >
            <RotateCcw size={14} />
            <span>Rétablir par défaut</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg ${
              hasChanges
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <Save size={14} />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="p-4 min-w-[220px]">Prérogative / Action</th>
                {Object.values(ROLES).filter(r => r !== ROLES.PUBLIC).map(role => (
                  <th key={role} className="p-4 text-center min-w-[130px]">
                    <div className="font-bold text-slate-200">{role}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {permissionList.map(({ key, label }) => (
                <tr key={key} className="hover:bg-slate-800/30 transition">
                  <td className="p-4 font-medium text-slate-300">{label}</td>
                  {Object.values(ROLES).filter(r => r !== ROLES.PUBLIC).map(role => {
                    const isChecked = Boolean(matrix[role]?.[key]);
                    return (
                      <td key={role} className="p-4 text-center">
                        <button
                          onClick={() => handleToggle(role, key)}
                          className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition ${
                            isChecked
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400/50 border border-rose-500/20 hover:bg-rose-500/20'
                          }`}
                        >
                          {isChecked ? <Check size={16} /> : <X size={14} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}