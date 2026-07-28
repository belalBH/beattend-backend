import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../repositories/auth_repository.dart';
import '../models/company_model.dart';
import '../models/employee_model.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository _authRepository;

  bool _isLoading = false;
  String? _errorMessage;
  bool _isLoggedIn = false;
  CompanyModel? _currentCompany;
  EmployeeModel? _currentEmployee;

  AuthProvider({AuthRepository? authRepository})
      : _authRepository = authRepository ?? AuthRepository();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  bool get isLoggedIn => _isLoggedIn;
  CompanyModel? get currentCompany => _currentCompany;
  EmployeeModel? get currentEmployee => _currentEmployee;

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  void _setError(String? msg) {
    _errorMessage = msg;
    notifyListeners();
  }

  Future<bool> checkSession() async {
    final prefs = await SharedPreferences.getInstance();
    const storage = FlutterSecureStorage();
    final loggedIn = prefs.getBool('is_logged_in') ?? false;
    final token = await storage.read(key: 'access_token') ?? prefs.getString('auth_token');
    final tenantId = prefs.getString('tenant_id');

    if (loggedIn && token != null && token.isNotEmpty && tenantId != null && tenantId.isNotEmpty) {
      _isLoggedIn = true;
      notifyListeners();
      return true;
    }
    
    _isLoggedIn = false;
    notifyListeners();
    return false;
  }

  Future<bool> validateDomain(String domain) async {
    _setLoading(true);
    _setError(null);
    try {
      final company = await _authRepository.validateDomain(domain);
      if (company != null) {
        _currentCompany = company;
        _setError(null);
        return true;
      } else {
        _setError('النطاق غير مسجل أو غير موجود.');
        return false;
      }
    } catch (e) {
      _setError(e.toString().replaceAll('Exception: ', ''));
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> login(String email, String password) async {
    if (_currentCompany == null) {
      _setError('الرجاء التحقق من نطاق الشركة أولاً.');
      return false;
    }

    _setLoading(true);
    _setError(null);
    try {
      final employee = await _authRepository.login(
        email,
        password,
        _currentCompany!.id,
      );

      if (employee != null) {
        _currentEmployee = employee;
        _isLoggedIn = true;
        _setError(null);
        return true;
      }
      return false;
    } catch (e) {
      _setError(e.toString().replaceAll('Exception: ', ''));
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> hasPendingSyncs() async {
    return await _authRepository.hasPendingOfflineOperations();
  }

  Future<void> logout() async {
    _setLoading(true);
    try {
      await _authRepository.logout();
      _isLoggedIn = false;
      _currentEmployee = null;
      _currentCompany = null;
      _setError(null);
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> changeCompany() async {
    await logout();
  }
}
