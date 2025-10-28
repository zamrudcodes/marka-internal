const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Define the headers
const headers = [
  'first_name',
  'last_name',
  'email',
  'salary',
  'department_name',
  'hire_date',
  'lark_user',
  'preferred_nickname',
  'lark_work_email',
  'gender',
  'contract_status',
  'tenure_months',
  'marital_status',
  'instagram_handle',
  'ktp_photo_url',
  'npwp_photo_url',
  'kartu_keluarga_number',
  'bca_account_number',
  'semi_formal_photo_url',
  'birth_date',
  'age',
  'birthplace',
  'current_address',
  'emergency_contact_phone',
  'emergency_contact_name_relationship',
  'phone_number',
  'lark_status',
  'pkwt',
  'pkwt_synced',
  'bpjs_tk_id'
];

// Create a new workbook
const wb = XLSX.utils.book_new();

// Create worksheet with headers
const ws = XLSX.utils.aoa_to_sheet([headers]);

// Add the worksheet to the workbook
XLSX.utils.book_append_sheet(wb, ws, 'Employees');

// Write to file
const outputPath = path.join(__dirname, '../public/employee_import_template.xlsx');
XLSX.writeFile(wb, outputPath);

console.log('XLSX template generated successfully at:', outputPath);