const ExcelJS = require('exceljs');
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

async function generateTemplate() {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Employees');

  // Add headers
  worksheet.addRow(headers);

  // Write to file
  const outputPath = path.join(__dirname, '../public/employee_import_template.xlsx');
  await workbook.xlsx.writeFile(outputPath);

  console.log('XLSX template generated successfully at:', outputPath);
}

generateTemplate().catch(console.error);