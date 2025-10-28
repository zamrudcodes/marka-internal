# Employee Management Documentation

## 1. Overview

The Employee Management module is the foundation of the payroll system. It provides the necessary tools for HR Administrators to maintain accurate and up-to-date records for all employees. This documentation covers the core functionalities: adding, viewing, editing, and deactivating employee records.

## 2. Core Features

The module is designed around the following key features:

*   **Centralized Employee Database**: A single source of truth for all employee information.
*   **Detailed Employee Profiles**: Each employee has a comprehensive profile covering personal, employment, and salary details.
*   **Status Management**: Employees can be marked as "active" or "inactive" to ensure they are correctly included or excluded from payroll runs.
*   **Audit Trails**: Changes to employee records are tracked to maintain data integrity.

---

## 3. Step-by-Step Guide

### 3.1. Adding a New Employee

**Objective:** To create a new employee record in the system.

**Process:**

1.  **Navigate to the Employees Page**: From the main application menu, select "Employees."
2.  **Initiate Creation**: Click the "Add Employee" button.
3.  **Complete the Form**: A form will be displayed with the following sections:
    *   **Personal Details**: First Name, Last Name, Email, Phone Number, Address.
    *   **Employment Details**: Job Title, Department, Hire Date.
    *   **Salary Information**: Salary Amount, Pay Frequency (e.g., Monthly, Bi-weekly).
4.  **Save the Record**: After filling in all required fields, click "Save." The new employee will be added to the system and will appear in the main employee list.

**System Logic and Validations:**
*   **Required Fields**: All mandatory fields must be completed before the record can be saved. The system will display an error message indicating any missing fields.
*   **Unique Email**: The system will check if the provided email address already exists for another employee and will prevent the creation of a duplicate record.
*   **Data Formatting**: Input validation will be applied to ensure that data such as email addresses, phone numbers, and dates are in the correct format.
*   **Access Control**: This functionality is restricted to users with "HR Administrator" privileges.

### 3.2. Viewing Employee Details

**Objective:** To view a list of all employees and access their detailed profiles.

**Process:**

1.  **Employee List**: The main "Employees" page displays a table of all active employees. The table includes key information such as:
    *   Employee Name
    *   Job Title
    *   Department
    *   Hire Date
2.  **Search and Sort**: The employee list is equipped with search functionality to quickly find a specific employee. The list can also be sorted by any of the columns.
3.  **Access Detailed Profile**: To view the full details of an employee, click on their name in the list. This will navigate you to their dedicated profile page, which displays all their personal, employment, and salary information.

**System Logic and Considerations:**
*   **Pagination**: To ensure performance, the employee list will be paginated if the number of employees is large.
*   **Data Masking**: Sensitive information, such as salary details, may be masked or hidden by default, requiring specific permissions to view.

### 3.3. Editing Employee Information

**Objective:** To update the records of an existing employee.

**Process:**

1.  **Navigate to Employee Profile**: First, locate and open the profile of the employee you wish to edit.
2.  **Enable Editing**: Click the "Edit" button. The fields on the profile page will become editable.
3.  **Make Changes**: Update any of the personal, employment, or salary details as needed.
4.  **Save Changes**: Click the "Save" button to commit the changes. The employee's profile will be updated with the new information.

**System Logic and Considerations:**
*   **Audit Trail**: Every change made to an employee's record is logged. The audit trail captures what was changed, who made the change, and the timestamp. This is crucial for compliance and data integrity.
*   **Effective Dating**: When salary information is changed, the system should prompt for an "effective date." This ensures that the change only applies to payroll runs that occur after this date, preserving the accuracy of historical payroll data.
*   **Concurrent Editing**: The system should have a mechanism to prevent conflicts if two administrators attempt to edit the same employee's record simultaneously.

### 3.4. Deactivating an Employee

**Objective:** To mark an employee as "inactive" upon their termination.

**Process:**

1.  **Navigate to Employee Profile**: Open the profile of the employee who is being terminated.
2.  **Initiate Deactivation**: Click the "Deactivate Employee" option.
3.  **Provide Details**: A dialog will appear prompting you to enter:
    *   **Termination Date**: The employee's last day of employment.
    *   **Reason for Deactivation**: (Optional but recommended for record-keeping).
4.  **Confirm**: After entering the details, confirm the deactivation.

**System Logic and Considerations:**
*   **Status Change**: The employee's status will be changed from "active" to "inactive."
*   **Exclusion from Payroll**: The employee will no longer be included in any payroll runs that occur after their termination date.
*   **Inactive Employee List**: Deactivated employees will be removed from the main employee list but can be accessed through a separate "Inactive Employees" filter or page.
*   **Final Pay**: The system should have a process to handle the calculation of the final pay for the terminated employee, which may include pro-rated salary and any final settlements.
*   **Reactivation**: There should be a process to reactivate an employee if they are rehired.

---

## 4. Data Models and Schema

### 4.1. Employees Table Structure

The [`employees`](supabase/schema.sql:14) table is the core data structure for employee management. Below is the complete schema:

**Primary Fields:**
- `id` (UUID): Primary key, auto-generated
- `first_name` (VARCHAR(100)): Employee's first name (required)
- `last_name` (VARCHAR(100)): Employee's last name (required)
- `email` (VARCHAR(255)): Unique email address (required)
- `status` (VARCHAR(20)): Employee status - 'active', 'inactive', or 'archived' (default: 'active')

**Employment Information:**
- `department_id` (UUID): Foreign key to [`departments`](supabase/schema.sql:5) table
- `salary` (DECIMAL(12,2)): Employee's salary amount
- `hire_date` (DATE): Date when employee was hired
- `contract_status` (VARCHAR(50)): Type of contract (permanent, contract, probation)
- `tenure_months` (INTEGER): Length of employment in months
- `pkwt` (VARCHAR(50)): Fixed-term employment agreement details
- `pkwt_synced` (BOOLEAN): Whether PKWT is synchronized

**Personal Information:**
- `preferred_nickname` (VARCHAR(100)): Preferred name
- `gender` (VARCHAR(50)): Gender
- `birth_date` (DATE): Date of birth
- `age` (INTEGER): Current age
- `birthplace` (VARCHAR(100)): Place of birth
- `marital_status` (VARCHAR(50)): Marital status (single, married, divorced)
- `current_address` (TEXT): Current residential address
- `phone_number` (VARCHAR(50)): Contact phone number

**Emergency Contact:**
- `emergency_contact_phone` (VARCHAR(50)): Emergency contact phone number
- `emergency_contact_name_relationship` (VARCHAR(255)): Emergency contact name and relationship

**Lark Integration:**
- `lark_user` (VARCHAR(255)): Lark user ID
- `lark_work_email` (VARCHAR(255)): Lark work email address
- `lark_status` (VARCHAR(50)): Status in Lark system

**Social Media:**
- `instagram_handle` (VARCHAR(100)): Instagram username

**Documents & Banking:**
- `ktp_photo_url` (VARCHAR(255)): URL to KTP (ID card) photo
- `npwp_photo_url` (VARCHAR(255)): URL to NPWP (tax ID) photo
- `semi_formal_photo_url` (VARCHAR(255)): URL to semi-formal photo
- `kartu_keluarga_number` (VARCHAR(50)): Family card number
- `bca_account_number` (VARCHAR(50)): BCA bank account number
- `bpjs_tk_id` (VARCHAR(50)): BPJS employment insurance ID

**Audit Fields:**
- `created_at` (TIMESTAMP): Record creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

### 4.2. Related Tables

**Departments Table:**
The [`departments`](supabase/schema.sql:5) table stores organizational departments:
- `id` (UUID): Primary key
- `name` (VARCHAR(255)): Department name
- `description` (TEXT): Department description
- `created_at`, `updated_at`: Audit timestamps

**Relationship:** Each employee belongs to one department via [`department_id`](src/app/employees/page.tsx:432) foreign key.

### 4.3. Database Constraints

- **Unique Constraint:** Email addresses must be unique across all employees
- **Status Check:** Status field is constrained to 'active', 'inactive', or 'archived'
- **Foreign Key:** [`department_id`](supabase/schema.sql:16) references departments table with ON DELETE SET NULL
- **Index:** Performance index on [`department_id`](supabase/schema.sql:120) for faster queries

---

## 5. Technical Implementation

### 5.1. Frontend Components

**Main Page Component:** [`src/app/employees/page.tsx`](src/app/employees/page.tsx:30)

The employee management interface is built using React with the following key features:

**State Management:**
- Employee list state with active/inactive filtering
- Department data for dropdown selections
- Dialog states for add/edit/view operations
- Table state management using TanStack Table (sorting, filtering, pagination, column visibility)
- Row selection for bulk operations

**Key Functions:**
- [`loadData()`](src/app/employees/page.tsx:79): Fetches employees and departments from the database
- [`handleAddEmployee()`](src/app/employees/page.tsx:95): Processes new employee form submission
- [`handleUpdateEmployee()`](src/app/employees/page.tsx:116): Updates existing employee records
- [`handleDeleteEmployee()`](src/app/employees/page.tsx:130): Deletes individual employee records
- [`handleBulkDelete()`](src/app/employees/page.tsx:145): Deletes multiple selected employees

**UI Features:**
- Tab-based filtering (Active/Inactive/All)
- Customizable column visibility
- Bulk import functionality (CSV/XLSX)
- Bulk delete with multi-select
- Comprehensive add/edit forms with validation
- Detailed employee profile view

### 5.2. Server Actions

**Actions File:** [`src/app/employees/actions.ts`](src/app/employees/actions.ts:1)

All database operations are handled through server actions:

**Core Actions:**
- [`getEmployees()`](src/app/employees/actions.ts:7): Retrieves all employees with department information
- [`addEmployee(formData)`](src/app/employees/actions.ts:27): Creates a new employee record
- [`updateEmployee(formData)`](src/app/employees/actions.ts:74): Updates an existing employee
- [`deleteEmployee(formData)`](src/app/employees/actions.ts:123): Removes an employee from the system

**Bulk Import:**
- [`bulkImportEmployees(formData)`](src/app/employees/actions.ts:188): Handles CSV/XLSX file uploads
- Supports two formats:
  * Standard template (30 columns)
  * HR Base format (37 columns) - auto-detected
- Features:
  * Automatic format detection via [`detectFileFormat()`](src/app/employees/actions.ts:137)
  * Date parsing with Excel date number support via [`parseDate()`](src/app/employees/actions.ts:165)
  * Employee name parsing via [`parseEmployeeName()`](src/app/employees/actions.ts:154)
  * Department name to ID mapping
  * Email-based deduplication
  * Upsert operation (update existing or insert new)

### 5.3. Table Columns Configuration

**Columns File:** [`src/app/employees/columns.tsx`](src/app/employees/columns.tsx:1)

Defines the data table structure with the following columns:
- Name (combined first and last name)
- Email
- Department (with relationship lookup)
- Salary (formatted as currency)
- Hire Date (formatted date)
- Status (badge display)
- Additional fields (Lark User, Nickname, Gender, Phone, Contract Status, Tenure)

**Actions Column:**
Each row includes an actions menu with:
- Edit: Opens edit dialog with pre-filled form
- View Details: Shows comprehensive employee information
- Copy Employee ID: Copies UUID to clipboard

### 5.4. Form Validation

**Required Fields:**
- First Name
- Last Name
- Email (with format validation)
- Department
- Hire Date

**Optional Fields:**
All other fields are optional and can be filled in as information becomes available.

**Data Type Validation:**
- Email format validation
- Numeric validation for salary, age, tenure
- Date format validation
- URL format for photo URLs

### 5.5. Bulk Import Templates

Two downloadable templates are provided:

1. **CSV Template:** [`/employee_import_template.csv`](public/employee_import_template.csv:1)
2. **XLSX Template:** [`/employee_import_template.xlsx`](public/employee_import_template.xlsx:1)

Both templates include all 30 standard fields with proper headers for easy data entry.

---

## 6. User Interface Details

### 6.1. Employee List View

The main employee list displays in a data table with:
- **Tabs:** Filter by Active, Inactive, or All employees
- **Search:** Quick search across all visible columns
- **Sorting:** Click column headers to sort
- **Column Visibility:** Customize which columns to display via dropdown menu
- **Pagination:** Navigate through large employee lists
- **Bulk Selection:** Select multiple employees for bulk operations

### 6.2. Add Employee Dialog

A comprehensive form organized into sections:
1. **Basic Information:** Name, nickname, email, phone, gender
2. **Employment Details:** Department, salary, hire date, contract status, tenure, PKWT
3. **Personal Information:** Birth date, age, birthplace, marital status, PTKP status, address
4. **Emergency Contact:** Phone and contact name/relationship
5. **Lark Integration:** Lark user ID, work email, status, Instagram handle
6. **Documents & Banking:** KTP, NPWP, photos, family card, bank account, BPJS ID

**Form Actions:**
- **Cancel:** Close dialog without saving
- **Add Employee:** Save and close dialog
- **Save and Add New:** Save and keep dialog open for adding another employee

### 6.3. Edit Employee Dialog

Similar to the Add dialog but pre-filled with existing employee data. Includes an additional **Status** field to change employee status between active and inactive.

### 6.4. View Employee Details

A read-only view displaying all employee information organized in the same sections as the edit form. Provides a comprehensive overview without the ability to modify data.

### 6.5. Bulk Import Dialog

Simple file upload interface with:
- File input accepting CSV, XLSX, or XLS files
- Links to download template files
- Format information and supported file types
- Import button to process the file

---

## 7. Security and Access Control

### 7.1. Authentication

All employee management operations require authentication. The system uses Supabase authentication to verify user identity before allowing any database operations.

### 7.2. Authorization

**Role-Based Access:**
- Only users with "HR Administrator" privileges can access the employee management module
- This restriction should be enforced at both the UI and API levels

**Planned RLS Policies:**
Row-Level Security (RLS) policies should be implemented in Supabase to ensure:
- Users can only access employee data they are authorized to view
- Modifications are logged with user information
- Sensitive fields (salary, documents) have additional access restrictions

### 7.3. Data Privacy

**Sensitive Information:**
- Salary information
- Personal documents (KTP, NPWP)
- Banking details
- Emergency contact information

These fields should have additional access controls and may be masked in certain views or for certain user roles.

---

## 8. Best Practices and Recommendations

### 8.1. Data Entry

1. **Complete Required Fields First:** Always fill in first name, last name, email, department, and hire date before saving
2. **Use Consistent Formats:** Maintain consistent date formats, phone number formats, and naming conventions
3. **Verify Email Addresses:** Ensure email addresses are valid and unique before submission
4. **Regular Updates:** Keep employee information current, especially contact details and employment status

### 8.2. Bulk Import

1. **Use Templates:** Always start with the provided CSV or XLSX templates
2. **Validate Data:** Review data in the template before importing
3. **Test with Small Batches:** For large imports, test with a small subset first
4. **Check Department Names:** Ensure department names in the import file exactly match existing departments
5. **Review Import Results:** After import, verify that all records were created correctly

### 8.3. Status Management

1. **Active Status:** Use for current employees who should be included in payroll
2. **Inactive Status:** Use for terminated employees or those on extended leave
3. **Archived Status:** Reserved for historical records that should not appear in normal operations
4. **Timely Updates:** Update employee status promptly when employment status changes

### 8.4. Audit Trail

1. **Document Changes:** The system automatically tracks when records are created and updated
2. **Effective Dating:** When making salary changes, note the effective date in the system
3. **Termination Records:** When deactivating an employee, document the termination date and reason

---

## 9. Troubleshooting

### 9.1. Common Issues

**Issue: Cannot add employee - email already exists**
- **Solution:** Check if the employee already exists in the system. Email addresses must be unique.

**Issue: Bulk import fails**
- **Solution:** Verify the file format matches the template. Check for:
  * Correct number of columns
  * Valid department names
  * Proper date formats
  * No special characters in required fields

**Issue: Employee not appearing in list**
- **Solution:** Check the status filter (Active/Inactive/All tabs). The employee may be in a different status category.

**Issue: Cannot edit employee**
- **Solution:** Verify you have the necessary permissions. Only HR Administrators can edit employee records.

### 9.2. Data Validation Errors

If you encounter validation errors:
1. Check that all required fields are filled
2. Verify email format is valid
3. Ensure numeric fields contain only numbers
4. Confirm dates are in the correct format (YYYY-MM-DD)
5. Check that department exists in the system

---

## 10. Future Enhancements

### 10.1. Planned Features

1. **Advanced Search:** Full-text search across all employee fields
2. **Export Functionality:** Export employee data to CSV/XLSX
3. **Document Management:** Direct upload and storage of employee documents
4. **Automated Notifications:** Email notifications for status changes
5. **Employee Self-Service:** Portal for employees to update their own information
6. **Integration with Payroll:** Direct link to payroll processing
7. **Performance Reviews:** Integration with performance management system
8. **Organizational Chart:** Visual representation of company structure

### 10.2. Reporting Capabilities

Future reporting features may include:
- Employee demographics reports
- Turnover analysis
- Department headcount reports
- Tenure distribution
- Contract status summaries
- Salary range analysis

---

## 11. Related Documentation

- [Payroll Processing Documentation](./payroll-processing.md)
- [Reporting Documentation](./reporting.md)
- [User Stories - Employee Management](../user-stories/01-employee-management.md)
- [Database Schema](../../../supabase/schema.sql)

---

## 12. Support and Contact

For technical issues or questions about the Employee Management module:
1. Check this documentation first
2. Review the troubleshooting section
3. Contact your system administrator
4. Submit a support ticket through the internal help desk

---

*Last Updated: 2025-10-28*
*Version: 1.0*