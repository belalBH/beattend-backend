import { Engagement, CheckInLog, Profile, HRRequest } from "./types";

export const INITIAL_PROFILE: Profile = {
  name: "Alex Sterling",
  role: "VP of Product Engineering",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9ALvywzdH-a_z-tjjQMal7BjnkKufjEWf-x_WTFgoYZgkBMnzVx258INR1F00mknAUAdX4RmHA8I5uAVLaYPWU0ELFU8VOlePhS6CLO0eHtDF6jr7PoRbE7uRNm7eUcWWcKZhGA9IabRhKqs5NqOcG95PFvPpJdlr97EYXnc_w69yc512KygYumKfCDTX3GIHxmxFtMEgVgeCqOo4PENX6p7pUFZNWG8JGnnCK4GQZAF5IgUhiTxc2BapyvloRZ31lLl590J2QTU",
  officeStatus: "ACTIVE",
  weeklyTargetHours: 40,
  completedHours: 32.5,
};


export const INITIAL_ENGAGEMENTS: Engagement[] = [
  {
    id: "eng-1",
    title: "Q4 Portfolio Review",
    date: "2026-10-14",
    rawDate: "14 OCT",
    time: "10:30 AM",
    location: "Board Room Crystal",
    type: "STRATEGIC",
    status: "error", // red dot in design
    attendees: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA_ZdZgN5CEo1LHsOgo4UmWW9oQdHAh7d7IOsTLOsX2_D0yRY0pIqXX7Msb3traRzEsGxz06Yn4aR5p-lwmASa5sD2ZpUT5P9b4Dx8-A7GCz9SRUg7No_GkPY-WriK6QAafiBQqY0waD5d4nvEfAIXCwBtLvIaetUx92i1IsIUFZAwr43jydgx8aY37Rj58MeKT4Ska7zNmwbSxK7329WVqPOvtL1qPt3X7P29bhCIkoXz7GdoV73JlUe55x4PzK5ewBdNpAo_JJIU",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDkx9S6YP1-jJ2BokfckqFuZYX7T_UWYIFbpm5gUv-BHG6anaWgLj9m6SJV5TCUpWZvmIew8mFkgL-flGYx9Q0X17mJ9q3694pNm43g2J7N9bFruQat7ePkpijluFrHa1rR6ByaqM_-rsK4WCRyFUlwGH9dSNbdtFYQ4_e8wB8soAHTpAtbZ5kSlbaji1CQ8bQN97qcsgTFvPv8wuepX36WWEIkQ36jF1gHs4MrjDNpNJ2P9_c5y3tJnD8Y-Tyub67hu3xU3b7lFys"
    ],
    description: "Annual execution audit of tech ventures portfolio with external general partners and executive committee.",
  },
  {
    id: "eng-2",
    title: "Product Sync",
    date: "2026-10-15",
    rawDate: "15 OCT",
    time: "02:00 PM",
    location: "Remote (Zoom)",
    type: "INTERNAL",
    status: "active", // cyan dot in design
    attendees: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB9ALvywzdH-a_z-tjjQMal7BjnkKufjEWf-x_WTFgoYZgkBMnzVx258INR1F00mknAUAdX4RmHA8I5uAVLaYPWU0ELFU8VOlePhS6CLO0eHtDF6jr7PoRbE7uRNm7eUcWWcKZhGA9IabRhKqs5NqOcG95PFvPpJdlr97EYXnc_w69yc512KygYumKfCDTX3GIHxmxFtMEgVgeCqOo4PENX6p7pUFZNWG8JGnnCK4GQZAF5IgUhiTxc2BapyvloRZ31lLl590J2QTU"
    ],
    description: "Weekly update on the premium design framework and core visual components release cycle.",
  }
];

export const INITIAL_CHECKINS: CheckInLog[] = [
  {
    id: "log-1",
    timestamp: "08:45 AM",
    date: "2026-07-12",
    type: "check-in",
    method: "Fingerprint"
  },
  {
    id: "log-2",
    timestamp: "08:30 AM",
    date: "2026-07-11",
    type: "check-in",
    method: "NFC"
  },
  {
    id: "log-3",
    timestamp: "05:15 PM",
    date: "2026-07-11",
    type: "check-out",
    method: "NFC"
  },
  {
    id: "log-4",
    timestamp: "08:40 AM",
    date: "2026-07-10",
    type: "check-in",
    method: "Fingerprint"
  },
  {
    id: "log-5",
    timestamp: "05:30 PM",
    date: "2026-07-10",
    type: "check-out",
    method: "Fingerprint"
  },
  {
    id: "log-6",
    timestamp: "08:55 AM",
    date: "2026-07-09",
    type: "check-in",
    method: "Manual Override"
  },
  {
    id: "log-7",
    timestamp: "05:05 PM",
    date: "2026-07-09",
    type: "check-out",
    method: "Manual Override"
  }
];

export const INITIAL_REQUESTS: HRRequest[] = [
  {
    id: "req-1",
    type: "leave",
    typeNameAr: "طلب إجازة",
    typeNameEn: "Leave Request",
    dateSubmitted: "2026-07-08",
    status: "approved",
    details: {
      startDate: "2026-08-01",
      endDate: "2026-08-10",
      leaveType: "Annual / سنوية",
      notes: "Annual family summer vacation."
    }
  },
  {
    id: "req-2",
    type: "loan",
    typeNameAr: "طلب سلفة",
    typeNameEn: "Loan Request",
    dateSubmitted: "2026-07-11",
    status: "pending",
    details: {
      amount: 15000,
      repaymentMonths: 12,
      notes: "Personal contingency fund allocation."
    }
  },
  {
    id: "req-3",
    type: "overtime",
    typeNameAr: "طلب عمل إضافي",
    typeNameEn: "Overtime Request",
    dateSubmitted: "2026-07-12",
    status: "pending",
    details: {
      hoursRequested: 4,
      overtimeDate: "2026-07-15",
      notes: "Additional hours for Q4 Portfolio documentation support."
    }
  }
];

// Hardcoded attendance presence scores per weekday
export const ATTENDANCE_WEEKDAY_BARS = [
  { day: "MON", heightPercent: 30, active: false },
  { day: "TUE", heightPercent: 60, active: false },
  { day: "WED", heightPercent: 50, active: false },
  { day: "THU", heightPercent: 20, active: true, pulse: true },
  { day: "FRI", heightPercent: 0, active: false, disabled: true },
];
