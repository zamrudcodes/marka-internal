# Marka Internal OS (ERP)

A comprehensive Enterprise Resource Planning (ERP) system and Internal Operating System for Marka. Designed to centralize employee management, payroll operation, project tracking, and performance analysis. Built with Next.js, Supabase, and shadcn/ui.

## 🚀 Features

### 👥 Employee Management
- **Comprehensive Profiles**: specific data: personal details, employment history, and documents.
- **Tabbed Overview**:
  - **Overview**: Basic info, employment details, and emergency contacts.
  - **Contract & Compensation**: Contract details, salary, banking, and Lark integration.
  - **Documents**: Identity documents and additional files.
  - *Coming Soon*: Performance & Tasks, Development & Skills, History.
- **Tools**: Avatar management with cropping, bulk import for Excel/CSV, and advanced filtering.

### 💰 Bonus Calculation Audit
- **Automated Formula**:
  - 40% **Employee Contribution** (Performance Rating)
  - 40% **Revenue Participation** (Project Revenue Share)
  - 20% **Salary Adjustment** (Equity-based inverse scaling)
- **Workflow**: Create bonus periods, input department net profit, and generate detailed breakdowns per employee.

### 💸 Payroll System
- **Automated Calculations**:
  - **BPJS**: Automatic calculation of Company and Employee contributions (JKK, JKM, Kes, JHT, JP).
  - **Tax (PPh 21)**: Progressive tax rates based on Indonesian regulations (TER 2024).
  - **Take Home Pay**: Final calculation after all deductions and allowances.
- **Manual Adjustments**: Support for allowances, reimbursement, bonuses, and severance.

### 📊 Project & Operations
- **Project Tracking**: Manage revenue-generating projects and assign employees for bonus attribution.
- **Project Charters**: Manage project initialization and charter documents.
- **Ads Performance**: Track and analyze advertising performance metrics.
- **Heatmaps**: Visual representation of project health and metrics.

### 🛡️ Access Control & Security
- **Granular Permissions**: Feature-based access control system.
- **Role Presets**:
  - **Admin**: Full access.
  - **Manager**: Department management and payroll.
  - **Operations**: Project focus.
  - **Sales**, **Viewer** roles.
- **Security**: Row Level Security (RLS) on all data, secure Supabase Auth.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **UI System**: [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Tabler Icons](https://tabler.io/icons)
- **State/Forms**: React Hook Form, Zod, TanStack Table

## 📖 Documentation

- **Core**: [Product Requirements](./docs/product-requirements.md)
- **Design**: [Bonus Calculation Logic](./docs/bonus-calculation-design.md)
- **Features**:
  - [Employee Detail Page](./docs/employee-detail-page.md)
  - [Payroll Calculation System](./docs/payroll-calculation-system.md)
  - [Feature Access Control](./docs/feature-access-control.md)
  - [Implementation Summary](./docs/feature-access-implementation-summary.md)

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone https://github.com/zamrudcodes/marka-internal.git
cd marka-internal
npm install
```

### 2. Configuration
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run migrations to set up the schema, including RLS and feature tables.

### 4. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

## 🎨 Design Philosophy
Inspired by **Football Manager**, the UI prioritizes:
- **Information Density**: Clean, card-based layouts for complex data.
- **Discovery**: Progressive disclosure via tabs and collapsible sections.
- **Theme**: Professional, consistent visual language.

## 🤝 Contributing
Internal project. Contact the development team for access and guidelines.

## 📄 License
Internal use only - All rights reserved.
