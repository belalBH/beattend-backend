export interface AttendanceKpis {
  present_now: number;
  late_today: number;
  absent_today: number;
  on_leave: number;
  out_of_geofence: number;
  not_punched_yet: number;
  avg_arrival_time: string;
  avg_work_hours: string;
}

export interface ChartDayItem {
  date: string;
  present_rate: number;
  late_count: number;
  absent_count: number;
  out_geofence: number;
}

export interface RecentPunchItem {
  id: number;
  employee_name: string;
  empNo: string;
  check_in?: string;
  check_out?: string;
  time_display: string;
  punch_type: string;
  location_name?: string;
  status: string;
}

export interface LiveAttendanceItem {
  employee_id: number;
  employee_name: string;
  empNo: string;
  email: string;
  company_name: string;
  live_state: 'موجود الآن' | 'غادر المنشأة' | 'لم يبصم بعد';
  last_punch_time: string;
  location_name?: string;
  attendance_status?: string;
  device_status: string;
  connection_status: string;
}

export interface CorrectionRequestItem {
  id: number;
  employee_id: number;
  employee_name: string;
  empNo: string;
  request_type: string;
  reason: string;
  original_time?: string;
  requested_time?: string;
  approval_status: string;
  created_at: string;
}

export interface GeofenceItem {
  id: number;
  name_ar: string;
  branch_name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  linked_employees_count: number;
  linked_shift: string;
  is_active: boolean;
}

export interface RegisteredDeviceItem {
  id: number;
  employee_name: string;
  empNo: string;
  device_name: string;
  os_version: string;
  device_id: string;
  last_login: string;
  app_version: string;
  is_trusted: boolean;
  is_blocked: boolean;
}

export interface ExceptionItem {
  id: number;
  employee_name: string;
  type: string;
  description: string;
  risk_level: string;
  status: string;
}

export interface AttendanceRecordFull {
  id: number;
  employee_id: number;
  employee_name: string;
  empNo: string;
  company_name: string;
  department_name: string;
  date_display: string;
  check_in_time: string;
  check_out_time: string;
  work_hours_display: string;
  tardiness_hours: string;
  overtime_hours: string;
  location?: string;
  device?: string;
  status: string;
  source?: string;
}
