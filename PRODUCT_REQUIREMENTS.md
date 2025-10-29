# Product Requirements Document: Employee Bonus Calculator

**Version:** 1.1
**Date:** 2025-10-29
**Author:** Roo, AI Software Engineer
**Status:** Draft

---

## 1. Introduction

### 1.1. Executive Summary
The Employee Bonus Calculator is a web application designed to provide a transparent, fair, and efficient way for department managers to calculate and distribute employee bonuses. The system automates the complex process of allocating a department's bonus pool by considering multiple performance and equity factors: individual contributions, participation in revenue-generating projects, and salary level. This tool aims to replace manual, error-prone spreadsheet calculations, saving time, increasing accuracy, and improving employee morale through a clear and consistent bonus system.

### 1.2. Problem Statement
Calculating employee bonuses is often a manual, time-consuming, and subjective process. Managers struggle to balance various factors like performance, revenue impact, and internal equity, leading to perceived unfairness and a lack of transparency. Spreadsheets are prone to errors, difficult to maintain, and lack the security needed for sensitive salary and performance data.

### 1.3. Goals & Objectives
- **Business Goal:** Increase operational efficiency by reducing the time spent on bonus calculations by at least 75%. Improve employee retention by providing a fair and transparent bonus system.
- **User Goal:** To quickly and accurately calculate bonuses for all employees in a department based on a pre-defined, weighted formula.
- **Product Goal:** To create a secure, intuitive, and reliable web application that automates bonus calculations, manages all related data, and provides clear reporting.

---

## 2. User Personas

### 2.1. Primary Persona: Alex, the Department Manager
- **Role:** Head of Engineering
- **Needs:** A simple tool to input performance ratings and financial data to calculate bonuses for their team of 25 engineers. Needs to ensure the process is fair and justifiable to both upper management and their direct reports.
- **Pain Points:** Spends days in spreadsheets every quarter. Worries about calculation errors and questions about fairness from the team.

### 2.2. Secondary Persona: Sam, the HR Business Partner
- **Role:** HR Business Partner
- **Needs:** To oversee the bonus calculation process across multiple departments, ensure consistency, and access historical data for reporting and analysis.
- **Pain Points:** Lacks visibility into how different departments are calculating bonuses. It's difficult to compile company-wide reports on bonus distribution.

---

## 3. Features & User Stories

### Epic 1: Bonus Calculation
*As a manager, I want to calculate bonuses for my team so that I can distribute the department's bonus pool fairly.*

- **User Story 1.1:** As a manager, I want to create a new bonus calculation period (e.g., "Q4 2024").
- **User Story 1.2:** As a manager, I want to input the department's total net profit for the period, so the system can calculate the 5% bonus pool.
- **User Story 1.3:** As a manager, I want to see a list of all my employees and assign a performance rating (1-10) to each one for the current period.
- **User Story 1.4:** As a manager, I want the system to automatically pull in project revenue data and employee assignments.
- **User Story 1.5:** As a manager, I want to click a "Calculate" button to see a detailed breakdown of the bonus for each employee.
- **User Story 1.6:** As a manager, I want to review the results, make adjustments to ratings if necessary, and re-calculate.
- **User Story 1.7:** As a manager, I want to finalize the calculation and save it as a historical record.

### Epic 2: Data Management
*As a manager or HR partner, I need to manage the core data (employees, projects) so that calculations are always accurate.*

- **User Story 2.1:** As a manager, I want to add, view, and edit employee details (name, salary, department).
- **User Story 2.2:** As a manager, I want to view a comprehensive employee detail page with organized information across multiple tabs.
- **User Story 2.3:** As a manager, I want to add, view, and edit project details (name, total revenue).
- **User Story 2.4:** As a manager, I want to assign employees to the projects they worked on during the period.

### Epic 3: Reporting & History
*As a manager or HR partner, I want to view and export bonus data so that I can analyze trends and fulfill reporting requirements.*

- **User Story 3.1:** As a manager, I want to export the final bonus calculation results to a PDF or CSV file.
- **User Story 3.2:** As an HR partner, I want to view a history of all past bonus calculations across departments.

---

## 4. Functional Requirements

### 4.1. Bonus Calculation Logic
- The total department bonus pool shall be 5% of the user-provided net profit.
- The bonus for each employee shall be calculated using a weighted formula:
    - **40% Weight:** Employee Contribution Score (based on a 1-10 performance rating).
    - **40% Weight:** Revenue Participation Score (based on an equal split of revenue from projects the employee participated in, normalized against total department revenue).
    - **20% Weight:** Salary Adjustment Score (inversely proportional to the employee's salary relative to the department's maximum salary).
- The system must show a detailed breakdown of how each score was derived for each employee.

### 4.2. Data Management
- The application must provide interfaces for full CRUD (Create, Read, Update, Delete) operations for:
    - Employees
    - Projects
    - Departments
- The system must support a many-to-many relationship between employees and projects.

### 4.3. Employee Detail Page
- The employee detail page must display comprehensive employee information organized into the following tabs:
    - **Overview:** Basic information, employment summary, personal information, and emergency contact
    - **Contract & Compensation:** Contract details, salary information, banking details, and Lark integration
    - **Performance & Tasks:** Task management and performance tracking (future implementation)
    - **Development & Skills:** Skills matrix, training history, and development plans (future implementation)
    - **Documents:** Identity documents and additional employee information
    - **History:** Timeline of employee events and changes (future implementation)
- The page must support avatar upload with image cropping functionality
- The page must provide an edit dialog for updating employee information
- The page must be fully scrollable and responsive

### 4.4. User Authentication
- Users must log in to access the application.
- User roles (e.g., Manager, HR, Admin) should be supported to control access to data and features. (Initial implementation may start with a single "Manager" role).

---

## 5. Non-Functional Requirements

### 5.1. Security
- All sensitive data (especially salaries) must be stored securely in the database.
- Row Level Security (RLS) must be implemented in Supabase so that managers can only see data for their own department.

### 5.2. Usability
- The user interface must be intuitive and require minimal training.
- The bonus calculation process should be guided, possibly through a multi-step wizard.
- The application must be responsive and work on modern web browsers.

### 5.3. Performance
- Bonus calculations for a department of up to 100 employees should complete in under 5 seconds.
- Page load times for data tables should be under 2 seconds.

---

## 6. Assumptions & Constraints

- **Assumption:** The company has a well-defined process for assigning performance ratings.
- **Assumption:** Project revenue and employee assignments can be clearly determined for a given bonus period.
- **Constraint:** The application will be built using Next.js for the frontend and Supabase for the backend and database.
- **Constraint:** The initial version will be an internal tool and will not be public-facing.

---

## 7. Success Metrics

- **Adoption Rate:** 90% of department managers actively use the tool for quarterly bonus calculations within 6 months of launch.
- **Time Savings:** Average time to calculate bonuses per department is reduced from 8 hours to under 2 hours.
- **User Satisfaction:** Average user satisfaction score of 4.5/5 or higher.
- **Data Accuracy:** Zero calculation errors reported in the first two bonus cycles post-launch.