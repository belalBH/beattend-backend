import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../repositories/company_configuration_repository.dart';

class CompanyConfigurationProvider extends ChangeNotifier {
  final CompanyConfigurationRepository _repository;

  bool _isLoading = false;
  Map<String, dynamic>? _config;
  bool _maintenanceMode = false;
  String _minimumAppVersion = '2.0.0';
  Map<String, dynamic> _featureFlags = {};
  String _timeZone = 'Asia/Riyadh';

  CompanyConfigurationProvider({CompanyConfigurationRepository? repository})
      : _repository = repository ?? CompanyConfigurationRepository();

  bool get isLoading => _isLoading;
  Map<String, dynamic>? get config => _config;
  bool get maintenanceMode => _maintenanceMode;
  String get minimumAppVersion => _minimumAppVersion;
  Map<String, dynamic> get featureFlags => _featureFlags;
  String get timeZone => _timeZone;

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  Future<void> fetchAndSyncConfig() async {
    _setLoading(true);
    try {
      final data = await _repository.syncCompanyConfig();
      if (data != null) {
        _config = data;
        _maintenanceMode = data['maintenanceMode'] ?? false;
        _minimumAppVersion = data['minimumAppVersion'] ?? '2.0.0';
        _featureFlags = data['featureFlags'] ?? {};
        _timeZone = data['timeZone'] ?? 'Asia/Riyadh';
        notifyListeners();
      }
    } catch (_) {}
    finally {
      _setLoading(false);
    }
  }

  Future<void> loadCachedConfig() async {
    final prefs = await SharedPreferences.getInstance();
    final tenantId = prefs.getString('tenant_id');
    if (tenantId != null && tenantId.isNotEmpty) {
      final data = await _repository.getCachedCompanyConfig(tenantId);
      if (data != null) {
        _maintenanceMode = (data['maintenance_mode'] ?? 0) == 1;
        _minimumAppVersion = data['minimum_app_version'] ?? '2.0.0';
        _timeZone = data['time_zone'] ?? 'Asia/Riyadh';
        try {
          _featureFlags = json.decode(data['feature_flags'] ?? '{}');
        } catch (_) {}
        notifyListeners();
      }
    }
  }
}
