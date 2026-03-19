import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronRight, BookOpen, MapPin, Hammer, Info, ExternalLink, ArrowLeft } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  icon: any;
  content: string;
  link: string;
}

const ARTICLES: Article[] = [
  {
    id: 'de-gold',
    title: 'Goldsuche in Deutschland',
    category: 'Grundlagen',
    icon: MapPin,
    content: 'In Deutschland gibt es viele Regionen, in denen man Gold finden kann. Zu den bekanntesten gehören der Rhein, die Elbe, die Isar und der Thüringer Wald. Gold kommt hier meist als feiner Goldstaub oder kleine Flitter vor.',
    link: 'https://www.goldsax-goldwaschen.de/blogs/goldsucher-wissen/goldsuche-in-deutschland-wo-kann-man-in-deutschland-gold-finden'
  },
  {
    id: 'wo-waschen',
    title: 'Wo kann man Goldwaschen?',
    category: 'Praxis',
    icon: BookOpen,
    content: 'Die besten Stellen sind oft an Innenkurven von Flüssen, hinter großen Steinen oder an Stellen, an denen die Fließgeschwindigkeit des Wassers plötzlich abnimmt. Hier lagern sich schwere Materialien wie Gold ab.',
    link: 'https://www.goldsax-goldwaschen.de/blogs/goldsucher-wissen/wo-goldwaschen'
  },
  {
    id: 'rinne',
    title: 'Die Goldwaschrinne verstehen',
    category: 'Ausrüstung',
    icon: Hammer,
    content: 'Eine Goldwaschrinne nutzt die Schwerkraft. Durch Riffel und Matten wird das schwere Gold eingefangen, während der leichtere Sand weggespült wird. Die richtige Neigung und Wassergeschwindigkeit sind entscheidend.',
    link: 'https://www.goldsax-goldwaschen.de/blogs/goldsucher-wissen/die-goldwaschrinne-verstehen'
  },
  {
    id: 'pfanne',
    title: 'Goldwaschpfanne richtig nutzen',
    category: 'Ausrüstung',
    icon: Hammer,
    content: 'Die Pfanne ist das wichtigste Werkzeug. Durch kreisende Bewegungen unter Wasser setzt sich das Gold am Boden ab. Dann wird der obere Sand vorsichtig weggespült, bis nur noch das Konzentrat übrig bleibt.',
    link: 'https://www.goldsax-goldwaschen.de/blogs/goldsucher-wissen/goldwaschpfanne-richtig-nutzen'
  },
  {
    id: 'recht',
    title: 'Ist Goldsuchen erlaubt?',
    category: 'Rechtliches',
    icon: Info,
    content: 'In Deutschland ist das Goldwaschen meist erlaubt, solange es hobbymäßig und ohne schwere Maschinen betrieben wird. Es gibt jedoch Naturschutzgebiete und regionale Unterschiede. Informiere dich immer vorab!',
    link: 'https://www.goldsax-goldwaschen.de/blogs/goldsucher-wissen/ist-in-deutschland-goldsuchen-erlaubt'
  }
];

export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const filteredArticles = ARTICLES.filter(article => 
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-brand-bg">
      <AnimatePresence mode="wait">
        {!selectedArticle ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col gap-4"
          >
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text"
                placeholder="Wissen durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20 outline-none text-sm bg-white transition-all shadow-sm"
              />
            </div>

            {/* Categories/Articles */}
            <div className="flex flex-col gap-2">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm border border-transparent hover:border-brand-gold/30 hover:shadow-md transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-brand-bgAlt group-hover:bg-brand-gold/10 text-brand-textSec group-hover:text-brand-gold transition-colors">
                    <article.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-brand-gold uppercase tracking-wider">{article.category}</p>
                    <h3 className="font-bold text-brand-text">{article.title}</h3>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-brand-gold transition-colors" />
                </button>
              ))}
              
              {filteredArticles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-brand-textSec italic">Keine Artikel zu "{searchQuery}" gefunden.</p>
                </div>
              )}
            </div>

            {/* External Link Card */}
            <a 
              href="https://www.goldsax-goldwaschen.de/blogs/goldsucher-wissen" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 p-4 rounded-xl bg-brand-accent text-white flex items-center justify-between shadow-lg hover:bg-brand-accent/90 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ExternalLink size={20} className="text-brand-gold" />
                <div>
                  <p className="font-bold text-sm">Vollständiger Blog</p>
                  <p className="text-[10px] opacity-80">Alle Artikel auf Goldsax.de lesen</p>
                </div>
              </div>
              <ChevronRight size={18} />
            </a>
          </motion.div>
        ) : (
          <motion.div 
            key="article"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <button 
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-2 text-brand-gold font-bold text-sm mb-6 hover:translate-x-[-4px] transition-transform"
              >
                <ArrowLeft size={16} />
                Zurück zur Übersicht
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-brand-bgAlt text-brand-gold">
                  <selectedArticle.icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-gold uppercase tracking-widest">{selectedArticle.category}</p>
                  <h2 className="text-2xl font-bold text-brand-text leading-tight">{selectedArticle.title}</h2>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-brand-textSec leading-relaxed mb-8">
                {selectedArticle.content}
              </div>

              <a 
                href={selectedArticle.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-brand-bgAlt text-brand-text font-bold rounded-xl border border-brand-gold/20 hover:bg-brand-gold/10 transition-colors"
              >
                <ExternalLink size={18} className="text-brand-gold" />
                Vollständigen Artikel lesen
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
