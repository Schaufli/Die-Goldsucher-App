import React from "react";
import { 
  MapPin, 
  Filter, 
  Layers, 
  CheckSquare, 
  WifiOff, 
  Map, 
  List, 
  ChevronRight, 
  Star,
  Compass,
  Database,
  BarChart,
  ShieldCheck,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Professional() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-[#C9A646] selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-[#C9A646]" />
            <span className="text-xl font-semibold tracking-tight text-white">
              Goldsucher<span className="text-[#C9A646]">.</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Funktionen</a>
            <a href="#workflow" className="hover:text-white transition-colors">Workflow</a>
            <a href="#pricing" className="hover:text-white transition-colors">Preise</a>
          </div>
          <Button className="bg-[#C9A646] hover:bg-[#b39139] text-[#0F172A] font-semibold">
            Kostenlos starten
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:pt-40 md:pb-32 relative overflow-hidden">
        {/* Abstract background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C9A646]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <Badge className="mb-6 bg-slate-800/50 text-[#C9A646] border-[#C9A646]/30 hover:bg-slate-800/80">
            Version 2.0 ist da
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            Organisiere deine Goldsuche <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A646] to-[#E5C77A]">
              wie ein Profi.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto font-light">
            Die datengetriebene Plattform für ernsthafte Goldsucher. Erfasse Fundorte, filtere intelligent und maximiere deine Ausbeute mit präzisen Werkzeugen.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="h-14 px-8 bg-[#C9A646] hover:bg-[#b39139] text-[#0F172A] font-bold text-lg w-full sm:w-auto">
              Jetzt System einrichten
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white w-full sm:w-auto">
              Live Demo ansehen
            </Button>
          </div>

          {/* Hero Mockup */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-xl border border-slate-800 bg-slate-900/50 shadow-2xl shadow-black/50 overflow-hidden backdrop-blur-sm">
            <div className="h-8 border-b border-slate-800 flex items-center px-4 gap-2 bg-slate-900">
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
              <div className="w-3 h-3 rounded-full bg-slate-700" />
            </div>
            <img 
              src="/__mockup/images/goldsucher-hero.png" 
              alt="Goldsucher App Dashboard" 
              className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity"
            />
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section id="features" className="py-24 bg-slate-900/50 border-y border-slate-800">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Das Kontrollzentrum für deine Claims</h2>
            <p className="text-slate-400 max-w-2xl">Präzise Werkzeuge, um deine Prospektion systematisch auszuwerten und neue Hotspots zu identifizieren.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 text-[#C9A646]">
                  <MapPin className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-white">Interaktive Fundort-Datenbank</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4">
                  Kategorisiere Orte als "Interessant", "Goldhöffig" oder "Nicht goldhöffig". Bewerte den Goldgehalt mit einem 5-Sterne-System und hänge Beweisfotos an.
                </p>
                <img src="/__mockup/images/goldsucher-map.png" alt="Map Interface" className="rounded-md border border-slate-800 w-full" />
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 text-[#C9A646]">
                  <Filter className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-white">Intelligente Filterung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4">
                  Kombiniere komplexe Logik: "Zeige goldhöffige Orte im Raum Dresden, die nicht zu Pauls Claim gehören." Finde genau das, was du suchst.
                </p>
                <img src="/__mockup/images/goldsucher-filter.png" alt="Filter Interface" className="rounded-md border border-slate-800 w-full" />
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-slate-800 flex items-center justify-center mb-4 text-[#C9A646]">
                  <Layers className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-white">Eigene Kategorien</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400">
                  Strukturiere deine Daten nach deinem eigenen System. Erstelle Layer für geologische Formationen, Flussabschnitte oder Zugänglichkeit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Secondary Features list */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Für den Einsatz in der Natur konzipiert</h2>
              <p className="text-slate-400 mb-8 text-lg">
                Ein professionelles Tool darf dich nicht im Stich lassen, wenn du fernab der Zivilisation bist.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 text-[#C9A646]">
                    <WifiOff className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">100% Offlinefähig</h3>
                    <p className="text-slate-400">Kein Netz im Tal? Kein Problem. Karten und Daten werden lokal zwischengespeichert und synchronisiert, sobald du wieder online bist.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="mt-1 text-[#C9A646]">
                    <Map className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">3 Profi-Kartentypen</h3>
                    <p className="text-slate-400">Wechsle nahtlos zwischen Straßenkarte, hochauflösendem Satellitenbild und topografischer Karte mit Höhenlinien zur Geländeanalyse.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 text-[#C9A646]">
                    <CheckSquare className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Integrierte Workflows</h3>
                    <p className="text-slate-400">Hinterlege Checklisten für Equipment oder To-Dos wie "Blacksand auswaschen" direkt bei den jeweiligen Fundorten.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="mt-1 text-[#C9A646]">
                    <List className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Strukturierte Ortsliste</h3>
                    <p className="text-slate-400">Verliere nie den Überblick über hunderte Spots. Sortiere nach Name, Erstellungsdatum oder Gold-Rating für effizientes Datenmanagement.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Abstract structural graphic */}
              <div className="aspect-square rounded-2xl border border-slate-800 bg-slate-900/50 p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-900/50 to-transparent" />
                
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <span className="text-slate-400 font-mono text-sm">DATA_SYNC_STATUS</span>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">ONLINE</Badge>
                  </div>
                  
                  <div className="space-y-4 my-auto">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                        <Database className="h-5 w-5 text-[#C9A646]" />
                        <div className="flex-1">
                          <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-[#C9A646]" style={{ width: `${Math.random() * 40 + 60}%` }} />
                          </div>
                        </div>
                        <span className="text-slate-400 font-mono text-xs">{(Math.random() * 10).toFixed(2)} MB</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                    <span className="text-slate-500 text-sm">Letzter Sync: Gerade eben</span>
                    <Download className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#C9A646] opacity-[0.03]" />
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <ShieldCheck className="h-16 w-16 text-[#C9A646] mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Bereit für professionelles Prospecting?
          </h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Hör auf, deine besten Fundorte in unübersichtlichen Notizbüchern zu verlieren. Wechsle jetzt auf die datengetriebene Lösung für ernsthafte Goldwäscher.
          </p>
          <Button size="lg" className="h-16 px-10 bg-[#C9A646] hover:bg-[#b39139] text-[#0F172A] font-bold text-xl rounded-full">
            Account erstellen & App laden
            <ChevronRight className="ml-2 h-6 w-6" />
          </Button>
          <p className="mt-6 text-sm text-slate-500">
            Kostenlos für die ersten 50 Fundorte. Keine Kreditkarte erforderlich.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Compass className="h-5 w-5 text-[#C9A646]" />
            <span className="text-lg font-semibold tracking-tight text-white">
              Goldsucher<span className="text-[#C9A646]">.</span>
            </span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Goldsucher App. Entwickelt für die harte Realität am Fluss.
          </p>
        </div>
      </footer>
    </div>
  );
}
