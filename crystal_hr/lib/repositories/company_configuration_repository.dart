import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import '../services/api_service.dart';
import '../services/database_helper.dart';

class CompanyConfigurationRepository {
  final ApiService _apiService;
  final DatabaseHelper _dbHelper;

  CompanyConfigurationRepository({ApiService? apiService, DatabaseHelper? dbHelper})
      : _apiService = apiService ?? ApiService(),
        _dbHelper = dbHelper ?? DatabaseHelper.instance;

  Future<Map<String, dynamic>?> syncCompanyConfig() async {
    final response = await _apiService.get('/companies/configuration', version: 'v2');
    if (response.success && response.data != null) {
      final config = response.data;
      final db = await _dbHelper.database;

      await db.insert(
        'company_config',
        {
          'tenant_id': config['tenantId'] ?? '',
          'company_name': config['companyName'] ?? '',
          'company_logo': config['companyLogo'] ?? '',
          'theme_colors': json.encode(config['themeColors'] ?? {}),
          'time_zone': config['timeZone'] ?? 'Asia/Riyadh',
          'working_week': json.encode(config['workingWeek'] ?? []),
          'weekend_days': json.encode(config['weekendDays'] ?? []),
          'attendance_rules': json.encode(config['attendanceRules'] ?? {}),
          'feature_flags': json.encode(config['featureFlags'] ?? {}),
          'maintenance_mode': (config['maintenanceMode'] ?? false) ? 1 : 0,
          'minimum_app_version': config['minimumAppVersion'] ?? '2.0.0',
          'updated_at': DateTime.now().toIso8601String(),
        },
        conflictAlgorithm: ConflictAlgorithm.replace,
      );

      // Sync leave types
      if (config['leaveTypes'] is List) {
        await _saveLeaveTypes(config['leaveTypes'], config['tenantId'] ?? '');
      }

      // Sync request types
      if (config['requestTypes'] is List) {
        await _saveRequestTypes(config['requestTypes'], config['tenantId'] ?? '');
      }

      return config;
    }
    return null;
  }

  Future<void> _saveLeaveTypes(List<dynamic> types, String tenantId) async {
    final db = await _dbHelper.database;
    await db.transaction((txn) async {
      await txn.delete('leave_types', where: 'tenant_id = ?', whereArgs: [tenantId]);
      for (final type in types) {
        await txn.insert('leave_types', {
          'tenant_id': tenantId,
          'name': type['name'] ?? '',
          'name_ar': type['name_ar'] ?? '',
          'description': type['description'] ?? '',
          'requires_attachment': (type['requires_attachment'] ?? false) ? 1 : 0,
          'max_days': (type['max_days'] ?? 30).toDouble(),
        });
      }
    });
  }

  Future<void> _saveRequestTypes(List<dynamic> types, String tenantId) async {
    final db = await _dbHelper.database;
    await db.transaction((txn) async {
      await txn.delete('request_types', where: 'tenant_id = ?', whereArgs: [tenantId]);
      for (final type in types) {
        await txn.insert('request_types', {
          'tenant_id': tenantId,
          'name': type['name'] ?? '',
          'name_ar': type['name_ar'] ?? '',
          'fields_config': json.encode(type['fields_config'] ?? []),
          'approval_workflow': json.encode(type['approval_workflow'] ?? {}),
          'icon': type['icon'] ?? 'assignment',
          'color': type['color'] ?? '0xFF4CD7F6',
        });
      }
    });
  }

  Future<Map<String, dynamic>?> getCachedCompanyConfig(String tenantId) async {
    final db = await _dbHelper.database;
    final List<Map<String, dynamic>> maps = await db.query(
      'company_config',
      where: 'tenant_id = ?',
      whereArgs: [tenantId],
      limit: 1,
    );
    if (maps.isNotEmpty) {
      return maps.first;
    }
    return null;
  }
}
