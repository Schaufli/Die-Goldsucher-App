import React from 'react';
import { motion } from 'motion/react';
import { Lock, Star, ShieldCheck, Map } from 'lucide-react';
import { BillingService } from '../../services/billingService';

interface PaywallProps {
  onSubscribeSuccess: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onSubscribeSuccess }) => {
  const handleSubscribe = async () => {
    const success = await BillingService.purchaseSubscription();
    if (success) {
      onSubscribeSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-brand-bg flex flex-col items-center justify-center p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center border border-gray-100"
      >
        <div className="w-20 h-20 bg-brand-accent/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-brand-accent" />
        </div>

        <h1 className="text-2xl font-bold text-brand-text mb-2">
          Deine Testphase ist abgelaufen
        </h1>
        <p className="text-brand-textSec mb-8 text-sm leading-relaxed">
          Du hast die Goldsucher App 14 Tage lang kostenlos getestet. 
          Um weiterhin alle Funktionen nutzen zu können, schließe jetzt dein Abonnement ab.
        </p>

        <div className="w-full bg-gray-50 rounded-2xl p-5 mb-8 text-left border border-gray-100">
          <h3 className="font-bold text-brand-text mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-brand-gold" />
            Premium Vorteile
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-brand-textSec">
              <Map className="w-5 h-5 text-brand-accent shrink-0" />
              <span>Unbegrenzt Fundorte speichern und verwalten</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-brand-textSec">
              <ShieldCheck className="w-5 h-5 text-brand-accent shrink-0" />
              <span>Sichere Cloud-Synchronisation deiner Daten</span>
            </li>
          </ul>
        </div>

        <button
          onClick={handleSubscribe}
          className="w-full bg-brand-gold text-brand-text font-bold py-4 rounded-xl shadow-lg hover:bg-yellow-600 transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
          Jetzt abonnieren
        </button>
        
        <p className="text-xs text-gray-400 mt-4">
          Die Zahlung erfolgt sicher über deinen App Store Account. 
          Jederzeit kündbar.
        </p>
      </motion.div>
    </div>
  );
};
