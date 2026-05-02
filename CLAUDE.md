# ORTHONOBA - CLAUDE CODE INSTRUCTIONS

## Project Overview

Orthonoba is a SaaS platform for dental clinics and dental laboratories.
It includes modules for:

- Patient management
- Clinical records
- Dental charts (odontogram)
- Orders (aligners, retainers, mouthguards)
- Billing and payments
- Multi-tenant architecture (one clinic per subdomain)

---

## Tech Stack

- Next.js (App Router)
- TypeScript (strict mode)
- Zustand (state management)
- TailwindCSS (styling)
- REST API routes (Next.js /app/api)
- Modular architecture (feature-based structure)

---

## IMPORTANT RULES

### 1. DO NOT BREAK ARCHITECTURE

- Always respect existing folder structure inside `/src`
- Do NOT create duplicate folders like another `/app`
- Do NOT restructure without explicit instruction

---

### 2. CODE STYLE

- Use TypeScript for everything
- Avoid `any` unless absolutely necessary
- Prefer interfaces over types for entities
- Keep components small and reusable
- Use functional components only

---

### 3. STATE MANAGEMENT

- Use Zustand stores located in `/src/store`
- Do not mix UI state with business logic
- Keep stores separated:
  - auth-store
  - clinic-store
  - ui-store

---

### 4. API RULES

- All backend logic must go inside `/src/app/api`
- Use REST conventions:
  - GET = fetch
  - POST = create
  - PUT/PATCH = update
  - DELETE = remove

---

### 5. MULTI-TENANT RULE

- Each clinic is identified by subdomain
  Example:
  - clinic1.orthonoba.app
  - clinic2.orthonoba.app

- Data must always be scoped by clinicId

---

### 6. UI RULES

- Use existing components in `/src/components`
- Reuse UI primitives from `/ui`
- Maintain clean dashboard layout:
  - sidebar
  - navbar
  - main content area

---

### 7. FILE GENERATION RULE

When generating code:

- Always place files in correct module folder
- Avoid duplicating logic
- Prefer extending existing code instead of rewriting

---

## CORE MODULES

### AUTH

- login
- logout
- session handling
- role-based access control

---

### CLINIC

- clinic profile
- staff members
- settings per clinic

---

### PATIENTS

- patient records
- clinical history
- attachments

---

### ORDERS

- dental manufacturing orders
- status tracking
- lab integration

---

### BILLING

- invoices
- payments
- status tracking

---

## GOAL

Build a scalable SaaS system for dental clinics that can support:

- multi-clinic deployment
- secure patient data
- fast UI performance
- modular expansion

---

## FINAL INSTRUCTION

Always prioritize:

1. Correct architecture
2. Maintainability
3. Scalability
4. Real-world SaaS structure

Do NOT generate experimental or inconsistent structures.
Trabaja con datos mock. No conectes base de datos aun. Manten arquitectura preparada para la integarcion posterior con Neon DB.
