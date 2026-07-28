import 'package:flutter/material.dart';
import '../repositories/employee_repository.dart';
import '../models/employee_model.dart';
import '../models/work_configuration_model.dart';
import '../models/leave_balance_model.dart';
import '../models/employee_document_model.dart';
import '../models/emergency_contact_model.dart';

class EmployeeProfileProvider extends ChangeNotifier {
  final EmployeeRepository _employeeRepository;

  bool _isLoading = false;
  String? _errorMessage;
  EmployeeModel? _profile;
  WorkConfigurationModel? _workConfig;
  List<LeaveBalanceModel> _leaveBalances = [];
  List<EmployeeDocumentModel> _documents = [];
  List<EmergencyContactModel> _emergencyContacts = [];

  EmployeeProfileProvider({EmployeeRepository? employeeRepository})
      : _employeeRepository = employeeRepository ?? EmployeeRepository();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  EmployeeModel? get profile => _profile;
  WorkConfigurationModel? get workConfig => _workConfig;
  List<LeaveBalanceModel> get leaveBalances => _leaveBalances;
  List<EmployeeDocumentModel> get documents => _documents;
  List<EmergencyContactModel> get emergencyContacts => _emergencyContacts;

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  void _setError(String? msg) {
    _errorMessage = msg;
    notifyListeners();
  }

  Future<void> fetchProfile() async {
    _setLoading(true);
    _setError(null);
    try {
      final data = await _employeeRepository.getMyProfile();
      if (data != null) {
        _profile = data;
        _setError(null);
      }
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> fetchWorkConfiguration() async {
    try {
      final data = await _employeeRepository.getWorkConfiguration();
      if (data != null) {
        _workConfig = data;
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> fetchLeaveBalances() async {
    try {
      _leaveBalances = await _employeeRepository.getLeaveBalances();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchDocuments() async {
    try {
      _documents = await _employeeRepository.getDocuments();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchEmergencyContacts() async {
    try {
      _emergencyContacts = await _employeeRepository.getEmergencyContacts();
      notifyListeners();
    } catch (_) {}
  }

  Future<bool> updateProfileFields(Map<String, dynamic> fields) async {
    _setLoading(true);
    try {
      final success = await _employeeRepository.updateMyProfile(fields);
      if (success) {
        await fetchProfile();
        return true;
      }
      return false;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> addContact(Map<String, dynamic> contact) async {
    _setLoading(true);
    try {
      final success = await _employeeRepository.addEmergencyContact(contact);
      if (success) {
        await fetchEmergencyContacts();
        return true;
      }
      return false;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> updateContact(int id, Map<String, dynamic> contact) async {
    _setLoading(true);
    try {
      final success = await _employeeRepository.updateEmergencyContact(id, contact);
      if (success) {
        await fetchEmergencyContacts();
        return true;
      }
      return false;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }
}
