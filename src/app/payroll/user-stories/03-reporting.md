### **Epic: Payroll Reporting**

**Description:** As a Payroll Manager or Finance Officer, I need to generate various reports from the payroll system to fulfill accounting, compliance, and employee communication requirements.

---

**User Story 9: Generate Payroll Summary Report**

**Title:** Generate Payroll Summary Report

**As a** Finance Officer,
**I want to** generate a payroll summary report for each approved payroll run,
**So that** I can use it for bookkeeping and financial analysis.

**Acceptance Criteria:**
1.  Given I am viewing an "Approved" payroll run, I can click a "Download Report" button.
2.  When I download the report, I receive a file (e.g., PDF or CSV) that summarizes the entire payroll run.
3.  The report must include:
    *   Total Gross Pay
    *   A breakdown of all deductions (e.g., Total Tax, Total Insurance)
    *   Total Net Pay
    *   Number of employees paid.
4.  The report should be clearly formatted with the company name and the pay period it covers.

**Edge Cases and Considerations:**
*   The ability to generate reports for a custom date range (e.g., quarterly, annually).
*   Role-based access: Only authorized personnel should be able to access financial summary reports.

---

**User Story 10: Generate and Distribute Employee Payslips**

**Title:** Generate Individual Employee Payslips

**As a** Payroll Manager,
**I want to** generate individual payslips for each employee in an approved payroll run,
**So that** employees have a clear and detailed record of their earnings and deductions for the period.

**Acceptance Criteria:**
1.  Given an "Approved" payroll run, I have an option to "Generate Payslips."
2.  The system generates a separate, printable payslip (e.g., in PDF format) for each employee.
3.  Each payslip must contain:
    *   Employee's name and details.
    *   Pay period and pay date.
    *   A detailed breakdown of earnings (base salary, bonuses).
    *   A detailed breakdown of deductions.
    *   Gross Pay and Net Pay.
4.  I should be able to download all payslips as a single batch (e.g., a zip file of PDFs) or download them individually.

**Edge Cases and Considerations:**
*   Secure distribution of payslips (e.g., password-protected PDFs, or delivery via a secure employee portal).
*   A way for employees to access their historical payslips.

---

**User Story 11: Export Bank Payment File**

**Title:** Export Bank Payment File

**As a** Payroll Manager,
**I want to** export a bank payment file (e.g., a CSV or a specific bank format) from an approved payroll run,
**So that** I can easily upload it to the company's banking portal to process salary payments.

**Acceptance Criteria:**
1.  Given an "Approved" payroll run, I can select an "Export Bank File" option.
2.  The system generates a file formatted for bank transfers, containing the necessary details: employee bank account number, employee name, and the net pay amount.
3.  The format of the export file should be configurable to match the requirements of different banks.
4.  The downloaded file should have a clear and consistent naming convention (e.g., `Bank-Payment-File_Oct-2025.csv`).

**Edge Cases and Considerations:**
*   Data security: The file contains sensitive banking information and must be handled securely.
*   Handling different bank file formats.