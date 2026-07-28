import 'package:flutter/material.dart';
import '../repositories/attendance_repository.dart';
import '../models/attendance_model.dart';

class AttendanceProvider extends ChangeNotifier {
  final AttendanceRepository _repository;

  bool _isLoading = false;
  String? _errorMessage;
  AttendanceSessionModel? _currentSession;

  AttendanceProvider({AttendanceRepository? repository})
      : _repository = repository ?? AttendanceRepository();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  AttendanceSessionModel? get currentSession => _currentSession;

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  void _setError(String? msg) {
    _errorMessage = msg;
    notifyListeners();
  }

  Future<void> fetchCurrentSession() async {
    _setLoading(true);
    try {
      final session = await _repository.getCurrentSession();
      _currentSession = session;
      _setError(null);
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> triggerPunch(String eventType, {double? lat, double? lng, double? accuracy}) async {
    _setLoading(true);
    _setError(null);
    try {
      final result = await _repository.punchEvent(
        eventType: eventType,
        latitude: lat,
        longitude: lng,
        accuracy: accuracy,
      );

      if (result['success']) {
        if (result['session'] != null) {
          _currentSession = result['session'];
        }
        notifyListeners();
        return true;
      } else {
        _setError(result['error'] ?? 'حدث خطأ أثناء عملية تسجيل الحضور.');
        return false;
      }
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> syncOfflinePunches() async {
    await _repository.syncOfflineQueue();
    await fetchCurrentSession();
  }
}
