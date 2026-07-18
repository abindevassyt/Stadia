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
