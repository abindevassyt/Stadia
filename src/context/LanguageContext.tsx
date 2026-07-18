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
    'metlife_severe weather evacuation': 'Bei Blitzerkennung im Umkreis von 8 Meilen muss die Einsatzleitung der Veranstalter (POL) eine Warnung über die Haupt-PA-Anlage veranlassen. Alle Tribünenzuschauer in die vollständig geschlossenen Innenbereiche leiten. Sicherheitsbereich in der Nähe der Drehkreuze aufrechterhalten.'
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
    'ai.multilingual_desc': 'Traduzca cualquier mensaje o protocolo de seguridad a otros idiomas',
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
    'wembley_plumbing spill protocol': 'Cuando el sensor ambiental o de plomería registre un desbordamiento superior al 85% de su capacidad, enviar Técnicos de Limpieza Ambiental (ECT) equipados con unidades de aspiración en seco para riesgos. Geocercar las válvulas de los baños e aislar el bloque en un plazo de 90 segundos. Notificar a los líderes voluntarios del sector para redirigir a los aficionados a los bloques de baños del Concourse Norte.',
    'wembley_turnstile power interruption': 'En caso de fallo en la red de torniquetes, los Controladores de Boletos de Acceso a Puertas (GATC) deben cambiar al modo de caché localizada. Un protocolo de enlace BLE sin conexión autorizará los hashes de boletos de forma desconectada. Los Ingenieros de Sistemas de Bajo Voltaje y AV deben desplegarse en la subestación de la Puerta A para reiniciar el controlador del conmutador perimetral.',
    'wembley_dietary pre-ordering issues': 'Si la velocidad de sincronización de POS cae por debajo del 95%, los coordinadores de tiendas emergentes deben aceptar tokens de billetera digital sin conexión. El empleado de inventario (ILC) debe registrar el inventario manualmente en la tabla portapapeles del sector.',
    'allianz_emergency evacuation': 'Detener todas las escaleras mecánicas y motores de las escaleras de cascada en sentido descendente. Evacuar a través de las puertas rápidas del panel de la membrana exterior.',
    'allianz_membrane panel pressure alert': 'En condiciones extremas de viento o térmicas, los técnicos de MEP deben supervisar las cámaras de presurización de la membrana. Los sellos de ventilación automática funcionarán; si el bypass manual falla, desviar la energía al Compresor Auxiliar 2.',
    'metlife_severe weather evacuation': 'En caso de detección de rayos dentro de un radio de 8 millas, el Enlace de Operaciones del Promotor (POL) debe ordenar una advertencia en el sistema de megafonía principal. Dirigir a todos los espectadores de las gradas hacia pasillos interiores completamente cerrados. Mantener el perímetro de seguridad cerca de los torniquetes.'
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
    'metlife_severe weather evacuation': 'En cas de détection de foudre dans un rayon de 8 miles, la liaison des opérations du promoteur (POL) doit ordonner un avertissement sur la sonorisation principale. Dirigir tous les spectateurs de la tribune vers les halls intérieurs entièrement fermés. Maintenir un périmètre de sécurité à proximité des tourniquets.'
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
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
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

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localizeProtocols }}>
      {children}
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
