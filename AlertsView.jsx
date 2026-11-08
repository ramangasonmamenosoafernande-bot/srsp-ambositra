// =====================================================================
// ARCHITECTURE MVC — VUE : ALERTES & NOTIFICATIONS (AlertsView.jsx)
// Responsabilité : Historique avec affichage DIRECT d'aperçu inline
// =====================================================================

import React, { useState } from 'react';
import { 
  Mail, Phone, Eye, Bell, CheckCircle2, Clock, 
  Copy, Check, ChevronDown, ChevronUp, ExternalLink,
  ShieldCheck, Smartphone, Printer, Sparkles
} from 'lucide-react';

export default function AlertsView({
  notifications = [],
  theme = {},
  darkMode = false,
  onOpenPreview
}) {
  const [activeInlinePreviewId, setActiveInlinePreviewId] = useState(notifications.length > 0 ? notifications[0].id : null);
  const [activeChannelMap, setActiveChannelMap] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const getChannel = (notifId) => activeChannelMap[notifId] || 'email';
  
  const setChannel = (notifId, channel) => {
    setActiveChannelMap(prev => ({ ...prev, [notifId]: channel }));
  };

  const handleTogglePreview = (notif) => {
    if (activeInlinePreviewId === notif.id) {
      setActiveInlinePreviewId(null);
    } else {
      setActiveInlinePreviewId(notif.id);
    }
    if (onOpenPreview) {
      onOpenPreview(notif);
    }
  };

  const handleCopyText = (notif) => {
    const textToCopy = `[${notif.obj}]\n${notif.text}\nDestinataire : ${notif.to} (${notif.tel || ''})`;
    navigator.clipboard?.writeText(textToCopy);
    setCopiedId(notif.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* En-tête */}
      <div style={{
        background: theme.bgCard || '#FFFFFF',
        padding: '20px 24px',
        borderRadius: '16px',
        border: `1px solid ${theme.border || '#E2E8F0'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: theme.textPrimary || '#0F172A', margin: 0 }}>
              Journal des Alertes & Notifications Automatiques
            </h2>
            <div style={{ fontSize: '12px', color: theme.textSecondary || '#64748B', marginTop: '3px' }}>
              Traçabilité et aperçu direct instantané des messages officiels E-mail & SMS envoyés aux usagers
            </div>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          backgroundColor: '#05966915',
          border: '1px solid #05966930',
          color: '#059669',
          fontSize: '11px',
          fontWeight: '700'
        }}>
          <Sparkles size={13} />
          <span>Aperçu direct activé</span>
        </div>
      </div>

      {/* Liste des notifications */}
      <div style={{
        background: theme.bgCard || '#FFFFFF',
        borderRadius: '16px',
        border: `1px solid ${theme.border || '#E2E8F0'}`,
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${theme.border || '#E2E8F0'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: darkMode ? '#0F172A' : '#F8FAFC'
        }}>
          <strong style={{ fontSize: '13px', color: theme.textPrimary || '#0F172A' }}>
            Historique des messages expédiés ({notifications.length})
          </strong>
          <span style={{ fontSize: '11px', color: theme.textSecondary || '#64748B' }}>
            Cliquez sur <strong>Aperçu Direct</strong> pour afficher immédiatement
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {notifications.map(notif => {
            const isExpanded = activeInlinePreviewId === notif.id;
            const channel = getChannel(notif.id);

            return (
              <div
                key={notif.id}
                style={{
                  borderBottom: `1px solid ${theme.border || '#E2E8F0'}`,
                  backgroundColor: isExpanded ? (darkMode ? '#131D31' : '#F0F9FF') : 'transparent'
                }}
              >
                <div style={{
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '16px',
                  cursor: 'pointer'
                }}
                onClick={() => handleTogglePreview(notif)}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: isExpanded ? '#2563EB' : (theme.itemHover || '#F1F5F9'),
                      color: isExpanded ? 'white' : '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Mail size={18} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '800', fontSize: '14px', color: theme.textPrimary || '#0F172A' }}>
                          {notif.obj}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: '#10B98115',
                          color: '#10B981',
                          border: '1px solid #10B98130'
                        }}>
                          Envoyé ✓
                        </span>
                      </div>

                      <div style={{ fontSize: '11px', color: theme.textSecondary || '#64748B', marginTop: '3px' }}>
                        Destinataire : <strong style={{ color: theme.textPrimary || '#0F172A' }}>{notif.to}</strong> {notif.tel ? `• SMS : ${notif.tel}` : ''}
                      </div>

                      <div style={{ fontSize: '12px', color: darkMode ? '#CBD5E1' : '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                        {notif.text}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: theme.textSecondary || '#64748B' }}>
                      <Clock size={12} />
                      <span>{notif.date}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleTogglePreview(notif)}
                        style={{
                          background: isExpanded ? '#2563EB' : (theme.itemHover || '#F1F5F9'),
                          color: isExpanded ? 'white' : '#2563EB',
                          border: `1px solid ${isExpanded ? '#2563EB' : (theme.border || '#CBD5E1')}`,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Eye size={13} />
                        <span>{isExpanded ? "Masquer l'Aperçu" : "Aperçu Direct"}</span>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      {onOpenPreview && (
                        <button
                          type="button"
                          onClick={() => onOpenPreview(notif)}
                          title="Ouvrir dans une fenêtre modale"
                          style={{
                            background: theme.itemHover || '#F1F5F9',
                            color: theme.textPrimary || '#0F172A',
                            border: `1px solid ${theme.border || '#CBD5E1'}`,
                            padding: '6px 8px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          <ExternalLink size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cadre d'aperçu direct déployé */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px 20px' }}>
                    <div style={{
                      backgroundColor: darkMode ? '#0B1120' : '#FFFFFF',
                      border: `1px solid ${darkMode ? '#334155' : '#BFDBFE'}`,
                      borderRadius: '14px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        borderBottom: `1px solid ${darkMode ? '#1E293B' : '#E2E8F0'}`,
                        backgroundColor: darkMode ? '#0F172A' : '#F8FAFC'
                      }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setChannel(notif.id, 'email')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: channel === 'email' ? '#2563EB' : 'transparent',
                              color: channel === 'email' ? '#FFFFFF' : (darkMode ? '#94A3B8' : '#64748B')
                            }}
                          >
                            <Mail size={13} />
                            <span>Format E-mail Officiel</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setChannel(notif.id, 'sms')}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '700',
                              border: 'none',
                              cursor: 'pointer',
                              backgroundColor: channel === 'sms' ? '#10B981' : 'transparent',
                              color: channel === 'sms' ? '#FFFFFF' : (darkMode ? '#94A3B8' : '#64748B')
                            }}
                          >
                            <Smartphone size={13} />
                            <span>Format SMS Téléphone</span>
                          </button>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handleCopyText(notif)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: theme.itemHover || '#F1F5F9',
                              color: copiedId === notif.id ? '#10B981' : (theme.textPrimary || '#0F172A'),
                              border: `1px solid ${theme.border || '#CBD5E1'}`,
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            {copiedId === notif.id ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                            <span>{copiedId === notif.id ? 'Copié !' : 'Copier'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => window.print()}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              background: theme.itemHover || '#F1F5F9',
                              color: theme.textPrimary || '#0F172A',
                              border: `1px solid ${theme.border || '#CBD5E1'}`,
                              padding: '5px 10px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            <Printer size={12} />
                            <span>Imprimer</span>
                          </button>
                        </div>
                      </div>

                      {/* Format E-mail */}
                      {channel === 'email' && (
                        <div style={{ padding: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                          <div style={{
                            borderBottom: `2px solid ${darkMode ? '#1E293B' : '#E2E8F0'}`,
                            paddingBottom: '14px',
                            marginBottom: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                          }}>
                            <div>
                              <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.8px', color: '#059669', textTransform: 'uppercase' }}>
                                REPOBLIKAN'I MADAGASIKARA • Fitiavana - Tanindrazana - Fandrosoana
                              </div>
                              <div style={{ fontSize: '13px', fontWeight: '800', color: theme.textPrimary || '#0F172A', marginTop: '2px' }}>
                                Direction Régionale du Budget & Finances · SRSP Ambositra
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '11px', color: theme.textSecondary || '#64748B' }}>
                              <div>Réf : <strong>SRSP-NOTIF-{notif.id}</strong></div>
                              <div>{notif.date}</div>
                            </div>
                          </div>

                          <div style={{
                            backgroundColor: darkMode ? '#131D31' : '#F8FAFC',
                            padding: '12px 16px',
                            borderRadius: '10px',
                            border: `1px solid ${darkMode ? '#1E293B' : '#E2E8F0'}`,
                            marginBottom: '16px',
                            fontSize: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}>
                            <div><strong>De :</strong> notification.srsp@finances.gov.mg (Plateforme SRSP)</div>
                            <div><strong>À :</strong> {notif.to}</div>
                            <div><strong>Objet :</strong> <span style={{ color: '#2563EB', fontWeight: '700' }}>{notif.obj}</span></div>
                          </div>

                          <div style={{
                            padding: '16px',
                            backgroundColor: darkMode ? '#0F172A' : '#FFFFFF',
                            borderRadius: '10px',
                            border: `1px solid ${darkMode ? '#1E293B' : '#E2E8F0'}`,
                            color: theme.textPrimary || '#0F172A',
                            fontSize: '13px',
                            lineHeight: '1.7',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {notif.text}
                          </div>
                        </div>
                      )}

                      {/* Format SMS */}
                      {channel === 'sms' && (
                        <div style={{
                          padding: '24px',
                          display: 'flex',
                          justifyContent: 'center',
                          backgroundColor: darkMode ? '#060B14' : '#F1F5F9'
                        }}>
                          <div style={{
                            maxWidth: '340px',
                            width: '100%',
                            backgroundColor: '#1E293B',
                            borderRadius: '24px',
                            border: '4px solid #334155',
                            padding: '18px 14px',
                            color: '#FFFFFF'
                          }}>
                            <div style={{ textAlign: 'center', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '12px' }}>
                              <div style={{ fontSize: '11px', fontWeight: '800', color: '#10B981' }}>SRSP-AMBOSITRA</div>
                              <div style={{ fontSize: '9px', color: '#94A3B8' }}>SMS Direct • {notif.tel || '+261 34 00 111 02'}</div>
                            </div>
                            <div style={{
                              backgroundColor: '#059669',
                              color: '#FFFFFF',
                              padding: '12px 14px',
                              borderRadius: '16px 16px 16px 4px',
                              fontSize: '12px',
                              lineHeight: '1.5'
                            }}>
                              <div>{notif.text}</div>
                              <div style={{ fontSize: '9px', color: '#D1FAE5', textAlign: 'right', marginTop: '6px' }}>
                                {notif.date} • Reçu ✓✓
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}