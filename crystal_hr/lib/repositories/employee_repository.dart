import 'dart:convert';
import '../services/api_service.dart';
import '../services/database_helper.dart';
import '../models/employee_model.dart';
import '../models/employment_info_model.dart';
import '../models/work_configuration_model.dart';
import '../models/emergency_contact_model.dart';
import '../models/leave_balance_model.dart';
import '../models/employee_document_model.dart';

class EmployeeRepository {
  final ApiService _apiService;
  final DatabaseHelper _dbHelper;

  EmployeeRepository({ApiService? apiService, DatabaseHelper? dbHelper})
      : _apiService = apiService ?? ApiService(),
        _dbHelper = dbHelper ?? DatabaseHelper.instance;

  Future<EmployeeModel?> getMyProfile() async {
    final response = await _apiService.get('/employees/me', version: 'v2');
    if (response.success && response.data != null) {
      await _dbHelper.saveUserProfile(response.data);
      return EmployeeModel.fromJson(response.data);
    }
    // Return cached profile
    final cached = await _dbHelper.getUserProfile();
    if (cached != null) {
      return EmployeeModel.fromJson(cached);
    }
    return null;
  }

  Future<bool> updateMyProfile(Map<String, dynamic> fields) async {
    final response = await _apiService.post('/employees/me', fields, version: 'v2'); // PATCH mapping using POST overrides
    if (response.success) {
      // Reload profile
      await getMyProfile();
      return true;
    }
    return false;
  }

  Future<WorkConfigurationModel?> getWorkConfiguration() async {
    final response = await _apiService.get('/employees/me/work-configuration', version: 'v2');
    if (response.success && response.data != null) {
      return WorkConfigurationModel.fromJson(response.data);
    }
    return null;
  }

  Future<List<LeaveBalanceModel>> getLeaveBalances() async {
    final response = await _apiService.get('/employees/me/leave-balances', version: 'v2');
    if (response.success && response.data != null) {
      final List<dynamic> list = response.data;
      return list.map((e) => LeaveBalanceModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<List<EmployeeDocumentModel>> getDocuments() async {
    final response = await _apiService.get('/employees/me/documents', version: 'v2');
    if (response.success && response.data != null) {
      final List<dynamic> list = response.data;
      return list.map((e) => EmployeeDocumentModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<List<EmergencyContactModel>> getEmergencyContacts() async {
    final response = await _apiService.get('/employees/me/emergency-contacts', version: 'v2');
    if (response.success && response.data != null) {
      final List<dynamic> list = response.data;
      return list.map((e) => EmergencyContactModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<bool> addEmergencyContact(Map<String, dynamic> contact) async {
    final response = await _apiService.post('/employees/me/emergency-contacts', contact, version: 'v2');
    return response.success;
  }

  Future<bool> updateEmergencyContact(int id, Map<String, dynamic> contact) async {
    final response = await _apiService.post('/employees/me/emergency-contacts/$id', contact, version: 'v2');
    return response.success;
  }
}
