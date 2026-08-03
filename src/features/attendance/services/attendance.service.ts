import { API_CONFIG } from '../../../config/api.config';
import { fetchApi } from '../../../services/api.service';
import {
  AttendanceKpis,
  ChartDayItem,
  RecentPunchItem,
  LiveAttendanceItem,
  CorrectionRequestItem,
  GeofenceItem,
  RegisteredDeviceItem,
  ExceptionItem,
  AttendanceRecordFull
} from '../types/attendance.types';

export const attendanceService = {
  async getDashboardData(): Promise<{ kpis: AttendanceKpis; chart_30_days: ChartDayItem[]; recent_punches: RecentPunchItem[] }> {
    return await fetchApi<{ kpis: AttendanceKpis; chart_30_days: ChartDayItem[]; recent_punches: RecentPunchItem[] }>(
      `${API_CONFIG.PHP_API_URL}?route=attendance&action=dashboard`
    );
  },

  async getLiveAttendance(): Promise<LiveAttendanceItem[]> {
    return await fetchApi<LiveAttendanceItem[]>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=live`);
  },

  async getAttendanceLogs(): Promise<AttendanceRecordFull[]> {
    return await fetchApi<AttendanceRecordFull[]>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=logs`);
  },

  async getCorrections(): Promise<CorrectionRequestItem[]> {
    return await fetchApi<CorrectionRequestItem[]>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=corrections`);
  },

  async approveCorrection(id: number): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=approve_correction&id=${id}`, {
      method: 'POST'
    });
  },

  async rejectCorrection(id: number): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=reject_correction&id=${id}`, {
      method: 'POST'
    });
  },

  async getGeofences(): Promise<GeofenceItem[]> {
    return await fetchApi<GeofenceItem[]>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=geofences`);
  },

  async getDevices(): Promise<RegisteredDeviceItem[]> {
    return await fetchApi<RegisteredDeviceItem[]>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=devices`);
  },

  async getExceptions(): Promise<ExceptionItem[]> {
    return await fetchApi<ExceptionItem[]>(`${API_CONFIG.PHP_API_URL}?route=attendance&action=exceptions`);
  },

  async checkIn(location: string): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=attendance`, {
      method: 'POST',
      body: JSON.stringify({ location, status: 'حاضر في الموعد' })
    });
  }
};
