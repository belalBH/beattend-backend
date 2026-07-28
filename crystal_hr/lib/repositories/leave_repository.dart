import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../models/leave_type_model.dart';
import '../models/leave_balance_model.dart';
import '../models/leave_request_model.dart';

class LeaveRepository {
  final ApiService _apiService;

  LeaveRepository({ApiService? apiService})
      : _apiService = apiService ?? ApiService();

  Future<List<LeaveTypeModel>> getLeaveTypes() async {
    final response = await _apiService.get('/leaves/types', version: 'v2');
    if (response.success && response.data != null) {
      final List<dynamic> list = response.data;
      return list.map((e) => LeaveTypeModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<List<LeaveBalanceModel>> getLeaveBalances() async {
    final prefs = await SharedPreferences.getInstance();
    final employeeId = prefs.getInt('employee_id') ?? 1;

    final response = await _apiService.get('/leaves/balances?employeeId=$employeeId', version: 'v2');
    if (response.success && response.data != null) {
      final List<dynamic> list = response.data;
      return list.map((e) => LeaveBalanceModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<bool> submitLeaveRequest({
    required int leaveTypeId,
    required String startDate,
    required String endDate,
    String? reason,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final employeeId = prefs.getInt('employee_id') ?? 1;

    final payload = {
      'employeeId': employeeId,
      'leaveTypeId': leaveTypeId,
      'startDate': startDate,
      'endDate': endDate,
      'reason': reason ?? '',
    };

    final response = await _apiService.post('/leaves/requests', payload, version: 'v2');
    return response.success;
  }

  Future<List<LeaveRequestModel>> getPendingApprovals() async {
    final prefs = await SharedPreferences.getInstance();
    final approverId = prefs.getInt('employee_id') ?? 2; // Default mock manager id

    final response = await _apiService.get('/leaves/requests?approverId=$approverId&type=manager', version: 'v2');
    if (response.success && response.data != null) {
      final List<dynamic> list = response.data;
      return list.map((e) => LeaveRequestModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<bool> approveOrRejectRequest({
    required int requestId,
    required String decision, // "approve" or "reject"
    String? comment,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final approverId = prefs.getInt('employee_id') ?? 2;

    final payload = {
      'approverId': approverId,
      'decision': decision,
      'comment': comment ?? '',
    };

    final response = await _apiService.post('/leaves/requests/$requestId/manager-action', payload, version: 'v2');
    return response.success;
  }
}
