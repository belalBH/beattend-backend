class LeaveRequestModel {
  final int requestId;
  final String requestNumber;
  final String tenantId;
  final int companyId;
  final int employeeId;
  final int leaveTypeId;
  final String startDate;
  final String endDate;
  final int requestedDays;
  final int workingDays;
  final String? reason;
  final String? attachmentUrl;
  final String status;
  final int? currentApproverId;
  final String createdAt;

  LeaveRequestModel({
    required this.requestId,
    required this.requestNumber,
    required this.tenantId,
    required this.companyId,
    required this.employeeId,
    required this.leaveTypeId,
    required this.startDate,
    required this.endDate,
    required this.requestedDays,
    required this.workingDays,
    this.reason,
    this.attachmentUrl,
    required this.status,
    this.currentApproverId,
    required this.createdAt,
  });

  factory LeaveRequestModel.fromJson(Map<String, dynamic> json) {
    return LeaveRequestModel(
      requestId: json['requestId'] ?? 0,
      requestNumber: json['requestNumber'] ?? '',
      tenantId: json['tenantId'] ?? '',
      companyId: json['companyId'] ?? 0,
      employeeId: json['employeeId'] ?? 0,
      leaveTypeId: json['leaveTypeId'] ?? 0,
      startDate: json['startDate'] ?? '',
      endDate: json['endDate'] ?? '',
      requestedDays: json['requestedDays'] ?? 0,
      workingDays: json['workingDays'] ?? 0,
      reason: json['reason'],
      attachmentUrl: json['attachmentUrl'],
      status: json['status'] ?? 'pending_manager',
      currentApproverId: json['currentApproverId'],
      createdAt: json['createdAt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'requestId': requestId,
        'requestNumber': requestNumber,
        'tenantId': tenantId,
        'companyId': companyId,
        'employeeId': employeeId,
        'leaveTypeId': leaveTypeId,
        'startDate': startDate,
        'endDate': endDate,
        'requestedDays': requestedDays,
        'workingDays': workingDays,
        'reason': reason,
        'attachmentUrl': attachmentUrl,
        'status': status,
        'currentApproverId': currentApproverId,
        'createdAt': createdAt,
      };
}
