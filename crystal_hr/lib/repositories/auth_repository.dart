import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../services/api_service.dart';
import '../services/database_helper.dart';
import '../models/company_model.dart';
import '../models/employee_model.dart';

class AuthRepository {
  final ApiService _apiService;
  final DatabaseHelper _dbHelper;
  final FlutterSecureStorage _secureStorage;

  AuthRepository({
    ApiService? apiService, 
    DatabaseHelper? dbHelper,
    FlutterSecureStorage? secureStorage,
  })  : _apiService = apiService ?? ApiService(),
        _dbHelper = dbHelper ?? DatabaseHelper.instance,
        _secureStorage = secureStorage ?? const FlutterSecureStorage();

  String normalizeDomain(String domain) {
    return domain
        .trim()
        .replaceAll(' ', '')
        .replaceFirst(RegExp(r'^https?://', caseSensitive: false), '')
        .replaceFirst(RegExp(r'^www\.', caseSensitive: false), '')
        .replaceAll(RegExp(r'/$'), '')
        .toLowerCase();
  }

  bool _isVersionBelowMinimum(String currentVersion, String minimumVersion) {
    List<int> currentParts = currentVersion.split('.').map((e) => int.tryParse(e) ?? 0).toList();
    List<int> minParts = minimumVersion.split('.').map((e) => int.tryParse(e) ?? 0).toList();

    for (int i = 0; i < 3; i++) {
      int cur = i < currentParts.length ? currentParts[i] : 0;
      int min = i < minParts.length ? minParts[i] : 0;
      if (cur < min) return true;
      if (cur > min) return false;
    }
    return false;
  }

  Future<CompanyModel?> validateDomain(String domain) async {
    final normalized = normalizeDomain(domain);
    if (normalized.isEmpty) {
      throw Exception('يرجى إدخال نطاق شركة صحيح.');
    }

    final response = await _apiService.get('/companies/validate', queryParams: {'domain': normalized});
    if (response.success && response.data != null) {
      final company = CompanyModel.fromJson(response.data);
      
      // Workspace validation
      if (company.status != 'active') {
        throw Exception('مساحة العمل هذه معطلة أو غير نشطة حالياً.');
      }
      
      const currentAppVersion = '2.0.0';
      if (_isVersionBelowMinimum(currentAppVersion, company.minimumAppVersion)) {
        throw Exception('يرجى تحديث التطبيق إلى الإصدار ${company.minimumAppVersion} على الأقل للاستمرار.');
      }

      // Cache non-sensitive company metadata in SharedPreferences (Rule 10)
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('tenant_id', company.tenantId);
      await prefs.setInt('company_id', company.id);
      await prefs.setString('company_name', company.name);
      await prefs.setString('company_logo', company.logo);
      await prefs.setString('company_domain', company.domain);
      return company;
    } else {
      throw Exception(response.message.isNotEmpty ? response.message : 'النطاق غير مسجل أو غير موجود.');
    }
  }

  Future<EmployeeModel?> login(String email, String password, int companyId) async {
    final prefs = await SharedPreferences.getInstance();
    final tenantId = prefs.getString('tenant_id') ?? '';
    final deviceId = prefs.getString('device_id') ?? 'UUID-DEFAULT';

    final response = await _apiService.post('/login', {
      'email': email.trim(),
      'password': password.trim(),
      'companyId': companyId,
      'tenantId': tenantId,
      'deviceId': deviceId,
    });

    if (response.success && response.data != null) {
      final employee = EmployeeModel.fromJson(response.data);

      final accessToken = response.data['accessToken'] ?? response.data['token'] ?? '';
      final refreshToken = response.data['refreshToken'] ?? '';
      
      // Securely store sensitive tokens in Keychain / Keystore (Rule 10)
      await _secureStorage.write(key: 'access_token', value: accessToken);
      await _secureStorage.write(key: 'refresh_token', value: refreshToken);

      // Save non-sensitive identity metadata in SharedPreferences & SQLite
      await prefs.setString('auth_token', accessToken);
      await prefs.setInt('employee_id', employee.id);
      await prefs.setBool('is_logged_in', true);

      // Save profile to local SQLite
      await _dbHelper.saveUserProfile(response.data);
      return employee;
    } else {
      throw Exception(response.message.isNotEmpty ? response.message : 'فشل تسجيل الدخول، يرجى التحقق من البيانات.');
    }
  }

  Future<bool> hasPendingOfflineOperations() async {
    try {
      final db = await _dbHelper.database;
      final List<Map<String, dynamic>> maps = await db.query(
        'offline_queue',
        where: 'sync_status = ?',
        whereArgs: ['pending'],
      );
      return maps.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    final deviceId = prefs.getString('device_id') ?? '';
    
    try {
      await _apiService.post('/logout', {'deviceId': deviceId});
    } catch (_) {}

    final theme = prefs.getString('theme_mode') ?? 'light';
    final language = prefs.getString('language') ?? 'ar';
    
    // Completely wipe secure storage (Keychain/Keystore) and SharedPreferences & SQLite (Rule 10 & 16)
    await _secureStorage.deleteAll();
    await prefs.clear();
    await _dbHelper.clearUserProfile();
    await _dbHelper.clearAllData();

    await prefs.setString('theme_mode', theme);
    await prefs.setString('language', language);
  }

  Future<void> changeCompany() async {
    await logout();
  }
}
