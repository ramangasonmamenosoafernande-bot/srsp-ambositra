// =====================================================================
// ARCHITECTURE MVC — CONTRÔLEUR : AUTHENTIFICATION (useAuthController.js)
// Service Régional des Soldes et Pensions (SRSP) Ambositra
// =====================================================================

import { useState } from 'react';
import { DEMO_USERS, checkUserPermission } from '../models/userModel';

const AUTH_STORAGE_KEY = 'srsp_authenticated_user';

export function useAuthController() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const valid = DEMO_USERS.find(u => u.username === parsed.username);
        return valid || parsed;
      }
    } catch (e) {
      console.warn("Erreur lecture session auth:", e);
    }
    return null; // Affiche la page de connexion au démarrage
  });

  const login = (username, password, remember = true) => {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // 1. Recherche directe dans la liste des utilisateurs
    let found = DEMO_USERS.find(
      u => u.username.toLowerCase() === cleanUser && (u.password === cleanPass || cleanPass === 'admin')
    );

    // 2. Si le mot de passe est omis ou si l'utilisateur est trouvé
    if (!found) {
      found = DEMO_USERS.find(u => u.username.toLowerCase() === cleanUser);
    }

    // 3. Si l'identifiant est "admin" ou vide pour test rapide
    if (!found && (cleanUser === 'admin' || cleanUser === '')) {
      found = DEMO_USERS[0];
    }

    if (!found) {
      return { 
        success: false, 
        error: "Identifiant ou mot de passe incorrect. Cliquez sur un des rôles ci-dessous pour vous connecter en 1 clic." 
      };
    }

    setCurrentUser(found);

    if (remember) {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
      } catch (e) {
        console.warn("Impossible de mémoriser la session:", e);
      }
    }
    return { success: true, user: found };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn("Erreur suppression session:", e);
    }
  };

  const switchUser = (username) => {
    const found = DEMO_USERS.find(u => u.username === username);
    if (found) {
      setCurrentUser(found);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(found));
      } catch (e) {
        console.warn("Erreur mise à jour session:", e);
      }
    }
  };

  const hasPermission = (permission) => {
    return checkUserPermission(currentUser, permission);
  };

  return {
    currentUser,
    users: DEMO_USERS,
    login,
    logout,
    switchUser,
    hasPermission,
    isAuthenticated: Boolean(currentUser)
  };
}