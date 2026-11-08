// =====================================================================
// ARCHITECTURE MVC — VUE : APERÇU EMAIL / SMS (AlertPreviewModal.jsx)
// Responsabilité : Visualisation des alertes envoyées par email et SMS
// =====================================================================

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AlertPreviewModal({
  previewMsg,
  theme = {},
  darkMode = false,
  onClose
}) {
  const [channel, setChannel] = useState('email'); // 'email' | 'sms'

  if (!previewMsg) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ background: theme.bgCard || '#FFFFFF', padding: '20px', borderRadius: '14px', maxWidth: '480px', width: '100%', border: `1px solid ${theme.border || '#E2E8F0'}`, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border || '#E2E8F0'}`, paddingBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => setChannel('email')} 
              style={{ background: channel === 'email' ? '#2563EB' : (theme.itemHover || '#F1F5F9'), color: channel === 'email' ? 'white' : (theme.textPrimary || '#0F172A'), border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              E-mail
            </button>
            <button 
              onClick={() => setChannel('sms')} 
              style={{ background: channel === 'sms' ? '#10B981' : (theme.itemHover || '#F1F5F9'), color: channel === 'sms' ? 'white' : (theme.textPrimary || '#0F172A'), border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              SMS Mobile
            </button>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textSecondary || '#64748B', cursor: 'pointer' }}>
            <X size={16} />
          </button>
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

        <button 
          onClick={onClose} 
          style={{ background: '#2563EB', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Fermer
        </button>

      </div>
    </div>
  );
}