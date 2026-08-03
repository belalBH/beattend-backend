export interface GeofenceFull {
  id: number;
  tenant_id: string;
  company_id: number;
  branch_id?: number;
  company_name?: string;
  name_ar: string;
  name_en?: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  linked_employees_count: number;
  linked_shift_name?: string;
  is_active: boolean;
  linked_employee_ids?: number[];
  created_at?: string;
}

export interface GeofenceInput {
  name_ar: string;
  name_en?: string;
  company_id: number;
  branch_id?: number;
  latitude: number;
  longitude: number;
  radius_meters: number;
  linked_shift_name?: string;
  is_active: boolean;
}

export interface GeofenceTestResult {
  user_latitude: number;
  user_longitude: number;
  target_latitude: number;
  target_longitude: number;
  allowed_radius_meters: number;
  calculated_distance_meters: number;
  is_within_geofence: boolean;
  status_ar: string;
}
