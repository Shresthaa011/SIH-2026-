# TerraByte (टेराबाइट) — National Land Acquisition & Management System
### भारत सरकार | Government of India — GIGW 3.0 Compliant Web Portal

**TerraByte** is an end-to-end national land acquisition, cadastral GIS mapping, digital e-agreements, and compensation disbursement portal compliant with the **Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement (RFCTLARR) Act, 2013** and **Guidelines for Indian Government Websites (GIGW 3.0)**.

---

## 🏛️ Government Portal Features

- **National Masthead & Emblems**: Vector Lion Capital of Ashoka (*Ashoka Stambh*) with *Satyameva Jayate*, Digital India, and PM GatiShakti insignias.
- **National Tricolor Ribbon**: Saffron, white, and green ribbon across the top banner.
- **GIGW Accessibility Top Bar**:
  - Live Indian Standard Time (IST) clock.
  - Font size controls (`A-`, `A`, `A+`) for visually impaired users.
  - Language switcher (**हिन्दी / English**).
  - High-contrast inputs with solid black typed text across dark/light OS themes.
  - Screen reader & Skip to content links.
- **Dynamic Notice Ticker**: Smooth, continuously moving marquee announcement ticker with hover-to-pause accessibility.
- **JanParichay National SSO Login & Security Captcha**:
  - High-contrast black input text styling.
  - Distorted 5-character security captcha with refresh feature.
  - 1-click test chips for instant sign-in.
  - Citizen self-service registration.
- **Digital E-Agreement Workflow (Draft → Sent → Signed → Completed)**:
  - **Draft**: Land Acquisition Officer generates statutory acquisition agreement linked to cadastral Khasra survey.
  - **Sent**: Agreement dispatched digitally to the verified Landowner/Citizen dashboard with notification banner.
  - **Signed**: Landowner reviews statutory terms, compensation breakdown (Circle Rate + 100% Solatium + 12% Interest), and signs digitally via **Aadhaar e-Sign (Simulated OTP)** or **Digital Stylus Drawing Pad**.
  - **Completed**: Officer counter-signs with **Class-3 DSC Token** and attaches the official Government seal.
  - **Official Stamp Paper Deed Preview & Print/Export**: Authentic Non-Judicial Stamp Paper format (`₹100 E-STAMP`) with Ashoka Stambh, verification QR code, dual cryptographic timestamps, and 1-click A4 print/PDF export.
- **Secure Identity Verification & Authentication Module (IDV)**:
  - **Statutory Multi-Stage Onboarding Flow**:
    $$\text{Create Account} \longrightarrow \text{Personal Details} \longrightarrow \text{PAN Verification} \longrightarrow \text{Biometric Verification} \longrightarrow \text{Identity Verified} \longrightarrow \text{Dashboard}$$
  - **Dedicated PAN Authentication Screen**: Real-time alphanumeric format validation, cross-referencing against applicant Name and DOB, simulated NSDL/CBDT Verification Gateway, masked PAN display (`ABCDE****F`), and comprehensive demo test presets (valid match, format error, name mismatch, DOB mismatch, duplicate PAN, and gateway timeout).
  - **Biometric Identity Verification Terminal**: Modern government-grade biometric interface with **Facial Liveness Scanner** (targeting crosshairs, radar, sweeping laser line animation) and **Fingerprint Scanner** (STQC optical pulse sensor). 100% DPDP Act 2023 compliant with zero raw biometric storage.
  - **Statutory Identity Certificate**: Printable verification summary with official Ashoka Stambh seal, verification reference ID (`TB-IDV-2026-XXXXX`), ISO timestamp, and checklist.
  - **User Profile & Dashboard Integration**: Dedicated "My Profile & Identity" view, green verified badge in topbar and dashboard (`✓ Identity Verified`), and warning banners for unverified users.
- **Statutory RFCTLARR Workflow Engine**: 10-stage statutory RFCTLARR pipeline (SIA Section 4, Preliminary Notification Section 11, Declaration Section 19, Enquiry & Award Section 23/30, PFMS Direct Benefit Transfer).
- **Interactive Cadastral GIS**: Leaflet-based spatial cadastre with satellite overlay, khasra boundary search, and dispute layers.
- **NIC Standard Footer**: National Informatics Centre disclaimers, GIGW compliance badges, visitor counter, and government policy links.

---

## 🔑 Demo Login Credentials

| Role | Username | Official Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Nodal Admin** | `admin` | `admin@terrabyte.gov.in` | `password123` | Full administrative control, audit log, user management |
| **Land Officer (LAO)** | `officer` | `officer@terrabyte.gov.in` | `password123` | E-Agreements creation & DSC counter-signing, verification queue, Khasra inspections |
| **Project Authority (NHAI)** | `authority` | `authority@terrabyte.gov.in` | `password123` | Project dashboards, objections review, sanction approvals |
| **Citizen / Khatedar** | `citizen` | `citizen@terrabyte.gov.in` | `password123` | Review & e-Sign pending E-Agreements, "My Land" records, compensation calculator |

> **Tip**: You can click the 1-click preset chips at the bottom of the sign-in card to automatically populate credentials and security captcha.

---

## 🚀 How to Run

### Method 1: 1-Click Launch (Windows)
Double-click `start.bat` in this folder. It will launch the local server and open `http://localhost:8080` in your default browser.

### Method 2: PowerShell
```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1 -Port 8080
```
Open [http://localhost:8080](http://localhost:8080) in your web browser.
