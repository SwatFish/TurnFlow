# Airspace Pulse – UI/UX & Feature Changes Log (Codex Specification)

Dit document beschrijft alle UI/UX en functionele aanpassingen die zijn doorgevoerd op de bestaande **Airspace Pulse** React + TypeScript frontend, inclusief specificaties, componenthiërarchie, design tokens en gedrag voor gebruik in OpenAI Codex of verdere AI-gestuurde ontwikkeling.

---

## 1. Doel & Design Philosophy

- **Map-first Situational Awareness:** Geïnspireerd door EFB (Electronic Flight Bag) en ATC tooling (Garmin Pilot, ForeFlight, Flightradar24).
- **Professionele Donkere Cockpit-omgeving:** Geen marketinghero's, felle gradients of decoratieve elementen. Donkere achtergronden (`#0b1620`, `#09131d`) met functionele neon/monitorkleuren (cyaan, groen, amber, signaalrood).
- **Tabulaire Datadichtheid:** Tabulaire numerieke weergaven (`font-variant-numeric: tabular-nums`) voor hoogte, snelheid, coördinaten en afstanden om scanbaarheid te maximaliseren.
- **Minimale Architecturale Impact:** Props, componentnamen en de bestaande uni-directionele datastroom zijn intact gehouden; alle opmaak is ondergebracht in colocated CSS en CSS-variabelen in `src/styles.css`.

---

## 2. Overzicht van Gewijzigde Bestanden

| Bestand | Wijziging |
|---|---|
| `src/App.css` & `src/App.tsx` | Compactere sidebar (372px breed), live indicator dot in kopbalk, traffic counter kopregel, responsive layout. |
| `src/components/AircraftStatus/` | Statuspil met gepulseerde laad-indicator en statusdot (groen = live, blauw = laden, rood = fout). |
| `src/components/AirportContext/` | EFB Runway Card met ICAO badge, afstandsindicator, dynamische baansamenvatting en METAR/TAF weersectie. |
| `src/components/AircraftList/` | Compacte trafficlijst met tabulaire telemetry (`ALT · GS`), callsign-focus en gestroomlijnde selectiestatus. |
| `src/components/AircraftDetails/` | Gestructureerde operationele infokaart met tweekoloms `dl`-raster en ICAO24-header. |
| `src/components/AircraftMap/AircraftMap.*` | Dark mode map integratie, sweep-loop lifecycle, interactieve klikdetectie op runways. |
| `src/components/AircraftMap/RunwayOverlay.tsx` | Nieuwe modal/overlay kaart voor baanspecificaties bij aanklikken op de kaart (ESC & close-button ondersteuning). |
| `src/components/AircraftMap/runwayLayers.ts` | Multi-layer rendering (gloed, donkere rand, kernlijn, sweep-animatie met `line-progress`, centerline tekstlabels). |
| `src/components/AircraftMap/aircraftLayers.ts` | Vluchtsporen met cyaan gloedlaag en zachte staartvervaging via MapLibre expressie-interpolatie. |
| `src/components/AircraftMap/mapStyle.ts` | Overgeschakeld van `bright` naar `https://tiles.openfreemap.org/styles/dark`. |
| `src/api/airports.ts` | Typen & mock providers toegevoegd voor METAR, TAF en `flightCategory` (`VFR`, `MVFR`, `IFR`, `LIFR`). |
| `src/api/aircraft.ts` | Dynamische mock-verplaatsing op basis van heading & groundspeed zodat trails live opbouwen. |
| `src/hooks/useAirportContext.ts` | Uitbreiding met `weather` opvraag- en foutafhandeling synchroon aan de geselecteerde airport. |
| `src/styles.css` | Design tokens voor runway status, runway sweep, panels en trail kleuren. |

---

## 3. Componentenspecificaties voor Codex

### A. App Shell & Sidebar (`src/App.tsx`, `src/App.css`)
- **Layout:** Grid met vaste panelbreedte `minmax(320px, 372px)` en kaartpaneel `1fr`.
- **Status dot:** `.app-title-dot` (8px cirkel, `#4ade80`, box-shadow gloed) naast de titel *Airspace Pulse*.
- **Traffic Counter:** Kopregel boven de lijst toont `TRAFFIC` + `${features.length} targets`.

### B. Weer & METAR/TAF Integratie (`AirportContext.tsx`)
- **Flight Category Badge:**
  - `VFR`: Groen (`rgba(74, 222, 128, 0.16)`, tekst `#4ade80`)
  - `MVFR`: Blauw/cyaan (`rgba(56, 189, 248, 0.16)`, tekst `#7dd3fc`)
  - `IFR`: Rood (`rgba(248, 113, 113, 0.16)`, tekst `#f87171`)
  - `LIFR`: Magenta (`rgba(217, 70, 239, 0.16)`, tekst `#e879f9`)
- **Ruwe Berichten:** Weergegeven in monospaced lettertype (`ui-monospace, monospace`, 11px) met duidelijke labels `METAR` en `TAF`.

### C. Map & Runway Rendering (`AircraftMap.tsx`, `runwayLayers.ts`)
- **Dark Vector Style:** Kaartstijl ingesteld op OpenFreeMap dark style.
- **Runway Layers:**
  1. `airport-runway-glow`: Lijnbreedte 14px, blur 6px, half-transparante kleur (#38bdf8 of gesloten #ef4444).
  2. `airport-runway-casing`: 7px donkere omlijning (#020a12) voor hoog contrast tegen de ondergrond.
  3. `airport-runway-highlight`: 3.5px heldere kernlijn (#7dd3fc).
  4. `airport-runway-sweep`: Dynamische `line-gradient` geanimeerd via `requestAnimationFrame` met fallback voor `prefers-reduced-motion`.
  5. `airport-runway-label`: Noto Sans Bold symbol-layer met `symbol-placement: line` voor baanidentificaties (bijv. `01 / 19`).
  6. `airport-runway-hit`: Onzichtbare 22px interactieve buffer voor trefzekere muiskliks en pointer cursors.
- **Runway Overlay (`RunwayOverlay.tsx`):**
  - Toont vliegveld ICAO, baannummers, status (Open / Closed), lengte, breedte, ondergrond en verlichtingsstatus.
  - Sluitbaar via ESC of de kruisknop.

### D. Flight Trails (`aircraftLayers.ts`, `src/styles.css`)
- **Trail Gradiënt:**
  - 0.0 (staart): Transparant
  - 0.2: 15% cyaandekking
  - 0.6: 50% cyaandekking
  - 1.0 (vliegtuigkop): Volledig cyaan `#38bdf8`
- **Glow Layer:** 8px brede onderliggende blur-laag (`line-blur: 5px`) die meebeweegt.

---

## 4. Instructies voor Codex / AI Prompting
Als je dit project verder wilt uitbreiden in Codex, geef de AI dan de volgende richtlijnen mee:
1. *Behoud de colocated CSS-aanpak en dark cockpit esthetiek (geen Tailwind utility rommel over de componenten heen).*
2. *Gebruik de design tokens uit `src/styles.css` (`--runway-open`, `--runway-glow`, `--trail-color`, etc.).*
3. *Houd kaartlagen gescheiden in dedicated modules onder `src/components/AircraftMap/`.*
4. *Houd numerieke telemetrie altijd op `font-variant-numeric: tabular-nums`.*
