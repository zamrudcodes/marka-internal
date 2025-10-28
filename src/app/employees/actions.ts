"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import * as XLSX from 'xlsx';
import { toTitleCase } from "@/lib/utils/text-format";

export async function getEmployees() {
  const supabase = await createClient();
  const { data: employees, error } = await supabase
    .from("employees")
    .select(`
      *,
      departments (
        id,
        name
      )
    `);

  if (error) {
    console.error("Error fetching employees:", error);
    return [];
  }

  return employees;
}

// Helper function to calculate tenure in months
function calculateTenureMonths(hireDate: string | null): number | null {
  if (!hireDate) return null;
  
  const hire = new Date(hireDate);
  const now = new Date();
  
  const years = now.getFullYear() - hire.getFullYear();
  const months = now.getMonth() - hire.getMonth();
  
  return years * 12 + months;
}

export async function addEmployee(formData: FormData) {
  const supabase = await createClient();

  const hireDate = (formData.get("hire_date") as string) || null;
  const tenureMonths = calculateTenureMonths(hireDate);

  const employeeData: any = {
    first_name: toTitleCase(formData.get("first_name") as string),
    last_name: toTitleCase(formData.get("last_name") as string),
    email: (formData.get("email") as string)?.toLowerCase(),
    salary: Number(formData.get("salary")),
    department_id: formData.get("department_id") as string || null,
    hire_date: hireDate,
    status: 'active',
    lark_user: toTitleCase(formData.get("lark_user") as string),
    preferred_nickname: toTitleCase(formData.get("preferred_nickname") as string),
    lark_work_email: (formData.get("lark_work_email") as string)?.toLowerCase(),
    gender: toTitleCase(formData.get("gender") as string),
    contract_status: toTitleCase(formData.get("contract_status") as string),
    tenure_months: tenureMonths,
    marital_status: toTitleCase(formData.get("marital_status") as string),
    ptkp_status: formData.get("ptkp_status") as string,
    instagram_handle: formData.get("instagram_handle") as string,
    ktp_photo_url: formData.get("ktp_photo_url") as string,
    npwp_photo_url: formData.get("npwp_photo_url") as string,
    kartu_keluarga_number: formData.get("kartu_keluarga_number") as string,
    bca_account_number: formData.get("bca_account_number") as string,
    semi_formal_photo_url: formData.get("semi_formal_photo_url") as string,
    birth_date: (formData.get("birth_date") as string) || null,
    age: Number(formData.get("age")) || null,
    birthplace: toTitleCase(formData.get("birthplace") as string),
    current_address: toTitleCase(formData.get("current_address") as string),
    emergency_contact_phone: formData.get("emergency_contact_phone") as string,
    emergency_contact_name_relationship: toTitleCase(formData.get("emergency_contact_name_relationship") as string),
    phone_number: formData.get("phone_number") as string,
    lark_status: toTitleCase(formData.get("lark_status") as string),
    pkwt: formData.get("pkwt") as string,
    pkwt_synced: (formData.get("pkwt_synced") === 'on' || formData.get("pkwt_synced") === 'true'),
    bpjs_tk_id: formData.get("bpjs_tk_id") as string,
  };

  const { error } = await supabase.from("employees").insert([employeeData]);

  if (error) {
    console.error("Error adding employee:", error);
    throw new Error(error.message);
  }

  revalidatePath("/employees");
}

export async function updateEmployee(formData: FormData) {
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const hireDate = formData.get("hire_date") as string;
  const tenureMonths = calculateTenureMonths(hireDate);

  const employeeData: any = {
    first_name: toTitleCase(formData.get("first_name") as string),
    last_name: toTitleCase(formData.get("last_name") as string),
    email: (formData.get("email") as string)?.toLowerCase(),
    salary: Number(formData.get("salary")),
    department_id: formData.get("department_id") as string,
    hire_date: hireDate,
    status: formData.get("status") as string,
    lark_user: toTitleCase(formData.get("lark_user") as string),
    preferred_nickname: toTitleCase(formData.get("preferred_nickname") as string),
    lark_work_email: (formData.get("lark_work_email") as string)?.toLowerCase(),
    gender: toTitleCase(formData.get("gender") as string),
    contract_status: toTitleCase(formData.get("contract_status") as string),
    tenure_months: tenureMonths,
    marital_status: toTitleCase(formData.get("marital_status") as string),
    ptkp_status: formData.get("ptkp_status") as string,
    instagram_handle: formData.get("instagram_handle") as string,
    ktp_photo_url: formData.get("ktp_photo_url") as string,
    npwp_photo_url: formData.get("npwp_photo_url") as string,
    kartu_keluarga_number: formData.get("kartu_keluarga_number") as string,
    bca_account_number: formData.get("bca_account_number") as string,
    semi_formal_photo_url: formData.get("semi_formal_photo_url") as string,
    birth_date: formData.get("birth_date") as string,
    age: Number(formData.get("age")),
    birthplace: toTitleCase(formData.get("birthplace") as string),
    current_address: toTitleCase(formData.get("current_address") as string),
    emergency_contact_phone: formData.get("emergency_contact_phone") as string,
    emergency_contact_name_relationship: toTitleCase(formData.get("emergency_contact_name_relationship") as string),
    phone_number: formData.get("phone_number") as string,
    lark_status: toTitleCase(formData.get("lark_status") as string),
    pkwt: formData.get("pkwt") as string,
    pkwt_synced: (formData.get("pkwt_synced") === 'on' || formData.get("pkwt_synced") === 'true'),
    bpjs_tk_id: formData.get("bpjs_tk_id") as string,
  };

  const { error } = await supabase.from("employees").update(employeeData).eq("id", id);

  if (error) {
    console.error("Error updating employee:", error);
    throw new Error(error.message);
  }

  revalidatePath("/employees");
}

export async function deleteEmployee(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  const { error } = await supabase.from("employees").delete().eq("id", id);

  if (error) {
    console.error("Error deleting employee:", error);
    throw new Error(error.message);
  }

  revalidatePath("/employees");
}

export async function deactivateEmployee(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const terminationDate = formData.get("termination_date") as string;
  const reason = formData.get("reason") as string;

  // Store termination info in a metadata field or separate table
  // For now, we'll just update the status
  const { error } = await supabase
    .from("employees")
    .update({
      status: 'inactive',
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    console.error("Error deactivating employee:", error);
    throw new Error(error.message);
  }

  // TODO: Log termination date and reason to audit trail table
  console.log(`Employee ${id} deactivated. Termination date: ${terminationDate}, Reason: ${reason}`);

  revalidatePath("/employees");
}

export async function exportEmployees(format: 'csv' | 'xlsx') {
  const supabase = await createClient();
  const { data: employees, error } = await supabase
    .from("employees")
    .select(`
      *,
      departments (
        id,
        name
      )
    `);

  if (error) {
    console.error("Error fetching employees for export:", error);
    throw new Error(error.message);
  }

  return employees;
}
// Helper function to detect file format based on headers
function detectFileFormat(headers: any[]): 'template' | 'hr_base' | 'unknown' {
  const headerStr = headers.map(h => h?.toString().toLowerCase().trim()).join('|');
  
  // Check for HR Base format
  if (headerStr.includes('employee name') && headerStr.includes('employee id') && headerStr.includes('join date')) {
    return 'hr_base';
  }
  
  // Check for template format
  if (headerStr.includes('first_name') && headerStr.includes('last_name') && headerStr.includes('hire_date')) {
    return 'template';
  }
  
  return 'unknown';
}

// Helper function to parse employee name into first and last name
function parseEmployeeName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { first_name: parts[0], last_name: '' };
  }
  const last_name = parts.pop() || '';
  const first_name = parts.join(' ');
  return { first_name, last_name };
}

// Helper function to parse date in various formats
function parseDate(dateValue: any): string | null {
  if (!dateValue) return null;
  
  const dateStr = dateValue.toString().trim();
  if (!dateStr) return null;
  
  // Try parsing as Excel date number
  if (!isNaN(dateStr) && Number(dateStr) > 1000) {
    const excelDate = XLSX.SSF.parse_date_code(Number(dateStr));
    if (excelDate) {
      return `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
    }
  }
  
  // Try parsing ISO format or other common formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return null;
}

export async function bulkImportEmployees(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file uploaded.");
  }

  // Fetch departments to map names to IDs
  const { data: departments, error: deptError } = await supabase.from("departments").select('id, name');
  if (deptError) {
    console.error("Error fetching departments:", deptError);
    throw new Error("Could not fetch departments for import.");
  }
  const departmentNameToIdMap = new Map(departments.map(dept => [dept.name.trim().toLowerCase(), dept.id]));

  let headers: any[] = [];
  let rows: any[] = [];
  const fileName = file.name.toLowerCase();

  // Check file type and parse accordingly
  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    // Parse XLSX file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
    
    if (jsonData.length < 2) {
      throw new Error("File must contain at least a header row and one data row.");
    }
    
    headers = jsonData[0] as any[];
    rows = jsonData.slice(1).filter((row: any) => row && row.length > 0 && row.some((cell: any) => cell !== null && cell !== undefined && cell !== ''));
  } else if (fileName.endsWith('.csv')) {
    // Parse CSV file
    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim() !== "");
    
    if (lines.length < 2) {
      throw new Error("File must contain at least a header row and one data row.");
    }
    
    headers = lines[0].split(",");
    rows = lines.slice(1).map(line => line.split(","));
  } else {
    throw new Error("Unsupported file format. Please upload a CSV or XLSX file.");
  }

  // Detect file format
  const fileFormat = detectFileFormat(headers);
  
  if (fileFormat === 'unknown') {
    throw new Error("Unable to detect file format. Please use the provided template or HR Base format.");
  }

  const employees = rows.map((fields, index) => {
    let employeeData: any = {};
    const truncate = (str: string, length: number) => str && str.length > length ? str.substring(0, length) : str;
    
    if (fileFormat === 'hr_base') {
      // Map HR Base format (37 columns)
      // Column indices based on the HR Base file structure
      const fullName = fields[0]?.toString().trim() || '';
      const { first_name, last_name } = parseEmployeeName(fullName);
      
      employeeData = {
        first_name: truncate(first_name, 100),
        last_name: truncate(last_name, 100),
        email: truncate(fields[30]?.toString().trim() || '', 100), // Email column
        salary: null, // Not in HR Base file
        department_id: null, // Will be mapped from Department column
        hire_date: parseDate(fields[4]) || new Date().toISOString().split('T')[0], // Join Date
        status: fields[12]?.toString().toLowerCase().includes('active') ? 'active' : 'inactive', // Employment Status
        lark_user: truncate(fields[2]?.toString().trim() || '', 100), // Lark User
        preferred_nickname: truncate(fields[3]?.toString().trim() || '', 100), // Preferred Nickname
        lark_work_email: truncate(fields[10]?.toString().trim() || '', 100), // Lark User.Work email
        gender: truncate(fields[11]?.toString().trim() || '', 50), // Gender
        contract_status: truncate(fields[13]?.toString().trim() || '', 100), // Contract Status
        tenure_months: Number(fields[14]) || null, // Tenure (months)
        marital_status: truncate(fields[15]?.toString().trim() || '', 50), // Marital Status
        instagram_handle: truncate(fields[16]?.toString().trim() || '', 100), // Instagram
        ktp_photo_url: truncate(fields[17]?.toString().trim() || '', 255), // KTP
        npwp_photo_url: truncate(fields[19]?.toString().trim() || '', 255), // NPWP
        kartu_keluarga_number: truncate(fields[21]?.toString().trim() || '', 100), // Kartu Keluarga #
        bca_account_number: truncate(fields[22]?.toString().trim() || '', 100), // BCA Account
        semi_formal_photo_url: truncate(fields[23]?.toString().trim() || '', 255), // Semi Formal Photo
        birth_date: parseDate(fields[24]), // Birth Date
        age: Number(fields[25]) || null, // Age
        birthplace: truncate(fields[26]?.toString().trim() || '', 100), // Birthplace
        current_address: truncate(fields[27]?.toString().trim() || '', 255), // Current Address
        emergency_contact_phone: truncate(fields[28]?.toString().trim() || '', 100), // Emergency Contact
        emergency_contact_name_relationship: truncate(fields[29]?.toString().trim() || '', 100), // Emergency Contact Name & Relationship
        phone_number: truncate(fields[31]?.toString().trim() || '', 100), // Phone Number
        lark_status: truncate(fields[32]?.toString().trim() || '', 100), // Lark Status
        pkwt: truncate(fields[34]?.toString().trim() || '', 100), // PKWT
        pkwt_synced: fields[35]?.toString().trim() === '1', // PKWT-synced
        bpjs_tk_id: truncate(fields[36]?.toString().trim() || '', 100), // Nomor ID BPJS TK
      };
      
      // Map department
      const departmentName = fields[6]?.toString().trim() || '';
      if (departmentName) {
        const deptId = departmentNameToIdMap.get(departmentName.toLowerCase());
        if (deptId) {
          employeeData.department_id = deptId;
        } else {
          console.warn(`Department "${departmentName}" not found for employee ${fullName}.`);
        }
      }
      
    } else if (fileFormat === 'template') {
      // Map template format (30 columns) - original logic
      if (fields.length !== 30) {
        throw new Error(`Row ${index + 2} is malformed. Expected 30 columns, but got ${fields.length}.`);
      }
      
      const [
        first_name,
        last_name,
        email,
        salary,
        department_name,
        hire_date,
        lark_user,
        preferred_nickname,
        lark_work_email,
        gender,
        contract_status,
        tenure_months,
        marital_status,
        instagram_handle,
        ktp_photo_url,
        npwp_photo_url,
        kartu_keluarga_number,
        bca_account_number,
        semi_formal_photo_url,
        birth_date,
        age,
        birthplace,
        current_address,
        emergency_contact_phone,
        emergency_contact_name_relationship,
        phone_number,
        lark_status,
        pkwt,
        pkwt_synced,
        bpjs_tk_id,
      ] = fields.map((field: any) => field?.toString().trim() || '');

      const department_id = department_name ? departmentNameToIdMap.get(department_name.toLowerCase()) || null : null;
      if (!department_id && department_name) {
        console.warn(`Department "${department_name}" not found. Setting to null for employee ${first_name} ${last_name}.`);
      }

      employeeData = {
        first_name: truncate(first_name, 100),
        last_name: truncate(last_name, 100),
        email: truncate(email, 100),
        salary: Number(salary) || null,
        department_id,
        hire_date: hire_date || new Date().toISOString().split('T')[0],
        status: 'active',
        lark_user: truncate(lark_user, 100),
        preferred_nickname: truncate(preferred_nickname, 100),
        lark_work_email: truncate(lark_work_email, 100),
        gender: truncate(gender, 50),
        contract_status: truncate(contract_status, 100),
        tenure_months: Number(tenure_months) || null,
        marital_status: truncate(marital_status, 50),
        instagram_handle: truncate(instagram_handle, 100),
        ktp_photo_url: truncate(ktp_photo_url, 255),
        npwp_photo_url: truncate(npwp_photo_url, 255),
        kartu_keluarga_number: truncate(kartu_keluarga_number, 100),
        bca_account_number: truncate(bca_account_number, 100),
        semi_formal_photo_url: truncate(semi_formal_photo_url, 255),
        birth_date: birth_date || null,
        age: Number(age) || null,
        birthplace: truncate(birthplace, 100),
        current_address: truncate(current_address, 255),
        emergency_contact_phone: truncate(emergency_contact_phone, 100),
        emergency_contact_name_relationship: truncate(emergency_contact_name_relationship, 100),
        phone_number: truncate(phone_number, 100),
        lark_status: truncate(lark_status, 100),
        pkwt: truncate(pkwt, 100),
        pkwt_synced: (pkwt_synced === 'true' || pkwt_synced === '1'),
        bpjs_tk_id: truncate(bpjs_tk_id, 100),
      };
    }
    
    return employeeData;
  });

  // Deduplicate employees by email (keep the last occurrence)
  const emailMap = new Map();
  employees.forEach(emp => {
    if (emp.email) {
      emailMap.set(emp.email.toLowerCase(), emp);
    }
  });
  const uniqueEmployees = Array.from(emailMap.values());

  console.log(`Processing ${employees.length} rows, ${uniqueEmployees.length} unique employees`);

  // Use upsert to handle duplicate emails - update existing records or insert new ones
  const { error } = await supabase
    .from("employees")
    .upsert(uniqueEmployees, {
      onConflict: 'email',
      ignoreDuplicates: false
    });

  if (error) {
    console.error("Error bulk importing employees:", error);
    return { success: false, message: error.message };
  }

  revalidatePath("/employees");
  return { success: true, message: `Successfully imported/updated ${uniqueEmployees.length} unique employees` };
}