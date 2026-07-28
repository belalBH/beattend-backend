import 'dart:convert';
import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../models/request_type_model.dart';
import '../models/request_field_model.dart';
import '../models/request_model.dart';

class DynamicRequestRepository {
  final ApiService _apiService;

  DynamicRequestRepository({ApiService? apiService})
      : _apiService = apiService ?? ApiService();

  String _generateUuid() {
    final rand = Random();
    final micro = DateTime.now().microsecondsSinceEpoch;
    return 'req-uuid-$micro-${rand.nextInt(1000000)}';
  }

  Future<List<RequestTypeModel>> getRequestTypes() async {
    final response = await _apiService.get('/requests/types', version: 'v2');
    if (response.success && response.data != null) {
      final List<dynamic> list = response.data;
      return list.map((e) => RequestTypeModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<List<RequestFieldModel>> getFields(int typeId) async {
    final response = await _apiService.get('/requests/types/$typeId/fields', version: 'v2');
    if (response.success && response.data != null) {
      final List<dynamic> list = response.data;
      return list.map((e) => RequestFieldModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>> saveDraft({
    required int requestTypeId,
    required Map<String, dynamic> fieldValues,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final employeeId = prefs.getInt('employee_id') ?? 1;
    final tenantId = prefs.getString('tenant_id') ?? 'tenant-sol-102';

    final payload = {
      'employeeId': employeeId,
      'requestTypeId': requestTypeId,
      'fieldValues': fieldValues,
      'idempotencyUuid': _generateUuid(),
    };

    final response = await _apiService.post('/requests/drafts', payload, version: 'v2');
    if (response.success && response.data != null) {
      return {
        'success': true,
        'requestId': response.data['requestId'],
      };
    }
    return {'success': false};
  }

  Future<bool> submitRequest(int requestId) async {
    final response = await _apiService.post('/requests/$requestId/submit', {}, version: 'v2');
    return response.success;
  }

  Future<List<RequestModel>> getPendingApprovals(String role) async {
    final prefs = await SharedPreferences.getInstance();
    final approverId = prefs.getInt('employee_id') ?? 2;

    final response = await _apiService.get('/approvals/pending?approverId=$approverId&role=$role', version: 'v2');
    if (response.success && response.data != null) {
      final List<dynamic> list = response.data;
      return list.map((e) => RequestModel.fromJson(e)).toList();
    }
    return [];
  }

  Future<bool> processApproval({
    required int approvalId,
    required String decision,
    String? comment,
  }) async {
    final payload = {
      'comment': comment ?? '',
      'idempotencyUuid': _generateUuid(),
    };

    final endpoint = '/approvals/$approvalId/$decision';
    final response = await _apiService.post(endpoint, payload, version: 'v2');
    return response.success;
  }
}
