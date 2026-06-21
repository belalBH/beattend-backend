
import { Company, Department, Employee } from './types';

export const INITIAL_COMPANIES: Company[] = [
  { id: 1, name: "شركة الحلول المتقدمة", logo: "https://ui-avatars.com/api/?name=AS&background=15385E&color=fff", industry: "التقنية", employees: 120, status: "نشط", domain: "solutions.sa" },
  { id: 2, name: "مجموعة الشايع للتجارة", logo: "https://ui-avatars.com/api/?name=ST&background=15385E&color=fff", industry: "التجزئة", employees: 450, status: "نشط", domain: "shaya.sa" },
  { id: 3, name: "مستشفى التخصصي", logo: "https://ui-avatars.com/api/?name=SH&background=17AE9F&color=fff", industry: "الصحة", employees: 800, status: "نشط", domain: "hospital.sa" },
];

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 1, name: "التقنية", manager: "أحمد العتيبي", color: "bg-[#0B2545]" },
  { id: 2, name: "الموارد البشرية", manager: "سارة القحطاني", color: "bg-[#15385E]" },
  { id: 3, name: "المبيعات", manager: "محمد الشمري", color: "bg-teal-500" },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, companyId: 1, empNo: "EMP-1001", name: "أحمد العتيبي", title: "مطور برمجيات أول", department: "التقنية", email: "a.otaibi@solutions.sa", avatar: "https://ui-avatars.com/api/?name=أحمد+العتيبي&background=15385E&color=fff" },
  { id: 2, companyId: 1, empNo: "EMP-1002", name: "سارة القحطاني", title: "أخصائية موارد بشرية", department: "الموارد البشرية", email: "s.qahtani@solutions.sa", avatar: "https://ui-avatars.com/api/?name=سارة+القحطاني&background=15385E&color=fff" },
  { id: 3, companyId: 1, empNo: "EMP-1003", name: "محمد الشمري", title: "مدير مبيعات", department: "المبيعات", email: "m.shammari@shaya.sa", avatar: "https://ui-avatars.com/api/?name=محمد+الشمري&background=17AE9F&color=fff" },
];
export const API_BASE_URL = 'https://beattend-api.onrender.com';
