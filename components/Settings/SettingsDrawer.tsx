import React, { useState } from 'react';
import { X, User, Globe, HelpCircle, MessageSquare, ShoppingBag, Scale, Settings, ArrowLeft, Send, ChevronDown, History, CheckCircle, GraduationCap } from 'lucide-react';
import { PRIVACY_POLICY, IMPRINT, TERMS } from '../../constants/legalTexts';
import { LocationService } from '../../services/locationService';
import { HelpCenter } from '../Help/HelpCenter';
import { TutorialView } from '../Tutorial/TutorialView';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({ isOpen, onClose, onOpenProfile }) => {
  const [activeView, setActiveView] = useState<'MAIN' | 'SUPPORT' | 'PRIVACY' | 'IMPRINT' | 'TERMS' | 'HELP' | 'TUTORIAL'>('MAIN');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportName, setSupportName] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const menuItems = [
    { icon: User, label: 'Profil', id: 'profile' },
    { icon: GraduationCap, label: 'Tutorial', id: 'tutorial' },
    { icon: HelpCircle, label: 'Goldsucher-Wissen', id: 'help' },
    { icon: MessageSquare, label: 'Support kontaktieren', id: 'support' },
    { icon: ShoppingBag, label: 'Ausrüstung kaufen', id: 'shop' },
    { 
      icon: Scale, 
      label: 'Rechtliches', 
      id: 'legal',
      subItems: [
        { label: 'Impressum', id: 'imprint' },
        { label: 'Datenschutzerklärung', id: 'privacy' },
        { label: 'AGB', id: 'terms' }
      ]
    },
  ];


  const handleItemClick = (item: typeof menuItems[0]) => {
    if ('subItems' in item && item.subItems) {
        setExpandedId(prev => prev === item.id ? null : item.id);
        return;
    }

    if (item.id === 'shop') {
        window.open('https://goldsax-goldwaschen.de', '_blank');
    } else if (item.id === 'support') {
        setActiveView('SUPPORT');
    } else if (item.id === 'tutorial') {
        setActiveView('TUTORIAL');
    } else if (item.id === 'help') {
        setActiveView('HELP');
    } else if (item.id === 'profile') {
        onOpenProfile();
        onClose();
    }
  };

  const handleSubItemClick = (subId: string) => {
      if (subId === 'privacy') {
          setActiveView('PRIVACY');
      } else if (subId === 'imprint') {
          setActiveView('IMPRINT');
      } else if (subId === 'terms') {
          setActiveView('TERMS');
      }
  };

  const handleSendSupport = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSending(true);
      
      const formspreeId = (import.meta as any).env.VITE_FORMSPREE_ID || 'xwvrvowl';
      
      if (!formspreeId) {
          // Fallback to mailto if no ID is provided
          const subject = encodeURIComponent(supportSubject || 'Support Anfrage Goldsucher App');
          const body = encodeURIComponent(`Name: ${supportName}\nEmail: ${supportEmail}\n\n${supportMessage}`);
          window.location.href = `mailto:info@goldsax-goldwaschen.de?subject=${subject}&body=${body}`;
          setIsSending(false);
          setActiveView('MAIN');
          onClose();
          return;
      }

      try {
          const response = await fetch(`https://formspree.io/f/${formspreeId}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
              },
              body: JSON.stringify({
                  name: supportName,
                  email: supportEmail,
                  subject: supportSubject,
                  message: supportMessage,
                  _subject: `Support Anfrage: ${supportSubject}`
              })
          });

          if (response.ok) {
              setIsSuccess(true);
              setSupportSubject('');
              setSupportMessage('');
              setSupportEmail('');
              setSupportName('');
              setTimeout(() => {
                  setIsSuccess(false);
                  setActiveView('MAIN');
                  onClose();
              }, 3000);
          } else {
              throw new Error('Versand fehlgeschlagen');
          }
      } catch (error) {
          console.error(error);
          alert('Der Versand ist fehlgeschlagen. Bitte versuche es später erneut oder nutze info@goldsax-goldwaschen.de');
      } finally {
          setIsSending(false);
      }
  };

  const getHeaderTitle = () => {
      switch (activeView) {
          case 'SUPPORT': return 'Support';
          case 'PRIVACY': return 'Datenschutz';
          case 'IMPRINT': return 'Impressum';
          case 'TERMS': return 'AGB';
          case 'HELP': return 'Goldsucher-Wissen';
          case 'TUTORIAL': return 'Tutorial';
          default: return 'Einstellungen';
      }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[1050] transition-opacity duration-300 ${
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
        onClick={onClose}
      />


      {/* Drawer Panel - Slides from Left */}
      <div 
        className={`fixed inset-y-0 left-0 w-full max-w-md bg-brand-bg shadow-2xl z-[1100] transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="h-16 bg-brand-accent flex items-center justify-between px-4 shrink-0 shadow-md">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            {activeView !== 'MAIN' ? (
                <button onClick={() => setActiveView('MAIN')} className="mr-1 hover:bg-white/10 p-1 rounded-full">
                    <ArrowLeft size={20} />
                </button>
            ) : (
                <Settings className="w-6 h-6 text-brand-gold" />
            )}
            <span>{getHeaderTitle()}</span>
          </div>
          <button onClick={onClose} className="text-white p-2 hover:bg-white/10 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 p-4 ${activeView === 'TUTORIAL' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
          {activeView === 'MAIN' && (
              <div className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <button
                        className={`flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-transparent hover:border-brand-gold/30 hover:shadow-md transition-all text-left group w-full ${
                            expandedId === item.id ? 'border-brand-gold/30 shadow-md' : ''
                        }`}
                        onClick={() => handleItemClick(item)}
                    >
                        <div className="p-2 rounded-full bg-brand-bgAlt group-hover:bg-brand-gold/10 text-brand-textSec group-hover:text-brand-gold transition-colors">
                            <item.icon size={20} />
                        </div>
                        <span className="font-medium text-brand-text text-base flex-1">{item.label}</span>
                        {'subItems' in item && (
                            <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${expandedId === item.id ? 'rotate-180' : ''}`} />
                        )}
                    </button>
                    
                    {/* Subitems Accordion */}
                    {'subItems' in item && expandedId === item.id && (
                        <div className="flex flex-col ml-14 gap-1 border-l-2 border-gray-100 pl-3 animate-fade-in mb-2">
                            {item.subItems?.map((sub) => (
                                <button 
                                    key={sub.id}
                                    className="text-left py-2 px-3 text-sm font-medium text-brand-textSec hover:text-brand-gold hover:bg-white rounded-lg transition-all"
                                    onClick={() => handleSubItemClick(sub.id)}
                                >
                                    {sub.label}
                                </button>
                            ))}
                        </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
          )}

          {activeView === 'SUPPORT' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                  {isSuccess ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center animate-bounce">
                          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                              <CheckCircle size={32} />
                          </div>
                          <h3 className="text-xl font-bold text-brand-text">Nachricht gesendet!</h3>
                          <p className="text-brand-textSec mt-2">Wir melden uns so schnell wie möglich bei dir.</p>
                      </div>
                  ) : (
                      <form onSubmit={handleSendSupport} className="flex flex-col gap-4">
                          <p className="text-sm text-brand-textSec mb-2">
                              Hast du Fragen oder Probleme? Schreibe uns direkt eine Nachricht über dieses Formular.
                          </p>
                          
                          <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider ml-1">Name</label>
                                  <input 
                                      type="text" 
                                      value={supportName}
                                      onChange={(e) => setSupportName(e.target.value)}
                                      placeholder="Dein Name"
                                      className="p-3 rounded-xl border border-gray-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm bg-white transition-all"
                                      required
                                      disabled={isSending}
                                  />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider ml-1">E-Mail</label>
                                  <input 
                                      type="email" 
                                      value={supportEmail}
                                      onChange={(e) => setSupportEmail(e.target.value)}
                                      placeholder="Deine E-Mail"
                                      className="p-3 rounded-xl border border-gray-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm bg-white transition-all"
                                      required
                                      disabled={isSending}
                                  />
                              </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider ml-1">Betreff</label>
                              <input 
                                  type="text" 
                                  value={supportSubject}
                                  onChange={(e) => setSupportSubject(e.target.value)}
                                  placeholder="Worum geht es?"
                                  className="p-3 rounded-xl border border-gray-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm bg-white transition-all"
                                  required
                                  disabled={isSending}
                              />
                          </div>

                          <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-brand-text uppercase tracking-wider ml-1">Nachricht</label>
                              <textarea 
                                  value={supportMessage}
                                  onChange={(e) => setSupportMessage(e.target.value)}
                                  placeholder="Deine Nachricht an uns..."
                                  className="p-3 rounded-xl border border-gray-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm bg-white min-h-[120px] resize-none transition-all"
                                  required
                                  disabled={isSending}
                              />
                          </div>

                          <button 
                            type="submit"
                            disabled={isSending}
                            className="mt-2 bg-brand-gold text-brand-text font-bold py-4 px-4 rounded-xl shadow-md hover:bg-yellow-600 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
                          >
                              {isSending ? (
                                  <div className="w-5 h-5 border-2 border-brand-text border-t-transparent rounded-full animate-spin" />
                              ) : (
                                  <Send size={20} />
                              )}
                              {isSending ? 'Wird gesendet...' : 'Nachricht senden'}
                          </button>
                      </form>
                  )}
              </div>
          )}

          {activeView === 'PRIVACY' && (
              <div className="animate-fade-in bg-white p-4 rounded-xl shadow-sm">
                  <div className="prose prose-sm max-w-none text-brand-textSec whitespace-pre-wrap">
                      {PRIVACY_POLICY}
                  </div>
              </div>
          )}

          {activeView === 'IMPRINT' && (
              <div className="animate-fade-in bg-white p-4 rounded-xl shadow-sm">
                  <div className="prose prose-sm max-w-none text-brand-textSec whitespace-pre-wrap">
                      {IMPRINT}
                  </div>
              </div>
          )}

          {activeView === 'TERMS' && (
              <div className="animate-fade-in bg-white p-4 rounded-xl shadow-sm">
                  <div className="prose prose-sm max-w-none text-brand-textSec whitespace-pre-wrap">
                      {TERMS}
                  </div>
              </div>
          )}

          {activeView === 'HELP' && (
              <div className="animate-fade-in h-full">
                  <HelpCenter />
              </div>
          )}

          {activeView === 'TUTORIAL' && (
              <div className="animate-fade-in h-full -m-4 p-4 flex flex-col">
                  <TutorialView onClose={() => setActiveView('MAIN')} />
              </div>
          )}
        </div>
        
        {activeView !== 'TUTORIAL' && (
        <div className="p-4 text-center text-xs text-gray-400 border-t border-gray-200">
            Version 1.0.0
        </div>
        )}
      </div>
    </>
  );
};
