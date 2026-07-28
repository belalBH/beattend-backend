import 'hr_entities.dart';

abstract class IHRRepository {
  Future<Employee> getEmployeeProfile(String employeeId);
  Future<List<AttendanceSession>> getAttendanceHistory(String employeeId);
  Future<AttendanceSession?> getTodayAttendance(String employeeId);
  Future<void> clockIn({
    required String employeeId,
    required String time,
    required String method,
    required bool isInsideGeofence,
    required String locationName,
  });
  Future<void> clockOut({
    required String employeeId,
    required String time,
    required String method,
    required bool isInsideGeofence,
    required String locationName,
  });
  Future<List<HRNotification>> getNotifications(String employeeId);
  Future<List<HREvent>> getHREvents(String employeeId);
}
