# Stadia OS v2.5 — Decentralized High-Density Venue Command

Stadia OS is a next-generation decentralized full-stack venue control application designed for high-density modern sports arenas, stadiums, and concert environments. Built using React, Vite, Tailwind CSS, Express, and Firebase, it establishes a zero-trust role-based portal dividing spectators, ground volunteers, facilities engineers, and executive directors into distinct isolated consoles.

---

## 🏗️ Core Architectural Modules

The system is split into four distinct high-fidelity modules, governed by security policies:

1. **Attendee / Fan Portal (Gate 1)**
   * **Target Audience**: Standard Spectators & VIP Guests.
   * **Key Capabilities**: In-seat concession pre-ordering, VPS-aligned blue-dot route wayfinding with pathing suggestions, live ticket wallet viewing, and chatbot concierge assistance.
   
2. **Enterprise Ground Staff & Volunteer Console (Gate 5)**
   * **Target Audience**: Volunteers (CWV, SVL), Crowd Safety (CSS), Security (RRSO), Logistics (ILC), and Gate Controllers (GATC).
   * **Key Capabilities**: Geofenced digital check-in to operational sectors, incident reporting, offline playbook protocol RAG querying, and voice-to-ticket NLP work order generation.

3. **CMMS & BMS Engineering Dashboard**
   * **Target Audience**: Facilities Managers (FOM) and Field Engineers (MEP, LVA, TAC).
   * **Key Capabilities**: Real-time IoT SCADA sensor monitoring, environmental anomaly detection, automated asset checkout using digital RFID badges, and central BMS telemetry analysis.

4. **Executive Command Control Hub**
   * **Target Audience**: Board Members (ED, RCO), Supervisors (CCOS), and Commercial Managers (CLM, PBA).
   * **Key Capabilities**: Multi-criteria event risk scenario simulation, visual venue crowd density maps, concession sales velocity monitoring, and live audit trailing.

---

## 🔐 Zero-Trust Authentication System

To enforce high-security standards, Stadia OS integrates a strict multi-layer authentication gateway:
* **Fans / Spectators**: Can register a new digital wallet (which writes to Firebase Auth + Firestore `/users/{userId}`) or sign in using their ticket email and passcode. Secure Google Single Sign-on (SSO) is also enabled.
* **Corporate & Ground Staff**: Restoratively separated from SSO. Employees select their registered roster identity and verify with their encrypted 4-digit operational PIN code.
* **Dynamic Hook Redirection (`useRoleNavigation`)**: Upon successful login, the application retrieves custom claims or metadata from the verified profile, automatically routing the user directly to their respective workspace panel.

---

## 📋 Comprehensive Testing Directory (Roles & Credentials)

To facilitate immediate, thorough testing of every single role in Stadia OS, use the following credentials with the operational PIN **`2026`** (or **`1234`**):

### 1. Governance & Executive Roles
*Accesses the **Executive Command Control Hub** with clearance levels 3–5.*

| ID | Name | Role Title | Category | Clearance | Key Testing Permissions |
|:---|:---|:---|:---|:---:|:---|
| `ed` | Sarah Jenkins | Executive Director (ED) | Executive | `5` | `VIEW_P_L`, `AUTHORIZE_LOCKDOWN`, `SIMULATE_LWM` |
| `rco` | David Vance | Risk & Compliance Officer (RCO) | Executive | `4` | `VIEW_AUDIT_LOGS`, `CREATE_INCIDENT`, `VIEW_RISK_MATRICES` |
| `ccos` | Marcus Brody | Command Center Supervisor (CCOS) | Executive | `4` | `MONITOR_DENSITY`, `DISPATCH_VOLUNTEERS`, `MANAGE_INCIDENTS` |
| `clm` | Jean-Pierre Laurent | Commercial Leasing Manager (CLM) | Executive | `4` | `AUDIT_REVENUE_SHARE`, `VIEW_YIELD`, `MANAGE_TENANCIES` |
| `pba` | Victoria Song | Private Bookings Agent (PBA) | Executive | `3` | `RESERVE_VENUES`, `CALCULATE_YIELD`, `PROCESS_DEPOSITS` |

### 2. SCADA, CMMS & Facilities Engineering Roles
*Accesses the **CMMS & BMS Engineering Dashboard** with clearance levels 3–4.*

| ID | Name | Role Title | Category | Clearance | Key Testing Permissions |
|:---|:---|:---|:---|:---:|:---|
| `fom` | Elena Rostova | Facilities Operations Manager (FOM) | Cmms | `4` | `CREATE_WORK_ORDER`, `REASON_BMS`, `AUTHORIZE_PURCHASES` |
| `mep` | Liam Neill | MEP Technician (MEP) | Cmms | `3` | `UPDATE_WORK_ORDER`, `SOLVE_PM`, `VIEW_TELEMETRY` |
| `lva` | Nikhil Sen | Low-Voltage & AV Engineer (LVA) | Cmms | `3` | `CALIBRATE_PA`, `REBOOT_EDGE_COMPUTE`, `UPDATE_WORK_ORDER` |
| `tac` | Oren Tal | Tool Crib & Asset Custodian (TAC) | Cmms | `3` | `VALIDATE_CERTIFICATIONS`, `MANAGE_LENDING`, `RFID_SCAN` |

### 3. Ground Staff & Field Volunteer Roles
*Accesses the **Ground Staff & Volunteer Console** with clearance levels 1–3.*

| ID | Name | Role Title | Category | Clearance | Key Testing Permissions |
|:---|:---|:---|:---|:---:|:---|
| `cpc` | Sven Lindqvist | Concessions Pop-Up Coord. (CPC) | Staff | `3` | `VET_PERMITS`, `RECONCILE_REVENUE`, `MANAGE_DOCK_DELIVERIES` |
| `pol` | Gary Vance | Promoter Operations Liaison (POL) | Staff | `3` | `INTEGRATE_RIDERS`, `MANAGE_STAGE_TRANSITION` |
| `vwd` | Clara Oswald | Volunteer Workforce Dir. (VWD) | Staff | `3` | `MANAGE_VOLUNTEERS`, `CHECK_BACKGROUND`, `REVIEW_COMPLIANCE` |
| `rrso` | Diana Prince | Rapid Response Security (RRSO) | Staff | `3` | `DE_ESCALATE_FORCE`, `SECURE_BOUNDARIES`, `LOG_INCIDENT` |
| `ilc` | Tanya Brady | Inventory & Logistics Clerk (ILC) | Staff | `2` | `UPDATE_STOCK`, `SCAN_BARCODES`, `MANAGE_DELIVERIES` |
| `svl` | Arthur Pendragon | Sector Volunteer Lead (SVL) | Staff | `2` | `ROSTER_ASSIGNMENTS`, `PUSH_TASK_UPDATES`, `CHECK_IN_SECTOR` |
| `gatc` | Lancelot Smith | Gate Ticket Controller (GATC) | Staff | `2` | `RESOLVE_TICKET_EXCEPTIONS`, `VIEW_TICKET_HASHES` |
| `cwv` | Guinevere Du Lac | Concierge Wayfinding Vol. (CWV) | Staff | `1` | `VIEW_WAYFINDING`, `LOG_ACCESS_NEEDS`, `CHECK_IN_SECTOR` |
| `css` | Gawain Green | Crowd Safety Steward (CSS) | Staff | `1` | `CLEAR_EGRESS_VECTORS`, `MONITOR_CROWD`, `LOG_INCIDENT` |
| `ect` | Peter Parker | Environmental Cleanliness (ECT) | Staff | `1` | `RESOLVE_WASTE_PM`, `POST_EVENT_CLEANUP`, `UPDATE_WORK_ORDER` |

### 4. Spectator & Fan Tier
*Accesses the **Attendee / Fan Portal** with clearance level 0.*

| ID | Name | Role Title | Category | Clearance | Authentication Method |
|:---|:---|:---|:---|:---:|:---|
| `fan` | John Doe | Attendee / Fan | Fan | `0` | Sign up with any Email & Passcode OR click Google SSO. |

### 5. Detailed QA Test Credentials Matrix

To facilitate rapid automated QA and manual testing, use the following comprehensive matrix containing the exact sign-in credentials mapped in `/src/data/userSeed.ts`:

| Persona ID | Name | Role Title | Category | Clearance | Test Email Address | Test PIN / Passcode |
|:---|:---|:---|:---|:---:|:---|:---|
| **`ed`** | Sarah Jenkins | Executive Director (ED) | Executive | `5` | `sarah.jenkins@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`rco`** | David Vance | Risk & Compliance Officer (RCO) | Executive | `4` | `david.vance@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`ccos`** | Marcus Brody | Command Center Supervisor (CCOS) | Executive | `4` | `marcus.brody@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`clm`** | Jean-Pierre Laurent | Commercial Leasing Manager (CLM) | Executive | `4` | `jp.laurent@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`pba`** | Victoria Song | Private Bookings Agent (PBA) | Executive | `3` | `victoria.song@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`fom`** | Elena Rostova | Facilities Operations Manager (FOM) | CMMS | `4` | `elena.rostova@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`mep`** | Liam Neill | MEP Technician (MEP) | CMMS | `3` | `liam.neill@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`lva`** | Nikhil Sen | Low-Voltage & AV Engineer (LVA) | CMMS | `3` | `nikhil.sen@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`tac`** | Oren Tal | Tool Crib & Asset Custodian (TAC) | CMMS | `3` | `oren.tal@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`cpc`** | Sven Lindqvist | Concessions Pop-Up Coord. (CPC) | Staff | `3` | `sven.lindqvist@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`ilc`** | Tanya Brady | Inventory & Logistics Clerk (ILC) | Staff | `2` | `tanya.brady@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`pol`** | Gary Vance | Promoter Operations Liaison (POL) | Staff | `3` | `gary.vance@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`vwd`** | Clara Oswald | Volunteer Workforce Dir. (VWD) | Staff | `3` | `clara.oswald@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`svl`** | Arthur Pendragon | Sector Volunteer Lead (SVL) | Staff | `2` | `arthur.pendragon@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`cwv`** | Guinevere Du Lac | Concierge Wayfinding Vol. (CWV) | Staff | `1` | `guinevere.dulac@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`gatc`** | Lancelot Smith | Gate Ticket Controller (GATC) | Staff | `2` | `lancelot.smith@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`css`** | Gawain Green | Crowd Safety Steward (CSS) | Staff | `1` | `gawain.green@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`rrso`** | Diana Prince | Rapid Response Security (RRSO) | Staff | `3` | `diana.prince@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`ect`** | Peter Parker | Environmental Cleanliness (ECT) | Staff | `1` | `peter.parker@stadiaos.com` | PIN: **`2026`** (Pass: `Stadia2026!`) |
| **`fan`** | John Doe | Attendee / Fan | Fan | `0` | `john.doe@stadiaos.com` | Passcode: **`Ticket102!`** |

*Note: All Corporate & Field Staff use direct multi-tenant PIN verification (`2026` or `1234`) on Gate 5, keeping them isolated from public attendee schemas in accordance with the Zero-Trust routing model.*

---

## 🛠️ Testing Walkthrough & Operational Scenarios

Here is how you can verify each function of the Stadia OS using the seeded records:

### Scenario A: Environmental Alert Handover (ECT ➔ FOM ➔ MEP)
1. **Log in as `ect`** (Peter Parker) using PIN `2026`. You will be directed to the **Ground Staff & Volunteer Console**.
2. Notice the high-priority work order `WO-5041` for *Restroom Spill & Overflow Mitigation* already allocated to you in your task feed.
3. Perform a sector check-in at `South Restrooms A1`.
4. **Log out and log in as `fom`** (Elena Rostova) using PIN `2026`. You will enter the **Facilities Engineering Dashboard**.
5. Look at the **Asset Custody & Lending** panel. Search for `Peter Parker` or check out the `HVAC Thermal Overload Analyzer` to his RFID.
6. Click **Analyze BMS Sensors** to trigger the AI telemetry reasoning engine, identifying any cascading failures.

### Scenario B: Emergency Egress Contingency (CSS ➔ ED)
1. **Log in as `css`** (Gawain Green) using PIN `2026`.
2. Locate the high-priority work order `WO-7721` *Emergency Egress Corridor Clearance* assigned to you instands row block 10.
3. Test the **Offline Playbook RAG** by typing a question such as: *"How to handle emergency evacuation?"* and click search to verify local protocols are retrieved and mapped.
4. **Log out and log in as `ed`** (Sarah Jenkins) using PIN `2026`. You are now in the **Executive Command Control Hub**.
5. Inspect the **Live Crowd Density Maps** to watch the status of turnstiles Gate A and Gate B.
6. Trigger the **Multi-Criteria Risk Simulation** to forecast security and staffing postures.

### Scenario C: Spectator In-Seat Concierge
1. **Log in as a Fan** using either Google SSO or creating a custom ticket with seat block `102`, row `L5`.
2. Open the **In-Seat Concierge Chat** at the bottom.
3. Ask the chatbot: *"I want to pre-order a burger, and there is a water leak near Gate A"*.
4. Verify the multi-agent AI automatically triggers parallel workflows, placing a concession pre-order and logging a CMMS ticket simultaneously.

---

## 🎨 Global Theme Toggle & Workspace Settings

To accommodate both high-density indoor operations and outdoor high-glare environments, Stadia OS includes a comprehensive personalization dashboard:

1. **Global Theme Toggle**:
   * Located at the top right of the **Navbar** (indicated by a Sun/Moon icon).
   * Instantly transitions the entire workspace between a low-light twilight dark canvas and a crisp, high-contrast solar light theme.
   * Persists the user's color scheme in browser-safe client-side partition storage.

2. **System Settings Dashboard**:
   * Accessible via the gear icon in the **Navbar** or the **System Settings** tab.
   * **Visual Color Theme**: Toggles Dark and Light color palettes.
   * **Diagnostic Audio Alarms**: Mutes or activates audible siren cues when SCADA telemetry indices trip thresholds.
   * **BMS Telemetry Refresh Interval**: Adjusts clock frequency for simulated stream polling rates (5 seconds, 15 seconds, or 30 seconds).
   * **A11y Typography Scaling**: Increases text size multiplier for on-the-field visibility on rugged tablets.
   * **Geofence Sector Strictness**: Sets proximity checking standards (Strict 50m, Wide 500m, or Sandbox Mode).
   * **Baseline Currency Index**: Choose local currency representations (`$`, `€`, `£`) for executive ledger settlements.

---

## 🗺️ Offline-First Interactive Venue Map Viewer

To ensure staff, stewards, and volunteers remain fully operational during cell network congestion or hardware power failure events, a high-fidelity **Offline Venue Map** is available inside the **Staff & Volunteer Hub**:

1. **Topological Digital Twin Network**:
   * Renders the active venue's coordinates on an SVG grid overlay, mapping gate entrance turnstiles, corridors, ramps, emergency stairways, elevators, and seating blocks.
   * Visualizes status flags (e.g., congested corridors indicated by high-contrast red warnings).

2. **Breadth-First Search (BFS) Wayfinding Router**:
   * Select a source starting node and terminal destination via direct node clicks or quick selectors.
   * Automatically computes the shortest path and highlights routing legs with glowing animated vectors.

3. **Offline Local Storage Caching**:
   * An intuitive **Network Connection Toggle** simulates disconnection.
   * In offline mode, the viewer continues to read and render the spatial topological system from browser partition storage.
   * Click **Refresh Map Cache** to pull down and override offline data schemas with live static configuration variables.

4. **Offline Incident Outbox Queue**:
   * Direct node selection prompts staff to "Report Anomaly Offline".
   * Filing reports offline buffers them safely in a client-side database queue (outbox).
   * Reconnecting online and selecting **Push Outbox (Sync)** transmits pending issues to the centralized CMMS work ticket stream instantly.

---

## 💻 Tech Stack & Run Instructions

### 1. Developer Setup
Initialize dependencies and boot the unified dev server:
```bash
npm install
npm run dev
```

### 2. Standalone CJS Production Build
To bundle the backend and serve static files:
```bash
npm run build
npm start
```
The application compiles server-side logic into `dist/server.cjs` and serves SPA assets smoothly over Port 3000.
