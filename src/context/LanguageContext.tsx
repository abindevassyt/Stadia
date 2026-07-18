import React, { createContext, useContext, useState, useEffect } from 'react';

export type LanguageCode = 'en' | 'de' | 'es' | 'fr';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  localizeProtocols: (venueId: string, protocols: Array<{ topic: string; category: string; protocol: string }>) => Array<{ topic: string; category: string; protocol: string }>;
}

// Global dictionary map for offline localization UI and custom playbook instruction sets
export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Navbar / Common Tabs
    'nav.ai_hub': 'Smart AI Assistant',
    'nav.vcp': 'Arena Setup & Sensors',
    'nav.fan': 'Fan Portal & Map',
    'nav.ar_nav': '3D Arena Guide',
    'nav.staff': 'Staff & Volunteers',
    'nav.forms_hub': 'Reports & Surveys',
    'nav.cmms': 'Equipment & Sensor Health',
    'nav.executive': 'Executive Dashboard',
    'nav.settings': 'Settings',
    'nav.validation_hub': 'Diagnostics & Test Center',
    'nav.welcome': 'Welcome',
    'nav.logout': 'Logout',

    // Venue Selector / Header
    'header.active_venue': 'Active Venue',
    'header.switch_venue': 'Switch Venue',
    'header.active_persona': 'Clearance Role',

    // RAG Playbook (in Staff Interface)
    'rag.title': 'Staff Help Manual (Ask AI)',
    'rag.desc': 'Ask questions to instantly search the stadium guidelines, emergency paths, and volunteer safety procedures.',
    'rag.placeholder': 'Query emergency routes, spill protocol...',
    'rag.query_btn': 'Search',
    'rag.source_match': 'Database Source matched',
    'rag.output': 'RAG Output',
    'rag.response_time': 'Response',
    'rag.empty_state': 'Submit queries to extract geofenced procedures translated instantly.',
    'rag.standard': 'Search Method: Instant Digital Playbook Match',
    'rag.sla': 'Target SLA: <400ms Response',
    'rag.suggest_1': 'What is the emergency evacuation route protocol?',
    'rag.suggest_2': 'How to override turnstiles on power disruption?',
    'rag.suggest_3': 'What to do during lightning thunderstorm delays?',

    // Settings Interface
    'settings.title': 'Settings',
    'settings.subtitle': 'Adjust app display options, screen reader voice, and alert preferences.',
    'settings.theme': 'Visual Theme',
    'settings.language': 'Application Language',
    'settings.select_language': 'Select Language',
    'settings.alert_sounds': 'Audible Alarm Sounds',
    'settings.alert_sounds_desc': 'Play a warning beep when sensor issues or leaks are found',
    'settings.refresh_rate': 'Auto-Update Interval',
    'settings.refresh_rate_desc': 'How often the system refreshes sensor readings (seconds)',
    'settings.font_size': 'Text Size / Accessibility Scaling',
    'settings.font_size_desc': 'Make buttons and labels larger for easier viewing',
    'settings.geofence': 'Automatic Check-in Range',
    'settings.geofence_desc': 'How close you need to be to automatically register location',
    'settings.currency': 'Displayed Currency',
    'settings.screen_reader': 'Screen Reader Mode',
    'settings.screen_reader_desc': 'Toggles real-time text-to-speech for critical UI labels, navigation buttons, and status announcements.',

    // AI Advisory Suite
    'ai.advisor': 'Smart AI Guide',
    'ai.advisor_desc': 'Powered by Gemini to answer your questions and assist with your visit',
    'ai.wayfinding': 'Quiet & Accessible Directions',
    'ai.wayfinding_desc': 'Find stroller-friendly, wheelchair-accessible, and less crowded routes',
    'ai.transport': 'Train & Bus Planner',
    'ai.transport_desc': 'Check local transit schedules and plan your journey home',
    'ai.sustainability': 'Eco-Friendly Power Monitor',
    'ai.sustainability_desc': 'Track stadium energy savings and green metrics',
    'ai.multilingual': 'Universal Language Translator',
    'ai.multilingual_desc': 'Translate any message or safety protocol into other languages',
    'ai.ops_brief': 'Daily Event Summary',
    'ai.ops_brief_desc': 'Key stadium notes and quick updates for management',

    // Ingestion / VCP
    'vcp.title': 'Arena Setup & Sensors',
    'vcp.subtitle': 'Customize arena layout, register equipment sensors, and run stadium simulations.',

    // Fan Interface
    'fan.title': 'Fan & Guest Portal',
    'fan.subtitle': 'Explore the interactive map, view real-time crowd heatmaps, and find stadium facilities.',

    // AR Arena Wayfinder
    'arnav.title': '3D Arena Guide',
    'arnav.subtitle': 'Step-by-step directions and virtual path guides to find your seat.',

    // CMMS Facilities SCADA
    'cmms.title': 'Equipment & Sensor Health',
    'cmms.subtitle': 'Monitor stadium temperature sensors, track backup battery levels, and manage tool checkouts.',

    // Executive Portal
    'executive.title': 'Executive Dashboard',
    'executive.subtitle': 'Check total ticket sales, concession revenue, active security cases, and crowd counts.',

    // Common
    'common.search': 'Search',
    'common.status': 'Status',
    'common.active': 'Active',
    'common.back': 'Back',
  },
  de: {
    // Navbar / Common Tabs
    'nav.ai_hub': 'Intelligenter KI-Assistent',
    'nav.vcp': 'Arena-Setup & Sensoren',
    'nav.fan': 'Fan-Portal & Karte',
    'nav.ar_nav': '3D-Arena-Wegweiser',
    'nav.staff': 'Mitarbeiter & Helfer',
    'nav.forms_hub': 'Berichte & Umfragen',
    'nav.cmms': 'Geräte- & Sensorgesundheit',
    'nav.executive': 'Manager-Dashboard',
    'nav.settings': 'Einstellungen',
    'nav.validation_hub': 'Validierungs- & Testcenter',
    'nav.welcome': 'Willkommen',
    'nav.logout': 'Abmelden',

    // Venue Selector / Header
    'header.active_venue': 'Aktiver Veranstaltungsort',
    'header.switch_venue': 'Ort wechseln',
    'header.active_persona': 'Freigaberolle',

    // RAG Playbook (in Staff Interface)
    'rag.title': 'Handbuch für Mitarbeiter (KI fragen)',
    'rag.desc': 'Stellen Sie Fragen, um Stadionrichtlinien, Notfallwege und Sicherheitsverfahren für Freiwillige sofort zu durchsuchen.',
    'rag.placeholder': 'Notfallrouten abfragen, Verschüttungsprotokoll...',
    'rag.query_btn': 'Suchen',
    'rag.source_match': 'Datenbankquelle übereingestimmt',
    'rag.output': 'RAG-Ausgabe',
    'rag.response_time': 'Antwort',
    'rag.empty_state': 'Senden Sie Anfragen, um geofenced Verfahren sofort übersetzt zu extrahieren.',
    'rag.standard': 'RAG-Standard: Vector-Match-Hybrid-Einbettungen',
    'rag.sla': 'Ziel-SLA: <400ms Antwortzeit',
    'rag.suggest_1': 'Wie lautet das Notfallevakuierungs-Protokoll?',
    'rag.suggest_2': 'Wie werden Drehkreuze bei Stromausfall überbrückt?',
    'rag.suggest_3': 'Was tun bei Gewitterverzögerungen durch Blitzeinschlag?',

    // Settings Interface
    'settings.title': 'Einstellungen',
    'settings.subtitle': 'Passen Sie die Anzeigeoptionen der App, die Sprachausgabe des Bildschirmlesers und die Alarmeinstellungen an.',
    'settings.theme': 'Visuelles Thema',
    'settings.language': 'Anwendungssprache',
    'settings.select_language': 'Sprache auswählen',
    'settings.alert_sounds': 'Hörbare Alarmtöne',
    'settings.alert_sounds_desc': 'Spielen Sie einen Warnton ab, wenn Sensorprobleme oder Undichtigkeiten festgestellt werden',
    'settings.refresh_rate': 'Automatisches Update-Intervall',
    'settings.refresh_rate_desc': 'Wie oft das System die Sensorwerte aktualisiert (Sekunden)',
    'settings.font_size': 'Textgröße / Barrierefreiheitsskalierung',
    'settings.font_size_desc': 'Machen Sie Schaltflächen und Beschriftungen zur einfacheren Anzeige größer',
    'settings.geofence': 'Automatischer Check-in-Bereich',
    'settings.geofence_desc': 'Wie nah Sie sein müssen, um den Standort automatisch zu registrieren',
    'settings.currency': 'Finanzielle Metrik-Währung',
    'settings.screen_reader': 'Bildschirmvorlese-Modus',
    'settings.screen_reader_desc': 'Aktiviert die Text-zu-Sprache-Ausgabe für wichtige Steuerelemente, Navigationsschaltflächen und Statusmeldungen.',

    // AI Advisory Suite
    'ai.advisor': 'Intelligenter KI-Wegweiser',
    'ai.advisor_desc': 'Unterstützt von Gemini, um Ihre Fragen zu beantworten und Ihnen bei Ihrem Besuch zu helfen',
    'ai.wayfinding': 'Ruhige & Barrierefreie Wege',
    'ai.wayfinding_desc': 'Finden Sie kinderwagenfreundliche, rollstuhlgerechte und weniger überfüllte Routen',
    'ai.transport': 'Bahn- & Busplaner',
    'ai.transport_desc': 'Überprüfen Sie die lokalen Fahrpläne und planen Sie Ihre Heimreise',
    'ai.sustainability': 'Umweltfreundlicher Strommonitor',
    'ai.sustainability_desc': 'Verfolgen Sie die Energieeinsparungen des Stadions und grüne Kennzahlen',
    'ai.multilingual': 'Universeller Sprachübersetzer',
    'ai.multilingual_desc': 'Übersetzen Sie jede Nachricht oder jedes Sicherheitsprotokoll in andere Sprachen',
    'ai.ops_brief': 'Tägliche Zusammenfassung der Veranstaltung',
    'ai.ops_brief_desc': 'Wichtige Stadionnotizen und schnelle Updates für das Management',

    // Ingestion / VCP
    'vcp.title': 'Arena-Setup & Sensoren',
    'vcp.subtitle': 'Passen Sie das Layout der Arena an, registrieren Sie Gerätesensoren und führen Sie Stadionsimulationen durch.',

    // Fan Interface
    'fan.title': 'Fan- & Gästeportal',
    'fan.subtitle': 'Erkunden Sie die interaktive Karte, sehen Sie Live-Crowd-Dichtekarten und finden Sie Stadioneinrichtungen.',

    // AR Arena Wayfinder
    'arnav.title': '3D-Arena-Wegweiser',
    'arnav.subtitle': 'Schritt-für-Schritt-Anleitungen und virtuelle Pfadführer, um Ihren Sitzplatz zu finden.',

    // CMMS Facilities SCADA
    'cmms.title': 'Geräte- & Sensorgesundheit',
    'cmms.subtitle': 'Überwachen Sie die Temperatursensoren des Stadions, verfolgen Sie die Batteriekapazität und verwalten Sie Werkzeugausleihen.',

    // Executive Portal
    'executive.title': 'Manager-Dashboard',
    'executive.subtitle': 'Überprüfen Sie den Ticketverkauf, die Einnahmen aus Konzessionen, aktive Sicherheitsfälle und die Besucherzahlen.',

    // Common
    'common.search': 'Suchen',
    'common.status': 'Status',
    'common.active': 'Aktiv',
    'common.back': 'Zurück',

    // Localized Venue Playbooks
    'wembley_emergency evacuation': 'Inaktivem Alarmzustand den Einlass über Drehkreuze stoppen. Sekundäre Notausgänge A1-A4 sofort öffnen. Sektoren-Freiwilligenführer (SVL) anweisen, Menschenmengen über gut sichtbare Fluchtwege zu leiten. VIP-Aufzug nur für medizinisches Personal reservieren.',
    'wembley_plumbing spill protocol': 'Wenn der Umwelt-/Abwasser-Sensor einen Überlauf von >85 % registriert, senden Sie mit Trockensaugern ausgestattete Reinigungskräfte (ECT). Toilettenventile geofencen und den Block innerhalb von 90 Sekunden isolieren. Sektoren-Freiwilligenführer benachrichtigen, um Fans zu den Toilettenblöcken Concourse Nord umzuleiten.',
    'wembley_turnstile power interruption': 'Bei einem Ausfall des Drehkreuz-Netzwerks müssen die Ticket-Controller (GATC) in den lokalen Cache-Modus wechseln. Ein Offline-BLE-Handshake autorisiert Ticket-Hashes offline. Elektro- und AV-Systemingenieure müssen am Drehkreuz Gate A den Edge-Switch-Controller neu starten.',
    'wembley_dietary pre-ordering issues': 'Wenn die POS-Synchronisationsgeschwindigkeit unter 95 % fällt, müssen die Pop-up-Koordinatoren digitale Offline-Wallet-Tokens akzeptieren. Der Bestandsprüfer (ILC) muss den Bestand manuell auf dem Sektoren-Klemmbrett protokollieren.',
    'allianz_emergency evacuation': 'Alle Rolltreppen und Kaskadentreppen-Richtringmotoren auf Abwärts-Fluchtweg schalten. Evakuierung durch die Außenmembran-Schnelltore einleiten.',
    'allianz_membrane panel pressure alert': 'Bei starkem Wind oder extremen thermischen Bedingungen müssen MEP-Techniker die Membrandruckkammern überwachen. Automatische Entlüftungsdichtungen aktivieren sich; schlägt die manuelle Übersteuerung fehl, leiten Sie den Strom zum Hilfskompressor 2 um.',
    'metlife_severe weather evacuation': 'Bei Blitzerkennung im Umkreis von 8 Meilen muss die Einsatzleitung der Veranstalter (POL) eine Warnung über die Haupt-PA-Anlage veranlassen. Alle Tribünenzuschauer in die vollständig geschlossenen Innenbereiche leiten. Sicherheitsbereich in der Nähe der Drehkreuze aufrechterhalten.',

    // --- Dynamic DOM Translation Additions ---
    'Create Attendee Digital Wallet': 'Digitales Ticket-Wallet erstellen',
    'Sign In to Your Digital Ticket': 'Mit digitalem Ticket anmelden',
    'Attendee Access': 'Zuschauer-Zugang',
    'Secure authentication portal': 'Sicheres Anmeldeportal',
    'Register your cryptographic ticket details to activate in-seat pre-ordering.': 'Registrieren Sie Ihre Ticketdetails, um Vorbestellungen am Sitzplatz zu aktivieren.',
    'Access your ticket stubs, geofenced concessions, and live venue maps.': 'Greifen Sie auf Ihre Ticketbelege, geofenced Verkaufsstände und Live-Pläne zu.',
    'Security Handshake Policy': 'Sicherheits-Handshake-Richtlinie',
    'Identity Isolation Policy': 'Richtlinie zur Identitätsisolierung',
    'These external SSO providers are strictly locked to the Fan/Attendee role. Corporate and Operational clearance levels are restricted to direct PIN enclaves.': 'Diese externen SSO-Anbieter sind streng auf die Rolle Fan/Zuschauer beschränkt. Betriebliche Freigaben erfordern eine PIN-Eingabe.',
    'Enterprise & Operational Command Portal': 'Unternehmens- & Betriebs-Kommando-Portal',
    'Staff security PIN gateway': 'Sicherheits-PIN-Gateway für Mitarbeiter',
    'Operational Access': 'Betrieblicher Zugang',
    'Staff accounts are managed strictly within regional directories. Secure access is granted after checking the employee roster and verifying your encrypted passcode PIN.': 'Mitarbeiterkonten werden streng im Dienstplan verwaltet. Der Zugriff wird nach Überprüfung der PIN gewährt.',
    'Roster Security Note': 'Hinweis zur Dienstplansicherheit',
    'New ground volunteers must register in person at Command Center Gate B. The system prohibits public account self-provisioning on operational modules to prevent leakage.': 'Neue freiwillige Helfer müssen sich persönlich an Tor B registrieren. Eine Online-Registrierung ist nicht möglich.',
    'Access PIN': 'Zugangs-PIN',
    'Roster Profile': 'Dienstplan-Profil',
    'Sign In': 'Anmelden',
    'Enter your 4-digit security passcode PIN': 'Geben Sie Ihre 4-stellige Sicherheits-PIN ein',
    'Authentication system': 'Authentifizierungssystem',
    'Roster Security': 'Dienstplansicherheit',
    'Security Handshake': 'Sicherheits-Handshake',
    'PIN is required': 'PIN ist erforderlich',
    'PIN must be 4 digits': 'PIN muss 4-stellig sein',
    'Invalid PIN. Access Denied.': 'Ungültige PIN. Zugriff verweigert.',
    'Access Granted!': 'Zugriff gewährt!',
    'Authentication Failed. Check PIN.': 'Authentifizierung fehlgeschlagen. PIN prüfen.',
    'Equipment & Sensor Health': 'Geräte- & Sensorgesundheit',
    'Sensor anomaly detected!': 'Sensoranomalie erkannt!',
    'Critical Water Main Leak!': 'Kritischer Wasserleitungsschaden!',
    'Battery power critical!': 'Batterieleistung kritisch!',
    'Sensor ID': 'Sensor-ID',
    'Status': 'Status',
    'Value': 'Wert',
    'Operational': 'Betriebsbereit',
    'Anomaly Detected': 'Anomalie erkannt',
    'Register New Sensor': 'Neuen Sensor registrieren',
    'Simulation Controls': 'Simulationssteuerungen',
    'Trigger Leak Simulation': 'Lecksimulation auslösen',
    'Mute Alarms': 'Alarme stummschalten',
    'Active Alarms': 'Aktive Alarme',
    'Tool Checkout System': 'Werkzeug-Ausleihsystem',
    'Checkout Tool': 'Werkzeug ausleihen',
    'Check-in Tool': 'Werkzeug zurückgeben',
    'Assigned Engineer': 'Zugewiesener Techniker',
    'Battery Level': 'Batterieladung',
    'Water Pressure': 'Wasserdruck',
    'CO2 Level': 'CO2-Gehalt',
    'Ambient Temp': 'Umgebungstemp.',
    'Gas Sub-sensor': 'Gassub-Sensor',
    'Flow Rate': 'Durchflussrate',
    'Trigger Anomaly': 'Anomalie auslösen',
    'Resolve Anomaly': 'Anomalie beheben',
    'Sensor Name': 'Sensorname',
    'Sensor Type': 'Sensortyp',
    'Threshold Limit': 'Schwellenwert',
    'Save Sensor': 'Sensor speichern',
    'Add New Sensor': 'Neuen Sensor hinzufügen',
    'Executive Dashboard': 'Manager-Dashboard',
    'Total Concession Revenue': 'Verkaufsumsatz Gesamt',
    'Total Ticket Sales': 'Ticketverkäufe Gesamt',
    'Active Security Cases': 'Aktive Sicherheitsfälle',
    'Total Crowd Count': 'Besucherzahl Gesamt',
    'Predictive Concession Revenue': 'Prognostizierter Verkaufsumsatz',
    'Predictive Ticket Sales': 'Prognostizierte Ticketverkäufe',
    'Deploy Mass Alert Notification': 'Massenwarnung senden',
    'Security Logs': 'Sicherheitsprotokolle',
    'Case ID': 'Fall-ID',
    'Severity': 'Schweregrad',
    'SLA Target': 'SLA-Ziel',
    'Emergency Response Needed': 'Notfalleinsatz erforderlich',
    'Broadcast Message': 'Rundfunknachricht',
    'Send Broadcast': 'Senden',
    'Warning: High crowd bottleneck at Sector C!': 'Warnung: Hoher Besucherengpass im Sektor C!',
    'Fan & Guest Portal': 'Fan- & Gästeportal',
    'Fan Dashboard': 'Fan-Dashboard',
    'Concessions pre-ordering': 'Verkaufsstände-Vorbestellung',
    'Geofence Check-in': 'Geofence-Check-in',
    'Digital Ticket Stub': 'Digitaler Ticketbeleg',
    'Interactive Stadium Map': 'Interaktive Stadionkarte',
    'Crowd Density Map': 'Besucherdichtekarte',
    'Active Ticket Code': 'Aktiver Ticketcode',
    'Row': 'Reihe',
    'Seat': 'Sitzplatz',
    'Check In Automatically': 'Automatisch einchecken',
    'Current Concourse Concessions': 'Verkaufsstände im Concourse',
    'Express Lane Active': 'Express-Spur aktiv',
    'Order Now': 'Jetzt bestellen',
    'Confirm Purchase': 'Kauf bestätigen',
    'Pre-order Concessions': 'Vorbestellen',
    'Order submitted successfully!': 'Bestellung erfolgreich übermittelt!',
    '3D Arena Guide': '3D-Arena-Wegweiser',
    'Step-by-step directions': 'Schritt-für-Schritt-Anleitung',
    'AR Compass': 'AR-Kompass',
    'Virtual Path': 'Virtueller Pfad',
    'Current Location': 'Aktueller Standort',
    'Target Seat': 'Zielsitzplatz',
    'Start Navigating': 'Navigation starten',
    'Recalibrate GPS': 'GPS neukalibrieren',
    'Spatial Lock Active': 'Räumliche Sperre aktiv',
    'Remaining Distance': 'Verbleibende Entfernung',
    'Estimated Arrival': 'Voraussichtliche Ankunft',
    'Stop Navigation': 'Navigation stoppen',
    'Calibrating Spatial Compass...': 'Räumlicher Kompass wird kalibriert...',
    'Reports & Surveys': 'Berichte & Umfragen',
    'Incident Report Form': 'Vorfallbericht-Formular',
    'Fan Satisfaction Survey': 'Zufriedenheitsumfrage',
    'Submit Incident': 'Vorfall melden',
    'Report Spill': 'Verschüttung melden',
    'Report Security issue': 'Sicherheitsproblem melden',
    'Your feedback helps us make your visit better.': 'Ihr Feedback hilft uns, Ihren Besuch zu verbessern.',
    'Submit Feedback': 'Feedback absenden',
    'Feedback Submitted!': 'Feedback übermittelt!',
    'Incident Registered!': 'Vorfall registriert!',
    'Arena Setup & Ingestion': 'Arena-Setup & Ingestion',
    'Arena Layout Ingestion': 'Arena-Layout einlesen',
    'Physical Layout Simulator': 'Physischer Layout-Simulator',
    'Digital Twin Node Ingestion': 'Digital Twin Node Ingestion',
    'Simulate Arena Capacity': 'Arenakapazität simulieren',
    'Sensor Feed Ingest': 'Sensor-Feed einlesen',
    'Ingestion Log': 'Einleseprotokoll',
    'Stadia Voice Assistant': 'Stadia Sprachassistent',
    'Tap to Speak': 'Zum Sprechen tippen',
    'Listening...': 'Hören...',
    'Processing...': 'Verarbeiten...',
    'Co-pilot standby': 'Co-pilot Standby',
    'Voice Dispatch: ECT Field Work Order': 'Sprachdispatch: ECT-Arbeitsauftrag',
    'AUTOPREP FOR ENVIRONMENTAL CLEANLINESS TECHNICIAN': 'AUTOMATISCHE VORBEREITUNG FÜR ECT',
    'Work Order Title:': 'Arbeitsauftrag Titel:',
    'Detailed Instructions:': 'Detaillierte Anweisungen:',
    'Geofence Location:': 'Geofence-Standort:',
    'Priority Level:': 'Prioritätsstufe:',
    'Mapped Asset ID:': 'Zugeordnete Asset-ID:',
    'Assigned Squad Role:': 'Zugewiesene Teamrolle:',
    'Authorize & Push Work Order': 'Arbeitsauftrag autorisieren',
    'Cancel': 'Abbrechen',
    'Active Roster Profile:': 'Aktives Dienstplan-Profil:',
    'Stadia OS Menu': 'Stadia OS Menü',
    'Zero-Trust Mobile Access': 'Zero-Trust mobiler Zugriff',
    'Change View': 'Ansicht ändern',
    'Active view:': 'Aktive Ansicht:',
    'Close menu': 'Menü schließen',
    'Close': 'Schließen',
    'Save': 'Speichern',
    'Edit': 'Bearbeiten',
    'Delete': 'Löschen',
    'Clear': 'Löschen',
    'Error': 'Fehler',
    'Success': 'Erfolg',
    'Alert': 'Alarm',
    'Warning': 'Warnung',
    'Unknown': 'Unbekannt',
    'Access Denied': 'Zugriff verweigert',
    'Clearance Level Insufficient': 'Sicherheitsstufe unzureichend',
  },
  es: {
    // Navbar / Common Tabs
    'nav.ai_hub': 'Asistente de IA Inteligente',
    'nav.vcp': 'Configuración de Arena y Sensores',
    'nav.fan': 'Portal de Aficionados y Mapa',
    'nav.ar_nav': 'Guía 3D de la Arena',
    'nav.staff': 'Personal y Voluntarios',
    'nav.forms_hub': 'Informes y Encuestas',
    'nav.cmms': 'Salud de Equipos y Sensores',
    'nav.executive': 'Panel de Control del Gerente',
    'nav.settings': 'Configuración',
    'nav.validation_hub': 'Centro de Pruebas y Diagnóstico',
    'nav.welcome': 'Bienvenido',
    'nav.logout': 'Cerrar sesión',

    // Venue Selector / Header
    'header.active_venue': 'Sede Activa',
    'header.switch_venue': 'Cambiar de Sede',
    'header.active_persona': 'Rol de Autorización',

    // RAG Playbook (in Staff Interface)
    'rag.title': 'Manual para el Personal (Preguntar a la IA)',
    'rag.desc': 'Haga preguntas para buscar instantáneamente las pautas del estadio, las rutas de emergencia y los procedimientos de seguridad para voluntarios.',
    'rag.placeholder': 'Consultar rutas de emergencia, protocolo de derrames...',
    'rag.query_btn': 'Buscar',
    'rag.source_match': 'Fuente de base de datos coincidente',
    'rag.output': 'Resultado RAG',
    'rag.response_time': 'Respuesta',
    'rag.empty_state': 'Envíe consultas para extraer procedimientos geovallados traducidos al instante.',
    'rag.standard': 'Estándar RAG: Incrustaciones híbridas de coincidencia de vectores',
    'rag.sla': 'SLA objetivo: Respuesta <400ms',
    'rag.suggest_1': '¿Cuál es el protocolo de ruta de evacuación de emergencia?',
    'rag.suggest_2': '¿Cómo anular los torniquetes en caso de corte de energía?',
    'rag.suggest_3': '¿Qué hacer durante los retrasos por tormentas eléctricas?',

    // Settings Interface
    'settings.title': 'Configuración',
    'settings.subtitle': 'Ajuste las opciones de pantalla, la voz del lector de pantalla y las preferencias de alerta.',
    'settings.theme': 'Tema Visual',
    'settings.language': 'Idioma de la Aplicación',
    'settings.select_language': 'Seleccionar Idioma',
    'settings.alert_sounds': 'Sonidos de Alarma Audibles',
    'settings.alert_sounds_desc': 'Reproducir un pitido de advertencia cuando se detecten problemas de sensores o fugas',
    'settings.refresh_rate': 'Intervalo de Actualización',
    'settings.refresh_rate_desc': 'Frecuencia de actualización de las lecturas del sensor (segundos)',
    'settings.font_size': 'Tamaño de Texto / Escala de Accesibilidad',
    'settings.font_size_desc': 'Agrandar botones y etiquetas para facilitar la visualización',
    'settings.geofence': 'Rango de Registro Automático',
    'settings.geofence_desc': 'Distancia requerida para registrar automáticamente la ubicación',
    'settings.currency': 'Moneda para Métricas Financieras',
    'settings.screen_reader': 'Modo Lector de Pantalla',
    'settings.screen_reader_desc': 'Activa la lectura de texto a voz para etiquetas de interfaz críticas, botones de navegación e informes de estado.',

    // AI Advisory Suite
    'ai.advisor': 'Guía Inteligente de IA',
    'ai.advisor_desc': 'Desarrollado por Gemini para responder a sus preguntas y ayudarle con su visita',
    'ai.wayfinding': 'Direcciones Tranquilas y Accesibles',
    'ai.wayfinding_desc': 'Encuentre rutas aptas para cochecitos, accesibles para sillas de ruedas y menos concurridas',
    'ai.transport': 'Planificador de Trenes y Autobuses',
    'ai.transport_desc': 'Consulte los horarios de tránsito locales y planifique su viaje a casa',
    'ai.sustainability': 'Monitor de Energía Ecológica',
    'ai.sustainability_desc': 'Realice un seguimiento del ahorro de energía del estadio y de las métricas ecológicas',
    'ai.multilingual': 'Traductor de Idiomas Universal',
    'ai.multilingual_desc': 'Traduzca cualquier message o protocolo de seguridad a otros idiomas',
    'ai.ops_brief': 'Resumen Diario del Evento',
    'ai.ops_brief_desc': 'Notas clave del estadio y actualizaciones rápidas para la gerencia',

    // Ingestion / VCP
    'vcp.title': 'Configuración de Arena y Sensores',
    'vcp.subtitle': 'Personalice el diseño de la arena, registre los sensores de los equipos y realice simulaciones del estadio.',

    // Fan Interface
    'fan.title': 'Portal de Aficionados y Mapa',
    'fan.subtitle': 'Explore el mapa interactivo, vea mapas de calor de multitudes en tiempo real y encuentre instalaciones del estadio.',

    // AR Arena Wayfinder
    'arnav.title': 'Guía 3D de la Arena',
    'arnav.subtitle': 'Instrucciones paso a paso y guías de rutas virtuales para encontrar su asiento.',

    // CMMS Facilities SCADA
    'cmms.title': 'Salud de Equipos y Sensores',
    'cmms.subtitle': 'Controle los sensores de temperatura del estadio, realice un seguimiento de las baterías y administre los préstamos.',

    // Executive Portal
    'executive.title': 'Panel de Control del Gerente',
    'executive.subtitle': 'Consulte las ventas totales de boletos, ingresos de concesiones, casos de seguridad y asistencia.',

    // Common
    'common.search': 'Buscar',
    'common.status': 'Estado',
    'common.active': 'Activo',
    'common.back': 'Volver',

    // Localized Venue Playbooks
    'wembley_emergency evacuation': 'En caso de alarma activa, detener el ingreso por torniquetes. Abrir las puertas secundarias de emergencia A1-A4 instantáneamente. Dirigir a los Líderes Voluntarios de Sector (SVL) para guiar a las multitudes utilizando pasillos de salida de alta visibilidad. Restringir el ascensor VIP únicamente para personal médico.',
    'wembley_plumbing spill protocol': 'Cuando el sensor ambiental o de plomería registre un desbordamiento superior al 85% de su capacidad, enviar Técnicos de Limpieza Ambiental (ECT) equipados con unidades de aspiración en seco para riesgos. Geocercar las válvulas de los baños e aislar el block en un plazo de 90 segundos. Notificar a los líderes voluntarios del sector para redirigir a los aficionados a los bloques de baños del Concourse Norte.',
    'wembley_turnstile power interruption': 'En caso de fallo en la red de torniquetes, los Controladores de Boletos de Acceso a Puertas (GATC) deben cambiar al modo de caché localizada. Un protocolo de enlace BLE sin conexión autorizará los hashes de boletos de forma desconectada. Los Ingenieros de Sistemas de Bajo Voltaje y AV deben desplegarse en la subestación de la Puerta A para reiniciar el controlador del conmutador perimetral.',
    'wembley_dietary pre-ordering issues': 'Si la velocidad de sincronización de POS cae por debajo del 95%, los coordinadores de tiendas emergentes deben aceptar tokens de billetera digital sin conexión. El empleado de inventario (ILC) debe registrar el inventario manualmente en la tabla portapapeles del sector.',
    'allianz_emergency evacuation': 'Detener todas las escaleras mecánicas y motores de las escaleras de cascada en sentido descendente. Evacuar a través de las puertas rápidas del panel de la membrana exterior.',
    'allianz_membrane panel pressure alert': 'En condiciones extremas de viento o térmicas, los técnicos de MEP deben supervisar las cámaras de presurización de la membrana. Los sellos de ventilación automática funcionarán; si el bypass manual falla, desviar la energía al Compresor Auxiliar 2.',
    'metlife_severe weather evacuation': 'En caso de detección de rayos dentro de un radio de 8 millas, el Enlace de Operaciones del Promotor (POL) debe ordenar una advertencia en el sistema de megafonía principal. Dirigir a todos los espectadores de las gradas hacia pasillos interiores completamente cerrados. Mantener el perímetro de seguridad cerca de los torniquetes.',

    // --- Dynamic DOM Translation Additions ---
    'Create Attendee Digital Wallet': 'Crear billetera digital de asistente',
    'Sign In to Your Digital Ticket': 'Iniciar sesión en su boleto digital',
    'Attendee Access': 'Acceso de asistente',
    'Secure authentication portal': 'Portal de autenticación seguro',
    'Register your cryptographic ticket details to activate in-seat pre-ordering.': 'Registre los detalles criptográficos de su boleto para activar pedidos en el asiento.',
    'Access your ticket stubs, geofenced concessions, and live venue maps.': 'Acceda a sus talones de boletos, puestos geovallados y mapas en vivo.',
    'Security Handshake Policy': 'Política de saludo de seguridad',
    'Identity Isolation Policy': 'Política de aislamiento de identidad',
    'These external SSO providers are strictly locked to the Fan/Attendee role. Corporate and Operational clearance levels are restricted to direct PIN enclaves.': 'SSO externo restringido al rol de Asistente. Accesos corporativos requieren PIN directo.',
    'Enterprise & Operational Command Portal': 'Portal de mando operativo y empresarial',
    'Staff security PIN gateway': 'Pasarela PIN de seguridad del personal',
    'Operational Access': 'Acceso operativo',
    'Staff accounts are managed strictly within regional directories. Secure access is granted after checking the employee roster and verifying your encrypted passcode PIN.': 'Cuentas de personal gestionadas en directorios regionales. Acceso por PIN de la lista.',
    'Roster Security Note': 'Nota de seguridad de la lista',
    'New ground volunteers must register in person at Command Center Gate B. The system prohibits public account self-provisioning on operational modules to prevent leakage.': 'Nuevos voluntarios deben registrarse en persona en la Puerta B. Registro público deshabilitado.',
    'Access PIN': 'PIN de acceso',
    'Roster Profile': 'Perfil de lista',
    'Sign In': 'Iniciar Sesión',
    'Enter your 4-digit security passcode PIN': 'Ingrese su PIN de seguridad de 4 dígitos',
    'Authentication system': 'Sistema de autenticación',
    'Roster Security': 'Seguridad de la lista',
    'Security Handshake': 'Apretón de manos de seguridad',
    'PIN is required': 'PIN requerido',
    'PIN must be 4 digits': 'El PIN debe tener 4 dígitos',
    'Invalid PIN. Access Denied.': 'PIN inválido. Acceso denegado.',
    'Access Granted!': '¡Acceso concedido!',
    'Authentication Failed. Check PIN.': 'Autenticación fallida. Verifique el PIN.',
    'Equipment & Sensor Health': 'Salud de equipos y sensores',
    'Sensor anomaly detected!': '¡Anomalía del sensor detectada!',
    'Critical Water Main Leak!': '¡Fuga de agua crítica en tubería principal!',
    'Battery power critical!': '¡Energía de batería crítica!',
    'Sensor ID': 'ID del sensor',
    'Status': 'Estado',
    'Value': 'Valor',
    'Operational': 'Operativo',
    'Anomaly Detected': 'Anomalía detectada',
    'Register New Sensor': 'Registrar nuevo sensor',
    'Simulation Controls': 'Controles de simulación',
    'Trigger Leak Simulation': 'Simular fuga de agua',
    'Mute Alarms': 'Silenciar alarmas',
    'Active Alarms': 'Alarmas activas',
    'Tool Checkout System': 'Préstamo de herramientas',
    'Checkout Tool': 'Prestar herramienta',
    'Check-in Tool': 'Devolver herramienta',
    'Assigned Engineer': 'Ingeniero asignado',
    'Battery Level': 'Nivel de batería',
    'Water Pressure': 'Presión del agua',
    'CO2 Level': 'Nivel de CO2',
    'Ambient Temp': 'Temp. ambiente',
    'Gas Sub-sensor': 'Subsensor de gas',
    'Flow Rate': 'Tasa de flujo',
    'Trigger Anomaly': 'Activar anomalía',
    'Resolve Anomaly': 'Resolver anomalía',
    'Sensor Name': 'Nombre del sensor',
    'Sensor Type': 'Tipo de sensor',
    'Threshold Limit': 'Límite de umbral',
    'Save Sensor': 'Guardar sensor',
    'Add New Sensor': 'Agregar nuevo sensor',
    'Executive Dashboard': 'Panel de control del gerente',
    'Total Concession Revenue': 'Ingresos de concesiones',
    'Total Ticket Sales': 'Ventas de boletos',
    'Active Security Cases': 'Casos de seguridad activos',
    'Total Crowd Count': 'Recuento de público',
    'Predictive Concession Revenue': 'Ingresos predictivos de puestos',
    'Predictive Ticket Sales': 'Ventas predictivas de boletos',
    'Deploy Mass Alert Notification': 'Enviar alerta masiva',
    'Security Logs': 'Registros de seguridad',
    'Case ID': 'ID del caso',
    'Severity': 'Severidad',
    'SLA Target': 'SLA objetivo',
    'Emergency Response Needed': 'Respuesta de emergencia',
    'Broadcast Message': 'Mensaje de transmisión',
    'Send Broadcast': 'Enviar transmisión',
    'Warning: High crowd bottleneck at Sector C!': '¡Advertencia: cuello de botella de público en Sector C!',
    'Fan & Guest Portal': 'Portal de aficionados y mapa',
    'Fan Dashboard': 'Panel de aficionados',
    'Concessions pre-ordering': 'Pedidos de puestos',
    'Geofence Check-in': 'Registro por geovalla',
    'Digital Ticket Stub': 'Talón de boleto digital',
    'Interactive Stadium Map': 'Mapa interactivo del estadio',
    'Crowd Density Map': 'Mapa de densidad de público',
    'Active Ticket Code': 'Código de boleto activo',
    'Row': 'Fila',
    'Seat': 'Asiento',
    'Check In Automatically': 'Registrarse automáticamente',
    'Current Concourse Concessions': 'Concesiones del vestíbulo',
    'Express Lane Active': 'Carril express activo',
    'Order Now': 'Ordenar ahora',
    'Confirm Purchase': 'Confirmar compra',
    'Pre-order Concessions': 'Pedir por adelantado',
    'Order submitted successfully!': '¡Pedido enviado con éxito!',
    '3D Arena Guide': 'Guía 3D de la arena',
    'Step-by-step directions': 'Direcciones paso a paso',
    'AR Compass': 'Brújula AR',
    'Virtual Path': 'Ruta virtual',
    'Current Location': 'Ubicación actual',
    'Target Seat': 'Asiento de destino',
    'Start Navigating': 'Iniciar navegación',
    'Recalibrate GPS': 'Recalibrar GPS',
    'Spatial Lock Active': 'Bloqueo espacial activo',
    'Remaining Distance': 'Distancia restante',
    'Estimated Arrival': 'Llegada estimada',
    'Stop Navigation': 'Detener navegación',
    'Calibrating Spatial Compass...': 'Calibrando brújula espacial...',
    'Reports & Surveys': 'Informes y encuestas',
    'Incident Report Form': 'Formulario de informe de incidentes',
    'Fan Satisfaction Survey': 'Encuesta de satisfacción del fan',
    'Submit Incident': 'Enviar incidente',
    'Report Spill': 'Informar derrame',
    'Report Security issue': 'Informar problema de seguridad',
    'Your feedback helps us make your visit better.': 'Sus comentarios nos ayudan a mejorar su visita.',
    'Submit Feedback': 'Enviar comentarios',
    'Feedback Submitted!': '¡Comentarios enviados!',
    'Incident Registered!': '¡Incidente registrado!',
    'Arena Setup & Ingestion': 'Configuración de arena e ingesta',
    'Arena Layout Ingestion': 'Ingesta del diseño de la arena',
    'Physical Layout Simulator': 'Simulador de diseño físico',
    'Digital Twin Node Ingestion': 'Ingesta de nodos del gemelo digital',
    'Simulate Arena Capacity': 'Simular capacidad de la arena',
    'Sensor Feed Ingest': 'Ingesta de alimentación de sensores',
    'Ingestion Log': 'Registro de ingesta',
    'Stadia Voice Assistant': 'Asistente de voz de Stadia',
    'Tap to Speak': 'Toque para hablar',
    'Listening...': 'Escuchando...',
    'Processing...': 'Procesando...',
    'Co-pilot standby': 'Copiloto en espera',
    'Voice Dispatch: ECT Field Work Order': 'Despacho de voz: Orden de trabajo ECT',
    'AUTOPREP FOR ENVIRONMENTAL CLEANLINESS TECHNICIAN': 'AUTOPREPARACIÓN PARA TÉCNICO DE LIMPIEZA ECT',
    'Work Order Title:': 'Título de la orden de trabajo:',
    'Detailed Instructions:': 'Instrucciones detalladas:',
    'Geofence Location:': 'Ubicación de geovalla:',
    'Priority Level:': 'Nivel de prioridad:',
    'Mapped Asset ID:': 'ID de activo asignado:',
    'Assigned Squad Role:': 'Rol de escuadrón asignado:',
    'Authorize & Push Work Order': 'Autorizar orden de trabajo',
    'Cancel': 'Cancelar',
    'Active Roster Profile:': 'Perfil de lista activo:',
    'Stadia OS Menu': 'Menú Stadia OS',
    'Zero-Trust Mobile Access': 'Acceso móvil Zero-Trust',
    'Change View': 'Cambiar vista',
    'Active view:': 'Vista activa:',
    'Close menu': 'Cerrar menú',
    'Close': 'Cerrar',
    'Save': 'Guardar',
    'Edit': 'Editar',
    'Delete': 'Eliminar',
    'Clear': 'Borrar',
    'Error': 'Error',
    'Success': 'Éxito',
    'Alert': 'Alerta',
    'Warning': 'Advertencia',
    'Unknown': 'Desconocido',
    'Access Denied': 'Acceso denegado',
    'Clearance Level Insufficient': 'Nivel de autorización insuficiente',
  },
  fr: {
    // Navbar / Common Tabs
    'nav.ai_hub': 'Assistant IA Intelligent',
    'nav.vcp': 'Configuration de l\'Arène et Capteurs',
    'nav.fan': 'Portail Supporters et Carte',
    'nav.ar_nav': 'Guide 3D de l\'Arène',
    'nav.staff': 'Personnel et Bénévoles',
    'nav.forms_hub': 'Rapports et Enquêtes',
    'nav.cmms': 'Santé des Équipements et Capteurs',
    'nav.executive': 'Tableau de Bord du Manager',
    'nav.settings': 'Paramètres',
    'nav.validation_hub': 'Centre de Tests & Diagnostics',
    'nav.welcome': 'Bienvenue',
    'nav.logout': 'Déconnexion',

    // Venue Selector / Header
    'header.active_venue': 'Site Actif',
    'header.switch_venue': 'Changer de Site',
    'header.active_persona': 'Rôle d\'Accès',

    // RAG Playbook (in Staff Interface)
    'rag.title': 'Manuel d\'Aide du Personnel (Demander à l\'IA)',
    'rag.desc': 'Posez des questions pour rechercher instantanément les directives du stade, les itinéraires d\'urgence et les consignes de sécurité.',
    'rag.placeholder': 'Interroger les itinéraires d\'urgence, protocole de déversement...',
    'rag.query_btn': 'Rechercher',
    'rag.source_match': 'Source de base de données correspondante',
    'rag.output': 'Résultat RAG',
    'rag.response_time': 'Réponse',
    'rag.empty_state': 'Soumettez des requêtes pour extraire instantanément des procédures géolocalisées traduites.',
    'rag.standard': 'Norme RAG : Incorporations hybrides de correspondance de vecteurs',
    'rag.sla': 'SLA cible : Réponse < 400ms',
    'rag.suggest_1': 'Quel est le protocole d\'itinéraire d\'évacuation d\'urgence ?',
    'rag.suggest_2': 'Comment contourner les tourniquets en cas de coupure de courant ?',
    'rag.suggest_3': 'Que faire pendant les retards dus aux orages électriques ?',

    // Settings Interface
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Ajustez les options d\'affichage de l\'application, la voix du lecteur d\'écran et les alertes.',
    'settings.theme': 'Thème Visuel',
    'settings.language': 'Langue de l\'Application',
    'settings.select_language': 'Choisir la Langue',
    'settings.alert_sounds': 'Sons d\'Alarme Audibles',
    'settings.alert_sounds_desc': 'Émettre un bip d\'avertissement en cas de problème de capteur ou de fuite détectée',
    'settings.refresh_rate': 'Intervalle de Mise à Jour',
    'settings.refresh_rate_desc': 'Fréquence à laquelle le système actualise les capteurs (secondes)',
    'settings.font_size': 'Taille du Texte / Échelle d\'Accessibilité',
    'settings.font_size_desc': 'Agrandir les boutons et les étiquettes pour une meilleure lecture',
    'settings.geofence': 'Zone d\'Enregistrement Automatique',
    'settings.geofence_desc': 'Distance minimale requise pour enregistrer automatiquement votre position',
    'settings.currency': 'Devise des Métriques Financières',
    'settings.screen_reader': 'Mode Lecteur d\'Écran',
    'settings.screen_reader_desc': 'Active la synthèse vocale en temps réel pour les éléments critiques de l\'interface, boutons et annonces de statut.',

    // AI Advisory Suite
    'ai.advisor': 'Guide Intelligent IA',
    'ai.advisor_desc': 'Propulsé par Gemini pour répondre à vos questions et faciliter votre visite du stade',
    'ai.wayfinding': 'Directions Calmes & Accessibles',
    'ai.wayfinding_desc': 'Trouvez des itinéraires adaptés aux poussettes, fauteuils roulants et moins fréquentés',
    'ai.transport': 'Planificateur de Bus & Train',
    'ai.transport_desc': 'Consultez les horaires de transport locaux et planifiez votre retour',
    'ai.sustainability': 'Moniteur d\'Énergie Écologique',
    'ai.sustainability_desc': 'Suivez les économies d\'énergie et les indicateurs écologiques du stade',
    'ai.multilingual': 'Traducteur Universel',
    'ai.multilingual_desc': 'Traduisez n\'importe quel message ou consigne de sécurité dans une autre langue',
    'ai.ops_brief': 'Résumé Quotidien de l\'Événement',
    'ai.ops_brief_desc': 'Notes clés sur le stade et mises à jour rapides pour la direction',

    // Ingestion / VCP
    'vcp.title': 'Configuration de l\'Arène et Capteurs',
    'vcp.subtitle': 'Personnalisez la disposition de l\'arène, enregistrez les capteurs et lancez des simulations.',

    // Fan Interface
    'fan.title': 'Portail Supporters et Carte',
    'fan.subtitle': 'Explorez la carte interactive, visualisez l\'affluence en temps réel et trouvez les services du stade.',

    // AR Arena Wayfinder
    'arnav.title': 'Guide 3D de l\'Arène',
    'arnav.subtitle': 'Consultez les directions pas-à-pas et des repères visuels pour trouver votre siège.',

    // CMMS Facilities SCADA
    'cmms.title': 'Santé des Équipements et Capteurs',
    'cmms.subtitle': 'Suivez les températures du stade, surveillez la batterie et gérez les prêts de matériel.',

    // Executive Portal
    'executive.title': 'Tableau de Bord du Manager',
    'executive.subtitle': 'Consultez le total des ventes de billets, les revenus des buvettes et les alertes de sécurité.',

    // Common
    'common.search': 'Rechercher',
    'common.status': 'Statut',
    'common.active': 'Actif',
    'common.back': 'Retour',

    // Localized Venue Playbooks
    'wembley_emergency evacuation': 'En cas d\'alarme active, arrêter l\'entrée par les tourniquets. Ouvrir immédiatement les portes d\'urgence secondaires A1-A4. Orienter les chefs de file des bénévoles de secteur (SVL) pour guider la foule en utilisant des couloirs d\'évacuation à haute visibilité. Réserver l\'accessibilité de l\'ascenseur VIP uniquement au personnel médical.',
    'wembley_plumbing spill protocol': 'Lorsqu\'un capteur d\'environnement/plomberie enregistre un trop-plein de capacité > 85 %, dépêcher des techniciens de propreté environnementale (ECT) équipés d\'aspirateurs industriels pour matières dangereuses. Géolocaliser les vannes des toilettes et isoler le bloc en 90 secondes. Informer les chefs de file des bénévoles de secteur pour rediriger les supporters vers les blocs de toilettes du Concourse Nord.',
    'wembley_turnstile power interruption': 'En cas de défaillance du réseau des tourniquets, les contrôleurs de billets d\'accès aux portes (GATC) doivent passer en mode cache local. Une liaison BLE hors ligne autorisera les hachages de billets hors ligne. Les ingénieurs en systèmes basse tension et audiovisuels doivent se déployer sur la sous-station de la porte A pour redémarrer le contrôleur de commutateur de périphérie.',
    'wembley_dietary pre-ordering issues': 'Si la vitesse de synchronisation du point de vente descend en dessous de 95 %, les coordinateurs de points de vente éphémères doivent accepter les jetons de portefeuille numérique hors ligne. Le commis d\'inventaire (ILC) doit consigner les stocks manuellement sur le presse-papiers du secteur.',
    'allianz_emergency evacuation': 'Arrêter tous les escalators et les moteurs des escaliers en cascade pour les orienter vers le bas. Évacuer par les portes rapides des panneaux de la membrane extérieure.',
    'allianz_membrane panel pressure alert': 'En cas de vent fort ou de conditions thermiques extrêmes, les techniciens MEP doivent surveiller les chambres de pressurisation de la membrane. Les joints d\'auto-ventilation fonctionneront ; si la dérivation manuelle échoue, acheminer l\'énergie vers le compresseur auxiliaire 2.',
    'metlife_severe weather evacuation': 'En cas de détection de foudre dans un rayon de 8 miles, la liaison des opérations du promoteur (POL) doit ordonner un avertissement sur la sonorisation principale. Dirigir tous les spectateurs de la tribune vers les halls intérieurs entièrement fermés. Maintenir un périmètre de sécurité à proximité des tourniquets.',

    // --- Dynamic DOM Translation Additions ---
    'Create Attendee Digital Wallet': 'Créer un portefeuille numérique',
    'Sign In to Your Digital Ticket': 'Connexion à votre billet digital',
    'Attendee Access': 'Accès spectateur',
    'Secure authentication portal': 'Portail d\'authentification sécurisé',
    'Register your cryptographic ticket details to activate in-seat pre-ordering.': 'Enregistrez les détails de votre billet cryptographique pour commander à votre place.',
    'Access your ticket stubs, geofenced concessions, and live venue maps.': 'Accédez à vos talons de billets, buvettes géolocalisées et plans du stade.',
    'Security Handshake Policy': 'Politique de liaison de sécurité',
    'Identity Isolation Policy': 'Politique d\'isolation d\'identité',
    'These external SSO providers are strictly locked to the Fan/Attendee role. Corporate and Operational clearance levels are restricted to direct PIN enclaves.': 'SSO externe limité au rôle Supporter. Niveaux d\'accès administratifs sur PIN.',
    'Enterprise & Operational Command Portal': 'Portail opérationnel et d\'entreprise',
    'Staff security PIN gateway': 'Passerelle de sécurité PIN du personnel',
    'Operational Access': 'Accès opérationnel',
    'Staff accounts are managed strictly within regional directories. Secure access is granted after checking the employee roster and verifying your encrypted passcode PIN.': 'Comptes du personnel gérés dans des annuaires locaux. Accès accordé après vérification du PIN.',
    'Roster Security Note': 'Note de sécurité sur l\'effectif',
    'New ground volunteers must register in person at Command Center Gate B. The system prohibits public account self-provisioning on operational modules to prevent leakage.': 'Nouveaux bénévoles doivent s\'enregistrer en personne à la Porte B. Auto-inscription publique interdite.',
    'Access PIN': 'Code PIN d\'accès',
    'Roster Profile': 'Profil de l\'effectif',
    'Sign In': 'Se Connecter',
    'Enter your 4-digit security passcode PIN': 'Saisissez votre code PIN de sécurité à 4 chiffres',
    'Authentication system': 'Système d\'authentification',
    'Roster Security': 'Sécurité des effectifs',
    'Security Handshake': 'Validation de sécurité',
    'PIN is required': 'Le code PIN est requis',
    'PIN must be 4 digits': 'Le code PIN doit comporter 4 chiffres',
    'Invalid PIN. Access Denied.': 'Code PIN invalide. Accès refusé.',
    'Access Granted!': 'Accès accordé !',
    'Authentication Failed. Check PIN.': 'Échec de l\'authentification. Vérifiez le code PIN.',
    'Equipment & Sensor Health': 'Santé des équipements et capteurs',
    'Sensor anomaly detected!': 'Anomalie de capteur détectée !',
    'Critical Water Main Leak!': 'Fuite d\'eau critique de la conduite principale !',
    'Battery power critical!': 'Niveau de batterie critique !',
    'Sensor ID': 'ID Capteur',
    'Status': 'Statut',
    'Value': 'Valeur',
    'Operational': 'Opérationnel',
    'Anomaly Detected': 'Anomalie détectée',
    'Register New Sensor': 'Enregistrer un nouveau capteur',
    'Simulation Controls': 'Contrôles de simulation',
    'Trigger Leak Simulation': 'Simuler une fuite d\'eau',
    'Mute Alarms': 'Couper les alarmes',
    'Active Alarms': 'Alarmes actives',
    'Tool Checkout System': 'Gestion du matériel emprunté',
    'Checkout Tool': 'Emprunter un outil',
    'Check-in Tool': 'Retourner un outil',
    'Assigned Engineer': 'Ingénieur affecté',
    'Battery Level': 'Niveau de batterie',
    'Water Pressure': 'Pression de l\'eau',
    'CO2 Level': 'Taux de CO2',
    'Ambient Temp': 'Temp. ambiante',
    'Gas Sub-sensor': 'Sous-capteur de gaz',
    'Flow Rate': 'Débit',
    'Trigger Anomaly': 'Déclencher l\'anomalie',
    'Resolve Anomaly': 'Résoudre l\'anomalie',
    'Sensor Name': 'Nom du capteur',
    'Sensor Type': 'Type de capteur',
    'Threshold Limit': 'Seuil limite',
    'Save Sensor': 'Enregistrer le capteur',
    'Add New Sensor': 'Ajouter un capteur',
    'Executive Dashboard': 'Tableau de bord du manager',
    'Total Concession Revenue': 'Revenus des buvettes',
    'Total Ticket Sales': 'Ventes de billets',
    'Active Security Cases': 'Alertes de sécurité actives',
    'Total Crowd Count': 'Nombre total de supporters',
    'Predictive Concession Revenue': 'Revenus prédictifs des buvettes',
    'Predictive Ticket Sales': 'Ventes prédictives de billets',
    'Deploy Mass Alert Notification': 'Diffuser une alerte générale',
    'Security Logs': 'Rapports de sécurité',
    'Case ID': 'ID d\'alerte',
    'Severity': 'Gravité',
    'SLA Target': 'SLA cible',
    'Emergency Response Needed': 'Intervention d\'urgence',
    'Broadcast Message': 'Message général',
    'Send Broadcast': 'Envoyer l\'alerte',
    'Warning: High crowd bottleneck at Sector C!': 'Attention : Embouteillage important de foule au Secteur C !',
    'Fan & Guest Portal': 'Portail supporters et carte',
    'Fan Dashboard': 'Tableau de bord supporter',
    'Concessions pre-ordering': 'Commande de buvettes',
    'Geofence Check-in': 'Enregistrement géolocalisé',
    'Digital Ticket Stub': 'Billet d\'accès digital',
    'Interactive Stadium Map': 'Plan interactif du stade',
    'Crowd Density Map': 'Carte d\'affluence en temps réel',
    'Active Ticket Code': 'Code d\'accès actif',
    'Row': 'Rangée',
    'Seat': 'Siège',
    'Check In Automatically': 'Enregistrement automatique',
    'Current Concourse Concessions': 'Buvettes disponibles',
    'Express Lane Active': 'Accès coupe-file actif',
    'Order Now': 'Commander maintenant',
    'Confirm Purchase': 'Confirmer l\'achat',
    'Pre-order Concessions': 'Pré-commander',
    'Order submitted successfully!': 'Commande enregistrée avec succès !',
    '3D Arena Guide': 'Guide 3D de l\'arène',
    'Step-by-step directions': 'Itinéraire pas-à-pas',
    'AR Compass': 'Boussole AR',
    'Virtual Path': 'Chemin virtuel',
    'Current Location': 'Position actuelle',
    'Target Seat': 'Siège recherché',
    'Start Navigating': 'Lancer l\'itinéraire',
    'Recalibrate GPS': 'Recalibrer le GPS',
    'Spatial Lock Active': 'Signal spatial verrouillé',
    'Remaining Distance': 'Distance restante',
    'Estimated Arrival': 'Heure d\'arrivée estimée',
    'Stop Navigation': 'Arrêter la navigation',
    'Calibrating Spatial Compass...': 'Calibrage de la boussole spatiale...',
    'Reports & Surveys': 'Rapports et enquêtes',
    'Incident Report Form': 'Signaler un incident',
    'Fan Satisfaction Survey': 'Enquête de satisfaction',
    'Submit Incident': 'Envoyer le rapport',
    'Report Spill': 'Signaler un déversement',
    'Report Security issue': 'Signaler un problème de sécurité',
    'Your feedback helps us make your visit better.': 'Vos commentaires nous aident à améliorer votre visite.',
    'Submit Feedback': 'Envoyer l\'avis',
    'Feedback Submitted!': 'Avis enregistré !',
    'Incident Registered!': 'Incident enregistré !',
    'Arena Setup & Ingestion': 'Configuration de l\'arène et capteurs',
    'Arena Layout Ingestion': 'Configuration de la disposition',
    'Physical Layout Simulator': 'Simulateur de disposition physique',
    'Digital Twin Node Ingestion': 'Configuration du jumeau numérique',
    'Simulate Arena Capacity': 'Simuler l\'affluence',
    'Sensor Feed Ingest': 'Flux de données des capteurs',
    'Ingestion Log': 'Rapport de configuration',
    'Stadia Voice Assistant': 'Assistant vocal Stadia',
    'Tap to Speak': 'Appuyer pour parler',
    'Listening...': 'Écoute en cours...',
    'Processing...': 'Analyse en cours...',
    'Co-pilot standby': 'Assistant en veille',
    'Voice Dispatch: ECT Field Work Order': 'Rapport vocal : Fiche d\'intervention ECT',
    'AUTOPREP FOR ENVIRONMENTAL CLEANLINESS TECHNICIAN': 'PRÉPARATION AUTOMATIQUE DE LA FICHE ECT',
    'Work Order Title:': 'Titre de l\'intervention :',
    'Detailed Instructions:': 'Détails des instructions :',
    'Geofence Location:': 'Emplacement géolocalisé :',
    'Priority Level:': 'Niveau de priorité :',
    'Mapped Asset ID:': 'ID d\'équipement associé :',
    'Assigned Squad Role:': 'Rôle affecté :',
    'Authorize & Push Work Order': 'Valider & Envoyer la fiche',
    'Cancel': 'Annuler',
    'Active Roster Profile:': 'Profil actif de l\'effectif :',
    'Stadia OS Menu': 'Menu Stadia OS',
    'Zero-Trust Mobile Access': 'Accès mobile sécurisé Zero-Trust',
    'Change View': 'Changer de vue',
    'Active view:': 'Vue active :',
    'Close menu': 'Fermer le menu',
    'Close': 'Fermer',
    'Save': 'Enregistrer',
    'Edit': 'Modifier',
    'Delete': 'Supprimer',
    'Clear': 'Effacer',
    'Error': 'Erreur',
    'Success': 'Succès',
    'Alert': 'Alerte',
    'Warning': 'Attention',
    'Unknown': 'Inconnu',
    'Access Denied': 'Accès refusé',
    'Clearance Level Insufficient': 'Niveau d\'autorisation insuffisant',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const stored = localStorage.getItem('stadia_user_language');
      if (stored === 'en' || stored === 'de' || stored === 'es' || stored === 'fr') {
        return stored;
      }
    } catch (e) {
      console.warn('Error reading language from local storage:', e);
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('stadia_user_language', lang);
    } catch (e) {
      console.warn('Error saving language to local storage:', e);
    }
  };

  const t = (key: string): string => {
    const trimmed = key.trim();
    return TRANSLATIONS[language]?.[trimmed] || 
           TRANSLATIONS[language]?.[key] || 
           TRANSLATIONS['en']?.[trimmed] || 
           TRANSLATIONS['en']?.[key] || 
           key;
  };

  const localizeProtocols = (venueId: string, protocols: Array<{ topic: string; category: string; protocol: string }>) => {
    if (language === 'en') return protocols;
    return protocols.map(p => {
      // Find the specific key for venue and topic, e.g. "wembley_emergency evacuation"
      const lookupKey = `${venueId.toLowerCase()}_${p.topic.toLowerCase()}`;
      const translatedText = TRANSLATIONS[language]?.[lookupKey];
      if (translatedText) {
        return {
          ...p,
          protocol: translatedText
        };
      }
      return p;
    });
  };

  // Dynamic DOM Traversal Translation Logic
  useEffect(() => {
    if (language === 'en') return;

    const translateNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        if (text) {
          const trimmed = text.trim();
          if (trimmed.length > 0) {
            // Priority 1: Exact Match in current language translations
            let translated = TRANSLATIONS[language]?.[trimmed] || TRANSLATIONS[language]?.[trimmed.toLowerCase()];
            
            // Priority 2: Case-insensitive search on keys
            if (!translated) {
              const lowerTrimmed = trimmed.toLowerCase();
              const keys = Object.keys(TRANSLATIONS[language] || {});
              const matchingKey = keys.find(k => k.toLowerCase() === lowerTrimmed);
              if (matchingKey) {
                translated = TRANSLATIONS[language][matchingKey];
              }
            }

            if (translated) {
              node.nodeValue = text.replace(trimmed, translated);
            }
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        // Skip code components, scripts, styles, textareas and iframe to avoid breaking them
        if (tagName === 'script' || tagName === 'style' || tagName === 'iframe' || tagName === 'textarea' || tagName === 'code') {
          return;
        }

        // Translate inputs or textareas placeholders
        if (element.hasAttribute('placeholder')) {
          const placeholder = element.getAttribute('placeholder');
          if (placeholder) {
            const trimmed = placeholder.trim();
            const translated = TRANSLATIONS[language]?.[trimmed] || TRANSLATIONS[language]?.[trimmed.toLowerCase()];
            if (translated) {
              element.setAttribute('placeholder', placeholder.replace(trimmed, translated));
            }
          }
        }

        // Translate hover title tooltips
        if (element.hasAttribute('title')) {
          const title = element.getAttribute('title');
          if (title) {
            const trimmed = title.trim();
            const translated = TRANSLATIONS[language]?.[trimmed] || TRANSLATIONS[language]?.[trimmed.toLowerCase()];
            if (translated) {
              element.setAttribute('title', title.replace(trimmed, translated));
            }
          }
        }

        // Deep traverse child nodes
        element.childNodes.forEach(child => translateNode(child));
      }
    };

    // First deep scan of the active DOM
    translateNode(document.body);

    // Watch for dynamic DOM changes (sensor alert injects, error messages, form results)
    const observer = new MutationObserver((mutations) => {
      observer.disconnect();
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            translateNode(node);
          });
        } else if (mutation.type === 'characterData') {
          translateNode(mutation.target);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      observer.disconnect();
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localizeProtocols }}>
      <div key={language} style={{ display: 'contents' }} id="stadia-os-localizer-root">
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
