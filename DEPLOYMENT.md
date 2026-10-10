# Taazi Tokari — Production Deployment & Full-Stack Architecture Guide

## Overview

**Taazi Tokari** is an end-to-end residential society farm-to-table produce pre-ordering, dawn mandi procurement, warehouse packing, doorstep delivery, and admin governance platform built specifically for neighbourhood residential clusters (pilot market: Lucknow #LKO-24).

This document outlines the architecture, database schema, role-based access control (RBAC), environment setup, and deployment workflow.

---

## 1. Application Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │           Taazi Tokari Web Platform           │
                               │        (React 19 + TypeScript + Vite)        │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┼──────────────────────────────┐
                       ▼                              ▼                              ▼
            ┌────────────────────┐         ┌────────────────────┐         ┌────────────────────┐
            │   Resident Shop    │         │  Field & Ops Hub   │         │   Admin Console    │
            │  (Customer Portal) │         │ (Pack, Deliver, QC)│         │(Rates, Stock, PII) │
            └──────────┬─────────┘         └──────────┬─────────┘         └──────────┬─────────┘
                       │                              │                              │
                       └──────────────────────────────┼──────────────────────────────┘
                                                      │
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │             NestJS Monolith API              │
                               │  (JWT Auth, Throttling, AES-256 PII Encryp) │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                            ▼
            ┌────────────────────┐                                       ┌────────────────────┐
            │ PostgreSQL 16 (DB) │                                       │    Redis 7 Queue   │
            │  (Prisma ORM engine)│                                       │ (BullMQ Cutoff Job)│
            └────────────────────┘                                       └────────────────────┘
```

---

## 2. Role-Based Access Control (RBAC)

The platform enforces strict role boundaries:

| Persona | System Role | Primary Access & Permissions |
|---|---|---|
| **Resident Customer** (*Priya Sharma*) | `CUSTOMER` | Place morning batch orders, view Health Kits, redeem Sikka points, track order status. Cannot access operational tools or PII of other flats. |
| **Operations Staff** (*Ramesh Kumar*) | `OPS` / `PACKING` / `DELIVERY` | Handheld terminal views for Crate Packing (Station #3), Tower Delivery sequences, Dawn Mandi procurement weighing, and QC grading. |
| **Super Admin** (*Amit Sharma*) | `ADMIN` | Full administrative control: SKU catalogue management, Daily Mandi Rate manipulation governor, payment settlements, society cut-off triggers, and audit logs. |
| **Architect** | `ARCHITECT` | System engine blueprint specs, schema documentation, and API simulation. |

---

## 3. Database & Prerequisites

- **Node.js**: `v20.x` or later
- **PostgreSQL**: `v16.x`
- **Redis**: `v7.x` (for BullMQ background jobs)

### Database Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Generate Prisma Client & Run Database Migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. Seed Initial Database Records:
   ```bash
   npx ts-node prisma/seed.ts
   ```

---

## 4. Running Locally

### Option A: Direct Local Execution

- **Frontend (Vite Server)**:
  ```bash
  npm run dev
  # Running at http://localhost:3000
  ```

- **Backend (NestJS Monolith)**:
  ```bash
  cd backend
  npm run start:dev
  # Running at http://localhost:4000
  ```

### Option B: Docker Compose Full Stack

```bash
docker-compose up --build -d
```

---

## 5. Security & PII Protection

- **AES-256-GCM Encryption**: Customer phone numbers, flat/door numbers, and delivery instructions are encrypted at rest.
- **Midnight Batch Cut-off**: Orders freeze automatically at midnight (12:00:00 AM) to lock down procurement totals for dawn Mandi auctions.
- **Audit Logging**: All price overrides, rate manipulations, refunds, and society config updates are logged with actor ID, timestamp, and IP address.

---

## 6. Deployment Health Verification

Run automated checks before deploying to staging/production:

1. **Linting & Type Checks**:
   ```bash
   npm run lint
   ```

2. **Production Bundle Build**:
   ```bash
   npm run build
   ```
