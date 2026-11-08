import { useState, useEffect } from 'react';
import { INITIAL_ARCHIVES, createArchiveRecord } from '../models/archiveModel';

const ARCHIVES_STORAGE_KEY = 'srsp_archives_data_v1';

export function useArchiveController() {
  const [archives, setArchives] = useState(() => {
    const saved = localStorage.getItem(ARCHIVES_STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ARCHIVES;
  });

  useEffect(() => {
    localStorage.setItem(ARCHIVES_STORAGE_KEY, JSON.stringify(archives));
  }, [archives]);

  const archiveDossier = (dossier, options) => {
    const newRecord = createArchiveRecord(dossier, options);
    setArchives(prev => [newRecord, ...prev]);
    return newRecord;
  };

  const resetArchives = () => {
    setArchives(INITIAL_ARCHIVES);
    localStorage.removeItem(ARCHIVES_STORAGE_KEY);
  };

  return {
    archives,
    archiveDossier,
    resetArchives
  };
}