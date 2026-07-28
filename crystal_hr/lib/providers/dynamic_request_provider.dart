import 'package:flutter/material.dart';
import '../repositories/dynamic_request_repository.dart';
import '../models/request_type_model.dart';
import '../models/request_field_model.dart';
import '../models/request_model.dart';

class DynamicRequestProvider extends ChangeNotifier {
  final DynamicRequestRepository _repository;

  bool _isLoading = false;
  String? _errorMessage;
  List<RequestTypeModel> _requestTypes = [];
  List<RequestFieldModel> _dynamicFields = [];
  List<RequestModel> _pendingApprovals = [];

  DynamicRequestProvider({DynamicRequestRepository? repository})
      : _repository = repository ?? DynamicRequestRepository();

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  List<RequestTypeModel> get requestTypes => _requestTypes;
  List<RequestFieldModel> get dynamicFields => _dynamicFields;
  List<RequestModel> get pendingApprovals => _pendingApprovals;

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  void _setError(String? msg) {
    _errorMessage = msg;
    notifyListeners();
  }

  Future<void> fetchTypes() async {
    _setLoading(true);
    try {
      _requestTypes = await _repository.getRequestTypes();
      _setError(null);
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> fetchFields(int typeId) async {
    _setLoading(true);
    try {
      _dynamicFields = await _repository.getFields(typeId);
      _setError(null);
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<void> fetchPendingApprovals(String role) async {
    _setLoading(true);
    try {
      _pendingApprovals = await _repository.getPendingApprovals(role);
      _setError(null);
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> submitDraftAndRequest({
    required int requestTypeId,
    required Map<String, dynamic> fieldValues,
  }) async {
    _setLoading(true);
    _setError(null);
    try {
      final draftResult = await _repository.saveDraft(
        requestTypeId: requestTypeId,
        fieldValues: fieldValues,
      );

      if (draftResult['success']) {
        final int id = draftResult['requestId'];
        return await _repository.submitRequest(id);
      }
      return false;
    } catch (e) {
      _setError(e.toString());
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> approveRequest(int approvalId, {String? comment}) async {
    _setLoading(true);
    try {
      final success = await _repository.processApproval(
        approvalId: approvalId,
        decision: 'approve',
        comment: comment,
      );
      if (success) {
        await fetchPendingApprovals('manager');
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

  Future<bool> rejectRequest(int approvalId, {String? comment}) async {
    _setLoading(true);
    try {
      final success = await _repository.processApproval(
        approvalId: approvalId,
        decision: 'reject',
        comment: comment,
      );
      if (success) {
        await fetchPendingApprovals('manager');
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
