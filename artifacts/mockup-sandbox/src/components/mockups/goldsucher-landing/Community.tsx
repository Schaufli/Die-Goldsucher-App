import React from "react";
import { 
  Map, 
  MapPin, 
  Filter, 
  Tags, 
  ListTodo, 
  WifiOff, 
  Layers, 
  List, 
  Star,
  Users,
  Flame,
  ArrowRight,
  CheckCircle2,
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Community() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A3F35] font-sans selection:bg-[#E27D60] selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E8DCC4] px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-[#E27D60]">
            <Flame className="w-8 h-8 fill-current" />
            <span className="text-2xl font-bold tracking-tight text-[#3E332A]">Die Goldsucher App</span>
          </div>
          <div className="hidden md:flex gap-8 text-[#6B5A4B] font-medium">
            <a href="#features" className="hover:text-[#E27D60] transition-colors">Funktionen</a>
            <a href="#community" className="hover:text-[#E27D60] transition-colors">Community</a>
            <a href="#about" className="hover:text-[#E27D60] transition-colors">Unsere Mission</a>
          </div>
          <Button className="bg-[#E27D60] hover:bg-[#C96B4E] text-white rounded-full px-6 shadow-sm">
            Kostenlos starten
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#F4E9D8] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 z-0" />
        
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-[#F4E9D8] text-[#E27D60] px-4 py-2 rounded-full font-medium text-sm">
              <Heart className="w-4 h-4 fill-current" />
              <span>Von Goldsuchern, für Goldsucher</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.1] text-[#3E332A]">
              Deine <span className="text-[#E27D60]">Leidenschaft</span>,<br />
              deine Fundorte,<br />
              <span className="text-[#D4AF37]">unsere App.</span>
            </h1>
            
            <p className="text-xl text-[#6B5A4B] leading-relaxed max-w-lg">
              Teile das Lagerfeuer-Gefühl auch digital. Organisiere deine Claims, bewerte deine Funde und behalte den Überblick – mit der App, die deine Sprache spricht.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="bg-[#E27D60] hover:bg-[#C96B4E] text-white rounded-full text-lg h-14 px-8 shadow-lg shadow-[#E27D60]/20">
                Jetzt Claim abstecken
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="border-[#E8DCC4] text-[#6B5A4B] hover:bg-[#F4E9D8] rounded-full text-lg h-14 px-8">
                Mehr erfahren
              </Button>
            </div>
            
            <div className="flex items-center gap-4 pt-4 text-[#8A7966] text-sm font-medium">
              <div className="flex -space-x-2">
                <img src="/__mockup/images/goldsucher-avatar-1.png" alt="User" className="w-8 h-8 rounded-full border-2 border-[#FDFBF7]" />
                <img src="/__mockup/images/goldsucher-avatar-2.png" alt="User" className="w-8 h-8 rounded-full border-2 border-[#FDFBF7]" />
                <div className="w-8 h-8 rounded-full border-2 border-[#FDFBF7] bg-[#D4AF37] text-white flex items-center justify-center text-xs">+</div>
              </div>
              <span>Schließe dich hunderten Wäschern in Deutschland an</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#E27D60]/20 to-[#D4AF37]/20 rounded-[2rem] transform rotate-3 scale-105" />
            <img 
              src="/__mockup/images/goldsucher-hero-community.png" 
              alt="Goldsucher am Lagerfeuer" 
              className="relative rounded-[2rem] shadow-2xl object-cover w-full aspect-[4/3] border-4 border-white"
            />
            
            {/* Floating Element */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-[#E8DCC4] flex items-center gap-4 animate-bounce">
              <div className="bg-[#FFF8E7] p-3 rounded-full text-[#D4AF37]">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <p className="text-xs text-[#8A7966] font-medium uppercase tracking-wider">Neuer Fund</p>
                <p className="font-bold text-[#3E332A]">Isar-Biegung Nord</p>
                <div className="flex text-[#D4AF37] mt-1">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 text-gray-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section id="features" className="py-24 bg-white px-6 border-y border-[#E8DCC4]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#3E332A] mb-4">Dein digitales Logbuch</h2>
            <p className="text-lg text-[#6B5A4B]">Alles, was du am Wasser brauchst. Gemacht für die Praxis, wenn die Hände nass und die Vorfreude groß ist.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="w-8 h-8" />,
                title: "Interaktive Karte",
                desc: "Markiere deine Spots. Kategorisiere sie als 'Interessant', 'Goldhöffig' oder 'Nicht goldhöffig'. Füge Notizen, Fotos und eine 1-5 Sterne Bewertung für den Goldgehalt hinzu."
              },
              {
                icon: <Filter className="w-8 h-8" />,
                title: "Intelligente Filterung",
                desc: "Finde genau das, was du suchst. Kombiniere Filter wie 'Zeige goldhöffige Spots im Raum Dresden, die nicht zu Pauls Claim gehören'. Volle Kontrolle über deine Daten."
              },
              {
                icon: <Tags className="w-8 h-8" />,
                title: "Eigene Kategorien",
                desc: "Jeder Goldsucher organisiert sich anders. Erstelle eigene Ebenen und Kategorien ('Raum Dresden', 'Pauls Claim'), um deine Fundorte perfekt zu strukturieren."
              }
            ].map((feat, i) => (
              <Card key={i} className="bg-[#FDFBF7] border-[#E8DCC4] shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-8 px-6 pb-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF5EE] text-[#E27D60] flex items-center justify-center mb-6">
                    {feat.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#3E332A] mb-3">{feat.title}</h3>
                  <p className="text-[#6B5A4B] leading-relaxed">{feat.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Section / Testimonial */}
      <section id="community" className="py-24 px-6 bg-[#F4E9D8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <img 
              src="/__mockup/images/goldsucher-community-feature.png" 
              alt="Goldwaschen Gemeinschaft" 
              className="rounded-3xl shadow-xl w-full border-4 border-white transform -rotate-2"
            />
          </div>
          <div className="space-y-6">
            <QuoteIcon className="w-12 h-12 text-[#E27D60] opacity-50" />
            <h2 className="text-3xl font-bold text-[#3E332A] leading-tight">
              "Endlich eine App, die versteht, worauf es am Bach wirklich ankommt."
            </h2>
            <p className="text-lg text-[#6B5A4B] italic">
              Ich suchte jahrelang nach einer Möglichkeit, meine Claims an der Elbe vernünftig zu dokumentieren. Mit den eigenen Kategorien und dem Offline-Modus ist diese App jetzt mein wichtigstes Werkzeug neben der Pfanne.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <img src="/__mockup/images/goldsucher-avatar-1.png" alt="Klaus" className="w-14 h-14 rounded-full border-2 border-white shadow-sm" />
              <div>
                <p className="font-bold text-[#3E332A]">Klaus M.</p>
                <p className="text-[#8A7966] text-sm">Goldsucher aus Sachsen</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Features list */}
      <section className="py-24 px-6 bg-white border-b border-[#E8DCC4]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#3E332A] mb-4">Weitere Werkzeuge im Rucksack</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: <WifiOff />, title: "100% Offlinefähig", desc: "Kein Netz im tiefen Wald? Kein Problem. Die App funktioniert komplett offline." },
              { icon: <Layers />, title: "3 Kartentypen", desc: "Wechsle zwischen Straßenkarte, Satellit oder Reliefkarte mit Höhenlinien." },
              { icon: <ListTodo />, title: "To-Do-Listen", desc: "Checklisten fürs Equipment oder Aufgaben wie 'Blacksand auswaschen'." },
              { icon: <List />, title: "Ortsliste", desc: "Durchsuche und sortiere alle deine Fundorte nach Name, Datum oder Rating." }
            ].map((feat, i) => (
              <div key={i} className="flex gap-4 p-6 rounded-2xl bg-[#FDFBF7] border border-[#E8DCC4]">
                <div className="text-[#D4AF37] flex-shrink-0 mt-1">{feat.icon}</div>
                <div>
                  <h4 className="font-bold text-[#3E332A] text-lg mb-1">{feat.title}</h4>
                  <p className="text-[#6B5A4B] text-sm leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#3E332A]" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10 space-y-8">
          <Flame className="w-16 h-16 text-[#E27D60] fill-current mx-auto" />
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Bereit für den nächsten <span className="text-[#D4AF37]">Goldrausch?</span>
          </h2>
          <p className="text-xl text-[#D0C4B4] max-w-xl mx-auto">
            Tritt der Gemeinschaft bei und bringe Ordnung in deine Goldsuche. Kostenlos starten und sofort loslegen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="bg-[#E27D60] hover:bg-[#C96B4E] text-white rounded-full text-lg h-14 px-10">
              App kostenlos nutzen
            </Button>
          </div>
          <p className="text-[#8A7966] text-sm pt-4">Keine Kreditkarte erforderlich • Sofortiger Zugriff</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2A221C] text-[#8A7966] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-white">
            <Flame className="w-6 h-6 text-[#E27D60] fill-current" />
            <span className="font-bold tracking-tight text-lg">Die Goldsucher App</span>
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Impressum</a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-[#D4AF37] transition-colors">Kontakt</a>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Von Goldsuchern, für Goldsucher.</p>
        </div>
      </footer>
    </div>
  );
}

function QuoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}
