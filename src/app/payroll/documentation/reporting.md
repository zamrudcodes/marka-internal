# Payroll Reporting Documentation

## 1. Overview

The Reporting module provides essential tools for financial analysis, compliance, and employee communication. After a payroll run is finalized and approved, this module allows authorized users to generate a variety of documents, including summary reports for accounting, individual payslips for employees, and bank files for payment processing.

## 2. Key Reporting Features

*   **Financial Summaries**: Generate high-level reports for bookkeeping and financial analysis.
*   **Employee Payslips**: Create detailed, printable payslips for each employee.
*   **Bank Payment Files**: Export data in a format compatible with banking portals for salary disbursement.
*   **Secure and Accessible**: Reports are generated from approved payroll runs, ensuring data accuracy, with access restricted to authorized personnel.

---

## 3. Step-by-Step Guide

### 3.1. Generating a Payroll Summary Report

**Objective:** To create a summary report of a completed payroll run for accounting and record-keeping.

**Process:**

1.  **Navigate to the Payroll Dashboard**: From the main menu, select "Payroll."
2.  **Select an Approved Run**: Locate and click on a payroll run with an "Approved" status.
3.  **Download Report**: On the details page for the approved run, click the "Download Report" button.
4.  **Receive File**: The system will generate and download a summary report, typically in PDF or CSV format.

**Report Contents:**

The summary report will contain the following information:
*   **Header**: Company Name, Pay Period (e.g., "October 2025").
*   **Summary Data**:
    *   Total Gross Pay
    *   A detailed breakdown of all deductions (e.g., Total Tax, Total Insurance).
    *   Total Net Pay
    *   The total number of employees included in the payroll run.

**System Logic and Considerations:**
*   **Data Source**: The report is generated exclusively from the data in an "Approved" payroll run to ensure accuracy and prevent reporting on unfinalized numbers.
*   **Custom Date Ranges**: Future enhancements could allow for the generation of summary reports across multiple pay periods (e.g., quarterly or annually).
*   **Access Control**: Access to financial summary reports should be restricted to roles such as "Finance Officer" or "Payroll Manager."

### 3.2. Generating and Distributing Employee Payslips

**Objective:** To generate individual payslips for all employees in an approved payroll run.

**Process:**

1.  **Select an Approved Run**: Navigate to the details page of an "Approved" payroll run.
2.  **Generate Payslips**: Click the "Generate Payslips" button.
3.  **Download Options**: The system will provide options to:
    *   **Download All**: Download a single compressed file (e.g., a `.zip` file) containing all individual payslips in PDF format.
    *   **Download Individually**: Select specific employees from the list to download their payslips one by one.

**Payslip Contents:**

Each payslip will be a printable document and must include:
*   Employee's full name and other relevant details (e.g., Employee ID).
*   The pay period and the specific pay date.
*   A detailed, itemized list of all earnings (e.g., base salary, bonuses, commissions).
*   A detailed, itemized list of all deductions (e.g., taxes, insurance).
*   The final Gross Pay and Net Pay amounts.

**System Logic and Considerations:**
*   **Secure Distribution**: For security, payslips can be password-protected. Future integrations could allow for secure delivery through a dedicated employee self-service portal.
*   **Historical Access**: The system should be designed to allow employees (e.g., via a portal) or HR administrators to access and retrieve payslips from previous pay periods.

### 3.3. Exporting a Bank Payment File

**Objective:** To create a file formatted for a bank's online portal to process salary payments efficiently.

**Process:**

1.  **Select an Approved Run**: Navigate to the details page of an "Approved" payroll run.
2.  **Export Bank File**: Click the "Export Bank File" option.
3.  **Select Format**: If multiple bank formats are configured, you may be prompted to choose one.
4.  **Download File**: The system will generate and download the bank payment file.

**File Contents:**

The file will be structured according to the bank's specifications, but it will typically contain the following for each employee:
*   Employee's Bank Account Number
*   Employee's Full Name (as registered with the bank)
*   The Net Pay amount to be transferred.

**System Logic and Considerations:**
*   **Configurable Formats**: The system should allow administrators to define different export formats (e.g., CSV with specific columns, fixed-width text files) to match the requirements of various banks.
*   **Data Security**: The generated file contains highly sensitive financial information and must be handled with strict security measures. The file should not be stored unnecessarily, and access to this feature should be highly restricted.
*   **File Naming**: The downloaded file should have a clear and consistent naming convention, such as `Bank-Payment-File_Oct-2025.csv`, to ensure easy identification.

---

## 4. Data Models and Schema

*(This section would typically reference the `PayrollRuns` and `Payslips` tables as the primary data sources for all reporting.)*