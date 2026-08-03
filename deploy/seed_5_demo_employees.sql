USE beattend_staging_db;

UPDATE employees SET 
  employee_number = 'EMP-STG-101', first_name = 'بلال', last_name = 'البنا',
  arabic_name = 'بلال فاروق البنا', english_name = 'Belal Albanna', email = 'b.albanna@hadiyah.org.sa',
  phone = '0501234567', identity_number = '1098765432', nationality = 'سعودي', gender = 'male',
  birth_date = '1992-05-15', marital_status = 'متزوج', job_title = 'كبير مهندسي النظم والتقنية',
  hire_date = '2024-01-01', contract_type = 'عقد محدد المدة', bank_name = 'البنك الأهلي السعودي (SNB)',
  iban = 'SA0310000001234567890123', is_active = 1 WHERE id = 1;

UPDATE employees SET 
  employee_number = 'EMP-STG-102', first_name = 'فهد', last_name = 'الدوسري',
  arabic_name = 'فهد بن سلطان الدوسري', english_name = 'Fahad Al-Dosari', email = 'f.dosari@solutions.sa',
  phone = '0509988776', identity_number = '1087654321', nationality = 'سعودي', gender = 'male',
  birth_date = '1990-08-20', marital_status = 'متزوج', job_title = 'مدير قسم تقنية المعلومات',
  hire_date = '2023-06-15', contract_type = 'عقد غير محدد المدة', bank_name = 'مصرف الراجحي',
  iban = 'SA5580000009876543210987', is_active = 1 WHERE id = 2;

INSERT IGNORE INTO employees (
  id, tenant_id, company_id, branch_id, department_id, employee_number,
  first_name, last_name, arabic_name, english_name, email, phone,
  identity_number, nationality, gender, birth_date, marital_status,
  job_title, manager_id, hire_date, contract_type, shift_id, geofence_id,
  bank_name, iban, role_id, is_active, created_at
) VALUES 
(
  3, 'tenant-sol-102', 1, 1, 2, 'EMP-STG-103',
  'سارة', 'العتيبي', 'سارة بنت خالد العتيبي', 'Sarah Al-Otaibi', 's.otaibi@solutions.sa', '0551122334',
  '1076543210', 'سعودي', 'female', '1995-03-10', 'أعزب',
  'أخصائي أول موارد بشرية', 2, '2024-02-01', 'عقد محدد المدة', 1, 1,
  'بنك الرياض', 'SA2020000001122334455667', 3, 1, NOW()
),
(
  4, 'tenant-sol-102', 1, 2, 3, 'EMP-STG-104',
  'عمر', 'الشهري', 'عمر عبد الله الشهري', 'Omar Al-Shehri', 'o.shehri@solutions.sa', '0544455667',
  '1065432109', 'سعودي', 'male', '1988-11-25', 'متزوج',
  'مراقب ماليات وحسابات', 2, '2022-09-01', 'عقد غير محدد المدة', 2, 2,
  'مصرف الإنماء', 'SA0505000004455667788990', 4, 1, NOW()
),
(
  5, 'tenant-sol-102', 1, 2, 4, 'EMP-STG-105',
  'نورة', 'القحطاني', 'نورة بنت محمد القحطاني', 'Noura Al-Qahtani', 'n.qahtani@solutions.sa', '0567788990',
  '1054321098', 'سعودي', 'female', '1996-07-04', 'أعزب',
  'مطور واجهات ومصمم تجربة', 1, '2024-03-15', 'عقد محدد المدة', 1, 2,
  'البنك الأهلي السعودي (SNB)', 'SA0310000009988776655443', 4, 1, NOW()
);
