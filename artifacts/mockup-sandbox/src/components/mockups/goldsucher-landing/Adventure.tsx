import React, { useState, useEffect } from "react";
import { 
  Map, 
  MapPin, 
  Filter, 
  ListTodo, 
  WifiOff, 
  Layers, 
  List, 
  ChevronRight, 
  Star,
  Mountain,
  Compass,
  ArrowRight
} from "lucide-react";

export function Adventure() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-amber-500/30 selection:text-stone-900">
      {/* Navbar */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled 
            ? "bg-stone-900/90 backdrop-blur-md py-4 shadow-lg" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Compass className={`w-8 h-8 ${isScrolled ? "text-amber-500" : "text-amber-400"}`} />
            <span className={`text-xl font-serif font-bold tracking-wide ${isScrolled ? "text-white" : "text-white"}`}>
              GOLDSUCHER
            </span>
          </div>
          <div className="hidden md:flex gap-8 items-center">
            <a href="#features" className="text-white hover:text-amber-400 transition-colors font-medium text-sm tracking-widest uppercase">Expedition</a>
            <a href="#ausrüstung" className="text-white hover:text-amber-400 transition-colors font-medium text-sm tracking-widest uppercase">Ausrüstung</a>
            <button className="bg-amber-500 hover:bg-amber-600 text-stone-900 px-6 py-2 rounded font-bold transition-all hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              App Herunterladen
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/__mockup/images/goldsucher-hero.png" 
            alt="Winding river in a dark, lush German forest" 
            className="w-full h-full object-cover"
          />
          {/* Gradients to blend image into background */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#FDFBF7] via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-stone-900/40 backdrop-blur-sm mb-6">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-amber-400 text-sm font-semibold tracking-wider uppercase">Der digitale Begleiter für Pioniere</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-6 drop-shadow-lg">
              Dein nächstes <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-600">
                Gold-Abenteuer
              </span> <br/>
              wartet.
            </h1>
            <p className="text-lg md:text-xl text-stone-200 mb-10 leading-relaxed font-light max-w-xl">
              Entdecke die verborgenen Schätze deutscher Flüsse und Wälder. Markiere Fundorte, plane Expeditionen und dokumentiere deine Erfolge tief in der Natur – selbst ohne Netz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-amber-500 hover:bg-amber-600 text-stone-900 px-8 py-4 rounded font-bold text-lg transition-all hover:scale-105 shadow-[0_4px_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 group">
                Jetzt Expedition Starten
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-stone-800/60 hover:bg-stone-800 backdrop-blur-md text-white border border-stone-600 px-8 py-4 rounded font-bold text-lg transition-all flex items-center justify-center gap-2">
                Mehr Erfahren
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features (Map & Filters) */}
      <section id="features" className="py-24 bg-[#FDFBF7]">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Mountain className="w-12 h-12 text-stone-800 mx-auto mb-6" />
            <h2 className="text-4xl font-serif font-bold text-stone-900 mb-6">
              Dein digitales Feldtagebuch & Karte
            </h2>
            <p className="text-xl text-stone-600 font-light">
              Die Goldsucher App kombiniert klassische Entdecker-Methoden mit modernster Kartentechnologie. Behalte jeden vielversprechenden Ort im Blick.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div className="relative group">
              <div className="absolute inset-0 bg-amber-500/20 rounded-2xl rotate-3 scale-105 transition-transform group-hover:rotate-6"></div>
              <img 
                src="/__mockup/images/goldsucher-map.png" 
                alt="Vintage map with compass" 
                className="relative rounded-2xl shadow-2xl object-cover w-full aspect-[4/3] grayscale-[20%] sepia-[10%] group-hover:grayscale-0 transition-all duration-500"
              />
              {/* UI overlay mockup */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-stone-200 w-64 transform transition-transform group-hover:-translate-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">Isar-Biegung Nord</h4>
                    <p className="text-xs text-stone-500">Goldhöffig</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4].map(i => <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />)}
                  <Star className="w-3 h-3 text-stone-300 fill-stone-300" />
                </div>
                <p className="text-xs text-stone-600">Gute Fließgeschwindigkeit. Erstes Waschgold gefunden!</p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-stone-900 flex items-center justify-center mt-1">
                  <Map className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-3 font-serif">Interaktive Fundort-Karte</h3>
                  <p className="text-stone-600 leading-relaxed">
                    Markiere jeden Ort auf der Karte. Klassifiziere nach: "Interessant", "Goldhöffig" oder "Nicht goldhöffig". Vergib 1-5 Sterne für den Goldgehalt und füge deine Beweisfotos und Notizen direkt hinzu.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-stone-900 flex items-center justify-center mt-1">
                  <Filter className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-3 font-serif">Intelligente Filterung</h3>
                  <p className="text-stone-600 leading-relaxed">
                    Finde genau das, was du suchst. Kombiniere Filter wie "Zeige goldhöffige Spots im Raum Dresden, die nicht zu Pauls Claim gehören." Dein Claim, deine Regeln.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-stone-900 flex items-center justify-center mt-1">
                  <Layers className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-stone-900 mb-3 font-serif">Eigene Kategorien erstellen</h3>
                  <p className="text-stone-600 leading-relaxed">
                    Bist du im "Raum Nürnberg" unterwegs? Erstelle eigene Layer-Kategorien, um deine Fundorte so zu organisieren, wie es für dich Sinn macht.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Features (Journal & Offline) */}
      <section id="ausrüstung" className="py-24 bg-stone-900 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            {Array.from({length: 20}).map((_, i) => (
              <path key={i} d={`M 0 ${i*5} Q 50 ${i*5 + 10} 100 ${i*5}`} fill="none" stroke="currentColor" strokeWidth="0.5" />
            ))}
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 md:order-1 space-y-12">
              <h2 className="text-4xl font-serif font-bold text-white mb-8">
                Gebaut für die Wildnis
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="bg-stone-800/50 border border-stone-700 p-6 rounded-xl hover:bg-stone-800 transition-colors">
                  <WifiOff className="w-8 h-8 text-amber-500 mb-4" />
                  <h4 className="text-xl font-bold mb-2">100% Offlinefähig</h4>
                  <p className="text-stone-400 text-sm">
                    Tief im Wald gibt es keinen Empfang. Deine Karten und Notizen sind lokal gespeichert und funktionieren überall in der Natur.
                  </p>
                </div>

                <div className="bg-stone-800/50 border border-stone-700 p-6 rounded-xl hover:bg-stone-800 transition-colors">
                  <ListTodo className="w-8 h-8 text-amber-500 mb-4" />
                  <h4 className="text-xl font-bold mb-2">Check- & To-Do-Listen</h4>
                  <p className="text-stone-400 text-sm">
                    "Blacksand auswaschen", "Neue Schaufel bestellen". Vergiss nie wieder wichtige Ausrüstung oder Aufgaben für deinen nächsten Trip.
                  </p>
                </div>

                <div className="bg-stone-800/50 border border-stone-700 p-6 rounded-xl hover:bg-stone-800 transition-colors">
                  <Map className="w-8 h-8 text-amber-500 mb-4" />
                  <h4 className="text-xl font-bold mb-2">3 Kartentypen</h4>
                  <p className="text-stone-400 text-sm">
                    Wechsle nahtlos zwischen Straßenkarte, Satellitenbild und Reliefkarte mit detaillierten Höhenlinien zur perfekten Terrain-Analyse.
                  </p>
                </div>

                <div className="bg-stone-800/50 border border-stone-700 p-6 rounded-xl hover:bg-stone-800 transition-colors">
                  <List className="w-8 h-8 text-amber-500 mb-4" />
                  <h4 className="text-xl font-bold mb-2">Smarte Ortsliste</h4>
                  <p className="text-stone-400 text-sm">
                    Durchsuche all deine gespeicherten Orte. Sortiere nach Name, Erstellungsdatum oder dem wertvollen Gold-Rating.
                  </p>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2 relative">
              <div className="absolute inset-0 bg-stone-800 rounded-2xl -rotate-3 scale-105"></div>
              <img 
                src="/__mockup/images/goldsucher-journal.png" 
                alt="Leather field journal with gold flakes" 
                className="relative rounded-2xl shadow-2xl object-cover w-full aspect-[3/4]"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Testimonial / Quote */}
      <section className="py-24 bg-[#EBE5D9] text-stone-900 border-y border-stone-300">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <Star className="w-8 h-8 text-amber-600 mx-auto mb-6 opacity-50" />
          <blockquote className="text-2xl md:text-4xl font-serif font-medium leading-relaxed mb-8 text-stone-800">
            "Die Natur offenbart ihre Schätze nur dem, der weiß, wo er suchen muss. Mit der Goldsucher App überlasse ich das Finden nicht mehr dem Zufall."
          </blockquote>
          <p className="text-stone-600 uppercase tracking-widest font-bold text-sm">Dein Begleiter am Flussufer</p>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-stone-900 pt-24 pb-12 relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
              Bereit für den ersten <span className="text-amber-500">Fund?</span>
            </h2>
            <p className="text-xl text-stone-400 mb-10 max-w-2xl mx-auto">
              Lade dir die Goldsucher App herunter, packe deine Pfanne und Schaufel ein, und starte deine Expedition in die Natur.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-amber-500 hover:bg-amber-600 text-stone-900 px-10 py-4 rounded font-bold text-lg transition-all hover:scale-105 shadow-[0_4px_20px_rgba(245,158,11,0.4)]">
                App Kostenlos Testen
              </button>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-stone-400">
              <Compass className="w-6 h-6 text-stone-500" />
              <span className="font-serif font-bold tracking-wide">GOLDSUCHER</span>
            </div>
            <div className="flex gap-6 text-sm text-stone-500">
              <a href="#" className="hover:text-amber-400 transition-colors">Impressum</a>
              <a href="#" className="hover:text-amber-400 transition-colors">Datenschutz</a>
              <a href="#" className="hover:text-amber-400 transition-colors">AGB</a>
            </div>
            <p className="text-stone-600 text-sm">
              © {new Date().getFullYear()} Goldsucher App. Für echte Entdecker.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
