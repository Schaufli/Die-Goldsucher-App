import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, Sparkles, Settings, Menu, Plus, Layers, Map, User, Star, Check, X, ClipboardList, Search, Camera, Trash2, Globe, Mountain, Locate, NotebookTabs } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  illustration: React.ReactNode;
}

const HighlightCircle = ({ className, delay = 0.8, size = 10 }: { className: string; delay?: number; size?: number }) => (
  <motion.div
    className={`absolute ${className}`}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: [1, 1.15, 1], opacity: 1 }}
    transition={{ delay, duration: 1.5, repeat: Infinity }}
  >
    <div className="rounded-full border-[3px] border-red-500 bg-red-500/10" style={{ width: size * 4, height: size * 4 }} />
  </motion.div>
);

const IllustrationCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    className={`relative w-full rounded-2xl overflow-hidden bg-[#f0ece4] shadow-lg border border-gray-200 ${className}`}
    style={{ minHeight: '160px', maxHeight: '220px' }}
    initial={{ scale: 0.95, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 0.15, duration: 0.4 }}
  >
    {children}
  </motion.div>
);

const MiniHeader = () => (
  <div className="bg-[#4a7c6f] flex items-center justify-between px-3 py-1.5 shrink-0">
    <Settings size={14} className="text-white" />
    <div className="flex items-center gap-1">
      <Map size={12} className="text-[#d4a843]" />
      <span className="text-white font-bold text-[10px]">Die Goldsucher App</span>
    </div>
    <User size={14} className="text-white" />
  </div>
);

const MapLines = () => (
  <svg width="100%" height="100%" viewBox="0 0 300 200" className="absolute inset-0 opacity-30">
    <path d="M0 60 Q80 40 160 55 Q240 70 300 50" stroke="#a8c4a0" strokeWidth="2" fill="none" />
    <path d="M0 100 Q100 80 200 95 Q280 110 300 90" stroke="#7eb0d4" strokeWidth="3" fill="none" />
    <path d="M0 140 Q60 135 120 125 Q180 115 240 130 Q300 145 300 135" stroke="#7eb0d4" strokeWidth="2" fill="none" />
    <path d="M60 0 L60 200" stroke="#d4d0c8" strokeWidth="0.5" />
    <path d="M150 0 L150 200" stroke="#d4d0c8" strokeWidth="0.5" />
    <path d="M240 0 L240 200" stroke="#d4d0c8" strokeWidth="0.5" />
    <path d="M0 70 L300 70" stroke="#d4d0c8" strokeWidth="0.5" />
    <path d="M0 130 L300 130" stroke="#d4d0c8" strokeWidth="0.5" />
  </svg>
);

const MarkerPin = ({ color, x, y, label }: { color: string; x: string; y: string; label?: string }) => (
  <div className="absolute" style={{ left: x, top: y }}>
    <svg width="16" height="20" viewBox="0 0 24 30" fill={color} stroke="white" strokeWidth="2">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18C24 5.4 18.6 0 12 0z" />
    </svg>
    {label && <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[5px] font-bold text-gray-600 whitespace-nowrap bg-white/80 px-0.5 rounded">{label}</span>}
  </div>
);

const BottomBar = () => (
  <div className="absolute bottom-2 left-0 right-0 flex items-end justify-between px-4">
    <div className="bg-white rounded-full shadow-lg flex items-center justify-center w-8 h-8">
      <Menu size={14} className="text-gray-600" />
    </div>
    <div className="bg-[#d4a843] rounded-full shadow-lg flex items-center justify-center w-12 h-12">
      <Plus size={20} className="text-white" strokeWidth={3} />
    </div>
    <div className="bg-white rounded-full shadow-lg flex items-center justify-center w-8 h-8">
      <Layers size={14} className="text-gray-600" />
    </div>
  </div>
);

const GPSBtn = () => (
  <div className="absolute top-2 right-2 bg-white rounded-full shadow-lg w-8 h-8 flex items-center justify-center border border-gray-200">
    <Locate size={16} className="text-gray-500" />
  </div>
);

const WelcomeIllustration = () => (
  <IllustrationCard>
    <MiniHeader />
    <div className="relative flex-1" style={{ height: '160px' }}>
      <MapLines />
      <GPSBtn />
      <MarkerPin color="#EAB308" x="20%" y="20%" label="Isar-Nord" />
      <MarkerPin color="#3B82F6" x="55%" y="40%" />
      <MarkerPin color="#EAB308" x="35%" y="60%" />
      <MarkerPin color="#DC2626" x="70%" y="25%" />
      <BottomBar />
      <motion.div
        className="absolute inset-0 bg-black/40 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="bg-white rounded-2xl p-4 shadow-2xl flex flex-col items-center gap-2"
          initial={{ scale: 0.8, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <div className="w-12 h-12 bg-[#d4a843] rounded-xl flex items-center justify-center">
            <Map size={24} className="text-white" />
          </div>
          <div className="text-xs font-bold text-gray-800">Goldsucher App</div>
          <div className="text-[8px] text-gray-500">Dein Begleiter beim Goldwaschen</div>
        </motion.div>
      </motion.div>
    </div>
  </IllustrationCard>
);

const MapNavIllustration = () => (
  <IllustrationCard>
    <MiniHeader />
    <div className="relative flex-1" style={{ height: '160px' }}>
      <MapLines />
      <GPSBtn />
      <MarkerPin color="#EAB308" x="25%" y="30%" />
      <MarkerPin color="#3B82F6" x="50%" y="50%" />
      <BottomBar />
      <HighlightCircle className="top-0 right-0" delay={0.5} />
      <motion.div
        className="absolute top-1 right-12 bg-gray-800 text-white text-[7px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        GPS-Standort
      </motion.div>
      <HighlightCircle className="bottom-0 right-0" delay={1.0} />
      <motion.div
        className="absolute bottom-14 right-2 flex flex-col items-end gap-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
      >
        <div className="bg-white rounded-full shadow-lg px-2 py-1 flex items-center gap-1 border border-gray-200">
          <Globe size={12} className="text-gray-500" />
          <span className="text-[7px] font-bold text-gray-600">Satellit</span>
        </div>
        <div className="bg-white rounded-full shadow-lg px-2 py-1 flex items-center gap-1 border border-gray-200">
          <Mountain size={12} className="text-gray-500" />
          <span className="text-[7px] font-bold text-gray-600">Gelände</span>
        </div>
        <div className="bg-white rounded-full shadow-lg px-2 py-1 flex items-center gap-1 border border-gray-200">
          <Layers size={12} className="text-gray-500" />
          <span className="text-[7px] font-bold text-gray-600">Standard</span>
        </div>
      </motion.div>
    </div>
  </IllustrationCard>
);

const AddLocationIllustration = () => (
  <IllustrationCard>
    <MiniHeader />
    <div className="relative flex-1" style={{ height: '160px' }}>
      <MapLines />
      <GPSBtn />
      <MarkerPin color="#EAB308" x="35%" y="30%" />
      <BottomBar />
      <HighlightCircle className="bottom-0 left-1/2 -translate-x-1/2" delay={0.5} size={14} />
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -4, 0] }}
        transition={{ delay: 0.8, duration: 1.5, repeat: Infinity }}
      >
        <div className="bg-gray-800 text-white text-[7px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shadow-lg">
          Tippe hier für neuen Ort
        </div>
        <div className="w-2 h-2 bg-gray-800 rotate-45 absolute -bottom-0.5 left-1/2 -translate-x-1/2" />
      </motion.div>
    </div>
  </IllustrationCard>
);

const WizardIllustration = () => (
  <IllustrationCard className="bg-[#faf8f5]">
    <div className="flex justify-between items-center px-3 pt-2">
      <span className="text-[10px] font-bold text-[#4a7c6f]">Neuer Fundort</span>
      <div className="p-1 bg-white rounded-full shadow-sm">
        <X size={10} className="text-gray-400" />
      </div>
    </div>
    <div className="h-1.5 bg-gray-200 mx-3 mt-1 rounded-full">
      <motion.div
        className="h-full bg-[#d4a843] rounded-full"
        initial={{ width: '25%' }}
        animate={{ width: '50%' }}
        transition={{ delay: 0.8, duration: 0.5 }}
      />
    </div>
    <div className="p-3 flex flex-col gap-2">
      <div className="text-[10px] font-bold text-gray-800">Kategorie wählen</div>
      <div className="flex gap-2">
        {[
          { label: 'Goldhöffig', active: true },
          { label: 'Interessant', active: false },
          { label: 'Nicht goldhöffig', active: false },
        ].map((cat, i) => (
          <motion.div
            key={cat.label}
            className={`px-3 py-1.5 rounded-lg border-2 text-[8px] font-semibold text-gray-700 ${cat.active ? 'border-[#d4a843] bg-amber-50 shadow-sm' : 'border-transparent bg-white'}`}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.15 }}
          >
            {cat.label}
          </motion.div>
        ))}
      </div>
      <div className="text-[10px] font-bold text-gray-800 mt-1">Bewertung</div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((v) => (
          <motion.div
            key={v}
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold ${v <= 4 ? 'bg-[#d4a843] text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 + v * 0.1, type: 'spring' }}
          >
            {v}
          </motion.div>
        ))}
      </div>
      <div className="bg-white p-2 rounded-lg border border-gray-100 flex items-center gap-2 mt-1">
        <Camera size={12} className="text-gray-400" />
        <span className="text-[8px] text-gray-500 font-medium">Foto hinzufügen</span>
      </div>
    </div>
  </IllustrationCard>
);

const LeftMenuOpenIllustration = () => (
  <IllustrationCard>
    <MiniHeader />
    <div className="relative flex-1" style={{ height: '160px' }}>
      <MapLines />
      <GPSBtn />
      <MarkerPin color="#EAB308" x="50%" y="25%" />
      <BottomBar />
      <HighlightCircle className="bottom-0 left-1" delay={0.5} />
      <motion.div
        className="absolute bottom-12 left-2 flex flex-col gap-1.5"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div
          className="bg-white rounded-full shadow-lg px-2 py-1 flex items-center gap-1 border border-gray-200"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <NotebookTabs size={12} className="text-gray-500" />
          <span className="text-[7px] font-bold text-gray-600">Orte</span>
        </motion.div>
        <motion.div
          className="bg-white rounded-full shadow-lg px-2 py-1 flex items-center gap-1 border border-gray-200"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.15 }}
        >
          <Layers size={12} className="text-gray-500" />
          <span className="text-[7px] font-bold text-gray-600">Ebenen</span>
        </motion.div>
        <motion.div
          className="bg-white rounded-full shadow-lg px-2 py-1 flex items-center gap-1 border border-gray-200"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <ClipboardList size={12} className="text-gray-500" />
          <span className="text-[7px] font-bold text-gray-600">To-Do</span>
        </motion.div>
      </motion.div>
      <motion.div
        className="absolute bottom-12 left-[40%] bg-gray-800 text-white text-[7px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        Hamburger-Menü aufklappen
      </motion.div>
    </div>
  </IllustrationCard>
);

const LocationListIllustration = () => (
  <IllustrationCard className="bg-[#faf8f5]">
    <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold text-[#4a7c6f]">Meine Fundorte</span>
        <span className="text-[7px] bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-400 font-bold">3</span>
      </div>
      <X size={14} className="text-gray-400" />
    </div>
    <div className="bg-white px-3 py-1.5 border-b border-gray-200 flex flex-col gap-1.5">
      <div className="relative">
        <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        <div className="bg-gray-50 border border-gray-200 rounded-lg pl-6 pr-2 py-1 text-[7px] text-gray-400">Suchen...</div>
      </div>
      <div className="flex gap-1.5">
        {['Alle', 'Goldhöffig', 'Interessant'].map((f, i) => (
          <div key={f} className={`px-2 py-0.5 rounded text-[6px] font-bold border ${i === 0 ? 'bg-[#4a7c6f] text-white border-[#4a7c6f]' : 'bg-white text-gray-500 border-gray-200'}`}>{f}</div>
        ))}
      </div>
    </div>
    <div className="p-2 flex flex-col gap-1.5">
      {[
        { name: 'Isar-Biegung Nord', cat: 'Goldhöffig', color: '#CA8A04', stars: 4, date: '15.03.2026' },
        { name: 'Rhein Kiesbank', cat: 'Interessant', color: '#3B82F6', stars: 0, date: '10.03.2026' },
        { name: 'Elbe Altarm', cat: 'Goldhöffig', color: '#CA8A04', stars: 3, date: '05.03.2026' },
      ].map((loc, i) => (
        <motion.div
          key={loc.name}
          className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex gap-2"
          initial={{ x: -15, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 + i * 0.15 }}
        >
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <Camera size={10} className="text-gray-300" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-bold text-gray-800 truncate">{loc.name}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[6px] font-bold text-white px-1 rounded" style={{ backgroundColor: loc.color }}>{loc.cat}</span>
              <span className="text-[6px] text-gray-400">{loc.date}</span>
            </div>
            {loc.stars > 0 && (
              <div className="flex mt-0.5">
                {Array.from({ length: loc.stars }).map((_, s) => (
                  <Star key={s} size={7} fill="#EAB308" className="text-yellow-500" />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </IllustrationCard>
);

const TodoIllustration = () => (
  <IllustrationCard className="bg-[#faf8f5]">
    <div className="bg-white px-3 py-2 flex items-center justify-between border-b border-gray-200 shadow-sm">
      <div className="flex items-center gap-1.5">
        <ClipboardList size={12} className="text-[#d4a843]" />
        <span className="text-[10px] font-bold text-[#4a7c6f]">To Do Liste</span>
      </div>
      <X size={14} className="text-gray-400" />
    </div>
    <div className="p-2 flex flex-col gap-1.5">
      {[
        { text: 'Goldwaschpfanne', done: true },
        { text: 'Schaufel & Sieb', done: true },
        { text: 'Gummistiefel', done: false },
        { text: 'Proviant einpacken', done: false },
        { text: 'GPS Gerät laden', done: false },
      ].map((item, i) => (
        <motion.div
          key={item.text}
          className={`flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm border ${item.done ? 'opacity-50 border-transparent' : 'border-gray-100'}`}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: item.done ? 0.5 : 1 }}
          transition={{ delay: 0.3 + i * 0.12 }}
        >
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${item.done ? 'bg-[#d4a843] border-[#d4a843]' : 'border-gray-300'}`}>
            {item.done && <Check size={10} className="text-white" strokeWidth={3} />}
          </div>
          <span className={`text-[9px] font-medium flex-1 ${item.done ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.text}</span>
          <Trash2 size={10} className="text-gray-200" />
        </motion.div>
      ))}
    </div>
    <div className="p-2 bg-white border-t border-gray-200 mt-auto">
      <div className="flex gap-2">
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[7px] text-gray-400">Neue Aufgabe...</div>
        <div className="bg-[#d4a843] rounded-lg px-2 py-1.5 flex items-center justify-center">
          <Plus size={12} className="text-white" />
        </div>
      </div>
    </div>
  </IllustrationCard>
);

const SPARKLE_POSITIONS = [
  { top: '25%', left: '15%', duration: 2.5, size: 14 },
  { top: '30%', left: '75%', duration: 3.2, size: 16 },
  { top: '55%', left: '20%', duration: 2.8, size: 12 },
  { top: '45%', left: '65%', duration: 3.5, size: 18 },
  { top: '65%', left: '45%', duration: 2.2, size: 13 },
  { top: '35%', left: '50%', duration: 3.0, size: 15 },
];

const FinishIllustration = () => (
  <IllustrationCard>
    <MiniHeader />
    <div className="relative flex-1" style={{ height: '160px' }}>
      <MapLines />
      <GPSBtn />
      <MarkerPin color="#EAB308" x="15%" y="15%" label="Fundort 1" />
      <MarkerPin color="#3B82F6" x="50%" y="30%" label="Fundort 2" />
      <MarkerPin color="#EAB308" x="30%" y="55%" label="Fundort 3" />
      <MarkerPin color="#DC2626" x="70%" y="20%" />
      <MarkerPin color="#EAB308" x="10%" y="45%" />
      <BottomBar />
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="text-5xl"
          animate={{ scale: [1, 1.15, 1], rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          ⛏️
        </motion.div>
      </motion.div>
      {SPARKLE_POSITIONS.map((sp, i) => (
        <motion.div
          key={i}
          className="absolute text-yellow-400"
          style={{ top: sp.top, left: sp.left }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            y: [0, -8, 0]
          }}
          transition={{ repeat: Infinity, duration: sp.duration, delay: i * 0.3 }}
        >
          <Sparkles size={sp.size} />
        </motion.div>
      ))}
    </div>
  </IllustrationCard>
);

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Willkommen!',
    description: 'Die Goldsucher App ist dein digitaler Begleiter beim Goldwaschen. Markiere Fundorte auf der Karte, bewerte sie, füge Fotos hinzu und behalte den Überblick über deine Expeditionen.',
    illustration: <WelcomeIllustration />,
  },
  {
    title: 'Karte & Navigation',
    description: 'Die Karte ist das Herzstück der App. Über den Button unten rechts wechselst du zwischen Satellit, Gelände und Standard-Ansicht. Der Crosshair-Button oben rechts zentriert die Karte auf deinen GPS-Standort.',
    illustration: <MapNavIllustration />,
  },
  {
    title: 'Ort hinzufügen',
    description: 'Tippe auf den goldenen + Button unten in der Mitte oder direkt auf die Karte, um einen neuen Fundort zu markieren. Der Wizard führt dich dann Schritt für Schritt durch den Prozess.',
    illustration: <AddLocationIllustration />,
  },
  {
    title: 'Kategorisieren & Bewerten',
    description: 'Im Wizard vergibst du eine Kategorie (Goldhöffig, Interessant, Nicht goldhöffig), eine Sterne-Bewertung und kannst Fotos sowie Notizen hinzufügen.',
    illustration: <WizardIllustration />,
  },
  {
    title: 'Hamburger-Menü',
    description: 'Unten links findest du das Hamburger-Menü. Tippe darauf und es klappen drei Optionen auf: Orte (Fundortliste), Ebenen (Layer & Filter) und To-Do (Ausrüstungsliste).',
    illustration: <LeftMenuOpenIllustration />,
  },
  {
    title: 'Ortsliste',
    description: 'Über "Orte" im Hamburger-Menü öffnest du die Liste aller Fundorte. Suche, filtere nach Kategorie und sortiere nach Datum, Name oder Gold-Rating.',
    illustration: <LocationListIllustration />,
  },
  {
    title: 'Ausrüstungsliste',
    description: 'Über "To-Do" im Hamburger-Menü erreichst du die Ausrüstungsliste. Hake erledigte Punkte ab – die Liste wird automatisch mit der Cloud synchronisiert.',
    illustration: <TodoIllustration />,
  },
  {
    title: 'Fertig!',
    description: 'Du kennst jetzt alle wichtigen Funktionen der Goldsucher App. Viel Erfolg beim Goldsuchen – möge jeder Fluss ein wenig Gold für dich bereithalten!',
    illustration: <FinishIllustration />,
  },
];

interface TutorialViewProps {
  onClose: () => void;
}

export const TutorialView: React.FC<TutorialViewProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const step = TUTORIAL_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;

  const goNext = () => {
    if (isLast) {
      onClose();
      return;
    }
    setDirection(1);
    setCurrentStep(prev => prev + 1);
  };

  const goBack = () => {
    if (isFirst) return;
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex flex-col gap-3 p-1"
          >
            {step.illustration}
            <div>
              <h2 className="text-lg font-bold text-brand-text mb-1">{step.title}</h2>
              <p className="text-sm text-brand-textSec leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="shrink-0 pt-3 pb-1 flex flex-col gap-3">
        {!isLast && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-xs text-brand-textSec hover:text-brand-gold font-medium transition-colors px-2 py-1"
            >
              Überspringen
            </button>
          </div>
        )}

        <div className="flex justify-center gap-1.5">
          {TUTORIAL_STEPS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentStep ? 1 : -1);
                setCurrentStep(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStep
                  ? 'w-6 bg-brand-gold'
                  : idx < currentStep
                  ? 'w-2 bg-brand-gold/40'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3">
          {!isFirst && (
            <button
              onClick={goBack}
              className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-brand-textSec font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Zurück
            </button>
          )}
          <button
            onClick={goNext}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] ${
              isLast
                ? 'bg-brand-gold text-brand-text hover:bg-yellow-600'
                : 'bg-brand-accent text-white hover:bg-brand-accent/90'
            }`}
          >
            {isLast ? (
              <>
                <Sparkles size={18} />
                Los geht's!
              </>
            ) : (
              <>
                Weiter
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
