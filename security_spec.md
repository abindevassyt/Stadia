# Secure Architecture Specification & Red-Team Audit Specifications

## 1. Data Invariants
1. **User Identity Invariant**: A user document must have an ID that strictly matches their authenticated UID (`request.auth.uid`). No user can create or update a profile for another user.
2. **Category Hardening**: The user's category MUST be strictly set to 'Fan'. Self-provisioning of Staff or Admin categories is explicitly blocked to prevent privilege escalation.
3. **Clearance Enforce**: The user's clearance level MUST be exactly `0`. High-clearance roles (Staff/Executive) are managed strictly outside of self-service.
4. **Time Immortality**: The `createdAt` timestamp is immutable once created and must match the server-side write time (`request.time`).

---

## 2. The "Dirty Dozen" Attack Payloads

### Payload 1: Privilege Escalation (Self-Assigned Admin)
Attacking to register a fan profile but assigning high-clearance executive category to hijack system controls.
```json
{
  "id": "user_123",
  "name": "Malicious User",
  "email": "attacker@domain.com",
  "roleName": "System Administrator",
  "category": "Executive",
  "clearanceLevel": 4,
  "createdAt": "2026-07-17T21:38:47Z"
}
```
**Expected Response**: `PERMISSION_DENIED`

### Payload 2: Identity Spoofing (Orphan Document)
Attacking by creating a user profile where the database document path doesn't match the caller's authentic UID.
```json
{
  "id": "victim_uid_456",
  "name": "Attacker",
  "email": "attacker@domain.com",
  "roleName": "Attendee (Sector 102)",
  "category": "Fan",
  "clearanceLevel": 0,
  "createdAt": "2026-07-17T21:38:47Z"
}
```
**Expected Response**: `PERMISSION_DENIED`

### Payload 3: Creation Timestamp Spoofing (Client Drift Injection)
Attacking by defining a historic or future date for account creation rather than using the server-side timestamp.
```json
{
  "id": "user_123",
  "name": "Liam Neill",
  "email": "liam@domain.com",
  "roleName": "Attendee (Sector 102)",
  "category": "Fan",
  "clearanceLevel": 0,
  "createdAt": "2010-01-01T00:00:00Z"
}
```
**Expected Response**: `PERMISSION_DENIED`

### Payload 4: ID Poisoning (Junk Character Strings)
Attempting to create a profile with a malicious, bloated document ID containing invalid parameters or code injections.
```json
{
  "id": "user_123/../../malicious/path/escalation",
  "name": "Attacker",
  "email": "attacker@domain.com",
  "roleName": "Attendee",
  "category": "Fan",
  "clearanceLevel": 0,
  "createdAt": "2026-07-17T21:38:47Z"
}
```
**Expected Response**: `PERMISSION_DENIED`

### Payload 5: shadow Field Injection (Ghost Attributes)
Attempting to register a user profile containing extra system flags like `isVerified` or `bypassSLA` which are not part of the strict schema.
```json
{
  "id": "user_123",
  "name": "Attacker",
  "email": "attacker@domain.com",
  "roleName": "Attendee",
  "category": "Fan",
  "clearanceLevel": 0,
  "createdAt": "2026-07-17T21:38:47Z",
  "isAdmin": true,
  "isVerified": true
}
```
**Expected Response**: `PERMISSION_DENIED`

### Payload 6: Missing Required Attributes (Incomplete Creation)
Attempting to save a user record without the mandatory `roleName` or `category` definitions to trigger downstream null reference crashes.
```json
{
  "id": "user_123",
  "name": "No Role User",
  "email": "norole@domain.com",
  "clearanceLevel": 0,
  "createdAt": "2026-07-17T21:38:47Z"
}
```
**Expected Response**: `PERMISSION_DENIED`

### Payload 7: Type Poisoning (Invalid Type Formats)
Attacking by supplying integers where strings are expected (e.g. name = 9999).
```json
{
  "id": "user_123",
  "name": 9999,
  "email": "poison@domain.com",
  "roleName": "Attendee",
  "category": "Fan",
  "clearanceLevel": 0,
  "createdAt": "2026-07-17T21:38:47Z"
}
```
**Expected Response**: `PERMISSION_DENIED`

### Payload 8: Value Range Abuse (Impossibly Large clearanceLevel)
Attempting to bypass integer logic with negative or oversized numbers.
```json
{
  "id": "user_123",
  "name": "Poison Archer",
  "email": "poison@domain.com",
  "roleName": "Attendee",
  "category": "Fan",
  "clearanceLevel": -5,
  "createdAt": "2026-07-17T21:38:47Z"
}
```
**Expected Response**: `PERMISSION_DENIED`

### Payload 9: Timestamp Mutability Attack (Update Invariant Hack)
Attempting to change the `createdAt` value of an existing verified profile during an update operation.
```json
{
  "id": "user_123",
  "name": "Liam Neill",
  "email": "liam@domain.com",
  "roleName": "Attendee (Sector 102)",
  "category": "Fan",
  "clearanceLevel": 0,
  "createdAt": "2026-08-01T12:00:00Z"
}
```
**Expected Response**: `PERMISSION_DENIED`

### Payload 10: Unauthorized Profile Harvesting (PII Scrape)
Attempting to retrieve another user's profile containing private email data without valid authentication.
```json
{
  "target": "/users/victim_user_xyz",
  "caller": "attacker_user_abc"
}
```
**Expected Response**: `PERMISSION_DENIED`

### Payload 11: Volumetric Overflow Attack
Attempting to submit a name string that is 5MB in size to cause database storage exhaustion.
```json
{
  "id": "user_123",
  "name": "[5MB of repeated junk characters]",
  "email": "overflow@domain.com",
  "roleName": "Attendee",
  "category": "Fan",
  "clearanceLevel": 0,
  "createdAt": "2026-07-17T21:38:47Z"
}
```
**Expected Response**: `PERMISSION_DENIED`

### Payload 12: Anonymous Global Read Scan (Blanket Query Scraping)
Attempting to query the entire `/users` collection without providing a specific, isolated query bounded by owner check.
```json
{
  "query": "SELECT * FROM users"
}
```
**Expected Response**: `PERMISSION_DENIED`
