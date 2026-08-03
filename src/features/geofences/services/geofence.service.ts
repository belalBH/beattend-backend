import { API_CONFIG } from '../../../config/api.config';
import { fetchApi } from '../../../services/api.service';
import { GeofenceFull, GeofenceInput, GeofenceTestResult } from '../types/geofence.types';

export const geofenceService = {
  async getGeofences(): Promise<GeofenceFull[]> {
    return await fetchApi<GeofenceFull[]>(`${API_CONFIG.PHP_API_URL}?route=geofences`);
  },

  async getGeofenceById(id: number): Promise<GeofenceFull> {
    return await fetchApi<GeofenceFull>(`${API_CONFIG.PHP_API_URL}?route=geofences&id=${id}`);
  },

  async createGeofence(data: GeofenceInput): Promise<GeofenceFull> {
    return await fetchApi<GeofenceFull>(`${API_CONFIG.PHP_API_URL}?route=geofences`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateGeofence(id: number, data: Partial<GeofenceInput>): Promise<GeofenceFull> {
    return await fetchApi<GeofenceFull>(`${API_CONFIG.PHP_API_URL}?route=geofences&id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteGeofence(id: number): Promise<void> {
    await fetchApi(`${API_CONFIG.PHP_API_URL}?route=geofences&id=${id}`, {
      method: 'DELETE'
    });
  },

  async linkEmployees(id: number, employeeIds: number[]): Promise<any> {
    return await fetchApi<any>(`${API_CONFIG.PHP_API_URL}?route=geofences&action=link_employees&id=${id}`, {
      method: 'POST',
      body: JSON.stringify({ employee_ids: employeeIds })
    });
  },

  async testRadius(userLat: number, userLng: number, targetLat: number, targetLng: number, radiusMeters: number): Promise<GeofenceTestResult> {
    return await fetchApi<GeofenceTestResult>(`${API_CONFIG.PHP_API_URL}?route=geofences&action=test`, {
      method: 'POST',
      body: JSON.stringify({
        user_latitude: userLat,
        user_longitude: userLng,
        target_latitude: targetLat,
        target_longitude: targetLng,
        radius_meters: radiusMeters
      })
    });
  }
};
