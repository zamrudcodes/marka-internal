# Marka Internal - Employee Bonus Calculator

A comprehensive web application for managing employee data and calculating performance-based bonuses. Built with Next.js, Supabase, and shadcn/ui.

## 🚀 Features

### Employee Management
- **Comprehensive Employee Profiles**: Store and manage detailed employee information including personal details, employment history, and documents
- **Tabbed Detail View**: Organized employee information across 6 intuitive tabs:
  - **Overview**: Quick summary of basic info, employment details, and emergency contacts
  - **Contract & Compensation**: Contract details, salary, banking, and Lark integration
  - **Performance & Tasks**: Task management and performance tracking (coming soon)
  - **Development & Skills**: Skills matrix and training history (coming soon)
  - **Documents**: Identity documents and additional information
  - **History**: Timeline of employee events (coming soon)
- **Avatar Management**: Upload and crop employee photos with real-time preview
- **Bulk Import**: Import employee data from Excel/CSV files
- **Advanced Filtering**: Search and filter employees by department, status, and more

### Bonus Calculation
- **Automated Calculations**: Calculate bonuses based on a weighted formula:
  - 40% Employee Contribution Score (performance rating 1-10)
  - 40% Revenue Participation Score (project-based)
  - 20% Salary Adjustment Score (equity-based)
- **Bonus Periods**: Create and manage quarterly or custom bonus periods
- **Department-Based**: Calculate bonuses per department with configurable bonus pools
- **Detailed Breakdowns**: View how each score component contributes to the final bonus

### Project Management
- **Project Tracking**: Manage revenue-generating projects
- **Employee Assignments**: Link employees to projects for revenue participation calculations
- **Revenue Attribution**: Track project revenue for accurate bonus calculations

### Department Management
- **Department Organization**: Organize employees by departments
- **Department-Level Reporting**: View aggregated data and bonus calculations per department

### Data Management
- **Full CRUD Operations**: Create, read, update, and delete records for employees, projects, and departments
- **Data Validation**: Built-in validation to ensure data integrity
- **Secure Storage**: All sensitive data stored securely in Supabase with Row Level Security

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Tabler Icons](https://tabler.io/icons)
- **Forms**: React Hook Form with Zod validation
- **File Upload**: Supabase Storage with image cropping

## 📋 Prerequisites

- Node.js 18+ 
- npm/yarn/pnpm/bun
- Supabase account and project

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/zamrudcodes/marka-internal.git
cd marka-internal
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set up the database

Run the migrations in your Supabase project:

```bash
# Apply migrations from supabase/migrations/
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 📁 Project Structure

```
marka-internal/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── employees/          # Employee management pages
│   │   ├── projects/           # Project management pages
│   │   ├── departments/        # Department management pages
│   │   ├── bonus-periods/      # Bonus calculation pages
│   │   └── payroll/            # Payroll features
│   ├── components/             # React components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── ...                 # Custom components
│   ├── lib/                    # Utility functions
│   │   ├── calculations/       # Bonus calculation logic
│   │   └── utils/              # Helper functions
│   └── utils/                  # Supabase client utilities
├── supabase/
│   ├── migrations/             # Database migrations
│   └── schema.sql              # Database schema
├── docs/                       # Documentation
│   └── employee-detail-page.md # Feature documentation
├── PRODUCT_REQUIREMENTS.md     # Product requirements
└── bonus-calculation-design.md # Bonus calculation design doc
```

## 🎨 Design Philosophy

The application's UI is inspired by Football Manager's Player Analytics interface, featuring:
- Clean, card-based layouts
- Intuitive tab navigation
- Information hierarchy with progressive disclosure
- Responsive design for all screen sizes
- Consistent visual language throughout

## 📖 Documentation

- [Product Requirements Document](./PRODUCT_REQUIREMENTS.md)
- [Bonus Calculation Design](./bonus-calculation-design.md)
- [Employee Detail Page](./docs/employee-detail-page.md)

## 🔐 Security

- Row Level Security (RLS) enabled on all Supabase tables
- Secure authentication with Supabase Auth
- Environment variables for sensitive configuration
- Input validation and sanitization

## 🚧 Roadmap

### Coming Soon
- [ ] Performance & Tasks tab with task management
- [ ] Development & Skills tab with skills matrix
- [ ] History tab with employee timeline
- [ ] Advanced reporting and analytics
- [ ] Export functionality (PDF/CSV)
- [ ] Email notifications
- [ ] Mobile app

## 🤝 Contributing

This is an internal project. For questions or suggestions, please contact the development team.

## 📄 License

Internal use only - All rights reserved

## 🙏 Acknowledgments

- UI inspiration from [Football Manager](https://www.footballmanager.com/)
- Built with [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Supabase](https://supabase.com/)
