const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = 8000;
const PROJECT_ID = 'attendance-app-34a71';

app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// FIREBASE AUTHENTICATION & REST API HELPERS
// ----------------------------------------------------
let accessToken = '';
const FIREBASE_TOKEN = process.env.FIREBASE_TOKEN || '';

async function refreshAccessToken() {
  if (FIREBASE_TOKEN) {
    console.log('[Firebase] 🔄 Refreshing access token via Google OAuth REST API...');
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
          grant_type: 'refresh_token',
          refresh_token: FIREBASE_TOKEN
        })
      });

      if (response.ok) {
        const data = await response.json();
        accessToken = data.access_token;
        console.log('[Firebase] ✅ Token refreshed successfully.');
      } else {
        const err = await response.text();
        console.error('[Firebase] ❌ Failed to refresh token via OAuth:', err);
      }
    } catch (e) {
      console.error('[Firebase] ❌ Error refreshing token via OAuth:', e.message);
    }
  } else {
    console.log('[Firebase] 🔄 Refreshing access token via Firebase CLI...');
    try {
      execSync('npx firebase-tools projects:list', { stdio: 'ignore' });
      accessToken = getLocalAccessToken();
      console.log('[Firebase] ✅ Token refreshed successfully.');
    } catch (e) {
      console.error('[Firebase] ❌ Failed to refresh token:', e.message);
    }
  }
}

function getLocalAccessToken() {
  try {
    const configPath = path.join(process.env.HOME || '/Users/belalalbanna', '.config/configstore/firebase-tools.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.tokens && config.tokens.access_token) {
        return config.tokens.access_token;
      }
    }
  } catch (e) {
    console.error('[Firebase] Error reading local CLI token:', e);
  }
  return '';
}

// Initialize token
if (FIREBASE_TOKEN) {
  // We will refresh immediately to get access token
  refreshAccessToken();
} else {
  accessToken = getLocalAccessToken();
}

async function firestoreRequest(endpoint, method = 'GET', body = null) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  let response = await fetch(url, options);

  if (response.status === 401 || response.status === 403) {
    console.warn('[Firebase] Token expired or unauthorized. Attempting refresh...');
    refreshAccessToken();
    if (accessToken) {
      options.headers['Authorization'] = `Bearer ${accessToken}`;
      response = await fetch(url, options);
    }
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Firestore REST API Error (${response.status}): ${errText}`);
  }

  if (method === 'DELETE') {
    return { success: true };
  }

  return await response.json();
}

// Serialization / Deserialization Helpers
function fromFirestore(fields) {
  const obj = {};
  if (!fields) return obj;
  for (const key in fields) {
    const valObj = fields[key];
    if ('stringValue' in valObj) {
      obj[key] = valObj.stringValue;
    } else if ('integerValue' in valObj) {
      obj[key] = parseInt(valObj.integerValue);
    } else if ('doubleValue' in valObj) {
      obj[key] = parseFloat(valObj.doubleValue);
    } else if ('booleanValue' in valObj) {
      obj[key] = valObj.booleanValue;
    }
  }
  return obj;
}

function toFirestore(obj) {
  const fields = {};
  for (const key in obj) {
    const val = obj[key];
    if (val === null || val === undefined) continue;
    if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: val.toString() };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    }
  }
  return { fields };
}

// High-level DB Helpers
async function getCollection(collectionName) {
  try {
    const data = await firestoreRequest(`/${collectionName}`);
    if (!data.documents) return [];
    return data.documents.map(doc => {
      const docId = doc.name.split('/').pop();
      return {
        id: isNaN(docId) ? docId : parseInt(docId),
        ...fromFirestore(doc.fields)
      };
    });
  } catch (e) {
    console.error(`[Firebase] Error fetching collection ${collectionName}:`, e.message);
    return [];
  }
}

async function saveDocument(collectionName, documentId, dataObj) {
  const fields = toFirestore(dataObj);
  console.log(`[Firebase] Saving document to ${collectionName}/${documentId}`);
  return await firestoreRequest(`/${collectionName}/${documentId}`, 'PATCH', fields);
}

async function deleteDocument(collectionName, documentId) {
  console.log(`[Firebase] Deleting document ${collectionName}/${documentId}`);
  return await firestoreRequest(`/${collectionName}/${documentId}`, 'DELETE');
}

// ----------------------------------------------------
// DATABASE SEEDING
// ----------------------------------------------------
async function seedDatabaseIfEmpty() {
  try {
    console.log('[Firebase] 🔍 Checking if Firestore has data...');
    const employees = await getCollection('employees');
    
    if (employees.length === 0) {
      console.log('[Firebase] 🌱 Seeding initial data into Firestore...');
      
      const seedCompanies = [
        { id: 1, name: "شركة الحلول المتقدمة", logo: "https://ui-avatars.com/api/?name=AS&background=15385E&color=fff", industry: "التقنية", employees: 120, status: "نشط", domain: "solutions.sa", crNumber: "1010111111", taxNumber: "300111111100003", startDate: "2026-01-01", expiryDate: "2027-10-15" },
        { id: 2, name: "مجموعة الشايع للتجارة", logo: "https://ui-avatars.com/api/?name=ST&background=15385E&color=fff", industry: "التجزئة", employees: 450, status: "نشط", domain: "shaya.sa", crNumber: "1010222222", taxNumber: "300222222200003", startDate: "2026-01-01", expiryDate: "2027-10-15" },
        { id: 3, name: "مستشفى التخصصي", logo: "https://ui-avatars.com/api/?name=SH&background=17AE9F&color=fff", industry: "الصحة", employees: 800, status: "نشط", domain: "hospital.sa", crNumber: "1010333333", taxNumber: "300333333300003", startDate: "2026-01-01", expiryDate: "2026-12-01" }
      ];

      const seedEmployees = [
        { id: 1, companyId: 1, empNo: "EMP-1001", name: "أحمد العتيبي", title: "مطور برمجيات أول", department: "التقنية", email: "a.otaibi@solutions.sa", phone: "0500000001", salary: 15000, status: "نشط", avatar: "https://ui-avatars.com/api/?name=أحمد+العتيبي&background=15385E&color=fff", password: "123456" },
        { id: 2, companyId: 1, empNo: "EMP-1002", name: "سارة القحطاني", title: "أخصائية موارد بشرية", department: "الموارد البشرية", email: "s.qahtani@solutions.sa", phone: "0500000002", salary: 12000, status: "نشط", avatar: "https://ui-avatars.com/api/?name=سارة+القحطاني&background=15385E&color=fff", password: "123456" },
        { id: 3, companyId: 1, empNo: "EMP-1003", name: "محمد الشمري", title: "مدير مبيعات", department: "المبيعات", email: "m.shammari@shaya.sa", phone: "0500000003", salary: 18000, status: "نشط", avatar: "https://ui-avatars.com/api/?name=محمد+الشمري&background=17AE9F&color=fff", password: "123456" }
      ];

      const seedLocations = [
        { id: "main_office", name: "المكتب الرئيسي (Main Office)", latitude: 37.7749, longitude: -122.4194, radius_meters: 100.0, is_active: 1 },
        { id: "branch_office", name: "فرع الشركة (Branch Office)", latitude: 37.7849, longitude: -122.4094, radius_meters: 50.0, is_active: 1 }
      ];

      for (const comp of seedCompanies) {
        await saveDocument('companies', comp.id.toString(), comp);
      }

      for (const emp of seedEmployees) {
        await saveDocument('employees', emp.id.toString(), emp);
      }

      for (const loc of seedLocations) {
        await saveDocument('office_locations', loc.id, loc);
      }
      
      console.log('[Firebase] 🎉 Seeding complete.');
    } else {
      console.log('[Firebase] 👍 Firestore already populated.');
    }
  } catch (e) {
    console.error('[Firebase] ❌ Error seeding database:', e.message);
  }
}

// Run Seeding
seedDatabaseIfEmpty();

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password, companyId } = req.body;
  console.log(`[API] Login request: email=${email}, password=${password}, companyId=${companyId}`);
  
  if (!email || !password || !companyId) {
    return res.status(400).json({ success: false, message: 'البريد الإلكتروني وكلمة المرور ومعرف الشركة مطلوبة' });
  }

  try {
    const employees = await getCollection('employees');
    const employee = employees.find(emp => 
      emp.email && emp.email.toLowerCase() === email.trim().toLowerCase() && 
      emp.companyId.toString() === companyId.toString()
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'عذراً، هذا الحساب غير مسجل بالنظام لهذه الشركة.' });
    }

    const dbPassword = employee.password || '123456';
    if (dbPassword !== password) {
      return res.status(401).json({ success: false, message: 'كلمة المرور غير صحيحة' });
    }

    const nameParts = (employee.name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      requirePasswordChange: dbPassword === '123456',
      data: {
        id: employee.id,
        employee_number: employee.empNo || `EMP-${employee.id}`,
        first_name: firstName,
        last_name: lastName,
        email: employee.email,
        phone: employee.phone || '',
        department: employee.department || 'عام',
        position: employee.title || 'موظف',
        companyId: employee.companyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Employees Endpoints
app.get('/api/employees', async (req, res) => {
  const employees = await getCollection('employees');
  res.json(employees);
});

app.post('/api/employees', async (req, res) => {
  const { companyId, empNo, name, title, department, email, phone, salary, status } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: 'الاسم والبريد الإلكتروني مطلوبان' });
  }

  const employees = await getCollection('employees');
  
  if (employees.some(emp => emp.email && emp.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'البريد الإلكتروني مسجل مسبقاً' });
  }

  const newId = employees.length > 0 ? Math.max(...employees.map(e => parseInt(e.id) || 0)) + 1 : 1;
  const newEmployee = {
    id: newId,
    companyId: parseInt(companyId) || 1,
    empNo: empNo || `EMP-${Date.now().toString().slice(-4)}`,
    name,
    title: title || 'موظف',
    department: department || 'عام',
    email,
    phone: phone || '',
    salary: salary || 0,
    status: status || 'نشط',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=17AE9F&color=fff`,
    password: '123456'
  };

  await saveDocument('employees', newId.toString(), newEmployee);
  res.status(201).json(newEmployee);
});

app.put('/api/employees/:id', async (req, res) => {
  const idStr = req.params.id;
  const employees = await getCollection('employees');
  const match = employees.find(emp => emp.id.toString() === idStr);
  if (!match) return res.status(404).json({ error: 'الموظف غير موجود' });

  const updated = { ...match, ...req.body };
  await saveDocument('employees', idStr, updated);
  res.json(updated);
});

app.delete('/api/employees/:id', async (req, res) => {
  const idStr = req.params.id;
  await deleteDocument('employees', idStr);
  res.json({ message: 'تم حذف الموظف بنجاح' });
});

// Companies Endpoints
app.get('/api/companies', async (req, res) => {
  const companies = await getCollection('companies');
  res.json(companies);
});

// Validate company domain
app.get('/api/companies/validate', async (req, res) => {
  const { domain } = req.query;
  console.log(`[API] Validate domain request: ${domain}`);
  if (!domain) {
    return res.status(400).json({ success: false, message: 'النطاق مطلوب' });
  }

  try {
    const companies = await getCollection('companies');
    const company = companies.find(c => c.domain && c.domain.toLowerCase() === domain.trim().toLowerCase());
    
    if (company) {
      return res.json({
        success: true,
        company: {
          id: company.id,
          name: company.name,
          domain: company.domain,
          logo: company.logo
        }
      });
    } else {
      return res.status(404).json({ success: false, message: 'عذراً، هذا النطاق غير مسجل بالنظام.' });
    }
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Create new company
app.post('/api/companies', async (req, res) => {
  const { name, domain, crNumber, taxNumber, employees, startDate, expiryDate, logo, industry, status } = req.body;
  if (!name || !domain) {
    return res.status(400).json({ error: 'اسم الشركة والنطاق مطلوبان' });
  }

  try {
    const companies = await getCollection('companies');
    if (companies.some(c => c.domain && c.domain.toLowerCase() === domain.toLowerCase())) {
      return res.status(400).json({ error: 'هذا النطاق مسجل مسبقاً لشركة أخرى' });
    }

    const newId = companies.length > 0 ? Math.max(...companies.map(c => parseInt(c.id) || 0)) + 1 : 1;
    const newCompany = {
      id: newId,
      name,
      domain,
      crNumber: crNumber || '',
      taxNumber: taxNumber || '',
      employees: parseInt(employees) || 0,
      startDate: startDate || new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || '',
      logo: logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=15385E&color=fff`,
      industry: industry || 'أخرى',
      status: status || 'نشط'
    };

    await saveDocument('companies', newId.toString(), newCompany);
    res.status(201).json(newCompany);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Change employee password
app.post('/api/employees/change-password', async (req, res) => {
  const { employeeId, newPassword } = req.body;
  console.log(`[API] Change password request for employee: ${employeeId}`);
  if (!employeeId || !newPassword) {
    return res.status(400).json({ success: false, message: 'معرف الموظف وكلمة المرور الجديدة مطلوبان' });
  }

  try {
    const idStr = employeeId.toString();
    const employees = await getCollection('employees');
    const match = employees.find(emp => emp.id.toString() === idStr);
    
    if (!match) {
      return res.status(404).json({ success: false, message: 'الموظف غير موجود' });
    }

    const updated = { ...match, password: newPassword };
    await saveDocument('employees', idStr, updated);
    return res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
});

// Office locations
app.get('/api/office-locations', async (req, res) => {
  const locations = await getCollection('office_locations');
  res.json(locations);
});

app.post('/api/office-locations', async (req, res) => {
  const id = `loc_${Date.now()}`;
  const newLoc = {
    id,
    ...req.body,
    is_active: 1
  };
  await saveDocument('office_locations', id, newLoc);
  res.status(201).json(newLoc);
});

// Attendance Endpoints
app.post('/api/attendance/clock-in', async (req, res) => {
  const { employee_id, latitude, longitude, address } = req.body;
  console.log(`[API] Clock-In for employee ${employee_id} at (${latitude}, ${longitude})`);
  
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const docId = `${employee_id}_${dateStr}`;

  const newRecord = {
    id: docId,
    employee_id: parseInt(employee_id),
    date: dateStr,
    clock_in_time: now.toISOString(),
    clock_out_time: '',
    status: 'present',
    clock_in_latitude: latitude || 0,
    clock_in_longitude: longitude || 0,
    clock_in_address: address || '',
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };

  await saveDocument('attendance_records', docId, newRecord);

  res.json({
    success: true,
    message: 'تم تسجيل الحضور (دخول) بنجاح',
    data: newRecord
  });
});

app.post('/api/attendance/clock-out', async (req, res) => {
  const { employee_id, latitude, longitude, address } = req.body;
  console.log(`[API] Clock-Out for employee ${employee_id} at (${latitude}, ${longitude})`);

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const docId = `${employee_id}_${dateStr}`;

  const records = await getCollection('attendance_records');
  const record = records.find(r => r.id === docId);
  
  if (!record) {
    return res.status(400).json({ success: false, message: 'عذراً، لم يتم تسجيل الدخول اليوم بعد.' });
  }

  record.clock_out_time = now.toISOString();
  record.clock_out_latitude = latitude || 0;
  record.clock_out_longitude = longitude || 0;
  record.clock_out_address = address || '';
  record.updated_at = now.toISOString();

  // Calculate working hours
  const checkIn = new Date(record.clock_in_time);
  const diffMs = now - checkIn;
  record.working_hours = diffMs / (1000 * 60 * 60); // in hours

  await saveDocument('attendance_records', docId, record);

  res.json({
    success: true,
    message: 'تم تسجيل الانصراف (خروج) بنجاح',
    data: record
  });
});

app.get('/api/attendance', async (req, res) => {
  const { employee_id, start_date, end_date } = req.query;
  const records = await getCollection('attendance_records');
  
  let filtered = records;
  if (employee_id) {
    filtered = filtered.filter(r => r.employee_id === parseInt(employee_id));
  }
  if (start_date && end_date) {
    filtered = filtered.filter(r => r.date >= start_date && r.date <= end_date);
  }

  res.json({
    success: true,
    data: filtered
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Shared Backend API Server running at http://localhost:${PORT}`);
});
