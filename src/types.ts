export interface Engagement {
  id: string;
  title: string;
  date: string;
  rawDate: string;
  time: string;
  location: string;
  type: "INTERNAL" | "CLIENT" | "STRATEGIC" | "OTHER";
  status: "active" | "warning" | "error";
  attendees: string[];
  description?: string;
}

export interface CheckInLog {
  id: string;
  timestamp: string;
  date: string;
  type: "check-in" | "check-out";
  method: "Fingerprint" | "NFC" | "Manual Override";
}

export interface Profile {
  name: string;
  role: string;
  avatarUrl: string;
  officeStatus: "ACTIVE" | "REMOTE" | "OUT_OF_OFFICE";
  weeklyTargetHours: number;
  completedHours: number;
}

export interface HRRequest {
  id: string;
  type: "leave" | "loan" | "deputation" | "overtime" | "salary-certificate";
  typeNameAr: string;
  typeNameEn: string;
  dateSubmitted: string;
  status: "pending" | "approved" | "rejected";
  details: {
    startDate?: string;
    endDate?: string;
    leaveType?: string;
    amount?: number;
    repaymentMonths?: number;
    destination?: string;
    purpose?: string;
    hoursRequested?: number;
    overtimeDate?: string;
    language?: "Arabic" | "English" | "Both";
    notes?: string;
  };
}

export interface SentimentReport {
  timestamp: string;
  score: number;
  status: string;
  analysis: string;
}

export interface Company {
  id: number;
  tenant_id: string;
  name: string;
  name_ar: string;
  cr_number?: string;
  tax_number?: string;
  is_active: boolean;
  created_at: string;
}

export interface Employee {
  id: number;
  empNo: string;
  first_name: string;
  last_name: string;
  email: string;
  company_id?: number;
  company_name?: string;
  department_name?: string;
  status: 'active' | 'inactive';
}

export interface AttendanceRecord {
  id: number;
  employee_name: string;
  check_in: string;
  check_out?: string;
  location?: string;
  work_hours?: string;
  status: string;
}

export interface LeaveRequest {
  id: number;
  employee_name: string;
  type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  status: string;
  reason?: string;
}
