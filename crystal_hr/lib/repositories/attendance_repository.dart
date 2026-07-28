import 'dart:convert';
import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import '../services/database_helper.dart';
import '../models/attendance_model.dart';

class AttendanceRepository {
  final ApiService _apiService;
  final DatabaseHelper _dbHelper;

  AttendanceRepository({ApiService? apiService, DatabaseHelper? dbHelper})
      : _apiService = apiService ?? ApiService(),
        _dbHelper = dbHelper ?? DatabaseHelper.instance;

  String _generateUuid() {
    final rand = Random();
    final micro = DateTime.now().microsecondsSinceEpoch;
    final rVal = rand.nextInt(1000000);
    return 'evt-$micro-$rVal';
  }

  Future<AttendanceSessionModel?> getCurrentSession() async {
    final prefs = await SharedPreferences.getInstance();
    final employeeId = prefs.getInt('employee_id') ?? 0;
    
    final response = await _apiService.get('/attendance/current-session?employeeId=$employeeId', version: 'v2');
    if (response.success && response.data != null) {
      final sessionData = response.data['session'];
      if (sessionData != null) {
        return AttendanceSessionModel.fromJson(sessionData);
      }
    }
    return null;
  }

  Future<Map<String, dynamic>> punchEvent({
    required String eventType,
    double? latitude,
    double? longitude,
    double? accuracy,
    String? deviceId,
    String? platform,
    String? appVersion,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final tenantId = prefs.getString('tenant_id') ?? 'tenant-sol-102';
    final companyId = prefs.getInt('company_id') ?? 1;
    final userId = prefs.getInt('user_id') ?? 0;
    final employeeId = prefs.getInt('employee_id') ?? 0;

    final idempotencyUuid = _generateUuid();
    final timestamp = DateTime.now().toIso8601String();

    final payload = {
      'tenantId': tenantId,
      'companyId': companyId,
      'userId': userId,
      'employeeId': employeeId,
      'eventType': eventType,
      'eventTimestamp': timestamp,
      'latitude': latitude,
      'longitude': longitude,
      'accuracy': accuracy,
      'deviceId': deviceId,
      'platform': platform,
      'appVersion': appVersion ?? '2.0.0',
      'idempotencyKey': idempotencyUuid,
    };

    // Try online punch
    try {
      final response = await _apiService.post('/attendance/events', payload, version: 'v2');
      if (response.success && response.data != null) {
        final session = AttendanceSessionModel.fromJson(response.data['session']);
        return {
          'success': true,
          'session': session,
          'status': 'completed',
        };
      }
    } catch (e) {
      // Fetch offline punch policy from config
      final db = await _dbHelper.database;
      final List<Map<String, dynamic>> configMaps = await db.query('company_config', limit: 1);
      
      bool offlineEnabled = true;
      if (configMaps.isNotEmpty) {
        try {
          final rules = json.decode(configMaps.first['attendance_rules'] ?? '{}');
          offlineEnabled = rules['offlinePunchEnabled'] ?? true;
        } catch (_) {}
      }

      if (!offlineEnabled) {
        return {
          'success': false,
          'error': 'التبصيم دون اتصال بالإنترنت معطل لشركتك حالياً.',
          'status': 'failed'
        };
      }

      // Save to offline queue
      await _dbHelper.insertOfflineEvent({
        'tenantId': tenantId,
        'companyId': companyId,
        'userId': userId,
        'employeeId': employeeId,
        'eventType': eventType,
        'payload': json.encode(payload),
        'idempotencyUuid': idempotencyUuid,
        'createdAt': timestamp,
      });

      return {
        'success': true,
        'status': 'pending',
        'error': 'تم حفظ التبصيم محلياً في طابور الانتظار (دون اتصال بالإنترنت).'
      };
    }

    return {'success': false, 'status': 'failed'};
  }

  Future<void> syncOfflineQueue() async {
    final pendingEvents = await _dbHelper.getPendingOfflineEvents();
    if (pendingEvents.isEmpty) return;

    for (final event in pendingEvents) {
      final String uuid = event['idempotencyUuid'];
      final Map<String, dynamic> payload = json.decode(event['payload']);

      await _dbHelper.updateOfflineEventStatus(uuid, 'syncing');

      try {
        final response = await _apiService.post('/attendance/events', payload, version: 'v2');
        if (response.success) {
          await _dbHelper.deleteOfflineEvent(uuid);
        } else {
          await _dbHelper.updateOfflineEventStatus(uuid, 'failed', error: response.message);
        }
      } catch (e) {
        await _dbHelper.updateOfflineEventStatus(uuid, 'failed', error: e.toString());
      }
    }
  }
}
