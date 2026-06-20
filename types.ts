
export type UserRole = 'superadmin' | 'company';

export interface Company {
  id: number;
  name: string;
  logo: string;
  industry: string;
  employees: number;
  status: string;
  domain: string;
  crNumber?: string;
  taxNumber?: string;
  startDate?: string;
  expiryDate?: string;
}

export interface Department {
  id: number;
  name: string;
  manager: string;
  color: string;
}

export interface Employee {
  id: number;
  companyId: number;
  empNo: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone?: string;
  salary?: number;
  status?: string;
  avatar: string;
  password?: string;
}
