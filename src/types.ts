export interface Engagement {
  id: string;
  title: string;
  date: string; // ISO date format "YYYY-MM-DD" or raw display text like "14 OCT"
  rawDate: string; // "14 OCT"
  time: string; // "10:30 AM"
  location: string; // "Board Room Crystal"
  type: "INTERNAL" | "CLIENT" | "STRATEGIC" | "OTHER";
  status: "active" | "warning" | "error";
  attendees: string[]; // Avatar URLs
  description?: string;
}

export interface CheckInLog {
  id: string;
  timestamp: string; // e.g. "08:45 AM"
  date: string; // "2026-07-12"
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
  dateSubmitted: string; // YYYY-MM-DD
  status: "pending" | "approved" | "rejected";
  details: {
    startDate?: string;
    endDate?: string;
    leaveType?: string; // e.g. Annual, Sick
    amount?: number; // for loan
    repaymentMonths?: number; // for loan
    destination?: string; // for deputation
    purpose?: string; // for deputation
    hoursRequested?: number; // for overtime
    overtimeDate?: string;
    language?: "Arabic" | "English" | "Both"; // for salary certificate
    notes?: string;
  };
}

export interface SentimentReport {
  timestamp: string;
  score: number;
  status: string;
  analysis: string;
}


