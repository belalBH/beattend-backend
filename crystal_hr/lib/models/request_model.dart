class RequestModel {
  final int requestId;
  final String requestNumber;
  final String tenantId;
  final int companyId;
  final int employeeId;
  final int requestTypeId;
  final int requestTypeVersion;
  final int workflowId;
  final int workflowVersion;
  final int currentStepSequence;
  final String status;
  final String idempotencyUuid;
  final int createdBy;
  final int recordVersion;
  final String? submittedAt;
  final String? completedAt;

  RequestModel({
    required this.requestId,
    required this.requestNumber,
    required this.tenantId,
    required this.companyId,
    required this.employeeId,
    required this.requestTypeId,
    required this.requestTypeVersion,
    required this.workflowId,
    required this.workflowVersion,
    required this.currentStepSequence,
    required this.status,
    required this.idempotencyUuid,
    required this.createdBy,
    required this.recordVersion,
    this.submittedAt,
    this.completedAt,
  });

  factory RequestModel.fromJson(Map<String, dynamic> json) {
    return RequestModel(
      requestId: json['requestId'] ?? 0,
      requestNumber: json['requestNumber'] ?? '',
      tenantId: json['tenantId'] ?? '',
      companyId: json['companyId'] ?? 0,
      employeeId: json['employeeId'] ?? 0,
      requestTypeId: json['requestTypeId'] ?? 0,
      requestTypeVersion: json['requestTypeVersion'] ?? 1,
      workflowId: json['workflowId'] ?? 0,
      workflowVersion: json['workflowVersion'] ?? 1,
      currentStepSequence: json['currentStepSequence'] ?? 1,
      status: json['status'] ?? 'draft',
      idempotencyUuid: json['idempotencyUuid'] ?? '',
      createdBy: json['createdBy'] ?? 0,
      recordVersion: json['recordVersion'] ?? 1,
      submittedAt: json['submittedAt'],
      completedAt: json['completedAt'],
    );
  }

  Map<String, dynamic> toJson() => {
        'requestId': requestId,
        'requestNumber': requestNumber,
        'tenantId': tenantId,
        'companyId': companyId,
        'employeeId': employeeId,
        'requestTypeId': requestTypeId,
        'requestTypeVersion': requestTypeVersion,
        'workflowId': workflowId,
        'workflowVersion': workflowVersion,
        'currentStepSequence': currentStepSequence,
        'status': status,
        'idempotencyUuid': idempotencyUuid,
        'createdBy': createdBy,
        'recordVersion': recordVersion,
        'submittedAt': submittedAt,
        'completedAt': completedAt,
      };
}
class RequestApprovalModel {
  final int approvalId;
  final int requestId;
  final int stepId;
  final int approverId;
  final String approverRole;
  final String status;
  final String? comment;
  final String? actionTimestamp;

  RequestApprovalModel({
    required this.approvalId,
    required this.requestId,
    required this.stepId,
    required this.approverId,
    required this.approverRole,
    required this.status,
    this.comment,
    this.actionTimestamp,
  });

  factory RequestApprovalModel.fromJson(Map<String, dynamic> json) {
    return RequestApprovalModel(
      approvalId: json['approvalId'] ?? 0,
      requestId: json['requestId'] ?? 0,
      stepId: json['stepId'] ?? 0,
      approverId: json['approverId'] ?? 0,
      approverRole: json['approverRole'] ?? 'manager',
      status: json['status'] ?? 'pending',
      comment: json['comment'],
      actionTimestamp: json['actionTimestamp'],
    );
  }
}
