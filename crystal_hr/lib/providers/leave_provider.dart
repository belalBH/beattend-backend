import 'package:flutter/material.dart';
import '../repositories/leave_repository.dart';
import '../models/leave_type_model.dart';
import '../models/leave_balance_model.dart';
import '../models/leave_request_model.dart';

class LeaveProvider extends ChangeNotifier {
  final LeaveRepository _repository;

  bool _isLoading = false;
  String? _errorMessage;
  List<LeaveTypeModel> _leaveTypes = [];
  List<LeaveBalanceModel> _leaveBalances = [];
  List<LeaveRequestModel> _pendingApprovals = [];

  LeaveProvider({LeaveRepository? repository})
      : _repository = repository ?? LeaveRepository();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<LeaveTypeModel> get leaveTypes => _leaveTypes;
  List<LeaveBalanceModel> get leaveBalances => _leaveBalances;
  List<LeaveRequestModel> get pendingApprovals => _pendingApprovals;

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  void _setError(String? msg) {
    _errorMessage = msg;
    notifyListeners();
  }

  Future<void> fetchTypes() async {
    try {
      _leaveTypes = await _repository.getLeaveTypes();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchBalances() async {
    try {
      _leaveBalances = await _repository.getLeaveBalances();
      notifyListeners();
    } catch (_) {}
  }

  Future<void> fetchPendingApprovals() async {
    _setLoading(true);
    try {
      _pendingApprovals = await _repository.getPendingApprovals();
      _setError(null);
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> submitRequest({
    required int leaveTypeId,
    required String startDate,
    required String endDate,
    String? reason,
  }) async {
    _setLoading(true);
    _setError(null);
    try {
      final success = await _repository.submitLeaveRequest(
        leaveTypeId: leaveTypeId,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
      );
      if (success) {
        await fetchBalances();
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

  Future<bool> approveRequest(int requestId, {String? comment}) async {
    _setLoading(true);
    try {
      final success = await _repository.approveOrRejectRequest(
        requestId: requestId,
        decision: 'approve',
        comment: comment,
      );
      if (success) {
        await fetchPendingApprovals();
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

  Future<bool> rejectRequest(int requestId, {String? comment}) async {
    _setLoading(true);
    try {
      final success = await _repository.approveOrRejectRequest(
        requestId: requestId,
        decision: 'reject',
        comment: comment,
      );
      if (success) {
        await fetchPendingApprovals();
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
