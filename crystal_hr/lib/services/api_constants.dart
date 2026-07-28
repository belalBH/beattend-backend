import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

/// API Constants for connecting to the backend server
class ApiConstants {
  static String get baseUrl {
    if (kIsWeb) return 'http://127.0.0.1:8080/api';
    if (Platform.isAndroid) return 'http://10.0.2.2:8080/api';
    return 'http://127.0.0.1:8080/api';
  }

  // Endpoints
  static const String login = '/login';
  static const String validateDomain = '/companies/validate';
  static const String changePassword = '/employees/change-password';
  static const String clockIn = '/attendance/clock-in';
  static const String clockOut = '/attendance/clock-out';
  static const String todayAttendance = '/attendance/today';
  static const String attendanceRecords = '/attendance/records';
  static const String attendanceSummary = '/attendance/summary';
  static const String leaveRequest = '/leave/request';
  static const String leaveRequests = '/leave/requests';
  static const String leaveBalance = '/leave/balance';
  static const String employee = '/employee';
  static const String officeLocations = '/office-locations';

  // Timeouts
  static const Duration connectionTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Headers
  static Map<String, String> get headers => {
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json',
      };
}
